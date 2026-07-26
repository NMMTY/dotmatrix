"use client";

import { useControllableState } from "../../system/useControllableState";
import { useFormField } from "../../system/useFormField";
import { Dropdown, DropdownItem } from "../Dropdown/Dropdown";
import { FieldShell } from "../FieldShell/FieldShell";
import { Icon } from "../Icon/Icon";
import { Row } from "../Row/Row";
import styles from "./Select.module.scss";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectOwnProps {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  /** @default "m" */
  size?: "s" | "m" | "l";
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Shown on the trigger when nothing is selected yet. */
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * A listbox-style select built on `Dropdown` — an `options` array, not
 * `<option>` children, so it's no longer a native `<select>` underneath.
 * That trades the free native behavior (real `<select>`/`<option>`, "menu"/
 * "menuitem" ARIA roles rather than the more semantically exact "listbox"/
 * "option") for the same look, keyboard nav, and positioning every other
 * `Dropdown`-based menu in this system already has — `ContextMenu` makes
 * the identical trade for the same reason.
 */
function SelectImpl({
  label,
  description,
  error,
  success,
  size = "m",
  options,
  value,
  defaultValue,
  onChange,
  placeholder = "Select…",
  disabled,
  className,
}: SelectOwnProps) {
  const { fieldId, hintKind, hintId, describedBy } = useFormField({
    error,
    success,
    description,
  });
  const [current, setCurrent] = useControllableState(value, defaultValue ?? "", onChange);
  const selected = options.find((option) => option.value === current);

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
      <Dropdown
        trigger={
          // `aria-label` overrides FieldShell's own `<label for={fieldId}>`,
          // which would otherwise win the accessible-name computation over
          // this button's visible content entirely (native label
          // association beats a button's own text) — announcing just the
          // field label with no current selection at all. Same fix as
          // ColorInput's trigger, same root cause.
          <button
            type="button"
            id={fieldId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            aria-label={`${label ? `${label}: ` : ""}${selected?.label ?? placeholder}`}
            className={["dm-select", styles.trigger, styles[size], className]
              .filter(Boolean)
              .join(" ")}
          >
            <span
              className={[styles.label, selected ? undefined : styles.placeholder]
                .filter(Boolean)
                .join(" ")}
            >
              {selected?.label ?? placeholder}
            </span>
            <Icon name="chevron-down" size="s" className={styles.chevron} />
          </button>
        }
      >
        {options.map((option) => (
          <DropdownItem
            key={option.value}
            disabled={option.disabled}
            onSelect={() => setCurrent(option.value)}
          >
            <Row gap="8" alignItems="center" justifyContent="between" width="full">
              <span>{option.label}</span>
              {option.value === current && (
                <Icon name="check" size="s" className={styles.checkmark} />
              )}
            </Row>
          </DropdownItem>
        ))}
      </Dropdown>
    </FieldShell>
  );
}
SelectImpl.displayName = "Select";

export const Select = SelectImpl;
