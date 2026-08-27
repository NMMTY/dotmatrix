import { describe, expect, it } from "vitest";
import { centeredRect, clampRect, moveRect, resizeFromCorner } from "./cropMath";

const BOUNDS = { width: 200, height: 100 };

describe("clampRect", () => {
  it("leaves an in-bounds rect untouched", () => {
    expect(clampRect({ x: 10, y: 10, width: 50, height: 50 }, BOUNDS)).toEqual({
      x: 10,
      y: 10,
      width: 50,
      height: 50,
    });
  });

  it("shrinks a rect wider or taller than the bounds", () => {
    expect(clampRect({ x: 0, y: 0, width: 300, height: 300 }, BOUNDS)).toEqual({
      x: 0,
      y: 0,
      width: 200,
      height: 100,
    });
  });

  it("pulls an out-of-bounds position back inside", () => {
    expect(clampRect({ x: 190, y: 90, width: 50, height: 50 }, BOUNDS)).toEqual({
      x: 150,
      y: 50,
      width: 50,
      height: 50,
    });
  });
});

describe("centeredRect", () => {
  it("returns the full bounds when no ratio is given", () => {
    expect(centeredRect(BOUNDS)).toEqual({ x: 0, y: 0, width: 200, height: 100 });
  });

  it("fits a square centered inside wide bounds", () => {
    expect(centeredRect(BOUNDS, 1)).toEqual({ x: 50, y: 0, width: 100, height: 100 });
  });

  it("fits a wide ratio centered inside tall bounds", () => {
    expect(centeredRect({ width: 100, height: 200 }, 2)).toEqual({
      x: 0,
      y: 75,
      width: 100,
      height: 50,
    });
  });
});

describe("moveRect", () => {
  it("translates by dx/dy", () => {
    expect(moveRect({ x: 10, y: 10, width: 20, height: 20 }, 5, 5, BOUNDS)).toEqual({
      x: 15,
      y: 15,
      width: 20,
      height: 20,
    });
  });

  it("clamps so the box never crosses the bounds edge", () => {
    expect(moveRect({ x: 10, y: 10, width: 20, height: 20 }, 1000, 1000, BOUNDS)).toEqual({
      x: 180,
      y: 80,
      width: 20,
      height: 20,
    });
    expect(moveRect({ x: 10, y: 10, width: 20, height: 20 }, -1000, -1000, BOUNDS)).toEqual({
      x: 0,
      y: 0,
      width: 20,
      height: 20,
    });
  });
});

describe("resizeFromCorner", () => {
  const rect = { x: 50, y: 25, width: 50, height: 50 };

  it("dragging se grows the box while nw (the anchor) stays fixed", () => {
    const result = resizeFromCorner(rect, "se", 20, 10, BOUNDS, 10);
    expect(result).toEqual({ x: 50, y: 25, width: 70, height: 60 });
  });

  it("dragging nw grows the box while se (the anchor) stays fixed", () => {
    const result = resizeFromCorner(rect, "nw", -20, -10, BOUNDS, 10);
    expect(result).toEqual({ x: 30, y: 15, width: 70, height: 60 });
    // The opposite corner (se) really is unchanged.
    expect(result.x + result.width).toBe(rect.x + rect.width);
    expect(result.y + result.height).toBe(rect.y + rect.height);
  });

  it("dragging ne keeps the sw corner fixed", () => {
    const result = resizeFromCorner(rect, "ne", 20, -10, BOUNDS, 10);
    expect(result.x).toBe(rect.x);
    expect(result.y + result.height).toBe(rect.y + rect.height);
    expect(result.width).toBe(70);
    expect(result.height).toBe(60);
  });

  it("dragging sw keeps the ne corner fixed", () => {
    const result = resizeFromCorner(rect, "sw", -20, 10, BOUNDS, 10);
    expect(result.x + result.width).toBe(rect.x + rect.width);
    expect(result.y).toBe(rect.y);
    expect(result.width).toBe(70);
    expect(result.height).toBe(60);
  });

  it("never shrinks below minSize when dragged right up to the anchor", () => {
    // se starts at (100, 75); dragging by (-50, -50) lands it exactly on the
    // nw anchor (50, 25) — a zero-size box, floored to minSize.
    const result = resizeFromCorner(rect, "se", -50, -50, BOUNDS, 15);
    expect(result.width).toBe(15);
    expect(result.height).toBe(15);
  });

  it("clamps growth to the bounds edge", () => {
    const result = resizeFromCorner(rect, "se", 1000, 1000, BOUNDS, 10);
    expect(result.x + result.width).toBe(BOUNDS.width);
    expect(result.y + result.height).toBe(BOUNDS.height);
  });

  it("locks to the given aspect ratio without exceeding the pointer-clamped extent", () => {
    // Dragging se by (40, 10) on a 1:1-locked box — width wants to grow more
    // than height, so height should be derived from width (width / ratio).
    const result = resizeFromCorner(rect, "se", 40, 10, BOUNDS, 10, 1);
    expect(result.width / result.height).toBeCloseTo(1, 5);
    expect(result.width).toBeLessThanOrEqual(90); // never exceeds the raw 40px extent
  });

  it("locked-ratio resize never overshoots the bounds", () => {
    const result = resizeFromCorner(rect, "se", 1000, 10, BOUNDS, 10, 1);
    expect(result.x + result.width).toBeLessThanOrEqual(BOUNDS.width);
    expect(result.y + result.height).toBeLessThanOrEqual(BOUNDS.height);
    expect(result.width / result.height).toBeCloseTo(1, 5);
  });

  it("keeps the locked ratio even when a straight-axis drag collapses one raw dimension to 0", () => {
    // Dragging se straight up (dx: 0) until rawY lands exactly on the nw
    // anchor's y collapses the raw height to 0 before the ratio is applied —
    // multiplying that 0 by the ratio must not also collapse width to 0 and
    // snap the box to a minSize square instead of a minSize-tall wide box.
    const ratio = 16 / 9;
    const result = resizeFromCorner(rect, "se", 0, -50, BOUNDS, 10, ratio);
    expect(result.height).toBe(10);
    expect(result.width / result.height).toBeCloseTo(ratio, 5);
  });
});
