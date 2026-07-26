/**
 * The prop → class manifest: which style props exist, their values, and the
 * class prefix each resolves to. Kept in sync with styles/*.scss by hand,
 * guarded by system/props.contract.test.ts (parses the built stylesheet,
 * fails on either side missing a match). Adding a prop: add it here, add the
 * matching `emit-*` call in styles/, run the contract test.
 */

export const spacingValues = [
  "0",
  "1",
  "2",
  "4",
  "8",
  "12",
  "16",
  "20",
  "24",
  "32",
  "40",
  "48",
  "56",
  "64",
  "80",
  "96",
  "128",
  "160",
  "xs",
  "s",
  "m",
  "l",
  "xl",
] as const;
export type SpacingValue = (typeof spacingValues)[number];

export const sizeValues = [
  ...spacingValues,
  "auto",
  "full",
  "min",
  "max",
  "fit",
  "screen",
] as const;
export type SizeValue = (typeof sizeValues)[number];

export const insetValues = [...spacingValues, "auto", "full"] as const;
export type InsetValue = (typeof insetValues)[number];

export const directionValues = ["row", "column", "row-reverse", "column-reverse"] as const;
export type DirectionValue = (typeof directionValues)[number];

export const wrapValues = ["nowrap", "wrap", "wrap-reverse"] as const;
export type WrapValue = (typeof wrapValues)[number];

export const alignValues = ["start", "center", "end", "stretch", "baseline"] as const;
export type AlignValue = (typeof alignValues)[number];

export const justifyValues = ["start", "center", "end", "between", "around", "evenly"] as const;
export type JustifyValue = (typeof justifyValues)[number];

/** Narrower than AlignValue: CSS `justify-items` has no `baseline`. */
export const justifyItemsValues = ["start", "center", "end", "stretch"] as const;
export type JustifyItemsValue = (typeof justifyItemsValues)[number];

export const flexShorthandValues = ["1", "auto", "none"] as const;
export type FlexShorthandValue = (typeof flexShorthandValues)[number];

export const flexGrowShrinkValues = ["0", "1"] as const;
export type FlexGrowShrinkValue = (typeof flexGrowShrinkValues)[number];

export const spanValues = ["full"] as const;
export type SpanValue = (typeof spanValues)[number];

export const columnValues = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
] as const;
export type ColumnValue = (typeof columnValues)[number];

export const rowValues = ["1", "2", "3", "4", "5", "6"] as const;
export type RowValue = (typeof rowValues)[number];

export const displayValues = [
  "block",
  "inline-block",
  "inline",
  "flex",
  "inline-flex",
  "grid",
  "contents",
  "none",
] as const;
export type DisplayValue = (typeof displayValues)[number];

export const overflowValues = ["visible", "hidden", "scroll", "auto", "clip"] as const;
export type OverflowValue = (typeof overflowValues)[number];

export const positionValues = ["static", "relative", "absolute", "fixed", "sticky"] as const;
export type PositionValue = (typeof positionValues)[number];

export const zIndexValues = ["0", "10", "20", "30", "40", "overlay", "toast", "max"] as const;
export type ZIndexValue = (typeof zIndexValues)[number];

export const radiusValues = ["0", "2", "4", "8", "12", "16", "full", "control", "surface"] as const;
export type RadiusValue = (typeof radiusValues)[number];

export const borderWidthValues = ["0", "1", "2", "4"] as const;
export type BorderWidthValue = (typeof borderWidthValues)[number];

export const borderColorValues = ["strong", "medium", "weak", "solid", "transparent"] as const;
export type BorderColorValue = (typeof borderColorValues)[number];

export const borderStyleValues = ["solid", "dashed"] as const;
export type BorderStyleValue = (typeof borderStyleValues)[number];

export const colorValues = [
  "strong",
  "medium",
  "weak",
  "on-solid-strong",
  "on-solid-weak",
  "inherit",
  "current",
] as const;
export type ColorValue = (typeof colorValues)[number];

export const backgroundValues = ["page", "surface", "raised", "solid", "transparent"] as const;
export type BackgroundValue = (typeof backgroundValues)[number];

export const shadowValues = ["none", "s", "m", "l", "inset"] as const;
export type ShadowValue = (typeof shadowValues)[number];

export const fontFamilyValues = ["display", "mono", "pixel"] as const;
export type FontFamilyValue = (typeof fontFamilyValues)[number];

export const fontSizeValues = ["2xs", "xs", "s", "m", "l", "xl"] as const;
export type FontSizeValue = (typeof fontSizeValues)[number];

export const displaySizeValues = ["xs", "s", "m", "l", "xl"] as const;
export type DisplaySizeValue = (typeof displaySizeValues)[number];

export const fontWeightValues = ["regular", "medium", "bold"] as const;
export type FontWeightValue = (typeof fontWeightValues)[number];

export const trackingValues = ["tight", "normal", "wide", "display"] as const;
export type TrackingValue = (typeof trackingValues)[number];

export const textAlignValues = ["left", "center", "right"] as const;
export type TextAlignValue = (typeof textAlignValues)[number];

/**
 * `"mono"` (the default) keeps every `--dm-accent-*` reference equal to the
 * gray ramp. Each chromatic hue also has a `-dark` (deeper, muted) and
 * `-light` (pastel) variant alongside its vivid base.
 */
export const paletteValues = [
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
] as const;
export type PaletteValue = (typeof paletteValues)[number];

export const patternValues = [
  "0",
  "2",
  "4",
  "6",
  "8",
  "10",
  "12",
  "14",
  "16",
  "checker",
  "scanline",
  "grid",
] as const;
export type PatternValue = (typeof patternValues)[number];

export const breakpoints = ["xs", "s", "m", "l", "xl"] as const;
export type Breakpoint = (typeof breakpoints)[number];

/** Suffixes emit-sides() generates for a box-model prop family. */
export const sideSuffixes = {
  all: "",
  x: "-x",
  y: "-y",
  top: "-top",
  right: "-right",
  bottom: "-bottom",
  left: "-left",
} as const;
