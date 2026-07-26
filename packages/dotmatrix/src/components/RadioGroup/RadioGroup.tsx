"use client";

import { createContext, type ReactNode, useId, useState } from "react";
import { useFormField } from "../../system/useFormField";
import { Column } from "../Column/Column";
import fieldHintStyles from "../FieldShell/FieldShell.module.scss";
import { Text } from "../Text/Text";

export interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  onChange: (value: string) => void;
  disabled: boolean;
}

/**
 * Not exported from the package — internal wiring between RadioGroup and
 * Radio only. A native radio group's `name` attribute is what makes the
 * browser treat a set of inputs as one mutually-exclusive group in the
 * first place, so `Radio` genuinely needs this context to function; it
 * isn't an optional convenience the way, say, Icon's `title` is.
 */
export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupOwnProps {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
}

const HINT_CLASS = {
  error: fieldHintStyles.error,
  success: fieldHintStyles.success,
  description: fieldHintStyles.description,
};

/**
 * A mutually-exclusive set of `Radio` options, sharing one native `name`.
 *
 * Doesn't reuse `FieldShell`: FieldShell's label is a real `<label
 * htmlFor>`, correct for a single control like Input, but a group's label
 * isn't "for" any one radio — it names the whole group, so it's plain text
 * connected via `aria-labelledby` on the `radiogroup` instead.
 */
export function RadioGroup({
  label,
  description,
  error,
  success,
  name,
  value,
  defaultValue,
  onChange,
  disabled = false,
  children,
}: RadioGroupOwnProps) {
  const generatedName = useId();
  const groupName = name ?? generatedName;
  const { hintKind, hintId, describedBy } = useFormField({ error, success, description });
  const labelId = label ? `${groupName}-label` : undefined;
  const hintText = { error, success, description }[hintKind ?? "description"];

  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (next: string) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  return (
    <RadioGroupContext.Provider
      value={{ name: groupName, value: currentValue, onChange: handleChange, disabled }}
    >
      <Column gap="8">
        {label && (
          <Text id={labelId} fontSize="s" weight="medium">
            {label}
          </Text>
        )}
        <Column
          gap="8"
          role="radiogroup"
          aria-labelledby={labelId}
          aria-describedby={describedBy}
          aria-invalid={!!error}
        >
          {children}
        </Column>
        {hintKind && (
          <Text id={hintId} fontSize="xs" className={HINT_CLASS[hintKind]}>
            {hintText}
          </Text>
        )}
      </Column>
    </RadioGroupContext.Provider>
  );
}
