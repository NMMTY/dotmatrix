import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DiffChip } from "./DiffChip";

describe("DiffChip", () => {
  it("shows the path and signed counts", () => {
    render(<DiffChip data-testid="d" path="src/app/page.tsx" added={12} removed={3} />);
    const text = screen.getByTestId("d").textContent ?? "";
    expect(text).toContain("src/app/page.tsx");
    expect(text).toContain("+12");
    expect(text).toContain("−3");
  });

  it("gives screen readers words instead of signs", () => {
    render(<DiffChip path="a.ts" added={1} removed={2} />);
    expect(screen.getByText("1 added")).toBeInTheDocument();
    expect(screen.getByText("2 removed")).toBeInTheDocument();
  });
});
