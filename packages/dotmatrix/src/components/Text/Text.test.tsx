import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Text } from "./Text";

describe("Text", () => {
  it("renders as a span by default (inline, not flex)", () => {
    render(<Text data-testid="el">hello</Text>);
    expect(screen.getByTestId("el").tagName).toBe("SPAN");
  });

  it("supports `as` for real semantics", () => {
    render(<Text as="label" data-testid="el" />);
    expect(screen.getByTestId("el").tagName).toBe("LABEL");
  });
});
