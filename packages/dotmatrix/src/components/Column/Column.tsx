import type { ElementType as ReactElementType, Ref } from "react";
import { ElementType, type PolymorphicComponent } from "../../system/ElementType";
import { resolveStyleProps } from "../../system/resolveStyleProps";
import type { FlexOwnProps } from "../Flex/Flex";
import styles from "./Column.module.scss";

export type ColumnOwnProps = Omit<FlexOwnProps, "direction">;

type ColumnProps = ColumnOwnProps & {
  as?: ReactElementType;
  ref?: Ref<Element>;
} & Record<string, unknown>;

/** `Flex` fixed to `direction: column`. The default vertical layout primitive. */
function ColumnImpl({ as, ref, ...props }: ColumnProps) {
  const { className, style, rest } = resolveStyleProps(props);
  return (
    <ElementType
      as={as}
      ref={ref}
      className={["dm-column", styles.column, className].filter(Boolean).join(" ")}
      style={style}
      {...rest}
    />
  );
}
ColumnImpl.displayName = "Column";

export const Column = ColumnImpl as PolymorphicComponent<"div", ColumnOwnProps>;
