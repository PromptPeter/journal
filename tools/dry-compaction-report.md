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
| compactor.js (heute) | 4 | 0 | 0 | 0 | 0 |
| SKILL.md-Regeln | 1 | 3 | 0 | 0 | 0 |
| SKILL.md + Altersstufen | 4 | 0 | 0 | 0 | 0 |

Bei diesem Datenstand macht es keinen Unterschied.

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

Bei den aktuellen Daten macht keine der drei Spalten einen Unterschied,
den man an verlorenen WAND-/ZWEIFEL-Einträgen oder toten Verweisen ablesen
könnte — die Projekte sind zu klein oder liegen komplett in der laufenden
Sitzung. Dass „compactor.js (heute)" und „SKILL.md + Altersstufen" oben
zeilenweise identisch sind, ist trotzdem der eigentliche Befund: beide
schützen dieselbe laufende Sitzung aus demselben Grund.

Zur Erinnerung: `runCompaction()` sichert `data.okf.json`/`VERLAUF.md` vor
jedem Schreibvorgang (`backupBefore()`, seit dem A–D-Fix Bestandteil des
Codes, nicht nur einmalig manuell) und schreibt erst danach zurück.

**Stand 25.08.2026: Die vier Abweichungen A–D sind in `compactor.js` behoben.**

1. **Altersstufen umgesetzt.** SKILL.md sieht vier Altersstufen vor; die
   jüngste — die laufende Sitzung — bleibt wörtlich stehen. `compactor.js`
   ruft dafür jetzt `compactByAge()` auf, bevor es überhaupt schreibt, statt
   ohne Altersbezug sofort zu verdichten.
2. `isFolgenlos()` (jetzt `KEEP_ALWAYS`-Prüfung) nimmt neben `MOTIV` auch
   `WAND` und `ZWEIFEL` aus. Eine Wand ist *per Definition* folgenlos —
   niemand baut auf einer gescheiterten Sache auf. Die Regel hätte sonst
   nicht gelegentlich eine Wand getroffen, sondern systematisch alle.
3. `relinkRefs()` zieht nach dem Entfernen die `ref`-Verweise nach: zeigt
   ein Verweis auf einen verdichteten Eintrag, wird dessen Kette
   weiterverfolgt, bis ein überlebender Eintrag erreicht ist.
4. `findClosedStrand()` folgt jetzt den *eingehenden* statt der ausgehenden
   Verweisen — siehe `.claude/gespraech-richard-compactor.md`, Abweichung A.

Alle vier Punkte sind gegen dieselben vier Referenzdatensätze verifiziert wie
die Journal-Implementierung: `tools/compaction-bench-report.md`, 4/4 fehlerfrei.
