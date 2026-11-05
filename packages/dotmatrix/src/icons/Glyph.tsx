/** Cells per side of every glyph bitmap — 9, odd, so each glyph has a true centre pixel. */
export const GLYPH_CELLS = 9;
/** SVG units per cell. */
const CELL = 2;
/** Side of the square viewBox `Icon` draws glyphs into (cells × cell size). */
export const GLYPH_VIEWBOX = GLYPH_CELLS * CELL;

/**
 * Renders a 9×9 bitmap (`#` filled, `.` empty) as SVG `<rect>`s on Icon's
 * 18×18 viewBox — each cell a 2×2 block. ASCII art, not hand-plotted bezier
 * coordinates, because a typo'd `#` is visible in the grid shape itself;
 * blocky cells are the honest bitmap equivalent of a vector icon.
 *
 * Horizontal runs of filled cells are merged into a single `<rect>`: fewer
 * nodes, and no hairline seams between neighbouring cells when scaled.
 */
export function glyphRuns(rows: readonly string[]) {
  const runs: Array<{ x: number; y: number; width: number }> = [];
  rows.forEach((row, y) => {
    let start = -1;
    for (let x = 0; x <= row.length; x++) {
      const filled = row[x] === "#";
      if (filled && start < 0) start = x;
      if (!filled && start >= 0) {
        runs.push({ x: start, y, width: x - start });
        start = -1;
      }
    }
  });
  return runs;
}

export function Glyph({ rows }: { rows: readonly string[] }) {
  return (
    <>
      {glyphRuns(rows).map(({ x, y, width }) => (
        <rect key={`${x}-${y}`} x={x * CELL} y={y * CELL} width={width * CELL} height={CELL} />
      ))}
    </>
  );
}
