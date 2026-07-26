import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { List, ListItem } from "./List";

describe("List", () => {
  it('renders as an accessible list with role="list"', () => {
    render(
      <List>
        <ListItem title="Item 1" />
      </List>,
    );
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("renders title, description, and action together", () => {
    render(
      <List>
        <ListItem
          title="Invoice #1"
          description="Due Jan 1"
          action={<button type="button">Pay</button>}
        />
      </List>,
    );
    expect(screen.getByText("Invoice #1")).toBeVisible();
    expect(screen.getByText("Due Jan 1")).toBeVisible();
    expect(screen.getByRole("button", { name: "Pay" })).toBeVisible();
  });

  it("renders fully custom children when title is omitted", () => {
    render(
      <List>
        <ListItem>
          <span>Custom content</span>
        </ListItem>
      </List>,
    );
    expect(screen.getByText("Custom content")).toBeVisible();
  });
});
