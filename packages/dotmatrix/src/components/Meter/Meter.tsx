import type { Ref } from "react";
import type { CommonProps, StyleProps } from "../../system/types";
import { Row } from "../Row/Row";
import styles from "./Meter.module.scss";

export interface MeterOwnProps extends StyleProps, CommonProps {
  value: number;
  /** @default 100 */
  max?: number;
  /** Visual cell count — a discrete tick bar, not a continuous fill. @default 24 */
  segments?: number;
  /** `"led"` swaps the bordered/hollow empty cell for a dim solid fill, butted tightly — an LED-bar look. @default "outline" */
  variant?: "outline" | "led";
  /**
   * Required: a meter has no visible text of its own, so without this it's
   * silently unreadable on a screen reader (same reasoning as IconButton's
   * `aria-label`).
   */
  label: string;
}

type MeterProps = MeterOwnProps & { ref?: Ref<HTMLDivElement> } & Record<string, unknown>;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * A segmented gauge — e.g. spend against a budget — not a task-completion
 * indicator (that's a future `Progress`). Renders as discrete filled/empty
 * cells rather than a continuous bar: a half-filled cell has no bitmap
 * equivalent, so the value rounds to the nearest whole cell.
 */
function MeterImpl({
  ref,
  value,
  max = 100,
  segments = 24,
  variant = "outline",
  label,
  className,
  ...props
}: MeterProps) {
  const ratio = clamp01(max === 0 ? 0 : value / max);
  const filledCount = Math.round(ratio * segments);

  return (
    <Row
      gap={variant === "led" ? "1" : "2"}
      {...props}
      ref={ref}
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={["dm-meter", variant === "led" ? styles.led : undefined, className]
        .filter(Boolean)
        .join(" ")}
    >
      {Array.from({ length: segments }, (_, i) => (
        <span
          // Index is a legitimate key here: cells are positional and never
          // reordered, inserted, or removed independently of `segments`.
          // biome-ignore lint/suspicious/noArrayIndexKey: see comment above
          key={i}
          className={[styles.cell, i < filledCount ? styles.filled : undefined]
            .filter(Boolean)
            .join(" ")}
        />
      ))}
    </Row>
  );
}
MeterImpl.displayName = "Meter";

export const Meter = MeterImpl;
