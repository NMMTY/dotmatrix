import type { ReactNode } from "react";
import type { StyleProps } from "../../system/types";
import { Column } from "../Column/Column";
import { Row } from "../Row/Row";
import { Text } from "../Text/Text";
import styles from "./BarChart.module.scss";

export interface BarChartDatum {
  label: string;
  value: number;
}

export interface BarChartOwnProps extends Omit<StyleProps, "height"> {
  data: BarChartDatum[];
  /**
   * `"bitmap"` quantizes each bar into discrete filled/empty cells, the same
   * segmented-gauge look as `Meter` — no bitmap equivalent for a
   * sub-cell-height bar. `"precise"` renders an exact, continuous height
   * instead. @default "bitmap"
   */
  mode?: "bitmap" | "precise";
  /** The tallest bar's value. @default the data's own max */
  max?: number;
  /** `"bitmap"` mode only: vertical cell count per bar. @default 10 */
  segments?: number;
  /** Chart area height in px. @default 160 */
  height?: number;
  /**
   * Required: like `Meter`, a chart has no visible text of its own that
   * describes what it shows — without this it's silently unreadable on a
   * screen reader.
   */
  label: string;
  valueFormatter?: (value: number) => string;
  /** Shows each bar's value above it. @default false */
  showValues?: boolean;
  className?: string;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

// `flexGrow="1"` rather than a CSS `height: 100%` — a flex item's own box is
// definite once flex-grow has resolved it, which is what lets the inner
// content below (a plain `height: X%` div, or `Meter`-style `flex: 1` cells)
// resolve a percentage height at all; a plain block child of an auto-height
// column never gets that (the classic CSS percentage-height-of-auto-parent
// trap).
function Bar({
  ratio,
  mode,
  segments,
}: {
  ratio: number;
  mode: "bitmap" | "precise";
  segments: number;
}): ReactNode {
  if (mode === "precise") {
    return (
      <Column flexGrow="1" justifyContent="end" width="full" className={styles.barTrack}>
        <Column className={styles.barPrecise} style={{ height: `${ratio * 100}%` }} />
      </Column>
    );
  }
  const filledCount = Math.round(ratio * segments);
  return (
    <Column flexGrow="1" gap="2" width="full" className={styles.barTrack}>
      {Array.from({ length: segments }, (_, i) => {
        // Cells are positional, never reordered independently of `segments`.
        const fromBottom = segments - 1 - i;
        return (
          <Row
            as="span"
            // biome-ignore lint/suspicious/noArrayIndexKey: see comment above
            key={i}
            flex="1"
            width="full"
            minHeight="0"
            className={[styles.cell, fromBottom < filledCount ? styles.filled : undefined]
              .filter(Boolean)
              .join(" ")}
          />
        );
      })}
    </Column>
  );
}

/**
 * A single-series bar chart. Monochrome, like the rest of this system —
 * there's no second color to distinguish a second series with, so this stays
 * single-series; a grouped/stacked variant would need a non-color
 * differentiator (pattern fills, most likely) to fit the palette, and isn't
 * built yet.
 */
function BarChartImpl({
  data,
  mode = "bitmap",
  max,
  segments = 10,
  height = 160,
  label,
  valueFormatter = (v) => String(v),
  showValues = false,
  className,
  ...rest
}: BarChartOwnProps) {
  const resolvedMax = max ?? Math.max(0, ...data.map((d) => d.value));

  return (
    <Column gap="8" {...rest} className={className}>
      <Row role="img" aria-label={label} gap="8" className={styles.plot} style={{ height }}>
        {data.map((datum) => {
          const ratio = clamp01(resolvedMax === 0 ? 0 : datum.value / resolvedMax);
          return (
            <Column key={datum.label} flexGrow="1" alignItems="center" gap="4" minWidth="0">
              {showValues && (
                <Text fontSize="xs" color="weak">
                  {valueFormatter(datum.value)}
                </Text>
              )}
              <Bar ratio={ratio} mode={mode} segments={segments} />
            </Column>
          );
        })}
      </Row>
      <Row gap="8">
        {data.map((datum) => (
          <Text key={datum.label} fontSize="xs" color="weak" className={styles.axisLabel}>
            {datum.label}
          </Text>
        ))}
      </Row>
      <table className="dm-sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">Label</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((datum) => (
            <tr key={datum.label}>
              <th scope="row">{datum.label}</th>
              <td>{valueFormatter(datum.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Column>
  );
}
BarChartImpl.displayName = "BarChart";

export const BarChart = BarChartImpl;
