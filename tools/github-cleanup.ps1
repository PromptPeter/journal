<#
    GitHub aufräumen — Konten ThaiJenspacito, jenspacito, Org SaaS-Comunity-Thailand
    Stand 23.08.2026

    Läuft standardmäßig als TROCKENLAUF und verändert nichts. Erst `-Execute`
    führt aus. Vorher wird geprüft, ob die Sicherung unter C:\DEV\_github-backup
    vollständig ist — ohne Sicherung bricht das Skript ab.

        pwsh tools/github-cleanup.ps1                 # zeigt nur, was passieren würde
        pwsh tools/github-cleanup.ps1 -Execute        # führt aus
        pwsh tools/github-cleanup.ps1 -Execute -Archive   # archiviert statt zu löschen

    Voraussetzung: gh auth login   (mit Scope delete_repo für das Löschen)
#>

[CmdletBinding()]
param(
    [switch]$Execute,
    [switch]$Archive
)

$ErrorActionPreference = 'Stop'
$BackupDir = 'C:\DEV\_github-backup'

# ─────────────────────────────────────────────────────────────
# Harte Sperre. Was hier steht, wird unter keinen Umständen
# angefasst — auch nicht, wenn es versehentlich unten auftaucht.
# ─────────────────────────────────────────────────────────────
$Tabu = @(
    'NowPayDee'
)

# ─────────────────────────────────────────────────────────────
# Was weg soll. Jede Zeile einzeln geprüft, keine Muster.
# Grund steht dabei, damit die Liste nachvollziehbar bleibt.
# ─────────────────────────────────────────────────────────────
$Weg = @(
    # Eigene Repos ohne Inhalt — gesichert, aber nichts drin
    @{ Repo='ThaiJenspacito/ideal-barnacle_md_okf';          Grund='0 Commits, vollständig leer (hat 1 Stern)' }
    @{ Repo='ThaiJenspacito/Aufgabenplanung';                Grund='nur README (hat 1 Stern)' }
    @{ Repo='ThaiJenspacito/Hausverwaltung';                 Grund='nur README' }
    @{ Repo='ThaiJenspacito/LaundryList';                    Grund='nur README, dritter Anlauf desselben Namens' }
    @{ Repo='jenspacito/Translation4all';                    Grund='0 Commits, vollständig leer (hat 1 Stern)' }
    @{ Repo='jenspacito/txt';                                Grund='0 Commits, vollständig leer' }

    # Forks ohne eine einzige eigene Änderung
    @{ Repo='ThaiJenspacito/Antigravity-Shit-Chat';          Grund='Fork, 0 eigene Commits' }
    @{ Repo='ThaiJenspacito/antigravity_phone_chat';         Grund='Fork, 0 eigene Commits' }
    @{ Repo='ThaiJenspacito/LiteRT-LM';                      Grund='Fork, 0 eigene Commits' }
    @{ Repo='ThaiJenspacito/OmniRoute';                      Grund='Fork, 0 eigene Commits' }
    @{ Repo='ThaiJenspacito/openworker';                     Grund='Fork, 0 eigene Commits' }
    @{ Repo='ThaiJenspacito/the-book-of-secret-knowledge';   Grund='Fork, 0 eigene Commits' }
    @{ Repo='jenspacito/docker-debian-artifacts';            Grund='Fork, 0 eigene Commits (3,3 GB)' }
    @{ Repo='jenspacito/FlowiseChatEmbed';                   Grund='Fork, 0 eigene Commits' }
    @{ Repo='jenspacito/gpt-engineer';                       Grund='Fork, 0 eigene Commits' }
    @{ Repo='jenspacito/official-images';                    Grund='Fork, 0 eigene Commits' }
    @{ Repo='jenspacito/wa-crypt-tools';                     Grund='Fork, 0 eigene Commits' }

    # Forks mit eigenen Commits — Inhalt liegt gesichert vor
    @{ Repo='ThaiJenspacito/chat-ui';                        Grund='Fork; okf-cloud-dashboard.js gerettet nach _github-backup/gerettet/' }
    @{ Repo='jenspacito/Flowise';                            Grund='Fork; einziger eigener Commit legt eine leere Datei an' }

    # Veralteter Fork der eigenen Organisation
    @{ Repo='SaaS-Comunity-Thailand/OKF_MD_Master';          Grund='Stand vom ersten Tag, keine gemeinsame Historie mehr; gespiegelt gesichert' }
)

