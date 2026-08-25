# Testdatensätze für die Verdichtung

Drei Datensätze, jeder mit von Hand hergeleitetem und geprüftem
Referenzergebnis. Das Referenzergebnis ist **nicht** "was der Code heute
liefert", sondern was nach den Regeln aus `md_files/SKILL.md` korrekt wäre —
sonst würde ein Vergleich nur den eigenen Fehler bestätigen.

Referenzergebnisse gehören in `compaction-bench.mjs` (Konstante `FIXTURES`),
nicht hierher — sonst gibt es zwei Stellen, die synchron gehalten werden
müssten. Diese Datei erklärt nur, **warum** das Ergebnis so aussieht.

---

## `testprojekt-real.json`

Kopie von `OKF_MD_LOG/Deine_KI_Journals/Gemini/TestProjekt/data.okf.json`,
23.08.2026. Vier Einträge, ein einziger, unverzweigter Strang:

```
e01 MOTIV
e02 FUND     ref→e01
e03 WEG      ref→e02
e04 WAND     ref→e03      ← die Wand entstand, weil e03 scheiterte
```

**Erwartung: 4 → 3, Überlebende `[e01, e02, e04]`.**

Herleitung: `e03` (WEG) hat genau einen eingehenden Verweis (`e04`), vom Typ
WAND — ein geschlossener Strang nach Regel 1. `e03` wird entfernt, sein „weil"
wandert in `e04`s Text. `e02` (FUND) bleibt: es hat zwar niemanden mehr, der
auf es zeigt (sein einziger Referenzierer `e03` ist weg), aber es zeigt selbst
noch auf `e01` (`outgoing` nicht leer) — Regel 7 verlangt *beides* leer, um zu
löschen. `e01` (MOTIV) und `e04` (WAND) sind ohnehin geschützt.

## `bloedeleini-real.json`

Kopie von `.../Gemini/Blödeleini/data.okf.json`, 23.08.2026. Vier Einträge,
**keiner** trägt ein `ref` — reiner Mitschnitt ohne Verkettung.

**Erwartung: 4 → 1, Überlebender `[e03]`.**

Herleitung: Ohne `ref` kann Regel 1–3 nichts finden (kein Eintrag hat einen
eingehenden Verweis). Regel 7 (folgenlos) trifft `e01`, `e02` und `e04`, weil
sie weder ein- noch ausgehend verbunden sind. `e03` ist vom Typ `ZWEIFEL` und
damit geschützt — es überlebt, obwohl es genauso unverbunden ist wie die
anderen. Das ist beabsichtigtes Verhalten (Regel 5: offener Zweifel bleibt
immer), keine Ausnahme im Code.

## `strang-synthetic-12.json`

Von Hand gebaut, 23.08.2026, um mehrere Stränge gleichzeitig zu prüfen:
einen einfachen WEG→WAND-Strang, einen WEG→SETZUNG-Strang, und einen
verzweigten Fall (zwei Einträge zeigen auf denselben WEG).

```
e01 MOTIV
e02 FUND     ref→e01
e03 WEG      ref→e02
e04 WAND     ref→e03            ← Strang 1: sollte in e04 aufgehen
e05 WEG      ref→e04
e06 SETZUNG  ref→e05            ← Strang 2: sollte in e06 aufgehen
e07 ZWEIFEL  ref→e06
e08 FUND     ref→e02
e09 WEG      ref→e06            ← Strang 3: verzweigt (e10 UND e11 zeigen auf e09)
e10 FUND     ref→e09
e11 WAND     ref→e09
e12 ZWEIFEL  ref→e11
```

**Erwartung: 12 → 10, Überlebende `[e01,e02,e04,e06,e07,e08,e09,e10,e11,e12]`.**

Herleitung: `e03` hat genau einen eingehenden Verweis (`e04`, WAND) →
Strang 1 schließt, `e03` fällt weg. `e05` hat genau einen eingehenden Verweis
(`e06`, SETZUNG) → Strang 2 schließt, `e05` fällt weg. `e09` hat **zwei**
eingehende Verweise (`e10` und `e11`) — mehrdeutig, deshalb bewusst **nicht**
zusammengezogen; das prüft speziell, dass Verzweigungen nicht blind aufgelöst
werden. `e02` bleibt aus demselben Grund wie im ersten Datensatz (zeigt noch
auf `e01`).

