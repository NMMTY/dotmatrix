import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TaskList } from "./TaskList";

const items = [
  { label: "Made new things", status: "failed" as const },
  { label: "Read files", status: "done" as const },
  { label: "Edit files", status: "pending" as const },
  { label: "Cooking...", status: "active" as const },
];

describe("TaskList", () => {
  it("renders one list item per task", () => {
    render(<TaskList items={items} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  it("renders the title when given", () => {
    render(<TaskList title="Working on 2 to-dos" items={items} />);
    expect(screen.getByText("Working on 2 to-dos")).toBeInTheDocument();
  });

  it("exposes each status as text, not colour alone", () => {
    render(<TaskList items={items} />);
    const rows = screen.getAllByRole("listitem");
    expect(within(rows[0]!).getByText(/Failed/)).toBeInTheDocument();
    expect(within(rows[1]!).getByText(/Done/)).toBeInTheDocument();
    expect(within(rows[2]!).getByText(/Pending/)).toBeInTheDocument();
    expect(within(rows[3]!).getByText(/In progress/)).toBeInTheDocument();
  });

  it("sets data-status on each row", () => {
    render(<TaskList items={items} />);
    expect(screen.getAllByRole("listitem").map((r) => r.getAttribute("data-status"))).toEqual([
      "failed",
      "done",
      "pending",
      "active",
    ]);
  });
});
