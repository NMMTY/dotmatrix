"use client";

import { Button, type Palette, Row, useTheme } from "@nmmty/dotmatrix";

const PALETTES: Palette[] = [
  "mono",
  "orange",
  "orange-dark",
  "orange-light",
  "blue",
  "blue-dark",
  "blue-light",
  "green",
  "green-dark",
  "green-light",
  "purple",
  "purple-dark",
  "purple-light",
  "red",
  "red-dark",
  "red-light",
];

/** Cycles the whole page's global palette — every solid Button/Switch/Radio/Checkbox on the page reacts, live. */
export function PaletteSwitcherDemo() {
  const { palette, setPalette } = useTheme();

  return (
    <Row gap="12" wrap="wrap" alignItems="center">
      <Button
        variant="outline"
        onClick={() => setPalette(PALETTES[(PALETTES.indexOf(palette) + 1) % PALETTES.length]!)}
      >
        Global palette: {palette}
      </Button>
      <Button variant="solid">Reacts globally</Button>
      <Button variant="solid" palette="blue">
        Always blue (local prop)
      </Button>
    </Row>
  );
}
