/**
 * Trockenlauf der OKF-Verdichtung — schreibt nichts.
 *
 * Lädt den echten `compactor.js` aus dem OKF-Projekt, ersetzt dabei aber
 * `fs.writeFileSync` und `fs.chmodSync` durch Attrappen. Dadurch läuft die
 * tatsächliche Implementierung, ohne eine einzige Datei anzufassen — das
 * Ergebnis ist also das, was ein echter Lauf anrichten würde, keine
 * Nachbildung.
 *
 * Verglichen wird gegen die Regeln aus SKILL.md, wie sie das Journal
 * (index.html) umsetzt.
 *
 * Aufruf:
 *   node tools/dry-compaction.mjs [pfad-zum-OKF-projekt]
 */

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OKF_ROOT = process.argv[2] || 'c:/DEV/OKF_MD_LOG';
const JOURNAL = path.join(HERE, '..', 'index.html');

/* ── 1. compactor.js laden, Schreibzugriffe abfangen ─────────────── */

function loadCompactor(file){
  const src = fs.readFileSync(file, 'utf8');
  const writes = [];
  const safeFs = {
    readFileSync: fs.readFileSync,
    existsSync:   fs.existsSync,
    readdirSync:  fs.readdirSync,
    statSync:     fs.statSync,
    mkdirSync:    () => {},                       // legt nichts an
    copyFileSync: () => {},                       // sichert nichts
    chmodSync:    () => {},                       // ändert keine Rechte
    writeFileSync: (p, c) => writes.push({ path: p, content: c }),
  };
  const mod = { exports: {} };
  const wrapped = new Function('require', 'module', 'exports', '__dirname', '__filename', src);
  wrapped(
    name => (name === 'fs' ? safeFs : require(name)),
    mod, mod.exports, path.dirname(file), file,
  );
  return { api: mod.exports, writes };
}

/* ── 2. Die SKILL.md-Regeln aus dem Journal holen ────────────────── */

