# PromptEngineer — Manifest

- **Stand:** 23.08.2026
- **Zugehörig:** [settings-und-design.md](settings-und-design.md) — wie gebaut wird
- **Englische Fassung:** [manifest.en.md](manifest.en.md)

---

## Worum es geht

**PromptEngineer** ist ein lokales Werkzeug, das Gespräche mit Sprachmodellen
unveränderlich archiviert und durchsuchbar macht — damit aus ihnen systematisch
bessere Prompts abgeleitet werden können.

Das Ziel ist nicht, Chats aufzubewahren. Das Ziel ist, den **Denkweg** zu sichern:
Wie hat ein Modell ein Problem zerlegt? An welcher Formulierung ist es gescheitert?
Welche Entscheidung hat sich später als tragfähig erwiesen? Aus diesem Material
entsteht eine eigene Prompt-Bibliothek, die auf Erfahrung beruht statt auf Gefühl.

Daraus folgen drei Eigenschaften, die alles andere bestimmen:

1. **Unveränderlichkeit.** Ein Journaleintrag lässt sich nicht bearbeiten und nicht
   löschen. Nur so ist er später als Beleg brauchbar. Serverseitig wird das über
   Dateirechte (`0444`) erzwungen, in der Oberfläche über das schlichte Fehlen
   jedes Bearbeiten-Knopfes. Änderbar ist ausschließlich die Verschlagwortung.
2. **Lokal.** Alles liegt auf der eigenen Platte. Kein Konto, keine Cloud, keine
   Abhängigkeit, die morgen abgeschaltet wird. Die Oberfläche läuft ohne Server;
   ein laufender Server erweitert sie, ist aber nie Voraussetzung.
3. **Modellübergreifend.** ChatGPT, Claude, Gemini, Deepseek, Grok, Kimi, GLM,
   MiniMax, ManusAI und HuggingFace landen im selben Journal und im selben Format.
   Erst dadurch wird vergleichbar, wie unterschiedliche Modelle dieselbe Aufgabe
   angehen.

---

## Woraus es besteht

### `c:\DEV\OKF_MD_LOG` — Erfassung und Ablage

Node-Server auf Port 31337 mit Dashboard und Browser-Extension. Nimmt Chats
entgegen, legt sie ab, verschlagwortet sie und exportiert sie.

- **Ablage:** `Deine_KI_Journals/<KI-Name>/<Projekt>/`
- **`raw.okf.json`** — der Roh-Verlauf, unveränderlich
- **`data.okf.json`** — die typisierte Erkenntnisebene
- **`VERLAUF.md`** — die lesbare Ansicht, automatisch erzeugt
- **Auto-Tagger** — ordnet jedem Eintrag über Gemini eine Ampel zu
- **Endpunkte** — `/api/raw/:ai/:project`, `/api/stats`,
  `/api/agents/extract-todos`, `/api/exports/notebooklm`, `/api/mcp/status`

### `c:\DEV\Dribble_Journal_Filter` — das Journal

Eine einzelne `index.html`, per Doppelklick zu öffnen. Zeigt den Bestand
chronologisch, filtert ihn in Echtzeit, öffnet einzelne Gespräche als Baum und
exportiert die gefilterte Menge in elf Formate.

Bewusst getrennt vom Server: Wer nur lesen und exportieren will, braucht nichts zu
starten. Läuft der Server, erkennt die Oberfläche das und nutzt ihn zusätzlich.

---

## Das OKF-Format

**OKF — Open Knowledge Format.** Zwei Ebenen, die verschiedene Fragen beantworten.

**Die Roh-Ebene** (`raw.okf.json`) hält fest, *was gesagt wurde*: Rolle, Text,
Zeitstempel, Modell, Quelle. Sie wird nie verändert.

**Die typisierte Ebene** (`data.okf.json`) hält fest, *was daraus folgt*. Jeder
Eintrag bekommt einen von sechs Typen und darf per `ref` auf einen früheren
verweisen. So entsteht ein Graph aus Gedankensträngen:

| Typ | Bedeutung | Leitfrage |
|---|---|---|
| `MOTIV` | Die Unzufriedenheit, der Anlass, das Jucken | Warum tun wir das überhaupt? |
| `FUND` | Etwas über die Welt/den Code herausgefunden, das nun einschränkt | Was ist der Fall? |
| `WEG` | Ein eingeschlagener Ansatz, Plan, Versuch | Was probieren wir? |
| `WAND` | Gescheitert, verworfen, blockiert | Woran ist es gestoßen? |
| `SETZUNG` | Entscheidung, auch vorläufige, auch Kompromiss | Was gilt jetzt? |
| `ZWEIFEL` | Ungelöstes Unbehagen, offene Spannung | Was nagt noch? |

Die Leitfrage ist die eigentliche Arbeitsanleitung: Wer einen Eintrag typisiert, fragt
sich, welche der sechs Fragen er gerade beantwortet. `MOTIV` wird dabei nie verdichtet —
das Jucken bleibt, auch wenn alles andere längst geklärt ist.

Darauf setzt die **Verdichtung** auf: Ein Weg, der gegen eine Wand lief, verschwindet
nicht — die Wand übernimmt ihn samt Begründung. Eine Entscheidung behält den Weg,
der zu ihr führte, in Klammern. Was folgenlos blieb, entfällt. Übrig bleibt eine
Kette aus Motiven, Wänden, Entscheidungen und offenen Zweifeln: die Geschichte des
Projekts ohne Wiederholungen.

