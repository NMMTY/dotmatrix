import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const coreSrc = resolve(import.meta.dirname, "../../packages/core/src");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Point at source, not dist: the sandbox gets HMR straight from the
      // library without a rebuild step in between.
      "@dotmatrix/core": resolve(coreSrc, "index.ts"),
      "@dotmatrix/styles": resolve(coreSrc, "styles"),
      "@dotmatrix/tokens": resolve(coreSrc, "tokens"),
    },
  },
  css: {
    modules: { generateScopedName: "dm-[local]-[hash:base64:4]" },
  },
  server: { port: 5173, open: true },
});
