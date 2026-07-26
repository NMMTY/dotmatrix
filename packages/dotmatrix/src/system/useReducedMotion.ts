"use client";

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

// Guards against SSR (no `window`) and against `matchMedia` simply not
// existing — jsdom (this package's own test environment) doesn't implement
// it at all, and it's not universal in every embedded/non-browser runtime a
// consumer might render into either. Motion is assumed NOT reduced when it
// can't be determined, rather than throwing.
function getInitialValue(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(QUERY).matches;
}

/** Used by every overlay's enter/exit animation to fall back to an instant cut. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(getInitialValue);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(QUERY);
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
