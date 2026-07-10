# Architecture

Static Vite + React + TypeScript app. No backend, no build-time secrets — all
GitHub API calls happen client-side in the browser.

## Data flow

```
App mount
  → getDailySnippet()               (src/lib/snippetSource.ts)
      → fetchTrendingRepos()        (src/lib/github.ts)  GitHub search API
      → fetchRepoSnippet(repo)      (src/lib/github.ts)  repo contents + raw file
          → extractExcerpt(content) (src/lib/excerpt.ts) bounded 10–40 line slice
      ⤷ on any failure: getFallbackSnippet() (src/lib/fallbackSnippets.ts)
  → useTypingGame(snippet.content)  (src/hooks/useTypingGame.ts)
      → scoreRun(target, typed)     (src/lib/scoring.ts) — every keystroke
          → tokenize(target)        (src/lib/tokenizer.ts) — cached per target
                                     via useMemo, classifies each char index
                                     as bracket/indent/word/etc.
          → mismatches inside a bracket/indent token are "structural";
            everything else is a "typo"
      → calculateWpm()              (src/lib/wpm.ts)
      → soundEngine.play*()         (src/lib/sound.ts) per keystroke judgement
  → renders SnippetCard + StatRail + RulerBar; WinOverlay on completion
```

## Modules

- **`src/lib/tokenizer.ts`** — pure lexer, no language-specific grammar. Groups
  leading-line whitespace as `indent`, keeps brackets singular, strings/line
  comments intact, everything else as `word`/`whitespace`/`newline`. This is
  what makes multi-language support "free" — it doesn't parse syntax, just
  structural shape.
- **`src/lib/scoring.ts`** — compares typed vs. target character-by-character
  against the tokenizer's kind map; classifies each mismatch as `structural`
  (bracket/indent) or `typo` (everything else). Pure function, no React.
- **`src/lib/cursorPosition.ts`** — flat char index → `{row, col}` for
  positioning the live cursor overlay without measuring DOM nodes (relies on
  the UI font being monospace).
- **`src/lib/github.ts`** — GitHub search (trending proxy, sorted by stars
  among recently-created repos) + repo-contents fetch to pull one real source
  file, skipping test files. Sends `VITE_GITHUB_TOKEN` as a bearer token when
  set (`.env.example`).
- **`src/lib/snippetSource.ts`** — orchestrates github.ts + the fallback set;
  the only place that decides "live vs. fallback" and produces the UI notice.
- **`src/lib/fallbackSnippets.ts`** — hand-written offline snippets in 4
  languages, used when GitHub is unreachable/rate-limited.
- **`src/lib/sound.ts`** — WebAudio-synthesized SFX engine (oscillators only,
  no audio files); lazily creates its `AudioContext` on first play call and
  is a safe no-op when unavailable (tests, unsupported browsers). Mute state
  persists to `localStorage`.
- **`src/hooks/useTypingGame.ts`** — the sprint run state machine: typed
  string, timing, completion, live WPM/accuracy. Uses a ref (not just React
  state) as the source of truth for `typed` so keystrokes arriving before a
  re-render (batched updates, OS key-repeat) don't race on a stale closure.
- **`src/hooks/useKeyboardCapture.ts`** — routes raw `keydown` events to
  `typeChar`/`backspace`, ignoring modifier combos. Tab is only hijacked into
  a literal `"\t"` char when App's `interceptTab` says the next expected
  character actually is one (tab-indented snippets); otherwise Tab is left
  alone so it keeps navigating focus to the mute/new-snippet/source-link
  controls.
- **`src/hooks/usePrefersReducedMotion.ts`** — live `prefers-reduced-motion`
  media query state, threaded into SnippetCard (line-shake) and WinOverlay
  (confetti).

## Components (`src/components/`)

- **`SnippetCard`** — the hero. Renders the target snippet as one `<span>`
  per character, styled by judgement (pending/correct/typo/structural), plus
  an absolutely-positioned cursor overlay tweened via CSS `transform`
  (`cursorPositionAt` → `translate(col ch, row * 1.6em)`). A structural
  mistake keys the affected line's `<div>` to replay a shake animation. Also
  renders an invisible `<input>` covering the card — on a touch-only device
  there's no physical keyboard, so tapping the card focuses this input to
  summon the OS on-screen one; `useKeyboardCapture` still does the actual
  character routing via its `window` keydown listener.
- **`StatRail`** — live WPM/accuracy/mistake counts, source repo attribution
  link, fallback notice, mute + new-snippet controls.
- **`RulerBar`** — the ticked bar across the page top; fill width = typed
  progress, label = live WPM.
- **`WinOverlay`** — run-complete dialog: stats, confetti (skipped under
  reduced motion), one "Next Snippet" CTA.
- **`Wordmark`** — self-typing "SYNTAX SPRINT" on mount (the signature
  design detail).

`src/App.tsx` wires all of the above: fetches the daily snippet on mount,
drives `useTypingGame`, tracks the most recent structural mistake's line/seq
for the shake, and swaps in loading/error/win states.

## Run & test

```
npm run dev        # local dev server
npm run build       # tsc -b && vite build → dist/ (relative-base, subpath-safe)
npm run preview     # serve the production build locally
npm test             # vitest run
npm run lint          # eslint .
```

`vite.config.ts` sets `base: "./"` so the build works when hosted under
`apps.charliekrug.com/syntax-sprint/`, not just at a domain root.
