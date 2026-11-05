import type { ReactNode, Ref } from "react";
import type { CommonProps, StyleProps } from "../../system/types";
import { Row } from "../Row/Row";
import styles from "./DiffChip.module.scss";

export interface DiffChipOwnProps extends StyleProps, CommonProps {
  /** File path or name the diff belongs to. */
  path: ReactNode;
  /** Lines added. */
  added: number;
  /** Lines removed. */
  removed: number;
}

type DiffChipProps = DiffChipOwnProps & { ref?: Ref<HTMLSpanElement> } & Record<string, unknown>;

/** A file path followed by its `+added −removed` line counts — the summary a code review shows per file. */
function DiffChipImpl({ ref, path, added, removed, className, ...props }: DiffChipProps) {
  return (
    <Row
      as="span"
      display="inline-flex"
      alignItems="center"
      gap="8"
      {...props}
      ref={ref}
      className={["dm-diff-chip", styles.base, className].filter(Boolean).join(" ")}
    >
      <span className={styles.path}>{path}</span>
      <Row as="span" display="inline-flex" className={styles.added}>
        <Row as="span" className={styles.srOnly}>
          {added} added{" "}
        </Row>
        <span aria-hidden>+{added}</span>
      </Row>
      <Row as="span" display="inline-flex" className={styles.removed}>
        <Row as="span" className={styles.srOnly}>
          {removed} removed
        </Row>
        <span aria-hidden>−{removed}</span>
      </Row>
    </Row>
  );
}
DiffChipImpl.displayName = "DiffChip";

export const DiffChip = DiffChipImpl;
