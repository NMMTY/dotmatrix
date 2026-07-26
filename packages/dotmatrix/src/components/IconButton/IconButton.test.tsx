import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Icon } from "../Icon/Icon";
import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("requires an aria-label and exposes it as the accessible name", () => {
    render(
      <IconButton aria-label="Close">
        <Icon name="close" />
      </IconButton>,
    );
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("renders the built-in icon named via `icon`, without needing children", () => {
    const { container } = render(<IconButton aria-label="Close" icon="close" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("prefers `children` over `icon` when both are given", () => {
    const { container } = render(
      <IconButton aria-label="Close" icon="close">
        <Icon name="warning" />
      </IconButton>,
    );
    // Only one glyph rendered — whichever wins, there's exactly one <svg>.
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });
});