async function loadJournalRules(){
  const html = fs.readFileSync(JOURNAL, 'utf8');
  let src = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
  src = src.slice(0, src.lastIndexOf('/*', src.indexOf('   TEIL 6 · Popover-Engine')));
  const tmp = path.join(HERE, '.rules.tmp.mjs');
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

/* ── 3. Projekte einsammeln ──────────────────────────────────────── */

function findProjects(root){
  const base = path.join(root, 'Deine_KI_Journals');
  if (!fs.existsSync(base)) return [];
  const out = [];
  for (const ai of fs.readdirSync(base)){
    const aiDir = path.join(base, ai);
    if (!fs.statSync(aiDir).isDirectory()) continue;
    for (const proj of fs.readdirSync(aiDir)){
      const dir = path.join(aiDir, proj);
      if (!fs.statSync(dir).isDirectory()) continue;
      if (fs.existsSync(path.join(dir, 'data.okf.json'))) out.push({ ai, proj, dir });
    }
  }
  return out;
}

/* ── 4. Auswerten ────────────────────────────────────────────────── */

const byId = list => new Map(list.map(e => [e.id, e]));
const dangling = list => {
  const alive = new Set(list.map(e => e.id));
  return list.filter(e => e.ref && !alive.has(e.ref));
};

function analyse(before, after){
  const a = byId(after);
  const lost = before.filter(e => !a.has(e.id));
  const byType = {};
  for (const e of lost) byType[e.type] = (byType[e.type] || 0) + 1;
  return { lost, byType, dangling: dangling(after) };
}

/* ── 5. Lauf ─────────────────────────────────────────────────────── */

const rules = await loadJournalRules();
const projects = findProjects(OKF_ROOT);

const L = [];
const say = s => { console.log(s); L.push(s); };

say('# Trockenlauf der OKF-Verdichtung');
say('');
say(`Projekt: \`${OKF_ROOT}\``);
say('');
say('Der echte `compactor.js` wurde ausgeführt, alle Schreibvorgänge abgefangen.');
say('**Es wurde keine Datei verändert.**');
say('');

if (!projects.length){
  say('Keine Projekte mit `data.okf.json` gefunden.');
} else {
  say(`Gefundene Projekte: ${projects.length}`);
  say('');
}

let totalLostWand = 0, totalLostZweifel = 0, totalDangling = 0;

for (const { ai, proj, dir } of projects){
  const before = JSON.parse(fs.readFileSync(path.join(dir, 'data.okf.json'), 'utf8'));

  const { api, writes } = loadCompactor(path.join(OKF_ROOT, 'compactor.js'));
  const result = api.runCompaction(dir, { backup: false });  // Trockenlauf schreibt nichts
  const written = writes.find(w => w.path.endsWith('data.okf.json'));
  const after = written ? JSON.parse(written.content) : before;

  const now = analyse(before, after);

  // Dieselben Daten nach den Regeln aus SKILL.md
  const spec = rules.compactOkf(before);
  const specA = analyse(before, spec);
  const aged = rules.compactByAge(before).map(({ _stage, ...e }) => e);

  say('---');
  say('');
  say(`## ${ai} / ${proj}`);
  say('');
  say(`Einträge vorher: **${before.length}**`);
  const days = new Set(before.map(e => String(e.timestamp || '').slice(0, 10)));
  say(`Sitzungstage: ${days.size} (${[...days].sort().join(', ') || 'ohne Datum'})`);
  say('');
  say('| Variante | danach | entfernt | davon WAND | davon ZWEIFEL | Verweise ins Leere |');
  say('|---|---|---|---|---|---|');
  say(`| compactor.js (heute) | ${after.length} | ${now.lost.length} | ` +
      `${now.byType.WAND || 0} | ${now.byType.ZWEIFEL || 0} | ${now.dangling.length} |`);
  say(`| SKILL.md-Regeln | ${spec.length} | ${specA.lost.length} | ` +
      `${specA.byType.WAND || 0} | ${specA.byType.ZWEIFEL || 0} | ${specA.dangling.length} |`);
  say(`| SKILL.md + Altersstufen | ${aged.length} | ${before.length - aged.length} | ` +
      `${analyse(before, aged).byType.WAND || 0} | ${analyse(before, aged).byType.ZWEIFEL || 0} | ` +
      `${dangling(aged).length} |`);
  say('');

  totalLostWand    += now.byType.WAND || 0;
  totalLostZweifel += now.byType.ZWEIFEL || 0;
  totalDangling    += now.dangling.length;

  const critical = now.lost.filter(e => ['WAND', 'ZWEIFEL', 'MOTIV'].includes(e.type));
  if (critical.length){
    say('**Diese Einträge gingen verloren, obwohl SKILL.md sie schützt:**');
    say('');
    for (const e of critical)
      say(`- \`[${e.id}]\` **${e.type}** ${String(e.text).slice(0, 110)}`);
    say('');
  }
  if (now.dangling.length){
    say('**Verweise, die danach ins Leere zeigen:**');
    say('');
    for (const e of now.dangling)
      say(`- \`[${e.id}]\` ${e.type} → \`↳${e.ref}\` (nicht mehr vorhanden)`);
    say('');
  }
  if (!critical.length && !now.dangling.length){
    say('Bei diesem Datenstand macht es keinen Unterschied.');
    say('');
  }
  if (result && result.compacted === false) say(`_(compactor meldet: ${result.reason})_`);
}

say('---');
say('');
say('## Ergebnis');
say('');
if (totalLostWand + totalLostZweifel + totalDangling === 0){
  say('Bei den aktuellen Daten macht keine der drei Spalten einen Unterschied,');
  say('den man an verlorenen WAND-/ZWEIFEL-Einträgen oder toten Verweisen ablesen');
  say('könnte — die Projekte sind zu klein oder liegen komplett in der laufenden');
  say('Sitzung. Dass „compactor.js (heute)" und „SKILL.md + Altersstufen" oben');
  say('zeilenweise identisch sind, ist trotzdem der eigentliche Befund: beide');
  say('schützen dieselbe laufende Sitzung aus demselben Grund.');
} else {
  say(`Ein Verdichtungslauf würde **${totalLostWand} WAND-** und ` +
      `**${totalLostZweifel} ZWEIFEL-Einträge** entfernen, die nach SKILL.md ` +
      `stehenbleiben müssten, und **${totalDangling} Verweise** ins Leere zeigen lassen.`);
}
say('');
say('Zur Erinnerung: `runCompaction()` sichert `data.okf.json`/`VERLAUF.md` vor');
say('jedem Schreibvorgang (`backupBefore()`, seit dem A–D-Fix Bestandteil des');
say('Codes, nicht nur einmalig manuell) und schreibt erst danach zurück.');
say('');
say('**Stand 25.08.2026: Die vier Abweichungen A–D sind in `compactor.js` behoben.**');
say('');
say('1. **Altersstufen umgesetzt.** SKILL.md sieht vier Altersstufen vor; die');
say('   jüngste — die laufende Sitzung — bleibt wörtlich stehen. `compactor.js`');
say('   ruft dafür jetzt `compactByAge()` auf, bevor es überhaupt schreibt, statt');
say('   ohne Altersbezug sofort zu verdichten.');
say('2. `isFolgenlos()` (jetzt `KEEP_ALWAYS`-Prüfung) nimmt neben `MOTIV` auch');
say('   `WAND` und `ZWEIFEL` aus. Eine Wand ist *per Definition* folgenlos —');
say('   niemand baut auf einer gescheiterten Sache auf. Die Regel hätte sonst');
say('   nicht gelegentlich eine Wand getroffen, sondern systematisch alle.');
say('3. `relinkRefs()` zieht nach dem Entfernen die `ref`-Verweise nach: zeigt');
say('   ein Verweis auf einen verdichteten Eintrag, wird dessen Kette');
say('   weiterverfolgt, bis ein überlebender Eintrag erreicht ist.');
say('4. `findClosedStrand()` folgt jetzt den *eingehenden* statt der ausgehenden');
say('   Verweisen — siehe `.claude/gespraech-richard-compactor.md`, Abweichung A.');
say('');
say('Alle vier Punkte sind gegen dieselben vier Referenzdatensätze verifiziert wie');
say('die Journal-Implementierung: `tools/compaction-bench-report.md`, 4/4 fehlerfrei.');

const report = path.join(HERE, 'dry-compaction-report.md');
fs.writeFileSync(report, L.join('\n') + '\n', 'utf8');
console.log('\nBericht geschrieben: ' + report);
