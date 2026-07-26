/**
 * Pure, DOM-free dithering algorithms. Everything here operates on a
 * structural `RasterImage` (not the real `ImageData` constructor) so it can
 * be unit-tested in plain Node/jsdom without a real canvas, and reused
 * as-is inside a Web Worker (see dither.worker.ts) where `ImageData` from
 * the main thread is a transferable but the algorithms themselves don't
 * need to know that.
 *
 * The four ordered-dither matrices reuse the exact same numbers as
 * tokens/_scale.scss's `$bayer-4` (CSS pattern masks) and its 2×2/8×8
 * siblings — the canvas dithering and the CSS decorative patterns are the
 * same visual language, not two coincidentally-similar systems.
 */

export interface RasterImage {
  readonly data: Uint8ClampedArray;
  readonly width: number;
  readonly height: number;
}

export type DitherAlgorithm =
  | "threshold"
  | "bayer2"
  | "bayer4"
  | "bayer8"
  | "floyd-steinberg"
  | "atkinson";

export interface DitherOptions {
  /** @default "floyd-steinberg" */
  algorithm?: DitherAlgorithm;
  /** Output gray levels, evenly spaced between black and white. @default 2 */
  levels?: number;
  /** @default false */
  invert?: boolean;
}

const BAYER_2 = [
  [0, 2],
  [3, 1],
];

const BAYER_4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const BAYER_8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

const BAYER_MATRICES: Record<"bayer2" | "bayer4" | "bayer8", number[][]> = {
  bayer2: BAYER_2,
  bayer4: BAYER_4,
  bayer8: BAYER_8,
};

// Error-diffusion kernels as [dx, dy, weight] offsets from the current pixel,
// applied to pixels not yet visited in raster order. Weights are pre-divided
// by the kernel's total (16 for Floyd–Steinberg, 8 for Atkinson).
const FLOYD_STEINBERG_KERNEL: Array<[number, number, number]> = [
  [1, 0, 7 / 16],
  [-1, 1, 3 / 16],
  [0, 1, 5 / 16],
  [1, 1, 1 / 16],
];

// Atkinson only redistributes 6/8 of the error (the remaining 2/8 is simply
// discarded) — that deliberate loss is what gives Atkinson its characteristic
// higher-contrast, less muddy look compared to Floyd–Steinberg.
const ATKINSON_KERNEL: Array<[number, number, number]> = [
  [1, 0, 1 / 8],
  [2, 0, 1 / 8],
  [-1, 1, 1 / 8],
  [0, 1, 1 / 8],
  [1, 1, 1 / 8],
  [0, 2, 1 / 8],
];

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

// Rec. 709 perceptual luminance weights — matches how modern displays and
// image editors compute grayscale, not the older Rec. 601 (0.299/0.587/0.114)
// weights that skew too dark for greens. Exported so halftone.ts computes
// grayscale identically instead of drifting from its own copy.
export function luminance(r: number, g: number, b: number): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** Rounds `v` (0–1) to the nearest of `levels` evenly spaced steps in 0–1. */
function quantize(v: number, levels: number): number {
  if (levels <= 1) return v >= 0.5 ? 1 : 0;
  const step = levels - 1;
  return Math.round(clamp01(v) * step) / step;
}

function ditherOrdered(
  gray: Float32Array,
  width: number,
  height: number,
  matrix: number[][],
  levels: number,
): Float32Array {
  const size = matrix.length;
  const cells = size * size;
  const out = new Float32Array(gray.length);
  const step = Math.max(levels - 1, 1);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      // Normalized to (0,1), centered on 0.5/cells so the matrix's own
      // average bias doesn't shift the overall image brightness.
      const threshold = (matrix[y % size]![x % size]! + 0.5) / cells;
      const scaled = clamp01(gray[i]!) * step;
      const level = Math.floor(scaled);
      const frac = scaled - level;
      const bumped = frac > threshold ? level + 1 : level;
      out[i] = Math.min(bumped, step) / step;
    }
  }
  return out;
}

function ditherErrorDiffusion(
  gray: Float32Array,
  width: number,
  height: number,
  kernel: Array<[number, number, number]>,
  levels: number,
): Float32Array {
  // Mutable working copy: error diffusion writes corrections forward into
  // pixels it hasn't visited yet.
  const work = Float32Array.from(gray);
  const out = new Float32Array(gray.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const old = clamp01(work[i]!);
      const quantized = quantize(old, levels);
      out[i] = quantized;
      const error = old - quantized;
      if (error === 0) continue;
      for (const [dx, dy, weight] of kernel) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const ni = ny * width + nx;
        work[ni] = (work[ni] ?? 0) + error * weight;
      }
    }
  }
  return out;
}

/**
 * Dithers `image` to a reduced palette, always writing the result back as a
 * grayscale RGB (R=G=B) so the output stays inside this system's monochrome
 * identity regardless of the input's original colors. Alpha is preserved
 * untouched — a transparent source pixel stays transparent.
 */
export function dither(image: RasterImage, options: DitherOptions = {}): RasterImage {
  const { algorithm = "floyd-steinberg", levels = 2, invert = false } = options;
  const { width, height, data } = image;
  const pixelCount = width * height;

  const gray = new Float32Array(pixelCount);
  for (let i = 0; i < pixelCount; i++) {
    const o = i * 4;
    gray[i] = luminance(data[o]!, data[o + 1]!, data[o + 2]!);
  }

  let quantized: Float32Array;
  if (algorithm === "threshold") {
    quantized = gray.map((v) => quantize(v, levels));
  } else if (algorithm === "floyd-steinberg") {
    quantized = ditherErrorDiffusion(gray, width, height, FLOYD_STEINBERG_KERNEL, levels);
  } else if (algorithm === "atkinson") {
    quantized = ditherErrorDiffusion(gray, width, height, ATKINSON_KERNEL, levels);
  } else {
    quantized = ditherOrdered(gray, width, height, BAYER_MATRICES[algorithm], levels);
  }

  const out = new Uint8ClampedArray(data.length);
  for (let i = 0; i < pixelCount; i++) {
    const v = invert ? 1 - quantized[i]! : quantized[i]!;
    const byte = Math.round(clamp01(v) * 255);
    const o = i * 4;
    out[o] = byte;
    out[o + 1] = byte;
    out[o + 2] = byte;
    out[o + 3] = data[o + 3]!;
  }

  return { data: out, width, height };
}
