# Verlauf — Projekt PromptEngineer / Journal-App

Entscheidungs-Historie im OKF-Stil (`md_files/SKILL.md`), nicht der
Chat-Datenverlauf einzelner Nutzer — die tägliche, mechanische Änderungsliste
steht weiterhin in `.claude/settings-und-design.md` unter „Änderungen"; diese
Datei destilliert daraus den eigentlichen Entscheidungsstrang.

## Kopf

**Worum es geht:** Ein Dribbble-artiges Filter-Journal für LLM-Chats als
Single-File-`index.html` (kein Build, kein Server), das OKF-kompatibel
importiert und exportiert.

**Warum überhaupt:** Bestehende Chat-Exporte waren unstrukturiert und schwer
durchsuchbar; `OKF_MD_LOG` schrieb zwar strukturiert mit, aber nur über einen
laufenden Server — Nachschlagen sollte ohne Server möglich sein.

**Wo wir stehen:** Versionskontrolle für alle Projekte unter `C:\DEV`
eingerichtet (25.08.2026), OKF-Exportformate (`raw`/`data`/`compact`/`aged`/
`VERLAUF.md`/LLM-Wiki-Bündel) fertig und gegen vier Referenzdatensätze
getestet, `compactor.js`-Fix in `OKF_MD_LOG` umgesetzt und verifiziert. Die
alte Browser-Extension (`OKF_MD_LOG/extension/`) ist durch drei manuelle,
nur-bei-Klick-aktive Bausteine ersetzt: „Chat einfügen"-Dialog mit
Dopplerkontrolle, Lesezeichen-Skript, eigene kleine Browser-Erweiterung.

**Woran zuletzt gearbeitet:** Neue Extension `extension/` — löst direkt ans
Journal statt über die Zwischenablage; Import-Knopf neben Export ins
Trigger-Design verschoben.

**Offen:** siehe „Offene Spannungen" unten.

## Offene Spannungen (ZWEIFEL)

| # | Spannung | seit | Stand |
|---|---|---|---|
| S1 | Regel 4 (aufgelöster ZWEIFEL wandert in die auflösende SETZUNG) bewusst nicht automatisiert — die Information steht nur im Fließtext, nicht in den Daten | 23.08.2026 | ungelöst |
| S2 | Natives OKF-Verzeichnisformat (MD+YAML als Speicherformat, nicht nur Exportziel) noch nicht gebaut — nur `toKarpathyVault()` als Export | 23.08.2026 | ungelöst |
| S3 | `log.md`: ersetzt es künftig `VERLAUF.md` in `OKF_MD_LOG` oder laufen beide parallel? | 25.08.2026 | ungelöst |
| S4 | Testsuite (`real.mjs`, `i18n.mjs`, `secrets.mjs`) hängt an einer Datei in `Downloads`, die dort fehlt — fragile externe Abhängigkeit | 25.08.2026 | ungelöst |

## Wände (WAND)

- **Detailansicht als Drawer.** Verdeckte den Kontext des restlichen Journals
  beim Aufklappen — auf Inline-Baum im selben Frame umgestellt (23.08.2026).
- **Strang-Suche folgte `outgoing`.** `findStrand` lief die eigene
  `ref`-Vergangenheit entlang statt der eingehenden Verweise — fand nie einen
  echten geschlossenen Strang, weil `ref` vom neueren auf den älteren Eintrag
  zeigt. Auf `incoming` umgestellt, gegen vier Referenzdatensätze verifiziert
  (23.08.–24.08.2026).
- **NotebookLM-Knopf pushte an den Server.** `/api/exports/notebooklm`
  ignorierte den gesendeten Inhalt und exportierte stattdessen alle
  Serverprojekte — Knopf lädt seit 24.08.2026 nur noch lokal herunter.

## Sitzungen

### 2026-08-23
- MOTIV: Journal soll ohne Server auskommen und trotzdem OKF-kompatibel sein
- SETZUNG: Englisch als Voreinstellung, Deutsch vollständig verfügbar
- SETZUNG: OKF-Typen/Ampel/Verdichtungsregeln aus `SKILL.md` übernommen, nicht aus `compactor.js`
- SETZUNG: Produktname bleibt `PromptEngineer`, OKF-Name bleibt, Format wechselt langfristig auf Googles Verzeichnisbaum

### 2026-08-24
- WEG → SETZUNG: Vierter Referenzdatensatz für den Altersverfall gebaut, Lücke im Bench-Report geschlossen
- WEG → SETZUNG: NotebookLM-Knopf auf reinen Download umgestellt

### 2026-08-25
- SETZUNG: Feldwechsel `kategorie` → `tags` in `raw.okf.json`/`data.okf.json`, bewusst nur in der Schreibrichtung des Journals
- SETZUNG: Verweisform im Verzeichnisformat bleibt Markdown-Link
- SETZUNG: Nutzer entscheidet ab jetzt allein über das gesamte Projekt inklusive `OKF_MD_LOG` — Rückfragepflicht bei Richard entfällt
- SETZUNG: Immer mit Sicherung planen, nie Rohdaten ohne Versionierung ändern; Versionskontrolle in alle Projekte unter `C:\DEV`
- WEG → SETZUNG: `compactor.js` in `OKF_MD_LOG` direkt gefixt (A–D), Bench zeigt 4/4 fehlerfrei
- WEG → WAND: Automatisches Einloggen/Auswählen der Chats von außen versucht zu planen — geht nicht, Browser trennt fremde Seiten strikt voneinander (gilt für Anmeldefenster, Konten, API gleichermaßen)
- WEG → SETZUNG: „Chat einfügen"-Dialog gebaut — Anbieter-Auswahl, Dopplerkontrolle über `chatKey()` + Turn-Textvergleich, `importChatText()` als wiederverwendbarer Kern
- WEG → WAND: Import-Knopf sprang direkt in den Datei-Explorer ohne Erklärung — zu einem geführten Menü (Chat einfügen / Dateien auswählen) zusammengeführt
- WEG → SETZUNG: Lesezeichen-Skript `tools/bookmarklet-import.js` — scrollt automatisch bis zum Verlaufsanfang; Fund unterwegs: verwechselte anfangs die Chat-Listen-Seitenleiste mit dem Gesprächsbereich (behoben über Mindestbreite)
- WEG → SETZUNG: Neue Browser-Erweiterung `extension/` — dieselbe Scroll-Logik, liefert aber direkt ans Journal statt über die Zwischenablage (Fallback: Zwischenablage, falls kein Journal-Tab offen)
- SETZUNG: Import-Knopf neben Export ins Trigger-Design verschoben (Grün statt Blau)
