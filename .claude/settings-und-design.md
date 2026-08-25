# Settings & Design — PromptEngineer Journal

Diese Datei hält fest, **wie** gebaut wird: Randbedingungen, Design-System,
Datenmodell und Arbeitsweise. Sie ist so geschrieben, dass sie sich in ein neues
Gespräch oder ein anderes Projekt kopieren lässt.

- **Stand:** 23.08.2026
- **Gilt für:** `c:\DEV\Dribble_Journal_Filter\index.html`
- **Zugehörig:** [manifest.de.md](manifest.de.md) · [manifest.en.md](manifest.en.md) —
  was gebaut wird und warum
- **Pflege:** Bei jeder Änderung an Stack, Design oder Datenformat wird der
  betroffene Abschnitt hier angepasst und unten unter *Änderungen* eine Zeile ergänzt.
  Ändert sich die Projektbeschreibung, **beide** Manifest-Fassungen nachziehen.

---

## 1 · Als Prompt verwendbar

Der folgende Block reicht aus, um in einem leeren Gespräch dieselbe Arbeitsweise
herzustellen. Alles darunter ist die ausführliche Fassung.

> Ich baue **PromptEngineer**, ein lokales Journal für meine LLM-Chats.
> Halte dich an diese Randbedingungen:
>
> **Stack:** Eine einzige `index.html` — Vanilla HTML/CSS/JS, kein Build, kein npm,
> keine CDN-Abhängigkeit. Wird per Doppelklick über `file://` geöffnet, deshalb keine
> ES-Module und kein `fetch` auf lokale Dateien. Alles Nötige selbst schreiben
> (auch PDF-Erzeugung).
>
> **Sprache:** Oberfläche zweisprachig. **Englisch ist immer die Voreinstellung** —
> beim ersten Start, nach dem Leeren des Speichers und bei jedem ungültigen Wert.
> Die Browsersprache wird nicht ausgewertet. Deutsch ist vollständig verfügbar über
> den Umschalter im Kopf. `<html lang>` wird mitgesetzt. Datenformate (OKF-, JSON-
> Schlüssel) bleiben immer englisch und sprachunabhängig.
>
> **Optik:** Dunkel, ruhig, an Dribbble-Filter-UIs orientiert — sticky Filterleiste mit
> pillenförmigen Triggern, die Popovers öffnen. Palette und Maße siehe Abschnitt 3.
>
> **Interaktion:** Klick auf einen Journaleintrag klappt den Gesprächsverlauf **inline
> als Baum** auf, im selben Frame. Ausdrücklich kein Seitenpanel und kein Modal.
>
> **Daten:** Chats bestehen aus Turns (`user`/`assistant`), optional mit `thought`
> (Chain of Thought). Der Chatinhalt ist read-only; nur Tags, Ampel und Kategorie
> sind manuell änderbar und werden in `localStorage` gespeichert.
>
> **Formate:** Import und Export müssen dem OKF-Format aus `c:\DEV\OKF_MD_LOG`
> entsprechen — siehe Abschnitt 5. Geraten wird dort nichts; im Zweifel die Dateien
> `journal-store.js`, `compactor.js` und `auto-tagger.js` lesen.
>
> **Prüfen:** Nach jeder Änderung den Script-Block aus der HTML extrahieren und mit
> Node gegen echte Exportdateien testen (Abschnitt 6). Keine Behauptung ohne Testlauf.

---

## 2 · Technische Einstellungen

| Einstellung | Wert | Grund |
|---|---|---|
| Ausgabe | eine Datei `index.html` | per Doppelklick nutzbar, nichts zu installieren |
| Laufzeit | Vanilla JS, ES2020+ | keine Toolchain, keine Versionspflege |
| Module | **keine** ES-Module | `file://` blockiert Modul-Import (CORS) |
| Abhängigkeiten | **keine**, auch kein CDN | funktioniert offline und dauerhaft |
| PDF | eigener Writer, Helvetica/WinAnsi | Bibliothek würde CDN oder Build erzwingen |
| Speicher | `localStorage` | Overrides und Sprachwahl überleben Reload |
| Server | optional, `http://localhost:31337` | App funktioniert vollständig ohne ihn |
| Zeichensatz | UTF-8, Mojibake-Reparatur beim Import | Exportdateien enthalten oft `Ã¤` statt `ä` |

### Bewusste Verzichte

- **Kein Framework.** Bei dieser Größe kostet React mehr, als es einbringt.
- **Kein Virtual Scrolling.** Seitenweises Nachladen (40 Stück) per
  `IntersectionObserver` reicht und verträgt variable Kartenhöhen.
- **Keine Volltext-Bibliothek.** Ein linearer Scan über vorberechnete Spalten ist
  bei dieser Datenmenge schneller als jeder Index-Aufbau (Messwerte in Abschnitt 6).

---

## 3 · Design-System

### Farbtokens

```css
:root{
  --bg:          #05070d;   /* Seitengrund                        */
  --surface:     #0b101c;   /* Karten, Eingabefelder              */
  --surface-2:   #111827;   /* Karte im Hover / geöffnet          */
  --surface-3:   #172033;   /* Chips, Tags, Hover in Listen       */
  --panel:       #0c1220;   /* Popover-Grund                      */
  --line:        #1e2739;   /* Ränder                             */
  --line-soft:   #161e2e;   /* dezente Trenner                    */
  --text:        #e8edf7;   /* Haupttext                          */
  --text-2:      #9aa6bd;   /* Fließtext, Sekundäres              */
  --text-3:      #66718a;   /* Metadaten, Platzhalter             */
  --accent:      #4d7cfe;   /* Aktiv, Fokus, Primärbutton         */
  --accent-soft: #4d7cfe22; /* Fokusring, Markierung              */
  --danger:      #f2555a;   --ok: #3ecf8e;   --warn: #e6a44e;
}
```

Hintergrundverlauf (zwei weiche Lichtquellen oben, wie im Dribbble-Vorbild):

