import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatRail } from "./StatRail";

function baseProps() {
  return {
    wpm: 42.6,
    accuracy: 0.876,
    structuralMistakes: 2,
    typoMistakes: 5,
    language: "TypeScript",
    repoFullName: "octocat/hello-world",
    repoUrl: "https://github.com/octocat/hello-world",
    notice: null,
    muted: false,
    onToggleMute: vi.fn(),
    onNewSnippet: vi.fn(),
    newSnippetLoading: false,
  };
}

describe("StatRail", () => {
  it("renders rounded WPM and accuracy", () => {
    render(<StatRail {...baseProps()} />);
    expect(screen.getByText("43")).toBeInTheDocument();
    expect(screen.getByText("88%")).toBeInTheDocument();
  });

  it("links the source repo when a live repoUrl is given", () => {
    render(<StatRail {...baseProps()} />);
    const link = screen.getByRole("link", { name: "octocat/hello-world" });
    expect(link).toHaveAttribute("href", "https://github.com/octocat/hello-world");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders plain text (no link) when repoUrl is null", () => {
    render(<StatRail {...baseProps()} repoUrl={null} />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("octocat/hello-world")).toBeInTheDocument();
  });

  it("shows the fallback notice when provided", () => {
    render(<StatRail {...baseProps()} notice="showing a bundled snippet" />);
    expect(screen.getByRole("status")).toHaveTextContent("showing a bundled snippet");
  });

  it("omits the notice element when there is none", () => {
    render(<StatRail {...baseProps()} notice={null} />);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("calls onToggleMute when the mute button is clicked", async () => {
    const props = baseProps();
    render(<StatRail {...props} />);
    screen.getByRole("button", { name: "Mute sound" }).click();
    expect(props.onToggleMute).toHaveBeenCalledTimes(1);
  });

  it("reflects muted state in the button label and aria-pressed", () => {
    render(<StatRail {...baseProps()} muted={true} />);
    const button = screen.getByRole("button", { name: "Unmute sound" });
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("disables the new-snippet button while loading", () => {
    render(<StatRail {...baseProps()} newSnippetLoading={true} />);
    expect(screen.getByRole("button", { name: "Loading…" })).toBeDisabled();
  });
});
