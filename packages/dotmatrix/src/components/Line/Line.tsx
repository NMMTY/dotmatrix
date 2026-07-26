import type { ElementType as ReactElementType, Ref } from "react";
import { ElementType, type PolymorphicComponent } from "../../system/ElementType";
import { resolveStyleProps } from "../../system/resolveStyleProps";
import type { CommonProps, StyleProps } from "../../system/types";
import styles from "./Line.module.scss";

// `Omit<StyleProps, "direction">` because StyleProps' `direction` is the
// flex-direction prop (row/column/...) — a divider's own axis is a distinct
// concept (and a distinct value set) and needs its own name to avoid the two
// colliding under one incompatible type.
export interface LineOwnProps extends Omit<StyleProps, "direction">, CommonProps {
  /** @default "horizontal" */
  orientation?: "horizontal" | "vertical";
}

type LineProps = LineOwnProps & {
  as?: ReactElementType;
  ref?: Ref<Element>;
} & Record<string, unknown>;

/** A hairline divider. Not a `Flex` variant — dividers have no children. */
function LineImpl({ as, ref, orientation = "horizontal", ...props }: LineProps) {
  const { className, style, rest } = resolveStyleProps(props);
  return (
    <ElementType
      as={as}
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      className={[
        "dm-line",
        styles.line,
        orientation === "vertical" ? styles.vertical : styles.horizontal,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...rest}
    />
  );
}
LineImpl.displayName = "Line";

export const Line = LineImpl as PolymorphicComponent<"div", LineOwnProps>;
