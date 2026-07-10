import { describe, expect, it } from "vitest";
import { tokenize } from "./tokenizer";

describe("tokenize", () => {
  it("groups leading indentation into a single indent token", () => {
    const tokens = tokenize("  return 1\n");
    expect(tokens[0]).toMatchObject({ kind: "indent", text: "  " });
  });

  it("emits each bracket as its own token", () => {
    const tokens = tokenize("f([1])");
    const brackets = tokens.filter((t) => t.kind === "bracket").map((t) => t.text);
    expect(brackets).toEqual(["(", "[", "]", ")"]);
  });

  it("keeps string literals intact as a single token", () => {
    const tokens = tokenize('const s = "hello world";');
    const strings = tokens.filter((t) => t.kind === "string");
    expect(strings).toHaveLength(1);
    expect(strings[0].text).toBe('"hello world"');
  });

  it("captures a line comment through end of line", () => {
    const tokens = tokenize("x = 1 // note\ny = 2");
    const comment = tokens.find((t) => t.kind === "comment");
    expect(comment?.text).toBe("// note");
  });

  it("splits multiple lines with newline tokens", () => {
    const tokens = tokenize("a\nb");
    expect(tokens.map((t) => t.kind)).toEqual(["word", "newline", "word"]);
  });
});
