export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export const changelog: ChangelogEntry[] = [
  {
    version: "0.4.0",
    date: "2026-11-05",
    changes: [
      "Rebuilt the glyph library on a 9×9 bitmap grid (odd, so every glyph has a true centre pixel) and grew it from 34 to 167 icons, adding dashboard and developer glyphs — git, code, hardware, media, status.",
      "Icon now draws on an 18×18 viewBox. Size steps are whole multiples of the grid: s 12→9px, m 16→18px, l 20→27px. ExternalIcon follows so the two still sit side by side.",
      "Added a `custom` palette: set --dm-custom-seed (and --dm-custom-on-seed) and the whole accent ramp, action, hover and focus colours are derived from it.",
      "Added BracketValue, SegmentHeader, TaskList, CommandInput, DiffChip, WidgetCard and StackedBarChart (series told apart by dither density).",
      "Added Fx, a wrapper with 11 stepped, easing-free effects at 15 fps — triggered on mount, in view, hover, focus, exit, loop or by hand — plus --dm-fx-frame / --dm-fx-stagger tokens.",
    ],
  },
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
