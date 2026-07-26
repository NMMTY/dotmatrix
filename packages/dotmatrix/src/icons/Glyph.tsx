/**
 * Renders an 8×8 bitmap (`#` filled, `.` empty) as SVG `<rect>`s on Icon's
 * 16×16 viewBox — each cell a 2×2 block. ASCII art, not hand-plotted bezier
 * coordinates, because a typo'd `#` is visible in the grid shape itself;
 * blocky cells are the honest bitmap equivalent of a vector icon.
 */
export function Glyph({ rows }: { rows: readonly string[] }) {
  const cell = 2;
  const rects: Array<{ x: number; y: number }> = [];
  rows.forEach((row, y) => {
    [...row].forEach((char, x) => {
      if (char === "#") rects.push({ x, y });
    });
  });
  return (
    <>
      {rects.map(({ x, y }) => (
        <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} />
      ))}
    </>
  );
}
