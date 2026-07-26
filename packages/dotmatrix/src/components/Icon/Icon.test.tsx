import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GLYPHS } from "../../icons/glyphs";
import { Icon } from "./Icon";

const filledCount = (rows: readonly string[]) =>
  rows.reduce((sum, row) => sum + [...row].filter((c) => c === "#").length, 0);

describe("Icon", () => {
  it("is hidden from assistive tech when it has no title", () => {
    const { container } = render(<Icon name="circle" />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("role");
  });

  it("exposes a title as an accessible name when given one", () => {
    const { container } = render(<Icon name="warning" title="Warning" />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("role", "img");
    expect(svg.querySelector("title")).toHaveTextContent("Warning");
  });

  for (const name of Object.keys(GLYPHS) as Array<keyof typeof GLYPHS>) {
    it(`renders one <rect> per filled cell for "${name}"`, () => {
      const { container } = render(<Icon name={name} />);
      expect(container.querySelectorAll("rect")).toHaveLength(filledCount(GLYPHS[name]));
    });
  }
});
