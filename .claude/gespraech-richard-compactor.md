# `compactor.js` gegen `SKILL.md` — Gesprächsgrundlage

- **Stand:** 23.08.2026, Schlussabschnitt korrigiert am 24.08.2026
- **Für:** Richard — Autor von `SKILL.md`
- **Spezifikation:** `OKF_MD_LOG/SKILL.md`, Schicht 2, Regeln 1–7 und Altersstufen
- **Umsetzung:** `OKF_MD_LOG/compactor.js`
- **Belege:** `tools/dry-compaction.mjs` → `tools/dry-compaction-report.md`
  (führt den echten `compactor.js` mit abgefangenen Schreibvorgängen aus,
  verändert keine Datei)

Nichts davon ist geändert worden. Der Skill ist deins; hier steht nur, was
gemessen wurde, damit die Entscheidung auf Zahlen fußt statt auf Meinung.

---

## Kurzfassung

Vier Abweichungen. Die vierte war bis heute unbekannt und wiegt am schwersten:
**die beiden Zusammenzieh-Regeln feuern nie.** Übrig bleiben nur die
Lösch-Regeln — der Compactor verdichtet also nicht, er kürzt.

| | Abweichung | Folge |
|---|---|---|
| **A** | Strang-Suche läuft in die falsche Richtung | Regeln 2 und 3 sind faktisch toter Code |
| **B** | Kein Altersbezug | auch die laufende Sitzung wird sofort verdichtet |
| **C** | `isFolgenlos()` schützt nur `MOTIV` | Regel 7 entfernt `WAND` und offene `ZWEIFEL` |
| **D** | `ref` wird nach dem Entfernen nicht nachgezogen | Verweise zeigen ins Leere |

**Was ein Lauf heute anrichtet** (echte Daten, gemessen):

| Projekt | vorher | compactor.js | nach SKILL.md | mit Altersstufen |
|---|---|---|---|---|
| `Gemini/Blödeleini` | 4 | **0** | 1 | 4 |
| `Gemini/TestProjekt` | 4 | 4 | 4 | 4 |

`Blödeleini` verschwindet vollständig, inklusive `[e03] ZWEIFEL`.

---

## A · Die Strang-Suche läuft rückwärts

**Regel 2** verlangt: geschlossener Strang `WEG → WAND` wird auf die WAND
zusammengezogen, die WAND erbt das Weil des WEG. **Regel 3** dasselbe für
`WEG → SETZUNG`.

In den Daten zeigt `ref` **vom neueren auf den älteren** Eintrag. `TestProjekt`
ist der Musterfall:

```
e01 MOTIV    ref→—
e02 FUND     ref→e01
e03 WEG      ref→e02
e04 WAND     ref→e03      ← die Wand verweist auf den Weg, der gegen sie lief
```

`findClosedStrand()` (compactor.js:40) startet beim WEG und folgt den
**ausgehenden** Verweisen — also `e03 → e02 → e01 → Ende`. Es sucht die Wand in
der Vergangenheit, wo sie nie liegen kann. Um von `e03` zu `e04` zu kommen,
müsste es den **eingehenden** Verweisen folgen.

**Messung:** `TestProjekt` enthält den lehrbuchhaften Strang `e03 WEG → e04 WAND`.
Nach Regel 2 müssten daraus 3 Einträge werden. Der Trockenlauf zeigt 4 → 4. Die
Regel hat kein einziges Mal gegriffen.

**Warum das die schwerste Abweichung ist:** Die Regeln 2 und 3 sind die einzigen,
die *zusammenziehen*. Fallen sie aus, bleiben nur 6 und 7 — und die *löschen*.
Genau das erklärt `Blödeleini`: 4 → 0, kein einziger Zusammenzug, nur Wegnahme.
Der Unterschied zwischen deinem Skill und einer gewöhnlichen Zusammenfassung
hängt an den beiden Regeln, die nicht laufen.

**Rückfrage an dich:** Ist die Richtung von `ref` so gemeint, wie die Daten sie
zeigen (neu → alt)? `SKILL.md` legt sie nicht ausdrücklich fest. Wenn ja, ist es
ein Zeilen-Fix. Wenn nein, schreiben die Erzeuger (`journal-store.js`,
`auto-tagger.js`) falsch herum, und der Fix gehört dorthin.

---

## B · Kein Altersbezug

