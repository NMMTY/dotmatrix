"use client";

import { type ComponentPropsWithoutRef, type Ref, useState } from "react";
import { useFormField } from "../../system/useFormField";
import { FieldShell } from "../FieldShell/FieldShell";
import { Icon } from "../Icon/Icon";
import styles from "./PasswordInput.module.scss";

export interface PasswordInputOwnProps
  extends Omit<ComponentPropsWithoutRef<"input">, "type" | "size" | "className" | "style"> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  /** @default "m" */
  size?: "s" | "m" | "l";
  className?: string;
}

type PasswordInputProps = PasswordInputOwnProps & { ref?: Ref<HTMLInputElement> };

/** A text input that masks its value by default, with a trailing toggle to reveal it. */
function PasswordInputImpl({
  ref,
  label,
  description,
  error,
  success,
  size = "m",
  required,
  disabled,
  className,
  id,
  ...rest
}: PasswordInputProps) {
  const { fieldId, hintKind, hintId, describedBy } = useFormField({
    id,
    error,
    success,
    description,
  });
  const [revealed, setRevealed] = useState(false);

  return (
    <FieldShell
      fieldId={fieldId}
      label={label}
      description={description}
      error={error}
      success={success}
      hintKind={hintKind}
      hintId={hintId}
      required={required}
      disabled={disabled}
    >
      <span className={styles.wrapper}>
        <input
          ref={ref}
          type={revealed ? "text" : "password"}
          id={fieldId}
          required={required}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={["dm-password-input", styles.input, styles[size], className]
            .filter(Boolean)
            .join(" ")}
          {...rest}
        />
        <button
          type="button"
          aria-label={revealed ? "Hide password" : "Show password"}
          aria-pressed={revealed}
          disabled={disabled}
          onClick={() => setRevealed((v) => !v)}
          className={styles.toggle}
        >
          <Icon name={revealed ? "eye-off" : "eye"} size="s" />
        </button>
      </span>
    </FieldShell>
  );
}
PasswordInputImpl.displayName = "PasswordInput";

export const PasswordInput = PasswordInputImpl;
