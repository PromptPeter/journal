/**
 * Findet Chat-Exporte und sortiert sie nach Modell ein.
 *
 * Durchsucht nur die Ordner, die ihm genannt werden — nicht das ganze
 * Profil. Erkannt wird am Inhalt, nicht am Dateinamen: Quell-URL,
 * Titel-Präfix wie [GEMINI], oder das Muster aus User-Prompt und Response.
 *
 * Aufruf:
 *   node tools/find-chats.mjs <ordner> [weitere ordner …] [--copy] [--depth=N]
 *
 *   ohne --copy   nur berichten, nichts anfassen  (Voreinstellung)
 *   mit  --copy   erkannte Dateien nach Chats_LMM/<Modell>/ kopieren
 *                 (kopieren, nicht verschieben — das Original bleibt)
 *   --depth=N     Unterordner-Tiefe, Voreinstellung 4
 *
 * Beispiel:
 *   node tools/find-chats.mjs "%USERPROFILE%\\Downloads" --copy
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TARGET = path.join(HERE, '..', 'Chats_LMM');

const args = process.argv.slice(2);
const DO_COPY = args.includes('--copy');
const DEPTH = Number((args.find(a => a.startsWith('--depth=')) || '').split('=')[1]) || 4;
const ROOTS = args.filter(a => !a.startsWith('--'));

if (!ROOTS.length){
  console.log('Kein Ordner angegeben.\n');
  console.log('  node tools/find-chats.mjs <ordner> [--copy] [--depth=4]\n');
  console.log('Beispiele:');
  console.log('  node tools/find-chats.mjs "C:/Users/Jensp/Downloads"');
  console.log('  node tools/find-chats.mjs "C:/Users/Jensp/Downloads" "C:/DEV/Exporte" --copy');
  process.exit(1);
}

/* Modell erkennen. Wichtig: Ein im Gespräch *erwähntes* Modell ist kein
   Herkunftsbeleg — „beim normalen Chat wie ChatGPT oder Gemini" sagt
   nichts darüber, wo der Chat herkommt. Deshalb ein Punktesystem, in dem
   Ordner, Dateiname und die Quell-URL im Kopf weit schwerer wiegen als
   Nennungen im Text. */
const MODELS = [
  { id:'ChatGPT',     host:/chatgpt\.com|chat\.openai\.com/i, word:/chatgpt|openai/i,   file:/chatgpt|gpt/i },
  { id:'Claude',      host:/claude\.ai|anthropic\.com/i,      word:/claude|anthropic/i, file:/claude/i },
  { id:'Gemini',      host:/gemini\.google\.com|bard\.google/i, word:/gemini|bard/i,    file:/gemini|bard/i },
  { id:'Deepseek',    host:/deepseek\.com/i,                  word:/deepseek/i,         file:/deepseek/i },
  { id:'Grok',        host:/grok\.com|x\.ai/i,                word:/\bgrok\b/i,         file:/grok/i },
  { id:'Kimi',        host:/kimi\.(moonshot|com)/i,           word:/kimi|moonshot/i,    file:/kimi/i },
  { id:'GLM',         host:/chatglm\.cn|bigmodel\.cn|z\.ai/i, word:/\bglm\b|zhipu/i,    file:/glm/i },
  { id:'MiniMax',     host:/minimax|hailuo/i,                 word:/minimax/i,          file:/minimax/i },
  { id:'ManusAI',     host:/manus\.(im|ai)/i,                 word:/\bmanus\b/i,        file:/manus/i },
  { id:'HuggingFace', host:/huggingface\.co/i,                word:/hugging\s?face/i,   file:/hugging/i },
];

/**
 * Gewichtete Herkunftsbestimmung.
 *   Ordnername    100  — jemand hat die Datei bewusst dort abgelegt
 *   Dateiname      50
 *   URL im Kopf    40  — nur die ersten 1500 Zeichen, dort steht die Quelle
 *   Titel-Präfix   30  — "[GEMINI] …"
 *   Nennung        1 je Treffer, höchstens 8 — nur als Stichentscheid
 * Gewinnt keiner mit Abstand, bleibt es bei „Unbekannt".
 */
function scoreModel({ file, head, title }){
  const parts = file.split(/[\\/]/);
  const base = parts.at(-1) || '';
  const dirs = parts.slice(0, -1);
  const top = head.slice(0, 1500);

  const scores = MODELS.map(m => {
    let s = 0;
    if (dirs.some(d => d.toLowerCase() === m.id.toLowerCase())) s += 100;
    if (m.file.test(base)) s += 50;
    if (m.host.test(top)) s += 40;
    if (new RegExp('^\\s*\\[[^\\]]*' + m.word.source + '[^\\]]*\\]', 'i').test(title)) s += 30;
    s += Math.min(8, (head.match(new RegExp(m.word.source, 'gi')) || []).length);
    return { id:m.id, s };
  }).sort((a, b) => b.s - a.s);

  const [first, second] = scores;
  if (first.s < 20 || first.s - second.s < 10) return { model:'Unbekannt', score:first.s };
  return { model:first.id, score:first.s };
}

