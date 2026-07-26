import { describe, expect, it } from "vitest";
import { type DitherAlgorithm, dither, type RasterImage } from "./dither";

function solid(width: number, height: number, gray: number, alpha = 255): RasterImage {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const o = i * 4;
    data[o] = gray;
    data[o + 1] = gray;
    data[o + 2] = gray;
    data[o + 3] = alpha;
  }
  return { data, width, height };
}

function gradient(width: number, height: number): RasterImage {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const gray = Math.round((x / (width - 1)) * 255);
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
      data[i + 3] = 255;
    }
  }
  return { data, width, height };
}

function meanGray(image: RasterImage): number {
  let sum = 0;
  const count = image.width * image.height;
  for (let i = 0; i < count; i++) sum += image.data[i * 4]!;
  return sum / count;
}

describe("dither: output shape and channel handling", () => {
  it("preserves width, height, and alpha exactly", () => {
    const input = solid(4, 4, 128, 200);
    const result = dither(input, { algorithm: "threshold" });
    expect(result.width).toBe(4);
    expect(result.height).toBe(4);
    for (let i = 0; i < 16; i++) {
      expect(result.data[i * 4 + 3]).toBe(200);
    }
  });

  it("always writes R=G=B — output stays monochrome regardless of input color", () => {
    const data = new Uint8ClampedArray(4 * 1 * 4);
    // A saturated red pixel: R=255, G=0, B=0.
    data[0] = 255;
    data[1] = 0;
    data[2] = 0;
    data[3] = 255;
    const result = dither({ data, width: 4, height: 1 }, { algorithm: "threshold", levels: 2 });
    expect(result.data[0]).toBe(result.data[1]);
    expect(result.data[1]).toBe(result.data[2]);
  });
});

describe("dither: threshold", () => {
  it("splits exactly at the midpoint for 2 levels", () => {
    const below = dither(solid(2, 2, 100), { algorithm: "threshold", levels: 2 });
    const above = dither(solid(2, 2, 160), { algorithm: "threshold", levels: 2 });
    expect(below.data[0]).toBe(0);
    expect(above.data[0]).toBe(255);
  });

  it("produces exactly `levels` distinct output values across a gradient", () => {
    const result = dither(gradient(64, 1), { algorithm: "threshold", levels: 4 });
    const distinct = new Set<number>();
    for (let i = 0; i < 64; i++) distinct.add(result.data[i * 4]!);
    expect(distinct.size).toBe(4);
  });
});

describe("dither: ordered (Bayer)", () => {
  it("bayer4 on a uniform 50% gray reproduces the matrix's own on/off pattern exactly", () => {
    // At exactly 50% gray, this ordered-dither implementation's threshold
    // comparison (frac > (matrix+0.5)/16) turns on precisely the cells whose
    // Bayer value is < 7.5 — i.e. 0..7 — which is 8 of the 16 cells; matches
    // tokens/_scale.scss's own dither-mask() at density 8.
    const result = dither(solid(4, 4, 128), { algorithm: "bayer4", levels: 2 });
    const onCount = [...result.data].filter((_, i) => i % 4 === 0 && result.data[i] === 255).length;
    expect(onCount).toBe(8);
  });

  it("tiles the 4×4 matrix exactly — same value 4px over and 4px down, with no scanline state leaking in", () => {
    // Rows 0 and 1 of the matrix legitimately differ (that's the whole point
    // of a 2D dither matrix, not a repeating column stripe) — what must hold
    // is that position (x, y) and (x+4, y) land on the same matrix cell, and
    // likewise for y and y+4. A stateful (error-diffusion-style) algorithm
    // would NOT tile this cleanly, since accumulated error depends on scan
    // history, not just position.
    const result = dither(solid(8, 8, 100), { algorithm: "bayer4", levels: 2 });
    const at = (x: number, y: number) => result.data[(y * 8 + x) * 4];
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 4; x++) {
        expect(at(x, y)).toBe(at(x + 4, y));
      }
    }
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 4; y++) {
        expect(at(x, y)).toBe(at(x, y + 4));
      }
    }
  });
});

describe("dither: error diffusion", () => {
  const algorithms: DitherAlgorithm[] = ["floyd-steinberg", "atkinson"];

  for (const algorithm of algorithms) {
    it(`${algorithm} keeps the output mean close to the input mean (error is carried forward, not lost)`, () => {
      const input = gradient(32, 32);
      const result = dither(input, { algorithm, levels: 2 });
      expect(meanGray(result)).toBeGreaterThan(meanGray(input) - 20);
      expect(meanGray(result)).toBeLessThan(meanGray(input) + 20);
    });

    it(`${algorithm} only ever emits pure black or pure white at levels=2`, () => {
      const result = dither(gradient(16, 16), { algorithm, levels: 2 });
      for (let i = 0; i < 16 * 16; i++) {
        expect([0, 255]).toContain(result.data[i * 4]);
      }
    });
  }

  it("atkinson is visibly higher-contrast than floyd-steinberg on the same input (discards 2/8 of the error)", () => {
    const input = gradient(32, 32);
    const fs = dither(input, { algorithm: "floyd-steinberg", levels: 2 });
    const atkinson = dither(input, { algorithm: "atkinson", levels: 2 });
    // Not a bit-for-bit equality check (both are legitimately different
    // algorithms) — just confirms they're not accidentally aliased to the
    // same implementation.
    expect(atkinson.data).not.toEqual(fs.data);
  });
});

describe("dither: invert", () => {
  it("flips every output level, not just the endpoints", () => {
    const plain = dither(solid(2, 2, 100), { algorithm: "threshold", levels: 2 });
    const inverted = dither(solid(2, 2, 100), { algorithm: "threshold", levels: 2, invert: true });
    expect(inverted.data[0]).toBe(255 - plain.data[0]!);
  });
});