```css
--bg-grad: radial-gradient(1200px 600px at 20% -10%, #16203a 0%, transparent 60%),
           radial-gradient(900px 500px at 100% 0%,  #0d1830 0%, transparent 55%);
/* auf body mit background-attachment: fixed */
```

### Maße & Bewegung

```css
--r-sm: 6px;  --r-md: 9px;  --r-lg: 14px;  --r-pill: 999px;
--shadow-pop: 0 18px 48px -12px rgba(0,0,0,.75), 0 0 0 1px var(--line);
--ease: cubic-bezier(.16,1,.3,1);        /* alle Übergänge */
--font: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
--mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
```

Übergangsdauern: 140 ms für Farben, 160–260 ms für Bewegung. Nichts darüber —
die Oberfläche soll schnell wirken, nicht animiert.

### Bausteine

**Trigger-Pille** (Filterleiste) — Höhe 38 px, `--r-md`, Rand `--line`.
Geöffnet: Rand `--accent` plus 3 px Fokusring `--accent-soft`, Chevron dreht 180°.
Aktiv mit mehreren Werten: Zähler-Badge in `--accent` links vom Chevron.
Aktiv mit einem Wert: der Wert steht statt des Sammelbegriffs im Label.

**Popover** — `--panel`, `--r-lg`, `--shadow-pop`, 6 px Innenabstand.
Öffnet mit `opacity 0→1` und `translateY(-6px) scale(.985)→none`.
Position per `getBoundingClientRect` mit Umklappen nach oben und seitlichem
Begrenzen am Viewport. Schließt bei Klick außerhalb und `Escape`, Fokus geht zurück
auf den Trigger. Pfeiltasten laufen durch die Optionen, Enter wählt.

**Mehrfachauswahl** — Suchfeld (ab ~8 Optionen), Zeile „Alle …" mit Zähler,
Trennlinie, dann Optionen mit Checkbox, optionalem Farbpunkt, Beschreibung und
Trefferzahl. Fuß mit *Abbrechen* / *Übernehmen*: die Auswahl wird lokal gepuffert
und erst mit *Übernehmen* angewandt.

**Facettenzahlen** — jede Facette ignoriert bei ihrer eigenen Zählung ihren eigenen
Filter. Dadurch bleiben die Zahlen brauchbar, wenn schon etwas gewählt ist.

**Karte** — `--surface`, `--r-md`. Kopf: Modell-Badge in Markenfarbe, Titel, Uhrzeit,
Chevron. Darunter der Auszug, dann die Metazeile mit Ampelpunkt, Typ, Kategorie, Tags
und rechts den Kennzahlen.

**Anzeigedichte** — zwei Stufen, umschaltbar im Kopf, Wahl in `localStorage` unter
`promptengineer.density`. Die Karte ist ein **Raster**; der Unterschied zwischen den
Stufen liegt allein in `grid-template-areas`, nicht in verschiedenen Regeln oder gar
verschiedenem Markup:

```
kompakt (2 Zeilen)          weit (3 Zeilen)
"model title meta date exp" "model title title date exp"
"snip  snip  snip snip snip" "snip  snip  snip  snip snip"
                             "meta  meta  meta  meta meta"
```

Kompakt rücken die Metadaten in die Titelzeile und füllen den Platz, den der Titel
rechts frei lässt — das spart je Eintrag eine ganze Zeile. Die Titelspalte ist
`minmax(4em,1fr)`, die Meta-Spalte `minmax(0,auto)` mit `overflow:hidden`: bei engem
Fenster werden überzählige Tags abgeschnitten statt umzubrechen, die Kartenhöhe bleibt
also stabil. Alle Teile sind **direkte Kinder** des Rasters — ein Wrapper-Element würde
die Umordnung verhindern.

Dazu die Maß-Tokens auf `:root` bzw. `[data-density="cosy"]`:

| Token | kompakt (Default) | weit |
|---|---|---|
| `--card-py` / `--card-px` | 9 / 13 px | 14 / 16 px |
| `--card-gap` | 5 px | 8 px |
| `--card-title` | 13,5 px | 14,5 px |
| `--card-snippet` | 12,5 px | 13 px |
| `--snippet-lines` | 1 | 2 |
| `--card-meta` | 10,5 px | 11 px |
| `--card-est` | 58 px | 122 px |
| `--ico-expand` Chevron Karte | 12 px | 15 px |
| `--ico-ampel` Ampelpunkt | 6 px | 7 px |
| `--ico-dot` Punkt im Modell-Badge | 5 px | 6 px |
| `--ico-node` Chevron im Baum | 12 px | 13 px |
| `--ico-ring` Ring am Ast | 6 px | 7 px |

Die Symbolgrößen laufen mit — sonst wirken Icons in der kompakten Stufe zu schwer.
Bei SVGs überschreiben `width`/`height` aus dem CSS die gleichnamigen Attribute im
Markup, deshalb genügt eine CSS-Regel. Der Ring am Ast wird aus seiner Größe heraus
positioniert (`left: calc(9px - var(--ico-ring)/2 - 1.5px)`), damit er in beiden
Stufen mittig auf dem Stamm sitzt.

`--card-est` speist `contain-intrinsic-size`, damit die Scrollhöhe bei
`content-visibility: auto` in beiden Stufen stimmt. Ein **aufgeklappter** Eintrag zeigt
immer den zweizeiligen Auszug — dort wird gelesen, nicht überflogen.

**Baum** (aufgeklappter Eintrag) — Karte verliert unten die Rundung und bekommt
Rand `--accent`; darunter der Baum mit senkrechtem Stamm (1 px `--line`, links bei
9 px), waagerechten Ästen und einem Ring je Turn — blau für User, grün für
Assistant. Aufklappen über `grid-template-rows: 0fr → 1fr`, damit ohne bekannte
Höhe animiert werden kann. Der Baum wird erst beim ersten Öffnen gebaut und danach
im DOM behalten.

