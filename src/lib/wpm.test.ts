import { describe, expect, it } from "vitest";
import { calculateWpm } from "./wpm";

describe("calculateWpm", () => {
  it("computes wpm from correct chars over elapsed minutes", () => {
    // 25 correct chars (5 words) in 12s (0.2 min) => 25 wpm
    expect(calculateWpm(25, 12_000)).toBe(25);
  });

  it("returns 0 when no time has elapsed", () => {
    expect(calculateWpm(25, 0)).toBe(0);
  });

  it("returns 0 for a negative elapsed time", () => {
    expect(calculateWpm(25, -100)).toBe(0);
  });

  it("returns 0 when no characters have been typed correctly yet", () => {
    expect(calculateWpm(0, 12_000)).toBe(0);
  });

  it("scales linearly with elapsed time", () => {
    expect(calculateWpm(50, 60_000)).toBe(10);
    expect(calculateWpm(50, 30_000)).toBe(20);
  });
});
