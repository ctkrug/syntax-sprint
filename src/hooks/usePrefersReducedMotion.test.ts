import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

function stubMatchMedia(initialMatches: boolean) {
  let changeHandler: (() => void) | null = null;
  const mql = {
    matches: initialMatches,
    addEventListener: vi.fn((_event: string, handler: () => void) => {
      changeHandler = handler;
    }),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => mql),
  );
  return {
    mql,
    fireChange(matches: boolean) {
      mql.matches = matches;
      changeHandler?.();
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("usePrefersReducedMotion", () => {
  it("reflects the initial media query state", () => {
    stubMatchMedia(true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it("defaults to false when matchMedia reports no match", () => {
    stubMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  it("updates when the media query change fires", () => {
    const { fireChange } = stubMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(false);
    act(() => fireChange(true));
    expect(result.current).toBe(true);
  });

  it("removes its listener on unmount", () => {
    const { mql } = stubMatchMedia(false);
    const { unmount } = renderHook(() => usePrefersReducedMotion());
    unmount();
    expect(mql.removeEventListener).toHaveBeenCalled();
  });
});
