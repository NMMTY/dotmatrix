"use client";

import { useContext } from "react";
import { RadioGroupContext } from "../RadioGroup/RadioGroup";
import { Text } from "../Text/Text";
import styles from "./Radio.module.scss";

export interface RadioOwnProps {
  value: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

/** A single option within a `RadioGroup` — never used standalone, since a
 * radio's whole behavior (mutual exclusivity via a shared `name`) only
 * exists in relation to the group it belongs to. */
export function Radio({ value, label, disabled, className }: RadioOwnProps) {
  const group = useContext(RadioGroupContext);
  if (!group) {
    throw new Error("<Radio> must be rendered inside a <RadioGroup>.");
  }
  const { name, value: groupValue, onChange, disabled: groupDisabled } = group;
  const isDisabled = disabled ?? groupDisabled;
  const id = `${name}-${value}`;

  return (
    <label className={styles.row}>
      <span className={styles.control}>
        <input
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={groupValue === value}
          disabled={isDisabled}
          onChange={() => onChange(value)}
          className={["dm-radio", styles.input, className].filter(Boolean).join(" ")}
        />
        <span className={styles.dot} aria-hidden />
      </span>
      {label && <Text fontSize="s">{label}</Text>}
    </label>
  );
}
