import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("is announced as a switch, not a checkbox, to assistive tech", () => {
    render(<Switch label="Notifications" />);
    expect(screen.getByRole("switch", { name: "Notifications" })).toBeInTheDocument();
  });

  it("toggles on click", () => {
    render(<Switch label="Notifications" />);
    const toggle = screen.getByRole("switch") as HTMLInputElement;
    expect(toggle.checked).toBe(false);
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(true);
  });
});
