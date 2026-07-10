import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTypingGame } from "./useTypingGame";
import type { SoundEngine } from "../lib/sound";

function fakeSoundEngine(): SoundEngine {
  return {
    playCorrect: vi.fn(),
    playTypo: vi.fn(),
    playStructural: vi.fn(),
    playLineComplete: vi.fn(),
    playRunComplete: vi.fn(),
    isMuted: vi.fn(() => false),
    setMuted: vi.fn(),
    toggleMute: vi.fn(() => false),
  };
}

function clock(startMs: number) {
  let current = startMs;
  return {
    now: () => current,
    advance(ms: number) {
      current += ms;
    },
  };
}

describe("useTypingGame", () => {
  it("starts with an empty run", () => {
    const { result } = renderHook(() => useTypingGame("ab", { soundEngine: fakeSoundEngine() }));
    expect(result.current.typed).toBe("");
    expect(result.current.isComplete).toBe(false);
    expect(result.current.wpm).toBe(0);
  });

  it("records a correct keystroke and plays the correct SFX", () => {
    const soundEngine = fakeSoundEngine();
    const { result } = renderHook(() => useTypingGame("ab", { soundEngine }));

    act(() => result.current.typeChar("a"));

    expect(result.current.typed).toBe("a");
    expect(soundEngine.playCorrect).toHaveBeenCalledTimes(1);
    expect(soundEngine.playTypo).not.toHaveBeenCalled();
  });

  it("classifies a mistyped word character as a typo and plays the typo SFX", () => {
    const soundEngine = fakeSoundEngine();
    const { result } = renderHook(() => useTypingGame("ab", { soundEngine }));

    act(() => result.current.typeChar("x"));

    expect(result.current.typoMistakes).toBe(1);
    expect(result.current.structuralMistakes).toBe(0);
    expect(soundEngine.playTypo).toHaveBeenCalledTimes(1);
  });

  it("classifies a mistyped bracket as structural and plays the structural SFX", () => {
    const soundEngine = fakeSoundEngine();
    const { result } = renderHook(() => useTypingGame("(a)", { soundEngine }));

    act(() => result.current.typeChar("x"));

    expect(result.current.structuralMistakes).toBe(1);
    expect(soundEngine.playStructural).toHaveBeenCalledTimes(1);
  });

  it("plays the line-complete SFX when a newline is typed correctly", () => {
    const soundEngine = fakeSoundEngine();
    const { result } = renderHook(() => useTypingGame("a\nb", { soundEngine }));

    act(() => result.current.typeChar("a"));
    act(() => result.current.typeChar("\n"));

    expect(soundEngine.playLineComplete).toHaveBeenCalledTimes(1);
  });

  it("marks the run complete and plays the run-complete SFX on the final character", () => {
    const soundEngine = fakeSoundEngine();
    const { result } = renderHook(() => useTypingGame("ab", { soundEngine }));

    act(() => result.current.typeChar("a"));
    act(() => result.current.typeChar("b"));

    expect(result.current.isComplete).toBe(true);
    expect(soundEngine.playRunComplete).toHaveBeenCalledTimes(1);
  });

  it("ignores further keystrokes once the run is complete", () => {
    const soundEngine = fakeSoundEngine();
    const { result } = renderHook(() => useTypingGame("a", { soundEngine }));

    act(() => result.current.typeChar("a"));
    act(() => result.current.typeChar("z"));

    expect(result.current.typed).toBe("a");
    expect(soundEngine.playRunComplete).toHaveBeenCalledTimes(1);
  });

  it("removes the last character on backspace", () => {
    // Target is 3 chars so the run is still mid-flight (not "complete") after
    // 2 keystrokes and backspace is actually reachable.
    const { result } = renderHook(() => useTypingGame("abc", { soundEngine: fakeSoundEngine() }));

    act(() => result.current.typeChar("a"));
    act(() => result.current.typeChar("x"));
    act(() => result.current.backspace());

    expect(result.current.typed).toBe("a");
  });

  it("is a no-op backspacing an empty run", () => {
    const { result } = renderHook(() => useTypingGame("ab", { soundEngine: fakeSoundEngine() }));

    act(() => result.current.backspace());

    expect(result.current.typed).toBe("");
  });

  it("does not drop keystrokes fired synchronously before a re-render", () => {
    const { result } = renderHook(() => useTypingGame("abc", { soundEngine: fakeSoundEngine() }));

    act(() => {
      result.current.typeChar("a");
      result.current.typeChar("b");
      result.current.typeChar("c");
    });

    expect(result.current.typed).toBe("abc");
    expect(result.current.isComplete).toBe(true);
  });

  it("resets typed, timing, and completion when target changes", () => {
    const { result, rerender } = renderHook(
      ({ target }) => useTypingGame(target, { soundEngine: fakeSoundEngine() }),
      { initialProps: { target: "ab" } },
    );

    act(() => result.current.typeChar("a"));
    expect(result.current.typed).toBe("a");

    rerender({ target: "xyz" });

    expect(result.current.typed).toBe("");
    expect(result.current.isComplete).toBe(false);
  });

  it("resets state when reset() is called explicitly", () => {
    const { result } = renderHook(() => useTypingGame("ab", { soundEngine: fakeSoundEngine() }));

    act(() => result.current.typeChar("a"));
    act(() => result.current.reset());

    expect(result.current.typed).toBe("");
    expect(result.current.wpm).toBe(0);
  });

  it("computes WPM from correct characters and elapsed time via the injectable clock", () => {
    const timer = clock(0);
    const { result } = renderHook(() =>
      useTypingGame("abcde", { soundEngine: fakeSoundEngine(), now: timer.now }),
    );

    act(() => result.current.typeChar("a"));
    timer.advance(60_000);
    act(() => result.current.typeChar("b"));

    // 2 correct chars / 5 chars-per-word = 0.4 words in 1 minute = 0.4 WPM.
    expect(result.current.wpm).toBeCloseTo(0.4, 5);
  });
});
