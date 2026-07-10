# Syntax Sprint

**▶ Live demo — [apps.charliekrug.com/syntax-sprint](https://apps.charliekrug.com/syntax-sprint/)**

[![CI](https://github.com/ctkrug/syntax-sprint/actions/workflows/ci.yml/badge.svg)](https://github.com/ctkrug/syntax-sprint/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Type real code. Every bracket counts.**

A typing game for developers. Instead of prose or a fixed word list, Syntax
Sprint drops you into a real source file from one of today's trending GitHub
repositories and scores you the way code actually breaks: a mismatched bracket
or a botched indent is a *structural* mistake, tracked apart from an ordinary
typo.

## Why

Typing games like Monkeytype and TypeRacer score every character the same way,
so a botched closing brace costs you exactly as much as a stray space. That's
right for prose but wrong for code. A misplaced bracket or a dedent that breaks
a block isn't a stylistic slip, it's the difference between code that runs and
code that doesn't. Syntax Sprint tokenizes each snippet before you touch the
keyboard, so scoring can tell "typo" from "syntax error" and flash the
structural ones red the instant you type them.

And the content is never stale: it comes from whatever the GitHub community is
starring today, not a canned corpus that's been the same for months.

## What a run looks like

You get a live code card, a stat rail, and a run summary:

```
  export async function withRetry<T>(
    task: () => Promise<T>,
    attempts = 3,
  ): Promise<T> {
    ...
  }

  RUN COMPLETE
  WPM ................. 74
  Accuracy ........... 96%
  Structural mistakes . 1   <- the ")" you fumbled, scored on its own
  Typos ............... 3
```

Fumble the `)` and it flashes red and shakes its line right away, and it lands
in the "structural mistakes" column instead of being lumped in with the typos.

## Features

- **Live trending content.** Today's snippet comes from the GitHub search API's
  most-starred-recently-created signal (the closest proxy to "trending" the API
  exposes), with a bundled offline fallback when the API is unreachable or rate
  limited.
- **Syntax-aware scoring.** A real tokenizer walks each snippet (brackets,
  indentation, strings, comments) so structural mistakes score differently from
  simple typos, live as you type.
- **Bracket and indent penalties.** A mismatched bracket or broken indent
  flashes red and shakes its line the moment you type it, not just at the end.
- **WPM and accuracy stats.** A live stat rail that updates at least once a
  second, plus a run-complete summary with the typo/structural breakdown.
- **Multi-language.** The tokenizer is structural, not grammar-specific, so
  TypeScript, Python, Go, Rust, and friends all score correctly; the UI shows
  the current snippet's language.
- **Synthesized sound and reduced motion.** WebAudio SFX (no audio files) with a
  persisted mute toggle, and `prefers-reduced-motion` support that drops the
  shake and confetti while keeping the color and text feedback.

## Stack

- **TypeScript + React** for the UI and game logic.
- **Vite** for the dev server and static production builds.
- **Vitest** for unit tests (tokenizer, scoring engine, GitHub client, hooks).
- **GitHub REST API** for sourcing trending-repo snippets.

Ships as a static, self-contained site. No backend required.

## Run it locally

```bash
npm install
npm run dev       # local dev server
npm test          # unit tests
npm run lint      # eslint
npm run build     # production build to dist/
```

### Optional: raise the GitHub rate limit

Unauthenticated GitHub API calls are rate limited. To type more snippets in a
session, copy `.env.example` to `.env` and set a personal access token (no
scopes needed for public repos):

```
VITE_GITHUB_TOKEN=ghp_your_token_here
```

## Documentation

- [`docs/DESIGN.md`](docs/DESIGN.md) covers the visual direction and design tokens.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) covers how the pieces fit together.
- [`docs/VISION.md`](docs/VISION.md) covers the product vision.

## License

MIT, see [`LICENSE`](LICENSE).

---

More of Charlie's projects at [apps.charliekrug.com](https://apps.charliekrug.com)
