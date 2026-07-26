import type { ElementType as ReactElementType, ReactNode, Ref } from "react";
import { ElementType, type PolymorphicComponent } from "../../system/ElementType";
import { resolveStyleProps } from "../../system/resolveStyleProps";
import type { CommonProps, StyleProps } from "../../system/types";
import styles from "./Grid.module.scss";

export interface GridOwnProps extends StyleProps, CommonProps {
  children?: ReactNode;
  href?: string;
}

type GridProps = GridOwnProps & {
  as?: ReactElementType;
  ref?: Ref<Element>;
} & Record<string, unknown>;

/** CSS Grid layout primitive. Use `columns`/`rows` (1–12 / 1–6) for templates. */
function GridImpl({ as, ref, ...props }: GridProps) {
  const { className, style, rest } = resolveStyleProps(props);
  return (
    <ElementType
      as={as}
      ref={ref}
      className={["dm-grid", styles.grid, className].filter(Boolean).join(" ")}
      style={style}
      {...rest}
    />
  );
}
GridImpl.displayName = "Grid";

export const Grid = GridImpl as PolymorphicComponent<"div", GridOwnProps>;
