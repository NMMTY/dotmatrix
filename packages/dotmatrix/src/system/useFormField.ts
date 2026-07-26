"use client";

import { useId } from "react";

export type FieldHintKind = "error" | "success" | "description" | undefined;

export interface FormFieldOptions {
  id?: string;
  error?: string;
  success?: string;
  description?: string;
}

export interface FormFieldIds {
  fieldId: string;
  /** Which hint is showing — error beats success beats description, never more than one at once. */
  hintKind: FieldHintKind;
  hintId: string | undefined;
  /** Same value as `hintId`, named for where it's actually used (`aria-describedby`). */
  describedBy: string | undefined;
}

/**
 * Generates the id and `aria-describedby` wiring shared by every form
 * control. Surfaces only ONE hint at a time (error, else success, else
 * description) rather than combining them, so the id here always matches
 * what the shell actually renders — never a broken reference to a
 * description hidden in favor of an error.
 */
export function useFormField({ id, error, success, description }: FormFieldOptions): FormFieldIds {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintKind: FieldHintKind = error
    ? "error"
    : success
      ? "success"
      : description
        ? "description"
        : undefined;
  const hintId = hintKind ? `${fieldId}-hint` : undefined;

  return { fieldId, hintKind, hintId, describedBy: hintId };
}
