import type { ElementType as ReactElementType, Ref } from "react";
import { ElementType, type PolymorphicComponent } from "../../system/ElementType";
import { resolveStyleProps } from "../../system/resolveStyleProps";
import type { FlexOwnProps } from "../Flex/Flex";
import styles from "./Row.module.scss";

export type RowOwnProps = Omit<FlexOwnProps, "direction">;

type RowProps = RowOwnProps & {
  as?: ReactElementType;
  ref?: Ref<Element>;
} & Record<string, unknown>;

/** `Flex` fixed to `direction: row`. The default horizontal layout primitive. */
function RowImpl({ as, ref, ...props }: RowProps) {
  const { className, style, rest } = resolveStyleProps(props);
  return (
    <ElementType
      as={as}
      ref={ref}
      className={["dm-row", styles.row, className].filter(Boolean).join(" ")}
      style={style}
      {...rest}
    />
  );
}
RowImpl.displayName = "Row";

export const Row = RowImpl as PolymorphicComponent<"div", RowOwnProps>;
