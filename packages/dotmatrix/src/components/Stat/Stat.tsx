import type { ReactNode, Ref } from "react";
import { resolveStyleProps } from "../../system/resolveStyleProps";
import type { CommonProps, StyleProps } from "../../system/types";
import { Column } from "../Column/Column";
import { Icon } from "../Icon/Icon";
import { Row } from "../Row/Row";
import { Text } from "../Text/Text";
import styles from "./Stat.module.scss";

export interface StatTrend {
  direction: "up" | "down";
  /** Formatted delta, e.g. `"+12%"` — this component doesn't compute it. */
  value: ReactNode;
}

export interface StatOwnProps extends StyleProps, CommonProps {
  label: ReactNode;
  /** The headline number/figure, already formatted by the caller (e.g. `"$1,400"`). */
  value: ReactNode;
  /**
   * `"up"` renders in the success color and `"down"` in the error one — the
   * common case (revenue, users, ...). For a metric where down is the good
   * direction (spend, errors, ...), swap which one you pass rather than
   * reaching for a config flag here.
   */
  trend?: StatTrend;
  /** Optional content below the figure — a `Meter`, a helper `Text`, etc. */
  children?: ReactNode;
}

type StatProps = StatOwnProps & { ref?: Ref<HTMLDivElement> } & Record<string, unknown>;

/** A labeled headline figure with an optional trend delta — a reusable form of the sandbox's own Budget widget. */
function StatImpl({ ref, label, value, trend, children, ...props }: StatProps) {
  const { className, style, rest } = resolveStyleProps(props);
  return (
    <Column
      ref={ref}
      gap="4"
      className={["dm-stat", className].filter(Boolean).join(" ")}
      style={style}
      {...rest}
    >
      <Text as="span" fontSize="xs" color="weak" tracking="wide" uppercase>
        {label}
      </Text>
      <Row alignItems="baseline" gap="8">
        <Text as="span" displaySize="l" weight="bold">
          {value}
        </Text>
        {trend && (
          <Row
            as="span"
            alignItems="center"
            gap="2"
            className={[styles.trend, trend.direction === "up" ? styles.up : styles.down].join(" ")}
          >
            <Icon name={trend.direction === "up" ? "chevron-up" : "chevron-down"} size="s" />
            <Text as="span" fontSize="xs" weight="medium">
              {trend.value}
            </Text>
          </Row>
        )}
      </Row>
      {children}
    </Column>
  );
}
StatImpl.displayName = "Stat";
export const Stat = StatImpl;
