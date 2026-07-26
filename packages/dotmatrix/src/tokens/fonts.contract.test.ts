import { existsSync } from "node:fs";
import { resolve } from "node:path";
import * as sass from "sass";
import { describe, expect, it } from "vitest";

const css = sass.compile(resolve(import.meta.dirname, "fonts.scss"), {
  silenceDeprecations: ["import"],
}).css;

describe("self-hosted fonts", () => {
  it("declares @font-face for both Departure Mono and Geist Mono", () => {
    expect(css).toMatch(/font-family:\s*"Departure Mono"/);
    expect(css).toMatch(/font-family:\s*"Geist Mono"/);
  });

  it("every referenced woff2 file physically exists in src/tokens/fonts", () => {
    const referenced = [...css.matchAll(/url\("\.\/fonts\/([^"]+\.woff2)"\)/g)]
      .map((m) => m[1])
      .filter((name): name is string => name !== undefined);
    expect(referenced.length).toBeGreaterThan(0);
    for (const file of referenced) {
      const path = resolve(import.meta.dirname, "fonts", file);
      expect(existsSync(path), `missing font file: ${file}`).toBe(true);
    }
  });

  it("gives every Geist Mono @font-face its own unicode-range", () => {
    // Two subset files (latin, latin-ext) sharing one @font-face block with
    // no unicode-range would make the browser always pick the first `src`
    // entry for every weight, silently dropping accented Latin characters —
    // caught and fixed before this ever shipped, kept as a regression guard.
    const geistBlocks = css.match(/@font-face\s*\{[^}]*font-family:\s*"Geist Mono"[^}]*\}/g) ?? [];
    expect(geistBlocks.length).toBeGreaterThan(0);
    for (const block of geistBlocks) {
      expect(block).toMatch(/unicode-range:/);
    }
  });

  it("license files for both fonts are present alongside the binaries", () => {
    expect(existsSync(resolve(import.meta.dirname, "fonts/LICENSE-departure-mono.txt"))).toBe(true);
    expect(existsSync(resolve(import.meta.dirname, "fonts/LICENSE-geist-mono.txt"))).toBe(true);
  });
});
