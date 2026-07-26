import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Column } from "./Column";

describe("Column", () => {
  it("fixes direction to column via its own utility class", () => {
    render(<Column data-testid="el" />);
    expect(screen.getByTestId("el")).toHaveClass("dm-column");
  });
});
