"use client";

import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";
import type { PaletteValue } from "../system/props";

export type Theme = "dark" | "light";
export type Palette = PaletteValue;
export type BorderStyle = "rounded" | "notched" | "square";
export type Density = "compact" | "normal" | "comfortable";

export interface ThemeSettings {
  theme: Theme;
  palette: Palette;
  border: BorderStyle;
  density: Density;
}

const DEFAULTS: ThemeSettings = {
  theme: "dark",
  palette: "mono",
  border: "rounded",
  density: "normal",
};
const STORAGE_KEY = "dm-theme";
const ATTRIBUTES: Record<keyof ThemeSettings, string> = {
  theme: "data-theme",
  palette: "data-palette",
  border: "data-border",
  density: "data-density",
};

/**
 * Inline script string for a document `<head>`, executed before hydration.
 * Reads the same localStorage blob `ThemeProvider` writes to and stamps
 * `<html>` synchronously, so there is no flash of the default theme while
 * React boots. `defaults` must match whatever you pass to `ThemeProvider`.
 */
export function getThemeInitScript(defaults: Partial<ThemeSettings> = {}): string {
  const merged = { ...DEFAULTS, ...defaults };
  return (
    `(function(){try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})||"{}");var d=document.documentElement;` +
    `d.setAttribute("data-theme",s.theme||${JSON.stringify(merged.theme)});` +
    `d.setAttribute("data-palette",s.palette||${JSON.stringify(merged.palette)});` +
    `d.setAttribute("data-border",s.border||${JSON.stringify(merged.border)});` +
    `d.setAttribute("data-density",s.density||${JSON.stringify(merged.density)});` +
    `}catch(e){}})();`
  );
}

/** Drop this in `<head>`, before any stylesheet, to prevent a theme flash. */
export function ThemeInitScript(props: Partial<ThemeSettings>) {
  return (
    <script
      suppressHydrationWarning
      // biome-ignore lint/security/noDangerouslySetInnerHtml: getThemeInitScript only interpolates JSON.stringify()'d enum-like values, never arbitrary or user-supplied strings.
      dangerouslySetInnerHTML={{ __html: getThemeInitScript(props) }}
    />
  );
}

interface ThemeContextValue extends ThemeSettings {
  setTheme: (value: Theme) => void;
  setPalette: (value: Palette) => void;
  setBorder: (value: BorderStyle) => void;
  setDensity: (value: Density) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps extends Partial<ThemeSettings> {
  children: ReactNode;
}

/**
 * Owns the four theming axes and mirrors them onto `<html data-*>` attributes
 * — the actual mechanism every token in tokens/theme.scss reacts to. Switching
 * theme is therefore an attribute write, not a re-render: no component in the
 * tree needs to know the provider exists to pick up a theme change.
 */
export function ThemeProvider({ children, ...initial }: ThemeProviderProps) {
  const [settings, setSettings] = useState<ThemeSettings>({ ...DEFAULTS, ...initial });

  useEffect(() => {
    const root = document.documentElement;
    for (const key of Object.keys(ATTRIBUTES) as (keyof ThemeSettings)[]) {
      root.setAttribute(ATTRIBUTES[key], settings[key]);
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Storage unavailable (private mode, disabled) — attributes above are
      // still applied for the current session, just not persisted.
    }
  }, [settings]);

  const update = useCallback(
    <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) =>
      setSettings((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const value: ThemeContextValue = {
    ...settings,
    setTheme: (v) => update("theme", v),
    setPalette: (v) => update("palette", v),
    setBorder: (v) => update("border", v),
    setDensity: (v) => update("density", v),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be called within a <ThemeProvider>.");
  return ctx;
}
