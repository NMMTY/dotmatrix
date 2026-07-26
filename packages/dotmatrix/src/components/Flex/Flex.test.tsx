import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Flex } from "./Flex";

describe("Flex", () => {
  it("renders a div with the base utility class", () => {
    render(<Flex data-testid="el">content</Flex>);
    expect(screen.getByTestId("el").tagName).toBe("DIV");
    expect(screen.getByTestId("el")).toHaveClass("dm-flex");
  });

  it("applies resolved style-prop classes alongside dm-flex", () => {
    render(
      <Flex data-testid="el" gap="16" direction="column" padding="24">
        content
      </Flex>,
    );
    const el = screen.getByTestId("el");
    expect(el).toHaveClass("dm-flex", "dm-gap-16", "dm-direction-column", "dm-padding-24");
  });

  it("renders as a different element via `as`, keeping layout semantics", () => {
    render(<Flex as="nav" data-testid="el" />);
    expect(screen.getByTestId("el").tagName).toBe("NAV");
    expect(screen.getByTestId("el")).toHaveClass("dm-flex");
  });

  it("renders as an anchor when `href` is given without an explicit `as`", () => {
    render(<Flex href="/docs" data-testid="el" />);
    const el = screen.getByTestId("el");
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("href", "/docs");
  });

  it("forwards refs to the underlying DOM node", () => {
    const ref = createRef<HTMLElement>();
    render(<Flex ref={ref} data-testid="el" />);
    expect(ref.current).toBe(screen.getByTestId("el"));
  });

  it("passes unrecognized props straight to the DOM node", () => {
    render(<Flex data-testid="el" aria-label="panel" />);
    expect(screen.getByTestId("el")).toHaveAttribute("aria-label", "panel");
  });
});
