import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getPaginationRange, Pagination } from "./Pagination";

describe("getPaginationRange", () => {
  it("returns every page when the total fits without collapsing", () => {
    expect(getPaginationRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("collapses the end when near the start", () => {
    expect(getPaginationRange(1, 20)).toEqual([1, 2, 3, 4, 5, "ellipsis-end", 20]);
  });

  it("collapses the start when near the end", () => {
    expect(getPaginationRange(20, 20)).toEqual([1, "ellipsis-start", 16, 17, 18, 19, 20]);
  });

  it("collapses both sides in the middle", () => {
    expect(getPaginationRange(10, 20)).toEqual([
      1,
      "ellipsis-start",
      9,
      10,
      11,
      "ellipsis-end",
      20,
    ]);
  });

  it("widens the visible range with a larger siblingCount", () => {
    expect(getPaginationRange(10, 20, 2)).toEqual([
      1,
      "ellipsis-start",
      8,
      9,
      10,
      11,
      12,
      "ellipsis-end",
      20,
    ]);
  });
});

describe("Pagination", () => {
  it("marks the current page with aria-current", () => {
    render(<Pagination page={3} totalPages={5} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "3" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "2" })).not.toHaveAttribute("aria-current");
  });

  it("calls onChange with the clicked page number", () => {
    const onChange = vi.fn();
    render(<Pagination page={3} totalPages={5} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "4" }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("manages its own page state when uncontrolled", () => {
    render(<Pagination defaultPage={1} totalPages={5} />);
    expect(screen.getByRole("button", { name: "1" })).toHaveAttribute("aria-current", "page");

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByRole("button", { name: "2" })).toHaveAttribute("aria-current", "page");
  });

  it("disables Previous on the first page and Next on the last", () => {
    const { rerender } = render(<Pagination page={1} totalPages={5} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).not.toBeDisabled();

    rerender(<Pagination page={5} totalPages={5} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous page" })).not.toBeDisabled();
  });

  it("steps forward and backward from Next/Previous", () => {
    const onChange = vi.fn();
    render(<Pagination page={3} totalPages={5} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onChange).toHaveBeenCalledWith(4);
    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("disables every control when disabled is set", () => {
    render(<Pagination page={3} totalPages={5} onChange={() => {}} disabled />);
    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeDisabled();
    }
  });
});
