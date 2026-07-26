"use client";

import { createContext, type ReactNode, useContext, useId } from "react";
import { useControllableState } from "../../system/useControllableState";
import { Column } from "../Column/Column";
import { Icon } from "../Icon/Icon";
import { Text } from "../Text/Text";
import styles from "./Accordion.module.scss";

interface AccordionContextValue {
  value: string | null;
  setValue: (value: string | null) => void;
  idPrefix: string;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext(): AccordionContextValue {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("<AccordionItem> must be rendered inside <Accordion>.");
  return ctx;
}

export interface AccordionOwnProps {
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  children: ReactNode;
}

/**
 * A single-open accordion — opening one item closes whatever else was open,
 * and the open item can always collapse back to none. Multi-open is a
 * deliberately unhandled case for v1, not an oversight: it's a real
 * extension (independent open state per item) rather than a variant of this
 * one, and no consumer has needed it yet.
 */
export function Accordion({ value, defaultValue, onChange, children }: AccordionOwnProps) {
  const [current, setCurrent] = useControllableState(value, defaultValue ?? null, onChange);
  const idPrefix = useId();

  return (
    <AccordionContext.Provider value={{ value: current, setValue: setCurrent, idPrefix }}>
      <Column>{children}</Column>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemOwnProps {
  value: string;
  title: string;
  disabled?: boolean;
  children: ReactNode;
}

export function AccordionItem({ value, title, disabled, children }: AccordionItemOwnProps) {
  const { value: openValue, setValue, idPrefix } = useAccordionContext();
  const open = openValue === value;
  const headerId = `${idPrefix}-header-${value}`;
  const panelId = `${idPrefix}-panel-${value}`;

  return (
    <div className={styles.item}>
      {/* h3: the WAI-ARIA APG accordion pattern wraps the trigger in a
          heading so the section shows up in a screen reader's headings
          navigation, not just as a button. Not configurable in v1 — every
          accordion is assumed to sit below an h1/h2 already on the page. */}
      <h3 className={styles.heading}>
        <button
          type="button"
          id={headerId}
          aria-expanded={open}
          aria-controls={panelId}
          disabled={disabled}
          onClick={() => setValue(open ? null : value)}
          className={styles.trigger}
        >
          <Text fontSize="s" weight="medium">
            {title}
          </Text>
          <Icon name={open ? "chevron-up" : "chevron-down"} />
        </button>
      </h3>
      {/*
        Content stays mounted either way — the `grid-template-rows: 0fr/1fr`
        trick (Accordion.module.scss) is what animates the height, and that
        only works if there's still a box to size; unmounting the closed
        panel (as Tabs does for its inactive panel) would remove the very
        thing being animated.
        `inert` (not just `aria-hidden`) is what actually pulls it out of
        the tab order while collapsed — `aria-hidden` alone hides it from
        screen readers but doesn't stop a sighted keyboard user from
        tabbing into a control that's currently collapsed to zero height.
      */}
      <div
        className={[styles.panelWrapper, open ? styles.open : undefined].filter(Boolean).join(" ")}
      >
        <div
          role="region"
          id={panelId}
          aria-labelledby={headerId}
          aria-hidden={!open}
          inert={!open}
          className={styles.panelInner}
        >
          <div className={styles.panel}>{children}</div>
        </div>
      </div>
    </div>
  );
}
