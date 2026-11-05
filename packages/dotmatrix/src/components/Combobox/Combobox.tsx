"use client";

import {
  autoUpdate,
  FloatingFocusManager,
  FloatingPortal,
  flip,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useTransitionStyles,
} from "@floating-ui/react";
import { type KeyboardEvent, useMemo, useRef, useState } from "react";
import { type LayoutProps, pickLayoutProps } from "../../system/layoutProps";
import { useControllableState } from "../../system/useControllableState";
import { useFormField } from "../../system/useFormField";
import { useReducedMotion } from "../../system/useReducedMotion";
import { Column } from "../Column/Column";
import { FieldShell } from "../FieldShell/FieldShell";
import { Icon } from "../Icon/Icon";
import { Input } from "../Input/Input";
import { Row } from "../Row/Row";
import { Text } from "../Text/Text";
import styles from "./Combobox.module.scss";

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboboxOwnProps {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  /** @default "m" */
  size?: "s" | "m" | "l";
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Shown on the trigger when nothing is selected yet. @default "Select…" */
  placeholder?: string;
  /** @default "Search…" */
  searchPlaceholder?: string;
  /** @default "No matches." */
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * A filterable `Select` — same `options`/`value`/`onChange` shape, but opens
 * with a search field so a long list narrows as you type instead of
 * requiring a scroll. Positioned the same way `Dropdown` is (its own
 * floating-ui setup, not literally wrapping `Dropdown`: that component's
 * roving-focus menu semantics assume `DropdownItem`s as the only children,
 * not a search input ahead of them). Options use `listbox`/`option` roles —
 * real DOM focus never leaves the search field; the active option is
 * communicated via `aria-activedescendant`, the standard combobox pattern,
 * matching `CommandPalette`'s own filtered-list approach rather than
 * `Select`'s borrowed `menu` semantics.
 */
function ComboboxImpl({
  label,
  description,
  error,
  success,
  size: sizeProp = "m",
  options,
  value,
  defaultValue,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyMessage = "No matches.",
  disabled,
  className,
  ...rest
}: ComboboxOwnProps & LayoutProps) {
  const { fieldId, hintKind, hintId, describedBy } = useFormField({ error, success, description });
  const [current, setCurrent] = useControllableState(value, defaultValue ?? "", onChange);
  const selected = options.find((option) => option.value === current);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const reducedMotion = useReducedMotion();

  const results = useMemo(
    () =>
      query.trim()
        ? options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()))
        : options,
    [options, query],
  );

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: (next) => {
      setOpen(next);
      if (next) {
        setQuery("");
        setActiveIndex(0);
      }
    },
    placement: "bottom-start",
    middleware: [
      offset(4),
      flip(),
      shift({ padding: 8 }),
      size({
        padding: 8,
        apply({ availableHeight, rects, elements }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${availableHeight}px`,
            width: `${rects.reference.width}px`,
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: reducedMotion ? 0 : 120,
    initial: { opacity: 0, transform: "scale(0.96)" },
  });

  const commit = (option: ComboboxOption) => {
    if (option.disabled) return;
    setCurrent(option.value);
    setOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = results[activeIndex];
      if (target) commit(target);
    }
  };

  const optionId = (option: ComboboxOption) => `${fieldId}-option-${option.value}`;
  const activeOption = results[activeIndex];

  return (
    <FieldShell
      fieldId={fieldId}
      label={label}
      description={description}
      error={error}
      success={success}
      hintKind={hintKind}
      hintId={hintId}
      disabled={disabled}
      layout={pickLayoutProps(rest)}
    >
      <Row
        as="button"
        display="flex"
        alignItems="center"
        justifyContent="between"
        gap="8"
        ref={refs.setReference}
        type="button"
        id={fieldId}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label ? `${label}: ` : ""}${selected?.label ?? placeholder}`}
        className={["dm-combobox", styles.trigger, styles[sizeProp], className]
          .filter(Boolean)
          .join(" ")}
        {...getReferenceProps()}
      >
        <Row
          as="span"
          display="block"
          className={[styles.label, selected ? undefined : styles.placeholder]
            .filter(Boolean)
            .join(" ")}
        >
          {selected?.label ?? placeholder}
        </Row>
        <Icon name="chevron-down" size="s" className={styles.chevron} />
      </Row>
      {isMounted && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false} initialFocus={inputRef}>
            <Column
              display="block"
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
            >
              <Column gap="8" padding="8" style={transitionStyles} className={styles.menu}>
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  role="combobox"
                  aria-expanded={open}
                  aria-controls={`${fieldId}-listbox`}
                  aria-activedescendant={activeOption ? optionId(activeOption) : undefined}
                />
                <Column gap="2" id={`${fieldId}-listbox`} role="listbox" aria-label={label}>
                  {results.length === 0 && (
                    <Text fontSize="s" color="weak">
                      {emptyMessage}
                    </Text>
                  )}
                  {results.map((option, index) => (
                    <Row
                      key={option.value}
                      id={optionId(option)}
                      role="option"
                      aria-selected={option.value === current}
                      aria-disabled={option.disabled}
                      gap="8"
                      alignItems="center"
                      justifyContent="between"
                      padding="8"
                      radius="control"
                      background={index === activeIndex ? "raised" : "transparent"}
                      style={{
                        cursor: option.disabled ? "not-allowed" : "pointer",
                        opacity: option.disabled ? 0.5 : undefined,
                      }}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => commit(option)}
                    >
                      <Text fontSize="s" color={index === activeIndex ? "strong" : "medium"}>
                        {option.label}
                      </Text>
                      {option.value === current && <Icon name="check" size="s" />}
                    </Row>
                  ))}
                </Column>
              </Column>
            </Column>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </FieldShell>
  );
}
ComboboxImpl.displayName = "Combobox";

export const Combobox = ComboboxImpl;
