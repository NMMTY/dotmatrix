import type { ElementType as ReactElementType, Ref } from "react";
import type { PolymorphicComponent } from "../../system/ElementType";
import { Column, type ColumnOwnProps } from "../Column/Column";

export type CardOwnProps = ColumnOwnProps;

type CardProps = CardOwnProps & {
  as?: ReactElementType;
  ref?: Ref<Element>;
} & Record<string, unknown>;

/**
 * `Column` with a surface's worth of sensible defaults — not a new visual
 * vocabulary, just spacing/border/radius/background values a caller would
 * otherwise repeat on every card. Every default is a plain JS default
 * parameter, not a class the caller's own prop has to out-cascade: passing
 * `padding="8"` simply never reaches the `padding="24"` default, so there's
 * no ambiguity about which of two same-specificity classes wins.
 */
function CardImpl({
  gap = "12",
  padding = "24",
  background = "surface",
  borderWidth = "1",
  borderColor = "medium",
  radius = "surface",
  ...props
}: CardProps) {
  return (
    <Column
      gap={gap}
      padding={padding}
      background={background}
      borderWidth={borderWidth}
      borderColor={borderColor}
      radius={radius}
      {...props}
    />
  );
}
CardImpl.displayName = "Card";

export const Card = CardImpl as PolymorphicComponent<"div", CardOwnProps>;
