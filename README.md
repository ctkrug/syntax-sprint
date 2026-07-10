# Syntax Sprint

A typing-speed game built entirely from real code — snippets pulled live from
today's top trending GitHub repositories, scored by a syntax-aware engine that
actually understands brackets, indentation, and structure instead of just
comparing characters.

## Why

Typing games (Monkeytype, TypeRacer, and friends) score every character the
same way, so a botched closing brace costs you as much as a stray space. That's
fine for prose, but it's the wrong lens for code: a misplaced bracket or a
dedent that breaks a block is a *real* mistake, and a game about typing code
should treat it like one. Syntax Sprint tokenizes each snippet before you ever
touch the keyboard, so scoring can tell the difference between "typo" and
"syntax error" — and the content itself is never stale, because it's pulled
from whatever the GitHub community is actually looking at today.

## The wow moment

Load the page and the snippet on screen is from **this morning's #1 trending
GitHub repo** — not a canned corpus. Start typing: fumble a bracket or blow an
indentation level and the character flashes red the instant you type it,
because the scorer is tracking real syntax structure, not just string diffing.

## Planned features

- **Live trending content** — snippets sourced from the GitHub REST API's
  trending/most-starred signal, refreshed continuously so the game never goes
  stale.
- **Syntax-aware scoring** — a real tokenizer walks each snippet (brackets,
  indentation, strings, comments) so structural mistakes are scored
  differently from simple typos.
- **Bracket & indentation penalties** — instant visual feedback the moment a
  bracket is mismatched or an indent level is broken, not just at the end of
  the run.
- **WPM & accuracy stats** — per-run words-per-minute, accuracy, and a
  breakdown of error types (typo vs. structural).
- **Language-aware snippets** — pulled across multiple languages so the game
  reflects the actual diversity of trending repos, not just one ecosystem.

## Stack

- **TypeScript + React** for the UI and game logic.
- **Vite** for dev server and static production builds.
- **Vitest** for unit tests (tokenizer, scoring engine, GitHub client).
- **GitHub REST API** for sourcing trending-repo source snippets.

Ships as a static, self-contained site — no backend required.

## Development

```bash
npm install
npm run dev       # local dev server
npm test          # unit tests
npm run lint      # eslint
npm run build     # production build to dist/
```

See [`docs/VISION.md`](docs/VISION.md) for the product vision and
[`docs/BACKLOG.md`](docs/BACKLOG.md) for the build plan.

## License

MIT — see [`LICENSE`](LICENSE).
