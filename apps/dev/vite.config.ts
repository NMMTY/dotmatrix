import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const coreSrc = resolve(import.meta.dirname, "../../packages/dotmatrix/src");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Point at source, not dist: the sandbox gets HMR straight from the
      // library without a rebuild step in between.
      "@nmmty/dotmatrix": resolve(coreSrc, "index.ts"),
      "@nmmty/styles": resolve(coreSrc, "styles"),
      "@nmmty/tokens": resolve(coreSrc, "tokens"),
    },
  },
  css: {
    modules: { generateScopedName: "dm-[local]-[hash:base64:4]" },
  },
  server: { port: 5173, open: true },
});
