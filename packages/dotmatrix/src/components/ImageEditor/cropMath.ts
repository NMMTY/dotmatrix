/**
 * Pure geometry for the crop box — no DOM, no React — so the resize/move
 * math (the fiddly part) is unit-testable without simulating pointer events
 * or layout. All rects live in "canvas space": the same pixel coordinates as
 * the baked (rotated/flipped) image the crop box sits over.
 */

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Bounds {
  width: number;
  height: number;
}

export type Corner = "nw" | "ne" | "sw" | "se";

const clamp = (v: number, min: number, max: number) => (v < min ? min : v > max ? max : v);

export function clampRect(rect: Rect, bounds: Bounds): Rect {
  const width = Math.min(rect.width, bounds.width);
  const height = Math.min(rect.height, bounds.height);
  return {
    width,
    height,
    x: clamp(rect.x, 0, bounds.width - width),
    y: clamp(rect.y, 0, bounds.height - height),
  };
}

/** The largest rect of the given aspect ratio (width / height) centered in `bounds` — the full bounds if `ratio` is omitted. */
export function centeredRect(bounds: Bounds, ratio?: number): Rect {
  if (!ratio) return { x: 0, y: 0, width: bounds.width, height: bounds.height };
  const boundsRatio = bounds.width / bounds.height;
  const width = boundsRatio > ratio ? bounds.height * ratio : bounds.width;
  const height = boundsRatio > ratio ? bounds.height : bounds.width / ratio;
  return { x: (bounds.width - width) / 2, y: (bounds.height - height) / 2, width, height };
}

/** Translates the box by `(dx, dy)`, clamped so it never leaves `bounds`. */
export function moveRect(rect: Rect, dx: number, dy: number, bounds: Bounds): Rect {
  return {
    ...rect,
    x: clamp(rect.x + dx, 0, bounds.width - rect.width),
    y: clamp(rect.y + dy, 0, bounds.height - rect.height),
  };
}

function cornerPoint(rect: Rect, corner: Corner) {
  return {
    x: corner === "nw" || corner === "sw" ? rect.x : rect.x + rect.width,
    y: corner === "nw" || corner === "ne" ? rect.y : rect.y + rect.height,
  };
}

const OPPOSITE: Record<Corner, Corner> = { nw: "se", ne: "sw", sw: "ne", se: "nw" };

/**
 * Resizes by dragging one `corner`; the opposite corner stays fixed as the
 * anchor. When `ratio` is set, the result is only ever shrunk to fit it —
 * never grown past wherever the pointer clamped to — so a locked-ratio drag
 * can't push the box outside `bounds`.
 */
export function resizeFromCorner(
  rect: Rect,
  corner: Corner,
  dx: number,
  dy: number,
  bounds: Bounds,
  minSize: number,
  ratio?: number,
): Rect {
  const anchor = cornerPoint(rect, OPPOSITE[corner]);
  const start = cornerPoint(rect, corner);
  const rawX = clamp(start.x + dx, 0, bounds.width);
  const rawY = clamp(start.y + dy, 0, bounds.height);

  // Floored to minSize before the ratio math, not after — dragging straight
  // along one axis can collapse the other's raw extent to exactly 0, and
  // deriving a ratio-locked dimension by multiplying against a 0 collapses
  // both to 0 too (then both floor to minSize, snapping to a square instead
  // of a minSize-tall/wide box at the correct ratio).
  let width = Math.max(Math.abs(rawX - anchor.x), minSize);
  let height = Math.max(Math.abs(rawY - anchor.y), minSize);

  if (ratio) {
    if (width / height > ratio) {
      width = height * ratio;
    } else {
      height = width / ratio;
    }
  }

  const dirX = rawX >= anchor.x ? 1 : -1;
  const dirY = rawY >= anchor.y ? 1 : -1;
  const cornerX = anchor.x + dirX * width;
  const cornerY = anchor.y + dirY * height;

  return clampRect(
    {
      x: Math.min(anchor.x, cornerX),
      y: Math.min(anchor.y, cornerY),
      width,
      height,
    },
    bounds,
  );
}
