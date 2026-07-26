import { resolve } from "node:path";
import * as sass from "sass";
import { describe, expect, it } from "vitest";
import * as P from "./props";
import { BOOLEAN_PROPS, SCALE_PROPS } from "./resolveStyleProps";

/**
 * Guards the split between props.ts (the TS-side manifest of what values a
 * style prop accepts) and styles/*.scss (the generator of the classes those
 * values resolve to). Nothing enforces these stay in sync automatically —
 * this test is that enforcement. If it fails, either a value was added here
 * without a matching `emit-*` call in styles/, or a class was renamed in
 * Sass without updating SCALE_PROPS.
 */

const css = sass.compile(resolve(import.meta.dirname, "../styles/index.scss"), {
  loadPaths: [resolve(import.meta.dirname, "..")],
  silenceDeprecations: ["import"],
}).css;

function hasClass(className: string): boolean {
  // Compiled output is one long line per rule; a literal substring check on
  // ".dm-foo-16{" (sass compresses away the space before `{`) is enough here
  // and far cheaper than parsing the stylesheet into an AST.
  return css.includes(`.${className}{`) || css.includes(`.${className} {`);
}

/** Prop key -> the value list declared in props.ts / types.ts for it. */
const VALUES_BY_PROP: Record<string, readonly string[]> = {
  padding: P.spacingValues,
  paddingX: P.spacingValues,
  paddingY: P.spacingValues,
  paddingTop: P.spacingValues,
  paddingRight: P.spacingValues,
  paddingBottom: P.spacingValues,
  paddingLeft: P.spacingValues,
  margin: P.spacingValues,
  marginX: P.spacingValues,
  marginY: P.spacingValues,
  marginTop: P.spacingValues,
  marginRight: P.spacingValues,
  marginBottom: P.spacingValues,
  marginLeft: P.spacingValues,
  gap: P.spacingValues,
  gapX: P.spacingValues,
  gapY: P.spacingValues,

  width: P.sizeValues,
  height: P.sizeValues,
  minWidth: P.sizeValues,
  maxWidth: P.sizeValues,
  minHeight: P.sizeValues,
  maxHeight: P.sizeValues,

  direction: P.directionValues,
  wrap: P.wrapValues,
  alignItems: P.alignValues,
  alignSelf: P.alignValues,
  justifyContent: P.justifyValues,
  flex: P.flexShorthandValues,
  flexGrow: P.flexGrowShrinkValues,
  flexShrink: P.flexGrowShrinkValues,

  columns: P.columnValues,
  rows: P.rowValues,
  justifyItems: P.justifyItemsValues,
  colSpan: P.spanValues,
  rowSpan: P.spanValues,

  display: P.displayValues,
  overflow: P.overflowValues,
  overflowX: P.overflowValues,
  overflowY: P.overflowValues,

  position: P.positionValues,
  inset: P.insetValues,
  top: P.insetValues,
  right: P.insetValues,
  bottom: P.insetValues,
  left: P.insetValues,
  zIndex: P.zIndexValues,

  radius: P.radiusValues,
  borderWidth: P.borderWidthValues,
  borderColor: P.borderColorValues,
  borderStyle: P.borderStyleValues,

  color: P.colorValues,
  background: P.backgroundValues,

  shadow: P.shadowValues,
  pattern: P.patternValues,

  font: P.fontFamilyValues,
  fontSize: P.fontSizeValues,
  displaySize: P.displaySizeValues,
  leading: P.fontSizeValues,
  weight: P.fontWeightValues,
  tracking: P.trackingValues,
  align: P.textAlignValues,
};

describe("props ↔ generated CSS contract", () => {
  it("covers every SCALE_PROPS entry with a value list", () => {
    for (const key of Object.keys(SCALE_PROPS)) {
      expect(VALUES_BY_PROP, `missing VALUES_BY_PROP entry for "${key}"`).toHaveProperty(key);
    }
  });

  for (const [propKey, values] of Object.entries(VALUES_BY_PROP)) {
    const { prefix, responsive } = SCALE_PROPS[propKey]!;

    describe(`${propKey} (dm-${prefix}-*)`, () => {
      it.each(values)("generates a base class for value %j", (value) => {
        expect(hasClass(`dm-${prefix}-${value}`)).toBe(true);
      });

      if (responsive) {
        for (const bp of P.breakpoints) {
          it.each(values)(`generates a ${bp} class for value %j`, (value) => {
            expect(hasClass(`dm-${bp}-${prefix}-${value}`)).toBe(true);
          });
        }
      }
    });
  }

  describe("boolean props", () => {
    for (const [propKey, className] of Object.entries(BOOLEAN_PROPS)) {
      it(`${propKey} -> .${className} exists`, () => {
        expect(hasClass(className)).toBe(true);
      });
    }
  });
});
