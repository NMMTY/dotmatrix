"use client";

import { type CSSProperties, createContext, type ReactNode, useContext, useId } from "react";
import type { StyleProps } from "../../system/types";
import { useControllableState } from "../../system/useControllableState";
import { Column } from "../Column/Column";
import { Grid } from "../Grid/Grid";
import { Icon } from "../Icon/Icon";
import { Row } from "../Row/Row";
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

type LayoutExtras = StyleProps & { className?: string; style?: CSSProperties };

/**
 * A single-open accordion — opening one item closes whatever else was open,
 * and the open item can always collapse back to none. Multi-open is a
 * deliberately unhandled case for v1, not an oversight: it's a real
 * extension (independent open state per item) rather than a variant of this
 * one, and no consumer has needed it yet.
 */
export function Accordion({
  value,
  defaultValue,
  onChange,
  children,
  ...rest
}: AccordionOwnProps & LayoutExtras) {
  const [current, setCurrent] = useControllableState(value, defaultValue ?? null, onChange);
  const idPrefix = useId();

  return (
    <AccordionContext.Provider value={{ value: current, setValue: setCurrent, idPrefix }}>
      <Column {...rest}>{children}</Column>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemOwnProps {
  value: string;
  title: string;
  disabled?: boolean;
  children: ReactNode;
}

export function AccordionItem({
  value,
  title,
  disabled,
  children,
  className,
  ...rest
}: AccordionItemOwnProps & LayoutExtras) {
  const { value: openValue, setValue, idPrefix } = useAccordionContext();
  const open = openValue === value;
  const headerId = `${idPrefix}-header-${value}`;
  const panelId = `${idPrefix}-panel-${value}`;

  return (
    <Column {...rest} className={[styles.item, className].filter(Boolean).join(" ")}>
      {/* h3: the WAI-ARIA APG accordion pattern wraps the trigger in a
          heading so the section shows up in a screen reader's headings
          navigation, not just as a button. Not configurable in v1 — every
          accordion is assumed to sit below an h1/h2 already on the page. */}
      <Column as="h3" className={styles.heading}>
        <Row
          as="button"
          alignItems="center"
          justifyContent="between"
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
        </Row>
      </Column>
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
      <Grid
        className={[styles.panelWrapper, open ? styles.open : undefined].filter(Boolean).join(" ")}
      >
        <Column
          role="region"
          id={panelId}
          aria-labelledby={headerId}
          aria-hidden={!open}
          inert={!open}
          className={styles.panelInner}
        >
          <Column className={styles.panel}>{children}</Column>
        </Column>
      </Grid>
    </Column>
  );
}