**Denkfluss** — dritte Ebene, `<details>` mit gestricheltem violettem Rand
(`#6b5cf6`), kursiv, standardmäßig zu.

### Modellfarben

| Modell | Farbe | Modell | Farbe |
|---|---|---|---|
| ChatGPT | `#10a37f` | GLM | `#4f46e5` |
| Claude | `#d97757` | MiniMax | `#e94b6e` |
| Gemini | `#4285f4` | ManusAI | `#ff6b35` |
| Deepseek | `#4d6bfe` | HuggingFace | `#ffcc4d` |
| Grok | `#c9d1e0` | Unbekannt | `#6b7688` |
| Kimi | `#8b5cf6` | | |

### Regeln, die nicht verhandelbar sind

1. Klick auf einen Eintrag klappt **inline** auf. Kein Drawer, kein Modal.
2. Jedes Popover ist per Tastatur bedienbar und gibt den Fokus zurück.
3. Zahlen immer `font-variant-numeric: tabular-nums`, damit nichts springt.
4. Der Chatinhalt bekommt **nie** einen Bearbeiten- oder Löschen-Knopf.
5. Kein Text ist fest verdrahtet — alles läuft über `t()` bzw. `tx()`.

---

## 4 · Sprache

### Grundregel

**Englisch ist immer die Voreinstellung.** Das gilt projektweit, nicht nur für diese
App — für jede Oberfläche, jedes Werkzeug und jede neue Datei, die dazukommt.
Konkret heißt das:

- Beim allerersten Start ist Englisch aktiv.
- Nach dem Leeren des Browserspeichers ist wieder Englisch aktiv.
- Steht ein ungültiger Wert im Speicher, wird auf Englisch zurückgefallen.
- **Die Browsersprache wird bewusst nicht ausgewertet.** Ein deutsches Windows
  bekommt trotzdem Englisch zu sehen.

Umgesetzt ist das an genau einer Stelle:

```js
let LANG = (() => {
  try { const s = localStorage.getItem(LANG_KEY); if (LANGS.includes(s)) return s; } catch {}
  return 'en';          // Default Englisch, unabhängig von der Browsersprache
})();
```

Deutsch ist keine Notlösung, sondern gleichwertig gepflegt — es ist nur nicht der
Startzustand. Wer umschaltet, behält seine Wahl bis zum nächsten Umschalten.

### Umsetzung

- Wörterbuch `T` mit Schlüssel → `{ en, de }`, Zugriff über `t('key', { platzhalter })`.
- Zweisprachige Felder in Stammdaten (`name`, `desc`, `label`, `sub`) über `tx(feld)`.
- Umschalter EN/DE oben rechts, Wahl in `localStorage` unter `promptengineer.lang`.
- `applyLang()` setzt `<html lang>`, alle statischen Texte, baut die `Intl`-Formatter
  neu und rendert die Liste neu.
- **Sprachunabhängig bleiben:** OKF-Schlüssel, JSON-Schlüssel, Typ-IDs (`MOTIV`,
  `WAND`, …), Ampel-IDs (`Rot`, `Gelb`, `Gruen`, `Blau`), Dateinamen sowie der
  **Zeitstempel je Eintrag** im Format `DD/MM/YYYY-hh/mm/ss` (`stampFull()`). Er steht
  in Monospace auf jeder Karte, im Baumkopf und an jedem Turn — feste Breite von 19
  Zeichen, damit die Spalte über alle Einträge exakt untereinander steht. Der Tooltip
  zeigt zusätzlich die sprachübliche Schreibweise.
- **Sprachabhängig sind:** Oberfläche, CSV-Kopfzeile, Fließtexte in MD/TXT/PDF und
  der NotebookLM-Datei, Datums- und Zahlenformate.

Beim Anlegen eines neuen Schlüssels beide Sprachen füllen — der Test in Abschnitt 6
schlägt sonst fehl.

---

## 5 · Datenmodell & Formate

### Chat im Speicher

```js
{
  id, title, url, modelId, typeId, catId, ampel, tags[], ts,
  turns: [{ role: 'user'|'assistant', text, thought, ts }],
  okfId, ref, refBy[],          // nur bei Import aus data.okf.json
  source, msgs, thoughts, tokens
}
```

### OKF (Quelle: `c:\DEV\OKF_MD_LOG`)

- **`raw.okf.json`** — flaches Array roher Einträge:
  `{ role, text, url, timestamp, llm, tags }`. Unveränderlich. Bis 24.08.2026
  hieß das letzte Feld `kategorie`; seit 25.08.2026 schreibt das Journal
  `tags: ["ampel/<Wert>"]` nach Googles OKF-Schema. Der Import liest beide
  Formen (`ampelFromEntry()`), Richards Server auf `OKF_MD_LOG` schreibt nach
  wie vor `kategorie` — bewusste Divergenz, siehe unten.
- **`data.okf.json`** — flaches Array typisierter Erkenntnisse:
  `{ id: "e01", type, text, timestamp, ref?, llm?, tags? }`.
  **`ref` zeigt vom neueren auf den älteren Eintrag** — daran hängt die Richtung
  der Verdichtungsregeln.

#### Die sechs Typen

Der Bezeichner in `type` ist **immer der deutsche** — er ist Teil des Datenformats
und wird nie übersetzt. Übersetzt wird ausschließlich, was auf dem Bildschirm steht.

| `type` | Badge EN | Bedeutung | Leitfrage |
|---|---|---|---|
| `MOTIV` | MOTIVE | Die Unzufriedenheit, der Anlass, das Jucken | Warum tun wir das überhaupt? |
| `FUND` | FINDING | Etwas über die Welt/den Code herausgefunden, das nun einschränkt | Was ist der Fall? |
| `WEG` | PATH | Ein eingeschlagener Ansatz, Plan, Versuch | Was probieren wir? |
| `WAND` | WALL | Gescheitert, verworfen, blockiert | Woran ist es gestoßen? |
| `SETZUNG` | DECISION | Entscheidung, auch vorläufige, auch Kompromiss | Was gilt jetzt? |
| `ZWEIFEL` | DOUBT | Ungelöstes Unbehagen, offene Spannung | Was nagt noch? |

