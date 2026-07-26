import { resolve } from "node:path";
import * as sass from "sass";
import { describe, expect, it } from "vitest";

const css = sass.compile(resolve(import.meta.dirname, "global.scss"), {
  silenceDeprecations: ["import"],
}).css;

describe("global reset", () => {
  it("defaults border-style to solid and border-width to 0", () => {
    // Without this, an element styled with only `borderWidth`/`borderColor`
    // renders no visible border at all: the border shorthand's used value
    // collapses to 0 whenever border-style is the initial `none`, regardless
    // of what width is specified. Caught live in apps/dev — a <Card
    // borderWidth="1" borderColor="medium"> rendered with no border until
    // this reset rule was added.
    expect(css).toMatch(/border-style:\s*solid/);
    expect(css).toMatch(/border-width:\s*0/);
  });

  it("resets native button/input/textarea/select background to transparent", () => {
    // Without this, native UA chrome (button face, gray in most browsers)
    // shows through on any control a component doesn't set its own
    // `background` on. Caught live in apps/dev — Chip's remove button.
    expect(css).toMatch(/background-color:\s*transparent/);
  });
});
