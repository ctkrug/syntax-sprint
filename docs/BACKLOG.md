# Backlog

Epics and stories for the build. Every story lists concrete, checkable
acceptance criteria — no "works well" vibes. The first story of Epic 1 is
the wow moment: it must be reachable before anything else gets built.

## Epic 1 — Core Sprint Loop

- [ ] **1. Load today's #1 trending repo and type it live** *(wow moment)*
  - On page load, the app fetches the top trending repo via
    `fetchTrendingRepos` and displays a real snippet pulled from it (not a
    hardcoded placeholder), with the source repo name shown on screen.
  - If the GitHub API fails or rate-limits, a bundled fallback snippet loads
    instead of a blank or broken page.

- [ ] **2. Real-time keystroke scoring with instant structural-mistake flash**
  - Typing a wrong ordinary character highlights it distinctly from typing a
    wrong bracket/indent character — two visually different states.
  - A structural mistake (bad bracket or broken indent) flashes red within
    one animation frame of the keystroke, not only at run end.

- [ ] **3. Live cursor/highlight tween across the snippet**
  - The active-character highlight animates between characters as the
    player types (tweened, not an instant jump).
  - Backspace moves the highlight back one position and clears the
    previously recorded judgement for that character.

- [ ] **4. Snippet completion detection & run summary**
  - Typing the snippet's final character ends the run and displays WPM and
    accuracy.
  - The summary reports structural mistakes and typos as separate counts.

- [ ] **5. Design polish — Swiss-grid modernist sprint shell**
  - The snippet card and stat rail use `docs/DESIGN.md` tokens (paper
    background, offset shadow, Space Grotesk/IBM Plex Mono pairing) and the
    snippet card fills ≥60vh on desktop.
  - No horizontal scroll or element overlap at 390px, 768px, and 1440px.

## Epic 2 — Live Trending Content & Sourcing

- [ ] **6. GitHub search integration returns real, syntax-valid snippets**
  - `fetchTrendingRepos` returns at least one repo with a non-empty
    `language` field across repeated live calls.
  - A snippet-extraction step pulls a bounded-length excerpt (roughly
    10–40 lines) from an actual file in the chosen repo, not the whole file.

- [ ] **7. Multi-language snippet support**
  - Snippets in at least 3 different languages (e.g. TypeScript, Python, Go)
    tokenize and score without the tokenizer throwing.
  - The UI displays which language the current snippet is written in.

- [ ] **8. Rate-limit and error resilience**
  - A 403/rate-limited GitHub response falls back to the bundled snippet set
    and shows a small inline notice, rather than crashing or going blank.
  - When `VITE_GITHUB_TOKEN` (see `.env.example`) is set, it's sent with the
    request to raise the rate limit.

- [ ] **9. "New snippet" refresh control**
  - A visible control lets the player fetch a different trending snippet
    without reloading the page.
  - Rapid repeated clicks are debounced/disabled while a fetch is in
    flight — no overlapping requests.

- [ ] **10. Design polish — source attribution treatment**
  - The source repo name/link is styled per `docs/DESIGN.md` (not raw
    unstyled text) and opens the repo in a new tab.

## Epic 3 — Stats, Feel & Ship Polish

- [ ] **11. Live WPM/accuracy stat panel**
  - WPM and accuracy values update at least once per second while typing,
    not only at run end.
  - Both are computed from actual elapsed time and correct-character count
    using a documented formula, not placeholder numbers.

- [ ] **12. Win celebration overlay**
  - Completing a run shows the stamped "RUN COMPLETE" overlay with run
    stats and a confetti burst, per `docs/DESIGN.md`.
  - The overlay has exactly one primary CTA ("Next Snippet") that starts a
    new run.

- [ ] **13. Synthesized WebAudio SFX with persisted mute**
  - Correct-keystroke, typo, structural-mistake, and win events each play a
    distinct synthesized tone (oscillators/noise, no audio files) per
    `docs/DESIGN.md`'s SFX list.
  - A mute toggle silences all SFX and its state persists across a page
    reload via `localStorage`.

- [ ] **14. Accessibility & reduced motion**
  - `prefers-reduced-motion` disables line-shake and confetti while keeping
    color flashes and text feedback.
  - The mute button and next-snippet control have `aria-label`s and are
    reachable via keyboard tab order.

- [ ] **15. Design self-review pass at 390 / 768 / 1440**
  - Manual check at all three widths confirms no overlap, no horizontal
    scroll, and no unstyled native controls remain.
  - Findings and fixes are noted in the QA run's STATUS `memory` field per
    the design standard's D3 self-review.
