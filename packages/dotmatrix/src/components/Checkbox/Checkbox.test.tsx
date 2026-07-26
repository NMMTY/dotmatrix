import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("toggles like a real checkbox and reports indeterminate via the DOM property", () => {
    render(<Checkbox label="Accept terms" />);
    const checkbox = screen.getByRole("checkbox", { name: "Accept terms" }) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  it("sets the indeterminate DOM property (not reflected as an HTML attribute)", () => {
    render(<Checkbox label="Select all" indeterminate />);
    const checkbox = screen.getByRole("checkbox", { name: "Select all" }) as HTMLInputElement;
    expect(checkbox.indeterminate).toBe(true);
  });
});
