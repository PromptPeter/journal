# Notfall: Zugangsdaten sind im Repo gelandet

Anleitung aus dem echten Fall vom 23.08.2026 — `ThaiJenspacito/OKF_MD_Master`,
fünf Schlüssel in einer eingecheckten `.env`, öffentliches Repo.

**Die Reihenfolge ist wichtig.** Wer zuerst die History säubert und dann die
Schlüssel widerruft, hat die Zeit dazwischen verschenkt.

---

## 1 · Zuerst: alle Schlüssel widerrufen

Das ist der einzige Schritt, der wirklich schützt. Alles andere ist Aufräumen.

Ein Schlüssel, der einmal öffentlich stand, ist verbrannt — auch wenn er
Sekunden später entfernt wurde. Es gibt Bots, die GitHub gezielt nach diesen
Mustern absuchen.

| Dienst | Wo |
|---|---|
| GitHub, klassisch | github.com/settings/tokens |
| GitHub, feingranular | github.com/settings/personal-access-tokens |
| Google / Gemini | aistudio.google.com/apikey |
| OpenRouter, normal | openrouter.ai/settings/keys |
| **OpenRouter, Provisioning** | **openrouter.ai/settings/provisioning-keys** |
| DeepSeek | platform.deepseek.com/api_keys |
| Telegram | in der App an @BotFather: `/revoke` |

### Fallstrick, der uns fast entwischt wäre

**Provisioning-Keys stehen woanders.** Bei OpenRouter liegen sie in einem
eigenen Bereich, nicht unter „Keys". Genau der war bei uns noch aktiv, nachdem
alles andere erledigt schien — und ausgerechnet der ist der gefährlichste, weil
er *neue* Schlüssel ausstellen darf. Wer ihn hat, legt sich beliebig viele
normale Schlüssel an, die auch dann noch funktionieren, wenn der Provisioning-Key
später gelöscht wird.

Nach dem Löschen deshalb prüfen, ob in der normalen Schlüsselliste Einträge
stehen, die man nicht selbst angelegt hat.

---

## 2 · Nachmessen statt glauben

Anwendbar auf jeden Dienst: ein lesender API-Aufruf, der bei gültigem Schlüssel
`200` und bei widerrufenem `401` liefert. `tools/check-keys.mjs` erledigt das
und gibt **niemals** die Schlüsselwerte aus, nur den Status.

```
node tools/check-keys.mjs <pfad-zum-repo>
```

Bei uns brachte das zweimal ein anderes Ergebnis als angenommen: OpenRouter war
nach zwei Anläufen noch gültig, Telegram dagegen längst tot.

Nützlich ist auch die Metadaten-Abfrage: OpenRouters `/api/v1/auth/key` verrät
das Anzeige-Label des Schlüssels (`sk-or-v1-227...642`) und die bisherige
Nutzung. Damit findet man den richtigen Eintrag in einer langen Liste — und
sieht, ob jemand ihn benutzt hat. `usage: 0` ist die Entwarnung.

---

## 3 · Danach: die History säubern

Erst jetzt, und nie ohne Sicherung.

```bash
# Sicherung — spiegelt alle Branches und Tags
git clone --mirror <repo> <repo>_BACKUP.git

# Auf einer separaten Kopie arbeiten, nie im Arbeitsverzeichnis
git clone <repo>_BACKUP.git <repo>_CLEAN
cd <repo>_CLEAN

pip install git-filter-repo
python -m git_filter_repo --invert-paths \
  --path .env --path node_modules --path-glob '*/node_modules/*' --force
```

`git filter-repo` entfernt danach absichtlich den `origin`-Remote — man muss ihn
neu setzen. Das ist eine Schutzmaßnahme, kein Fehler.

### Kontrollieren, bevor gepusht wird

Nicht nur schauen, ob die Datei weg ist — **in allen Blobs nach den Mustern
suchen**:

```bash
for pat in "GITHUB_TOKEN=gh" "API_KEY=sk" "API_KEY=AIza"; do
  git rev-list --all | while read c; do git grep -l -E "$pat" "$c" 2>/dev/null; done
done
```

Treffer in Dokumentationsdateien sind meist Platzhalter. Unterscheiden lässt es
sich an der Länge: `sk-xxx` hat 6 Zeichen, ein echter Schlüssel 35 bis 93.

---

## 4 · Push, und dann die vergessenen Ecken

```bash
git remote add origin <url>
git push --force --dry-run origin main   # erst prüfen
git push --force origin main
```

Danach im **Arbeitsverzeichnis** nachziehen — vorher ungespeicherte Änderungen
sichern, am besten doppelt (Einzeldateien plus `git diff HEAD > aenderungen.patch`):

```bash
git fetch origin main && git reset --hard origin/main
git apply aenderungen.patch
```

### Drei Ecken, die alte Objekte am Leben halten

Nach dem Reset zeigte `git log --all --full-history -- .env` bei uns immer noch
drei Commits. Ursache waren:

1. **Tags.** `v1.2.0` zeigte auf einen Commit der alten Kette. Ein Tag hält die
   gesamte Historie dahinter fest — auch auf GitHub. Lösung: Entsprechung in der
   neuen History über die Commit-Nachricht suchen, Tag umsetzen, remote löschen
   und neu pushen.
2. **Stash.** `refs/stash` verweist ebenfalls auf alte Commits. Vorher ansehen
   (`git stash show -p`), sichern, dann `git stash drop`.
3. **Reflog.** Hält alles fest, was HEAD je war.

```bash
git reflog expire --expire=now --all
git gc --prune=now
```

Bei uns: 20 MB → 1,7 MB, und erst danach war `.env in Objekten: 0`.

### Prüfen, ob GitHub wirklich nichts mehr ausliefert

```bash
curl -s -o /dev/null -w '%{http_code}' \
  https://raw.githubusercontent.com/<user>/<repo>/<alter-commit>/.env
```

`404` ist das Ziel. Auch über den **Tag-Namen** testen, nicht nur über den Hash.

**Was auch danach bleibt:** Forks behalten die alte History vollständig. Wenn
jemand geforkt hat, ist dort alles noch drin. Deshalb Punkt 1.

---

## 5 · Damit es nicht wieder passiert

**`.gitignore` wirkt nicht rückwirkend.** Das war die eigentliche Ursache: Die
`.env` war eingecheckt, *bevor* die Regel dazukam. Git ignoriert nur Dateien, die
es noch nicht verfolgt. Wer eine Regel nachträgt, muss die Datei zusätzlich aus
der Verfolgung nehmen:

```bash
git rm --cached .env
```

Weiteres, das hilft:

- `.env.example` mit Platzhaltern einchecken, `.env` niemals
- Vor dem ersten Push eines neuen Projekts einmal `git ls-files | grep -Ei "env|key|secret"`
- GitHub Secret Scanning und Push Protection in den Repo-Einstellungen aktivieren —
  das blockt bekannte Schlüsselmuster schon beim Push
- Schlüssel nur mit den Rechten ausstellen, die gebraucht werden; kein
  Provisioning-Key, wo ein Lese-Schlüssel reicht

---

## 6 · Was danach kaputt sein kann

Widerrufene Schlüssel waren vielleicht produktiv im Einsatz. Nach der Aktion
prüfen:

- GitHub Actions — Secrets in den Repo-Einstellungen
- Cloud Build / Cloud Run — Umgebungsvariablen des Dienstes
- lokale `.env` — neu befüllen
- Bots und Dienste, die mit dem alten Token liefen
