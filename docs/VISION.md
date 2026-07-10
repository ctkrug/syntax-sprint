# Vision

## The problem

Typing-speed games (Monkeytype, TypeRacer, 10FastFingers) are built around
prose: random words or quotes, scored by raw character-match accuracy. Plenty
of developers use them to warm up before a coding session, but the content
and the scoring are both wrong for that use case. Prose has no structural
grammar to violate — a typo is a typo. Code does: an unmatched bracket or a
broken indent level isn't a stylistic slip, it's the difference between code
that runs and code that doesn't. A typing game "for developers" that just
reskins the word list with code snippets and scores it the same way as prose
is missing the entire point of what makes typing code different.

Separately, every one of these games draws from a fixed, aging corpus. The
same paragraphs and code samples show up for months. There's no sense of
"what's happening right now" — no reason to come back today versus last week.

## Who it's for

Developers who already do speed-typing drills (or want to) and would rather
practice on code that looks like their actual job — real functions, real
brace placement, real indentation discipline — than on Lorem Ipsum or
Hemingway quotes. Secondary audience: anyone who enjoys the "line goes up"
loop of a typing game and finds "what's trending on GitHub today" a fun hook
to check in on daily.

## The core idea

Two things, combined, that neither existing typing games nor generic
code-snippet sites do together:

1. **Syntax-aware scoring.** Before a run starts, the snippet is tokenized
   (see `src/lib/tokenizer.ts`) into brackets, indentation, strings,
   comments, and words. The scorer (`src/lib/scoring.ts`) then classifies
   every mistake the player makes as either an ordinary typo or a
   **structural** mistake — a busted bracket or a broken indent level — and
   the two are weighted, visualized, and reported differently. Fumbling a
   closing brace should feel worse than fumbling a variable name, because it
   *is* worse.
2. **Live content, not a static corpus.** Snippets are sourced from whatever
   is actually trending on GitHub today (`src/lib/github.ts`), not a
   hand-picked archive that goes stale. The game changes every day because
   the ecosystem it's drawing from changes every day.

## Key design decisions

- **Tokenize before scoring, not after.** The tokenizer is a standalone,
  independently-tested module (`tokenizer.ts` → `scoring.ts`), not scoring
  logic tangled into UI event handlers. This keeps the "what counts as a
  structural mistake" rule auditable and unit-testable in isolation from
  React.
- **GitHub search as a trending proxy.** GitHub has no public "trending"
  API; the client queries the search API sorted by stars among recently
  created repos, which is close enough to trending without needing scraping
  or a backend.
- **Static site, no backend.** All GitHub API calls happen client-side; the
  build is a single static bundle so it can be hosted at
  `apps.charliekrug.com/syntax-sprint` with zero server infrastructure.
- **Real-time feedback over end-of-run summaries.** Structural mistakes flash
  the instant they happen (red) rather than only appearing in a final
  report — the whole pitch is that bracket/indent errors feel immediate and
  consequential while you type, not just in hindsight.

## What "v1 done" looks like

- Landing on the page fetches today's top trending repo and pulls a
  reasonably-sized, syntax-valid snippet from it to type — the wow moment
  from the README is live and working, not a mock.
- Typing is scored live: every keystroke is judged correct/typo/structural
  in real time, with structural mistakes visually distinct (red flash) from
  ordinary typos.
- A completed run shows WPM, accuracy, and a structural-vs-typo mistake
  breakdown, with a clear way to start another run.
- If the GitHub API is unavailable or rate-limited, the game falls back to a
  small bundled set of snippets rather than showing a dead page.
- The page matches `docs/DESIGN.md`'s direction end to end (fonts, tokens,
  motion, sound) and works at phone width as well as desktop.
