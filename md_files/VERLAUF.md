# Verlauf — logging-skill

## Kopf
**Worum es geht:** Ein Skill, der Konversationen mitschreibt statt sie
zusammenzufassen — zweischichtig: billiges Anhängen während des Gesprächs,
regelgeleitete Verdichtung älterer Schichten.
**Warum überhaupt:** Zusammenfassungen und Autocompacting überdecken Motivation
und Genese eines Projekts; sie erzeugen eine Asymmetrie nach vorn zum Ziel, aus
der sich die Ausgangslage nicht mehr rekonstruieren lässt.
**Wo wir stehen:** SKILL.md geschrieben und nach `~/.claude/skills/logging/`
installiert. Sechs Eintragstypen, sieben Verdichtungsregeln, vier Altersstufen.
**Woran zuletzt gearbeitet:** Stop-Hook für automatisches Mitschreiben —
dokumentiert, aber noch nicht in `settings.json` eingetragen.

## Offene Spannungen
| # | Spannung | seit | Stand |
|---|----------|------|-------|
| S1 | Ohne Stop-Hook kippt Schicht 1 zurück in eine Zusammenfassung, weil dann doch erst nach Bekanntwerden des Endes geschrieben wird | 2026-08-18 | ungelöst — Hook dokumentiert, nicht installiert |
| S2 | Sechs Eintragstypen sind an der Obergrenze des Vertretbaren; ob FUND wirklich trägt oder nur bequem ist, zeigt sich erst im Gebrauch | 2026-08-18 | ungelöst — Beobachtung über 2–3 Projekte nötig |
| S3 | Overhead pro Zug ist unbekannt; der Skill kauft spätere Orientierung mit gegenwärtigen Token | 2026-08-18 | ungelöst |

## Wände
- [e04] Reines append-only verworfen: verträgt sich nicht mit dem stillschweigenden
  Kürzen von Sackgassen, weil man beim Schreiben nicht weiß, was Sackgasse wird —
  aufgelöst durch die Zweischichtigkeit [e05].
- [e06] „Abschweifung" als Eintragstyp verworfen: ist ein Werturteil über einen
  Beitrag, keine Art von Beitrag, und mischt zwei Achsen in einer Liste.
- [e07] Vollständiges Löschen von Sackgassen verworfen: eine Sackgasse trägt die
  Information, die den nächsten Kontext davon abhält, denselben Weg zu gehen —
  wegfallen darf der Gang, nicht die Wand.

## Sitzungen

### 2026-08-18 (Tue)
- `21:41` [e01] **MOTIV** Richard will einen Logging-Skill, weil Zusammenfassungen
  und Autocompacting die Motivationslage eines Projekts überdecken und nur eine
  Asymmetrie nach vorn zum Ziel erzeugen.
- `21:41` [e02] **WEG** Mischung aus klassischem Logging (Zeitstempel je Aktion),
  Summary und Autocompacting, weil keines der drei allein trägt. ↳e01
- `21:45` [e03] **FUND** Der Unterschied zwischen Log und Zusammenfassung ist der
  Schreibzeitpunkt, nicht das Format: eine Zusammenfassung kennt das Ende und ist
  deshalb notwendig teleologisch. ↳e01
- `21:46` [e04] **WAND** Reines append-only scheitert an Richards eigener Forderung,
  Sackgassen stillschweigend zu kürzen — beim Schreiben ist noch unbekannt, was
  Sackgasse wird. ↳e02
- `21:47` [e05] **SETZUNG** Zwei Schichten: billiges Anhängen im Nichtwissen,
  getrennter Verdichtungsdurchgang, der herabstuft statt löscht — weil sich
  Mitschreiben und Kürzen sonst widersprechen. ↳e04
- `21:48` [e06] **WAND** „Abschweifung" fällt als Eintragstyp weg: Richards erste
  Liste mischt Sprechakttypen mit Relevanzurteilen, das sind zwei Achsen. ↳e02
- `21:48` [e07] **WAND** Sackgassen werden nicht vollständig gelöscht, weil ihre
  Wand verhindert, dass der nächste Kontext denselben Weg nochmal geht. ↳e05
- `21:49` [e08] **SETZUNG** Sechs Typen — MOTIV, FUND, WEG, WAND, SETZUNG,
  ZWEIFEL — abgeleitet aus Richards zweiter, dramaturgischer Liste, weil gerade
  Zweifel und Kompromiss das sind, was Zusammenfassungen zuerst wegwerfen. ↳e06
- `21:50` [e09] **SETZUNG** Einträge tragen IDs und `↳`-Verweise, weil sich
  Argumentationsstränge nur dann bilden und geschlossene Stränge nur dann
  gefahrlos auf ihr Ende zusammenziehen lassen. ↳e05
- `21:51` [e10] **SETZUNG** Ungleichmäßiger Zerfall statt gleichmäßigem Kürzen:
  Detailgrad verfällt mit dem Alter, MOTIV und offene ZWEIFEL nie — weil nach
  einem /clear nicht der Zustand arbeitsfähig macht, sondern das Warum des
  Zustands. ↳e01
- `21:54` [e11] **SETZUNG** Skill nach `~/.claude/skills/logging/SKILL.md`
  installiert, Quelle bleibt in `Units/logging-skill/`, weil Richard es bei den
  anderen Skills so hält. ↳e08
- `21:55` [e12] **ZWEIFEL** Ohne Stop-Hook wird Schicht 1 nur auf Anforderung
  geschrieben und ist damit wieder eine Zusammenfassung — Hook ist dokumentiert,
  aber nicht installiert. ↳e05
