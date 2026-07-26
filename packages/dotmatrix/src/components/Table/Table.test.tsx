import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "./Table";

describe("Table", () => {
  it("renders a plain (non-sortable) header as static text, no button", () => {
    render(
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Name</TableHeaderCell>
          </tr>
        </TableHead>
      </Table>,
    );
    expect(screen.getByText("Name")).toBeVisible();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByRole("columnheader")).not.toHaveAttribute("aria-sort");
  });

  it("renders a sortable header as a button, reflects sort state via aria-sort, and calls onSort on click", () => {
    const onSort = vi.fn();
    const { rerender } = render(
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell onSort={onSort} sortDirection="none">
              Name
            </TableHeaderCell>
          </tr>
        </TableHead>
      </Table>,
    );
    expect(screen.getByRole("columnheader")).toHaveAttribute("aria-sort", "none");

    fireEvent.click(screen.getByRole("button", { name: "Name" }));
    expect(onSort).toHaveBeenCalledTimes(1);

    rerender(
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell onSort={onSort} sortDirection="ascending">
              Name
            </TableHeaderCell>
          </tr>
        </TableHead>
      </Table>,
    );
    expect(screen.getByRole("columnheader")).toHaveAttribute("aria-sort", "ascending");
  });

  it("marks a selected row with aria-selected", () => {
    render(
      <Table>
        <TableBody>
          <TableRow selected>
            <TableCell>Row 1</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Row 2</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByText("Row 1").closest("tr")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Row 2").closest("tr")).toHaveAttribute("aria-selected", "false");
  });
});
