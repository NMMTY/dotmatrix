import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Grid } from "./Grid";

describe("Grid", () => {
  it("renders with the grid utility class and a columns prop", () => {
    render(<Grid data-testid="el" columns="3" gap="8" />);
    const el = screen.getByTestId("el");
    expect(el).toHaveClass("dm-grid", "dm-columns-3", "dm-gap-8");
  });
});
