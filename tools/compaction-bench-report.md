# Vergleich der Verdichtungs-Implementierungen

Schreibt nichts. Referenzergebnisse und ihre Herleitung: `tools/fixtures/README.md`.

---

## TestProjekt (echt)

Datei: `tools/fixtures/testprojekt-real.json` · 4 Einträge · erwartet: `e01, e02, e04`

| Version | vorher | nachher | Kompression | Verweise ins Leere | Schutzverletzung | = Referenz? |
|---|---|---|---|---|---|---|
| compactor.js (OKF_MD_LOG, Regeln + Altersstufen seit 25.08.2026) | 4 | 4 | 0% | – | – | ja |
| Journal compactOkf() (Regeln, Richtung korrigiert) | 4 | 3 | 25% | – | – | ja |
| Journal compactByAge() (Regeln + Altersstufen) | 4 | 4 | 0% | – | – | ja |

---

## Blödeleini (echt)

Datei: `tools/fixtures/bloedeleini-real.json` · 4 Einträge · erwartet: `e03`

| Version | vorher | nachher | Kompression | Verweise ins Leere | Schutzverletzung | = Referenz? |
|---|---|---|---|---|---|---|
| compactor.js (OKF_MD_LOG, Regeln + Altersstufen seit 25.08.2026) | 4 | 4 | 0% | – | – | ja |
| Journal compactOkf() (Regeln, Richtung korrigiert) | 4 | 1 | 75% | – | – | ja |
| Journal compactByAge() (Regeln + Altersstufen) | 4 | 4 | 0% | – | – | ja |

---

## Strang-Synthetik (12, drei Stränge + eine Verzweigung)

Datei: `tools/fixtures/strang-synthetic-12.json` · 12 Einträge · erwartet: `e01, e02, e04, e06, e07, e08, e09, e10, e11, e12`

| Version | vorher | nachher | Kompression | Verweise ins Leere | Schutzverletzung | = Referenz? |
|---|---|---|---|---|---|---|
| compactor.js (OKF_MD_LOG, Regeln + Altersstufen seit 25.08.2026) | 12 | 12 | 0% | – | – | ja |
| Journal compactOkf() (Regeln, Richtung korrigiert) | 12 | 10 | 17% | – | – | ja |
| Journal compactByAge() (Regeln + Altersstufen) | 12 | 12 | 0% | – | – | ja |

---

## Altersstufen-Synthetik (12, fünf Tage, alle vier Stufen)

Datei: `tools/fixtures/strang-synthetic-altersstufen.json` · 12 Einträge · erwartet: `e01, e03, e04, e06, e07, e09, e10, e11, e12`

| Version | vorher | nachher | Kompression | Verweise ins Leere | Schutzverletzung | = Referenz? |
|---|---|---|---|---|---|---|
| compactor.js (OKF_MD_LOG, Regeln + Altersstufen seit 25.08.2026) | 12 | 7 | 42% | – | – | ja |
| Journal compactOkf() (Regeln, Richtung korrigiert) | 12 | 9 | 25% | – | – | ja |
| Journal compactByAge() (Regeln + Altersstufen) | 12 | 7 | 42% | – | – | ja |

---

## Zusammenfassung

| Version | fehlerfrei | Ø Kompression |
|---|---|---|
| compactor.js (OKF_MD_LOG, Regeln + Altersstufen seit 25.08.2026) | 4 / 4 Datensätze | 11% |
| Journal compactOkf() (Regeln, Richtung korrigiert) | 4 / 4 Datensätze | 36% |
| Journal compactByAge() (Regeln + Altersstufen) | 4 / 4 Datensätze | 11% |

„Fehlerfrei" heißt: keine Verweise ins Leere, keine stillschweigend entfernte
`MOTIV`/`WAND`/`ZWEIFEL`, und — wo ein Referenzergebnis vorliegt — exakte
Übereinstimmung mit den nach `SKILL.md` von Hand hergeleiteten Überlebenden.
