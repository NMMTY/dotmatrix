import type { RasterImage } from "./dither";
import { luminance } from "./dither";

export interface HalftoneOptions {
  /** Grid spacing in source pixels — the screen's dot pitch. @default 8 */
  cellSize?: number;
  /** Largest dot radius, as a fraction of `cellSize / 2`. @default 0.95 */
  maxRadius?: number;
  /** @default false */
  invert?: boolean;
}

export interface HalftoneDot {
  /** Cell center, in source pixel coordinates. */
  x: number;
  y: number;
  /** In source pixels. 0 means "no dot" — callers should skip drawing it. */
  radius: number;
}

/**
 * Classic halftone screen: averages luminance per grid cell into a dot
 * radius (dark → large, light → small). Returns drawing instructions, not a
 * raster — dots are naturally vector (canvas `arc()`), so forcing them
 * through a pixel buffer would just make the caller rasterize them back out.
 * No screen-angle rotation: with only one layer there's no moiré to avoid,
 * and an angled grid would fight this system's pixel-grid alignment.
 */
export function halftone(image: RasterImage, options: HalftoneOptions = {}): HalftoneDot[] {
  const { cellSize = 8, maxRadius = 0.95, invert = false } = options;
  const { width, height, data } = image;
  const dots: HalftoneDot[] = [];
  const maxR = (cellSize / 2) * maxRadius;

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
      if (weight === 0) continue; // fully transparent cell — no dot at all

      const meanLuminance = sum / weight;
      // Darker cells get bigger dots: radius is proportional to (1 - luminance).
      const darkness = invert ? meanLuminance : 1 - meanLuminance;
      dots.push({
        x: cx + cellW / 2,
        y: cy + cellH / 2,
        radius: darkness * maxR,
      });
    }
  }

  return dots;
}
