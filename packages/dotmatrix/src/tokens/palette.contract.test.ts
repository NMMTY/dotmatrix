import { resolve } from "node:path";
import * as sass from "sass";
import { describe, expect, it } from "vitest";
import { paletteValues } from "../system/props";

/**
 * Guards palette.scss against a palette that's missing one of the six
 * custom properties every other palette defines — a silent gap here means
 * some component falls back to whatever `:where(:root)` last resolved to
 * instead of the chosen hue, with no error anywhere.
 */
const css = sass.compile(resolve(import.meta.dirname, "index.scss"), {
  loadPaths: [resolve(import.meta.dirname, "..")],
  silenceDeprecations: ["import"],
}).css;

const PROPERTIES = [
  "--dm-accent-100",
  "--dm-accent-300",
  "--dm-accent-500",
  "--dm-accent-700",
  "--dm-accent-900",
  "--dm-on-accent-strong",
];

describe("accent palettes", () => {
  for (const palette of paletteValues.filter((p) => p !== "mono")) {
    it(`[data-palette="${palette}"] defines every accent custom property`, () => {
      const ruleStart = css.indexOf(`[data-palette=${palette}]`);
      expect(ruleStart, `no [data-palette="${palette}"] rule found`).toBeGreaterThanOrEqual(0);
      const ruleEnd = css.indexOf("}", ruleStart);
      const rule = css.slice(ruleStart, ruleEnd);
      for (const property of PROPERTIES) {
        expect(rule).toContain(`${property}:`);
      }
    });
  }

  it("mono (the default) is the gray ramp, not left undefined", () => {
    expect(css).toContain("--dm-accent-500: var(--dm-gray-500)");
  });
});
