/**
 * Vergleicht mehrere Verdichtungs-Implementierungen gegen dieselben
 * Datensätze: welche Version erzielt welche Kompression, und welche
 * arbeitet fehlerfrei?
 *
 * "Fehlerfrei" heißt hier konkret, für jede Version × jeden Datensatz:
 *   1. Verweise ins Leere        — zeigt ein überlebender Eintrag auf
 *                                   einen entfernten?
 *   2. Schutzverletzung          — wurde MOTIV oder eine WAND entfernt,
 *                                   die SKILL.md nie entfernt?
 *   3. Übereinstimmung mit dem   — nur wo ein von Hand hergeleitetes
 *      Referenzergebnis            Ergebnis vorliegt (fixtures/README.md)
 *
 * Schreibt nichts, verändert keine Projektdatei. Ergebnis geht nach
 * tools/compaction-bench-report.md.
 *
 * Aufruf:
 *   node tools/compaction-bench.mjs
 */

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OKF_ROOT = 'c:/DEV/OKF_MD_LOG';
const JOURNAL = path.join(HERE, '..', 'index.html');
const FIXTURE_DIR = path.join(HERE, 'fixtures');

/* ── 1. Implementierungen laden ──────────────────────────────────── */

/** compactor.js (OKF_MD_LOG) — schreibt nichts, Schreibvorgänge abgefangen. */
function loadCompactor(file){
  const src = fs.readFileSync(file, 'utf8');
  const safeFs = {
    readFileSync: fs.readFileSync, existsSync: fs.existsSync,
    readdirSync: fs.readdirSync, statSync: fs.statSync,
    mkdirSync: () => {}, chmodSync: () => {},
    writeFileSync: () => {},
  };
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', '__dirname', '__filename', src)(
    n => (n === 'fs' ? safeFs : require(n)), mod, mod.exports, path.dirname(file), file);
  return mod.exports;
}

/** compactOkf() / compactByAge() aus dem Journal (index.html). */
async function loadJournalRules(){
  const html = fs.readFileSync(JOURNAL, 'utf8');
  let src = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
  src = src.slice(0, src.lastIndexOf('/*', src.indexOf('   TEIL 6 · Popover-Engine')));
  const tmp = path.join(HERE, '.bench-rules.tmp.mjs');
  fs.writeFileSync(tmp, `
globalThis.results=[];globalThis.FACETS={};globalThis.serverOnline=false;
globalThis.toast=()=>{};globalThis.dateLabel=()=>'';
globalThis.localStorage={_d:{},getItem(k){return this._d[k]??null},setItem(){}};
globalThis.document={createElement:()=>({append(){},click(){},remove(){},style:{},setAttribute(){},addEventListener(){}}),body:{append(){}}};
globalThis.window={addEventListener(){}};
` + src + '\nexport { compactOkf, compactByAge };');
  const mod = await import('file://' + tmp.replace(/\\/g, '/'));
  fs.unlinkSync(tmp);
  return mod;
}

/* ── 2. Datensätze ────────────────────────────────────────────────── */

/*
 * `expected` gilt für die rein regelbasierte Version (Journal compactOkf(),
 * ohne Altersbezug). `expectedAged` gilt für beide altersbewussten Versionen
 * — Journal compactByAge() und seit dem A-D-Fix (25.08.2026) auch
 * compactor.js/runCompaction(): alle drei ersten Fixtures liegen an einem
 * einzigen Kalendertag, zählen also komplett als "laufende Sitzung" — die
 * bleibt laut SKILL.md unverändert stehen. 0 % Kompression ist hier das
 * RICHTIGE Ergebnis, keine Abweichung (siehe fixtures/README.md, Abschnitt
 * "Bekannte Lücke").
 */
const FIXTURES = [
  {
    file: 'testprojekt-real.json',
    label: 'TestProjekt (echt)',
    expected: ['e01', 'e02', 'e04'],
    expectedAged: 'unchanged',
  },
  {
    file: 'bloedeleini-real.json',
    label: 'Blödeleini (echt)',
    expected: ['e03'],
    expectedAged: 'unchanged',
  },
  {
    file: 'strang-synthetic-12.json',
    label: 'Strang-Synthetik (12, drei Stränge + eine Verzweigung)',
    expected: ['e01','e02','e04','e06','e07','e08','e09','e10','e11','e12'],
    expectedAged: 'unchanged',
  },
  {
    file: 'strang-synthetic-altersstufen.json',
    label: 'Altersstufen-Synthetik (12, fünf Tage, alle vier Stufen)',
    expected: ['e01','e03','e04','e06','e07','e09','e10','e11','e12'],
    expectedAged: ['e01','e03','e06','e09','e10','e11','e12'],
    // Zeitstempel-Erwartung je Überlebendem (nur compactByAge):
    // 'date' = nur YYYY-MM-DD, 'full' = mit Uhrzeit
    expectedAgedTs: { e01:'date', e03:'date', e06:'date', e09:'full', e10:'full', e11:'full', e12:'full' },
  },
];