## `strang-synthetic-altersstufen.json`

Von Hand gebaut, 24.08.2026, um den **Altersverfall** zu prüfen — die Lücke
der drei anderen Datensätze. Zwölf Einträge über fünf Kalendertage, so gelegt,
dass alle vier Stufen vorkommen. Wichtig: `stagesByDay()` rechnet relativ zum
**jüngsten Tag im Datensatz**, nicht zu heute — die Fixture altert also nicht
und liefert auf Dauer dasselbe Ergebnis.

| Tag | Stufe | Einträge |
|---|---|---|
| 2026-08-23 (jüngster) | laufende Sitzung | e11 WEG, e12 FUND |
| 2026-08-22 | letzte 2 Sitzungen | e08 WEG, e09 WAND |
| 2026-08-20 | letzte 2 Sitzungen | e10 ZWEIFEL |
| 2026-07-14 (~40 Tage) | älter | e05 WEG, e06 SETZUNG, e07 FUND |
| 2026-04-25 (~120 Tage) | viel älter | e01 MOTIV, e02 WEG, e03 WAND, e04 FUND |

Stränge: `e02 WEG → e03 WAND` (uralt), `e05 WEG → e06 SETZUNG` (älter),
`e08 WEG → e09 WAND` (letzte Sitzungen). Dazu `e04`/`e07` als FUNDe in alten
Stufen und `e10` als offener ZWEIFEL.

**Erwartung regelbasiert (ohne Altersstufen): 12 → 9, Überlebende
`[e01,e03,e04,e06,e07,e09,e10,e11,e12]`.**

Herleitung: Drei geschlossene Stränge — `e02` schmilzt in `e03` (WAND erbt das
Weil), `e05` in `e06` (SETZUNG behält den Ursprung), `e08` in `e09`. `e11`
(WEG) bleibt: sein einziger eingehender Verweis `e12` ist FUND, kein
Strangende. Alle FUNDe bleiben, weil sie entweder auf eine überlebende SETZUNG
zeigen (`e07`), noch ausgehend verbunden sind (`e04`, `e12`) oder referenziert
werden. Verweise werden nachgezogen: `e03.ref` → `e01`, `e06.ref` → `e03`,
`e09.ref` → `e06`.

**Erwartung mit Altersstufen (`compactByAge`): 12 → 7, Überlebende
`[e01,e03,e06,e09,e10,e11,e12]`.**

Herleitung: Auf das regelbasierte Ergebnis kommt der Stufenfilter. Laufende
Sitzung (`e11`,`e12`) ist vor allen Regeln geschützt und bleibt vollständig.
Letzte 2 Sitzungen (`e09`,`e10`) bleiben ebenfalls vollständig. In „älter"
überlebt nur das Gerüst: `e06` (SETZUNG) bleibt, **`e07` (FUND) fällt weg**.
In „viel älter" ebenso: `e01` (MOTIV) und `e03` (WAND) bleiben, **`e04`
(FUND) fällt weg**. Danach zweites Nachziehen der Verweise: `e11.ref` zeigte
auf das entfernte `e07` und wandert dessen Kette entlang auf `e06`.

Zeitstempel je Stufe: `e11`,`e12`,`e09`,`e10` behalten die volle Uhrzeit;
`e06` wird zu `2026-07-14`, `e01`/`e03` zu `2026-04-25` (nur Datum).

---

## Bekannte Lücke — geschlossen am 24.08.2026

Die ersten drei Datensätze liegen je an einem einzigen Kalendertag — für die
Altersstufen zählt das als "laufende Sitzung", die per Definition unverdichtet
bleibt (dort ist `expectedAged: 'unchanged'` deshalb das korrekte
Referenzergebnis, kein Ausweichen). Den Altersverfall selbst deckt seit dem
24.08.2026 `strang-synthetic-altersstufen.json` mit vollständig hergeleitetem
Referenzergebnis ab.
