---
name: logging
description: >-
  Laufendes Verlaufs-Log einer Konversation als lebendiges Dokument — eine
  gezieltere Alternative zu Autocompacting und Zusammenfassungen. Schreibt
  während des Gesprächs mit (Zeitstempel, sechs Eintragstypen, Begründung
  pflicht), ohne das Ende zu kennen, und überarbeitet ältere Schichten bei
  jedem Durchgang nach festen Verdichtungsregeln. Bewahrt Motivation und
  Genese eines Projekts, die normale Zusammenfassungen wegkürzen, und macht
  nach einem /clear oder Tage später sofort wieder arbeitsfähig. Einsetzen,
  wenn Richard mitschreiben/loggen lassen will, wenn ein Gespräch lang wird
  oder über mehrere Sitzungen geht, wenn er nach einem clear/compact wieder
  einsteigt ("wo waren wir", "lies den Verlauf"), oder wenn er ein VERLAUF.md
  aktualisieren, verdichten oder prüfen lassen will.
---

# Logging — mitschreiben, ohne das Ende zu kennen

## Wozu das gut ist

Eine Zusammenfassung wird rückwärts geschrieben und kennt das Ergebnis. Deshalb
*kann* sie nicht anders als teleologisch sein: sie erzählt jeden Schritt als
Schritt auf das Ergebnis zu. Der Satz „wir versuchen X, weil Y stört" überlebt
in ihr nicht, wenn X später fallengelassen wurde — sie weiß ja schon, dass X
nichts wurde. Genau das verdeckt die Motivation und die Genese eines Projekts.

Ein Log wird geschrieben, *bevor* das Ende bekannt ist. Das ist der ganze
Trick, und er ist technisch, nicht stilistisch. Deshalb gilt hier die harte
Regel:

> **Ein Eintrag wird in dem Zustand des Nichtwissens geschrieben, in dem er
> entsteht.** Nie nachträglich glattziehen, nie im Licht des Ergebnisses
> umformulieren. Wenn ein Weg sich als falsch erweist, kommt ein *neuer*
> Eintrag dazu — der alte bleibt stehen, bis die Verdichtung ihn nach Regel
> zusammenfasst.

## Das Dokument

Eine Datei pro Projekt: `VERLAUF.md` im Projektstamm (dort, wo gearbeitet
wird). Gibt es kein Projektverzeichnis, dann
`~/.claude/verlauf/<projektname>.md`.

Aufbau — vier Teile, in dieser Reihenfolge, weil das Dokument so von oben nach
unten gelesen wieder arbeitsfähig macht:

```markdown
# Verlauf — <Projektname>

## Kopf
<Wird bei jeder Verdichtung neu geschrieben. 5–12 Zeilen.>
**Worum es geht:** …
**Warum überhaupt:** … (die ursprüngliche Unzufriedenheit, nicht das Ziel)
**Wo wir stehen:** …
**Woran zuletzt gearbeitet:** …

## Offene Spannungen
| # | Spannung | seit | Stand |
|---|----------|------|-------|
| S1 | … | 2026-08-18 | ungelöst / vertagt / gelöst durch [e42] |

## Wände
Verworfenes mit Grund — verhindert, dass derselbe Weg nochmal gegangen wird.
- [e19] Reines append-only verworfen: verträgt sich nicht mit dem Kürzen von
  Sackgassen, weil man beim Schreiben nicht weiß, was Sackgasse wird.

## Sitzungen

### 2026-08-18 (Mo)
- `21:12` [e01] **MOTIV** …
- `21:20` [e02] **WEG** … ↳e01
```

## Die sechs Eintragstypen

Bewusst wenige. Mehr Kategorien heißt: das Klassifizieren wird zur eigentlichen
Arbeit.

