"use client";

import { type ComponentPropsWithoutRef, type CSSProperties, type Ref, useState } from "react";
import { useFormField } from "../../system/useFormField";
import { FieldShell } from "../FieldShell/FieldShell";
import styles from "./Slider.module.scss";

export interface SliderOwnProps
  extends Omit<ComponentPropsWithoutRef<"input">, "type" | "size" | "className" | "style"> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  className?: string;
}

type SliderProps = SliderOwnProps & { ref?: Ref<HTMLInputElement> };

/** A single-value range slider. Works controlled or uncontrolled, like a native `<input>`. */
function SliderImpl({
  ref,
  label,
  description,
  error,
  success,
  min = 0,
  max = 100,
  value,
  defaultValue,
  onChange,
  disabled,
  className,
  id,
  ...rest
}: SliderProps) {
  const { fieldId, hintKind, hintId, describedBy } = useFormField({
    id,
    error,
    success,
    description,
  });

  const [internalValue, setInternalValue] = useState(defaultValue ?? min);
  const isControlled = value !== undefined;
  const current = Number(isControlled ? value : internalValue);
  const percent = ((current - Number(min)) / (Number(max) - Number(min))) * 100;

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
      <input
        ref={ref}
        type="range"
        id={fieldId}
        min={min}
        max={max}
        value={current}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        onChange={(event) => {
          if (!isControlled) setInternalValue(event.target.valueAsNumber);
          onChange?.(event);
        }}
        style={{ "--dm-slider-fill": `${percent}%` } as CSSProperties}
        className={["dm-slider", styles.slider, className].filter(Boolean).join(" ")}
        {...rest}
      />
    </FieldShell>
  );
}
SliderImpl.displayName = "Slider";

export const Slider = SliderImpl;
