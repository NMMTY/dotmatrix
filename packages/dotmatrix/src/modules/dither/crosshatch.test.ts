import { describe, expect, it } from "vitest";
import { crossHatch } from "./crosshatch";
import type { RasterImage } from "./dither";

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

describe("crossHatch", () => {
  it("gives a fully black image all four hatch directions", () => {
    const lines = crossHatch(solid(8, 8, 0), { cellSize: 8 });
    expect(lines).toHaveLength(4);
  });

  it("gives a fully white image no hatch lines at all", () => {
    const lines = crossHatch(solid(8, 8, 255), { cellSize: 8 });
    expect(lines).toHaveLength(0);
  });

  it("gives a mid-tone image roughly half the hatch directions", () => {
    const lines = crossHatch(solid(8, 8, 128), { cellSize: 8 });
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.length).toBeLessThan(4);
  });

  it("invert flips which end of the luminance range gets hatched", () => {
    const plain = crossHatch(solid(8, 8, 0), { cellSize: 8 });
    const inverted = crossHatch(solid(8, 8, 0), { cellSize: 8, invert: true });
    expect(plain.length).toBe(4);
    expect(inverted.length).toBe(0);
  });

  it("emits no lines at all for a fully transparent cell", () => {
    const lines = crossHatch(solid(8, 8, 0, 0), { cellSize: 8 });
    expect(lines).toHaveLength(0);
  });

  it("tiles one set of lines per grid cell", () => {
    const lines = crossHatch(solid(16, 8, 0), { cellSize: 4 });
    // 4 cells wide x 2 cells tall, each fully black -> 4 directions each
    expect(lines.length).toBe((16 / 4) * (8 / 4) * 4);
  });

  it("handles a partial trailing cell (image size not a multiple of cellSize) without throwing", () => {
    expect(() => crossHatch(solid(10, 10, 0), { cellSize: 8 })).not.toThrow();
  });
});
