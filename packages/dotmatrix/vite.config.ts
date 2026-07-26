import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import preserveDirectives from "rollup-preserve-directives";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    // Without this, Rollup strips `"use client"` when bundling and every
    // interactive component breaks under the Next.js App Router.
    preserveDirectives(),
    dts({ include: ["src"], exclude: ["src/**/*.test.*", "src/**/*.test-d.*"] }),
  ],
  css: {
    modules: {
      // Readable in devtools, still collision-proof for consumers.
      generateScopedName: "dm-[local]-[hash:base64:4]",
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    // One stylesheet for every component module, concatenated later by
    // scripts/build-css.mjs into the final cascade.
    cssCodeSplit: false,
    lib: {
      entry: resolve(import.meta.dirname, "src/index.ts"),
      formats: ["es"],
    },
    rollupOptions: {
      // prismjs is external too, and deliberately so: it's an optional peer
      // dependency (see CodeBlock's package.json entry) — bundling it here
      // would ship it to every consumer regardless of whether they installed
      // it, defeating the whole "install it yourself if you want highlighting" story.
      external: ["react", "react-dom", "react/jsx-runtime", /^@floating-ui\//, /^prismjs/],
      output: {
        // Keep the module graph intact so consumers can tree-shake and so
        // per-file "use client" boundaries survive.
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
        assetFileNames: "components.css",
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
