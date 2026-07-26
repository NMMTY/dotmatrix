import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders the title, and description/action only when given", () => {
    const { rerender } = render(<EmptyState title="No results" />);
    expect(screen.getByText("No results")).toBeVisible();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    rerender(
      <EmptyState
        title="No results"
        description="Try a different search."
        action={<button type="button">Clear filters</button>}
      />,
    );
    expect(screen.getByText("Try a different search.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeVisible();
  });
});
