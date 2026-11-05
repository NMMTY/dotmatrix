import type { ReactNode, Ref } from "react";
import { resolveStyleProps } from "../../system/resolveStyleProps";
import type { CommonProps, StyleProps } from "../../system/types";
import { Column } from "../Column/Column";
import { Icon } from "../Icon/Icon";
import { Row } from "../Row/Row";
import styles from "./WidgetCard.module.scss";

export interface WidgetCardOwnProps extends StyleProps, CommonProps {
  /** Heading of the widget — a place, a metric name. */
  title: ReactNode;
  /** The headline figure, already formatted (`"5°"`). */
  value: ReactNode;
  /** Short descriptor beside the figure (`"overcast clouds"`). */
  caption?: ReactNode;
  /** Small-print line under the divider. */
  footer?: ReactNode;
  /** When set, the title becomes a button with a trailing arrow. Needs `openLabel`. */
  onOpen?: () => void;
  /** Accessible name of the open button. */
  openLabel?: string;
}

type WidgetCardProps = WidgetCardOwnProps & { ref?: Ref<HTMLElement> } & Record<string, unknown>;

/** A compact glanceable card — title, one big figure with a caption, and a footnote. */
function WidgetCardImpl({
  ref,
  title,
  value,
  caption,
  footer,
  onOpen,
  openLabel,
  ...props
}: WidgetCardProps) {
  const { className, style, rest } = resolveStyleProps(props);
  return (
    <Column
      as="section"
      ref={ref}
      gap="16"
      className={["dm-widget-card", styles.base, className].filter(Boolean).join(" ")}
      style={style}
      {...rest}
    >
      {onOpen ? (
        <Row
          as="button"
          type="button"
          display="inline-flex"
          alignItems="center"
          alignSelf="start"
          gap="8"
          className={styles.header}
          onClick={onOpen}
          aria-label={openLabel}
        >
          <span className={styles.title}>{title}</span>
          <Icon name="arrow-right" size="s" />
        </Row>
      ) : (
        <Row
          display="inline-flex"
          alignItems="center"
          alignSelf="start"
          gap="8"
          className={styles.header}
        >
          <span className={styles.title}>{title}</span>
        </Row>
      )}
      <Column gap="4">
        <span className={styles.value}>{value}</span>
        {caption != null && <span className={styles.caption}>{caption}</span>}
      </Column>
      {footer != null && (
        <>
          <hr className={styles.rule} />
          <p className={styles.footer}>{footer}</p>
        </>
      )}
    </Column>
  );
}
WidgetCardImpl.displayName = "WidgetCard";

export const WidgetCard = WidgetCardImpl;
