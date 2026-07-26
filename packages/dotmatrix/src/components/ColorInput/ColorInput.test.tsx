import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ColorInput } from "./ColorInput";

describe("ColorInput", () => {
  it("shows the current hex value on the trigger", () => {
    render(<ColorInput label="Color" defaultValue="#3b82f6" />);
    expect(screen.getByText("#3b82f6")).toBeInTheDocument();
  });

  it("opens a picker with hue swatches, saturation/lightness swatches, and a hex field", async () => {
    render(<ColorInput label="Color" defaultValue="#3b82f6" />);
    fireEvent.click(screen.getByRole("button", { name: /#3b82f6/ }));
    await waitFor(() => expect(screen.getByLabelText("Hex")).toBeInTheDocument());
    expect(screen.getAllByLabelText(/^Hue \d+°$/).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/^Saturation \d+%, lightness \d+%$/).length).toBeGreaterThan(0);
  });

  it("clicking a hue swatch commits a new hex value", async () => {
    const onChange = vi.fn();
    render(<ColorInput label="Color" defaultValue="#808080" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /#808080/ }));
    await waitFor(() => expect(screen.getByLabelText("Hue 0°")).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText("Hue 0°"));
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0]![0]).not.toBe("#808080");
  });

  it("typing a valid hex in the hex field commits it", async () => {
    const onChange = vi.fn();
    render(<ColorInput label="Color" defaultValue="#000000" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /#000000/ }));
    const hexField = await screen.findByLabelText("Hex");
    fireEvent.change(hexField, { target: { value: "#ff0000" } });
    expect(onChange).toHaveBeenCalledWith("#ff0000");
  });

  it("does not commit an incomplete/invalid hex while typing", async () => {
    const onChange = vi.fn();
    render(<ColorInput label="Color" defaultValue="#000000" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /#000000/ }));
    const hexField = await screen.findByLabelText("Hex");
    fireEvent.change(hexField, { target: { value: "#ff00" } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders quick-pick swatches when given, and commits on click", async () => {
    const onChange = vi.fn();
    render(
      <ColorInput
        label="Color"
        defaultValue="#000000"
        swatches={["#ff6a00", "#3b82f6"]}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /#000000/ }));
    const swatch = await screen.findByRole("button", { name: "Use #ff6a00" });
    fireEvent.click(swatch);
    expect(onChange).toHaveBeenCalledWith("#ff6a00");
  });
});
