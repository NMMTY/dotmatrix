/** Effect names, in the order of the field guide the effects were taken from. */
export const fxEffects = [
  "blinky",
  "glitch",
  "trail",
  "stroke-fill",
  "shuffle",
  "crash-blink",
  "slide-blink",
  "color-flash",
  "build-on",
  "type",
  "decode",
] as const;

export type FxEffect = (typeof fxEffects)[number];

/**
 * A horizontal slice of the content, cut out and moved on its own — the
 * building block of `glitch`. All numbers are fractions of the content's own
 * box, so the effect scales with whatever it wraps: `top`/`bottom` pick the
 * rows, `left`/`right` where the slice's edges land (0 = the box's left edge,
 * 1 = its right edge; the slice is stretched to fit).
 */
export interface FxBand {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export type FxOverlay = "x-box" | "warning" | "hatch";

/** What one tick of an effect does. Every field is optional; omitted means "natural". */
export interface FxFrame {
  /** Nothing is drawn this tick. */
  hidden?: boolean;
  opacity?: number;
  /** Offset in own widths / heights (so `0.25` of a 40px box is 10px). Positive y is down. */
  x?: number;
  y?: number;
  /** Uniform scale about the centre. */
  scale?: number;
  /**
   * Stretch the box horizontally with its right edge pinned: `left` is where
   * the left edge sits (in own widths, 0 = natural) and `width` the new
   * width as a multiple of the natural one.
   */
  trail?: { left: number; width: number };
  /** Stroke only: the content is hidden and an outline of this opacity stands in for it. */
  outline?: number;
  /** With `outline`: a fill of this opacity inside it. */
  fill?: number;
  /** Replace the content with a placeholder drawing. */
  overlay?: FxOverlay;
  /** Slices, each moved separately (the content is drawn once per band). */
  bands?: FxBand[];
  /** 4×4 cell opacities (row-major); the content shows only through the lit cells. */
  grid?: number[];
  /** Index into the `palette` list: the content is tinted with that accent. */
  tint?: number;
}

/** Text effects rewrite the string instead of styling the layer. */
export const textEffects: ReadonlySet<FxEffect> = new Set(["type", "decode"]);

/** Effects that tint the content with an accent palette. */
export const paletteEffects: ReadonlySet<FxEffect> = new Set(["color-flash"]);

const HIDDEN: FxFrame = { hidden: true };

// `glitch` slices. Numbers are read off the reference frame by frame: the box
// first smears into a few thin bars dragged to the left, then snaps back as
// two offset slabs, then as one box with a notch, and finally settles.
const SMEAR: FxBand[] = [
  { top: 0.3, bottom: 0.42, left: -1.6, right: 0.5 },
  { top: 0.42, bottom: 0.55, left: -2.15, right: 0.5 },
  { top: 0.55, bottom: 0.7, left: -0.55, right: 0.1 },
];
const SLABS: FxBand[] = [
  { top: 0, bottom: 0.2, left: -1.1, right: 0.05 },
  { top: 0.2, bottom: 1, left: 0, right: 1 },
];
const NOTCH: FxBand[] = [
  { top: 0, bottom: 0.55, left: -0.55, right: 1 },
  { top: 0.55, bottom: 1, left: 0, right: 1 },
];
const JITTER_A: FxBand[] = [
  { top: 0, bottom: 0.3, left: -0.07, right: 1.1 },
  { top: 0.3, bottom: 1, left: 0, right: 1 },
];
const JITTER_B: FxBand[] = [
  { top: 0, bottom: 0.5, left: -0.1, right: 1 },
  { top: 0.5, bottom: 1, left: 0, right: 1.1 },
];

// `build-on`: the box is assembled from 4×4 cells in a fixed scattered order,
// each lighting at half strength for two ticks before it goes solid; the four
// centre cells come last and the very middle one lingers.
const BUILD_ORDER = [1, 14, 7, 8, 2, 13, 4, 11, 0, 15, 3, 12, 5, 10, 6, 9];
const BUILD_TICKS = 14;

function buildGrid(tick: number): number[] {
  const grid = Array<number>(16).fill(0);
  BUILD_ORDER.forEach((cell, p) => {
    const lit = Math.floor((p * (BUILD_TICKS - 3)) / BUILD_ORDER.length);
    const solid = cell === 5 ? BUILD_TICKS : lit + 2;
    grid[cell] = tick < lit ? 0 : tick < solid ? 0.5 : 1;
  });
  return grid;
}

/**
 * One row per tick, in order. After the last row the content returns to its
 * natural state, so an effect always ends exactly where the untouched
 * content would be. Rows are stepped, never interpolated.
 */
const TABLES: Partial<Record<FxEffect, FxFrame[]>> = {
  // grey, gone, full, grey
  blinky: [{ opacity: 0.5 }, HIDDEN, {}, { opacity: 0.5 }],
  glitch: [
    { bands: SMEAR },
    { bands: SLABS },
    { bands: NOTCH },
    {},
    {},
    { bands: JITTER_A },
    { bands: JITTER_B },
  ],
  // a dim smear dragged in from the left that tightens onto the box as it brightens
  trail: [
    { opacity: 0.2, trail: { left: -1.95, width: 2.4 } },
    { opacity: 0.33, trail: { left: -1.95, width: 2.8 } },
    { opacity: 0.46, trail: { left: -1.95, width: 2.85 } },
    { opacity: 0.6, trail: { left: -1.1, width: 2.03 } },
    { opacity: 0.73, trail: { left: -0.2, width: 1.15 } },
    { opacity: 0.86, trail: { left: -0.075, width: 1.05 } },
  ],
  // a flickering outline, then fill, flicker, fill
  "stroke-fill": [
    { outline: 0.25 },
    { outline: 0 },
    { outline: 0.5 },
    { outline: 0.25 },
    { outline: 0.5 },
    { outline: 1, fill: 0.5 },
    { outline: 1 },
    {},
    { outline: 1, fill: 0.5 },
  ],
  // image placeholder, warning, hatching: each held for two ticks
  shuffle: [
    { overlay: "x-box" },
    { overlay: "x-box" },
    { overlay: "warning" },
    { overlay: "warning" },
    { overlay: "hatch" },
    { overlay: "hatch" },
  ],
  // an oversized grey box crashing in, then on / off / on / grey
  "crash-blink": [{ scale: 1.95, opacity: 0.5 }, {}, HIDDEN, {}, { opacity: 0.5 }],
  // rises into place from below while it blinks, the last steps tiny
  "slide-blink": [
    { y: 0.375, opacity: 0.5 },
    { y: 0.25, opacity: 0.5 },
    HIDDEN,
    { y: 0.125 },
    { y: 0.075, opacity: 0.5 },
    { y: 0.05 },
    { y: 0.025 },
  ],
  "color-flash": [{ tint: 0 }, { tint: 1 }, { tint: 2 }, { tint: 3 }],
  "build-on": Array.from({ length: BUILD_TICKS }, (_, t) => ({ grid: buildGrid(t) })),
};

/** Text effects have no table; they are this long unless `frames` says otherwise. */
const TEXT_FRAMES = 6;

/** How many ticks `effect` runs for by default — the length of the reference sequence. */
export function defaultFrames(effect: FxEffect): number {
  return TABLES[effect]?.length ?? TEXT_FRAMES;
}

/**
 * The styling of tick `frame` (0-based) out of `total`. A `total` other than
 * the effect's own length resamples the sequence to the nearest row, so
 * `frames` stretches or compresses an effect without inventing new states.
 */
export function frameAt(effect: FxEffect, frame: number, total: number): FxFrame {
  const table = TABLES[effect];
  if (!table || total <= 0 || frame < 0 || frame >= total) return {};
  const row = total === table.length ? frame : Math.floor((frame * table.length) / total);
  return table[Math.min(table.length - 1, row)] ?? {};
}

const NOISE = "░▒▓█#@%&*+=";

/** How many characters of a `length`-long string are shown on `frame` (0-based) of `total`. */
export function typedLength(length: number, frame: number, total: number): number {
  if (frame >= total - 1) return length;
  return Math.min(length, Math.ceil((length * (frame + 1)) / total));
}

/**
 * The decode effect: characters resolve left → right and the rest show
 * noise. Noise is a pure function of position and frame, so renders are
 * reproducible (tests, SSR hydration) rather than `Math.random()`.
 */
export function decodeText(text: string, frame: number, total: number): string {
  if (frame >= total - 1) return text;
  const resolved = Math.floor((text.length * frame) / Math.max(1, total - 1));
  return Array.from(text, (ch, i) =>
    i < resolved || ch === " " ? ch : (NOISE[(i * 7 + frame * 3) % NOISE.length] ?? ch),
  ).join("");
}

/** The palette a `tint` index lands on; the list wraps around. */
export function paletteAt(palettes: readonly string[], tint: number): string | undefined {
  if (palettes.length === 0) return undefined;
  return palettes[((tint % palettes.length) + palettes.length) % palettes.length];
}

/**
 * A CSS `mask-image` value that lets the content through only where the 4×4
 * `grid` is lit (each cell's value is its opacity). An inline SVG so it
 * needs no asset and scales to any box.
 */
export function gridMask(grid: readonly number[]): string {
  const rects = grid
    .map((v, i) =>
      v > 0
        ? `<rect x='${i % 4}' y='${Math.floor(i / 4)}' width='1' height='1' fill-opacity='${v}'/>`
        : "",
    )
    .join("");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 4' preserveAspectRatio='none'>${rects}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
