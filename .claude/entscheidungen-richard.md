# Offene Entscheidungen — Besprechung mit Richard

Stand: 23.08.2026 · zusammengetragen aus der Arbeit am Journal und einer Durchsicht
von `OKF_MD_Master`, `OKF_MD_LOG` und `md_files/SKILL.md`.

Sortiert nach Dringlichkeit. Punkt 1 blockiert mehrere andere.

---

## 1 · Lizenz — vor allem anderen

**Zustand:** `OKF_MD_Master` ist öffentlich, trägt ein MIT-Badge in der README,
hat aber **keine `LICENSE`-Datei**. Juristisch heißt das „alle Rechte vorbehalten" —
niemand darf es rechtssicher verwenden. Badge und Wirklichkeit widersprechen sich.

**Warum das jetzt entschieden werden muss:** Alle 96 Commits stammen von Jens
allein. Solange das so ist, ist die Lizenz frei wählbar. Sobald der erste fremde
Beitrag angenommen wird, braucht jede Änderung dessen Zustimmung.

**Optionen**

| | Folge |
|---|---|
| **MIT** | maximale Verbreitung. Jeder darf eine gehostete Version bauen und verkaufen — auch ein Wettbewerber. Die Enterprise-Pläne verlieren ihren Hebel. |
| **AGPL-3.0** | Open Core. Wer die Software als Dienst betreibt, muss seinen Quellcode offenlegen. Für Selbsthoster egal, für Firmen ein Ausschlusskriterium — die kaufen dann eine kommerzielle Lizenz. So arbeiten Sentry, Grafana, GitLab, Mattermost. Kostet vielleicht ein paar Sterne. |
|xxxx==== das  **proprietär, Quelle einsehbar** | volle Kontrolle, aber kaum Community und kaum Sterne. |

**Zu bedenken:** Der Wechsel MIT → AGPL ist praktisch unmöglich, weil jeder Fork
unter MIT bestehen bleibt. Umgekehrt geht es. Wer sich nicht sicher ist, wählt
zunächst das Strengere.

**Falls AGPL:** Es braucht eine Beitragsvereinbarung (CLA oder DCO), sonst lassen
sich fremde Beiträge später nicht kommerziell lizenzieren.

- [ ] Lizenz gewählt: ______________
- [ ] `LICENSE`-Datei angelegt, Badge angeglichen
- [ ] Beitragsvereinbarung nötig? ja / nein

---

## 2 · OKF — Namensgleichheit mit Googles Standard

**Zustand:** Google Cloud hat am **12. Juni 2026** ein „Open Knowledge Format"
veröffentlicht, inzwischen v0.2
([Spezifikation](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)).
Ein OKF-Bündel ist dort ein **Verzeichnisbaum aus Markdown-Dateien mit
YAML-Frontmatter**, ein Konzept je Datei, optional `index.md` und `log.md`.

Unser `raw.okf.json` / `data.okf.json` sind JSON-Arrays. Gleicher Name, anderes
Format.

**Die gute Nachricht:** Die Spezifikation sagt ausdrücklich, Typwerte würden *nicht*
zentral registriert — „descriptive and self-explanatory" genügt. `MOTIV`, `FUND`,
`WEG`, `WAND`, `SETZUNG`, `ZWEIFEL` sind damit vollkommen konforme OKF-Typen. Das
Konzept müsste nicht aufgegeben, nur anders verpackt werden.

| heute | OKF |
|---|---|
| ein JSON-Array | ein Verzeichnis, eine `.md` je Eintrag |
| JSON-Felder | YAML-Frontmatter |
| `ref: "e05"` | Markdown-Link `[…](/e05.md)` |
| `VERLAUF.md` | `log.md` — die Spezifikation sieht genau das vor |
| `kategorie: Rot` | `tags` |

**Was ein Wechsel zusätzlich bringt:** Dasselbe Verzeichnis wäre gleichzeitig ein
**Obsidian-Vault** (Graph-Ansicht der Argumentationsstränge, Backlinks umsonst) und
entspräche **Karpathys LLM-Wiki-Muster**, das seit April 2026 kursiert und dieselbe
Dreiteilung hat: `raw/` unveränderlich, `wiki/` verdichtet, `CLAUDE.md` als Schema.