Dazu `CHAT` für Roh-Verläufe, die noch nicht typisiert sind.

Jeder Typ trägt vier zweisprachige Felder: `short` (das Badge, in Großbuchstaben),
`name` (Fließtext), `desc` (die Bedeutung oben) und `q` (die Leitfrage). Die
Leitfrage steht im Typ-Filter unter jeder Option und macht die Auswahl selbsterklärend.
Der Tooltip nennt zusätzlich die unveränderte OKF-ID, damit beim Blick auf den
Bildschirm klar bleibt, was in der Datei steht.
- **`VERLAUF.md`** — Kopf, Offene Spannungen, Wände, Sitzungen.
  Zeile: `` - `HH:MM` [e01] **TYP** Ein Satz — mit dem Weil. ↳e00 ``,
  Tageskopf: `### YYYY-MM-DD (Tue)`.
  **Einträge laufen über mehrere Zeilen**, Fortsetzungen sind eingerückt — der Parser
  faltet sie zusammen (`foldContinuations`), sonst geht der halbe Text verloren.
  Gelesen wird auch der Abschnitt *Wände*, weil eine Wand dort stehen bleibt, wenn
  ihre Sitzung weggefallen ist; Dubletten werden über die ID ausgeschlossen.
  Code-Blöcke werden vor der Erkennung entfernt, damit Dokumentation, die das Format
  als Beispiel zeigt (`SKILL.md`), nicht selbst als VERLAUF.md gilt.
- **Das Weil ist Pflicht.** Ein Eintrag ohne Begründung ist wertlos — die Begründung
  ist genau das, was jede Zusammenfassung wegwirft. Beim Import wird
  `Text — weil Begründung` in zwei Untergruppen getrennt und beim Export wieder
  zusammengesetzt.
- **Ampel** (gesetzt vom Gemini-Auto-Tagger): `Rot` Blocker · `Gelb` Zweifel ·
  `Gruen` Erfolg · `Blau` neutrale Information. Seit 25.08.2026 als
  `tags: ["ampel/<Wert>"]` exportiert (zuvor `kategorie`).
- Dateien werden serverseitig nach dem Schreiben auf `0444` gesetzt.

### Verdichtung (Quelle: `md_files/SKILL.md`, Abschnitt „Schicht 2")

Maßgeblich ist **`SKILL.md`**, nicht `compactor.js` — siehe die Abweichung unten.
Grundregel: Einträge werden **herabgestuft, nicht gelöscht**. Gelöscht werden darf
einer nur, wenn sein Weil vollständig in einem überlebenden Eintrag steckt.

| # | Regel | umgesetzt |
|---|---|---|
| 1 | `MOTIV` ist unantastbar | ja |
| 2 | Strang `WEG → WAND` auf die WAND zusammenziehen, die WAND erbt das Weil | ja |
| 3 | Strang `WEG → SETZUNG` auf die SETZUNG, die die Motivation aufsaugt | ja |
| 4 | Aufgelöster `ZWEIFEL` wandert in die auflösende SETZUNG | nein, siehe unten |
| — | Altersstufen (verfallender Detailgrad) | ja, `compactByAge()` |
| — | Verweise auf verdichtete Einträge nachziehen | ja, `relinkRefs()` |
| 5 | Offener `ZWEIFEL` verdichtet nie | ja |
| 6 | `FUND` überlebt nur, solange er trägt | ja |
| 7 | Folgenloses fällt weg — **außer** WAND: „nicht der Gang durch die Sackgasse bleibt, sondern die Wand an ihrem Ende" | ja |

Regel 4 ist bewusst nicht automatisiert: Welche SETZUNG welchen ZWEIFEL auflöst,
steht nur im Fließtext, nicht in den Daten.

> **Abweichungen in `compactor.js`** — vier Stück, offen abgestimmt mit Richard,
> von dem die Regeln stammen (siehe §7):
> 1. **Strang-Suche läuft rückwärts** — `ref` zeigt vom neueren auf den älteren
>    Eintrag, `findClosedStrand()` folgt aber den ausgehenden Verweisen. Damit
>    feuern **Regeln 2 und 3 nie**; übrig bleiben nur die Lösch-Regeln.
> 2. **Kein Altersbezug** — verdichtet auch die laufende Sitzung, obwohl die
>    wörtlich stehen bleiben soll. Widerspricht der Kernidee des Skills.
> 3. `isFolgenlos()` nimmt nur `MOTIV` aus und entfernt damit `WAND`- und
>    `ZWEIFEL`-Einträge, die nach den Regeln 5 und 7 bleiben müssten.
> 4. Verweise auf verdichtete Einträge werden nicht nachgezogen.
>
> Diese App folgt der Spezifikation: `compactByAge()`, `KEEP_ALWAYS`, `relinkRefs()`.
> Der Trockenlauf `tools/dry-compaction.mjs` führt den echten `compactor.js` mit
> abgefangenen Schreibvorgängen aus und stellt beide Ergebnisse gegenüber.

### Altersstufen

Der Detailgrad verfällt mit dem Alter, das motivationale Gerüst nie
(`compactByAge()`):

| Stufe | Zuordnung | Was bleibt | Zeitstempel |
|---|---|---|---|
| laufende Sitzung | jüngster Tag mit Einträgen | **alles, wörtlich** — vor jeder Regel geschützt | Uhrzeit |
| letzte 2 Sitzungen | die zwei nächstjüngeren Tage | Stränge zusammengezogen | Uhrzeit |
| älter | älter, bis 90 Tage | nur MOTIV, SETZUNG, WAND, offene ZWEIFEL | nur Datum |
| viel älter | über 90 Tage | dasselbe, Sitzungen eines Monats zu einem Block | nur Datum |

