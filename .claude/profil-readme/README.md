<!--
  Profil-README für github.com/ThaiJenspacito

  So wird sie wirksam: ein öffentliches Repo anlegen, das exakt so heißt wie das
  Konto — also `ThaiJenspacito` — und diese Datei als README.md hineinlegen.
  GitHub zeigt sie dann oben auf der Profilseite.

  Bewusst ohne Badge-Reihe, ohne Sterne-Zähler, ohne Besucherzähler: Solange die
  Zahlen klein sind, wirken sie gegen dich. Was zählt, ist eine klare Aussage und
  eine Demo, die ohne Installation läuft.
-->

## Jens Becker

I build **PromptEngineer** — a local-first tool that keeps conversations with
language models as an immutable, searchable archive, so better prompts can be
derived from what actually happened.

The point is not to store chats. The point is to keep the **reasoning path**: how
a model broke a problem down, which phrasing it failed on, which decision held up
later. From that material a prompt library grows that rests on evidence instead of
intuition.

---

### Why this exists

Every coding assistant compacts context sooner or later, and every summary drops
the same thing: the motivation. You end up knowing *what* was decided and not
*why* — so the same dead end gets walked twice.

PromptEngineer keeps a typed layer next to the raw transcript. Six entry types,
each answering one question:

| Type | Guiding question |
|---|---|
| `MOTIV` | Why are we doing this at all? |
| `FUND` | What is the case? |
| `WEG` | What are we trying? |
| `WAND` | What did it hit? |
| `SETZUNG` | What holds now? |
| `ZWEIFEL` | What still nags? |

Walls and open doubts are never compacted away — they are exactly what separates
this from a summary.

---

### Principles

- **Local.** Everything stays on your own disk. No account, no cloud, no service
  that gets switched off next year. The interface runs without a server; a running
  server extends it but is never required.
- **Immutable.** Entries cannot be edited or deleted. Only the tagging changes.
- **Across models.** ChatGPT, Claude, Gemini, DeepSeek, Grok, Kimi, GLM, MiniMax
  land in the same archive and the same format — which is what makes them
  comparable.
- **Open format.** Storage follows the Open Knowledge Format: a directory tree of
  Markdown files with YAML front matter, one file per entry. The same tree opens
  as an Obsidian vault.

---

### Projects

| | |
|---|---|
| **PromptEngineer · Journal** | Single-file HTML. Filters across seven dimensions, opens conversations as a tree, exports to nine formats. No build step, no dependencies. |
| **PromptEngineer · Server** | Node service that receives chats, tags them and exports them. Optional. |

---

### Elsewhere

Older experiments live under [@jenspacito](https://github.com/jenspacito).

<sub>Reach me through the contact form on the project page.</sub>
