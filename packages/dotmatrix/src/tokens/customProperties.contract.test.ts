import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import * as sass from "sass";
import { describe, expect, it } from "vitest";

/**
 * Every `var(--dm-*)` reference anywhere in the component styles must
 * resolve to a `--dm-*` custom property this system actually defines.
 * `--dm-surface` (as opposed to the real `--dm-surface-background`) shipped
 * in three separate component stylesheets before this test existed — an
 * undefined custom property doesn't error anywhere, it just silently
 * resolves to nothing (transparent background, invisible border), so a
 * typo like that has no other signal to catch it.
 */
const componentsDir = resolve(import.meta.dirname, "../components");

function findModuleScssFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      files.push(...findModuleScssFiles(resolve(dir, entry.name)));
    } else if (entry.name.endsWith(".module.scss")) {
      files.push(resolve(dir, entry.name));
    }
  }
  return files;
}

const moduleScssFiles = findModuleScssFiles(componentsDir);

// Not a design token — Slider sets this itself via inline `style` (see
// Slider.tsx) as a per-instance value, not something tokens/index.scss
// could ever define globally.
const LOCALLY_SET_PROPERTIES = new Set(["--dm-slider-fill"]);

const definedProperties = new Set(
  [
    ...sass
      .compile(resolve(import.meta.dirname, "index.scss"), { silenceDeprecations: ["import"] })
      .css.matchAll(/(--dm-[a-z0-9-]+)\s*:/g),
  ]
    .map((m) => m[1])
    .filter((prop): prop is string => prop !== undefined),
);

describe("custom property usage", () => {
  it("found component stylesheets and defined tokens to check", () => {
    expect(moduleScssFiles.length).toBeGreaterThan(0);
    expect(definedProperties.size).toBeGreaterThan(0);
  });

  for (const file of moduleScssFiles) {
    const relativePath = file.slice(resolve(import.meta.dirname, "..").length + 1);
    it(`${relativePath} only references defined --dm-* custom properties`, () => {
      const css = sass.compile(file, { silenceDeprecations: ["import"] }).css;
      const referenced = new Set(
        [...css.matchAll(/var\((--dm-[a-z0-9-]+)/g)]
          .map((m) => m[1])
          .filter((prop): prop is string => prop !== undefined),
      );
      const undefinedProperties = [...referenced].filter(
        (prop) => !definedProperties.has(prop) && !LOCALLY_SET_PROPERTIES.has(prop),
      );
      expect(undefinedProperties).toEqual([]);
    });
  }
});
