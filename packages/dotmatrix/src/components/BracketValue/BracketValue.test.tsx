import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BracketValue } from "./BracketValue";

describe("BracketValue", () => {
  it("renders label and value inside brackets", () => {
    render(<BracketValue data-testid="b" label="GPU's" value={24} />);
    expect(screen.getByTestId("b").textContent).toBe("[GPU's:24]");
  });

  it("omits the label and colon when no label is given", () => {
    render(<BracketValue data-testid="b" value="ok" />);
    expect(screen.getByTestId("b").textContent).toBe("[ok]");
  });

  it("hides the decorative brackets from assistive tech", () => {
    const { container } = render(<BracketValue value="x" />);
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
  });

  it("forwards style props", () => {
    render(<BracketValue data-testid="b" value="x" marginTop="8" />);
    expect(screen.getByTestId("b")).toHaveClass("dm-margin-top-8");
  });
});