Drei unabhängige Quellen — Richards Skill, Googles OKF, Karpathys Muster — kommen
auf dieselbe Struktur. Das ist ein Argument, das sich gegenüber Dritten verwenden
lässt.

**Zeitpunkt:** Der Standard ist zwei Monate alt, unsere Daten sind winzig (12
Einträge im Verlauf, 4 im Projekt). Heute kostet der Wechsel fast nichts, in einem
Jahr wird er zur Migration.

- [ ja] War die Namensgleichheit Absicht — sollte das Format ohnehin dorthin?
- [ ja] Auf das Verzeichnisformat wechseln? ja / nein / später
- [ ] Falls nein: eigenen Namen wählen, um Verwechslung zu vermeiden

---

## 3 · `compactor.js` weicht von `SKILL.md` ab

**Vier** Abweichungen, alle in derselben Datei. Die Spezifikation ist `md_files/SKILL.md`,
die Umsetzung `OKF_MD_LOG/compactor.js`.

> Ausführliche Gesprächsgrundlage mit Codestellen und Messwerten:
> [gespraech-richard-compactor.md](gespraech-richard-compactor.md)

**a) Die Strang-Suche läuft rückwärts — am 23.08.2026 nachträglich gefunden.**
In den Daten zeigt `ref` vom neueren auf den älteren Eintrag (`e04 WAND → e03 WEG`).
`findClosedStrand()` startet beim WEG und folgt den *ausgehenden* Verweisen, sucht die
Wand also in der Vergangenheit, wo sie nie liegen kann.

Folge: **Die Regeln 2 und 3 feuern nie.** Das sind die einzigen beiden, die
zusammenziehen — übrig bleiben nur die Lösch-Regeln 6 und 7. Der Compactor verdichtet
also nicht, er kürzt. Belegt an `TestProjekt`: der Strang `e03 WEG → e04 WAND` müsste
nach Regel 2 auf 3 Einträge fallen, der Trockenlauf zeigt 4 → 4.

Diese Abweichung wiegt am schwersten, weil der Unterschied zwischen dem Skill und einer
gewöhnlichen Zusammenfassung genau an den zwei Regeln hängt, die nicht laufen.

**b) Kein Altersbezug.** SKILL.md sieht vier Altersstufen vor, deren jüngste — die
laufende Sitzung — wörtlich stehen bleibt. `compactor.js` verdichtet sofort, auch
frisch Geschriebenes. Das widerspricht der Kernidee direkt:

> „Ein Eintrag wird in dem Zustand des Nichtwissens geschrieben, in dem er entsteht."

Wer sofort verdichtet, tut genau das, was eine Zusammenfassung tut.

**c) `isFolgenlos()` schützt nur `MOTIV`.** Damit entfernt Regel 7 auch `WAND`- und
offene `ZWEIFEL`-Einträge, die nach den Regeln 5 und 7 stehenbleiben müssten.

Das inhaltliche Argument wiegt schwerer als der Verweis auf die Spezifikation: Eine
WAND ist *per Definition* folgenlos — niemand baut auf einer gescheiterten Sache
auf, deshalb hat sie keinen eingehenden Verweis. Ein offener ZWEIFEL ebenso. Die
Regel trifft also nicht gelegentlich eine Wand, sondern **systematisch alle** —
genau die Typen, die den Skill von einer Zusammenfassung unterscheiden.

**d) Verweise werden nach der Verdichtung nicht nachgezogen** und zeigen ins Leere.

**Trockenlauf mit den echten Daten** (`tools/dry-compaction.mjs`, schreibt nichts):
`Gemini/Blödeleini` fiele von **4 auf 0 Einträge** — das ganze Projekt verschwände,
inklusive eines ZWEIFEL.

**Dringlichkeit:** `runCompaction()` überschreibt `data.okf.json` und `VERLAUF.md`
an Ort und Stelle und setzt sie auf `0444`. Keine Sicherung, keine Historie. Was ein
Lauf wegnimmt, ist weg — und man merkt es erst Monate später, wenn die Wand fehlt,
die einen zweiten Anlauf verhindert hätte.

Die Punkte b, c und d sind im Journal bereits umgesetzt und getestet
(`compactByAge()`, `KEEP_ALWAYS`, `relinkRefs()`) — der Code ließe sich übernehmen.
Punkt a betrifft das Journal nicht, weil es die Stränge über die eingehenden Verweise
bildet.