„Sitzung" ist ein **Tag mit Einträgen**, kein Kalendertag: Der jüngste vorhandene Tag
gilt als der laufende. Damit stuft die Funktion auch einen Datensatz sinnvoll ein, an
dem seit Wochen niemand gearbeitet hat — die echte `VERLAUF.md` mit nur einem
Sitzungstag bleibt so vollständig unangetastet.

Die Regeln laufen über den **ganzen** Graphen, nicht je Stufe: Stränge kreuzen
Tagesgrenzen. Geschützt wird über eine ID-Menge, nicht durch Vorfiltern.

**Verweise werden nachgezogen** (`relinkRefs()`). Fällt ein Eintrag weg, folgt jeder
`ref`, der auf ihn zeigte, dessen Kette weiter bis zum nächsten überlebenden Eintrag.
Ohne das behauptet ein Verweis nach der Verdichtung einen Eintrag, den es nicht mehr
gibt — und bricht damit genau die Argumentationsstränge, wegen derer die IDs
überhaupt existieren. Beispiel: `e08 ↳e07` wird zu `e08 ↳e05`, wenn `e07` in `e08`
eingeschmolzen wurde.

Zwei Exportformate: `compact.okf.json` wendet nur die Regeln an,
`aged.okf.json` zusätzlich die Altersstufen. `VERLAUF.md` nutzt immer die
Altersstufen, weil das Dokument genau dafür gedacht ist.

### Werkzeuge unter `tools/`

| Werkzeug | Zweck |
|---|---|
| `find-chats.mjs <ordner> [--copy] [--depth=N]` | durchsucht **genannte** Ordner nach Chat-Exporten, erkennt das Modell und sortiert nach `Chats_LMM/<Modell>/` ein (kopiert, verschiebt nie) |
| `dry-compaction.mjs [okf-pfad]` | führt den echten `compactor.js` mit abgefangenen Schreibvorgängen aus und stellt ihn den SKILL.md-Regeln gegenüber |

Die Herkunft eines Chats wird **gewichtet** bestimmt, nicht am ersten Treffer:
Ordnername 100 · Dateiname 50 · Quell-URL in den ersten 1500 Zeichen 40 ·
Titel-Präfix `[GEMINI]` 30 · Nennungen im Text höchstens 8. Grund: Ein im Gespräch
*erwähntes* Modell ist kein Herkunftsbeleg — „beim normalen Chat wie ChatGPT oder
Gemini" sagt nichts darüber, wo der Chat herkommt. Ohne deutlichen Vorsprung bleibt
es bei „Unbekannt".

### Drei Chat-Formate

| Format | Erkennung | Ergebnis |
|---|---|---|
| strukturierter Export | `*User prompt:` / `Response:` | Turns sauber getrennt |
| OKF / VERLAUF.md | siehe oben | typisierte Einträge |
| **roher Copy-Paste-Verlauf** | keine Marker | **ein** Eintrag, als `unstructured` gekennzeichnet |

Der dritte Fall ist wichtig: Ein aus der Weboberfläche kopierter Verlauf enthält keine
Sprechermarker. Die Zuordnung zu raten wäre schlimmer, als sie wegzulassen — ein
Journal, dessen Rollen erfunden sind, ist wertlos, weil man ihm trotzdem glaubt. Solche
Dateien kommen deshalb als **ein** Block herein, volltextdurchsuchbar, und tragen in der
Karte ein gestricheltes Warnschild *ungetrennt / unsplit* mit Erklärung im Tooltip.

### Chat-Markdown (eigenes Exportformat)

```
# **Titel**

[https://…](https://…)

*User prompt: …*

Response: …

---
```

Der Parser repariert dabei Mojibake und entfernt Backslash-Escapes (`Absolut\!`).

### Exportformate

| Kürzel | Datei | Inhalt |
|---|---|---|
| MD | `.md` | ein Dokument, Chats als Abschnitte |
| TXT | `.txt` | Klartext |
| CSV | `.csv` | eine Zeile je Turn, Semikolon, BOM für Excel |
| JSON | `.json` | volle verschachtelte Struktur |
| PDF | `.pdf` | A4, eigener Writer, ohne Emoji |
| RAW | `raw.okf.json` | Roh-Verlauf |
| DATA | `data.okf.json` | typisiert mit ref-Kette |
| ⤓ | `compact.okf.json` | verdichtet |
| MD | `VERLAUF.md` | Kopf, Spannungen, Wände, Sitzungen |
| WIKI | `.zip` | LLM-Wiki-Bündel: `raw/` + `wiki/` + `CLAUDE.md` |

Dateiname: `[KI-Name]_[YYYY-MM-DD]_[HH-MM].[ext]`, Metadaten oben im Dokument.
NotebookLM: quellenoptimierte Markdown-Datei, immer als Download — der frühere
Server-Push an `POST /api/exports/notebooklm` ist am 24.08.2026 entfernt worden,
weil der Endpunkt den gesendeten Inhalt ignoriert und stattdessen alle
Serverprojekte exportiert; hochgeladen wird nur von Hand (Vorgabe: ausschließlich
manuelle Einzelexporte).

#### LLM-Wiki-Bündel

Die Dreiteilung aus Karpathys Muster, als ZIP, weil ein `file://`-Dokument kein
Verzeichnis schreiben kann. Entpackt ist derselbe Baum zugleich ein
Obsidian-Vault.

| Pfad | Inhalt |
|---|---|
| `CLAUDE.md` | Schema: die sechs Typen mit Leitfragen, Verdichtungsregel, Lesehilfe |
| `raw/<datum>_<modell>_<slug>.md` | unveränderlich, eine Datei je Chat, YAML-Frontmatter |
| `wiki/eNN.md` | die **altersverdichtete** Ebene (`compactByAge`), eine Datei je Eintrag |
| `wiki/index.md` | Einstieg: offene Spannungen, Wände, Sitzungen nach Tag |

