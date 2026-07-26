import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("defaults to a real <button type=button>, not a submit button", () => {
    render(<Button>Save</Button>);
    const btn = screen.getByRole("button", { name: "Save" });
    expect(btn).toHaveAttribute("type", "button");
  });

  it("renders as an anchor and skips the button-only attrs when `href` is set", () => {
    render(<Button href="/docs">Docs</Button>);
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("href", "/docs");
    expect(link).not.toHaveAttribute("type");
    expect(link).not.toHaveAttribute("disabled");
  });

  it("disables a native button and blocks clicks", () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "Save" });
    expect(btn).toBeDisabled();
    btn.click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies the requested variant and size classes", () => {
    render(
      <Button variant="outline" size="l" data-testid="el">
        Go
      </Button>,
    );
    const el = screen.getByTestId("el");
    expect(el.className).toMatch(/outline/);
    expect(el.className).toMatch(/\bl\b|_l_/); // CSS-module-hashed size class
  });

  it('renders an icon before the text by default, and after it with iconPosition="end"', () => {
    const { container, rerender } = render(<Button icon="check">Save</Button>);
    const btn = screen.getByRole("button", { name: "Save" });
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(btn.firstElementChild?.tagName).toBe("svg");

    rerender(
      <Button icon="check" iconPosition="end">
        Save
      </Button>,
    );
    expect(btn.lastElementChild?.tagName).toBe("svg");
  });
});
