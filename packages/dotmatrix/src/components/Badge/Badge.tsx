import type { ReactNode, Ref } from "react";
import { resolveStyleProps } from "../../system/resolveStyleProps";
import type { CommonProps, StyleProps } from "../../system/types";
import styles from "./Badge.module.scss";

export type BadgeVariant = "neutral" | "error" | "warning" | "success";

export interface BadgeOwnProps extends StyleProps, CommonProps {
  /** @default "neutral" */
  variant?: BadgeVariant;
  children?: ReactNode;
}

type BadgeProps = BadgeOwnProps & { ref?: Ref<HTMLSpanElement> } & Record<string, unknown>;

const DOT_CLASS: Record<BadgeVariant, string | undefined> = {
  neutral: undefined,
  error: styles.dotError,
  warning: styles.dotWarning,
  success: styles.dotSuccess,
};

/** A small status/category label. Not polymorphic — a badge is always inline. */
function BadgeImpl({ ref, variant = "neutral", children, ...props }: BadgeProps) {
  const { className, style, rest } = resolveStyleProps(props);
  return (
    <span
      ref={ref}
      className={["dm-badge", styles.base, styles[variant], className].filter(Boolean).join(" ")}
      style={style}
      {...rest}
    >
      {variant !== "neutral" && (
        <span aria-hidden className={[styles.dot, DOT_CLASS[variant]].filter(Boolean).join(" ")} />
      )}
      {children}
    </span>
  );
}
BadgeImpl.displayName = "Badge";

export const Badge = BadgeImpl;
