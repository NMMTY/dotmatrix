import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MasonryGrid } from "./MasonryGrid";

describe("MasonryGrid", () => {
  it("renders every child, each wrapped for break-inside: avoid", () => {
    const { container } = render(
      <MasonryGrid>
        <div>Card 1</div>
        <div>Card 2</div>
        <div>Card 3</div>
      </MasonryGrid>,
    );
    expect(screen.getByText("Card 1")).toBeVisible();
    expect(screen.getByText("Card 2")).toBeVisible();
    expect(screen.getByText("Card 3")).toBeVisible();
    const grid = container.firstChild as HTMLElement;
    expect(grid.children).toHaveLength(3);
  });

  it("sets column-count/column-width/column-gap on the container from columns/minColumnWidth/gap", () => {
    const { container } = render(
      <MasonryGrid columns={4} minColumnWidth={200} gap="8">
        <div>Card 1</div>
      </MasonryGrid>,
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid.style.columnCount).toBe("4");
    expect(grid.style.columnWidth).toBe("200px");
    expect(grid.style.columnGap).toBe("var(--dm-space-8)");
  });

  it("gives each item a matching margin-bottom to fake vertical gap, except the last", () => {
    const { container } = render(
      <MasonryGrid gap="16">
        <div>Card 1</div>
        <div>Card 2</div>
        <div>Card 3</div>
      </MasonryGrid>,
    );
    const grid = container.firstChild as HTMLElement;
    const items = [...grid.children] as HTMLElement[];
    expect(items[0]?.style.marginBottom).toBe("var(--dm-space-16)");
    expect(items[1]?.style.marginBottom).toBe("var(--dm-space-16)");
    // Zeroed inline, not via a `:last-child` CSS rule — a CSS rule can never
    // win against this same inline style, regardless of specificity.
    expect(items[2]?.style.marginBottom).toBe("0px");
  });
});