| Typ | Was es erfasst | Frage |
|-----|----------------|-------|
| **MOTIV** | Die Unzufriedenheit, der Anlass, das Jucken | Warum tun wir das überhaupt? |
| **FUND** | Etwas über die Welt/den Code herausgefunden, das nun einschränkt | Was ist der Fall? |
| **WEG** | Ein eingeschlagener Ansatz, Plan, Versuch | Was probieren wir? |
| **WAND** | Gescheitert, verworfen, blockiert | Woran ist es gestoßen? |
| **SETZUNG** | Entscheidung, auch vorläufige, auch Kompromiss | Was gilt jetzt? |
| **ZWEIFEL** | Ungelöstes Unbehagen, offene Spannung | Was nagt noch? |

**„Abschweifung" ist kein Typ.** Das ist ein Werturteil über einen Beitrag,
keine Art von Beitrag — es gehört auf die Gewichtungsachse, nicht auf die
Typachse. Abschweifungen werden also normal getypt (meist FUND oder WEG) und
verschwinden erst bei der Verdichtung, wenn sie folgenlos geblieben sind.

## Eintragsformat

```
- `HH:MM` [eNN] **TYP** Ein Satz — mit dem Weil. ↳eNN
```

- **Zeitstempel** per `date +%H:%M` holen, nicht schätzen. Datum als
  Sitzungsüberschrift.
- **[eNN]** fortlaufende ID über die ganze Datei, nie wiederverwenden.
- **↳eNN** verweist auf den Eintrag, aus dem dieser hervorgeht. Damit
  entstehen Argumentationsstränge, und nur dadurch ist die Verdichtung später
  gefahrlos möglich: ein geschlossener Strang lässt sich auf sein Ende
  zusammenziehen.
- **Das Weil ist Pflicht.** Ein Eintrag ohne Begründung ist wertlos — die
  Begründung ist genau das, was jede normale Zusammenfassung wegwirft. Kein
  Eintrag der Form „Modul X gebaut". Stattdessen: „Modul X gebaut, weil Y
  sonst bei jedem Durchgang neu geparst werden müsste."
- Ein Satz. Wenn zwei Sätze nötig scheinen, sind es zwei Einträge.

## Schicht 1 — mitschreiben (während des Gesprächs)

Nach jedem inhaltlich substanziellen Zug anhängen. Substanziell heißt: es ist
etwas entschieden, verworfen, herausgefunden, bezweifelt oder begonnen worden.
Reine Ausführung ohne Erkenntnis (Datei umbenannt, Test grün) wird **nicht**
geloggt.

Ablauf:
1. `date +"%H:%M"` (und bei neuer Sitzung `date +"%Y-%m-%d (%a)"`).
2. Existiert schon eine Überschrift für heute? Sonst anlegen.
3. Ein bis drei Einträge anhängen. Nur anhängen — nichts Bestehendes anfassen.
4. Neue ZWEIFEL zusätzlich in die Tabelle *Offene Spannungen* eintragen.
5. Neue WAND zusätzlich in den Abschnitt *Wände* spiegeln.

Der Anhang-Schritt ist billig und darf dumm sein. Er soll nicht klug
zusammenfassen, sondern festhalten, was gerade *nicht* bekannt ist.

## Schicht 2 — überarbeiten (Verdichtung)

Wird ausgelöst: beim Einstieg in eine neue Sitzung, wenn Richard es verlangt,
oder wenn der Abschnitt *Sitzungen* länger als etwa 150 Zeilen ist.

**Die Grundregel: Einträge werden herabgestuft, nicht gelöscht.** Gelöscht
werden darf ein Eintrag nur dann, wenn sein Weil vollständig in einem
überlebenden Eintrag steckt.

Verdichtungsregeln, in dieser Reihenfolge:

1. **MOTIV ist unantastbar.** Ein MOTIV-Eintrag wird nie verdichtet, nie
   umformuliert, nie zusammengezogen. Er ist der Grund, warum es dieses Log
   überhaupt gibt.
2. **Geschlossener Strang WEG → WAND** wird auf die WAND zusammengezogen, und
   die WAND erbt das Weil des WEG: „X versucht, weil Y — gescheitert an Z."
   Die WAND bleibt in *Wände* stehen, auch wenn die Sitzung sonst wegfällt.