- [ ] Zeigt `ref` vom neueren auf den älteren Eintrag? Falls ja, ist a ein Zeilen-Fix;
      falls nein, schreiben die Erzeuger falsch herum.
- [ ] War die Abweichung Absicht?
- [ ] Angleichen? ja / nein
- [ ] Falls ja: wer macht es, und braucht `runCompaction` vorher eine Sicherung?

---

## 4 · Produktbild

**a) Plattform.** „In-App-Käufe" heißt je nach Antwort etwas anderes: Web (Stripe
oder Paddle, wenige Prozent, freie Gestaltung) · Mobile (15–30 % an Apple/Google,
deren Regeln schreiben die Abwicklung vor) · Desktop (eigenes Lizenzsystem).

**b) Trennlinie frei/kommerziell.** Was ist kostenlos, was kostet? Naheliegend wäre:
lokal und offline umsonst, Server, Synchronisation und Auswertung kosten. Das sollte
feststehen, bevor Code entsteht — es bestimmt, wo die Trennung im System verläuft.

**c) Wie viele Produkte?** Aktuell drei Projekte:

| Projekt | Rolle |
|---|---|
| `OKF_MD_Master` | Konverter: beobachtet Ordner, reichert mit Frontmatter an |
| `OKF_MD_LOG` | Server, Dashboard, Extension, Auto-Tagger |
| Journal (Prototyp) | Anzeige, Filter, Export |

Für GitHub-Sterne ist ein klar umrissenes Projekt stärker als drei halbe. Die Frage
ist, ob das ein Produkt mit Bausteinen wird oder drei getrennte.

**d) Der Prototyp als Schaufenster.** Die Single-File-HTML des Journals lässt sich
auf GitHub Pages stellen — jemand liest die README, klickt auf „Demo", probiert es
**sofort** ohne Klonen, npm oder Docker. Diese Hürde ist der häufigste Grund, warum
gute Projekte keine Sterne bekommen. Die eingebauten Demodaten sind dafür genau
richtig.

- [ ] Plattform: ______________
- [ ] frei/kommerziell: ______________
- [ ] ein Produkt oder drei? ______________
- [ ] Demo auf GitHub Pages? ja / nein

---

## 5 · Datenschutz, sobald Fremde hochladen

**a) Unveränderlichkeit trifft auf Löschpflicht.** Das ganze Prinzip lautet:
Einträge werden nie verändert, nie gelöscht, `0444`. Sobald fremde Nutzer ihre Chats
hochladen, greift die DSGVO — und die gibt jedem das Recht auf Löschung.

Das ist auflösbar, aber die Auflösung gehört ins Fundament: Unveränderlich heißt
dann „innerhalb eines Journals kann niemand nachträglich glattziehen", nicht „nichts
verschwindet jemals". Ein Journal als Ganzes muss löschbar sein. Nachträglich
eingebaut wird das teuer.

**b) Zugangsdaten in fremden Chats.** Chatverläufe enthalten regelmäßig
API-Schlüssel — bei uns selbst nachweislich. Wer fremde Chats entgegennimmt, lädt
zwangsläufig fremde Schlüssel auf seinen Server. Damit wird die Prüfung von einer
Bequemlichkeit zur Sorgfaltspflicht.

Im Journal ist ein Prüfer bereits eingebaut (16 Muster, drei Dringlichkeitsstufen,
Maskierung bei Erhalt der Lesbarkeit).

**c) Wo läuft der Server?** Standort bestimmt die anwendbaren Regeln.
Auftragsverarbeitung, Löschkonzept, Protokollierung.

- [ ] Löschkonzept: wie? ______________
- [ ] Prüfung auf Zugangsdaten verpflichtend beim Upload? ja / nein
- [ ] Serverstandort: ______________

---

## 6 · Kleinigkeiten — kann Jens allein erledigen

Keine Entscheidungen, nur Aufräumen. Zur Vollständigkeit hier gelistet.

- [x] ~~**Private Handynummer** an fünf Stellen~~ — am 23.08.2026 erledigt.
      Commit `91190cb` „chore: WhatsApp-Kontakt mit privater Rufnummer entfernt".
      Nachgemessen: weder `wa.me` noch die Ziffernfolge stehen noch im
      Arbeitsbaum. Für die Historie liegt `C:\DEV\wa-ersetzen.txt` bereit
      (`git filter-repo --replace-text`) — **offen ist nur, ob die Historie
      damit schon umgeschrieben wurde.** Das kann nur Jens beantworten.
