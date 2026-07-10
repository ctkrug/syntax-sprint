export interface StatRailProps {
  wpm: number;
  accuracy: number;
  structuralMistakes: number;
  typoMistakes: number;
  language: string;
  repoFullName: string;
  /** Link to the source repo, or null for bundled fallback snippets that have no real repo. */
  repoUrl: string | null;
  notice: string | null;
  muted: boolean;
  onToggleMute: () => void;
  onNewSnippet: () => void;
  newSnippetLoading: boolean;
}

/**
 * The right-hand ledger column (docs/DESIGN.md #3): live stats, source
 * attribution, and the mute / new-snippet controls.
 */
export function StatRail({
  wpm,
  accuracy,
  structuralMistakes,
  typoMistakes,
  language,
  repoFullName,
  repoUrl,
  notice,
  muted,
  onToggleMute,
  onNewSnippet,
  newSnippetLoading,
}: StatRailProps) {
  return (
    <aside className="stat-rail" aria-label="Run statistics">
      <dl className="stat-list">
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
        <div className="stat-row">
          <dt>Language</dt>
          <dd>{language}</dd>
        </div>
      </dl>

      <p className="stat-source">
        Source:{" "}
        {repoUrl ? (
          <a href={repoUrl} target="_blank" rel="noreferrer">
            {repoFullName}
          </a>
        ) : (
          <span>{repoFullName}</span>
        )}
      </p>

      {notice && (
        <p className="stat-notice" role="status">
          {notice}
        </p>
      )}

      <div className="stat-controls">
        <button
          type="button"
          className="control-button"
          onClick={onNewSnippet}
          disabled={newSnippetLoading}
        >
          {newSnippetLoading ? "Loading…" : "New snippet"}
        </button>
        <button
          type="button"
          className="control-button control-button-icon"
          onClick={onToggleMute}
          aria-pressed={muted}
          aria-label={muted ? "Unmute sound" : "Mute sound"}
        >
          {muted ? "Muted" : "Sound on"}
        </button>
      </div>
    </aside>
  );
}
