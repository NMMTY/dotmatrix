// @types/prismjs only covers the `prismjs` package root — each per-language
// component file (`prismjs/components/prism-*`) has no published types since
// they're side-effect-only (they register a grammar on the shared `Prism`
// object rather than exporting anything).
declare module "prismjs/components/prism-*";
