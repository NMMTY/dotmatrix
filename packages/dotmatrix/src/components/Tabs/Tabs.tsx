"use client";

import { createContext, type KeyboardEvent, type ReactNode, useContext, useId } from "react";
import { useControllableState } from "../../system/useControllableState";
import { Column } from "../Column/Column";
import { Row } from "../Row/Row";
import styles from "./Tabs.module.scss";

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  idPrefix: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error(`<${component}> must be rendered inside <Tabs>.`);
  return ctx;
}

export interface TabsOwnProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  children: ReactNode;
}

/** A set of switchable panels, each with a corresponding tab button. */
export function Tabs({ value, defaultValue, onChange, children }: TabsOwnProps) {
  const [current, setCurrent] = useControllableState(value, defaultValue ?? "", onChange);
  const idPrefix = useId();

  return (
    <TabsContext.Provider value={{ value: current, setValue: setCurrent, idPrefix }}>
      <Column>{children}</Column>
    </TabsContext.Provider>
  );
}

export interface TabListOwnProps {
  "aria-label": string;
  children: ReactNode;
}

export function TabList({ children, ...rest }: TabListOwnProps) {
  return (
    <Row role="tablist" gap="4" className={styles.list} {...rest}>
      {children}
    </Row>
  );
}

export interface TabOwnProps {
  value: string;
  disabled?: boolean;
  children: ReactNode;
}

/**
 * Arrow Left/Right (wrapping) and Home/End move focus AND activate the tab
 * immediately — WAI-ARIA APG's "automatic activation" pattern, right for a
 * tablist whose panels are cheap to show. Sibling tabs are found via the DOM
 * (`role="tab"` under the same `role="tablist"`), simpler than tracking
 * order in context for the same information.
 */
export function Tab({ value, disabled, children }: TabOwnProps) {
  const { value: selectedValue, setValue, idPrefix } = useTabsContext("Tab");
  const selected = value === selectedValue;

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const key = event.key;
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(key)) return;
    event.preventDefault();

    const tabs = [
      ...(event.currentTarget
        .closest('[role="tablist"]')
        ?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)') ?? []),
    ];
    if (tabs.length === 0) return;
    const currentIndex = tabs.indexOf(event.currentTarget);

    let nextIndex: number;
    if (key === "Home") nextIndex = 0;
    else if (key === "End") nextIndex = tabs.length - 1;
    else if (key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    else nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;

    const next = tabs[nextIndex];
    next?.focus();
    next?.click();
  };

  return (
    <button
      type="button"
      role="tab"
      id={`${idPrefix}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${idPrefix}-panel-${value}`}
      // Roving tabindex: only the selected tab is in the Tab order, and
      // arrow keys move focus between the rest — matches how a native
      // single-select control (e.g. <select>) behaves with the keyboard.
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      onClick={() => setValue(value)}
      onKeyDown={handleKeyDown}
      className={[styles.tab, selected ? styles.selected : undefined].filter(Boolean).join(" ")}
    >
      {children}
    </button>
  );
}

export interface TabPanelOwnProps {
  value: string;
  children: ReactNode;
}

export function TabPanel({ value, children }: TabPanelOwnProps) {
  const { value: selectedValue, idPrefix } = useTabsContext("TabPanel");
  const selected = value === selectedValue;

  return (
    <div
      role="tabpanel"
      id={`${idPrefix}-panel-${value}`}
      aria-labelledby={`${idPrefix}-tab-${value}`}
      hidden={!selected}
      className={styles.panel}
    >
      {selected && children}
    </div>
  );
}
