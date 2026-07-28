import type { RasterImage } from "./dither";
import { luminance } from "./dither";

export interface CrossHatchOptions {
  /** Grid spacing in source pixels. @default 8 */
  cellSize?: number;
  /** @default false */
  invert?: boolean;
}

export interface CrossHatchLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// Escalates through one direction per darkness quartile — the same layering
// classic engravings use: light tones get a single diagonal stroke, the
// darkest cells get all four overlaid into a dense woven texture.
const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [1, 1], // "\"
  [1, -1], // "/"
  [1, 0], // "-"
  [0, 1], // "|"
];

/**
 * Classic engraving cross-hatch: per-cell luminance averaging (same as
 * {@link halftone}) mapped to a *count* of overlaid hatch directions rather
 * than a dot radius — 0 for the lightest cells up to all four for the
 * darkest. Returns drawing instructions (line segments), not a raster, for
 * the same reason halftone returns dots: hatching is naturally vector.
 */
export function crossHatch(image: RasterImage, options: CrossHatchOptions = {}): CrossHatchLine[] {
  const { cellSize = 8, invert = false } = options;
  const { width, height, data } = image;
  const lines: CrossHatchLine[] = [];

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
      if (weight === 0) continue; // fully transparent cell — no hatching at all

      const meanLuminance = sum / weight;
      const darkness = invert ? meanLuminance : 1 - meanLuminance;
      const level = Math.round(darkness * DIRECTIONS.length); // 0..DIRECTIONS.length
      if (level === 0) continue;

      const midX = cx + cellW / 2;
      const midY = cy + cellH / 2;
      const half = Math.min(cellW, cellH) / 2;

      for (let d = 0; d < level; d++) {
        const [dx, dy] = DIRECTIONS[d]!;
        if (dx === 0) {
          lines.push({ x1: midX, y1: cy, x2: midX, y2: cy + cellH });
        } else if (dy === 0) {
          lines.push({ x1: cx, y1: midY, x2: cx + cellW, y2: midY });
        } else {
          lines.push({
            x1: midX - half,
            y1: midY - half * dy,
            x2: midX + half,
            y2: midY + half * dy,
          });
        }
      }
    }
  }

  return lines;
}
