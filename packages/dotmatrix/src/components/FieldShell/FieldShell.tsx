import type { ReactNode } from "react";
import type { FieldHintKind } from "../../system/useFormField";
import { Column } from "../Column/Column";
import { Text } from "../Text/Text";
import styles from "./FieldShell.module.scss";

export interface FieldShellOwnProps {
  fieldId: string;
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  hintKind: FieldHintKind;
  hintId: string | undefined;
  required?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

const HINT_CLASS = {
  error: styles.error,
  success: styles.success,
  description: styles.description,
};

/**
 * The label/control/hint shell shared by Input, Textarea, Select, and
 * NumberInput/SearchInput. Not exported from the package — every form
 * control that needs this layout renders it internally, so consumers get a
 * consistent `label`/`description`/`error`/`success` prop set on the
 * control itself rather than a separate wrapper component to learn.
 */
export function FieldShell({
  fieldId,
  label,
  description,
  error,
  success,
  hintKind,
  hintId,
  required,
  disabled,
  children,
}: FieldShellOwnProps) {
  const hintText = { error, success, description }[hintKind ?? "description"];

  return (
    <Column gap="4" width="full">
      {label && (
        <Text
          as="label"
          htmlFor={fieldId}
          fontSize="s"
          weight="medium"
          className={[styles.label, disabled ? styles.labelDisabled : undefined]
            .filter(Boolean)
            .join(" ")}
        >
          {label}
          {required && (
            <span aria-hidden className={styles.required}>
              {" "}
              *
            </span>
          )}
        </Text>
      )}
      {children}
      {hintKind && (
        <Text id={hintId} fontSize="xs" className={HINT_CLASS[hintKind]}>
          {hintText}
        </Text>
      )}
    </Column>
  );
}
