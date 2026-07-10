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

// The snippet load resolves outside act() (during waitFor polling), so the
// passive effect that attaches useKeyboardCapture's window listener may still
// be pending when the DOM already shows the loaded snippet. Flush effects
// before dispatching keys so the listener is guaranteed attached — otherwise
// the first keystrokes race the effect and are silently dropped.
async function flushEffects() {
  await act(async () => {});
}

async function typeString(text: string) {
  await flushEffects();
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

  it("enables keyboard capture in the same render the snippet appears in (no dropped-keystroke window)", async () => {
    mockedGetDailySnippet.mockResolvedValue(snippetResult("ab"));
    render(<App />);

    await waitFor(() => expect(screen.getByRole("link", { name: "octocat/hello-world" })).toBeInTheDocument());

    // If `loading` lagged `daily` by a render (a separate .then()/.finally()
    // microtask), the New Snippet button would still read "Loading…" here
    // even though the snippet is visible — and keyboardEnabled would be
    // false, silently dropping any keystroke fired at this exact moment.
    expect(screen.getByRole("button", { name: "New snippet" })).toBeInTheDocument();
    expect(screen.queryByText("Loading…")).not.toBeInTheDocument();

    await typeString("a");
    expect(screen.getByText("1 of 2 characters typed")).toBeInTheDocument();
  });

  it("completes a run and shows the win overlay after typing the full snippet", async () => {
    mockedGetDailySnippet.mockResolvedValue(snippetResult("ab"));
    render(<App />);

    await waitFor(() => expect(screen.getByRole("link", { name: "octocat/hello-world" })).toBeInTheDocument());

    await typeString("ab");

    await waitFor(() => expect(screen.getByRole("dialog", { name: "Run complete" })).toBeInTheDocument());
  });

  it("does not intercept Tab (leaves it free for focus navigation) when no tab is expected next", async () => {
    mockedGetDailySnippet.mockResolvedValue(snippetResult("ab"));
    render(<App />);

    await waitFor(() => expect(screen.getByRole("link", { name: "octocat/hello-world" })).toBeInTheDocument());
    await flushEffects();

    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    act(() => {
      window.dispatchEvent(event);
    });

    expect(event.defaultPrevented).toBe(false);
    expect(screen.getByText("0 of 2 characters typed")).toBeInTheDocument();
  });

  it("types a literal tab character when the snippet's next character is a tab", async () => {
    mockedGetDailySnippet.mockResolvedValue(snippetResult("\tx"));
    render(<App />);

    await waitFor(() => expect(screen.getByRole("link", { name: "octocat/hello-world" })).toBeInTheDocument());
    await flushEffects();

    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    act(() => {
      window.dispatchEvent(event);
    });

    expect(event.defaultPrevented).toBe(true);
    expect(screen.getByText("1 of 2 characters typed")).toBeInTheDocument();
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
