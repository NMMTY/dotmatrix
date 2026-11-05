import type { DisplayProps, FlexProps, GridProps, SpacingProps } from "./types";

/** The flex/grid/display subset of `StyleProps` that wrapper components forward to their outermost layout primitive. */
export type LayoutProps = Pick<SpacingProps, "gap" | "gapX" | "gapY"> &
  Pick<DisplayProps, "display"> &
  FlexProps &
  GridProps;

const LAYOUT_KEYS = [
  "display",
  "direction",
  "wrap",
  "gap",
  "gapX",
  "gapY",
  "alignItems",
  "alignSelf",
  "justifyContent",
  "justifyItems",
  "flex",
  "flexGrow",
  "flexShrink",
  "columns",
  "rows",
  "colSpan",
  "rowSpan",
] as const;

/**
 * Picks only the layout props out of a component's leftover props, so a
 * component whose outermost element is a primitive can forward them there
 * (after its own defaults, so the caller's values win) without leaking
 * unknown props onto it.
 */
export function pickLayoutProps(props: object): LayoutProps {
  const source = props as Record<string, unknown>;
  const picked: Record<string, unknown> = {};
  for (const key of LAYOUT_KEYS) {
    if (source[key] !== undefined) picked[key] = source[key];
  }
  return picked as LayoutProps;
}
