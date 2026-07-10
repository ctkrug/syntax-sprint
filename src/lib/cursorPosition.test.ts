import { describe, expect, it } from "vitest";
import { cursorPositionAt } from "./cursorPosition";

describe("cursorPositionAt", () => {
  it("returns row 0 col 0 at the start of the source", () => {
    expect(cursorPositionAt("abc\ndef", 0)).toEqual({ row: 0, col: 0 });
  });

  it("advances the column within the first line", () => {
    expect(cursorPositionAt("abc\ndef", 2)).toEqual({ row: 0, col: 2 });
  });

  it("resets the column and increments the row after a newline", () => {
    expect(cursorPositionAt("abc\ndef", 4)).toEqual({ row: 1, col: 0 });
  });

  it("counts multiple newlines correctly", () => {
    expect(cursorPositionAt("a\nb\nc\nd", 6)).toEqual({ row: 3, col: 0 });
  });

  it("clamps an index past the end of the source", () => {
    expect(cursorPositionAt("abc", 99)).toEqual({ row: 0, col: 3 });
  });

  it("clamps a negative index to zero", () => {
    expect(cursorPositionAt("abc", -5)).toEqual({ row: 0, col: 0 });
  });

  it("handles an empty source", () => {
    expect(cursorPositionAt("", 0)).toEqual({ row: 0, col: 0 });
  });
});
