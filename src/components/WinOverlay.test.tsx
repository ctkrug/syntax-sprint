import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WinOverlay } from "./WinOverlay";

function baseProps() {
  return {
    wpm: 55.4,
    accuracy: 0.92,
    structuralMistakes: 1,
    typoMistakes: 3,
    reducedMotion: false,
    onNext: vi.fn(),
  };
}

describe("WinOverlay", () => {
  it("renders as an accessible dialog", () => {
    render(<WinOverlay {...baseProps()} />);
    expect(screen.getByRole("dialog", { name: "Run complete" })).toBeInTheDocument();
  });

  it("shows rounded run stats", () => {
    render(<WinOverlay {...baseProps()} />);
    expect(screen.getByText("55")).toBeInTheDocument();
    expect(screen.getByText("92%")).toBeInTheDocument();
  });

  it("renders confetti pieces by default", () => {
    const { container } = render(<WinOverlay {...baseProps()} />);
    expect(container.querySelectorAll(".confetti-piece").length).toBeGreaterThan(0);
  });

  it("omits confetti under reduced motion", () => {
    const { container } = render(<WinOverlay {...baseProps()} reducedMotion={true} />);
    expect(container.querySelectorAll(".confetti-piece").length).toBe(0);
  });

  it("still shows stats and the CTA under reduced motion", () => {
    render(<WinOverlay {...baseProps()} reducedMotion={true} />);
    expect(screen.getByRole("button", { name: "Next Snippet" })).toBeInTheDocument();
  });

  it("calls onNext exactly once when the CTA is clicked", () => {
    const props = baseProps();
    render(<WinOverlay {...props} />);
    screen.getByRole("button", { name: "Next Snippet" }).click();
    expect(props.onNext).toHaveBeenCalledTimes(1);
  });

  it("moves focus to the Next Snippet CTA on mount", () => {
    render(<WinOverlay {...baseProps()} />);
    expect(screen.getByRole("button", { name: "Next Snippet" })).toHaveFocus();
  });

  it("traps Tab within the dialog instead of letting focus escape", () => {
    render(<WinOverlay {...baseProps()} />);
    const dialog = screen.getByRole("dialog", { name: "Run complete" });
    const cta = screen.getByRole("button", { name: "Next Snippet" });

    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    fireEvent(dialog, event);

    expect(event.defaultPrevented).toBe(true);
    expect(cta).toHaveFocus();
  });
});
