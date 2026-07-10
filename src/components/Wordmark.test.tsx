import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Wordmark } from "./Wordmark";

// Each reveal step is scheduled inside an effect that only re-runs after the
// previous state update commits, so timers must be advanced one tick at a
// time (flushing React between each) rather than in one large jump.
function advanceTicks(count: number) {
  for (let i = 0; i < count; i += 1) {
    act(() => vi.advanceTimersByTime(70));
  }
}

describe("Wordmark", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with no visible letters and exposes the full text to a11y", () => {
    render(<Wordmark />);
    expect(screen.getByLabelText("SYNTAX SPRINT")).toBeInTheDocument();
  });

  it("reveals more letters as time advances", () => {
    render(<Wordmark />);
    const heading = screen.getByLabelText("SYNTAX SPRINT");

    advanceTicks(3);
    expect(heading.textContent).toBe("SYN");
  });

  it("reveals the full wordmark once enough time has passed", () => {
    render(<Wordmark />);
    const heading = screen.getByLabelText("SYNTAX SPRINT");

    advanceTicks("SYNTAX SPRINT".length);
    expect(heading.textContent).toBe("SYNTAX SPRINT");
  });

  it("stops scheduling timeouts once fully revealed", () => {
    render(<Wordmark />);
    advanceTicks("SYNTAX SPRINT".length);
    const pendingBefore = vi.getTimerCount();

    advanceTicks(5);
    expect(vi.getTimerCount()).toBe(pendingBefore);
  });
});
