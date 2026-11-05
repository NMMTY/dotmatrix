import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RadioGroup } from "../RadioGroup/RadioGroup";
import { Radio } from "./Radio";

describe("Radio", () => {
  it("makes only one option selected at a time via a shared name", () => {
    render(
      <RadioGroup label="Plan" defaultValue="pro">
        <Radio value="free" label="Free" />
        <Radio value="pro" label="Pro" />
      </RadioGroup>,
    );
    const free = screen.getByRole("radio", { name: "Free" }) as HTMLInputElement;
    const pro = screen.getByRole("radio", { name: "Pro" }) as HTMLInputElement;
    expect(pro.checked).toBe(true);
    expect(free.checked).toBe(false);
    expect(free.name).toBe(pro.name);

    fireEvent.click(free);
    expect(free.checked).toBe(true);
    expect(pro.checked).toBe(false);
  });

  it("throws when rendered outside a RadioGroup", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Radio value="x" label="x" />)).toThrow(/RadioGroup/);
    spy.mockRestore();
  });
});

describe("Radio layout props", () => {
  it("forwards flex props to its root, overriding defaults", () => {
    const { container } = render(
      <RadioGroup>
        <Radio value="a" label="A" gap="24" alignItems="end" />
      </RadioGroup>,
    );
    const root = container.querySelector("label");
    expect(root?.className).toContain("dm-gap-24");
    expect(root?.className).toContain("dm-align-items-end");
    expect(root?.className).not.toContain("dm-gap-8");
  });
});
