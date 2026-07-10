import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RulerBar } from "./RulerBar";

describe("RulerBar", () => {
  it("reports 0% progress via the progressbar role", () => {
    render(<RulerBar progress={0} wpm={0} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });

  it("reports partial progress rounded to the nearest percent", () => {
    render(<RulerBar progress={0.337} wpm={42} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "34");
  });

  it("clamps progress above 1 to 100%", () => {
    render(<RulerBar progress={1.5} wpm={0} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("clamps negative progress to 0%", () => {
    render(<RulerBar progress={-0.2} wpm={0} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });

  it("displays the rounded WPM value", () => {
    render(<RulerBar progress={0.5} wpm={63.8} />);
    expect(screen.getByText("64 WPM")).toBeInTheDocument();
  });
});
