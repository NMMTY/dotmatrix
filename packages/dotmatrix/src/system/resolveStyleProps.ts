import type { CSSProperties } from "react";
import { breakpoints } from "./props";

/**
 * Maps a style prop name to its Sass class prefix and whether it has a
 * per-breakpoint variant — the runtime counterpart of props.ts's manifest,
 * verified against styles/*.scss by system/props.contract.test.ts. Every
 * prop reduces to the same `dm-{prefix}-{value}` shape (e.g. `align="left"`
 * → prefix "text" → `.dm-text-left`), so no per-family special-casing here.
 */
export const SCALE_PROPS: Record<string, { prefix: string; responsive: boolean }> = {
  // spacing
  padding: { prefix: "padding", responsive: true },
  paddingX: { prefix: "padding-x", responsive: true },
  paddingY: { prefix: "padding-y", responsive: true },
  paddingTop: { prefix: "padding-top", responsive: true },
  paddingRight: { prefix: "padding-right", responsive: true },
  paddingBottom: { prefix: "padding-bottom", responsive: true },
  paddingLeft: { prefix: "padding-left", responsive: true },
  margin: { prefix: "margin", responsive: true },
  marginX: { prefix: "margin-x", responsive: true },
  marginY: { prefix: "margin-y", responsive: true },
  marginTop: { prefix: "margin-top", responsive: true },
  marginRight: { prefix: "margin-right", responsive: true },
  marginBottom: { prefix: "margin-bottom", responsive: true },
  marginLeft: { prefix: "margin-left", responsive: true },
  gap: { prefix: "gap", responsive: true },
  gapX: { prefix: "gap-x", responsive: true },
  gapY: { prefix: "gap-y", responsive: true },

  // size
  width: { prefix: "width", responsive: true },
  height: { prefix: "height", responsive: true },
  minWidth: { prefix: "min-width", responsive: true },
  maxWidth: { prefix: "max-width", responsive: true },
  minHeight: { prefix: "min-height", responsive: true },
  maxHeight: { prefix: "max-height", responsive: true },

  // flex
  direction: { prefix: "direction", responsive: true },
  wrap: { prefix: "wrap", responsive: true },
  alignItems: { prefix: "align-items", responsive: true },
  alignSelf: { prefix: "align-self", responsive: true },
  justifyContent: { prefix: "justify-content", responsive: true },
  flex: { prefix: "flex", responsive: false },
  flexGrow: { prefix: "flex-grow", responsive: false },
  flexShrink: { prefix: "flex-shrink", responsive: false },

  // grid
  columns: { prefix: "columns", responsive: true },
  rows: { prefix: "rows", responsive: true },
  justifyItems: { prefix: "justify-items", responsive: true },
  colSpan: { prefix: "col-span", responsive: false },
  rowSpan: { prefix: "row-span", responsive: false },

  // display
  display: { prefix: "display", responsive: true },
  overflow: { prefix: "overflow", responsive: true },
  overflowX: { prefix: "overflow-x", responsive: true },
  overflowY: { prefix: "overflow-y", responsive: true },

  // position
  position: { prefix: "position", responsive: true },
  inset: { prefix: "inset", responsive: false },
  top: { prefix: "top", responsive: false },
  right: { prefix: "right", responsive: false },
  bottom: { prefix: "bottom", responsive: false },
  left: { prefix: "left", responsive: false },
  zIndex: { prefix: "z", responsive: false },

  // border
  radius: { prefix: "radius", responsive: true },
  borderWidth: { prefix: "border-width", responsive: false },
  borderColor: { prefix: "border-color", responsive: false },
  borderStyle: { prefix: "border-style", responsive: false },

  // color
  color: { prefix: "color", responsive: false },
  background: { prefix: "background", responsive: false },

  // shadow / pattern
  shadow: { prefix: "shadow", responsive: false },
  pattern: { prefix: "pattern", responsive: false },

  // typography
  font: { prefix: "font", responsive: false },
  fontSize: { prefix: "font-size", responsive: true },
  displaySize: { prefix: "display-size", responsive: true },
  leading: { prefix: "leading", responsive: true },
  weight: { prefix: "weight", responsive: false },
  tracking: { prefix: "tracking", responsive: false },
  align: { prefix: "text", responsive: false },
};

/** Props whose only meaningful value is `true`; `false`/absent adds nothing. */
export const BOOLEAN_PROPS: Record<string, string> = {
  hidden: "dm-hidden",
  notched: "dm-border-notched",
  uppercase: "dm-uppercase",
  truncate: "dm-truncate",
};

const RESPONSIVE_KEYS = new Set<string>(breakpoints);

export interface ResolvedStyleProps {
  className: string;
  style: CSSProperties | undefined;
  /** Everything not recognized as a style prop — native attrs, handlers, data-*. */
  rest: Record<string, unknown>;
}

/**
 * Splits a component's props into a resolved `className`, a passthrough
 * `style`, and a `rest` bag of whatever wasn't a recognized style prop (so
 * `onClick`, `id`, `aria-*`, `data-*` reach the DOM node untouched). Class
 * order in the result is cosmetic — the cascade is decided by rule order in
 * the generated stylesheet, not attribute order.
 */
export function resolveStyleProps(props: Record<string, unknown>): ResolvedStyleProps {
  const classes: string[] = [];
  const rest: Record<string, unknown> = {};
  let style: CSSProperties | undefined;

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined) continue;

    if (key === "className") {
      if (typeof value === "string" && value.length > 0) classes.push(value);
      continue;
    }
    if (key === "style") {
      style = value as CSSProperties;
      continue;
    }
    if (key === "palette") {
      rest["data-palette"] = value;
      continue;
    }
    if (RESPONSIVE_KEYS.has(key)) {
      const overrides = value as Record<string, unknown>;
      for (const [ovKey, ovValue] of Object.entries(overrides)) {
        if (ovValue === undefined) continue;
        const scaleProp = SCALE_PROPS[ovKey];
        if (!scaleProp?.responsive) continue; // caught by props.contract.test.ts
        classes.push(`dm-${key}-${scaleProp.prefix}-${ovValue}`);
      }
      continue;
    }
    if (key in BOOLEAN_PROPS) {
      if (value === true) classes.push(BOOLEAN_PROPS[key]!);
      continue;
    }
    const scaleProp = SCALE_PROPS[key];
    if (scaleProp) {
      classes.push(`dm-${scaleProp.prefix}-${value}`);
      continue;
    }

    rest[key] = value;
  }

  return { className: classes.join(" "), style, rest };
}
