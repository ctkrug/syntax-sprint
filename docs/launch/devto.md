---
title: "I built a typing game that scores your brackets differently from your typos"
published: false
tags: javascript, react, typescript, webdev
---

I use typing games to warm up before I start coding. Monkeytype, TypeRacer,
the usual ones. They're good, but something always bugged me: when I'm typing
code, a wrong closing brace costs exactly as much as a stray space. That's the
correct call for prose, where a typo is a typo. It's the wrong call for code,
where a misplaced bracket or a broken indent is the difference between code
that runs and code that doesn't.

So I built **Syntax Sprint**: a typing game that pulls a real source file from
one of today's trending GitHub repos and scores you the way code actually
breaks. Fumble a bracket and it flashes red on its line and lands in a
separate "structural mistakes" column, apart from your ordinary typos.

Live demo: https://apps.charliekrug.com/syntax-sprint/
Source: https://github.com/ctkrug/syntax-sprint

Two decisions were more interesting than I expected.

## Scoring needs a tokenizer, not a string diff

The obvious way to score typing is a character-by-character comparison, and
that's still the core loop here. The twist is that each mismatch has to be
classified. To know whether the character you just missed was a bracket or an
indent (structural) versus anything else (a plain typo), the snippet gets
tokenized up front.

I deliberately did not reach for a real language parser. A per-language grammar
would mean shipping a parser per language and breaking the moment a trending
repo shows up in something I didn't plan for. Instead the tokenizer is
*structural*, not grammatical: it walks the text once and buckets characters
into brackets, leading-whitespace indents, strings, comments, and words. It
doesn't understand Rust or Go semantics; it understands that `)` is a bracket
and that the spaces at the start of a line are indentation. That's enough to
score the two mistake classes correctly across every C-family and
whitespace-significant language, and it's a single file with no dependencies.

The scorer then builds a map from each character offset to the token kind it
belongs to, and a mismatch inside a bracket or indent token becomes a
structural mistake. Cheap, language-agnostic, and easy to test exhaustively.

## The keystroke race that dropped characters

The subtle bug that took the longest to pin down: fast typing occasionally
dropped a character. The typing state lived in a React `useState`, and when
several keystrokes arrived before React re-rendered (key repeat, batched
updates), each handler read the same stale `typed` value from its closure and
overwrote the previous one. One of the keystrokes vanished.

The fix was to keep the source of truth in a `useRef` alongside the state.
Each keystroke reads and writes the ref synchronously, so it always sees the
previous keystroke's result, and then mirrors into state to trigger a render.
The ref is the truth; the state is the view. Obvious in hindsight, invisible
until you type fast enough to lose a bracket you were sure you hit.

## Everything else is generated in code

There are no binary assets. The sound effects are synthesized with WebAudio
oscillators (a short high blip for a correct key, a low square-wave buzz for a
typo, a sawtooth sweep for a structural mistake), the favicon is an inline SVG,
and the win-screen confetti is CSS. The AudioContext is created lazily on the
first keystroke so it respects the browser autoplay policy, and it no-ops
cleanly in environments without WebAudio so the tests don't need a mock.

## What I'd do differently

Right now "trending" is a proxy: the GitHub search API sorted by stars among
recently-created repos, because the real trending page has no API. It's close
but not identical to what you'd see on github.com/trending. If I kept building,
I'd add a small scheduled job to snapshot the actual trending page so the
snippet really is today's number one.

If you try it, I'd genuinely like to know whether the structural-vs-typo split
matches your gut sense of which mistakes feel worse while coding. That
distinction is the whole premise, and it's the part I'm least sure I got right.