/** Repariert Mojibake, damit die Erkennung auch bei kaputter Kodierung greift. */
function fixMojibake(s){
  if (!/Ã[¤¶¼ŸŸ]|â€/.test(s)) return s;
  try {
    const b = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++){ const c = s.charCodeAt(i); if (c > 255) return s; b[i] = c; }
    return new TextDecoder('utf-8', { fatal:true }).decode(b);
  } catch { return s; }
}

/** Prüft, ob eine Datei wie ein Chat-Export aussieht, und bestimmt das Modell. */
function classify(file){
  let head;
  try { head = fs.readFileSync(file, 'utf8').slice(0, 20000); } catch { return null; }
  head = fixMojibake(head);

  const turns = (head.match(/\*User prompt:/gi) || []).length;
  const responses = (head.match(/(?:^|\n)\s*(?:#{1,6}\s*)?(?:\*\*)?Response(?:\*\*)?\s*:/gi) || []).length;
  const isVerlauf = /^#\s*Verlauf/m.test(head) && /^##\s*Sitzungen\s*$/m.test(head.replace(/^```[\s\S]*?^```$/gm, ''));
  const isOkf = /"(role|type)"\s*:/.test(head) && /"timestamp"\s*:/.test(head);

  let kind = null;
  if (isVerlauf)              kind = 'VERLAUF.md';
  else if (isOkf)             kind = 'OKF-JSON';
  else if (turns >= 1 && responses >= 1) kind = 'Chat-Export';
  if (!kind) return null;

  const title = (head.match(/^#{1,3}\s+(.+)$/m) || [, ''])[1];
  const { model, score } = scoreModel({ file, head, title });

  return { kind, model, score, turns, title: title.replace(/\*\*/g, '').trim().slice(0, 70) };
}

/** Verzeichnisse durchlaufen, mit Tiefenbegrenzung und ohne die üblichen Fresser. */
const SKIP = /^(node_modules|\.git|\.cache|AppData|Windows|Program Files.*|\$Recycle\.Bin|System Volume Information)$/i;
function walk(dir, depth, out = []){
  if (depth < 0) return out;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes:true }); } catch { return out; }
  for (const e of entries){
    const full = path.join(dir, e.name);
    if (e.isDirectory()){
      if (SKIP.test(e.name)) continue;
      walk(full, depth - 1, out);
    } else if (/\.(md|markdown|txt|json)$/i.test(e.name)){
      let size = 0;
      try { size = fs.statSync(full).size; } catch { continue; }
      if (size > 500 && size < 20_000_000) out.push(full);
    }
  }
  return out;
}

/* ── Lauf ────────────────────────────────────────────────────────── */

console.log(DO_COPY ? 'Modus: erkennen und kopieren\n' : 'Modus: nur berichten (mit --copy wird kopiert)\n');

const found = [];
for (const root of ROOTS){
  if (!fs.existsSync(root)){ console.log(`  übersprungen (nicht gefunden): ${root}`); continue; }
  const files = walk(root, DEPTH);
  console.log(`  ${root}  —  ${files.length} Dateien geprüft`);
  for (const f of files){
    const c = classify(f);
    if (c) found.push({ file:f, ...c });
  }
}

console.log('');
if (!found.length){
  console.log('Keine Chat-Exporte erkannt.');
  console.log('Tipp: Ordner mit Anführungszeichen angeben und ggf. --depth=6 setzen.');
  process.exit(0);
}

const byModel = new Map();
for (const f of found){
  if (!byModel.has(f.model)) byModel.set(f.model, []);
  byModel.get(f.model).push(f);
}

console.log(`Gefunden: ${found.length} Datei(en)\n`);
for (const [model, list] of [...byModel].sort((a,b) => b[1].length - a[1].length)){
  console.log(`${model}  (${list.length})`);
  for (const f of list){
    const kb = (fs.statSync(f.file).size / 1024).toFixed(0).padStart(5);
    console.log(`  ${kb} KB  ${f.kind.padEnd(12)} ${f.title || path.basename(f.file)}`);
    console.log(`            ${f.file}   (Sicherheit ${f.score})`);
  }
  console.log('');
}

if (!DO_COPY){
  console.log('Nichts kopiert. Mit --copy landen die Dateien in:');
  console.log(`  ${TARGET}\\<Modell>\\`);
  process.exit(0);
}

let copied = 0, skipped = 0;
for (const f of found){
  const dir = path.join(TARGET, f.model);
  fs.mkdirSync(dir, { recursive:true });
  let dest = path.join(dir, path.basename(f.file));
  // Namenskollision: Zähler anhängen, nie überschreiben
  if (fs.existsSync(dest)){
    const same = fs.statSync(dest).size === fs.statSync(f.file).size;
    if (same){ skipped++; continue; }
    const ext = path.extname(dest), base = dest.slice(0, -ext.length);
    let n = 2;
    while (fs.existsSync(`${base}_${n}${ext}`)) n++;
    dest = `${base}_${n}${ext}`;
  }
  fs.copyFileSync(f.file, dest);
  copied++;
}
console.log(`Kopiert: ${copied}${skipped ? `  ·  übersprungen (bereits vorhanden): ${skipped}` : ''}`);
console.log(`Ziel: ${TARGET}`);
console.log('\nDie Originale bleiben unverändert liegen.');
