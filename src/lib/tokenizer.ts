import type { Token } from "../types";

const BRACKETS = new Set(["(", ")", "[", "]", "{", "}"]);

/**
 * Splits a code snippet into scoring-relevant tokens: brackets are kept
 * singular (each one matters individually), leading whitespace on a line is
 * grouped as "indent" so indentation mistakes can be judged as one unit,
 * and everything else falls into words / newlines.
 */
export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let atLineStart = true;

  while (i < source.length) {
    const start = i;
    const ch = source[i];

    if (ch === "\n") {
      tokens.push({ kind: "newline", text: ch, start });
      i += 1;
      atLineStart = true;
      continue;
    }

    if (atLineStart && (ch === " " || ch === "\t")) {
      let j = i;
      while (j < source.length && (source[j] === " " || source[j] === "\t")) {
        j += 1;
      }
      tokens.push({ kind: "indent", text: source.slice(i, j), start });
      i = j;
      continue;
    }

    atLineStart = false;

    if (ch === " " || ch === "\t") {
      let j = i;
      while (j < source.length && (source[j] === " " || source[j] === "\t")) {
        j += 1;
      }
      tokens.push({ kind: "whitespace", text: source.slice(i, j), start });
      i = j;
      continue;
    }

    if (BRACKETS.has(ch)) {
      tokens.push({ kind: "bracket", text: ch, start });
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      let j = i + 1;
      while (j < source.length && source[j] !== quote) {
        j += 1;
      }
      j = Math.min(j + 1, source.length);
      tokens.push({ kind: "string", text: source.slice(i, j), start });
      i = j;
      continue;
    }

    if (ch === "/" && source[i + 1] === "/") {
      let j = i;
      while (j < source.length && source[j] !== "\n") {
        j += 1;
      }
      tokens.push({ kind: "comment", text: source.slice(i, j), start });
      i = j;
      continue;
    }

    let j = i;
    while (
      j < source.length &&
      source[j] !== "\n" &&
      source[j] !== " " &&
      source[j] !== "\t" &&
      !BRACKETS.has(source[j]) &&
      source[j] !== '"' &&
      source[j] !== "'" &&
      source[j] !== "`"
    ) {
      j += 1;
    }
    if (j === i) {
      // Fallback: never loop forever on an unexpected character.
      j = i + 1;
    }
    tokens.push({ kind: "word", text: source.slice(i, j), start });
    i = j;
  }

  return tokens;
}
