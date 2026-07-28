export const schema = {
  name: "dotmatrix",
  description: "Monochrome bitmap design system — component reference and guides.",
};

export const layout = {
  sidebar: { width: 220 },
  toc: { width: 200 },
  content: { maxWidth: 720 },
};

/** Resource links gated behind a toggle, same pattern magic-docs uses for roadmap/changelog. */
export const routes: Record<string, boolean> = {
  "/changelog": true,
};

export const social = [{ name: "GitHub", href: "https://github.com" }];