- [ ] **Discord-Badge** verweist auf `#` — toter Link. Entfernen oder Einladung
      hinterlegen.
- [ ] **Marketplace-Badge** verweist auf die generische GitHub-Marketplace-Seite.
      Irreführend, solange das Produkt dort nicht gelistet ist.
- [ ] **Vier Git-Identitäten** in der Historie (`Jenspacito`, `ThaiJenspacito`,
      `happygoatlamplaymat`, `Jens Becker`). Für die Zukunft vereinheitlichen:
      `git config --global user.name` und `user.email` auf die
      noreply-Adresse setzen.
- [x] ~~Zugangsdaten in der Git-Historie~~ — am 23.08.2026 erledigt, alle fünf
      Schlüssel widerrufen und nachgemessen, Historie bereinigt. Siehe
      `notfall-secrets-im-repo.md`.

---

## 7 · Import aus den einzelnen Chat-Anbietern

**Zustand:** Die Kette steht, aber nur ein Anbieter liefert bisher Daten.

1. `tools/find-chats.mjs` durchsucht genannte Ordner, erkennt Chat-Exporte **am
   Inhalt** (Quell-URL, Titel-Präfix wie `[GEMINI]`, das Muster aus User-Prompt
   und Response) und kopiert sie nach `Chats_LMM/<Modell>/`.
2. Die App nimmt per Drag & Drop **ganze Ordnerbäume** entgegen
   (`collectFiles()`, `index.html:3172`); der Ordnername wird zur
   Modellzuordnung. Erkannt werden vier Formate: der eigene Markdown-Export,
   `data.okf.json`, `raw.okf.json` und `VERLAUF.md`.
3. **Neun von zehn Modellordnern sind leer.** Inhalt haben nur `Gemini/`
   und `Unbekannt/`.

Der Import ist also nicht das Problem — es fehlt **je Anbieter ein Adapter**
auf dessen Exportformat. `parseOkfJson()` kennt heute drei Gestalten: OKF
typisiert, OKF flach, und allgemein gruppierte Chats mit `turns`/`messages`.
Ein ChatGPT-Export fällt in keine davon.

**Die erste Entscheidung — was mit den verworfenen Ästen passiert.** Nach
meinem Stand ist ChatGPTs Export kein Verlauf, sondern ein Baum: die
Nachrichten liegen als Knotenkarte mit Eltern-Zeigern, weil jede neu erzeugte
Antwort einen Ast aufmacht. (Vor dem Bauen an einem echten Export prüfen — die
Anbieter ändern ihre Formate.) Ein flaches `turns`-Array daraus zu machen ist
eine Entscheidung, keine Übersetzung: Welcher Pfad ist „der" Verlauf?

Für dieses Projekt ist das eher Chance als Problem. Verworfene Antworten sind
Material fürs Prompt-Engineering — dieselbe Frage, zwei Ausgänge — und die App
zeigt Verläufe ohnehin als Baum. Nur muss es bewusst entschieden werden,
statt die Äste stillschweigend wegzuwerfen.

**Die zweite Entscheidung — rückwirkend typisieren, ja oder nein.** Ein
Massenimport bringt Rohtext ohne OKF-Typ und ohne Ampel; alles landet als
`CHAT`. Die naheliegende Reaktion wäre, nachträglich über die ganze Historie
zu typisieren. Dagegen spricht der Satz, auf dem `SKILL.md` aufbaut: *„Ein
Eintrag wird in dem Zustand des Nichtwissens geschrieben, in dem er
entsteht."* Rückwirkend zu typisieren heißt, mit dem Wissen von heute zu
entscheiden, was damals ein `WEG` und was eine `WAND` war — also genau die
Zusammenfassung zu erzeugen, die das Format vermeiden will. Möglich, dass
Altbestände schlicht `CHAT` bleiben und die typisierte Ebene erst ab dem
laufenden Betrieb greift.

Beantwortet sein sollte das **vor** dem ersten großen Import; danach wird es
teuer.

