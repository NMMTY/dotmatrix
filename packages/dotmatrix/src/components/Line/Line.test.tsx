import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Line } from "./Line";

describe("Line", () => {
  it("defaults to a horizontal separator", () => {
    render(<Line data-testid="el" />);
    const el = screen.getByTestId("el");
    expect(el).toHaveAttribute("role", "separator");
    expect(el).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("supports a vertical orientation", () => {
    render(<Line data-testid="el" orientation="vertical" />);
    expect(screen.getByTestId("el")).toHaveAttribute("aria-orientation", "vertical");
  });
});
