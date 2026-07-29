#!/usr/bin/env node
// Extracts a static JSON prop-manifest for every component in
// packages/dotmatrix/src/components, from each component's own `XxxOwnProps`
// interface and its existing JSDoc — no per-component docs are hand-written
// (see the Phase 7 plan's "generated, not written" reasoning).
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { withCustomConfig } from "react-docgen-typescript";

const __dirname = dirname(fileURLToPath(import.meta.url));
const coreRoot = resolve(__dirname, "../../../packages/dotmatrix");
const componentsDir = resolve(coreRoot, "src/components");
const tsconfigPath = resolve(coreRoot, "tsconfig.json");
const outDir = resolve(__dirname, "../.generated");

/** Every `components/<Name>/<Name>.tsx` — mirrors components/index.ts's own barrel shape. */
function findComponentFiles() {
  const files = [];
  for (const entry of readdirSync(componentsDir)) {
    const dir = resolve(componentsDir, entry);
    if (!statSync(dir).isDirectory()) continue;
    const file = resolve(dir, `${entry}.tsx`);
    try {
      statSync(file);
      files.push(file);
    } catch {
      // Directory has no same-named .tsx (a helper-only folder) — skip.
    }
  }
  return files;
}

/**
 * react-docgen-typescript resolves `description` from whichever symbol it
 * decides is "the component" — for this codebase's `function XxxImpl() {}` /
 * `export const Xxx = XxxImpl` split, that's usually the bare re-export,
 * which never carries the doc comment itself. Falls back to a direct scan
 * for the JSDoc block immediately above the `Impl` function.
 */
function extractDescription(filePath, componentName) {
  const source = readFileSync(filePath, "utf8");
  // `(?:[^*]|\*(?!\/))*` — a properly-bounded comment body that stops at its
  // own `*/` rather than a lazy `[\s\S]*?`, which happily crosses into later
  // comments when an earlier one isn't followed by the right function name.
  const commentPattern = /\/\*\*((?:[^*]|\*(?!\/))*)\*\/\s*(?:export\s+)?function\s+(\w+)\s*\(/g;
  let match = commentPattern.exec(source);
  while (match) {
    if (match[2] === componentName || match[2] === `${componentName}Impl`) {
      const lines = match[1].split("\n").map((line) => line.replace(/^\s*\*\s?/, "").trimEnd());
      while (lines.length && lines[0] === "") lines.shift();
      while (lines.length && lines[lines.length - 1] === "") lines.pop();
      return lines.join("\n");
    }
    match = commentPattern.exec(source);
  }
  return "";
}

/** Buckets a prop into the control the Playground should render for it. */
function classify(prop) {
  const raw = prop.type.raw ?? prop.type.name;
  if (raw === "boolean") return { kind: "boolean" };
  if (raw === "number") return { kind: "number" };
  if (prop.type.name === "enum" && Array.isArray(prop.type.value)) {
    const values = prop.type.value.map((v) => v.value);
    const allQuotedLiterals = values.length > 1 && values.every((v) => /^".*"$/.test(v));
    if (allQuotedLiterals) return { kind: "select", options: values.map((v) => v.slice(1, -1)) };
  }
  if (raw === "string") return { kind: "text" };
  return { kind: "readonly" };
}

const parser = withCustomConfig(tsconfigPath, {
  shouldExtractLiteralValuesFromEnum: true,
  shouldExtractValuesFromUnion: true,
  shouldRemoveUndefinedFromOptional: true,
  // Excludes `ref`/`as` (structural, no `.parent` at all — they come from
  // the file's own prop-intersection type, not an interface), anything
  // inherited from CommonProps/StyleProps (system/types.ts), and anything
  // inherited from React's own DOM prop types (`ComponentPropsWithoutRef<"input">`
  // and friends pull in every native HTML/ARIA attribute and event handler —
  // hundreds of props no component page should list) — a component's page
  // should list only what it declares itself.
  propFilter: (prop) => {
    if (!prop.parent) return false;
    const parentPath = prop.parent.fileName.replace(/\\/g, "/");
    if (parentPath.includes("node_modules")) return false;
    if (parentPath.includes("system/types.ts")) return false;
    return true;
  },
});

const files = findComponentFiles();
const docs = parser.parse(files);

const manifest = docs
  .map((doc) => ({
    name: doc.displayName,
    description: doc.description || extractDescription(doc.filePath, doc.displayName),
    props: Object.entries(doc.props)
      .map(([name, prop]) => ({
        name,
        required: prop.required,
        defaultValue: prop.defaultValue?.value ?? null,
        description: prop.description || "",
        ...classify(prop),
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, "component-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `Generated manifest for ${manifest.length} components -> .generated/component-manifest.json`,
);
