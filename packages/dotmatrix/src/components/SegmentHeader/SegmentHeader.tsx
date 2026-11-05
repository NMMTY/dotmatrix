import type { Ref } from "react";
import { resolveStyleProps } from "../../system/resolveStyleProps";
import type { CommonProps, StyleProps } from "../../system/types";
import { Row } from "../Row/Row";
import styles from "./SegmentHeader.module.scss";

export interface SegmentHeaderOwnProps extends StyleProps, CommonProps {
  /** Total number of square segments between the brackets. Defaults to 14. */
  segments?: number;
  /** How many segments are lit. Defaults to all of them — a plain section rule. */
  filled?: number;
  /** Accessible name. Without it the whole header is decorative and hidden from assistive tech. */
  label?: string;
}

type SegmentHeaderProps = SegmentHeaderOwnProps & { ref?: Ref<HTMLSpanElement> } & Record<
    string,
    unknown
  >;

/** A `[ ▪▪▪▪▪▪▪ ]` bracketed run of square segments — a section divider that can double as a coarse progress readout. */
function SegmentHeaderImpl({
  ref,
  segments = 14,
  filled = segments,
  label,
  ...props
}: SegmentHeaderProps) {
  const { className, style, rest } = resolveStyleProps(props);
  const total = Math.max(0, Math.floor(segments));
  const lit = Math.min(total, Math.max(0, Math.floor(filled)));
  const a11y = label
    ? {
        role: "meter",
        "aria-label": label,
        "aria-valuemin": 0,
        "aria-valuemax": total,
        "aria-valuenow": lit,
      }
    : { "aria-hidden": true };
  return (
    <Row
      as="span"
      ref={ref}
      display="inline-flex"
      alignItems="center"
      gap="2"
      className={["dm-segment-header", styles.base, className].filter(Boolean).join(" ")}
      style={style}
      {...a11y}
      {...rest}
    >
      <Row as="span" aria-hidden className={styles.bracket}>
        [
      </Row>
      {Array.from({ length: total }, (_, i) => (
        <Row
          as="span"
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length, order-stable list of identical cells.
          key={i}
          data-lit={i < lit ? "" : undefined}
          className={[styles.segment, i < lit ? styles.lit : ""].filter(Boolean).join(" ")}
        />
      ))}
      <Row as="span" aria-hidden className={styles.bracket}>
        ]
      </Row>
    </Row>
  );
}
SegmentHeaderImpl.displayName = "SegmentHeader";

export const SegmentHeader = SegmentHeaderImpl;
