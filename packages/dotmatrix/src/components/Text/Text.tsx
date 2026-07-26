import type { ElementType as ReactElementType, ReactNode, Ref } from "react";
import { ElementType, type PolymorphicComponent } from "../../system/ElementType";
import { resolveStyleProps } from "../../system/resolveStyleProps";
import type { CommonProps, StyleProps } from "../../system/types";
import styles from "./Text.module.scss";

export interface TextOwnProps extends StyleProps, CommonProps {
  children?: ReactNode;
  href?: string;
}

type TextProps = TextOwnProps & {
  as?: ReactElementType;
  ref?: Ref<Element>;
} & Record<string, unknown>;

/**
 * Inline text. Deliberately not a `Flex` variant — text needs normal inline
 * flow (wrapping, `::selection`, baseline alignment inside a paragraph),
 * which `display: flex` would break. Renders as `<span>` by default; pass
 * `as="p"` / `as="label"` / etc. for the right semantics.
 */
function TextImpl({ as, ref, ...props }: TextProps) {
  const { className, style, rest } = resolveStyleProps(props);
  // ElementType's own fallback is `href ? "a" : "div"` — right for a layout
  // primitive, wrong for Text, so an explicit default is supplied here
  // whenever there's no href to let ElementType's own "a" fallback apply.
  const resolvedAs = as ?? (rest.href ? undefined : "span");
  return (
    <ElementType
      as={resolvedAs}
      ref={ref}
      className={["dm-text", styles.text, className].filter(Boolean).join(" ")}
      style={style}
      {...rest}
    />
  );
}
TextImpl.displayName = "Text";

export const Text = TextImpl as PolymorphicComponent<"span", TextOwnProps>;