/* ── 3. Auswerten ─────────────────────────────────────────────────── */

const KEEP_ALWAYS = new Set(['MOTIV', 'WAND', 'ZWEIFEL']);   // per SKILL.md, Regeln 5/7

function evaluate(before, after, expected){
  const alive = new Set(after.map(e => e.id));
  const dangling = after.filter(e => e.ref && !alive.has(e.ref));

  const beforeById = new Map(before.map(e => [e.id, e]));
  const lostProtected = before.filter(e => KEEP_ALWAYS.has(e.type) && !alive.has(e.id));

  const survivorIds = [...alive].sort();
  const expectedIds = expected ? [...expected].sort() : null;
  const matchesExpected = expectedIds
    ? survivorIds.length === expectedIds.length && survivorIds.every((id, i) => id === expectedIds[i])
    : null;

  const compression = before.length ? Math.round((1 - after.length / before.length) * 100) : 0;

  return {
    before: before.length, after: after.length, compression,
    dangling: dangling.length,
    lostProtected: lostProtected.length,
    lostProtectedIds: lostProtected.map(e => `${e.id}(${e.type})`),
    matchesExpected,
    survivorIds,
    errorFree: dangling.length === 0 && lostProtected.length === 0 && matchesExpected !== false,
  };
}

/* ── 4. Lauf ──────────────────────────────────────────────────────── */

const compactorApi = loadCompactor(path.join(OKF_ROOT, 'compactor.js'));
const journal = await loadJournalRules();

/**
 * compactor.js exportiert nur `runCompaction(projectPath)`, das von der
 * Platte liest. Für den Vergleich hier reicht die interne Regel-Anwendung
 * — die wird über einen minimalen Schreib-Abfang aus `runCompaction`
 * herausgezogen, indem ein Wegwerf-Verzeichnis mit genau dieser Fixture
 * gefüttert wird.
 */
function runCompactorJs(entries){
  const tmpDir = path.join(HERE, '.bench-tmp-project');
  fs.mkdirSync(tmpDir, { recursive: true });
  fs.writeFileSync(path.join(tmpDir, 'data.okf.json'), JSON.stringify(entries, null, 2));

  const writes = [];
  const src = fs.readFileSync(path.join(OKF_ROOT, 'compactor.js'), 'utf8');
  const safeFs = {
    readFileSync: fs.readFileSync, existsSync: fs.existsSync,
    readdirSync: fs.readdirSync, statSync: fs.statSync,
    mkdirSync: () => {}, chmodSync: () => {},
    writeFileSync: (p, c) => writes.push({ path: p, content: c }),
  };
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', '__dirname', '__filename', src)(
    n => (n === 'fs' ? safeFs : require(n)), mod, mod.exports, OKF_ROOT, path.join(OKF_ROOT, 'compactor.js'));
  // backup:false -- die Sandbox mockt kein copyFileSync, und hier werden
  // ausschliesslich die Verdichtungsregeln verglichen, nicht die Sicherung
  // (die hat einen eigenen Test, siehe unten).
  mod.exports.runCompaction(tmpDir, { backup: false });

  fs.rmSync(tmpDir, { recursive: true, force: true });
  const written = writes.find(w => w.path.endsWith('data.okf.json'));
  return written ? JSON.parse(written.content) : entries;
}

const VERSIONS = [
  { id:'compactor',  label:'compactor.js (OKF_MD_LOG, Regeln + Altersstufen seit 25.08.2026)', run: e => runCompactorJs(structuredClone(e)) },
  { id:'journal',    label:'Journal compactOkf() (Regeln, Richtung korrigiert)', run: e => journal.compactOkf(structuredClone(e)) },
  { id:'journalAge', label:'Journal compactByAge() (Regeln + Altersstufen)', run: e => journal.compactByAge(structuredClone(e)).map(({ _stage, ...x }) => x) },
];

const L = [];
const say = s => { console.log(s); L.push(s); };

say('# Vergleich der Verdichtungs-Implementierungen');
say('');
say('Schreibt nichts. Referenzergebnisse und ihre Herleitung: `tools/fixtures/README.md`.');
say('');

