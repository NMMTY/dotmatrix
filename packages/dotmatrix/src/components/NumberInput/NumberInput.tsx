"use client";

import { type ComponentPropsWithoutRef, type Ref, useState } from "react";
import { useFormField } from "../../system/useFormField";
import { FieldShell } from "../FieldShell/FieldShell";
import { Icon } from "../Icon/Icon";
import styles from "./NumberInput.module.scss";

export interface NumberInputOwnProps
  extends Omit<ComponentPropsWithoutRef<"input">, "type" | "size" | "className" | "style"> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  className?: string;
}

type NumberInputProps = NumberInputOwnProps & { ref?: Ref<HTMLInputElement> };

function clampToRange(value: number, min?: number | string, max?: number | string): number {
  let v = value;
  if (min !== undefined && v < Number(min)) v = Number(min);
  if (max !== undefined && v > Number(max)) v = Number(max);
  return v;
}

/** A number input with +/- stepper buttons alongside the native spinner controls. */
function NumberInputImpl({
  ref,
  label,
  description,
  error,
  success,
  min,
  max,
  step = 1,
  value,
  defaultValue,
  onChange,
  disabled,
  className,
  id,
  ...rest
}: NumberInputProps) {
  const { fieldId, hintKind, hintId, describedBy } = useFormField({
    id,
    error,
    success,
    description,
  });

  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const current = isControlled ? value : internalValue;

  const setValue = (next: number) => {
    if (!isControlled) setInternalValue(String(next));
    // A synthetic-ish event good enough for a plain `(value) => void`
    // consumer, but this component takes the same `onChange` shape as a
    // native input, so it constructs one rather than inventing a second API.
    onChange?.({ target: { value: String(next) } } as React.ChangeEvent<HTMLInputElement>);
  };

  const step_ = (direction: 1 | -1) => {
    const base = current === "" ? (min !== undefined ? Number(min) : 0) : Number(current);
    setValue(clampToRange(base + direction * Number(step), min, max));
  };

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
    >
      <span className={styles.wrapper}>
        <button
          type="button"
          aria-label="Decrease"
          disabled={disabled}
          onClick={() => step_(-1)}
          className={[styles.step, styles.stepStart].join(" ")}
        >
          <Icon name="minus" size="s" />
        </button>
        <input
          ref={ref}
          type="number"
          id={fieldId}
          min={min}
          max={max}
          step={step}
          value={current}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          onChange={(event) => {
            if (!isControlled) setInternalValue(event.target.value);
            onChange?.(event);
          }}
          className={["dm-number-input", styles.input, className].filter(Boolean).join(" ")}
          {...rest}
        />
        <button
          type="button"
          aria-label="Increase"
          disabled={disabled}
          onClick={() => step_(1)}
          className={[styles.step, styles.stepEnd].join(" ")}
        >
          <Icon name="plus" size="s" />
        </button>
      </span>
    </FieldShell>
  );
}
NumberInputImpl.displayName = "NumberInput";

export const NumberInput = NumberInputImpl;
