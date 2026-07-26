/**
 * Assembles the single stylesheet consumers import.
 *
 * Cascade order is load-bearing — every layer is written at the same
 * specificity, so whatever comes last wins:
 *
 *   1. tokens      custom properties only, no selectors of consequence
 *   2. global      reset + base element styles
 *   3. components  co-located *.module.scss, emitted by the Vite build
 *   4. utilities   prop-driven classes — MUST come last so that
 *                  <Card padding="24"> beats Card.module.scss's own padding
 *
 * Outputs dist/tokens.css (standalone, for token-only consumers) and
 * dist/styles.css (everything).
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as sass from "sass";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");

if (!existsSync(dist)) mkdirSync(dist, { recursive: true });

// tokens/fonts.scss references these with a "./fonts/..." url() that sass
// emits verbatim (it never rewrites paths, unlike a bundler) — so the actual
// files have to land at dist/fonts/ for the published dist/styles.css's
// relative path to resolve. Font binaries only, not the license .txt files:
// those stay attached to the source under src/tokens/fonts for provenance,
// no need to duplicate them into the published output.
const fontsSrc = resolve(root, "src/tokens/fonts");
const fontsDist = resolve(dist, "fonts");
if (!existsSync(fontsDist)) mkdirSync(fontsDist, { recursive: true });
for (const file of readdirSync(fontsSrc)) {
  if (file.endsWith(".woff2")) cpSync(resolve(fontsSrc, file), resolve(fontsDist, file));
}

const compile = (relativePath) =>
  sass.compile(resolve(root, relativePath), {
    style: "compressed",
    loadPaths: [resolve(root, "src")],
    silenceDeprecations: ["import"],
  }).css;

const tokens = compile("src/tokens/index.scss");
const global = compile("src/styles/global.scss");
const utilities = compile("src/styles/index.scss");

// Vite emits component CSS modules here; absent when no module.scss exists yet.
const componentsPath = resolve(dist, "components.css");
const components = existsSync(componentsPath) ? readFileSync(componentsPath, "utf8") : "";
if (existsSync(componentsPath)) rmSync(componentsPath);

writeFileSync(resolve(dist, "tokens.css"), tokens);
writeFileSync(
  resolve(dist, "styles.css"),
  [tokens, global, components, utilities].filter(Boolean).join("\n"),
);

const kb = (s) => `${(Buffer.byteLength(s) / 1024).toFixed(1)}kb`;
console.log(
  `css: tokens ${kb(tokens)} · global ${kb(global)} · components ${kb(components)} · utilities ${kb(utilities)}`,
);

// Guard against the combinatorial blow-up the utility generators invite.
// Raised from 180 to 220 once the Phase 2 component set (Button, Card,
// Badge, Chip, Avatar, ...) pushed the real total to ~181kb — utilities
// dominate the budget (~160kb) and won't shrink from here, so the room is
// for `components`, which will keep growing through Phase 3-6.
const BUDGET_KB = 220;
const total =
  Buffer.byteLength(tokens) +
  Buffer.byteLength(global) +
  Buffer.byteLength(components) +
  Buffer.byteLength(utilities);
if (total / 1024 > BUDGET_KB) {
  console.error(`styles.css is ${(total / 1024).toFixed(1)}kb, over the ${BUDGET_KB}kb budget`);
  process.exit(1);
}