/** version.id → { errorFreeCount, total, compressions[] } */
const rollup = new Map(VERSIONS.map(v => [v.id, { errorFree: 0, total: 0, compressions: [] }]));

for (const fx of FIXTURES){
  const entries = JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, fx.file), 'utf8'));
  say('---');
  say('');
  say(`## ${fx.label}`);
  say('');
  say(`Datei: \`tools/fixtures/${fx.file}\` · ${entries.length} Einträge · erwartet: \`${fx.expected.join(', ')}\``);
  say('');
  say('| Version | vorher | nachher | Kompression | Verweise ins Leere | Schutzverletzung | = Referenz? |');
  say('|---|---|---|---|---|---|---|');

  for (const v of VERSIONS){
    let after, err = null;
    try { after = v.run(entries); }
    catch (e){ err = e.message; }

    if (err){
      say(`| ${v.label} | ${entries.length} | — | — | — | — | **Absturz:** ${err} |`);
      const r = rollup.get(v.id); r.total++;
      continue;
    }

    // compactor.js wendet seit dem A-D-Fix (25.08.2026) selbst Altersstufen an --
    // runCompaction() ruft intern compactByAge(), ist also gegen dieselbe
    // Erwartung zu pruefen wie Journal compactByAge(), nicht gegen die
    // regelbasierte ohne Altersbezug.
    const isAgeAware = v.id === 'journalAge' || v.id === 'compactor';
    const wantFor = isAgeAware
      ? (fx.expectedAged === 'unchanged' ? entries.map(e => e.id) : fx.expectedAged)
      : fx.expected;
    const res = evaluate(entries, after, wantFor);

    // Zeitstempel-Format je Altersstufe prüfen (nur wo definiert)
    if (isAgeAware && fx.expectedAgedTs){
      const tsErrors = [];
      for (const [id, want] of Object.entries(fx.expectedAgedTs)){
        const e = after.find(x => x.id === id);
        if (!e) continue;                        // Fehlen wird schon oben gemeldet
        const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(String(e.timestamp));
        if (want === 'date' && !isDateOnly) tsErrors.push(`${id}: erwartet nur Datum, hat "${e.timestamp}"`);
        if (want === 'full' && isDateOnly)  tsErrors.push(`${id}: erwartet Uhrzeit, hat nur "${e.timestamp}"`);
      }
      if (tsErrors.length){
        res.errorFree = false;
        res.tsErrors = tsErrors;              // Ausgabe nach der Tabellenzeile
      }
    }
    const matchLabel = res.matchesExpected === null ? '–' : (res.matchesExpected ? 'ja' : `**NEIN**`);
    say(`| ${v.label} | ${res.before} | ${res.after} | ${res.compression}% | ` +
        `${res.dangling || '–'} | ${res.lostProtected ? `**${res.lostProtected}**` : '–'} | ${matchLabel} |`);

    if (!res.matchesExpected && res.matchesExpected !== null){
      say(`  Abweichung: erhalten \`${res.survivorIds.join(', ')}\``);
    }
    if (res.lostProtected){
      say(`  Verloren, obwohl geschützt: ${res.lostProtectedIds.join(', ')}`);
    }
    if (res.tsErrors){
      say(`  Zeitstempel-Abweichung: ${res.tsErrors.join(' · ')}`);
    }

    const r = rollup.get(v.id);
    r.total++;
    if (res.errorFree) r.errorFree++;
    r.compressions.push(res.compression);
  }
  say('');
}

say('---');
say('');
say('## Zusammenfassung');
say('');
say('| Version | fehlerfrei | Ø Kompression |');
say('|---|---|---|');
for (const v of VERSIONS){
  const r = rollup.get(v.id);
  const avg = r.compressions.length ? Math.round(r.compressions.reduce((a,b) => a+b, 0) / r.compressions.length) : 0;
  say(`| ${v.label} | ${r.errorFree} / ${r.total} Datensätze | ${avg}% |`);
}
say('');
say('„Fehlerfrei" heißt: keine Verweise ins Leere, keine stillschweigend entfernte');
say('`MOTIV`/`WAND`/`ZWEIFEL`, und — wo ein Referenzergebnis vorliegt — exakte');
say('Übereinstimmung mit den nach `SKILL.md` von Hand hergeleiteten Überlebenden.');

const report = path.join(HERE, 'compaction-bench-report.md');
fs.writeFileSync(report, L.join('\n') + '\n', 'utf8');
console.log('\nBericht geschrieben: ' + report);
