import { useEffect, useRef } from "react";

const CONFETTI_COUNT = 24;
const CONFETTI_COLORS = ["confetti-accent", "confetti-support"];

export interface WinOverlayProps {
  wpm: number;
  accuracy: number;
  structuralMistakes: number;
  typoMistakes: number;
  reducedMotion: boolean;
  onNext: () => void;
  /** True while the next snippet is already being fetched. */
  nextLoading: boolean;
}

/**
 * A stamped-approval-slip win moment (docs/DESIGN.md #5): run stats, a
 * torn-paper confetti burst (skipped under reduced motion), and a single
 * "Next Snippet" CTA.
 */
export function WinOverlay({
  wpm,
  accuracy,
  structuralMistakes,
  typoMistakes,
  reducedMotion,
  onNext,
  nextLoading,
}: WinOverlayProps) {
  const ctaRef = useRef<HTMLButtonElement>(null);

  // Standard modal behavior: move focus into the dialog on open, and trap it
  // there — the underlying stat rail's controls stay in the DOM (just
  // visually covered), so without this a keyboard user could Tab straight
  // into a "New snippet"/mute button they can't see.
  useEffect(() => {
    ctaRef.current?.focus();
  }, []);

  function trapFocus(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    event.preventDefault();
    ctaRef.current?.focus();
  }

  return (
    <div
      className="win-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Run complete"
      onKeyDown={trapFocus}
    >
      {!reducedMotion && (
        <div className="confetti-field" aria-hidden="true">
          {Array.from({ length: CONFETTI_COUNT }, (_, i) => {
            const left = ((i * 37) % 100).toFixed(0);
            const delay = ((i * 53) % 400) / 1000;
            const rotate = (i * 29) % 360;
            const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
            return (
              <span
                key={i}
                className={`confetti-piece ${color}`}
                style={{
                  left: `${left}%`,
                  animationDelay: `${delay}s`,
                  transform: `rotate(${rotate}deg)`,
                }}
              />
            );
          })}
        </div>
      )}

      <div className="win-card">
        <p className="win-stamp">RUN COMPLETE</p>
        <dl className="win-stats">
          <div className="stat-row">
            <dt>WPM</dt>
            <dd>{Math.round(wpm)}</dd>
          </div>
          <div className="stat-row">
            <dt>Accuracy</dt>
            <dd>{Math.round(accuracy * 100)}%</dd>
          </div>
          <div className="stat-row">
            <dt>Structural mistakes</dt>
            <dd className="stat-value-danger">{structuralMistakes}</dd>
          </div>
          <div className="stat-row">
            <dt>Typos</dt>
            <dd>{typoMistakes}</dd>
          </div>
        </dl>
        <button
          ref={ctaRef}
          type="button"
          className="control-button control-button-primary"
          onClick={onNext}
          disabled={nextLoading}
        >
          {nextLoading ? "Loading…" : "Next Snippet"}
        </button>
      </div>
    </div>
  );
}
