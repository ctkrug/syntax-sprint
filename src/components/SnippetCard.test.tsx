import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SnippetCard } from "./SnippetCard";
import { scoreRun } from "../lib/scoring";

// index 3 is the "(" bracket; index 9-10 is the "  " indent on line 2 —
// both structural. Everything else (words, plain whitespace) is not.
const TARGET = "if (x) {\n  y();\n}";

function renderCard(typed: string, overrides: Partial<Parameters<typeof SnippetCard>[0]> = {}) {
  const { judgements } = scoreRun(TARGET, typed);
  return render(
    <SnippetCard
      target={TARGET}
      typed={typed}
      judgements={judgements}
      structuralMistakeRow={null}
      mistakeSeq={0}
      reducedMotion={false}
      {...overrides}
    />,
  );
}

describe("SnippetCard", () => {
  it("marks every untyped character as pending", () => {
    const { container } = renderCard("");
    // Newlines end a line rather than rendering their own cell, and index 0
    // is "active" (the cursor sits there), not "pending".
    const newlineCount = TARGET.split("\n").length - 1;
    expect(container.querySelectorAll(".snippet-char-pending").length).toBe(
      TARGET.length - newlineCount - 1,
    );
  });

  it("marks a correctly typed character as correct", () => {
    const { container } = renderCard("i");
    expect(container.querySelector(".snippet-char-correct")).not.toBeNull();
  });

  it("marks a mistyped ordinary word character as a typo, not structural", () => {
    const { container } = renderCard("ix");
    expect(container.querySelector(".snippet-char-mistake-typo")).not.toBeNull();
    expect(container.querySelector(".snippet-char-mistake-structural")).toBeNull();
  });

  it("marks a mistyped bracket as structural, not a typo", () => {
    const { container } = renderCard("if x");
    expect(container.querySelector(".snippet-char-mistake-structural")).not.toBeNull();
    expect(container.querySelector(".snippet-char-mistake-typo")).toBeNull();
  });

  it("applies the shake class to the line with a structural mistake", () => {
    const { container } = renderCard("if x", { structuralMistakeRow: 0, mistakeSeq: 1 });
    expect(container.querySelector(".snippet-line-shake")).not.toBeNull();
  });

  it("does not shake when reduced motion is preferred", () => {
    const { container } = renderCard("if x", {
      structuralMistakeRow: 0,
      mistakeSeq: 1,
      reducedMotion: true,
    });
    expect(container.querySelector(".snippet-line-shake")).toBeNull();
  });

  it("announces typed-character progress via the live region", () => {
    renderCard("if");
    expect(screen.getByRole("status")).toHaveTextContent(`2 of ${TARGET.length} characters typed`);
  });
});
