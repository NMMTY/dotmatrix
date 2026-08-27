import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "./DatePicker";

describe("DatePicker", () => {
  it("shows a placeholder when no date is selected", () => {
    render(<DatePicker label="Due date" placeholder="Pick a date" />);
    expect(screen.getByRole("button", { name: "Due date: Pick a date" })).toBeInTheDocument();
  });

  it("shows the formatted default value", () => {
    render(<DatePicker label="Due date" defaultValue={new Date(2026, 7, 15)} />);
    expect(screen.getByRole("button", { name: /Due date: Aug 15, 2026/ })).toBeInTheDocument();
  });

  it("opens a calendar on click", () => {
    render(<DatePicker label="Due date" defaultValue={new Date(2026, 7, 15)} />);
    fireEvent.click(screen.getByRole("button", { name: /Due date/ }));
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("commits the picked date and closes the popover", async () => {
    const onChange = vi.fn();
    render(
      <DatePicker label="Due date" defaultValue={new Date(2026, 7, 15)} onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Due date/ }));
    await waitFor(() => expect(screen.getByRole("grid")).toBeInTheDocument());
    // The popover renders through a portal, outside RTL's own `container`.
    fireEvent.click(document.querySelector('[data-date="2026-7-20"]')!);
    const called = onChange.mock.calls[0]![0] as Date;
    expect(called.getDate()).toBe(20);
    // Closing runs through Popover's exit transition, so it's async too.
    await waitFor(() => expect(screen.queryByRole("grid")).not.toBeInTheDocument());
  });

  it("disables the calendar days once the popover is already open and disabled flips to true", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <DatePicker label="Due date" defaultValue={new Date(2026, 7, 15)} onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Due date/ }));
    await waitFor(() => expect(screen.getByRole("grid")).toBeInTheDocument());

    rerender(
      <DatePicker
        label="Due date"
        defaultValue={new Date(2026, 7, 15)}
        onChange={onChange}
        disabled
      />,
    );

    fireEvent.click(document.querySelector('[data-date="2026-7-20"]')!);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("supports controlled value", () => {
    const onChange = vi.fn();
    render(<DatePicker label="Due date" value={new Date(2026, 7, 15)} onChange={onChange} />);
    expect(screen.getByRole("button", { name: /Aug 15, 2026/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Due date/ }));
    fireEvent.click(document.querySelector('[data-date="2026-7-20"]')!);
    expect(onChange).toHaveBeenCalled();
    // Controlled: the trigger still shows the original value until the
    // consumer feeds the new one back in via `value`.
    expect(screen.getByRole("button", { name: /Aug 15, 2026/ })).toBeInTheDocument();
  });
});
