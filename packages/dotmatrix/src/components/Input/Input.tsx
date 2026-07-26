"use client";

import type { ComponentPropsWithoutRef, Ref } from "react";
import type { IconName } from "../../icons";
import { useFormField } from "../../system/useFormField";
import { FieldShell } from "../FieldShell/FieldShell";
import { Icon } from "../Icon/Icon";
import styles from "./Input.module.scss";

export interface InputOwnProps
  extends Omit<ComponentPropsWithoutRef<"input">, "size" | "className" | "style"> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  /** @default "m" */
  size?: "s" | "m" | "l";
  /**
   * A regular expression the native constraint-validation API checks the
   * value against — already usable today as a plain HTML attribute (this
   * just documents it as a first-class prop). Doesn't produce an error
   * message on its own; pair it with your own `error` + `onBlur` for that.
   */
  pattern?: string;
  /** A leading icon inside the field, e.g. for a labeled filter/amount input. */
  icon?: IconName;
  className?: string;
}

type InputProps = InputOwnProps & { ref?: Ref<HTMLInputElement> };

/** A labeled text input. For multi-line text, use `Textarea`. */
function InputImpl({
  ref,
  label,
  description,
  error,
  success,
  size = "m",
  icon,
  required,
  disabled,
  className,
  id,
  ...rest
}: InputProps) {
  const { fieldId, hintKind, hintId, describedBy } = useFormField({
    id,
    error,
    success,
    description,
  });

  const field = (
    <input
      ref={ref}
      id={fieldId}
      required={required}
      disabled={disabled}
      aria-invalid={!!error}
      aria-describedby={describedBy}
      className={[
        "dm-input",
        styles.input,
        styles[size],
        icon ? styles.withIcon : undefined,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );

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
      {icon ? (
        <span className={styles.wrapper}>
          <Icon name={icon} size="s" className={styles.icon} />
          {field}
        </span>
      ) : (
        field
      )}
    </FieldShell>
  );
}
InputImpl.displayName = "Input";

export const Input = InputImpl;
