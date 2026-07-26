"use client";

import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import type { Breakpoint } from "../system/props";

/**
 * Mirrors tokens/_scale.scss `$breakpoints` (max-width, largest first). Kept
 * here rather than derived from Sass at runtime — there is no Sass at
 * runtime — so a change to one side must be mirrored to the other by hand.
 */
const BREAKPOINT_MAX_WIDTH: Record<Breakpoint, number> = {
  xl: 1600,
  l: 1280,
  m: 1024,
  s: 768,
  xs: 480,
};

const ORDERED: Breakpoint[] = ["xs", "s", "m", "l", "xl"];

function resolveBreakpoint(width: number): Breakpoint {
  for (const bp of ORDERED) {
    if (width <= BREAKPOINT_MAX_WIDTH[bp]) return bp;
  }
  return "xl";
}

interface LayoutContextValue {
  breakpoint: Breakpoint;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

/**
 * Almost nothing needs this — responsive style props resolve to plain CSS
 * media queries and cost no JS. Reach for `useBreakpoint()` only when a
 * decision can't be expressed in CSS at all, e.g. choosing between two
 * entirely different child components per breakpoint.
 */
export function LayoutProvider({ children }: { children: ReactNode }) {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("xl");

  useEffect(() => {
    const update = () => setBreakpoint(resolveBreakpoint(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return <LayoutContext.Provider value={{ breakpoint }}>{children}</LayoutContext.Provider>;
}

export function useBreakpoint(): Breakpoint {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useBreakpoint must be called within a <LayoutProvider>.");
  return ctx.breakpoint;
}
