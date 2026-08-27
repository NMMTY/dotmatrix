import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Breadcrumbs } from "./Breadcrumbs";

const ITEMS = [
  { label: "Home", href: "/" },
  { label: "Components", href: "/components" },
  { label: "Button" },
];

describe("Breadcrumbs", () => {
  it("renders every item's label in order", () => {
    render(<Breadcrumbs items={ITEMS} />);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toHaveTextContent(/Home.*Components.*Button/s);
  });

  it("renders every item but the last as a link", () => {
    render(<Breadcrumbs items={ITEMS} />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Components" })).toHaveAttribute("href", "/components");
    expect(screen.queryByRole("link", { name: "Button" })).not.toBeInTheDocument();
  });

  it("marks the last item as the current page, even if it has an href", () => {
    render(<Breadcrumbs items={[...ITEMS.slice(0, 2), { label: "Button", href: "/button" }]} />);
    const current = screen.getByText("Button");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current.tagName).not.toBe("A");
  });

  it("uses a custom separator icon when given", () => {
    const { container } = render(<Breadcrumbs items={ITEMS} separator="arrow-right" />);
    // Two separators for three items (none after the last).
    expect(container.querySelectorAll("svg")).toHaveLength(2);
  });
});
