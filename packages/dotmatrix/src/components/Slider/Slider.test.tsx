import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Slider } from "./Slider";

describe("Slider", () => {
  it("works uncontrolled, starting at min by default", () => {
    render(<Slider label="Volume" min={0} max={10} />);
    const slider = screen.getByLabelText("Volume") as HTMLInputElement;
    expect(slider.value).toBe("0");
    fireEvent.change(slider, { target: { value: "7" } });
    expect(slider.value).toBe("7");
  });

  it("computes the fill custom property from the current value", () => {
    render(<Slider label="Volume" min={0} max={10} value={5} onChange={() => {}} />);
    const slider = screen.getByLabelText("Volume");
    expect(slider.style.getPropertyValue("--dm-slider-fill")).toBe("50%");
  });
});
