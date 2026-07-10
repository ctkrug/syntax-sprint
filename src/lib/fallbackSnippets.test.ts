import { describe, expect, it } from "vitest";
import { FALLBACK_SNIPPETS, getFallbackSnippet } from "./fallbackSnippets";

describe("FALLBACK_SNIPPETS", () => {
  it("covers at least three distinct languages", () => {
    const languages = new Set(FALLBACK_SNIPPETS.map((s) => s.language));
    expect(languages.size).toBeGreaterThanOrEqual(3);
  });

  it("every entry has non-empty content and path", () => {
    for (const snippet of FALLBACK_SNIPPETS) {
      expect(snippet.content.length).toBeGreaterThan(0);
      expect(snippet.path.length).toBeGreaterThan(0);
    }
  });
});

describe("getFallbackSnippet", () => {
  it("picks the first entry when the RNG returns 0", () => {
    expect(getFallbackSnippet(() => 0)).toBe(FALLBACK_SNIPPETS[0]);
  });

  it("picks the last entry when the RNG returns just under 1", () => {
    expect(getFallbackSnippet(() => 0.9999)).toBe(
      FALLBACK_SNIPPETS[FALLBACK_SNIPPETS.length - 1],
    );
  });

  it("defaults to Math.random when no RNG is supplied", () => {
    const snippet = getFallbackSnippet();
    expect(FALLBACK_SNIPPETS).toContain(snippet);
  });
});
