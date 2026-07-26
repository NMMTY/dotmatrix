"use client";

import { useState } from "react";

/**
 * Controlled-if-`value`-is-given, uncontrolled otherwise — the same hybrid
 * pattern already used ad hoc in Slider/NumberInput/SearchInput/RadioGroup,
 * pulled out once it was needed a fifth time (Tabs, Accordion, Dialog,
 * Dropdown, and Toast's per-toast open state all need it too).
 */
export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (value: T) => void] {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internalValue;

  const setValue = (next: T) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  return [current, setValue];
}
