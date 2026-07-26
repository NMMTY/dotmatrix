"use client";

import { type ComponentPropsWithoutRef, type Ref, useState } from "react";
import { useFormField } from "../../system/useFormField";
import { FieldShell } from "../FieldShell/FieldShell";
import { Icon } from "../Icon/Icon";
import styles from "./SearchInput.module.scss";

export interface SearchInputOwnProps
  extends Omit<ComponentPropsWithoutRef<"input">, "type" | "size" | "className" | "style"> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  className?: string;
}

type SearchInputProps = SearchInputOwnProps & { ref?: Ref<HTMLInputElement> };

/** A text input with a search icon and a clear button, shown once there's a value. */
function SearchInputImpl({
  ref,
  label,
  description,
  error,
  success,
  value,
  defaultValue,
  onChange,
  disabled,
  className,
  id,
  ...rest
}: SearchInputProps) {
  const { fieldId, hintKind, hintId, describedBy } = useFormField({
    id,
    error,
    success,
    description,
  });

  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const current = isControlled ? value : internalValue;

  const emitChange = (next: string) => {
    if (!isControlled) setInternalValue(next);
    onChange?.({ target: { value: next } } as React.ChangeEvent<HTMLInputElement>);
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
        <Icon name="search" size="s" className={styles.searchIcon} />
        <input
          ref={ref}
          type="search"
          id={fieldId}
          value={current}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          onChange={(event) => emitChange(event.target.value)}
          className={["dm-search-input", styles.input, className].filter(Boolean).join(" ")}
          {...rest}
        />
        {String(current).length > 0 && !disabled && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => emitChange("")}
            className={styles.clear}
          >
            <Icon name="close" size="s" />
          </button>
        )}
      </span>
    </FieldShell>
  );
}
SearchInputImpl.displayName = "SearchInput";

export const SearchInput = SearchInputImpl;
