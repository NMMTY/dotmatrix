import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("is hidden from assistive tech", () => {
    render(<Skeleton data-testid="el" />);
    expect(screen.getByTestId("el")).toHaveAttribute("aria-hidden", "true");
  });

  it("defaults to a rectangular radius, or full when `circle` is set", () => {
    render(<Skeleton data-testid="rect" />);
    render(<Skeleton data-testid="circle" circle />);
    expect(screen.getByTestId("rect").className).toMatch(/dm-radius-control/);
    expect(screen.getByTestId("circle").className).toMatch(/dm-radius-full/);
  });
});
