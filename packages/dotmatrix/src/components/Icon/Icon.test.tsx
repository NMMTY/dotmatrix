import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { glyphRuns } from "../../icons/Glyph";
import { GLYPHS } from "../../icons/glyphs";
import { Icon } from "./Icon";

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

  it("draws on an 18×18 viewBox", () => {
    const { container } = render(<Icon name="plus" />);
    expect(container.querySelector("svg")).toHaveAttribute("viewBox", "0 0 18 18");
  });

  it("merges runs without losing or adding cells", () => {
    for (const rows of Object.values(GLYPHS)) {
      const cells = rows.reduce((n, row) => n + [...row].filter((c) => c === "#").length, 0);
      expect(glyphRuns(rows).reduce((n, r) => n + r.width, 0)).toBe(cells);
    }
  });

  for (const name of Object.keys(GLYPHS) as Array<keyof typeof GLYPHS>) {
    it(`renders one <rect> per horizontal run of filled cells for "${name}"`, () => {
      const { container } = render(<Icon name={name} />);
      expect(container.querySelectorAll("rect")).toHaveLength(glyphRuns(GLYPHS[name]).length);
    });
  }
});
