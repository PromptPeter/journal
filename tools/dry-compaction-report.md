# Trockenlauf der OKF-Verdichtung

Projekt: `c:/DEV/OKF_MD_LOG`

Der echte `compactor.js` wurde ausgeführt, alle Schreibvorgänge abgefangen.
**Es wurde keine Datei verändert.**

Gefundene Projekte: 2

---

## Gemini / Blödeleini

Einträge vorher: **4**
Sitzungstage: 1 (2026-08-19)

| Variante | danach | entfernt | davon WAND | davon ZWEIFEL | Verweise ins Leere |
|---|---|---|---|---|---|
| compactor.js (heute) | 0 | 4 | 0 | 1 | 0 |
| SKILL.md-Regeln | 1 | 3 | 0 | 0 | 0 |
| SKILL.md + Altersstufen | 4 | 0 | 0 | 0 | 0 |

**Diese Einträge gingen verloren, obwohl SKILL.md sie schützt:**

- `[e03]` **ZWEIFEL** Spracheingabe (^⇧D)EinstellungenAktivitätenPrompt bearbeitenPrompt kopierenGute AntwortSchlechte AntwortAntwor

---

## Gemini / TestProjekt

Einträge vorher: **4**
Sitzungstage: 2 (2026-08-18, 2026-08-19)

| Variante | danach | entfernt | davon WAND | davon ZWEIFEL | Verweise ins Leere |
|---|---|---|---|---|---|
| compactor.js (heute) | 4 | 0 | 0 | 0 | 0 |
| SKILL.md-Regeln | 3 | 1 | 0 | 0 | 0 |
| SKILL.md + Altersstufen | 4 | 0 | 0 | 0 | 0 |

Bei diesem Datenstand macht es keinen Unterschied.

---

## Ergebnis

Ein Verdichtungslauf würde **0 WAND-** und **1 ZWEIFEL-Einträge** entfernen, die nach SKILL.md stehenbleiben müssten, und **0 Verweise** ins Leere zeigen lassen.

Zur Erinnerung: `runCompaction()` schreibt `data.okf.json` und `VERLAUF.md`
an Ort und Stelle zurück und setzt sie auf `0444` — ohne Sicherung.

**Vorschlag zur Angleichung** (klein und in `index.html` erprobt):

1. **Die laufende Sitzung von der Verdichtung ausnehmen.** SKILL.md sieht
   vier Altersstufen vor; die jüngste bleibt wörtlich stehen. `compactor.js`
   kennt keinen Altersbezug und verdichtet auch das, was gerade erst
   geschrieben wurde. Das läuft der Kernidee zuwider: „Ein Eintrag wird in
   dem Zustand des Nichtwissens geschrieben, in dem er entsteht." Wer sofort
   verdichtet, tut genau das, was eine Zusammenfassung tut.
2. In `isFolgenlos()` neben `MOTIV` auch `WAND` und `ZWEIFEL` ausnehmen.
   Begründung: Eine Wand ist *per Definition* folgenlos — niemand baut auf
   einer gescheiterten Sache auf. Die Regel trifft also nicht gelegentlich
   eine Wand, sondern systematisch alle. Für offene Zweifel gilt dasselbe.
3. Nach dem Entfernen die `ref`-Verweise nachziehen: zeigt ein Verweis auf
   einen verdichteten Eintrag, dessen Kette weiterfolgen, bis ein
   überlebender erreicht ist.

Punkt 1 erklärt auch die Spalte „SKILL.md + Altersstufen" oben: Wo dort
nichts entfernt wird, liegen alle Einträge in der laufenden Sitzung und
wären damit ohnehin geschützt.
