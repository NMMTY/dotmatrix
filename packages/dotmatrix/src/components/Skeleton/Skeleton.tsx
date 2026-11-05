import type { Ref } from "react";
import type { CommonProps, StyleProps } from "../../system/types";
import { Flex } from "../Flex/Flex";
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
  return (
    <Flex
      as="span"
      ref={ref}
      aria-hidden="true"
      display="block"
      position="relative"
      overflow="hidden"
      {...props}
      height={height}
      width={width}
      radius={radius ?? (circle ? "full" : "control")}
      className={["dm-skeleton", styles.skeleton, props.className].filter(Boolean).join(" ")}
    />
  );
}
SkeletonImpl.displayName = "Skeleton";

export const Skeleton = SkeletonImpl;
