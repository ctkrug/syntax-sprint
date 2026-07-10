import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { getDailySnippet } from "./lib/snippetSource";
import type { Snippet } from "./types";

vi.mock("./lib/snippetSource", () => ({
  getDailySnippet: vi.fn(),
}));

const mockedGetDailySnippet = vi.mocked(getDailySnippet);

function snippetResult(content: string, overrides: Partial<Snippet> = {}) {
  return {
    snippet: { repo: "octocat/hello-world", language: "TypeScript", path: "a.ts", content, ...overrides },
    source: "live" as const,
    notice: null,
  };
}

function typeString(text: string) {
  for (const char of text) {
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: char, bubbles: true }));
    });
  }
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("App", () => {
  it("shows a loading state before the snippet resolves", () => {
    mockedGetDailySnippet.mockReturnValue(new Promise(() => {}));
    render(<App />);
    expect(screen.getByRole("status")).toHaveTextContent("Fetching today's trending snippet");
  });

  it("renders the snippet card and source attribution once loaded", async () => {
    mockedGetDailySnippet.mockResolvedValue(snippetResult("ab"));
    render(<App />);

    await waitFor(() => expect(screen.getByRole("link", { name: "octocat/hello-world" })).toBeInTheDocument());
  });

  it("shows an error state with a retry control when the fetch fails", async () => {
    mockedGetDailySnippet.mockRejectedValue(new Error("network down"));
    render(<App />);

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("completes a run and shows the win overlay after typing the full snippet", async () => {
    mockedGetDailySnippet.mockResolvedValue(snippetResult("ab"));
    render(<App />);

    await waitFor(() => expect(screen.getByRole("link", { name: "octocat/hello-world" })).toBeInTheDocument());

    typeString("ab");

    await waitFor(() => expect(screen.getByRole("dialog", { name: "Run complete" })).toBeInTheDocument());
  });

  it("fetches a new snippet when New Snippet is clicked", async () => {
    mockedGetDailySnippet.mockResolvedValue(snippetResult("ab"));
    render(<App />);

    await waitFor(() => expect(screen.getByRole("link", { name: "octocat/hello-world" })).toBeInTheDocument());

    mockedGetDailySnippet.mockResolvedValue(snippetResult("cd", { repo: "other/repo" }));
    screen.getByRole("button", { name: "New snippet" }).click();

    await waitFor(() => expect(screen.getByRole("link", { name: "other/repo" })).toBeInTheDocument());
    expect(mockedGetDailySnippet).toHaveBeenCalledTimes(2);
  });
});
