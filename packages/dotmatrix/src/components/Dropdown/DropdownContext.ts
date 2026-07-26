import type { useInteractions } from "@floating-ui/react";
import { createContext } from "react";

/**
 * Split out of Dropdown.tsx: a file exporting a plain context object
 * alongside React components breaks Vite's Fast Refresh (confirmed live —
 * editing Dropdown.tsx forced a full reload instead of a component-only hot
 * update).
 */
export interface DropdownContextValue {
  activeIndex: number | null;
  getItemProps: ReturnType<typeof useInteractions>["getItemProps"];
  handleSelect: (onSelect?: () => void) => void;
}

export const DropdownContext = createContext<DropdownContextValue | null>(null);
