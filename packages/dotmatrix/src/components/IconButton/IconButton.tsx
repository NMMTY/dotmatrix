import type { ElementType as ReactElementType, ReactNode, Ref } from "react";
import type { IconName } from "../../icons";
import type { PolymorphicComponent } from "../../system/ElementType";
import { resolveStyleProps } from "../../system/resolveStyleProps";
import type { CommonProps, StyleProps } from "../../system/types";
import { Icon } from "../Icon/Icon";
import styles from "./IconButton.module.scss";

export interface IconButtonOwnProps extends StyleProps, CommonProps {
  /** @default "ghost" */
  variant?: "solid" | "outline" | "ghost";
  /** @default "m" */
  size?: "s" | "m" | "l";
  disabled?: boolean;
  href?: string;
  /** One of the built-in icons, sized to match `size` automatically. Omit in favor of `children` for a custom icon element. */
  icon?: IconName;
  children?: ReactNode;
  /**
   * Required, not optional: an icon-only control has no visible text, so
   * without this it's silently unusable for anyone on a screen reader. See
   * components/Icon/Icon.tsx — `title` there is for a decorative-vs-labeled
   * choice; here there's no visible label to fall back on, so it isn't one.
   */
  "aria-label": string;
}

type IconButtonProps = IconButtonOwnProps & {
  as?: ReactElementType;
  ref?: Ref<Element>;
} & Record<string, unknown>;

/** A square, icon-only button. See Button for the text/icon+text case. */
function IconButtonImpl({
  as,
  ref,
  variant = "ghost",
  size = "m",
  icon,
  children,
  disabled,
  href,
  type,
  ...props
}: IconButtonProps & { type?: string }) {
  const { className, style, rest } = resolveStyleProps(props);
  const Component = (as ?? (href ? "a" : "button")) as ReactElementType;
  const isNativeButton = Component === "button";

  return (
    <Component
      // biome-ignore lint/suspicious/noExplicitAny: the concrete element is only known at runtime
      ref={ref as any}
      href={href}
      type={isNativeButton ? (type ?? "button") : type}
      disabled={isNativeButton ? disabled : undefined}
      aria-disabled={!isNativeButton && disabled ? true : undefined}
      className={["dm-icon-button", styles.base, styles[size], styles[variant], className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...rest}
    >
      {children ?? (icon && <Icon name={icon} size={size} />)}
    </Component>
  );
}
IconButtonImpl.displayName = "IconButton";

export const IconButton = IconButtonImpl as PolymorphicComponent<"button", IconButtonOwnProps>;
