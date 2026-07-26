import type { ElementType as ReactElementType, ReactNode, Ref } from "react";
import { ElementType, type PolymorphicComponent } from "../../system/ElementType";
import { resolveStyleProps } from "../../system/resolveStyleProps";
import type { CommonProps, StyleProps } from "../../system/types";
import styles from "./Flex.module.scss";

export interface FlexOwnProps extends StyleProps, CommonProps {
  children?: ReactNode;
  /** Shorthand for `as="a"` — see system/ElementType.tsx. */
  href?: string;
}

type FlexProps = FlexOwnProps & {
  as?: ReactElementType;
  ref?: Ref<Element>;
} & Record<string, unknown>;

/**
 * The base layout primitive. `Row` and `Column` are `Flex` with a fixed
 * `direction`; reach for `Flex` directly when the direction itself needs to
 * respond to a breakpoint (`m={{ direction: "column" }}`).
 *
 * Server-renderable: no hooks, no client-only APIs. Responsive props resolve
 * to plain classes at build time (see styles/_mixins.scss), so this component
 * never needs a client-side breakpoint check to do its job.
 */
function FlexImpl({ as, ref, ...props }: FlexProps) {
  const { className, style, rest } = resolveStyleProps(props);
  return (
    <ElementType
      as={as}
      ref={ref}
      className={["dm-flex", styles.flex, className].filter(Boolean).join(" ")}
      style={style}
      {...rest}
    />
  );
}
FlexImpl.displayName = "Flex";

export const Flex = FlexImpl as PolymorphicComponent<"div", FlexOwnProps>;
