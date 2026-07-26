"use client";

import { type ChangeEvent, type ClipboardEvent, type KeyboardEvent, useId, useRef } from "react";
import { useControllableState } from "../../system/useControllableState";
import { useFormField } from "../../system/useFormField";
import { Column } from "../Column/Column";
import fieldHintStyles from "../FieldShell/FieldShell.module.scss";
import { Row } from "../Row/Row";
import { Text } from "../Text/Text";
import styles from "./OTPInput.module.scss";

export interface OTPInputOwnProps {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  /** @default 6 */
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Called once the value reaches `length` characters. */
  onComplete?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const HINT_CLASS = {
  error: fieldHintStyles.error,
  success: fieldHintStyles.success,
  description: fieldHintStyles.description,
};

const NON_DIGIT = /\D/g;

/**
 * A one-time-passcode field: `length` single-character boxes acting as one
 * logical value, not `length` independent inputs — typing a digit advances
 * to the next box, Backspace on an empty box deletes and refocuses the
 * previous one, and pasting a full code splits it across every box at once.
 */
function OTPInputImpl({
  label,
  description,
  error,
  success,
  length = 6,
  value,
  defaultValue,
  onChange,
  onComplete,
  disabled,
  className,
}: OTPInputOwnProps) {
  const { hintKind, hintId, describedBy } = useFormField({ error, success, description });
  const [current, setCurrent] = useControllableState(value, defaultValue ?? "", onChange);
  const boxesRef = useRef<Array<HTMLInputElement | null>>([]);
  const idPrefix = useId();
  const labelId = label ? `${idPrefix}-label` : undefined;
  const hintText = { error, success, description }[hintKind ?? "description"];

  const commit = (chars: string[]) => {
    const next = chars.join("");
    setCurrent(next);
    // `next.length === length` alone is the full completeness check: any
    // gap (leading, trailing, or internal) shortens the joined string, so
    // there's no separate "no blanks" condition to add on top of it —
    // `"12".includes("")` is `true` for every string, which made an
    // earlier `!next.includes("")` clause here permanently unsatisfiable.
    if (next.length === length) onComplete?.(next);
  };

  const charsOf = (v: string) => Array.from({ length }, (_, i) => v[i] ?? "");

  const handleChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const digit = event.target.value.replace(NON_DIGIT, "").slice(-1);
    const chars = charsOf(current);
    chars[index] = digit;
    commit(chars);
    if (digit && index < length - 1) boxesRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !current[index] && index > 0) {
      event.preventDefault();
      const chars = charsOf(current);
      chars[index - 1] = "";
      commit(chars);
      boxesRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (index: number) => (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(NON_DIGIT, "");
    if (!pasted) return;
    event.preventDefault();
    const chars = charsOf(current);
    let i = index;
    for (const digit of pasted) {
      if (i >= length) break;
      chars[i] = digit;
      i++;
    }
    commit(chars);
    boxesRef.current[Math.min(i, length - 1)]?.focus();
  };

  return (
    <Column gap="8" className={className}>
      {label && (
        <Text id={labelId} fontSize="s" weight="medium">
          {label}
        </Text>
      )}
      <Row
        gap="8"
        role="group"
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        aria-invalid={!!error}
      >
        {charsOf(current).map((digit, index) => (
          <input
            // Positional boxes for one logical value, never reordered/inserted independently.
            // biome-ignore lint/suspicious/noArrayIndexKey: see comment above
            key={index}
            ref={(node) => {
              boxesRef.current[index] = node;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            disabled={disabled}
            aria-label={`Digit ${index + 1} of ${length}`}
            onChange={handleChange(index)}
            onKeyDown={handleKeyDown(index)}
            onPaste={handlePaste(index)}
            className={styles.digit}
          />
        ))}
      </Row>
      {hintKind && (
        <Text id={hintId} fontSize="xs" className={HINT_CLASS[hintKind]}>
          {hintText}
        </Text>
      )}
    </Column>
  );
}
OTPInputImpl.displayName = "OTPInput";

export const OTPInput = OTPInputImpl;
