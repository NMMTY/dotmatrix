import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Every `components/<Name>/<Name>.tsx` must be re-exported from
 * `components/index.ts` — Textarea was fully built and covered by its own
 * tests (imported directly from its own file) but missing from the barrel,
 * so it was unreachable from the public `@nmmty/dotmatrix` entry point until
 * this caught it. A direct-file test importing a component can't catch that
 * kind of gap; only checking the barrel itself can.
 */
describe("every component is reachable from components/index.ts", () => {
  const componentsDir = resolve(import.meta.dirname);
  const barrel = readFileSync(resolve(componentsDir, "index.ts"), "utf8");

  const componentDirs = readdirSync(componentsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "FieldShell")
    .map((entry) => entry.name);

  it("found at least one component directory to check", () => {
    expect(componentDirs.length).toBeGreaterThan(0);
  });

  for (const name of componentDirs) {
    it(`${name} is exported from index.ts`, () => {
      const hasMainFile = [`${name}.tsx`, `${name}.ts`].some((file) =>
        readdirSync(resolve(componentsDir, name)).includes(file),
      );
      if (!hasMainFile) return; // not every folder need be a public component (e.g. future non-.tsx helpers)
      expect(barrel).toMatch(new RegExp(`from "\\./${name}/${name}"`));
    });
  }
});
