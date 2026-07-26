import type { ReactNode, Ref } from "react";
import { ElementType, type PolymorphicComponent } from "../../system/ElementType";
import { resolveStyleProps } from "../../system/resolveStyleProps";
import type { CommonProps, StyleProps } from "../../system/types";
import styles from "./Heading.module.scss";

export type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface HeadingOwnProps extends StyleProps, CommonProps {
  children?: ReactNode;
}

type HeadingProps = HeadingOwnProps & {
  as?: HeadingTag;
  ref?: Ref<Element>;
} & Record<string, unknown>;

/**
 * A section heading. `as` picks the semantic level (h1–h6, default h2) —
 * unlike `Flex`'s `as`, it's constrained to heading tags only, since a
 * heading rendering as a `<div>` would silently drop out of the document
 * outline. Visual size is independent of level: override with `displaySize`
 * when a heading's importance and its place in the outline don't match.
 */
function HeadingImpl({ as = "h2", ref, ...props }: HeadingProps) {
  const { className, style, rest } = resolveStyleProps(props);
  return (
    <ElementType
      as={as}
      ref={ref}
      className={["dm-heading", styles.heading, className].filter(Boolean).join(" ")}
      style={style}
      {...rest}
    />
  );
}
HeadingImpl.displayName = "Heading";

export const Heading = HeadingImpl as PolymorphicComponent<"h2", HeadingOwnProps>;
