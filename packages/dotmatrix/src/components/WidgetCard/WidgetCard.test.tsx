import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WidgetCard } from "./WidgetCard";

describe("WidgetCard", () => {
  it("renders title, value, caption and footer", () => {
    render(
      <WidgetCard title="Toronto" value="5°" caption="overcast clouds" footer="Feels like 1°." />,
    );
    expect(screen.getByText("Toronto")).toBeInTheDocument();
    expect(screen.getByText("5°")).toBeInTheDocument();
    expect(screen.getByText("overcast clouds")).toBeInTheDocument();
    expect(screen.getByText("Feels like 1°.")).toBeInTheDocument();
  });

  it("has no button unless onOpen is given", () => {
    render(<WidgetCard title="Toronto" value="5°" />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("makes the header a button that calls onOpen", () => {
    const onOpen = vi.fn();
    render(<WidgetCard title="Toronto" value="5°" onOpen={onOpen} openLabel="Open Toronto" />);
    fireEvent.click(screen.getByRole("button", { name: "Open Toronto" }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("omits the rule when there is no footer", () => {
    const { container } = render(<WidgetCard title="T" value="1" />);
    expect(container.querySelector("hr")).toBeNull();
  });
});
