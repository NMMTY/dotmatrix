import type { Ref } from "react";
import type { CommonProps } from "../../system/types";
import styles from "./Avatar.module.scss";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

type AvatarBaseProps = CommonProps & { size?: "s" | "m" | "l"; ref?: Ref<HTMLSpanElement> };

// Either a real image with real alt text, or a name to derive initials from —
// never an image with no alt (a silent a11y gap) and never neither.
export type AvatarOwnProps = AvatarBaseProps &
  ({ src: string; alt: string; name?: string } | { src?: undefined; alt?: never; name: string });

// An explicit type guard, not `if (props.src)`: TS's control-flow narrowing
// doesn't reliably discriminate a union on an optional-vs-required field
// (as opposed to a shared literal tag), so the plain truthiness check leaves
// the `else` branch's `name` still typed as possibly-undefined.
function hasImage(props: AvatarOwnProps): props is Extract<AvatarOwnProps, { src: string }> {
  return typeof props.src === "string";
}

/** A circular image or initials fallback. Not polymorphic — always inline. */
function AvatarImpl(props: AvatarOwnProps) {
  const { ref, size = "m", className, style } = props;
  const classes = ["dm-avatar", styles.base, styles[size], className].filter(Boolean).join(" ");

  // Narrows on `props` itself (not a destructured remainder of it) — matching
  // hasImage's parameter type exactly is what lets TS narrow both branches,
  // not just the positive one.
  if (hasImage(props)) {
    return (
      <span ref={ref} className={classes} style={style}>
        <img src={props.src} alt={props.alt} className={styles.image} />
      </span>
    );
  }

  return (
    <span ref={ref} className={classes} style={style} title={props.name}>
      {initials(props.name)}
    </span>
  );
}
AvatarImpl.displayName = "Avatar";

export const Avatar = AvatarImpl;