In `wiki/` wird aus `ref` ein `[[Verweis]]`; die Gegenrichtung steht als Zeile
„Einträge, die hierher verweisen“ darunter und ist in Obsidian zugleich das
Backlink-Panel. Die ↳-Kette, die der Baum zur Darstellung anhängt, bleibt
draußen. Der ZIP-Writer ist wie der PDF-Writer handgeschrieben, Methode 0
(gespeichert, keine Kompression), Dateinamen als UTF-8 über Flag-Bit 11.

### Geheimnis-Prüfung vor dem Export

Im Journal selbst sind Zugangsdaten unkritisch — alles bleibt lokal. Kritisch wird der
Moment, in dem etwas das Gerät verlässt. **NotebookLM ist der einzige solche Weg**
(Google-Dienst), deshalb gilt dort keine Ausnahme.

| Stufe | Was | Verhalten |
|---|---|---|
| kritisch | API-Schlüssel (OpenAI, Anthropic, Google, GitHub, Slack, AWS), JWT, privater Schlüssel, Verbindungszeichenfolge mit Passwort, Bearer-Token, zugewiesene Zugangsdaten | Dialog, immer |
| persönlich | E-Mail, IBAN, Telefonnummer | Dialog nur bei NotebookLM |
| Hinweis | lokaler Pfad mit Benutzername, IP | nur Hinweis-Toast |

`guardExport(chats, { leavesDevice }, proceed)` schaltet sich vor jeden Export. Der
Dialog bietet drei Wege: abbrechen, **maskiert** exportieren, oder unverändert. Beim
Maskieren bleiben die ersten vier Zeichen und die Art des Funds stehen
(`sk-p••••••••••••[openai]`) — der Text bleibt lesbar, das Geheimnis ist weg, und ein
erneuter Scan der maskierten Fassung findet nichts mehr.

Falsch-Positive werden aussortiert: `127.0.0.1`, `sk-xxx`, `dein_schluessel`,
`<platzhalter>` und Ähnliches. Wichtig bei den Mustern: `sk-proj-…` enthält
Bindestriche (Zeichensatz `_-`), Google-Schlüssel dürfen kein `\b` am Ende haben, und
die Telefonnummer braucht einen Trenner nach der Vorwahl — sonst gilt jede lange
Ziffernfolge in einem Token als Nummer.

Einträge mit kritischen Funden tragen in der Liste ein rotes Schild *Zugangsdaten*.
Geprüft wird einmal je Eintrag (`SECRET_CHECKED`), sonst liefe der Scan bei jeder
Tag-Änderung erneut: 35 ms für 1.200 Chats beim ersten Mal, danach 8 ms.

---

## 6 · Arbeitsweise

### Testgerüst

Die App ist eine HTML-Datei, lässt sich aber trotzdem automatisch prüfen: Der
Script-Block wird extrahiert, vor dem DOM-abhängigen Teil abgeschnitten, mit
Stubs versehen und als ES-Modul importiert.

```js
const html = fs.readFileSync('index.html', 'utf8');
const src  = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
const core = src.slice(0, src.lastIndexOf('/*', src.indexOf('TEIL 6 · Popover-Engine')));
// + Stubs für document/localStorage/toast, + export {...}
```

Zwei Suiten im Scratchpad:

- **`suite.mjs`** — Parser an der echten Gemini-Datei, Ampel-Normalisierung,
  Denkfluss-Trennung, `data.okf.json` mit ref-Graph, Verdichtung, VERLAUF.md-Rundlauf,
  alle Exportformate, Filter über alle Dimensionen.
- **`i18n.mjs`** — Vollständigkeit des Wörterbuchs, gleiche Platzhalter in beiden
  Sprachen, zweisprachige Stammdaten, Umschaltung, Exporte in beiden Sprachen,
  Stabilität der Datenschemata.

### Messwerte (Referenz für Regressionen)

| Fall | Wert |
|---|---|
| 1.200 Chats / 11.788 Turns, kein Filter | 0,32 ms |
| kombinierter Filter über 5 Dimensionen | 0,08 ms |
| Facettenzahlen (5 Facetten) | ~1,0 ms |
| 50.000 Einträge, Filter + Sortierung | 14 ms |
| PDF, 39 Turns → 20 Seiten | ~44 ms |

Alles, was pro Tastendruck läuft, bleibt unter einer Millisekunde.

### Vorgehen

1. **Vorhandenes lesen, bevor etwas geraten wird.** Das OKF-Format wurde zunächst
   falsch angenommen; erst `compactor.js` und `journal-store.js` haben es geklärt.
   Kosten der Korrektur: mehrere Stellen im Datenmodell.
2. **Nicht blockieren.** Fehlt eine Zulieferung, wird alles Übrige gebaut und die
   Annahme benannt.
3. **Nach jeder Änderung testen**, dann erst berichten. Messwerte statt Adjektive.
4. **Randbedingungen prüfen, nicht überschreiben.** Wenn eine Anforderung mit einer
   früheren kollidiert (z. B. read-only gegen Tags ändern), die Auflösung benennen —
   hier: der Inhalt bleibt unveränderlich, die Verschlagwortung nicht.

### Verwendete Werkzeuge

In diesem Chat wurden **keine Skills geladen** — die Arbeit lief über die
Standardwerkzeuge (Datei lesen/schreiben/ändern, Suche, Node über die Shell,
Browser öffnen). Für spätere Erweiterungen naheliegend:

| Skill | Wann sinnvoll |
|---|---|
| `artifact-design` · `artifact-diagramming` | wenn eine Ansicht als Artifact veröffentlicht werden soll |
| `dataviz` | sobald das Journal Auswertungen mit Diagrammen bekommt |
| `code-review` · `security-review` | vor größeren Zusammenführungen |
| `run` | wenn der OKF-Server samt Dashboard mitgestartet werden soll |

---

## 7 · Offene Punkte

- **Regel 4** (aufgelöster ZWEIFEL wandert in die SETZUNG) ist nicht automatisierbar,
  solange die Auflösung nur im Fließtext steht.
