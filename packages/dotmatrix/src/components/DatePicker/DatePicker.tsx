"use client";

import { useState } from "react";
import { useFormField } from "../../system/useFormField";
import { Calendar } from "../Calendar/Calendar";
import { FieldShell } from "../FieldShell/FieldShell";
import { Icon } from "../Icon/Icon";
import { Popover } from "../Popover/Popover";
import { Row } from "../Row/Row";
import { Text } from "../Text/Text";
import styles from "./DatePicker.module.scss";

export interface DatePickerOwnProps {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  /** @default 0 (Sunday) */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** @default "Pick a date" */
  placeholder?: string;
  /** Overrides the trigger's date formatting. @default `Intl.DateTimeFormat` with `dateStyle: "medium"` */
  formatDate?: (date: Date) => string;
  disabled?: boolean;
  className?: string;
}

const defaultFormatDate = (date: Date) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);

/**
 * A trigger button that opens a `Calendar` in a `Popover` — the same
 * FieldShell + Popover-trigger shape as `ColorInput`. Picking a date closes
 * the popover; the button's own accessible name carries the current value
 * (a `<label>`'s native association would otherwise win over a plain
 * button's visible text, announcing just the label with no date).
 */
function DatePickerImpl({
  label,
  description,
  error,
  success,
  value,
  defaultValue = null,
  onChange,
  minDate,
  maxDate,
  weekStartsOn = 0,
  placeholder = "Pick a date",
  formatDate = defaultFormatDate,
  disabled,
  className,
}: DatePickerOwnProps) {
  const { fieldId, hintKind, hintId, describedBy } = useFormField({ error, success, description });
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<Date | null>(defaultValue);
  const current = isControlled ? value : internalValue;
  const [open, setOpen] = useState(false);

  const handleChange = (date: Date) => {
    if (!isControlled) setInternalValue(date);
    onChange?.(date);
    setOpen(false);
  };

  const display = current ? formatDate(current) : placeholder;

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
      <Popover
        open={open}
        onOpenChange={setOpen}
        trigger={
          <Row
            as="button"
            display="inline-flex"
            alignItems="center"
            gap="8"
            type="button"
            id={fieldId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            aria-label={label ? `${label}: ${display}` : display}
            className={[styles.trigger, className].filter(Boolean).join(" ")}
          >
            <Icon name="calendar" size="s" />
            <Text fontSize="s" color={current ? undefined : "weak"}>
              {display}
            </Text>
          </Row>
        }
      >
        <Calendar
          value={current}
          onChange={handleChange}
          defaultMonth={current ?? undefined}
          minDate={minDate}
          maxDate={maxDate}
          weekStartsOn={weekStartsOn}
          disabled={disabled}
        />
      </Popover>
    </FieldShell>
  );
}
DatePickerImpl.displayName = "DatePicker";

export const DatePicker = DatePickerImpl;
