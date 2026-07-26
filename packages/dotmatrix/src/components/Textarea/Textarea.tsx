"use client";

import type { ComponentPropsWithoutRef, Ref } from "react";
import { useFormField } from "../../system/useFormField";
import { FieldShell } from "../FieldShell/FieldShell";
import styles from "./Textarea.module.scss";

export interface TextareaOwnProps
  extends Omit<ComponentPropsWithoutRef<"textarea">, "className" | "style"> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  className?: string;
}

type TextareaProps = TextareaOwnProps & { ref?: Ref<HTMLTextAreaElement> };

/** A labeled multi-line text input. For a single line, use `Input`. */
function TextareaImpl({
  ref,
  label,
  description,
  error,
  success,
  required,
  disabled,
  className,
  id,
  rows = 4,
  ...rest
}: TextareaProps) {
  const { fieldId, hintKind, hintId, describedBy } = useFormField({
    id,
    error,
    success,
    description,
  });

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
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        required={required}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={["dm-textarea", styles.textarea, className].filter(Boolean).join(" ")}
        {...rest}
      />
    </FieldShell>
  );
}
TextareaImpl.displayName = "Textarea";

export const Textarea = TextareaImpl;
