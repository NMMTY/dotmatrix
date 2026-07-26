import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Row } from "./Row";

describe("Row", () => {
  it("fixes direction to row via its own utility class", () => {
    render(<Row data-testid="el" />);
    expect(screen.getByTestId("el")).toHaveClass("dm-row");
    expect(screen.getByTestId("el")).not.toHaveClass("dm-flex");
  });
});