Quer dazu liegt das **Ampel-System** des Auto-Taggers — `Rot` Blocker, `Gelb` Zweifel,
`Gruen` Erfolg, `Blau` neutrale Information. Es beantwortet nicht, *was* ein Eintrag
ist, sondern *wie er ausging*.

---

## Was das Journal kann

**Chronologie.** Nach Tagen gruppiert, mit Datum und Uhrzeit, neueste zuerst.

**Filtern in Echtzeit.** Sieben Dimensionen, frei kombinierbar: Volltext mit acht
Operatoren, Modell, OKF-Typ, Kategorie, Ampel, Tags, Zeitraum. Ein kombinierter
Filterlauf über 1.200 Chats mit 11.984 Turns dauert 0,08 ms — schnell genug, um bei
jedem Tastendruck neu zu rechnen. Die Trefferzahlen an den Optionen berücksichtigen
die jeweils anderen Filter, bleiben also auch bei enger Auswahl brauchbar.

**Gespräche als Baum.** Ein Klick klappt den Eintrag im selben Frame auf und zeigt
den Verlauf als Baum: jeder Turn ein Ast, aufklappbar, mit Rolle, Zeit und Umfang.
Enthält eine Antwort einen Denkfluss, hängt er als dritte Ebene darunter — sichtbar,
wenn man ihn braucht, sonst aus dem Weg. Stammt der Eintrag aus `data.okf.json`,
zeigt der Baum zusätzlich die `ref`-Kette und damit den Gedankenstrang rückwärts.

**Importieren.** Dateien oder ganze Ordner hineinziehen. Erkannt werden Chat-Exporte
im Markdown-Format, `raw.okf.json`, `data.okf.json` und `VERLAUF.md`. Das Modell
wird aus Ordnername, Titel oder Quell-URL bestimmt. Kaputte Umlaute aus fehlerhaft
kodierten Exporten werden dabei repariert.

**Verschlagworten.** Tags, Ampel und Kategorie sind pro Eintrag änderbar und
überleben einen erneuten Import derselben Datei. Der Chatinhalt bleibt unangetastet.

**Exportieren.** Die gefilterte Menge oder ein einzelnes Gespräch, in MD, TXT, CSV,
JSON, PDF, `raw.okf.json`, `data.okf.json`, verdichtet oder als `VERLAUF.md`. Dazu
eine quellenoptimierte Datei für NotebookLM und das **LLM-Wiki-Bündel** — ein ZIP
aus `raw/`, `wiki/` und `CLAUDE.md`, das entpackt zugleich ein Obsidian-Vault ist.

**Zweisprachig.** Englisch als Voreinstellung, Deutsch vollständig verfügbar,
umschaltbar im Kopf. Datenformate bleiben davon unberührt.

---

## Wie es entstanden ist

Das Projekt begann als `OKF_MD_LOG` — ein Server, der Chats mitschreibt. Im Verlauf
kamen drei Einsichten dazu, die den Charakter verändert haben:

Erstens die **Denkflüsse**: Modelle wie DeepSeek-R1 oder o1 liefern ihren
Gedankengang mit. Der ist wertvoller als die Antwort, weil er zeigt, an welcher
Stelle ein Prompt hätte präziser sein müssen.

Zweitens die **Trennung von Dashboard und Journal**: Wer nachschlagen will, soll
nicht erst einen Server starten müssen.

Drittens der **Name**. Aus einem Werkzeug, das Chats speichert, wurde ein Werkzeug
für Prompt-Engineering — und damit *PromptEngineer*.

---

## Was noch offen ist

- **Agenten-/Skill-/Workflow-/Prompt-Bibliothek.** Die im Journal bereits
  gesammelten Ausschnitte zu wiederverwendbaren Prompts, Agenten-Anweisungen und
  Workflows machen — noch nicht begonnen.
- **Logo und visuelle Identität.** Noch keine Markenentscheidung getroffen.
- **Offizielle Export-Parser.** Die eigenen Export-Formate der Anbieter (z. B.
  ChatGPTs `conversations.json`) als vierter, zuverlässigerer Importweg neben
  Paste/Lesezeichen/Extension.
- **Echte Daten.** In `Chats_LMM/` liegen bisher nur eine Handvoll eingeordneter
  Dateien aus wenigen Gemini-Projekten; getestet wurde ansonsten mit Mock-Daten und
  echten Exporten über synthetische und reale Referenzdatensätze.
- **Auswertung.** Sobald genug Material da ist: Welche Formulierungen führen
  zuverlässig zu brauchbaren Antworten? Welches Modell taugt wofür?

Erledigt, Stand 25.08.2026: Ein manueller Import-Weg existiert — ein
Einfüge-Dialog mit Dopplerkontrolle, ein Ein-Klick-Lesezeichen, das eine Chat-Seite
bis zum Verlaufsanfang hochscrollt, bevor es den Text kopiert, und eine
Browser-Erweiterung (`extension/`), die dasselbe tut, aber direkt an einen
offenen Journal-Tab liefert. Nichts läuft automatisch oder im Hintergrund,
nirgends werden Zugangsdaten gespeichert.
