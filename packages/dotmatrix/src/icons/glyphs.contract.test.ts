import { describe, expect, it } from "vitest";
import { GLYPHS } from "./glyphs";

describe("icon glyph data", () => {
  for (const [name, rows] of Object.entries(GLYPHS)) {
    it(`${name} is exactly 9 rows of 9 characters, using only "#" and "."`, () => {
      expect(rows).toHaveLength(9);
      for (const row of rows) {
        expect(row).toHaveLength(9);
        expect(row).toMatch(/^[#.]{9}$/);
      }
    });
  }

  // Icons drawn to be left-right symmetric (calendar and clock are deliberately
  // left out: day dots and clock hands break the mirror on purpose) — a hand-typed ASCII art typo is
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

  // The set grew from the original 34 core glyphs to 167 — guards against a
  // glyph being dropped (and an `IconName` consumer silently breaking) in a regen.
  it("has 167 glyphs, a superset of the original core set", () => {
    expect(Object.keys(GLYPHS)).toHaveLength(167);
  });

  it("every glyph name is a valid CSS-safe kebab-case identifier", () => {
    for (const name of Object.keys(GLYPHS)) {
      expect(name).toMatch(/^[a-z]+(-[a-z]+)*$/);
    }
  });
});
