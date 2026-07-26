import type { ReactNode, Ref } from "react";
import { resolveStyleProps } from "../../system/resolveStyleProps";
import type { CommonProps, StyleProps } from "../../system/types";
import { Icon } from "../Icon/Icon";
import styles from "./Table.module.scss";

export interface TableOwnProps extends StyleProps, CommonProps {
  /** Alternating row background from the second body row on. @default false */
  zebra?: boolean;
  children?: ReactNode;
}

type TableProps = TableOwnProps & { ref?: Ref<HTMLTableElement> } & Record<string, unknown>;

/**
 * A native `<table>` with the design system's borders/spacing — sorting
 * (`TableHeaderCell`), zebra rows, and row selection (`TableRow`) are opt-in
 * per-piece rather than table-wide flags, since a given table only needs
 * some of them.
 */
function TableImpl({ ref, zebra = false, ...props }: TableProps) {
  const { className, style, rest } = resolveStyleProps(props);
  return (
    <table
      ref={ref}
      className={["dm-table", styles.table, zebra ? styles.zebra : undefined, className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...rest}
    />
  );
}
TableImpl.displayName = "Table";
export const Table = TableImpl;

export interface TableHeadOwnProps {
  children?: ReactNode;
}
export function TableHead(props: TableHeadOwnProps & Record<string, unknown>) {
  return <thead {...props} />;
}

export interface TableBodyOwnProps {
  children?: ReactNode;
}
export function TableBody(props: TableBodyOwnProps & Record<string, unknown>) {
  return <tbody {...props} />;
}

export interface TableRowOwnProps {
  /** Highlights the row and marks it `aria-selected`. @default false */
  selected?: boolean;
  children?: ReactNode;
}
export function TableRow({
  selected = false,
  ...props
}: TableRowOwnProps & Record<string, unknown>) {
  return (
    <tr
      aria-selected={selected}
      className={[styles.row, selected ? styles.selected : undefined].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export interface TableHeaderCellOwnProps {
  /**
   * Sort state for this column, mirroring `aria-sort` directly rather than a
   * bespoke enum — omit for a non-sortable header.
   */
  sortDirection?: "ascending" | "descending" | "none";
  /** Presence makes the header interactive; its absence is what makes a column non-sortable. */
  onSort?: () => void;
  children?: ReactNode;
}

/**
 * `onSort`'s presence, not `sortDirection`, decides whether this renders as a
 * button — a column can be sortable but currently unsorted (`sortDirection`
 * omitted or `"none"`), which still needs the click target.
 */
export function TableHeaderCell({ sortDirection, onSort, children }: TableHeaderCellOwnProps) {
  return (
    <th
      scope="col"
      aria-sort={onSort ? (sortDirection ?? "none") : undefined}
      className={styles.headerCell}
    >
      {onSort ? (
        <button type="button" onClick={onSort} className={styles.sortButton}>
          <span>{children}</span>
          <span className={styles.sortIcon} aria-hidden>
            {sortDirection === "ascending" && <Icon name="chevron-up" size="s" />}
            {sortDirection === "descending" && <Icon name="chevron-down" size="s" />}
          </span>
        </button>
      ) : (
        children
      )}
    </th>
  );
}

export interface TableCellOwnProps {
  children?: ReactNode;
}
export function TableCell(props: TableCellOwnProps & Record<string, unknown>) {
  return <td className={styles.cell} {...props} />;
}
