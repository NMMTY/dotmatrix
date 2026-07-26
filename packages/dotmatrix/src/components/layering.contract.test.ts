import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Every layout primitive's *own* base display rule (`display: flex`,
 * `flex-direction: row`, ...) must live in the dm.components layer, not
 * dm.utilities — dm.components sits below dm.utilities in the cascade
 * (tokens/_layers.scss), which is what guarantees an explicit style prop
 * (`display="grid"`, `direction="column"`) always overrides the component's
 * own default, regardless of which .scss file happens to load first.
 *
 * A bare `.dm-flex { display: flex }` utility class sitting in the same
 * layer as the `display` prop's generated classes only "happens" to lose to
 * it because of file load order — exactly the kind of bug that already
 * slipped through once (see styles/global.scss's border-style default).
 * This test exists so it can't slip through again.
 */
const modules = ["Flex", "Row", "Column", "Grid"] as const;

describe("primitive base styles live in dm.components", () => {
  for (const component of modules) {
    it(`${component}.module.scss declares its base rule under @layer dm.components`, () => {
      const css = readFileSync(
        resolve(import.meta.dirname, `${component}/${component}.module.scss`),
        "utf8",
      );
      expect(css).toMatch(/@layer dm\.components/);
    });
  }

  it("styles/flex.scss and styles/grid.scss no longer define bare .dm-flex/.dm-grid base classes", () => {
    const flexCss = readFileSync(resolve(import.meta.dirname, "../styles/flex.scss"), "utf8");
    const gridCss = readFileSync(resolve(import.meta.dirname, "../styles/grid.scss"), "utf8");
    expect(flexCss).not.toMatch(/\.dm-flex\s*\{/);
    expect(gridCss).not.toMatch(/\.dm-grid\s*\{/);
  });
});

/**
 * Cascade layer priority is fixed by first mention across the whole
 * document, not by tokens/_layers.scss's intent. If a bundler injects a
 * component's CSS Module before the app's own tokens/global/utilities
 * bundle — routine with route-based code splitting, and something Vite does
 * unconditionally in dev — `@layer dm.components {...}` being the first
 * `@layer` the browser sees would register dm.components ahead of
 * dm.global, letting `body { color: ... }` beat a Button's own color rule.
 * Live in apps/dev: every solid-variant Button rendered white-on-white until
 * every component module started re-declaring the canonical order via
 * `_order.scss`, which is a no-op once it's already established and
 * load-bearing when it isn't.
 */
describe("every component module re-establishes canonical layer order", () => {
  const componentsDir = import.meta.dirname;
  const moduleFiles = readdirSync(componentsDir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".module.scss"))
    .map((entry) => resolve(entry.parentPath, entry.name));

  it("found at least one .module.scss file to check", () => {
    expect(moduleFiles.length).toBeGreaterThan(0);
  });

  for (const file of moduleFiles) {
    const relative = file.slice(componentsDir.length + 1);
    it(`${relative} @uses "../_order" before its @layer block`, () => {
      const css = readFileSync(file, "utf8");
      const orderIndex = css.indexOf('@use "../_order"');
      const layerIndex = css.indexOf("@layer dm.components");
      expect(orderIndex, `${relative} is missing @use "../_order"`).toBeGreaterThanOrEqual(0);
      expect(orderIndex).toBeLessThan(layerIndex);
    });
  }
});
