# Contributing

Thanks for considering it. This project is meant to be shaped by the people who
actually use it — code contributions are welcome, but so are bug reports, format
requests, and "this doesn't work for me" write-ups. None of those need a pull request.

## The easiest way to help

**Open an issue.** That's it. A few kinds that are especially useful right now:

- **Broken import.** A chat export or a copy-pasted conversation that the parser
  gets wrong — paste a (secret-scrubbed) sample of what didn't work.
- **Bookmarklet/extension not working on a provider.** The scroll-and-extract logic
  is provider-agnostic on purpose, but chat UIs vary. Tell us the provider and what
  happened (nothing found? wrong content? partial history?).
- **A roadmap idea, or one that's not on the roadmap yet.** See `README.md` →
  Roadmap.
- **A UX complaint.** "I couldn't find X" or "I expected Y to happen" is exactly as
  useful as a code fix — often more, since it catches things a contributor familiar
  with the code would never notice.

## If you want to submit code

1. Open an issue first for anything beyond a small, obvious fix — saves both of us
   from work that doesn't end up merged because the direction didn't match.
2. `index.html` is a single file, no build step, no dependencies. Open it directly
   in a browser to test.
3. Keep it that way: no bundler, no framework, no server requirement for the core
   app. That constraint is deliberate (see `README.md` → Why this exists) and isn't
   up for silent renegotiation in a PR — if you think it should change, that's an
   issue/discussion first, not a PR first.
4. `tools/` has test scripts for the OKF compaction logic — if you touch
   `compactOkf()`, `compactByAge()`, or anything under `tools/`, run
   `node tools/compaction-bench.mjs` and make sure it still reports fully
   error-free before opening a PR.
5. Comments explain *why*, not *what* — match the existing style rather than adding
   narration of what the code already says.

## Code of conduct

Be the kind of contributor you'd want reviewing your own first PR. Disagreement
about direction is fine and expected; disrespect isn't.
