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
    renderHook(() => useKeyboardCapture({ enabled: true, interceptTab: false, onChar, onBackspace }));

    dispatchKey("a");

    expect(onChar).toHaveBeenCalledWith("a");
    expect(onBackspace).not.toHaveBeenCalled();
  });

  it("routes Backspace to onBackspace and prevents default", () => {
    const onChar = vi.fn();
    const onBackspace = vi.fn();
    renderHook(() => useKeyboardCapture({ enabled: true, interceptTab: false, onChar, onBackspace }));

    const event = new KeyboardEvent("keydown", { key: "Backspace", bubbles: true, cancelable: true });
    window.dispatchEvent(event);

    expect(onBackspace).toHaveBeenCalledTimes(1);
    expect(onChar).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });

  it("routes Tab to onChar as a literal tab character and prevents default when interceptTab is true", () => {
    const onChar = vi.fn();
    const onBackspace = vi.fn();
    renderHook(() => useKeyboardCapture({ enabled: true, interceptTab: true, onChar, onBackspace }));

    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    window.dispatchEvent(event);

    expect(onChar).toHaveBeenCalledWith("\t");
    expect(onBackspace).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });

  it("leaves Tab's native focus navigation alone when interceptTab is false", () => {
    const onChar = vi.fn();
    const onBackspace = vi.fn();
    renderHook(() => useKeyboardCapture({ enabled: true, interceptTab: false, onChar, onBackspace }));

    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    window.dispatchEvent(event);

    expect(onChar).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it("ignores multi-character non-printable keys like Shift", () => {
    const onChar = vi.fn();
    renderHook(() =>
      useKeyboardCapture({ enabled: true, interceptTab: false, onChar, onBackspace: vi.fn() }),
    );

    dispatchKey("Shift");

    expect(onChar).not.toHaveBeenCalled();
  });

  it("ignores keydowns while a modifier is held", () => {
    const onChar = vi.fn();
    renderHook(() =>
      useKeyboardCapture({ enabled: true, interceptTab: false, onChar, onBackspace: vi.fn() }),
    );

    dispatchKey("r", { metaKey: true });
    dispatchKey("z", { ctrlKey: true });
    dispatchKey("x", { altKey: true });

    expect(onChar).not.toHaveBeenCalled();
  });

  it("does nothing when disabled", () => {
    const onChar = vi.fn();
    renderHook(() =>
      useKeyboardCapture({ enabled: false, interceptTab: false, onChar, onBackspace: vi.fn() }),
    );

    dispatchKey("a");

    expect(onChar).not.toHaveBeenCalled();
  });

  it("removes its listener on unmount", () => {
    const onChar = vi.fn();
    const { unmount } = renderHook(() =>
      useKeyboardCapture({ enabled: true, interceptTab: false, onChar, onBackspace: vi.fn() }),
    );
    unmount();

    dispatchKey("a");

    expect(onChar).not.toHaveBeenCalled();
  });
});
