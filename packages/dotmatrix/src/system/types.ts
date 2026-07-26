import type * as P from "./props";

// -----------------------------------------------------------------------------
// Style prop families
//
// Each interface below is a 1:1 mirror of one styles/*.scss file. Keeping them
// split (rather than one flat StyleProps) is what lets a component opt into
// only the families it actually supports — Text has TypographyProps but not
// GridProps, for instance — while StyleProps (the union, at the bottom) is
// what the layout primitives take.
// -----------------------------------------------------------------------------

export interface SpacingProps {
  padding?: P.SpacingValue;
  paddingX?: P.SpacingValue;
  paddingY?: P.SpacingValue;
  paddingTop?: P.SpacingValue;
  paddingRight?: P.SpacingValue;
  paddingBottom?: P.SpacingValue;
  paddingLeft?: P.SpacingValue;
  margin?: P.SpacingValue;
  marginX?: P.SpacingValue;
  marginY?: P.SpacingValue;
  marginTop?: P.SpacingValue;
  marginRight?: P.SpacingValue;
  marginBottom?: P.SpacingValue;
  marginLeft?: P.SpacingValue;
  gap?: P.SpacingValue;
  gapX?: P.SpacingValue;
  gapY?: P.SpacingValue;
}

export interface SizeProps {
  width?: P.SizeValue;
  height?: P.SizeValue;
  minWidth?: P.SizeValue;
  maxWidth?: P.SizeValue;
  minHeight?: P.SizeValue;
  maxHeight?: P.SizeValue;
}

export interface FlexProps {
  direction?: P.DirectionValue;
  wrap?: P.WrapValue;
  alignItems?: P.AlignValue;
  alignSelf?: P.AlignValue;
  justifyContent?: P.JustifyValue;
  flex?: P.FlexShorthandValue;
  flexGrow?: P.FlexGrowShrinkValue;
  flexShrink?: P.FlexGrowShrinkValue;
}

export interface GridProps {
  columns?: P.ColumnValue;
  rows?: P.RowValue;
  justifyItems?: P.JustifyItemsValue;
  colSpan?: P.SpanValue;
  rowSpan?: P.SpanValue;
}

export interface DisplayProps {
  display?: P.DisplayValue;
  overflow?: P.OverflowValue;
  overflowX?: P.OverflowValue;
  overflowY?: P.OverflowValue;
  hidden?: boolean;
}

export interface PositionProps {
  position?: P.PositionValue;
  inset?: P.InsetValue;
  top?: P.InsetValue;
  right?: P.InsetValue;
  bottom?: P.InsetValue;
  left?: P.InsetValue;
  zIndex?: P.ZIndexValue;
}

export interface BorderProps {
  radius?: P.RadiusValue;
  borderWidth?: P.BorderWidthValue;
  borderColor?: P.BorderColorValue;
  borderStyle?: P.BorderStyleValue;
  notched?: boolean;
}

export interface ColorProps {
  color?: P.ColorValue;
  background?: P.BackgroundValue;
}

export interface ShadowProps {
  shadow?: P.ShadowValue;
}

export interface PatternProps {
  pattern?: P.PatternValue;
}

export interface TypographyProps {
  font?: P.FontFamilyValue;
  fontSize?: P.FontSizeValue;
  displaySize?: P.DisplaySizeValue;
  leading?: P.FontSizeValue;
  weight?: P.FontWeightValue;
  tracking?: P.TrackingValue;
  align?: P.TextAlignValue;
  uppercase?: boolean;
  truncate?: boolean;
}

/** Style props that have a generated per-breakpoint variant in Sass. */
export interface ResponsiveStyleProps
  extends SpacingProps,
    SizeProps,
    Pick<FlexProps, "direction" | "wrap" | "alignItems" | "alignSelf" | "justifyContent">,
    Pick<GridProps, "columns" | "rows" | "justifyItems">,
    DisplayProps,
    Pick<PositionProps, "position">,
    Pick<BorderProps, "radius">,
    Pick<TypographyProps, "fontSize" | "displaySize" | "leading"> {}

/** The full style-prop surface a layout primitive accepts. */
export interface StyleProps
  extends SpacingProps,
    SizeProps,
    FlexProps,
    GridProps,
    DisplayProps,
    PositionProps,
    BorderProps,
    ColorProps,
    ShadowProps,
    PatternProps,
    TypographyProps {
  /** Per-breakpoint overrides, applied max-width-down (mobile-first cascade). */
  xl?: ResponsiveStyleProps;
  l?: ResponsiveStyleProps;
  m?: ResponsiveStyleProps;
  s?: ResponsiveStyleProps;
  xs?: ResponsiveStyleProps;
}

/** Props every primitive accepts regardless of its style-prop surface. */
export interface CommonProps {
  className?: string;
  style?: React.CSSProperties;
  /** Scopes the accent palette to this element's subtree — same `data-palette` mechanism `ThemeProvider` uses on `<html>`, just anchored lower (see `resolveStyleProps.ts`). */
  palette?: P.PaletteValue;
}