- [ ] Welche Anbieter zuerst? (nach tatsächlicher Nutzung, nicht alle zehn auf Vorrat)
- [ ] Verworfene Antwort-Äste: mitnehmen, verwerfen, oder als eigene Einträge?
- [ ] Altbestände rückwirkend typisieren? ja / nein / erst ab Stichtag
- [ ] Hauptweg auf Dauer: Browser-Extension oder Server-Mitschnitt?

---

## Reihenfolge, die ich vorschlagen würde

1. **Lizenz** (Punkt 1) — blockiert Punkt 4, und je später, desto unumkehrbarer
2. **OKF-Format** (Punkt 2) — je später, desto teurer
3. **compactor.js** (Punkt 3) — bevor echte Daten hineinlaufen
4. **Import-Adapter** (Punkt 7) — die beiden Entscheidungen darin vor dem
   ersten großen Import, danach werden sie teuer
5. Produktbild und Datenschutz (Punkte 4 und 5) — vor dem ersten zahlenden Nutzer

---

# Leitfaden zum Gespräch

Nachtrag vom 23.08.2026, nachmittags. Die Punkte oben sind die Sache, dieser
Abschnitt ist der Fahrplan: in welcher Reihenfolge, was Richard tatsächlich
entscheiden muss, und was seit der ersten Fassung dazugekommen ist.

## Was vorher zu wissen ist

**Drei Fragen hängen aneinander, obwohl sie getrennt dastehen.** Punkt 2
(Verzeichnisformat) und Punkt 3 (`compactor.js`) sind dieselbe Frage in zwei
Gestalten: einmal als Datenformat, einmal als Codefehler. Beide drehen sich
darum, dass `ref` **vom neueren auf den älteren** Eintrag zeigt und die
interessante Richtung deshalb die **eingehende** ist — „was baut hierauf auf".
`findClosedStrand()` folgt heute den ausgehenden Verweisen und sucht die Wand
in der Vergangenheit, wo sie nie liegen kann. Im Verzeichnisformat wäre genau
diese Ansicht geschenkt: Obsidians Backlink-Panel *ist* die Liste der
eingehenden Verweise. Wer Punkt 2 mit ja beantwortet, hat einen Teil von
Punkt 3 nebenbei gelöst.

**Karpathys LLM-Wiki-Muster ist keine offene Entscheidung.** Es taucht in
diesem Dokument nur an zwei Stellen auf (Punkt 2), und zwar als *Beleg*, nicht
als Vorschlag: drei unabhängige Quellen — Richards Skill, Googles OKF,
Karpathys Muster — kommen auf dieselbe Dreiteilung. Es gibt dazu keinen
Haken, nichts zu beschließen. Falls jemand im Gespräch danach fragt: die
Aussage ist „unsere Struktur ist keine Privatidee", mehr nicht. Nicht zu
verwechseln mit dem Skill `andrej-karpathy` in `C:\DEV\nowPayDee` — der
enthält Programmierregeln und hat mit dem Wiki-Muster nichts zu tun.

## Reihenfolge und Ziel je Punkt

| # | Thema | Was Richard entscheiden muss | Ziel des Gesprächs |
|---|---|---|---|
| 1 | Lizenz | welche Lizenz, Beitragsvereinbarung ja/nein | eine Zeile, die in `LICENSE` kann |
| 2 | OKF-Verzeichnisformat | wechseln / später / eigener Name | ja oder nein, kein „prüfen wir mal" |
| 3 | `compactor.js` | A–D einzeln, Sicherung, wer macht es | Freigabe zum Angleichen |
| 4 | Produktbild | Plattform, frei/kommerziell, eins oder drei | grobe Richtung reicht |
| 5 | Datenschutz | Löschkonzept, Pflichtprüfung, Serverstandort | erst nötig, wenn Fremde hochladen |
| 7 | Import-Adapter | Anbieter-Reihenfolge, verworfene Äste, rückwirkend typisieren | die zwei inhaltlichen Fragen, nicht die Technik |

Punkt 1 zuerst, weil er Punkt 4 blockiert und mit jedem Tag unumkehrbarer
wird. Punkt 2 als zweites, weil der Wechsel bei 12 bzw. 4 Einträgen heute
fast nichts kostet und in einem Jahr eine Migration ist. Punkt 3 vor dem
ersten echten Datenlauf — `runCompaction()` schreibt an Ort und Stelle
zurück und setzt auf `0444`, ohne Sicherung.

