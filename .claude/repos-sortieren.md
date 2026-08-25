# Repos sortieren — vor der Lizenzentscheidung

- **Stand:** 23.08.2026
- **Warum zuerst:** Die Lizenz wird je Repo vergeben. Solange unklar ist, welche
  Repos es künftig gibt, wird sie an der falschen Stelle vergeben.
- **Erhoben über:** öffentliche GitHub-API, 23.08.2026

---

## Bestand

**Konto `ThaiJenspacito`** (id 207888413, seit 16.04.2025) — 10 eigene, 7 Forks

| Repo | ★ | Größe | letzter Push | Befund |
|---|---|---|---|---|
| `OKF_MD_Master` | 0 | 646 kB | 23.08. | **das Hauptprojekt**, einziges aktives |
| `Hausverwaltung` | 0 | 0 kB | 21.07. | leer |
| `okf-evolution-framework` | 1 | 22 kB | 20.07. | eigenes Thema: „Agentic planner in OKF Format" |
| `ideal-barnacle_md_okf` | 1 | 0 kB | 16.07. | leer, Beschreibung dupliziert `OKF_MD_Master` |
| `Laundrylist-` | 0 | 74 kB | 15.07. | Wäscherei Thailand |
| `SaaS-Themplate` | 0 | 2.072 kB | 06.07. | größtes Repo, MIT, Name enthält Tippfehler |
| `Laundry-List` | 0 | 74 kB | 02.07. | Dublette zu `Laundrylist-` |
| `LaundryList` | 0 | 1 kB | 01.07. | praktisch leer |
| `Aufgabenplanung` | 1 | 0 kB | 30.06. | leer, Beschreibung dupliziert `SaaS-Themplate` |
| `TextDancer` | 0 | 63 kB | 24.02. | „animierter Text" |

**Konto `Jenspacito`** (id 130212717, seit 08.04.2023) — 3 eigene, 6 Forks.
Alle drei seit 2023/2024 unberührt, zwei davon leer. **Null Commits in
`OKF_MD_Master`** — der Name auf 47 Commits dort ist nur ein falsch gesetztes
`user.name`, die E-Mail dahinter gehört zu `ThaiJenspacito`.

**Organisation `SaaS-Comunity-Thailand`** (id 305827614, angelegt 16.07.2026) —
enthält genau einen Fork von `OKF_MD_Master` mit einem einzigen Commit vom
16.07., ohne gemeinsamen Vorfahren zur heutigen Historie.

**Nicht auf GitHub:**

| Projekt | Zustand |
|---|---|
| `C:\DEV\OKF_MD_LOG` | kein Git-Repo, nie veröffentlicht — hier liegen Server, Dashboard, Extension und `SKILL.md` |
| `C:\DEV\Dribble_Journal_Filter` | kein Git-Repo, nie veröffentlicht — **das eigentliche Schaufenster** |

---

## Zwei Beobachtungen, die den Plan bestimmen

**1 · Die Sterne sitzen auf den leeren Repos.** Alle vier Sterne verteilen sich auf
`ideal-barnacle_md_okf` (0 kB), `Aufgabenplanung` (0 kB), `Translation4all` (0 kB)
und `okf-evolution-framework` (22 kB). Die beiden größten Projekte haben null. Leere
Repos mit Sternen wirken auf jeden, der genauer hinsieht, schlechter als gar keine —
sie lesen sich wie gekaufte oder getauschte Sterne.

**2 · Das beste Stück ist nicht veröffentlicht.** Die Journal-App läuft, filtert
1.200 Chats in unter einer Millisekunde, ist zweisprachig und braucht keinen Server.
Sie ist eine einzelne HTML-Datei — der denkbar niedrigste Einstieg für jemanden, der
sie ausprobieren will. Sie liegt nicht einmal unter Versionsverwaltung.

---

## Plan

### Schritt 1 · Aufräumen — **am 24.08.2026 größtenteils erledigt**

> **Erledigt auf `ThaiJenspacito`:** die vier leeren Repos gelöscht
> (`Hausverwaltung`, `ideal-barnacle_md_okf`, `Aufgabenplanung`, `LaundryList`),
> die 7 Forks gelöscht (`Antigravity-Shit-Chat`, `antigravity_phone_chat`,
> `chat-ui`, `LiteRT-LM`, `OmniRoute`, `openworker`,
> `the-book-of-secret-knowledge`), der Fork der Organisation
> `SaaS-Comunity-Thailand/OKF_MD_Master` gelöscht, `Laundrylist-` zu
> `Laundrylist` umbenannt und die ältere Dublette `Laundry-List` gelöscht.
>
> **Offen auf `Jenspacito`** (Konto-ID 130212717, seit 08.04.2023 — nicht zu
> verwechseln mit `Jenspacito2024`, einem dritten, unabhängigen Konto des
> Nutzers seit Juni 2024): die 6 Forks (`gpt-engineer`, `Flowise`,
> `FlowiseChatEmbed`, `docker-debian-artifacts`, `official-images`,
> `wa-crypt-tools`) sind noch da. Grund: der Nutzer kennt die zum Konto
> gehörende E-Mail-Adresse nicht mehr und kann sich nicht anmelden — braucht
> vermutlich eine GitHub-Kontowiederherstellung, bevor das nachgeholt werden
> kann. Nicht dringend: `ThaiJenspacito` ist das aktive Profil, `Jenspacito`
> spielt für die Außenwirkung kaum eine Rolle.

