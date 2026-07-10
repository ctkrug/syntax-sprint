import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RulerBar } from "./components/RulerBar";
import { SnippetCard } from "./components/SnippetCard";
import { StatRail } from "./components/StatRail";
import { WinOverlay } from "./components/WinOverlay";
import { Wordmark } from "./components/Wordmark";
import { useKeyboardCapture } from "./hooks/useKeyboardCapture";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import { useTypingGame } from "./hooks/useTypingGame";
import { cursorPositionAt } from "./lib/cursorPosition";
import { getDailySnippet } from "./lib/snippetSource";
import { createSoundEngine } from "./lib/sound";
import type { DailySnippetResult } from "./lib/snippetSource";

function repoUrlFor(result: DailySnippetResult): string | null {
  return result.source === "live" ? `https://github.com/${result.snippet.repo}` : null;
}

export default function App() {
  const [soundEngine] = useState(() => createSoundEngine());
  const [muted, setMutedState] = useState(() => soundEngine.isMuted());
  const [daily, setDaily] = useState<DailySnippetResult | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const [mistakeSeq, setMistakeSeq] = useState(0);
  const [structuralMistakeRow, setStructuralMistakeRow] = useState<number | null>(null);

  const target = daily?.snippet.content ?? "";
  const typingGame = useTypingGame(target, { soundEngine });

  const loadSnippet = useCallback(() => {
    setLoading(true);
    setLoadError(false);
    getDailySnippet()
      .then((result) => {
        setDaily(result);
        setMistakeSeq(0);
        setStructuralMistakeRow(null);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSnippet();
    // Runs once on mount; loadSnippet is stable (no reactive deps).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const previousTypedLength = useRef(0);
  useEffect(() => {
    if (typingGame.typed.length <= previousTypedLength.current) {
      previousTypedLength.current = typingGame.typed.length;
      return;
    }
    previousTypedLength.current = typingGame.typed.length;

    const lastJudgement = typingGame.judgements[typingGame.judgements.length - 1];
    if (lastJudgement && !lastJudgement.correct && lastJudgement.mistakeKind === "structural") {
      const row = cursorPositionAt(target, typingGame.typed.length - 1).row;
      setStructuralMistakeRow(row);
      setMistakeSeq((seq) => seq + 1);
    }
  }, [typingGame.typed, typingGame.judgements, target]);

  const toggleMute = useCallback(() => {
    const nextMuted = soundEngine.toggleMute();
    setMutedState(nextMuted);
  }, [soundEngine]);

  const keyboardEnabled = daily !== null && !typingGame.isComplete && !loading;
  useKeyboardCapture({
    enabled: keyboardEnabled,
    onChar: typingGame.typeChar,
    onBackspace: typingGame.backspace,
  });

  const progress = useMemo(
    () => (target.length === 0 ? 0 : typingGame.typed.length / target.length),
    [target.length, typingGame.typed.length],
  );

  if (loadError) {
    return (
      <main className="app-shell app-shell-status">
        <Wordmark />
        <p className="status-message status-message-error" role="alert">
          Couldn&apos;t load a snippet right now.
        </p>
        <button type="button" className="control-button control-button-primary" onClick={loadSnippet}>
          Try again
        </button>
      </main>
    );
  }

  if (!daily) {
    return (
      <main className="app-shell app-shell-status">
        <Wordmark />
        <p className="status-message" role="status">
          Fetching today&apos;s trending snippet…
        </p>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <RulerBar progress={progress} wpm={typingGame.wpm} />
      <header className="app-header">
        <Wordmark />
        <p className="tagline">
          Type today&apos;s trending code. Fumble a bracket, see it flash red.
        </p>
      </header>
      <div className="game-layout">
        <SnippetCard
          target={target}
          typed={typingGame.typed}
          judgements={typingGame.judgements}
          structuralMistakeRow={structuralMistakeRow}
          mistakeSeq={mistakeSeq}
          reducedMotion={reducedMotion}
        />
        <StatRail
          wpm={typingGame.wpm}
          accuracy={typingGame.accuracy}
          structuralMistakes={typingGame.structuralMistakes}
          typoMistakes={typingGame.typoMistakes}
          language={daily.snippet.language}
          repoFullName={daily.snippet.repo}
          repoUrl={repoUrlFor(daily)}
          notice={daily.notice}
          muted={muted}
          onToggleMute={toggleMute}
          onNewSnippet={loadSnippet}
          newSnippetLoading={loading}
        />
      </div>
      {typingGame.isComplete && (
        <WinOverlay
          wpm={typingGame.wpm}
          accuracy={typingGame.accuracy}
          structuralMistakes={typingGame.structuralMistakes}
          typoMistakes={typingGame.typoMistakes}
          reducedMotion={reducedMotion}
          onNext={loadSnippet}
        />
      )}
    </main>
  );
}