## Was seit der ersten Fassung dazugekommen ist

**NotebookLM: eine Datei ist eine Quelle.** Der Export in der Journal-App
(`toNotebookLM()`, `index.html:2201`) bündelt alle gefilterten Chats in *eine*
Markdown-Datei mit `## Quelle N:`-Überschriften. Für NotebookLM ist das
trotzdem eine einzige Quelle — die Überschriften sind für den Dienst nur Text,
und jede Zitatmarke zeigt auf die ganze Datei statt auf den einzelnen Chat.
Das schont das Quellenkontingent, kostet aber die Rückverfolgbarkeit. Eine
Datei pro Chat wäre die Alternative. Abwägung, keine Fehlfunktion — aber eine
Entscheidung, die noch niemand bewusst getroffen hat.

**Ein Obsidian-Vault liegt bereits im Master-Repo.** Unter
`OKF_MD_Master/src/archive/3_okf_vault/` steht ein `.obsidian`-Verzeichnis samt
`Unbenannt.canvas`. Punkt 2 ist damit weniger theoretisch, als er sich liest —
die Frage ist eher, ob das Vorhandene der Anfang des Zielformats ist oder ein
Überbleibsel. Wert, im Gespräch kurz zu klären.

**Punkt 6 ist kleiner geworden.** Die private Handynummer ist raus (siehe
Punkt 6). Übrig bleiben der tote Discord-Badge (`README.md:23`, Ziel `#`), der
irreführende Marketplace-Badge (`README.md:12`, Ziel: generische
Marketplace-Seite) und die vier Git-Identitäten.

**Im Master-Repo liegt eine verschachtelte Kopie seiner selbst.**
`OKF_MD_Master/OKF_MD_Master/` enthält einen vollständigen zweiten Abzug,
inklusive `node_modules`, und ist in `git status` als unversioniert gelistet.
Vermutlich ein verunglücktes Kopieren. Sollte weg, bevor jemand darin
arbeitet und sich fragt, welche Fassung gilt.

## Zurückgestellt — nicht Gegenstand dieses Gesprächs

**Graph-Ansicht in der Journal-App.** Am 23.08.2026 besprochen, dann bewusst
hintangestellt. Festgehalten, damit die Überlegung nicht verloren geht:

- Die Daten liegen bereits — `parseOkfTyped()` hängt jedem Eintrag `okfId`,
  `ref` und `refBy` an (`index.html:1240`) und baut die `incoming`-Map. Ein
  Graph wäre reine Darstellung, keine Datenarbeit.
- Vorgeschlagenes Layout: **Zeitachse mit Spuren**, nicht Obsidians
  Force-Layout. Der `ref`-Graph ist ein zeitlich geordneter DAG; ein
  Force-Layout wirft die einzige Achse weg, die Bedeutung trägt. Die
  Verdichtungsregeln beziehen sich ohnehin auf Stränge — und ein Strang
  *ist* eine Spur.
- Zwei Orte: der Strang beim einzelnen Eintrag im Baum, und die Vollansicht
  auf einer eigenen Seite. Jens' Vorgabe für die Vollansicht: eigene,
  verlinkte Seite statt eingebettet. Mein Einwand dazu — der Korpus lebt nur
  im Arbeitsspeicher, eine zweite `.html` startet leer; eine Route
  (`index.html#graph`) leistet dasselbe ohne zweite Datei.
- Der eigentliche Nutzen läge nicht in der Optik: `compactOkf()` ist bereits
  in der App portiert (`index.html:2029`). Markiert man im Graphen, was ein
  Verdichtungslauf entfernen würde, wird der Trockenlauf aus
  `tools/dry-compaction-report.md` zum Bild — und das Argument aus Punkt 3
  („eine WAND hat per Definition keinen eingehenden Verweis") muss niemand
  mehr erklären.

Offen geblieben: Achse waagerecht oder senkrecht, Filter abblenden oder
ausblenden, und ob der Strang im Baum neben der Vollansicht bestehen bleibt.

---

## Notiz zur Arbeitsteilung

An `OKF_MD_Master` und `OKF_MD_LOG` wird von hier aus nichts geändert — die
Befunde oben stammen aus reinem Lesen. Änderungen dort macht Jens selbst.
