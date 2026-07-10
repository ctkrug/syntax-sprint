import { useEffect, useState } from "react";

const FULL_TEXT = "SYNTAX SPRINT";
const TYPE_INTERVAL_MS = 70;

/**
 * The page's signature detail (docs/DESIGN.md #4): the wordmark types
 * itself out one letter at a time with a blinking caret, demonstrating the
 * game's own mechanic before the player has touched a key.
 */
export function Wordmark() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= FULL_TEXT.length) return;
    const id = window.setTimeout(() => setVisibleCount((count) => count + 1), TYPE_INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [visibleCount]);

  return (
    <h1 className="wordmark" aria-label={FULL_TEXT}>
      <span aria-hidden="true">{FULL_TEXT.slice(0, visibleCount)}</span>
      <span className="wordmark-caret" aria-hidden="true" />
    </h1>
  );
}