# ─────────────────────────────────────────────────────────────
# Was bleibt — hier nur zur Kontrolle aufgeführt, wird nicht angefasst.
# ─────────────────────────────────────────────────────────────
$Bleibt = @(
    @{ Repo='ThaiJenspacito/OKF_MD_Master';         Hinweis='Hauptprojekt — umbenennen auf promptengineer-*' }
    @{ Repo='ThaiJenspacito/SaaS-Themplate';        Hinweis='umbenennen: "Themplate" ist ein Tippfehler' }
    @{ Repo='ThaiJenspacito/Laundry-List';          Hinweis='Android, Inventar und Buchungen — eigener Code' }
    @{ Repo='ThaiJenspacito/Laundrylist-';          Hinweis='Android, Aufträge — eigener Code; Bindestrich am Ende entfernen' }
    @{ Repo='ThaiJenspacito/TextDancer';            Hinweis='animierter Text' }
    @{ Repo='ThaiJenspacito/okf-evolution-framework'; Hinweis='Agentic planner — einfalten oder eigenständig lassen' }
    @{ Repo='jenspacito/AI-Chatbot';                Hinweis='107 Dateien — übertragen nach ThaiJenspacito oder belassen' }
)

# ─────────────────────────────────────────────────────────────

function Fehler($m){ Write-Host "  FEHLER  $m" -ForegroundColor Red }
function Ok($m){ Write-Host "  ok      $m" -ForegroundColor Green }
function Info($m){ Write-Host "  $m" -ForegroundColor DarkGray }

Write-Host ''
Write-Host 'GitHub aufräumen' -ForegroundColor Cyan
Write-Host ('=' * 72)

# 1 · Werkzeuge
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Fehler 'gh nicht gefunden. https://cli.github.com'
    exit 1
}
$authOk = $false
try { gh auth status 2>&1 | Out-Null; $authOk = ($LASTEXITCODE -eq 0) } catch { }
if ($authOk) {
    Ok 'gh angemeldet'
} elseif ($Execute) {
    Fehler 'Nicht angemeldet. Zuerst:  gh auth login'
    Info   'Zum Löschen zusätzlich:    gh auth refresh -h github.com -s delete_repo'
    exit 1
} else {
    Info 'nicht angemeldet — der Trockenlauf zeigt den Plan, prüft aber nicht, ob es die Repos noch gibt'
}

# 1b · Welches Konto ist aktiv? Ein Token darf nur die eigenen Repos löschen.
$AktivesKonto = $null
if ($authOk) {
    try { $AktivesKonto = (gh api user --jq .login 2>$null) } catch { }
    if ($AktivesKonto) {
        Ok "aktives Konto: $AktivesKonto"
        $fremd = @($Weg | Where-Object {
            $o = $_.Repo.Split('/')[0]
            $o -ne $AktivesKonto -and $o -ne 'SaaS-Comunity-Thailand'
        })
        if ($fremd.Count -gt 0) {
            $andere = ($fremd | ForEach-Object { $_.Repo.Split('/')[0] } | Sort-Object -Unique) -join ', '
            Info "$($fremd.Count) Repos gehören zu $andere — die werden übersprungen"
            Info "dafür danach:  gh auth login   (zweites Konto)  und  gh auth switch"
        }
    }
}

# 2 · Sicherung muss stehen
if (-not (Test-Path $BackupDir)) {
    Fehler "Keine Sicherung unter $BackupDir. Abbruch."
    exit 1
}
$spiegel = @(Get-ChildItem "$BackupDir\repos" -Filter '*.git' -Directory -ErrorAction SilentlyContinue)
if ($spiegel.Count -lt 14) {
    Fehler "Sicherung unvollständig: $($spiegel.Count) Spiegel, erwartet mindestens 14. Abbruch."
    exit 1
}
Ok "Sicherung vorhanden: $($spiegel.Count) Spiegel, $(@(Get-ChildItem "$BackupDir\patches" -File -ErrorAction SilentlyContinue).Count) Patch-Dateien"

