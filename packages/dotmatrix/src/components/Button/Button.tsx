import type { ElementType as ReactElementType, ReactNode, Ref } from "react";
import type { IconName } from "../../icons";
import type { PolymorphicComponent } from "../../system/ElementType";
import { resolveStyleProps } from "../../system/resolveStyleProps";
import type { CommonProps, StyleProps } from "../../system/types";
import { Icon } from "../Icon/Icon";
import styles from "./Button.module.scss";

export interface ButtonOwnProps extends StyleProps, CommonProps {
  /** @default "solid" */
  variant?: "solid" | "outline" | "ghost";
  /** @default "m" */
  size?: "s" | "m" | "l";
  /** Sized to match `size` automatically — manual `<Button><Icon .../>text</Button>` composition still works if you need different sizing. */
  icon?: IconName;
  /** @default "start" */
  iconPosition?: "start" | "end";
  disabled?: boolean;
  /** Shorthand for `as="a"`. */
  href?: string;
  children?: ReactNode;
}

type ButtonProps = ButtonOwnProps & {
  as?: ReactElementType;
  ref?: Ref<Element>;
} & Record<string, unknown>;

/**
 * Doesn't go through the shared `ElementType` helper (unlike Flex/Row/...):
 * those default to `<div>`, but a button's honest default is `<button>`, so
 * it resolves its own tag and — only for the real `<button>` case — sets
 * `type="button"` to avoid an accidental form submit, and forwards
 * `disabled` natively. Set `as="a"` (or just `href`) for a button that
 * navigates instead of acting.
 */
function ButtonImpl({
  as,
  ref,
  variant = "solid",
  size = "m",
  icon,
  iconPosition = "start",
  disabled,
  href,
  type,
  children,
  ...props
}: ButtonProps & { type?: string }) {
  const { className, style, rest } = resolveStyleProps(props);
  const Component = (as ?? (href ? "a" : "button")) as ReactElementType;
  const isNativeButton = Component === "button";
  const iconElement = icon ? <Icon name={icon} size={size} /> : null;

  return (
    <Component
      // biome-ignore lint/suspicious/noExplicitAny: the concrete element is only known at runtime
      ref={ref as any}
      href={href}
      type={isNativeButton ? (type ?? "button") : type}
      disabled={isNativeButton ? disabled : undefined}
      aria-disabled={!isNativeButton && disabled ? true : undefined}
      className={["dm-button", styles.base, styles[size], styles[variant], className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...rest}
    >
      {iconPosition === "start" && iconElement}
      {children}
      {iconPosition === "end" && iconElement}
    </Component>
  );
}
ButtonImpl.displayName = "Button";

export const Button = ButtonImpl as PolymorphicComponent<"button", ButtonOwnProps>;
