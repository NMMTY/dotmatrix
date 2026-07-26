import type { Ref } from "react";
import { resolveStyleProps } from "../../system/resolveStyleProps";
import type { CommonProps, StyleProps } from "../../system/types";
import styles from "./Skeleton.module.scss";

export interface SkeletonOwnProps extends StyleProps, CommonProps {
  /** Renders fully round, for an avatar-shaped placeholder. @default false */
  circle?: boolean;
}

type SkeletonProps = SkeletonOwnProps & { ref?: Ref<HTMLSpanElement> } & Record<string, unknown>;

/**
 * A loading placeholder. Purely decorative (`aria-hidden`) — wrap the group
 * it stands in with your own `aria-busy`/live region if the loading state
 * itself needs to be announced.
 */
function SkeletonImpl({
  ref,
  circle = false,
  radius,
  height = "16",
  width = "full",
  ...props
}: SkeletonProps) {
  const { className, style, rest } = resolveStyleProps({
    ...props,
    height,
    width,
    radius: radius ?? (circle ? "full" : "control"),
  });
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={["dm-skeleton", styles.skeleton, className].filter(Boolean).join(" ")}
      style={style}
      {...rest}
    />
  );
}
SkeletonImpl.displayName = "Skeleton";

export const Skeleton = SkeletonImpl;