# 3 · Tabu-Prüfung
foreach ($e in $Weg) {
    $name = $e.Repo.Split('/')[-1]
    foreach ($t in $Tabu) {
        if ($name -like "*$t*") {
            Fehler "Gesperrtes Repo steht auf der Löschliste: $($e.Repo). Abbruch."
            exit 1
        }
    }
}
Ok "Tabu-Liste geprüft: $($Tabu -join ', ') kommt nicht vor"

$aktion = if ($Archive) { 'archivieren' } else { 'LÖSCHEN' }
Write-Host ''
Write-Host "Aktion: $aktion   ·   $($Weg.Count) Repos betroffen   ·   $($Bleibt.Count) bleiben" -ForegroundColor Yellow
if (-not $Execute) {
    Write-Host 'TROCKENLAUF — es wird nichts verändert. Mit -Execute ausführen.' -ForegroundColor Yellow
}
Write-Host ''

# 4 · Durchführen
$erledigt = 0; $fehler = 0; $fehlt = 0; $uebersprungen = 0
foreach ($e in $Weg) {
    $r = $e.Repo
    $vorhanden = $true
    if ($authOk) {
        try { gh repo view $r --json name 2>&1 | Out-Null; $vorhanden = ($LASTEXITCODE -eq 0) } catch { $vorhanden = $false }
    }
    if (-not $vorhanden) {
        Write-Host ("  --      {0,-52} gibt es nicht (mehr)" -f $r) -ForegroundColor DarkGray
        $fehlt++
        continue
    }

    $besitzer = $r.Split('/')[0]
    if ($Execute -and $AktivesKonto -and $besitzer -ne $AktivesKonto -and $besitzer -ne 'SaaS-Comunity-Thailand') {
        Write-Host ("  --      {0,-52} gehört {1} — mit gh auth switch erneut laufen lassen" -f $r, $besitzer) -ForegroundColor DarkYellow
        $uebersprungen++
        continue
    }

    if (-not $Execute) {
        Write-Host ("  würde  {0,-52} {1}" -f $r, $e.Grund) -ForegroundColor DarkGray
        continue
    }

    try {
        if ($Archive) { gh repo archive $r --yes 2>&1 | Out-Null }
        else          { gh repo delete  $r --yes 2>&1 | Out-Null }
        if ($LASTEXITCODE -ne 0) { throw "gh Rückgabewert $LASTEXITCODE" }
        Ok ("{0,-52} {1}" -f $r, $e.Grund)
        $erledigt++
    } catch {
        Fehler ("{0,-52} {1}" -f $r, $_.Exception.Message)
        $fehler++
    }
}

Write-Host ''
Write-Host ('-' * 72)
if ($Execute) {
    Write-Host "$erledigt $aktion · $uebersprungen anderes Konto · $fehler fehlgeschlagen · $fehlt nicht gefunden"
} else {
    Write-Host "Trockenlauf beendet. $($Weg.Count) Repos stünden zum $aktion an."
}

Write-Host ''
Write-Host 'Bleibt bestehen:' -ForegroundColor Cyan
foreach ($b in $Bleibt) { Write-Host ("  {0,-42} {1}" -f $b.Repo, $b.Hinweis) -ForegroundColor DarkGray }

Write-Host ''
Write-Host 'Danach von Hand:' -ForegroundColor Cyan
Write-Host '  · MIT-Badge aus der README von OKF_MD_Master entfernen (es gibt keine LICENSE-Datei)'
Write-Host '  · Repos umbenennen, sobald die Namen feststehen'
Write-Host '  · happygoatlamplaymat@gmail.com als verifizierte Zweitadresse eintragen,'
Write-Host '    dann ordnet GitHub 24 bislang anonyme Commits nachträglich zu'
Write-Host '  · git config --global user.name / user.email vereinheitlichen'
Write-Host ''
