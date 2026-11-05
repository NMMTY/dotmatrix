import type { CSSProperties, ReactElement } from "react";
import type { StyleProps } from "../../system/types";
import { Row } from "../Row/Row";
import styles from "./ExternalIcon.module.scss";

// Must stay in step with Icon's SIZE_PX so the two sit side by side.
const SIZE_PX = { s: 9, m: 18, l: 27 } as const;

/**
 * The de facto shape react-icons (and most functional-component icon sets)
 * export — no dependency on the `react-icons` package itself, just its
 * component signature, so this works with any icon library built the same
 * way without adding a dependency `@nmmty/dotmatrix` doesn't otherwise need.
 */
export interface ExternalIconComponentProps {
  size?: number | string;
  color?: string;
  className?: string;
  style?: CSSProperties;
  title?: string;
}
export type ExternalIconComponent = (props: ExternalIconComponentProps) => ReactElement | null;

export interface ExternalIconOwnProps extends StyleProps {
  /** An icon component from react-icons (or any icon set shaped the same way) — e.g. `FaBeer` from `"react-icons/fa"`. */
  icon: ExternalIconComponent;
  /** @default "m" */
  size?: keyof typeof SIZE_PX;
  /** Forces the icon to render in `currentColor` even if its own markup hardcodes a fill — brand/logo icon sets often do. @default false */
  forceMonochrome?: boolean;
  /** Accessible name. Omit for a purely decorative icon (it's hidden from AT). */
  title?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Adapts an icon component from outside this system's own hand-drawn glyph
 * catalog — react-icons, or anything shaped the same way — so it can sit
 * next to `Icon` with matching size steps and the same accessible-name
 * wiring. These render as whatever vector art the source library draws
 * (smooth curves, not this system's blocky 8×8 bitmap grid): reach for
 * `Icon`'s own catalog first, and use this as the escape hatch for a glyph
 * it doesn't have.
 */
export function ExternalIcon({
  icon: IconComponent,
  size = "m",
  forceMonochrome = false,
  title,
  className,
  style,
  ...rest
}: ExternalIconOwnProps) {
  const px = SIZE_PX[size];
  return (
    <Row
      as="span"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={[styles.wrapper, forceMonochrome ? styles.monochrome : undefined, className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...rest}
    >
      <IconComponent size={px} className={styles.svg} />
    </Row>
  );
}
ExternalIcon.displayName = "ExternalIcon";
