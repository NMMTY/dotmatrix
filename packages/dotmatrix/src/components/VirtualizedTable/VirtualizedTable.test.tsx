import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  VirtualizedTable,
  type VirtualizedTableColumn,
  type VirtualizedTableOwnProps,
} from "./VirtualizedTable";

interface Row {
  id: number;
  name: string;
}

const ROWS: Row[] = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Row ${i}` }));

const COLUMNS: VirtualizedTableColumn<Row>[] = [
  { key: "id", header: "ID", render: (row) => row.id },
  { key: "name", header: "Name", render: (row) => row.name },
];

function renderTable(overrides: Partial<VirtualizedTableOwnProps<Row>> = {}) {
  return render(
    <VirtualizedTable
      columns={COLUMNS}
      rows={ROWS}
      rowHeight={20}
      height={100}
      getRowKey={(row) => row.id}
      {...overrides}
    />,
  );
}

describe("VirtualizedTable", () => {
  it("renders only the rows near the top of the scroll window, not all 1000", () => {
    renderTable();
    expect(screen.getByText("Row 0")).toBeInTheDocument();
    expect(screen.queryByText("Row 999")).not.toBeInTheDocument();
    expect(screen.getAllByRole("row").length).toBeLessThan(50);
  });

  it("swaps in later rows after scrolling down", () => {
    const { container } = renderTable();
    const viewport = container.querySelector("div")!;
    Object.defineProperty(viewport, "scrollTop", { value: 4000, writable: true });
    fireEvent.scroll(viewport);
    expect(screen.getByText("Row 200")).toBeInTheDocument();
    expect(screen.queryByText("Row 0")).not.toBeInTheDocument();
  });

  it("stripes zebra rows by real data index, not DOM position", () => {
    renderTable({ zebra: true, overscan: 0 });
    // Row 0 (even) unstriped, Row 1 (odd) striped, matching the actual data
    // index rather than however many spacer rows happen to precede it.
    const row0 = screen.getByText("Row 0").closest("tr")!;
    const row1 = screen.getByText("Row 1").closest("tr")!;
    expect(row0.className).not.toMatch(/zebraRow/);
    expect(row1.className).toMatch(/zebraRow/);
  });

  it("keeps zebra parity correct after scrolling past a spacer row", () => {
    const { container } = renderTable({ zebra: true, overscan: 0 });
    const viewport = container.querySelector("div")!;
    Object.defineProperty(viewport, "scrollTop", { value: 4000, writable: true });
    fireEvent.scroll(viewport);
    // Row 200 is even (unstriped), Row 201 is odd (striped) — real index
    // parity, unaffected by however many rows the leading spacer skipped.
    const row200 = screen.getByText("Row 200").closest("tr")!;
    const row201 = screen.getByText("Row 201").closest("tr")!;
    expect(row200.className).not.toMatch(/zebraRow/);
    expect(row201.className).toMatch(/zebraRow/);
  });

  it("calls onRowClick with the row and its real index", () => {
    const onRowClick = vi.fn();
    renderTable({ onRowClick });
    fireEvent.click(screen.getByText("Row 2").closest("tr")!);
    expect(onRowClick).toHaveBeenCalledWith(ROWS[2], 2);
  });

  it("marks the selected row via aria-selected", () => {
    renderTable({ selectedRowKey: 1 });
    expect(screen.getByText("Row 0").closest("tr")).toHaveAttribute("aria-selected", "false");
    expect(screen.getByText("Row 1").closest("tr")).toHaveAttribute("aria-selected", "true");
  });

  it("shows the empty message when there are no rows", () => {
    renderTable({ rows: [] });
    expect(screen.getByText("No rows.")).toBeInTheDocument();
  });

  it("carries the true row count and position via aria-rowcount/aria-rowindex", () => {
    const { container } = renderTable();
    expect(container.querySelector("table")).toHaveAttribute("aria-rowcount", "1001");
    expect(screen.getByText("Row 0").closest("tr")).toHaveAttribute("aria-rowindex", "2");
  });
});
