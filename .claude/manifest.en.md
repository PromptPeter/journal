# PromptEngineer — Manifest

- **As of:** 2026-08-23
- **Related:** [settings-und-design.md](settings-und-design.md) — how it is built
- **German version:** [manifest.de.md](manifest.de.md)

---

## What this is

**PromptEngineer** is a local tool that archives conversations with language models
immutably and makes them searchable — so that better prompts can be derived from
them systematically.

The point is not to keep chats around. The point is to preserve the **reasoning**:
how did a model break a problem apart? Which phrasing did it stumble over? Which
decision turned out to hold up later? That material becomes a personal prompt
library grounded in evidence rather than in recollection.

Three properties follow from this, and they govern everything else:

1. **Immutability.** A journal entry cannot be edited or deleted. Only then is it
   usable as evidence later on. The server enforces this through file permissions
   (`0444`); the interface enforces it by simply having no edit button anywhere.
   The only thing that can change is how an entry is labelled.
2. **Local.** Everything sits on your own disk. No account, no cloud, no dependency
   that gets switched off next year. The interface runs without a server; a running
   server extends it but is never a prerequisite.
3. **Model-agnostic.** ChatGPT, Claude, Gemini, Deepseek, Grok, Kimi, GLM, MiniMax,
   ManusAI and HuggingFace all land in the same journal in the same format. Only
   then does it become comparable how different models approach the same task.

---

## What it consists of

### `c:\DEV\OKF_MD_LOG` — capture and storage

Node server on port 31337 with a dashboard and a browser extension. It receives
chats, stores them, labels them and exports them.

- **Storage:** `Deine_KI_Journals/<model-name>/<project>/`
- **`raw.okf.json`** — the raw conversation, immutable
- **`data.okf.json`** — the typed insight layer
- **`VERLAUF.md`** — the readable view, generated automatically
- **Auto-tagger** — assigns each entry a signal colour via Gemini
- **Endpoints** — `/api/raw/:ai/:project`, `/api/stats`,
  `/api/agents/extract-todos`, `/api/exports/notebooklm`, `/api/mcp/status`

### `c:\DEV\Dribble_Journal_Filter` — the journal

A single `index.html`, opened by double-clicking it. Shows the corpus
chronologically, filters it in real time, opens individual conversations as a tree
and exports the filtered set in eleven formats.

Deliberately separate from the server: anyone who only wants to look something up
and export it should not have to start anything first. When the server is running,
the interface notices and makes use of it as well.

---

## The OKF format

**OKF — Open Knowledge Format.** Two layers answering two different questions.

**The raw layer** (`raw.okf.json`) records *what was said*: role, text, timestamp,
model, source. It is never modified.

**The typed layer** (`data.okf.json`) records *what follows from it*. Each entry
gets one of six types and may point to an earlier entry via `ref`. This produces a
graph of reasoning threads:

| Type | Shown as | Meaning | Guiding question |
|---|---|---|---|
| `MOTIV` | MOTIVE | The dissatisfaction, the trigger, the itch | Why are we doing this at all? |
| `FUND` | FINDING | Something learned about the world or the code that now constrains us | What is the case? |
| `WEG` | PATH | An approach taken, a plan, an attempt | What are we trying? |
| `WAND` | WALL | Failed, discarded, blocked | What did it run into? |
| `SETZUNG` | DECISION | A decision — provisional ones and compromises included | What holds now? |
| `ZWEIFEL` | DOUBT | Unresolved unease, open tension | What is still nagging? |

The guiding question is the actual working instruction: when typing an entry, ask
which of the six questions it answers. `MOTIV` is never compacted away — the itch
remains, even once everything else has been settled.

The identifiers in the `type` field stay German in both interface languages: they are
part of the data format, not display text. The interface shows the translated label,
and its tooltip names the underlying OKF identifier so it stays clear what is actually
written to the file.

**Compaction** builds on this: a path that ran into a wall does not disappear — the
wall absorbs it along with its rationale. A decision keeps the path that led to it
in parentheses. Whatever led nowhere is dropped. What remains is a chain of motives,
walls, decisions and open doubts: the history of the project without the repetition.

Running across all of this is the auto-tagger's **signal system** — `Rot` blocker,
`Gelb` doubt, `Gruen` success, `Blau` neutral information. It does not answer *what*
an entry is, but *how it turned out*.

---

## What the journal does

**Chronology.** Grouped by day, with date and time, newest first.

**Real-time filtering.** Seven dimensions, freely combinable: full text with eight
operators, model, OKF type, category, signal, tags, time range. A combined filter
pass across 1,200 chats containing 11,984 turns takes 0.08 ms — fast enough to
recompute on every keystroke. The counts next to each option account for the *other*
filters, so they stay meaningful even when the selection is already narrow.

**Conversations as a tree.** One click expands the entry in place and shows the
conversation as a tree: each turn a branch, expandable, with role, time and size. If
an answer carries a reasoning trace, it hangs beneath it as a third level — visible
when you want it, out of the way when you don't. If the entry came from
`data.okf.json`, the tree also shows the `ref` chain, and with it the reasoning
thread in reverse.

**Import.** Drop in files or entire folders. Recognised: chat exports in Markdown,
`raw.okf.json`, `data.okf.json` and `VERLAUF.md`. The model is determined from the
folder name, the title or the source URL. Broken umlauts from badly encoded exports
are repaired along the way.

**Labelling.** Tags, signal and category can be changed per entry and survive a
re-import of the same file. The conversation itself stays untouched.

**Export.** The filtered set or a single conversation, as MD, TXT, CSV, JSON, PDF,
`raw.okf.json`, `data.okf.json`, compacted, or as `VERLAUF.md`. Plus a
source-optimised file for NotebookLM and the **LLM wiki bundle** — a ZIP of
`raw/`, `wiki/` and `CLAUDE.md` that unpacks into an Obsidian vault.

**Bilingual.** English by default, German fully available, switchable in the header.
Data formats are unaffected by the choice.

---

## How it came about

The project started as `OKF_MD_LOG` — a server that transcribes chats. Three
insights along the way changed its character.

First, **reasoning traces**: models such as DeepSeek-R1 or o1 hand over their
thinking. That is worth more than the answer, because it shows exactly where a
prompt should have been more precise.

Second, **separating dashboard from journal**: looking something up should not
require starting a server first.

Third, the **name**. A tool that stores chats became a tool for prompt engineering —
and with that, *PromptEngineer*.

---

## Still open

- **Agent / Skill / Workflow / Prompt library.** Turn the snippets already sitting
  in the journal into reusable prompts, agent instructions, and workflows — not
  started.
- **Logo and visual identity.** No branding decided yet.
- **Official data-export parsers.** Reading providers' own export formats (e.g.
  ChatGPT's `conversations.json`) as a fourth, higher-fidelity import path,
  alongside the manual paste/bookmarklet/extension paths that exist today.
- **Real data.** `Chats_LMM/` so far holds only a handful of sorted files from a
  couple of Gemini projects; testing has otherwise used mock data and real exports
  fed through synthetic and real-project fixtures.
- **Analysis.** Once there is enough material: which phrasings reliably produce
  usable answers? Which model is good for what?

Done, as of 2026-08-25: a manual chat-import path exists — a paste dialog with
duplicate detection, a one-click bookmarklet that scrolls a chat page to load its
full history before copying it, and a browser extension (`extension/`) doing the
same but delivering straight to an open Journal tab. Nothing runs automatically or
in the background; nothing stores login credentials.
