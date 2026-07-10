import { describe, expect, it } from "vitest";
import { scoreRun } from "./scoring";
import { FALLBACK_SNIPPETS } from "./fallbackSnippets";

describe("scoreRun", () => {
  it("reports full accuracy on a perfect match", () => {
    const result = scoreRun("const x = 1;", "const x = 1;");
    expect(result.accuracy).toBe(1);
    expect(result.structuralMistakes).toBe(0);
    expect(result.typoMistakes).toBe(0);
  });

  it("classifies a bracket mismatch as structural", () => {
    const result = scoreRun("f(1)", "f[1)");
    expect(result.structuralMistakes).toBe(1);
    expect(result.typoMistakes).toBe(0);
  });

  it("classifies a mismatched indent character as structural", () => {
    const result = scoreRun(" return 1", "\treturn 1");
    expect(result.structuralMistakes).toBe(1);
  });

  it("classifies an ordinary letter mismatch as a typo", () => {
    const result = scoreRun("hello", "hallo");
    expect(result.typoMistakes).toBe(1);
    expect(result.structuralMistakes).toBe(0);
  });

  it("ignores extra typed characters past the end of the target", () => {
    const result = scoreRun("ab", "abcdef");
    expect(result.judgements).toHaveLength(2);
    expect(result.accuracy).toBe(1);
  });

  it("reports full accuracy for an empty target instead of dividing by zero", () => {
    const result = scoreRun("", "");
    expect(result.accuracy).toBe(1);
    expect(result.judgements).toHaveLength(0);
  });

  it("scores every bundled snippet's language without throwing", () => {
    const languages = new Set(FALLBACK_SNIPPETS.map((s) => s.language));
    expect(languages.size).toBeGreaterThanOrEqual(3);

    for (const snippet of FALLBACK_SNIPPETS) {
      expect(() => scoreRun(snippet.content, snippet.content)).not.toThrow();
      const result = scoreRun(snippet.content, snippet.content);
      expect(result.accuracy).toBe(1);
    }
  });
});
