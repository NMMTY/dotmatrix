import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Stat } from "./Stat";

describe("Stat", () => {
  it("renders the label and value", () => {
    render(<Stat label="Spent" value="$1,400" />);
    expect(screen.getByText("Spent")).toBeVisible();
    expect(screen.getByText("$1,400")).toBeVisible();
  });

  it("renders an up trend and a down trend with their delta text", () => {
    const { rerender } = render(
      <Stat label="Users" value="1,204" trend={{ direction: "up", value: "+12%" }} />,
    );
    expect(screen.getByText("+12%")).toBeVisible();

    rerender(<Stat label="Users" value="1,204" trend={{ direction: "down", value: "-3%" }} />);
    expect(screen.getByText("-3%")).toBeVisible();
  });
});