`SKILL.md` sieht vier Altersstufen vor; die jüngste — die laufende Sitzung —
bleibt **alles, wörtlich**. `applyCompactionRules()` (compactor.js:67) liest
`timestamp` nirgends; Zeitstempel tauchen erst beim Bauen der `VERLAUF.md` auf.
Verdichtet wird also auch, was vor fünf Minuten entstand.

Das trifft die Kernidee frontal:

> „Ein Eintrag wird in dem Zustand des Nichtwissens geschrieben, in dem er entsteht."

Wer sofort verdichtet, tut genau das, was eine Zusammenfassung tut — und das
war der Anlass für den Skill.

---

## C · `isFolgenlos()` schützt nur `MOTIV`

```js
// compactor.js:33
function isFolgenlos(entry, entries, incoming, outgoing, survivors) {
  if (entry.type === 'MOTIV') return false;
  ...
}
```

Regel 5 sagt, ein offener `ZWEIFEL` verdichtet nie. Regel 7 sagt, eine Sackgasse
mit einer Wand am Ende bleibt als Wand stehen. Beide Typen sind hier ungeschützt.

**Das strukturelle Argument wiegt schwerer als der Verweis auf die Spezifikation:**
Eine WAND ist *per Definition* folgenlos — niemand baut auf einer gescheiterten
Sache auf, deshalb hat sie keinen eingehenden Verweis. Ein offener ZWEIFEL ebenso:
ungelöst heißt, es hängt nichts daran. Regel 7 trifft sie also nicht gelegentlich,
sondern **systematisch alle** — genau die zwei Typen, die den Skill von einer
Zusammenfassung unterscheiden.

---

## D · Verweise zeigen danach ins Leere

`applyCompactionRules()` entfernt Einträge, schreibt aber nur Texte um
(compactor.js:129–136). Ein überlebender Eintrag, dessen `ref` auf einen
entfernten zeigt, behält den toten Verweis. In den heutigen Daten fällt das
nicht auf, weil bei `Blödeleini` gar keine Verweise gesetzt sind — sobald
Stränge entstehen, schon.

---

## Was zusätzlich zu bedenken ist

`runCompaction()` (compactor.js:232) setzt `data.okf.json` und `VERLAUF.md` auf
`0666`, überschreibt sie an Ort und Stelle und setzt sie zurück auf `0444`.
Keine Sicherung, keine Historie. Was ein Lauf wegnimmt, ist weg — und es fällt
erst Monate später auf, wenn die Wand fehlt, die einen zweiten Anlauf verhindert
hätte. Unabhängig von allen Regelfragen wäre eine Kopie vor dem Schreiben
billig.

---

## Fragen

- [ ] **A** — Zeigt `ref` vom neueren auf den älteren Eintrag? Falls ja: Strang-Suche
      auf eingehende Verweise umstellen. Falls nein: Erzeuger korrigieren.
- [ ] **B** — Altersstufen nachrüsten, laufende Sitzung ausnehmen? ja / nein
- [ ] **C** — `WAND` und offene `ZWEIFEL` in `isFolgenlos()` ausnehmen? ja / nein
- [ ] **D** — Verweise nach dem Entfernen nachziehen? ja / nein
- [ ] Sicherung vor `runCompaction()`? ja / nein
- [ ] Wer setzt es um?

Die Punkte A–D sind im Journal (`index.html`) inzwischen alle umgesetzt und
gegen diese Daten getestet — `findStrand()` über eingehende Verweise,
`compactByAge()`, `KEEP_ALWAYS`, `relinkRefs()`. Der Code ließe sich übernehmen.

**Korrektur vom 24.08.2026:** Hier stand zunächst, Punkt A beträfe das Journal
nicht. Das war falsch — das Journal hatte denselben Richtungsfehler, verdeckt
durch rückwärts modellierte Testdaten. Am 24.08. gefunden und behoben; seither
laufen alle vier Referenzdatensätze fehlerfrei durch (Beleg:
`tools/compaction-bench-report.md` — compactor.js 0/4 fehlerfrei bei Ø 42 %
Kompression, Journal-`compactOkf()` 4/4 bei Ø 36 %, `compactByAge()` 4/4 bei
Ø 11 %). Dass beide Umsetzungen unabhängig in dieselbe Falle liefen, spricht
dafür, die `ref`-Richtung in `SKILL.md` ausdrücklich festzulegen.
