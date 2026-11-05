import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StackedBarChart, stackTotals } from "./StackedBarChart";

const series = [
  { label: "A100", values: [4, 2, 0] },
  { label: "H100", values: [1, 2, 3] },
];

describe("stackTotals", () => {
  it("sums each column across series", () => {
    expect(stackTotals(series, 3)).toEqual([5, 4, 3]);
  });

  it("treats missing values as 0 and clamps negatives", () => {
    expect(
      stackTotals(
        [
          { label: "x", values: [-5] },
          { label: "y", values: [] },
        ],
        2,
      ),
    ).toEqual([0, 0]);
  });
});

describe("StackedBarChart", () => {
  it("exposes the chart as a labelled image", () => {
    render(<StackedBarChart title="GPU usage" series={series} />);
    expect(screen.getByRole("img", { name: "GPU usage" })).toBeInTheDocument();
  });

  it("draws a column per value and a segment per non-zero cell", () => {
    const { container } = render(<StackedBarChart title="t" series={series} />);
    expect(container.querySelectorAll("[data-series]")).toHaveLength(5);
  });

  it("scales columns against the tallest total", () => {
    const { container } = render(<StackedBarChart title="t" series={series} />);
    const cols = container.querySelectorAll<HTMLElement>('[role="img"] > div');
    expect(cols[0]!.style.height).toBe("100%");
    expect(cols[2]!.style.height).toBe("60%");
  });

  it("lists every series in the legend", () => {
    render(<StackedBarChart title="t" series={series} />);
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(["A100", "H100"]);
  });

  it("only draws every n-th axis label", () => {
    const { container } = render(
      <StackedBarChart title="t" series={series} labels={["1", "2", "3"]} labelEvery={2} />,
    );
    const ticks = Array.from(container.querySelectorAll("[aria-hidden] > span")).map(
      (t) => t.textContent,
    );
    expect(ticks).toEqual(["1", "", "3"]);
  });

  it("keeps at most six series", () => {
    const many = Array.from({ length: 8 }, (_, i) => ({ label: `s${i}`, values: [1] }));
    render(<StackedBarChart title="t" series={many} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(6);
  });

  it("keeps the numbers available as a table for screen readers", () => {
    render(<StackedBarChart title="GPU usage" series={series} labels={["1", "2", "3"]} />);
    const table = screen.getByRole("table", { name: "GPU usage" });
    expect(within(table).getAllByRole("row")).toHaveLength(4);
    expect(
      within(table)
        .getAllByRole("cell")
        .map((c) => c.textContent)
        .slice(0, 2),
    ).toEqual(["4", "1"]);
  });
});
