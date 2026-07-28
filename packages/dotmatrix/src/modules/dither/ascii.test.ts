import { describe, expect, it } from "vitest";
import { asciiArt } from "./ascii";
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

describe("asciiArt", () => {
  it("produces one cell per grid cell, tiling exactly over the image", () => {
    const cells = asciiArt(solid(16, 8, 128), { cellSize: 4 });
    expect(cells.length).toBe((16 / 4) * (8 / 4));
  });

  it("gives a fully black image the densest character everywhere", () => {
    const cells = asciiArt(solid(8, 8, 0), { cellSize: 8 });
    expect(cells).toHaveLength(1);
    expect(cells[0]!.char).toBe("@");
  });

  it("gives a fully white image no glyph at all", () => {
    const cells = asciiArt(solid(8, 8, 255), { cellSize: 8 });
    expect(cells).toHaveLength(0);
  });

  it("invert flips which end of the luminance range gets the densest glyph", () => {
    const plain = asciiArt(solid(8, 8, 0), { cellSize: 8 });
    const inverted = asciiArt(solid(8, 8, 0), { cellSize: 8, invert: true });
    expect(plain[0]!.char).toBe("@");
    expect(inverted).toHaveLength(0);
  });

  it("emits no cell at all for a fully transparent cell", () => {
    const cells = asciiArt(solid(8, 8, 0, 0), { cellSize: 8 });
    expect(cells).toHaveLength(0);
  });

  it("centers each glyph in the middle of its cell", () => {
    const cells = asciiArt(solid(16, 16, 100), { cellSize: 8 });
    const originCell = cells.find((c) => c.x === 4 && c.y === 4);
    expect(originCell).toBeDefined();
  });

  it("handles a partial trailing cell (image size not a multiple of cellSize) without throwing", () => {
    expect(() => asciiArt(solid(10, 10, 50), { cellSize: 8 })).not.toThrow();
    const cells = asciiArt(solid(10, 10, 50), { cellSize: 8 });
    expect(cells.length).toBe(4); // 2x2 cells: [0-8), [8-10) in both axes
  });

  it("returns no cells when the charset is empty", () => {
    const cells = asciiArt(solid(8, 8, 0), { cellSize: 8, charset: "" });
    expect(cells).toHaveLength(0);
  });

  it("uses a custom charset ramp", () => {
    const cells = asciiArt(solid(8, 8, 0), { cellSize: 8, charset: "#." });
    expect(cells[0]!.char).toBe("#");
  });
});
