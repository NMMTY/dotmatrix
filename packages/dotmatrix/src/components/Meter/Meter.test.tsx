import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Meter } from "./Meter";

describe("Meter", () => {
  it("exposes value/min/max/label as a real ARIA meter, not just a visual bar", () => {
    render(<Meter value={70} max={100} label="Budget spent" data-testid="el" />);
    const el = screen.getByRole("meter", { name: "Budget spent" });
    expect(el).toHaveAttribute("aria-valuenow", "70");
    expect(el).toHaveAttribute("aria-valuemin", "0");
    expect(el).toHaveAttribute("aria-valuemax", "100");
  });

  it("fills the nearest whole number of segments to the ratio, never a fraction of one", () => {
    // 70/100 of 24 segments = 16.8 → rounds to 17.
    const { container } = render(<Meter value={70} max={100} segments={24} label="x" />);
    const filled = container.querySelectorAll('[class*="filled"]');
    expect(filled).toHaveLength(17);
  });

  it("clamps a value beyond max instead of overfilling or crashing", () => {
    const { container } = render(<Meter value={999} max={100} segments={10} label="x" />);
    const filled = container.querySelectorAll('[class*="filled"]');
    expect(filled).toHaveLength(10);
  });

  it("renders zero filled segments for a zero value", () => {
    const { container } = render(<Meter value={0} max={100} segments={10} label="x" />);
    expect(container.querySelectorAll('[class*="filled"]')).toHaveLength(0);
  });

  it('applies the led variant class only when variant="led"', () => {
    const { container } = render(<Meter value={50} max={100} label="x" variant="led" />);
    const track = screen.getByRole("meter");
    expect(track.className).toMatch(/led/);
    expect(container.querySelectorAll('[class*="filled"]')).toHaveLength(12);
  });
});
