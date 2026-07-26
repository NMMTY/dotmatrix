import { describe, expect, it } from "vitest";
import { hexToHsl, hslToHex, isValidHex } from "./color";

describe("isValidHex", () => {
  it.each(["#fff", "#ffffff", "fff", "123abc", "#ABCDEF"])("accepts %s", (hex) => {
    expect(isValidHex(hex)).toBe(true);
  });

  it.each(["#ff", "#gggggg", "#12345", "not-a-color", ""])("rejects %s", (hex) => {
    expect(isValidHex(hex)).toBe(false);
  });
});

describe("hexToHsl", () => {
  it("returns null for an invalid hex", () => {
    expect(hexToHsl("nope")).toBeNull();
  });

  it.each([
    ["#ff0000", { h: 0, s: 100, l: 50 }],
    ["#00ff00", { h: 120, s: 100, l: 50 }],
    ["#0000ff", { h: 240, s: 100, l: 50 }],
    ["#ffffff", { h: 0, s: 0, l: 100 }],
    ["#000000", { h: 0, s: 0, l: 0 }],
    ["#808080", { h: 0, s: 0, l: 50 }],
  ] as const)("%s -> %o", (hex, expected) => {
    expect(hexToHsl(hex)).toEqual(expected);
  });

  it("expands a 3-digit hex the same way as its 6-digit equivalent", () => {
    expect(hexToHsl("#f00")).toEqual(hexToHsl("#ff0000"));
  });
});

describe("hslToHex", () => {
  it.each([
    [0, 100, 50, "#ff0000"],
    [120, 100, 50, "#00ff00"],
    [240, 100, 50, "#0000ff"],
    [0, 0, 100, "#ffffff"],
    [0, 0, 0, "#000000"],
  ] as const)("hsl(%d, %d%%, %d%%) -> %s", (h, s, l, expected) => {
    expect(hslToHex(h, s, l)).toBe(expected);
  });

  it("wraps a hue outside 0-360 the same as its equivalent inside it", () => {
    expect(hslToHex(-360, 100, 50)).toBe(hslToHex(0, 100, 50));
    expect(hslToHex(720, 100, 50)).toBe(hslToHex(0, 100, 50));
  });

  it("round-trips through hexToHsl within rounding error (h/s/l are stored as whole-number percent/degrees, so a few colors lose a couple of RGB units)", () => {
    for (const hex of ["#3b82f6", "#22c55e", "#a855f7", "#ef4444"]) {
      const hsl = hexToHsl(hex)!;
      const roundTripped = hslToHex(hsl.h, hsl.s, hsl.l);
      for (let i = 1; i <= 5; i += 2) {
        const original = Number.parseInt(hex.slice(i, i + 2), 16);
        const actual = Number.parseInt(roundTripped.slice(i, i + 2), 16);
        expect(Math.abs(original - actual)).toBeLessThanOrEqual(2);
      }
    }
  });
});
