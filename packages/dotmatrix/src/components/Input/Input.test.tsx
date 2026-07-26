import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("connects label, description, and id via htmlFor/aria-describedby", () => {
    render(<Input label="Email" description="We'll never share it." />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAccessibleDescription("We'll never share it.");
  });

  it("shows the error instead of the description, and marks aria-invalid", () => {
    render(<Input label="Email" description="hint" error="Required" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Required");
    expect(screen.queryByText("hint")).toBeNull();
  });

  it("is a real <input> — native attributes pass straight through", () => {
    render(<Input label="Age" type="number" placeholder="18" />);
    const input = screen.getByLabelText("Age");
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("placeholder", "18");
  });

  it("passes `pattern` straight through to the native input", () => {
    render(<Input label="Zip" pattern="[0-9]{5}" />);
    expect(screen.getByLabelText("Zip")).toHaveAttribute("pattern", "[0-9]{5}");
  });

  it("renders a leading icon inside the field when `icon` is given", () => {
    const { container } = render(<Input label="Amount" icon="search" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount").className).toMatch(/withIcon/);
  });

  it("renders no icon wrapper when `icon` is omitted", () => {
    const { container } = render(<Input label="Plain" />);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });
});
