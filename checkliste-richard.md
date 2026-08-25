# Checkliste — Gespräch mit Richard

Stand: 24.08.2026 · zusammengestellt aus `.claude/entscheidungen-richard.md`,
`.claude/manifest.de.md` und `.claude/settings-und-design.md`

## 1. Lizenz & Repo

- [ ] Lizenz gewählt: ______________
- [ ] `LICENSE`-Datei angelegt, Badge angeglichen
- [ ] Beitragsvereinbarung nötig? ja / nein
- [ ] Falls kein bestehender Name passt: eigenen Namen wählen, um Verwechslung zu vermeiden

## 2. Compactor-Abweichung (Richards Regeln vs. `compactor.js`)

- [ ] Zeigt `ref` vom neueren auf den älteren Eintrag? Falls ja, ist das ein reiner Zeilen-Fix; falls nein, eine Konzeptfrage
- [ ] War die Abweichung Absicht?
- [ ] Angleichen? ja / nein
- [ ] Falls ja: wer macht es?
- [x] **Sicherung vor `runCompaction` — erledigt am 24.08.2026.** `backupBefore()` kopiert
      `data.okf.json` und `VERLAUF.md` nach `<projekt>/_backups/<zeitstempel>/`, bevor
      irgendetwas geschrieben wird; scheitert die Sicherung, wird gar nicht verdichtet
      (fail-closed). Der Rückgabewert von `runCompaction` nennt den Sicherungspfad.
      Berührt keine der vier Regel-Abweichungen.
- [ ] Grundlage für die Diskussion: Trockenlauf `node tools/dry-compaction.mjs` (schreibt nichts, Bericht in `tools/dry-compaction-report.md`)
- [ ] Vereinbarung: Änderung an den **Regeln** erst nach Rücksprache mit Richard, vor der finalen Fertigstellung

## 3. Hosting / Produkt

- [ ] Plattform: ______________
- [ ] frei/kommerziell: ______________
- [ ] ein Produkt oder drei? ______________
- [ ] Demo auf GitHub Pages? ja / nein

## 4. Datenschutz

- [ ] Löschkonzept: wie? ______________
- [ ] Prüfung auf Zugangsdaten verpflichtend beim Upload? ja / nein
- [ ] Serverstandort: ______________

## 5. Repo aufräumen

- [ ] Discord-Badge verweist auf `#` (toter Link) — entfernen oder Einladung hinterlegen
- [ ] Marketplace-Badge verweist auf generische GitHub-Marketplace-Seite — korrigieren
- [ ] Vier Git-Identitäten in der Historie (`Jenspacito`, `ThaiJenspacito`, …) — bereinigen? (`C:\DEV\wa-ersetzen.txt` / `git filter-repo --replace-text` liegt bereit; offen ist nur, ob die Historie damit schon umgeschrieben wurde — nur Jens kann das beantworten)

## 6. Journal-Workflow

- [ ] Welche KI-Anbieter zuerst? (nach tatsächlicher Nutzung, nicht alle zehn auf Vorrat)
- [ ] Verworfene Antwort-Äste: mitnehmen, verwerfen, oder als eigene Einträge?
- [ ] Altbestände rückwirkend typisieren? ja / nein / erst ab Stichtag
- [ ] Hauptweg auf Dauer: Browser-Extension oder Server-Mitschnitt?

## 7. Noch nicht gebaut (aus dem Manifest)

- [ ] Browser-Extension (Popup mit Live-Status, Quick-Capture, Dashboard-Link) — konzipiert, nicht gebaut
- [ ] Denkflüsse mitloggen — Anzeige fertig, Erfassung an der Quelle fehlt (`thought_process`-Feld)
- [ ] Echter Datenkorpus — bisher nur 8 Dateien aus zwei Gemini-Projekten in `Chats_LMM/`
- [ ] Auswertung, welche Formulierungen zuverlässig zu brauchbaren Antworten führen

## 8. Sonstige offene Punkte (aus SKILL/Settings)

- [ ] Regel 4 (aufgelöster ZWEIFEL → SETZUNG) ist nicht automatisierbar, solange die Auflösung nur im Fließtext steht
- [ ] Tabelle *Offene Spannungen* wird beim Import übersprungen (S1-Nummern nicht eindeutig auf `eNN`-IDs abbildbar)
- [ ] Chats ohne Zeitstempel erben das Änderungsdatum der Datei — akzeptabel?
- [ ] PDF-Writer kann keine Emoji darstellen (werden entfernt) — akzeptabel?
