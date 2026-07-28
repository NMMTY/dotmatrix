export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export const changelog: ChangelogEntry[] = [
  {
    version: "0.3.0",
    date: "2026-07-27",
    changes: [
      "Added the docs site itself, rebuilt on a magic-docs-style content pipeline: MDX-as-data under src/content, filesystem-derived navigation and prev/next, a ⌘K search palette, and a props table/playground generated straight from each component's own TypeScript.",
      "Added CodeBlock — tabs, copy, fullscreen, and collapsible long snippets, with a monochrome Prism theme instead of a color one.",
      "Renamed the published package to @nmmty/dotmatrix.",
    ],
  },
  {
    version: "0.2.0",
    date: "2026-07-26",
    changes: [
      "Added 16 accent palettes (5 hues × base/dark/light, plus mono) — selectable globally via ThemeProvider or scoped locally with a palette prop on any primitive.",
      "Unified every icon behind a single <Icon name /> component with a typed IconName catalog, and drew 17 new glyphs.",
      "Added PasswordInput, OTPInput, and a fully custom ColorInput.",
      "Rewrote Select on top of Dropdown with an options-array API.",
      "Added CSS transitions to Radio, Switch, Checkbox, and Tabs.",
    ],
  },
  {
    version: "0.1.0",
    date: "2026-07-26",
    changes: [
      "Initial release: layout primitives, typography, bitmap graphics (dither/halftone), form controls, overlays and navigation, and data-display components.",
    ],
  },
];