3. **Geschlossener Strang WEG → SETZUNG** wird auf die SETZUNG zusammengezogen,
   und die SETZUNG **muss** die Motivation aufsaugen: „Entschieden: A, weil
   ursprünglich B störte." Eine SETZUNG ohne ihr ursprüngliches Motiv ist ein
   Verlust und ein Regelbruch.
4. **Aufgelöster ZWEIFEL** wandert in die SETZUNG, die ihn auflöst; die Zeile
   in *Offene Spannungen* wird auf „gelöst durch [eNN]" gesetzt — nicht sofort
   entfernt, sondern zwei Verdichtungen lang stehengelassen, dann entfernt.
5. **Offener ZWEIFEL verdichtet nie.** Er bleibt wörtlich stehen, egal wie alt.
6. **FUND** überlebt nur, solange er noch trägt. Ein Fund, der durch eine
   spätere SETZUNG gegenstandslos geworden ist, fällt weg.
7. **Folgenlose Einträge** — kein eingehender ↳, kein ausgehender, keine
   Wirkung auf eine spätere SETZUNG — fallen weg. Das sind die Abschweifungen
   und Sackgassen. **Aber:** War eine Sackgasse eine, weil sie gegen etwas
   gestoßen ist, ist sie eine WAND und bleibt. Nicht der Gang durch die
   Sackgasse bleibt, sondern die Wand an ihrem Ende.

**Altersstufen.** Der Detailgrad verfällt mit dem Alter, das motivationale
Gerüst nie:

| Alter | Was bleibt |
|-------|------------|
| laufende Sitzung | alles, wörtlich |
| letzte 2 Sitzungen | Stränge zusammengezogen, Zeitstempel bleiben |
| älter | nur MOTIV, SETZUNG, WAND, offene ZWEIFEL — Datum statt Uhrzeit |
| viel älter | dasselbe, aber Sitzungen eines Monats zu einem Block |

**Der Kopf wird bei jeder Verdichtung neu geschrieben** — aus MOTIV (für
„Warum überhaupt"), aus den letzten SETZUNGen (für „Wo wir stehen"), aus den
offenen ZWEIFELn (für das, was als nächstes zu klären ist). Der Kopf ist die
einzige Stelle im Dokument, die rückwärts geschrieben werden darf.

## Wiedereinstieg nach /clear oder nach Tagen

Wenn Richard fragt „wo waren wir", „lies den Verlauf" oder eine neue Sitzung im
Projekt beginnt:

1. `VERLAUF.md` lesen — Kopf, Offene Spannungen und Wände vollständig, den
   Abschnitt Sitzungen von unten nach oben, so weit nötig.
2. In **drei bis fünf Sätzen** zurückmelden: worum es geht, warum es
   angefangen wurde, wo es steht, was als nächstes ansteht, was offen ist.
   Nicht das Log nacherzählen.
3. Erst dann verdichten (Schicht 2), dann weiterarbeiten.

## Was dieser Skill *nicht* tut

- Er ersetzt Autocompacting nicht — das feuert weiterhin. Er ersetzt das
  *Angewiesensein* darauf.
- Er loggt keine Ausführung, nur Erkenntnis.
- Bei kurzen Aufgaben ist er reiner Overhead. Nicht dauerhaft anschalten,
  sondern für Projekte, die über Tage laufen und bei denen das *Warum*
  strittig oder vergessbar ist.

## Automatisches Mitschreiben (optional)

Ohne Zwang kippt Schicht 1 lautlos zurück in eine Zusammenfassung: wenn erst
auf Anforderung geschrieben wird, kennt der Schreibende das Ende doch schon.
Dagegen hilft ein Stop-Hook in `~/.claude/settings.json`, der nach jedem Zug
ans Mitschreiben erinnert:

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "test -f VERLAUF.md && echo 'Logging-Skill: substanzielle Zuege dieses Turns als Eintraege an VERLAUF.md anhaengen (Schicht 1).'"
          }
        ]
      }
    ]
  }
}
```

Der Hook feuert nur, wenn im Arbeitsverzeichnis bereits ein `VERLAUF.md`
liegt — damit ist er projektweise an- und abschaltbar, indem die Datei
angelegt oder gelöscht wird.
