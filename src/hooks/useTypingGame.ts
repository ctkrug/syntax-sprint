import { useCallback, useEffect, useMemo, useState } from "react";
import { scoreRun } from "../lib/scoring";
import { calculateWpm } from "../lib/wpm";
import type { CharJudgement } from "../lib/scoring";
import type { SoundEngine } from "../lib/sound";

export interface UseTypingGameOptions {
  soundEngine: SoundEngine;
  /** Injectable clock so tests can control elapsed time deterministically. */
  now?: () => number;
}

export interface TypingGameState {
  typed: string;
  /** Index of the next character to type — where the live highlight sits. */
  activeIndex: number;
  judgements: CharJudgement[];
  isComplete: boolean;
  wpm: number;
  accuracy: number;
  structuralMistakes: number;
  typoMistakes: number;
  typeChar: (char: string) => void;
  backspace: () => void;
  reset: () => void;
}

const TICK_MS = 500;

/**
 * Drives one typing run against `target`: scores every keystroke via
 * scoring.ts (re-scoring the whole typed-so-far string is cheap at
 * snippet length), plays the matching SFX, and ticks its own clock twice a
 * second so WPM/accuracy stay live even between keystrokes. Resets
 * automatically whenever `target` changes (a new snippet loaded).
 */
export function useTypingGame(target: string, options: UseTypingGameOptions): TypingGameState {
  const { soundEngine, now = Date.now } = options;
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [completedAt, setCompletedAt] = useState<number | null>(null);
  const [, forceTick] = useState(0);

  const isComplete = typed.length === target.length;

  useEffect(() => {
    setTyped("");
    setStartedAt(null);
    setCompletedAt(null);
  }, [target]);

  useEffect(() => {
    if (startedAt === null || isComplete) return;
    const id = window.setInterval(() => forceTick((t) => t + 1), TICK_MS);
    return () => window.clearInterval(id);
  }, [startedAt, isComplete]);

  const result = useMemo(() => scoreRun(target, typed), [target, typed]);

  const elapsedMs = startedAt === null ? 0 : (completedAt ?? now()) - startedAt;
  const wpm = calculateWpm(result.correctCount, elapsedMs);

  const typeChar = useCallback(
    (char: string) => {
      if (isComplete) return;

      const nextTyped = typed + char;
      const nextResult = scoreRun(target, nextTyped);
      const judgement = nextResult.judgements[nextResult.judgements.length - 1];

      if (startedAt === null) setStartedAt(now());

      if (judgement.correct) {
        soundEngine.playCorrect();
        if (target[typed.length] === "\n") soundEngine.playLineComplete();
      } else if (judgement.mistakeKind === "structural") {
        soundEngine.playStructural();
      } else {
        soundEngine.playTypo();
      }

      setTyped(nextTyped);

      if (nextTyped.length === target.length) {
        setCompletedAt(now());
        soundEngine.playRunComplete();
      }
    },
    [isComplete, typed, target, startedAt, soundEngine, now],
  );

  const backspace = useCallback(() => {
    if (isComplete || typed.length === 0) return;
    setTyped((current) => current.slice(0, -1));
  }, [isComplete, typed.length]);

  const reset = useCallback(() => {
    setTyped("");
    setStartedAt(null);
    setCompletedAt(null);
  }, []);

  return {
    typed,
    activeIndex: typed.length,
    judgements: result.judgements,
    isComplete,
    wpm,
    accuracy: result.accuracy,
    structuralMistakes: result.structuralMistakes,
    typoMistakes: result.typoMistakes,
    typeChar,
    backspace,
    reset,
  };
}
