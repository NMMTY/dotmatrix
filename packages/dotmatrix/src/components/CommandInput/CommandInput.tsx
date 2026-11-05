"use client";

import { type KeyboardEvent, type ReactNode, type Ref, useId } from "react";
import { resolveStyleProps } from "../../system/resolveStyleProps";
import type { CommonProps, StyleProps } from "../../system/types";
import { Column } from "../Column/Column";
import { Row } from "../Row/Row";
import styles from "./CommandInput.module.scss";

export interface CommandInputOwnProps extends StyleProps, CommonProps {
  /** Required: the field has no visible label, so it needs an accessible name. */
  label: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Leading glyph before the caret. Defaults to `→`. */
  prompt?: ReactNode;
  /** Left footer line — session context, e.g. `"amelia · 23% context used"`. */
  status?: ReactNode;
  /** Right footer line — key hints, e.g. `"/ for commands"`. */
  hint?: ReactNode;
  onChange?: (value: string) => void;
  /** Fired on Enter (not Shift+Enter) with the current text. */
  onSubmit?: (value: string) => void;
}

type CommandInputProps = CommandInputOwnProps & { ref?: Ref<HTMLInputElement> } & Record<
    string,
    unknown
  >;

/** A terminal-style prompt row — `→` caret, one text field and a footer for context and key hints. */
function CommandInputImpl({
  ref,
  label,
  value,
  defaultValue,
  placeholder,
  disabled,
  prompt = "→",
  status,
  hint,
  onChange,
  onSubmit,
  ...props
}: CommandInputProps) {
  const { className, style, rest } = resolveStyleProps(props);
  const id = useId();

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onSubmit?.(e.currentTarget.value);
    }
  };

  return (
    <Column
      gap="8"
      className={["dm-command-input", styles.base, className].filter(Boolean).join(" ")}
      style={style}
      {...rest}
    >
      <Row as="label" htmlFor={id} alignItems="center" gap="8" className={styles.field}>
        <span aria-hidden className={styles.prompt}>
          {prompt}
        </span>
        <input
          ref={ref}
          id={id}
          type="text"
          aria-label={label}
          className={styles.input}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </Row>
      {(status != null || hint != null) && (
        <Row justifyContent="between" gap="12" className={styles.footer}>
          <span>{status}</span>
          <span>{hint}</span>
        </Row>
      )}
    </Column>
  );
}
CommandInputImpl.displayName = "CommandInput";

export const CommandInput = CommandInputImpl;
