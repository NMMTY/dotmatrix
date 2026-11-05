import type { ReactNode, Ref } from "react";
import type { CommonProps, StyleProps } from "../../system/types";
import { Row } from "../Row/Row";
import styles from "./BracketValue.module.scss";

export interface BracketValueOwnProps extends StyleProps, CommonProps {
  /** Left-hand label, rendered before the colon — `"GPU's"` gives `[ GPU's: 24 ]`. */
  label?: ReactNode;
  /** The value inside the brackets, already formatted by the caller. */
  value: ReactNode;
}

type BracketValueProps = BracketValueOwnProps & { ref?: Ref<HTMLSpanElement> } & Record<
    string,
    unknown
  >;

/** An inline `[ label: value ]` readout — a terminal-style counter that sits in running text or a header. */
function BracketValueImpl({ ref, label, value, className, ...props }: BracketValueProps) {
  return (
    <Row
      as="span"
      display="inline-flex"
      alignItems="baseline"
      gap="8"
      {...props}
      ref={ref}
      className={["dm-bracket-value", styles.base, className].filter(Boolean).join(" ")}
    >
      <span aria-hidden className={styles.bracket}>
        [
      </span>
      {label != null && <span className={styles.label}>{label}:</span>}
      <span className={styles.value}>{value}</span>
      <span aria-hidden className={styles.bracket}>
        ]
      </span>
    </Row>
  );
}
BracketValueImpl.displayName = "BracketValue";

export const BracketValue = BracketValueImpl;
