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

## Features

- **Live trending content** — today's snippet comes from the GitHub search
  API's most-starred-recently-created signal (the closest proxy to
  "trending" GitHub's API exposes), with a bundled offline fallback if the
  API is unreachable or rate-limited.
- **Syntax-aware scoring** — a real tokenizer walks each snippet (brackets,
  indentation, strings, comments) so structural mistakes are scored
  differently from simple typos, live as you type.
- **Bracket & indentation penalties** — a mismatched bracket or broken indent
  flashes red and shakes its line the instant you type it, not just at the
  end of the run.
- **WPM & accuracy stats** — a live stat rail (updating at least once a
  second) plus a run-complete summary with a typo/structural breakdown.
- **Multi-language snippets** — the tokenizer is structural, not
  grammar-specific, so TypeScript, Python, Go, Rust, and friends all score
  correctly; the UI shows which language the current snippet is in.
- **Synthesized sound + reduced motion** — WebAudio SFX (no audio files) with
  a persisted mute toggle, and `prefers-reduced-motion` support that drops
  shake/confetti while keeping color and text feedback.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how the pieces fit
together.

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
