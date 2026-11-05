import type { CSSProperties, ReactNode, Ref } from "react";
import { resolveStyleProps } from "../../system/resolveStyleProps";
import type { CommonProps, StyleProps } from "../../system/types";
import { Column } from "../Column/Column";
import { Flex } from "../Flex/Flex";
import { Row } from "../Row/Row";
import styles from "./StackedBarChart.module.scss";

export interface StackedBarSeries {
  /** Legend and accessible name of the series. */
  label: string;
  /** One non-negative value per column. Missing trailing values count as 0. */
  values: number[];
}

export interface StackedBarChartOwnProps extends StyleProps, CommonProps {
  /** At most 6 series — one per dither density in `--dm-series-*`; extras are dropped. */
  series: StackedBarSeries[];
  /** Label for each column (`"1"`, `"4"`, …). Only every `labelEvery`-th one is drawn. */
  labels?: string[];
  /** Draw every n-th column label. Defaults to 1. */
  labelEvery?: number;
  /** Plot height in px. Defaults to 110. */
  plotHeight?: number;
  /** Accessible name for the whole chart. */
  title: string;
  /** Rendered above the plot — typically a `BracketValue` or filter controls. */
  header?: ReactNode;
}

type StackedBarChartProps = StackedBarChartOwnProps & { ref?: Ref<HTMLDivElement> } & Record<
    string,
    unknown
  >;

const MAX_SERIES = 6;

/** Column totals and the largest one, so each column can be scaled against the same ceiling. */
export function stackTotals(series: StackedBarSeries[], columns: number): number[] {
  return Array.from({ length: columns }, (_, c) =>
    series.reduce((sum, s) => sum + Math.max(0, s.values[c] ?? 0), 0),
  );
}

/** Columns of stacked segments, each segment filled with its own dither density rather than a hue. */
function StackedBarChartImpl({
  ref,
  series: allSeries,
  labels,
  labelEvery = 1,
  plotHeight = 110,
  title,
  header,
  ...props
}: StackedBarChartProps) {
  const { className, style, rest } = resolveStyleProps(props);
  const series = allSeries.slice(0, MAX_SERIES);
  const columns = Math.max(labels?.length ?? 0, ...series.map((s) => s.values.length), 0);
  const totals = stackTotals(series, columns);
  const ceiling = Math.max(...totals, 0);
  const every = Math.max(1, Math.floor(labelEvery));

  return (
    <Column
      ref={ref}
      gap="8"
      className={["dm-stacked-bar-chart", styles.base, className].filter(Boolean).join(" ")}
      style={style}
      {...rest}
    >
      {header != null && (
        <Row alignItems="center" gap="12" className={styles.header}>
          {header}
        </Row>
      )}
      <Row
        role="img"
        aria-label={title}
        alignItems="end"
        className={styles.plot}
        style={{ height: plotHeight } as CSSProperties}
      >
        {Array.from({ length: columns }, (_, c) => (
          <Flex
            // biome-ignore lint/suspicious/noArrayIndexKey: columns are positional.
            key={c}
            direction="column-reverse"
            flex="1"
            style={{ height: ceiling === 0 ? 0 : `${(totals[c]! / ceiling) * 100}%` }}
          >
            {series.map((s, i) => {
              const v = Math.max(0, s.values[c] ?? 0);
              if (v === 0) return null;
              return (
                <span
                  key={s.label}
                  data-series={i + 1}
                  className={[styles.segment, styles[`s${i + 1}`]].join(" ")}
                  style={{ flexGrow: v }}
                />
              );
            })}
          </Flex>
        ))}
      </Row>
      {labels && (
        <Row className={styles.axis} aria-hidden>
          {labels.map((l, c) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: labels are positional.
            <span key={c} className={styles.tick}>
              {c % every === 0 ? l : ""}
            </span>
          ))}
        </Row>
      )}
      {/* The wrapper does the hiding: a clip on the <table> itself leaves its caption showing. */}
      <div className={styles.sr}>
        <table>
          <caption>{title}</caption>
          <thead>
            <tr>
              <th scope="col">{labels ? "Column" : "#"}</th>
              {series.map((s) => (
                <th key={s.label} scope="col">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: columns }, (_, c) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: rows are positional.
              <tr key={c}>
                <th scope="row">{labels?.[c] ?? c + 1}</th>
                {series.map((s) => (
                  <td key={s.label}>{s.values[c] ?? 0}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Row as="ul" wrap="wrap" gap="16" className={styles.legend}>
        {series.map((s, i) => (
          <Row as="li" key={s.label} display="inline-flex" alignItems="center" gap="8">
            <span aria-hidden className={[styles.swatch, styles[`s${i + 1}`]].join(" ")} />
            {s.label}
          </Row>
        ))}
      </Row>
    </Column>
  );
}
StackedBarChartImpl.displayName = "StackedBarChart";

export const StackedBarChart = StackedBarChartImpl;
