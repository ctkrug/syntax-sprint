import { describe, expect, it, vi } from "vitest";
import { getDailySnippet } from "./snippetSource";
import { FALLBACK_SNIPPETS } from "./fallbackSnippets";

function searchResponse(items: unknown[]) {
  return { ok: true, status: 200, json: async () => ({ items }) };
}

function contentsResponse(entries: unknown[]) {
  return { ok: true, status: 200, json: async () => entries };
}

function rawResponse(text: string) {
  return { ok: true, status: 200, text: async () => text };
}

const REPO_ITEM = {
  full_name: "octo/widgets",
  language: "TypeScript",
  stargazers_count: 1234,
  html_url: "https://github.com/octo/widgets",
};

describe("getDailySnippet", () => {
  it("returns a live snippet from the first repo that yields one", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(searchResponse([REPO_ITEM]))
      .mockResolvedValueOnce(
        contentsResponse([
          { name: "index.ts", path: "index.ts", type: "file", download_url: "https://raw/index.ts" },
        ]),
      )
      .mockResolvedValueOnce(rawResponse("export const x = 1;\n"));

    const result = await getDailySnippet(fetchImpl as unknown as typeof fetch);

    expect(result).toEqual({
      snippet: { repo: "octo/widgets", language: "TypeScript", path: "index.ts", content: "export const x = 1;" },
      source: "live",
      notice: null,
    });
  });

  it("falls back with a notice when the trending search itself fails", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 403 });

    const result = await getDailySnippet(fetchImpl as unknown as typeof fetch, () => 0);

    expect(result.source).toBe("fallback");
    expect(result.snippet).toBe(FALLBACK_SNIPPETS[0]);
    expect(result.notice).toMatch(/unavailable/i);
  });

  it("skips repos with no language and falls back when none yield a snippet", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        searchResponse([
          { ...REPO_ITEM, full_name: "octo/no-lang", language: null },
          { ...REPO_ITEM, full_name: "octo/no-code" },
        ]),
      )
      .mockResolvedValueOnce(
        contentsResponse([{ name: "README.md", path: "README.md", type: "file", download_url: "x" }]),
      );

    const result = await getDailySnippet(fetchImpl as unknown as typeof fetch, () => 0);

    expect(result.source).toBe("fallback");
    expect(result.notice).toMatch(/trending repos/i);
    // only one contents call: the no-language repo was skipped entirely
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
