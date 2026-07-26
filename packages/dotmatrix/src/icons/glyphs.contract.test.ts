import { describe, expect, it } from "vitest";
import { GLYPHS } from "./glyphs";

describe("icon glyph data", () => {
  for (const [name, rows] of Object.entries(GLYPHS)) {
    it(`${name} is exactly 8 rows of 8 characters, using only "#" and "."`, () => {
      expect(rows).toHaveLength(8);
      for (const row of rows) {
        expect(row).toHaveLength(8);
        expect(row).toMatch(/^[#.]{8}$/);
      }
    });
  }

  // Icons drawn to be left-right symmetric — a hand-typed ASCII art typo is
  // exactly the kind of thing that silently ships a lopsided glyph, so this
  // asserts the intended symmetry holds rather than trusting the art by eye.
  const symmetric: Array<keyof typeof GLYPHS> = [
    "close",
    "plus",
    "minus",
    "warning",
    "info",
    "circle",
    "chevron-down",
    "chevron-up",
    "eye",
    "trash",
    "star",
    "lock",
    "user",
    "calendar",
    "clock",
    "settings",
    "filter",
    "more-horizontal",
    "download",
    "upload",
    "maximize",
    "minimize",
  ];
  for (const name of symmetric) {
    it(`${name} is left-right mirror symmetric`, () => {
      for (const row of GLYPHS[name]) {
        expect(row).toBe([...row].reverse().join(""));
      }
    });
  }

  it("every glyph name is a valid CSS-safe kebab-case identifier", () => {
    for (const name of Object.keys(GLYPHS)) {
      expect(name).toMatch(/^[a-z]+(-[a-z]+)*$/);
    }
  });
});
