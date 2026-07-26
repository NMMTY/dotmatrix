import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { NumberInput } from "./NumberInput";

describe("NumberInput", () => {
  it("increments and decrements by `step`, clamped to min/max", () => {
    function Harness() {
      const [value, setValue] = useState(5);
      return (
        <NumberInput
          label="Quantity"
          min={0}
          max={6}
          step={2}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
        />
      );
    }
    render(<Harness />);
    const input = screen.getByLabelText("Quantity") as HTMLInputElement;
    expect(input.value).toBe("5");

    fireEvent.click(screen.getByRole("button", { name: "Increase" }));
    expect(input.value).toBe("6"); // 5 + 2 = 7, clamped to max 6

    fireEvent.click(screen.getByRole("button", { name: "Decrease" }));
    fireEvent.click(screen.getByRole("button", { name: "Decrease" }));
    fireEvent.click(screen.getByRole("button", { name: "Decrease" }));
    fireEvent.click(screen.getByRole("button", { name: "Decrease" }));
    expect(input.value).toBe("0"); // never below min 0
  });
});