- Die Schwelle für „viel älter" liegt bei 90 Tagen (`ANCIENT_DAYS`) — in SKILL.md
  nicht beziffert, also gesetzt und hier vermerkt.
- **`compactor.js` weicht von `SKILL.md` ab** (siehe §5) — **bewusst noch nicht
  angeglichen.** Die Regeln stammen von Richard, einem Freund des Nutzers; sein
  Konzept wird nicht einseitig überschrieben. Abgesprochener Ablauf: Richard mit der
  Begründung fragen, dann gemeinsam ändern, und zwar **vor** der finalen
  Fertigstellung. Grundlage ist der Trockenlauf `tools/dry-compaction.mjs`
  (`node tools/dry-compaction.mjs`), der nichts schreibt und einen Bericht unter
  `tools/dry-compaction-report.md` ablegt.
- Die Tabelle *Offene Spannungen* wird beim Import übersprungen: ihre `S1`-Nummern
  lassen sich nicht eindeutig auf `eNN`-IDs abbilden, und sie spiegelt ohnehin
  ZWEIFEL-Einträge aus den Sitzungen.
- `Chats_LMM/` enthält bisher nur acht Dateien (`Gemini/` mit zwei `data.okf.json`,
  zwei `VERLAUF.md` und zwei Chat-Exporten, dazu `Unbekannt/VERLAUF.md`), eingeordnet
  von `tools/find-chats.mjs`. Ein echter Korpus fehlt weiterhin — getestet wurde mit
  Mock-Daten, einer echten Gemini-Exportdatei und den drei Dateien in `md_files/`.
- Chats ohne Zeitstempel im Markdown erben das Änderungsdatum der Datei.
- Der PDF-Writer kann keine Emoji darstellen (Helvetica/WinAnsi); sie werden entfernt.

---

## Änderungen

