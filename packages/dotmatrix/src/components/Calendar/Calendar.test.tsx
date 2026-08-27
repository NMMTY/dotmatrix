import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Calendar } from "./Calendar";
import { dateKey } from "./dateMath";

function getDay(container: HTMLElement, date: Date): HTMLElement {
  const el = container.querySelector<HTMLElement>(`[data-date="${dateKey(date)}"]`);
  if (!el) throw new Error(`No day cell found for ${date.toDateString()}`);
  return el;
}

describe("Calendar", () => {
  it("shows the given month", () => {
    render(<Calendar defaultMonth={new Date(2026, 7, 1)} />);
    expect(screen.getByText("August 2026")).toBeInTheDocument();
  });

  it("calls onChange with the clicked date", () => {
    const onChange = vi.fn();
    const { container } = render(
      <Calendar defaultMonth={new Date(2026, 7, 1)} onChange={onChange} />,
    );
    fireEvent.click(getDay(container, new Date(2026, 7, 15)));
    const called = onChange.mock.calls[0]![0] as Date;
    expect(called.getFullYear()).toBe(2026);
    expect(called.getMonth()).toBe(7);
    expect(called.getDate()).toBe(15);
  });

  it("marks the selected date as pressed", () => {
    const { container } = render(
      <Calendar defaultMonth={new Date(2026, 7, 1)} defaultValue={new Date(2026, 7, 15)} />,
    );
    expect(getDay(container, new Date(2026, 7, 15))).toHaveAttribute("aria-pressed", "true");
    expect(getDay(container, new Date(2026, 7, 16))).toHaveAttribute("aria-pressed", "false");
  });

  it("navigates to the next and previous month", () => {
    render(<Calendar defaultMonth={new Date(2026, 7, 1)} />);
    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByText("September 2026")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(screen.getByText("July 2026")).toBeInTheDocument();
  });

  it("disables dates outside minDate/maxDate", () => {
    const { container } = render(
      <Calendar
        defaultMonth={new Date(2026, 7, 1)}
        minDate={new Date(2026, 7, 10)}
        maxDate={new Date(2026, 7, 20)}
      />,
    );
    expect(getDay(container, new Date(2026, 7, 5))).toBeDisabled();
    expect(getDay(container, new Date(2026, 7, 25))).toBeDisabled();
    expect(getDay(container, new Date(2026, 7, 15))).not.toBeDisabled();
  });

  it("does not commit a date outside minDate/maxDate", () => {
    const onChange = vi.fn();
    const { container } = render(
      <Calendar
        defaultMonth={new Date(2026, 7, 1)}
        minDate={new Date(2026, 7, 10)}
        onChange={onChange}
      />,
    );
    fireEvent.click(getDay(container, new Date(2026, 7, 5)));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("switches the visible month when a padding day from another month is clicked", () => {
    const { container } = render(<Calendar defaultMonth={new Date(2026, 7, 1)} />);
    const grid = container.querySelectorAll<HTMLElement>('[data-date^="2026-6-"]'); // July padding days
    expect(grid.length).toBeGreaterThan(0);
    fireEvent.click(grid[0]!);
    expect(screen.getByText("July 2026")).toBeInTheDocument();
  });

  it("gives exactly one day cell a tabIndex of 0", () => {
    const { container } = render(
      <Calendar defaultMonth={new Date(2026, 7, 1)} defaultValue={new Date(2026, 7, 15)} />,
    );
    const days = Array.from(container.querySelectorAll<HTMLElement>("[data-date]"));
    const tabbable = days.filter((d) => d.getAttribute("tabIndex") === "0");
    expect(tabbable).toHaveLength(1);
    expect(getDay(container, new Date(2026, 7, 15))).toHaveAttribute("tabIndex", "0");
  });

  it("moves the tabbable day with arrow keys, within the visible grid", () => {
    const { container } = render(
      <Calendar defaultMonth={new Date(2026, 7, 1)} defaultValue={new Date(2026, 7, 15)} />,
    );
    const day15 = getDay(container, new Date(2026, 7, 15));
    day15.focus();
    fireEvent.keyDown(day15, { key: "ArrowRight" });
    expect(getDay(container, new Date(2026, 7, 16))).toHaveFocus();
  });

  it("does not move focus onto a disabled day when arrowing past minDate/maxDate", () => {
    const { container } = render(
      <Calendar
        defaultMonth={new Date(2026, 7, 1)}
        defaultValue={new Date(2026, 7, 15)}
        maxDate={new Date(2026, 7, 15)}
      />,
    );
    const day15 = getDay(container, new Date(2026, 7, 15));
    day15.focus();
    // Day 16 is in the rendered grid but disabled (past maxDate) — arrowing
    // onto it should be a no-op, not an attempt to focus a disabled button.
    fireEvent.keyDown(day15, { key: "ArrowRight" });
    expect(day15).toHaveFocus();
  });
});
