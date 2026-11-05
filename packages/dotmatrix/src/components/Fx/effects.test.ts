import { describe, expect, it } from "vitest";
import {
  decodeText,
  defaultFrames,
  frameAt,
  fxEffects,
  gridMask,
  paletteAt,
  typedLength,
} from "./effects";

// The sequences are read off a frame-by-frame capture of the reference field
// guide; these tests pin the shape of each one so a refactor cannot quietly
// turn them back into generic fades and shifts.
describe("frameAt", () => {
  it("has a sequence for every layout effect, and none past its length", () => {
    for (const effect of fxEffects) {
      if (effect === "type" || effect === "decode") continue;
      const n = defaultFrames(effect);
      expect(n).toBeGreaterThan(0);
      expect(frameAt(effect, n, n)).toEqual({});
    }
  });

  it("blinky: grey, gone, full, grey", () => {
    expect([0, 1, 2, 3].map((f) => frameAt("blinky", f, 4))).toEqual([
      { opacity: 0.5 },
      { hidden: true },
      {},
      { opacity: 0.5 },
    ]);
  });

  it("glitch: smear, slabs, notch, then a small jitter pair", () => {
    const n = defaultFrames("glitch");
    const kinds = Array.from({ length: n }, (_, f) => frameAt("glitch", f, n).bands?.length ?? 0);
    expect(kinds).toEqual([3, 2, 2, 0, 0, 2, 2]);
    const smear = frameAt("glitch", 0, n).bands!;
    expect(Math.min(...smear.map((b) => b.left))).toBeLessThan(-1.5);
  });

  it("trail: dimmer and longer first, tightening onto the box as it brightens", () => {
    const n = defaultFrames("trail");
    const rows = Array.from({ length: n }, (_, f) => frameAt("trail", f, n));
    const opacity = rows.map((r) => r.opacity!);
    expect(opacity).toEqual([...opacity].sort((a, b) => a - b));
    expect(rows[0]!.trail!.width).toBeGreaterThan(2);
    expect(rows[n - 1]!.trail!.width).toBeLessThan(1.1);
  });

  it("stroke-fill: outline flicker, then a grey fill, an outline, solid, a grey fill", () => {
    const n = defaultFrames("stroke-fill");
    expect(n).toBe(9);
    expect(frameAt("stroke-fill", 0, n)).toEqual({ outline: 0.25 });
    expect(frameAt("stroke-fill", 5, n)).toEqual({ outline: 1, fill: 0.5 });
    expect(frameAt("stroke-fill", 7, n)).toEqual({});
  });

  it("shuffle: placeholder, warning, hatching, two steps each", () => {
    const n = defaultFrames("shuffle");
    expect(Array.from({ length: n }, (_, f) => frameAt("shuffle", f, n).overlay)).toEqual([
      "x-box",
      "x-box",
      "warning",
      "warning",
      "hatch",
      "hatch",
    ]);
  });

  it("crash-blink: an oversized grey box first, then on / off / on / grey", () => {
    const n = defaultFrames("crash-blink");
    expect(frameAt("crash-blink", 0, n)).toEqual({ scale: 1.95, opacity: 0.5 });
    expect(frameAt("crash-blink", 2, n)).toEqual({ hidden: true });
  });

  it("slide-blink: starts low and settles upward while it blinks", () => {
    const n = defaultFrames("slide-blink");
    const ys = Array.from({ length: n }, (_, f) => frameAt("slide-blink", f, n).y ?? 0);
    expect(ys[0]).toBeGreaterThan(0.3);
    expect(ys[n - 1]).toBeLessThan(0.05);
    expect(frameAt("slide-blink", 2, n).hidden).toBe(true);
  });

  it("color-flash: one tint per step, in order", () => {
    const n = defaultFrames("color-flash");
    expect(Array.from({ length: n }, (_, f) => frameAt("color-flash", f, n).tint)).toEqual([
      0, 1, 2, 3,
    ]);
  });

  it("build-on: starts empty-ish, ends with only the centre cell dim", () => {
    const n = defaultFrames("build-on");
    expect(n).toBe(14);
    const first = frameAt("build-on", 0, n).grid!;
    const last = frameAt("build-on", n - 1, n).grid!;
    expect(first.filter((v) => v > 0).length).toBeLessThanOrEqual(2);
    expect(last.filter((v) => v === 1).length).toBe(15);
    expect(last[5]).toBe(0.5);
  });

  it("build-on only ever lights cells, never turns one off", () => {
    const n = defaultFrames("build-on");
    for (let c = 0; c < 16; c++) {
      const series = Array.from({ length: n }, (_, f) => frameAt("build-on", f, n).grid![c]!);
      expect(series).toEqual([...series].sort((a, b) => a - b));
    }
  });

  it("resamples to another length without leaving the table", () => {
    expect(frameAt("blinky", 0, 8)).toEqual({ opacity: 0.5 });
    expect(frameAt("blinky", 2, 8)).toEqual({ hidden: true });
    expect(frameAt("blinky", 7, 8)).toEqual({ opacity: 0.5 });
  });

  it("text effects have no layout frames", () => {
    expect(frameAt("type", 0, 6)).toEqual({});
    expect(defaultFrames("type")).toBe(6);
  });
});

describe("gridMask", () => {
  it("is a data-URI SVG with one rect per lit cell at its opacity", () => {
    const mask = gridMask([1, 0.5, ...Array<number>(14).fill(0)]);
    const svg = decodeURIComponent(mask.slice('url("data:image/svg+xml,'.length, -2));
    expect(svg.match(/<rect /g)).toHaveLength(2);
    expect(svg).toContain("fill-opacity='0.5'");
    expect(svg).toContain("x='1' y='0'");
  });
});

describe("typedLength", () => {
  it("grows monotonically and finishes on the full length", () => {
    const lens = [0, 1, 2, 3, 4, 5].map((f) => typedLength(12, f, 6));
    expect(lens).toEqual([2, 4, 6, 8, 10, 12]);
  });
});

describe("decodeText", () => {
  it("is deterministic", () => {
    expect(decodeText("be better", 2, 6)).toBe(decodeText("be better", 2, 6));
  });

  it("keeps length and spaces, and resolves left to right", () => {
    const out = decodeText("be better", 3, 6);
    expect(out).toHaveLength(9);
    expect(out[2]).toBe(" ");
    expect(out.startsWith("be b")).toBe(true);
  });

  it("returns the exact text on the last frame", () => {
    expect(decodeText("be better", 5, 6)).toBe("be better");
  });
});

describe("paletteAt", () => {
  it("wraps around the list", () => {
    const list = ["red", "blue"];
    expect([0, 1, 2, 3].map((t) => paletteAt(list, t))).toEqual(["red", "blue", "red", "blue"]);
  });

  it("is undefined for an empty list", () => {
    expect(paletteAt([], 0)).toBeUndefined();
  });
});
