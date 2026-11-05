import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CommandInput } from "./CommandInput";

describe("CommandInput", () => {
  it("is a text field named by the label prop", () => {
    render(<CommandInput label="Follow-up" />);
    expect(screen.getByRole("textbox", { name: "Follow-up" })).toBeInTheDocument();
  });

  it("reports typed text through onChange", () => {
    const onChange = vi.fn();
    render(<CommandInput label="Cmd" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "hi" } });
    expect(onChange).toHaveBeenCalledWith("hi");
  });

  it("submits on Enter with the current value", () => {
    const onSubmit = vi.fn();
    render(<CommandInput label="Cmd" defaultValue="deploy" onSubmit={onSubmit} />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith("deploy");
  });

  it("does not submit on Shift+Enter", () => {
    const onSubmit = vi.fn();
    render(<CommandInput label="Cmd" defaultValue="x" onSubmit={onSubmit} />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter", shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("renders status and hint in the footer", () => {
    render(<CommandInput label="Cmd" status="23% context used" hint="/ for commands" />);
    expect(screen.getByText("23% context used")).toBeInTheDocument();
    expect(screen.getByText("/ for commands")).toBeInTheDocument();
  });

  it("hides the decorative prompt glyph", () => {
    render(<CommandInput label="Cmd" />);
    expect(screen.getByText("→")).toHaveAttribute("aria-hidden", "true");
  });
});
