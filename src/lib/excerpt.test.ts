import { describe, expect, it } from "vitest";
import { extractExcerpt } from "./excerpt";

function makeLines(count: number, prefix = "line"): string {
  return Array.from({ length: count }, (_, i) => `${prefix}${i}`).join("\n");
}

describe("extractExcerpt", () => {
  it("returns an empty string untouched", () => {
    expect(extractExcerpt("")).toBe("");
  });

  it("returns short content whole, trimmed", () => {
    const content = "\nfunction hi() {\n  return 1;\n}\n";
    expect(extractExcerpt(content)).toBe(content.trim());
  });

  it("returns content exactly at the minLines boundary whole", () => {
    const content = makeLines(10);
    expect(extractExcerpt(content, 10, 40)).toBe(content);
  });

  it("skips a leading license comment block before slicing", () => {
    const header = Array.from({ length: 5 }, (_, i) => `// license line ${i}`).join("\n");
    const body = makeLines(20, "code");
    const excerpt = extractExcerpt(`${header}\n${body}`, 10, 40);
    expect(excerpt.startsWith("code0")).toBe(true);
    expect(excerpt).not.toContain("license");
  });

  it("caps the excerpt at maxLines", () => {
    const content = makeLines(200);
    const excerpt = extractExcerpt(content, 10, 40);
    expect(excerpt.split("\n")).toHaveLength(40);
  });

  it("falls back to the start when skipping comments would leave too little content", () => {
    const content = makeLines(15, "// comment ");
    const excerpt = extractExcerpt(content, 10, 40);
    expect(excerpt).toBe(content);
  });
});
