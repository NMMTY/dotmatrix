import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "./Card";

describe("Card", () => {
  it("renders as a div by default with its own defaults applied", () => {
    render(<Card data-testid="el">content</Card>);
    const el = screen.getByTestId("el");
    expect(el.tagName).toBe("DIV");
    expect(el.className).toMatch(/dm-padding-24/);
  });

  it("lets a caller override a default instead of fighting it", () => {
    render(<Card data-testid="el" padding="8" />);
    const el = screen.getByTestId("el");
    expect(el.className).toMatch(/dm-padding-8\b/);
    expect(el.className).not.toMatch(/dm-padding-24/);
  });
});
