"use client";

import { type ReactNode, useMemo, useState } from "react";
import type { StyleProps } from "../../system/types";
import { Column } from "../Column/Column";
import { Text } from "../Text/Text";
import styles from "./VirtualizedTable.module.scss";

export interface VirtualizedTableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T, index: number) => ReactNode;
  /** A CSS `width` value, e.g. `160` or `"20%"`. Unset columns share remaining space equally. */
  width?: number | string;
  /** @default "start" */
  align?: "start" | "center" | "end";
}

export interface VirtualizedTableOwnProps<T>
  extends Omit<StyleProps, "height" | "columns" | "rows"> {
  columns: VirtualizedTableColumn<T>[];
  rows: T[];
  /** @default the row's index */
  getRowKey?: (row: T, index: number) => string | number;
  /** Every row's height in px — fixed, since windowing depends on it. @default 40 */
  rowHeight?: number;
  /** The scrollable viewport's height in px. @default 400 */
  height?: number;
  /** Extra rows kept rendered past each edge of the viewport, to reduce blanking during a fast scroll. @default 4 */
  overscan?: number;
  /** Alternating row background from the second row on. @default false */
  zebra?: boolean;
  onRowClick?: (row: T, index: number) => void;
  selectedRowKey?: string | number;
  /** @default "No rows." */
  emptyMessage?: string;
  className?: string;
}

const ALIGN_CLASS = { start: undefined, center: styles.alignCenter, end: styles.alignEnd };

/**
 * A `<table>` that only ever mounts the rows near the current scroll
 * position, keyed off a fixed `rowHeight` — the two off-screen slices above
 * and below the visible window collapse into a single spacer `<tr>` each
 * (a real cell inside, so column widths stay correct), rather than every row
 * existing in the DOM at once. `aria-rowcount`/`aria-rowindex` carry the true
 * position of what's currently mounted, the standard pattern for a windowed
 * native table (see the ARIA Authoring Practices grid guidance) — screen
 * readers can announce "row 480 of 10,000" even though row 1 isn't mounted.
 *
 * Trades off variable row heights for simplicity: every row must be the same
 * `rowHeight`, which is what makes computing the visible slice from
 * `scrollTop` alone (no per-row measurement) correct.
 */
function VirtualizedTableImpl<T>({
  columns,
  rows,
  getRowKey,
  rowHeight = 40,
  height = 400,
  overscan = 4,
  zebra = false,
  onRowClick,
  selectedRowKey,
  emptyMessage = "No rows.",
  className,
  ...rest
}: VirtualizedTableOwnProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  const { startIndex, endIndex, topSpacer, bottomSpacer } = useMemo(() => {
    const visibleCount = Math.ceil(height / rowHeight);
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const end = Math.min(rows.length, start + visibleCount + overscan * 2);
    return {
      startIndex: start,
      endIndex: end,
      topSpacer: start * rowHeight,
      bottomSpacer: (rows.length - end) * rowHeight,
    };
  }, [scrollTop, rowHeight, height, overscan, rows.length]);

  const visibleRows = rows.slice(startIndex, endIndex);

  return (
    <Column
      display="block"
      overflowY="auto"
      {...rest}
      className={[styles.viewport, className].filter(Boolean).join(" ")}
      style={{ height }}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <table
        className={["dm-virtualized-table", styles.table].filter(Boolean).join(" ")}
        aria-rowcount={rows.length + 1}
      >
        <colgroup>
          {columns.map((column) => (
            <col key={column.key} style={{ width: column.width }} />
          ))}
        </colgroup>
        <thead className={styles.head}>
          <tr aria-rowindex={1}>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={[styles.headerCell, ALIGN_CLASS[column.align ?? "start"]]
                  .filter(Boolean)
                  .join(" ")}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.empty}>
                <Text fontSize="s" color="weak">
                  {emptyMessage}
                </Text>
              </td>
            </tr>
          ) : (
            <>
              {topSpacer > 0 && (
                <tr style={{ height: topSpacer }} aria-hidden>
                  <td colSpan={columns.length} className={styles.spacer} />
                </tr>
              )}
              {visibleRows.map((row, i) => {
                const index = startIndex + i;
                const key = getRowKey ? getRowKey(row, index) : index;
                const selected = selectedRowKey !== undefined && key === selectedRowKey;
                return (
                  <tr
                    key={key}
                    aria-rowindex={index + 2}
                    aria-selected={selectedRowKey !== undefined ? selected : undefined}
                    onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                    style={{ height: rowHeight }}
                    className={[
                      styles.row,
                      zebra && index % 2 === 1 ? styles.zebraRow : undefined,
                      onRowClick ? styles.clickable : undefined,
                      selected ? styles.selected : undefined,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={[styles.cell, ALIGN_CLASS[column.align ?? "start"]]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {column.render(row, index)}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {bottomSpacer > 0 && (
                <tr style={{ height: bottomSpacer }} aria-hidden>
                  <td colSpan={columns.length} className={styles.spacer} />
                </tr>
              )}
            </>
          )}
        </tbody>
      </table>
    </Column>
  );
}
VirtualizedTableImpl.displayName = "VirtualizedTable";

export const VirtualizedTable = VirtualizedTableImpl;
