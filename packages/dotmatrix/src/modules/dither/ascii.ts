import type { RasterImage } from "./dither";
import { luminance } from "./dither";

export interface AsciiOptions {
  /** Densest → sparsest character ramp; index 0 renders for the darkest cells. @default "@%#*+=-:. " */
  charset?: string;
  /** Sampling cell size in source pixels — one character per cell. @default 8 */
  cellSize?: number;
  /** @default false */
  invert?: boolean;
}

export interface AsciiCell {
  /** Cell center, in source pixel coordinates. */
  x: number;
  y: number;
  /** Empty string means "no glyph" — callers should skip drawing it. */
  char: string;
}

const DEFAULT_CHARSET = "@%#*+=-:. ";

/**
 * The most literal reading of this system's "bitmap" identity: same per-cell
 * luminance averaging as {@link halftone}, but mapped to a character ramp
 * instead of a dot radius. Returns drawing instructions, not a raster or a
 * string — a caller decides whether that means `fillText` on a canvas or
 * building a `<pre>` grid.
 */
export function asciiArt(image: RasterImage, options: AsciiOptions = {}): AsciiCell[] {
  const { charset = DEFAULT_CHARSET, cellSize = 8, invert = false } = options;
  const { width, height, data } = image;
  const cells: AsciiCell[] = [];
  if (charset.length === 0) return cells;

  for (let cy = 0; cy < height; cy += cellSize) {
    for (let cx = 0; cx < width; cx += cellSize) {
      const cellW = Math.min(cellSize, width - cx);
      const cellH = Math.min(cellSize, height - cy);

      let sum = 0;
      let weight = 0;
      for (let y = cy; y < cy + cellH; y++) {
        for (let x = cx; x < cx + cellW; x++) {
          const o = (y * width + x) * 4;
          const alpha = data[o + 3]! / 255;
          sum += luminance(data[o]!, data[o + 1]!, data[o + 2]!) * alpha;
          weight += alpha;
        }
      }
      if (weight === 0) continue; // fully transparent cell — no glyph at all

      const meanLuminance = sum / weight;
      // Darker cells get denser (earlier-in-ramp) characters, same
      // dark-to-large convention as halftone's radius.
      const darkness = invert ? meanLuminance : 1 - meanLuminance;
      const index = Math.min(charset.length - 1, Math.floor((1 - darkness) * charset.length));
      const char = charset[index]!;
      if (char === " ") continue; // nothing to draw, same as halftone's radius<=0 skip

      cells.push({ x: cx + cellW / 2, y: cy + cellH / 2, char });
    }
  }

  return cells;
}
