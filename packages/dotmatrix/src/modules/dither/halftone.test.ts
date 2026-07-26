import { describe, expect, it } from "vitest";
import type { RasterImage } from "./dither";
import { halftone } from "./halftone";

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

describe("halftone", () => {
  it("produces one dot per grid cell, tiling exactly over the image", () => {
    const dots = halftone(solid(16, 8, 128), { cellSize: 4 });
    expect(dots.length).toBe((16 / 4) * (8 / 4));
  });

  it("gives a fully black image the maximum radius everywhere", () => {
    const dots = halftone(solid(8, 8, 0), { cellSize: 8, maxRadius: 1 });
    expect(dots).toHaveLength(1);
    expect(dots[0]!.radius).toBeCloseTo(4, 5); // cellSize/2 * maxRadius
  });

  it("gives a fully white image a zero radius (no visible dot)", () => {
    const dots = halftone(solid(8, 8, 255), { cellSize: 8 });
    expect(dots[0]!.radius).toBeCloseTo(0, 5);
  });

  it("invert flips which end of the luminance range gets the bigger dot", () => {
    const plain = halftone(solid(8, 8, 0), { cellSize: 8, maxRadius: 1 });
    const inverted = halftone(solid(8, 8, 0), { cellSize: 8, maxRadius: 1, invert: true });
    expect(inverted[0]!.radius).toBeCloseTo(0, 5);
    expect(plain[0]!.radius).toBeGreaterThan(inverted[0]!.radius);
  });

  it("emits no dot at all for a fully transparent cell", () => {
    const dots = halftone(solid(8, 8, 0, 0), { cellSize: 8 });
    expect(dots).toHaveLength(0);
  });

  it("centers each dot in the middle of its cell", () => {
    const dots = halftone(solid(16, 16, 100), { cellSize: 8 });
    const originCell = dots.find((d) => d.x === 4 && d.y === 4);
    expect(originCell).toBeDefined();
  });

  it("handles a partial trailing cell (image size not a multiple of cellSize) without throwing", () => {
    expect(() => halftone(solid(10, 10, 50), { cellSize: 8 })).not.toThrow();
    const dots = halftone(solid(10, 10, 50), { cellSize: 8 });
    expect(dots.length).toBe(4); // 2x2 cells: [0-8), [8-10) in both axes
  });
});
