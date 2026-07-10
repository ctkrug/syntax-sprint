const TICK_COUNT = 40;

export interface RulerBarProps {
  /** 0–1 fraction of the snippet typed so far. */
  progress: number;
  wpm: number;
}

/**
 * The thin drafting-scale ruler across the top of the page (docs/DESIGN.md
 * #3): a row of tick marks with a fill bar that doubles as the live
 * progress/WPM gauge while typing.
 */
export function RulerBar({ progress, wpm }: RulerBarProps) {
  const clamped = Math.max(0, Math.min(progress, 1));

  return (
    <div className="ruler-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(clamped * 100)} aria-label="Snippet progress">
      <div className="ruler-fill" style={{ width: `${clamped * 100}%` }} />
      <div className="ruler-ticks" aria-hidden="true">
        {Array.from({ length: TICK_COUNT }, (_, i) => (
          <span key={i} className={i % 5 === 0 ? "ruler-tick ruler-tick-major" : "ruler-tick"} />
        ))}
      </div>
      <span className="ruler-wpm">{Math.round(wpm)} WPM</span>
    </div>
  );
}
