import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useKeyboardCapture } from "./useKeyboardCapture";

function dispatchKey(key: string, init: Partial<KeyboardEventInit> = {}) {
  window.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, ...init }));
}

describe("useKeyboardCapture", () => {
  it("routes a printable character to onChar", () => {
    const onChar = vi.fn();
    const onBackspace = vi.fn();
    renderHook(() => useKeyboardCapture({ enabled: true, onChar, onBackspace }));

    dispatchKey("a");

    expect(onChar).toHaveBeenCalledWith("a");
    expect(onBackspace).not.toHaveBeenCalled();
  });

  it("routes Backspace to onBackspace and prevents default", () => {
    const onChar = vi.fn();
    const onBackspace = vi.fn();
    renderHook(() => useKeyboardCapture({ enabled: true, onChar, onBackspace }));

    const event = new KeyboardEvent("keydown", { key: "Backspace", bubbles: true, cancelable: true });
    window.dispatchEvent(event);

    expect(onBackspace).toHaveBeenCalledTimes(1);
    expect(onChar).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });

  it("ignores multi-character non-printable keys like Shift", () => {
    const onChar = vi.fn();
    renderHook(() => useKeyboardCapture({ enabled: true, onChar, onBackspace: vi.fn() }));

    dispatchKey("Shift");

    expect(onChar).not.toHaveBeenCalled();
  });

  it("ignores keydowns while a modifier is held", () => {
    const onChar = vi.fn();
    renderHook(() => useKeyboardCapture({ enabled: true, onChar, onBackspace: vi.fn() }));

    dispatchKey("r", { metaKey: true });
    dispatchKey("z", { ctrlKey: true });
    dispatchKey("x", { altKey: true });

    expect(onChar).not.toHaveBeenCalled();
  });

  it("does nothing when disabled", () => {
    const onChar = vi.fn();
    renderHook(() => useKeyboardCapture({ enabled: false, onChar, onBackspace: vi.fn() }));

    dispatchKey("a");

    expect(onChar).not.toHaveBeenCalled();
  });

  it("removes its listener on unmount", () => {
    const onChar = vi.fn();
    const { unmount } = renderHook(() =>
      useKeyboardCapture({ enabled: true, onChar, onBackspace: vi.fn() }),
    );
    unmount();

    dispatchKey("a");

    expect(onChar).not.toHaveBeenCalled();
  });
});
