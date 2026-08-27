import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BarChart } from "./BarChart";

const DATA = [
  { label: "Jan", value: 10 },
  { label: "Feb", value: 40 },
  { label: "Mar", value: 20 },
];

describe("BarChart", () => {
  it("marks the visual plot as a single image with the chart's label", () => {
    render(<BarChart data={DATA} label="Monthly signups" />);
    expect(screen.getByRole("img", { name: "Monthly signups" })).toBeInTheDocument();
  });

  it("exposes the real data via a visually-hidden table, for screen reader users", () => {
    render(<BarChart data={DATA} label="Monthly signups" />);
    const table = screen.getByRole("table", { name: "Monthly signups" });
    expect(table).toHaveClass("dm-sr-only");
    expect(screen.getByRole("row", { name: /Feb 40/ })).toBeInTheDocument();
  });

  it("renders every category's axis label", () => {
    const { container } = render(<BarChart data={DATA} label="Monthly signups" />);
    const axisLabels = container.querySelectorAll('[class*="axisLabel"]');
    expect(Array.from(axisLabels).map((el) => el.textContent)).toEqual(["Jan", "Feb", "Mar"]);
  });

  it("sizes precise-mode bars proportionally to the data max", () => {
    const { container } = render(
      <BarChart data={DATA} label="Monthly signups" mode="precise" height={200} />,
    );
    const bars = container.querySelectorAll<HTMLElement>('[class*="barPrecise"]');
    expect(bars).toHaveLength(3);
    // Feb (40, the max) should be the tallest — a full 100%.
    expect(bars[1]?.style.height).toBe("100%");
    // Jan (10) is a quarter of Feb's value.
    expect(bars[0]?.style.height).toBe("25%");
  });

  it("quantizes bitmap-mode bars into whole filled cells", () => {
    const { container } = render(
      <BarChart data={DATA} label="Monthly signups" mode="bitmap" segments={10} />,
    );
    // Feb is the max (ratio 1) — every one of its 10 cells is filled.
    const tracks = container.querySelectorAll<HTMLElement>('[class*="barTrack"]');
    const febFilled = tracks[1]?.querySelectorAll('[class*="filled"]');
    expect(febFilled).toHaveLength(10);
    // Jan is a quarter of the max — round(0.25 * 10) = 3 filled cells.
    const janFilled = tracks[0]?.querySelectorAll('[class*="filled"]');
    expect(janFilled).toHaveLength(3);
  });

  it("respects an explicit max even when it exceeds every value", () => {
    const { container } = render(
      <BarChart data={DATA} label="Monthly signups" mode="precise" max={80} />,
    );
    const bars = container.querySelectorAll<HTMLElement>('[class*="barPrecise"]');
    // Feb (40) against an explicit max of 80 is half, not full.
    expect(bars[1]?.style.height).toBe("50%");
  });

  it("shows each bar's formatted value when showValues is set", () => {
    render(
      <BarChart data={DATA} label="Monthly signups" showValues valueFormatter={(v) => `${v}%`} />,
    );
    // Scoped to the visual plot — the same formatted value also appears in
    // the hidden data table.
    const plot = screen.getByRole("img", { name: "Monthly signups" });
    expect(plot.textContent).toContain("40%");
  });
});