| Datum | Was |
|---|---|
| 23.08.2026 | Erste Fassung: Filterleiste, Popovers, Mock-Korpus, Filter-Engine |
| 23.08.2026 | Datenmodell auf Chat→Turns umgestellt, Import, 6 Exportformate, PDF-Writer |
| 23.08.2026 | Detailansicht von Drawer auf **Inline-Baum** geändert |
| 23.08.2026 | OKF-Format nach `compactor.js`/`journal-store.js` korrigiert; Typen, Ampel Rot/Gelb/Gruen/Blau, Verdichtung portiert, VERLAUF.md gelesen und geschrieben |
| 23.08.2026 | Kategorien zusätzlich zu OKF-Typen behalten; Denkflüsse (Chain of Thought) als dritte Baumebene |
| 23.08.2026 | Manuelle Änderung von Tags, Ampel und Kategorie mit Persistenz in `localStorage` |
| 23.08.2026 | Oberfläche zweisprachig, Englisch als Voreinstellung; Datenschemata bleiben sprachunabhängig |
| 23.08.2026 | Englisch als Voreinstellung zur projektweiten Grundregel erhoben (§4) |
| 23.08.2026 | OKF-Typen mit den genauen Definitionen und Leitfragen versehen, Badge zeigt jetzt den übersetzten Kurznamen (WALL statt WAND) — IDs im Datenformat unverändert |
| 23.08.2026 | `md_files/` ausgewertet (SKILL.md, VERLAUF.md, vorschlaglogging.txt). Drei Korrekturen: mehrzeilige VERLAUF-Einträge werden gefaltet, Verdichtung schützt jetzt WAND und ZWEIFEL nach SKILL.md, OKF-Rundlauf bläht importierte Einträge nicht mehr auf |
| 23.08.2026 | Anzeigedichte eingeführt, kompakt als Voreinstellung; Symbolgrößen laufen über eigene Tokens mit |
| 23.08.2026 | Karte auf Raster umgebaut: kompakt stehen die Metadaten in der Titelzeile — Kartenhöhe von ~122 auf ~58 px |
| 23.08.2026 | Voller Zeitstempel `DD/MM/YYYY-hh/mm/ss` je Eintrag statt nur der Uhrzeit |
| 25.08.2026 | **`compactor.js` in `OKF_MD_LOG` direkt gefixt** (Abweichungen A–D): `findClosedStrand` folgt `incoming` statt `outgoing`, `compactByAge()`/Altersstufen ergänzt, `KEEP_ALWAYS` schützt MOTIV/WAND/ZWEIFEL, `relinkRefs()` zieht Verweise nach. Bench zeigt jetzt 4/4 fehlerfrei, zeilenidentisch mit `compactByAge()` (vorher 0/4). Voraussetzung dafür: Nutzer entscheidet ab jetzt allein über das Gesamtprojekt (keine Rückfragepflicht bei Richard mehr) und Versionskontrolle in allen neun betroffenen `C:\DEV`-Ordnern eingerichtet (Sicherungsbasis vor dem Schreiben, `.gitignore` gegen zwei echte Zugangsdaten-Funde in `Tools\fragmente\` und eine fremde Skill-Bibliothek in `nowPayDee`) |
| 25.08.2026 | **Feldwechsel `kategorie` → `tags` entschieden und umgesetzt** (`raw.okf.json`, `data.okf.json`): schreibt jetzt `tags: ["ampel/<Wert>"]` nach Googles OKF-Schema — bewusst und mit Wissen, dass Richards Server (`OKF_MD_LOG`) weiterhin `kategorie` schreibt und importierte Dateien von dort also im alten Feld ankommen. Der Import (`ampelFromEntry()`) liest beide Formen, betrifft also nur die Schreibrichtung. Nebenbei einen latenten Fehler behoben: `toOkfData()` setzte nie eine Ampel, wodurch das LLM-Wiki-Bündel (`wiki/eNN.md`) nie `tags` im Frontmatter hatte — jetzt wird sie mitgeschrieben und `vaultEntryDoc()` liest `e.tags` statt des nie befüllten `e.kategorie`. Die Änderungstabellenzeile vom 23.08. zu diesem Thema war Absicht ohne Umsetzung — der Code hatte `kategorie` bis zu diesem Fix durchgehend behalten |
| 25.08.2026 | Verweisform im Verzeichnisformat entschieden: Markdown-Links (`[e03](e03.md)`), nicht Wikilinks — funktioniert in GitHub/VS Code/Obsidian gleichermaßen. Bestätigt, keine Code-Änderung nötig (Export tat das bereits) |
| 24.08.2026 | Repos aufgeräumt (`repos-sortieren.md` Schritt 1): auf `ThaiJenspacito` 4 leere Repos, 7 Forks und der Org-Fork gelöscht, Laundry-Dublette bereinigt. Auf `Jenspacito` (nicht `Jenspacito2024`, ein drittes unabhängiges Konto) fehlt der Zugang — E-Mail-Adresse unbekannt, 6 Forks bleiben vorerst stehen |
| 24.08.2026 | NotebookLM-Knopf pusht nicht mehr an den OKF-Server, sondern lädt immer nur die Datei herunter; Texte `nbPush`/`nbHandover` entfernt |
| 25.08.2026 | **Korrektur:** `/api/exports/notebooklm` war entgegen der Annahme vom 24.08. kein Serverfehler — der Endpunkt ist das Dashboard-„Exporte jetzt aktualisieren"-Kommando (`dashboard.js: forceNotebookLMExport()`), bewusst ohne Payload, regeneriert alle Projekt-Exporte aus den serverseitig gespeicherten Daten. Der alte Journal-Code hatte nur eine falsche Annahme über dieselbe URL. Server bleibt unverändert |
| 24.08.2026 | `gespraech-richard-compactor.md` berichtigt: die Aussage, Punkt A (Strang-Richtung) beträfe das Journal nicht, war falsch — das Journal hatte denselben Fehler, am 24.08. behoben; Schlussabschnitt verweist jetzt auf den Bench-Report als Beleg |
| 24.08.2026 | Vierter Referenzdatensatz `strang-synthetic-altersstufen.json` (fünf Tage, alle vier Altersstufen) samt handschriftlicher Herleitung — `compactByAge()` trifft das Referenzergebnis exakt (12 → 7, Zeitstempel-Verfall geprüft). Bench misst jetzt 4/4 fehlerfrei für beide Journal-Versionen, `compactor.js` 0/4. Damit ist die im Fixtures-README vermerkte Lücke geschlossen. |
| 23.08.2026 | **Richtungsfehler in `compactOkf()` behoben.** `findStrand` folgte `outgoing` (die eigene ref-Vergangenheit einer WEG) statt `incoming` (was Neueres auf sie zeigt) — dadurch fand die Funktion nie einen echten geschlossenen Strang und konnte stattdessen unzusammenhängende Einträge fälschlich verschmelzen. Mit echten und realistisch modellierten Testdaten nachgewiesen, siehe `.claude/gespraech-richard-compactor.md`, Abweichung A. Zusätzlich `parseOkfTyped()` repariert: die ↳-Kette der Vorgänger war komplett verschwunden, nicht nur verändert — Anzeige-Baum zeigte keine Untergruppen mehr aus `data.okf.json`. `compactor.js` in `OKF_MD_LOG` bleibt bewusst unangetastet, siehe [[compactor-abweichung]]. |
| 23.08.2026 | Altersstufen aus SKILL.md umgesetzt (`compactByAge`), VERLAUF.md blockt alte Sitzungen monatsweise; Verweise auf verdichtete Einträge werden nachgezogen (`relinkRefs`) |
| 23.08.2026 | Trockenlauf `tools/dry-compaction.mjs` — führt den echten `compactor.js` mit abgefangenen Schreibvorgängen aus und stellt ihn den SKILL.md-Regeln gegenüber |
| 23.08.2026 | `tools/find-chats.mjs` zum Auffinden und Einsortieren von Chat-Exporten; Herkunft wird gewichtet bestimmt statt am ersten Treffer |
| 23.08.2026 | Rohe Copy-Paste-Verläufe ohne Sprechermarker werden als **ein** Eintrag importiert und sichtbar als `ungetrennt` gekennzeichnet, statt Turns zu erfinden |
| 23.08.2026 | Geheimnis-Prüfung vor jedem Export, beim NotebookLM-Weg ohne Ausnahme; Maskierung erhält Lesbarkeit; betroffene Einträge in der Liste markiert |
| 23.08.2026 | Export **LLM-Wiki-Bündel** (`WIKI`, ZIP): `raw/` + `wiki/` + `CLAUDE.md` nach Karpathys Dreiteilung, `wiki/` altersverdichtet, `ref` als `[[Verweis]]` — entpackt ein Obsidian-Vault. Eigener Mini-ZIP-Writer, keine Bibliothek |
| 23.08.2026 | Vierte Abweichung in `compactor.js` gefunden: `findClosedStrand()` folgt der `ref`-Richtung verkehrt herum, dadurch feuern die Zusammenzieh-Regeln 2 und 3 nie. Gesprächsgrundlage für Richard in `gespraech-richard-compactor.md` |
| 23.08.2026 | **Format entschieden:** Produktname bleibt `PromptEngineer`, der OKF-Name bleibt, das Format wechselt auf Googles Verzeichnisbaum (YAML-Frontmatter, eine `.md` je Eintrag, `index.md`/`log.md`). `toKarpathyVault()` liefert die Struktur bereits — offen sind Verweisform, `log.md` und `tags` statt `kategorie` |
| 23.08.2026 | Vault-Export auf OKF-Verzeichnisse gebracht: Verweise als Markdown-Links statt `[[…]]`, `wiki/log.md` ergänzt, Ampel läuft als `ampel/<Wert>` in `tags` statt als eigenes `kategorie`-Feld. Geprüft an 1.200 Chats: 1.193 raw-Dateien mit Ampel-Tag, kein `kategorie:` und kein `[[…]]` mehr im Bündel |
