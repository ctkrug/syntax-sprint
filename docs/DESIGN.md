# Design direction

## 1. Aesthetic direction

**Swiss-grid modernist.** Syntax Sprint is a precision instrument for typing
precision code, so the page reads like an International Typographic Style
poster: a warm off-white paper ground, thick black rules, a strict grid, and
exactly two accent colors used with restraint — a Swiss poster red for the
primary action and code punctuation, and an ink blue as its quieter
counterpart. No gradients, no soft glows, no drop-shadow blur — depth comes
from **hard-edged offset shadows**, like a card stamped slightly off-register
on a printed sheet.

This direction was chosen deliberately against the recent portfolio: the
last several ships (Backflow, Bankroll, Runlocal, Molsnap, Monotile, Almanac,
Bughunt, Plateau) leaned blueprint/technical, and Peel, Injection Range, and
Redosaur leaned terminal-mono/CRT — both dark, glowing, near-black
directions. Syntax Sprint is deliberately light, high-contrast, and flat
where those are dark and luminous, so the portfolio doesn't read as ten
variations on the same phosphor-glow screen.

## 2. Tokens

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#F4F1EA` | page background (warm paper) |
| `--color-surface` | `#EAE5D9` | recessed surface (stat panels, inputs) |
| `--color-surface-raised` | `#FFFFFF` | raised cards (snippet panel, win overlay) |
| `--color-text` | `#191919` | primary ink |
| `--color-text-muted` | `#5C5850` | secondary/meta text |
| `--color-accent` | `#D7263D` | primary actions, wordmark mark, error/structural-mistake flash |
| `--color-accent-support` | `#1D3461` | secondary actions, focus rings, correct-keystroke pulse |
| `--color-success` | `#2E7D32` | run-complete / accuracy-good states |
| `--color-danger` | `#B00020` | structural-mistake emphasis (bracket/indent), distinct from the softer accent red |

**Type pairing:** `Space Grotesk` (700, display — wordmark and headings) +
`IBM Plex Mono` (400/500/600, UI — body copy, stats, **and the code snippet
itself**). Using the mono font as the UI font, not just the code font, is
deliberate: it means the whole interface reads as "typed," reinforcing the
premise instead of treating code as a special embedded widget. Type scale
ratio ~1.25 (14 / 17.5 / 22 / 28 / 45 / 72px).

**Spacing:** 8px base unit (`--space-1` 4px … `--space-6` 48px).

**Corners:** `--radius: 2px` — Swiss posters don't round corners; this is
just enough to soften hard pixel edges on raster displays.

**Shadow:** offset hard shadow, not blur — `4px 4px 0 var(--color-text)` on
raised cards (a solid black block behind the card, like mis-registered print
plates), `2px 2px 0 var(--color-accent)` on the primary button.

**Motion:** UI transitions 180ms ease-out (`--motion-ui`); in-game feedback
(keystroke judgement, bracket flash) 90ms ease-out (`--motion-game`).

## 3. Layout intent

The **snippet + typing surface** is the hero: a single large raised card
holding the code snippet with the live cursor/highlight, sized to fill
**~65% of viewport width and ≥60vh** on desktop (1440×900) — flanked by a
narrow right-hand rail (stat panel: WPM, accuracy, structural-mistake count,
source repo attribution, mute toggle) styled like a ruled ledger column. On
phone (390×844) the rail moves below the snippet card, full width, and the
snippet card itself becomes the entire top of the viewport — no floating
small widget, no dead margin. A thin horizontal ruler bar runs along the very
top of the page at all sizes, ticked like a drafting scale, doubling as a
live WPM/progress gauge as you type.

## 4. Signature detail

The wordmark **"SYNTAX SPRINT"** self-types on load: letters appear one at a
time with a blinking block caret, exactly like the game itself, then the
caret settles into a steady blink beside the locked-in wordmark. It's the
one flourish — the page demonstrates its own mechanic before you've touched
a key.

## 5. The juice plan (game feel)

- **Movement:** the active-character highlight bar slides between
  characters with an 90ms ease-out tween — it never jumps.
- **Impact feedback:** a wrong ordinary character flashes its cell's
  background to a soft accent-support wash for 90ms. A **structural**
  mistake (bad bracket or broken indent) flashes `--color-danger` and gives
  the whole line a 2px, 80ms horizontal shake — visibly worse than a typo,
  matching the scoring model.
- **Goal feedback:** completing a line pops a small "+N WPM" chip that rises
  8px and fades over 200ms.
- **Win celebration:** finishing a snippet shows a full-card overlay styled
  like a stamped approval slip — "RUN COMPLETE" stamped at an angle, run
  stats (WPM, accuracy, structural vs. typo breakdown), a burst of small
  torn-paper confetti rectangles in accent red/ink blue, and one clear
  primary CTA: "Next Snippet."
- **Sound (WebAudio-synthesized, no audio files):**
  - correct keystroke: a very short, quiet high sine blip (~900Hz, 15ms)
  - typo: a short low square-wave thud (~180Hz, 40ms)
  - structural mistake (bracket/indent): a sharper buzz — noise burst with a
    fast downward pitch sweep, louder than a typo but still subtle
  - line complete: a quick two-note rising chime
  - run complete: a three-note major arpeggio fanfare
  - all SFX gated behind a mute toggle persisted to `localStorage`; the
    `AudioContext` is created lazily on first keystroke (autoplay policy)
    and every sound call is a no-op if `AudioContext` is unavailable (tests,
    unsupported browsers)
  - `prefers-reduced-motion` disables the line-shake and confetti but keeps
    color flashes and sound

Every BUILD/QA run follows this file. Changing it later requires its own
commit explaining why.
