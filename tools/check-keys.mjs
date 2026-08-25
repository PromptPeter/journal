/**
 * Prüft, ob geleakte API-Schlüssel noch gültig sind.
 *
 * Liest Schlüssel aus einer .env — wahlweise aus der aktuellen Datei oder aus
 * der Git-History eines Repos — und fragt bei jedem Anbieter mit einem
 * lesenden Aufruf nach, ob der Schlüssel noch funktioniert.
 *
 * Die Werte werden NIEMALS ausgegeben. Nur Status, Länge und die letzten
 * Zeichen zur Wiedererkennung in der Anbieterliste.
 *
 * Aufruf:
 *   node tools/check-keys.mjs <repo-pfad>     aus der Git-History
 *   node tools/check-keys.mjs --file <.env>   aus einer Datei
 *
 * Rückgabewert: 0 = alle widerrufen, 1 = mindestens einer noch gültig.
 */

import { execSync } from 'child_process';
import fs from 'fs';

/* Anbieter: lesender Aufruf, der bei gültigem Schlüssel 200 liefert */
const PROVIDERS = [
  { env:'GITHUB_TOKEN',       name:'GitHub',
    url:'https://api.github.com/user',
    headers: k => ({ Authorization:`Bearer ${k}` }) },
  { env:'GEMINI_API_KEY',     name:'Gemini',
    url: k => `https://generativelanguage.googleapis.com/v1beta/models?key=${k}` },
  { env:'OPENROUTER_API_KEY', name:'OpenRouter',
    url:'https://openrouter.ai/api/v1/auth/key',
    headers: k => ({ Authorization:`Bearer ${k}` }),
    // verrät Label und Nutzung — hilft beim Finden in der Liste
    detail: true },
  { env:'DEEPSEEK_API_KEY',   name:'DeepSeek',
    url:'https://api.deepseek.com/user/balance',
    headers: k => ({ Authorization:`Bearer ${k}` }) },
  { env:'ANTHROPIC_API_KEY',  name:'Anthropic',
    url:'https://api.anthropic.com/v1/models',
    headers: k => ({ 'x-api-key':k, 'anthropic-version':'2023-06-01' }) },
  { env:'OPENAI_API_KEY',     name:'OpenAI',
    url:'https://api.openai.com/v1/models',
    headers: k => ({ Authorization:`Bearer ${k}` }) },
  { env:'TELEGRAM_BOT_TOKEN', name:'Telegram',
    url: k => `https://api.telegram.org/bot${k}/getMe` },
];

/* ── Schlüssel einsammeln ───────────────────────────────────────── */

function parseEnv(text){
  const out = {};
  for (const line of String(text).split(/\r?\n/)){
    const m = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    const val = m[2].trim().replace(/^["']|["']$/g, '');
    if (val) out[m[1]] = val;
  }
  return out;
}

function fromGitHistory(repo){
  const sh = cmd => execSync(cmd, { cwd:repo, encoding:'utf8', stdio:['pipe','pipe','ignore'] }).trim();
  const found = {};
  let commits = [];
  try { commits = sh('git log --all --format=%H -- .env').split('\n').filter(Boolean); } catch {}
  if (!commits.length){
    console.log('  Keine .env in der Git-History gefunden.');
    return found;
  }
  console.log(`  ${commits.length} Commit(s) mit .env in der History`);
  for (const c of commits){
    let content = '';
    try { content = sh(`git show ${c}:.env`); } catch { continue; }
    for (const [k, v] of Object.entries(parseEnv(content)))
      if (!found[k]) found[k] = v;      // ältester Fund gewinnt nicht, erster gefundener zählt
  }
  return found;
}

/* ── Prüfen ─────────────────────────────────────────────────────── */

async function probe(p, key){
  const url = typeof p.url === 'function' ? p.url(key) : p.url;
  const headers = p.headers ? p.headers(key) : {};
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 15000);
  try {
    const r = await fetch(url, { headers, signal:ctl.signal });
    clearTimeout(timer);
    let extra = '';
    if (p.detail && r.ok){
      try {
        const d = (await r.json()).data || {};
        extra = ` · Label "${d.label ?? '?'}" · Nutzung ${d.usage ?? '?'}` +
                (d.is_provisioning_key ? ' · PROVISIONING-KEY' : '');
      } catch {}
    }
    return { code:r.status, extra };
  } catch (e){
    clearTimeout(timer);
    return { code:0, extra:` (${e.name === 'AbortError' ? 'Zeitüberschreitung' : 'kein Netz'})` };
  }
}

/* ── Lauf ───────────────────────────────────────────────────────── */

const args = process.argv.slice(2);
let keys = {};

if (args[0] === '--file'){
  const f = args[1];
  if (!f || !fs.existsSync(f)){ console.error('Datei nicht gefunden: ' + f); process.exit(2); }
  console.log(`Quelle: Datei ${f}\n`);
  keys = parseEnv(fs.readFileSync(f, 'utf8'));
} else {
  const repo = args[0] || '.';
  if (!fs.existsSync(repo)){ console.error('Pfad nicht gefunden: ' + repo); process.exit(2); }
  console.log(`Quelle: Git-History von ${repo}`);
  keys = fromGitHistory(repo);
}

const todo = PROVIDERS.filter(p => keys[p.env]);
if (!todo.length){
  console.log('\nKeine bekannten Schlüssel gefunden. Vorhandene Variablen:');
  console.log('  ' + (Object.keys(keys).join(', ') || '(keine)'));
  process.exit(0);
}

console.log(`\n=== Gültigkeitsprüfung, ${new Date().toLocaleTimeString('de-DE')} ===\n`);

let stillValid = 0;
for (const p of todo){
  const key = keys[p.env];
  const { code, extra } = await probe(p, key);
  const tail = key.slice(-6);
  const id = `${key.length} Zeichen, endet auf …${tail}`;

  let status;
  if (code === 200){ status = '### NOCH GÜLTIG ###'; stillValid++; }
  else if ([400, 401, 403, 404].includes(code)) status = `widerrufen (${code})`;
  else if (code === 0) status = 'nicht erreichbar';
  else status = `unklar (${code})`;

  console.log(`  ${p.name.padEnd(11)} ${status}`);
  console.log(`  ${''.padEnd(11)} ${id}${extra}\n`);
}

console.log(stillValid === 0
  ? '  Alle geprüften Schlüssel sind widerrufen.'
  : `  ACHTUNG: ${stillValid} Schlüssel ${stillValid === 1 ? 'ist' : 'sind'} noch gültig.`);

if (stillValid) console.log('\n  Siehe .claude/notfall-secrets-im-repo.md, Abschnitt 1.');
process.exit(stillValid ? 1 : 0);