<details><summary>ursprünglicher Plan</summary>



**Löschen** (leer, kein Inhalt zu verlieren):
`Hausverwaltung` · `ideal-barnacle_md_okf` · `Aufgabenplanung` · `LaundryList`

Die zwei Sterne auf `ideal-barnacle_md_okf` und `Aufgabenplanung` gehen dabei
verloren. Das ist der Punkt — sie stehen auf leeren Hüllen und schaden mehr, als
sie nützen.

**Zusammenführen:** `Laundry-List` und `Laundrylist-` sind beide 74 kB.
`Laundrylist-` ist neuer — behalten, umbenennen (der Bindestrich am Ende ist ein
Versehen), `Laundry-List` archivieren.

**Forks archivieren oder löschen:** 13 Stück über beide Konten
(`gpt-engineer`, `Flowise`, `official-images`, `the-book-of-secret-knowledge`,
`chat-ui`, `LiteRT-LM` …). Sie machen aktuell die Hälfte beider Profile aus. Wer
das Profil zur Bewertung öffnet, sieht zuerst fremde Projekte.

**Fork der Organisation löschen.** Ein Commit vom ersten Tag, ohne Bezug zur
heutigen Historie. Auf Schlüsselmuster geprüft — sauber, aber wertlos.

**Konten:** `Jenspacito` liegen lassen, alles Weitere unter `ThaiJenspacito`. Die
Trennung Thailand/international bringt auf GitHub nichts — dort gibt es keine
regionalen Märkte und keine Länderranglisten, nur ein geteiltes Profil.

**24 Commits nachträglich zuordnen:** `happygoatlamplaymat@gmail.com` (mit **ay**,
Tippfehler gegenüber der echten Adresse mit **ai**) als verifizierte Zweitadresse
bei `ThaiJenspacito` eintragen. GitHub ordnet vergangene Commits rückwirkend zu, aus
73 sichtbaren werden 97. Setzt voraus, dass das Postfach erreichbar ist; sonst bleibt
`.mailmap` oder ein weiterer `filter-repo`-Lauf.

### Schritt 2 · Den Namen entscheiden — **am 23.08.2026 erledigt**

> **Entschieden:** Produktname bleibt `PromptEngineer`. Der OKF-Name bleibt ebenfalls —
> die Annäherung an Googles Standard ist gewollt, das Format wechselt auf den
> Verzeichnisbaum. Damit ist der Engpass aufgelöst; Schritt 3 kann laufen.
>
> Offen bleibt allein, wie die **Repos** heißen sollen: `OKF_MD_Master` ist ein
> Dateiname, kein Produktname. Naheliegend wäre `promptengineer-*` als gemeinsames
> Präfix.

<details><summary>ursprüngliche Fassung</summary>


Punkt 2 der Richard-Liste (Namensgleichheit mit Googles „Open Knowledge Format"
vom 12.06.2026) war bisher der zweite Punkt. Er rückt nach vorn, weil Schritt 3
davon abhängt: Ein Repo nach der Veröffentlichung umzubenennen kostet Links,
Sterne-Historie und Suchtreffer.

Zu klären in einem Zug:
- Bleibt es bei „OKF" oder braucht das Format einen eigenen Namen?
- Wie heißt das Produkt — `OKF_MD_Master` ist ein Dateiname, kein Produktname.
- Wird `okf-evolution-framework` (22 kB, „Agentic planner") Teil davon oder bleibt
  es ein getrenntes Experiment?

</details>

### Schritt 3 · Das Journal veröffentlichen

Das ist der Schritt, der tatsächlich etwas bewirken kann:

1. `git init` im Journal-Verzeichnis — es steht bisher unter keiner Versionsverwaltung
2. Eigenes Repo unter `ThaiJenspacito`
3. `index.html` über GitHub Pages ausliefern → **Demo ohne Installation**
4. README mit Screenshot oder GIF ganz oben, ein Satz zum Problem, Link zur Demo

Die eingebauten Demodaten (1.200 Chats, 10 Modelle) sind dafür genau richtig — man
klickt und sieht sofort etwas.

### Schritt 4 · Erst dann die Lizenz

Je Repo, nicht pauschal. Die Vorarbeit steht in
[entscheidungen-richard.md](entscheidungen-richard.md) Punkt 1: AGPL-3.0 für den
offenen Teil, BUSL-1.1 als strengste rückholbare Alternative, MIT nur bewusst und
endgültig.

Bis dahin bleibt `OKF_MD_Master` ohne `LICENSE`-Datei. Das ist rechtlich „alle
Rechte vorbehalten" und bis auf Weiteres in Ordnung — es widerspricht aber dem
MIT-Badge in der README. **Das Badge sollte sofort raus**, unabhängig von allem
anderen: Es behauptet eine Erlaubnis, die nicht existiert.

---

## Reihenfolge

1. Aufräumen (Schritt 1) — keine Entscheidung nötig, wirkt sofort
2. MIT-Badge aus der README entfernen — ein Handgriff, beseitigt einen Widerspruch
3. Namen entscheiden (Schritt 2) — blockiert alles Weitere
4. Journal veröffentlichen (Schritt 3) — der eigentliche Hebel
5. Lizenz je Repo (Schritt 4)
