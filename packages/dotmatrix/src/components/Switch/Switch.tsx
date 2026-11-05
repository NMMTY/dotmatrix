"use client";

import { type ComponentPropsWithoutRef, type Ref, useState } from "react";
import { useFormField } from "../../system/useFormField";
import { Row } from "../Row/Row";
import { Text } from "../Text/Text";
import styles from "./Switch.module.scss";

export interface SwitchOwnProps
  extends Omit<ComponentPropsWithoutRef<"input">, "type" | "size" | "className" | "style"> {
  label?: string;
  className?: string;
}

type SwitchProps = SwitchOwnProps & { ref?: Ref<HTMLInputElement> };

/**
 * An on/off toggle: a native `<input type="checkbox">` with `role="switch"`
 * so AT announces "on"/"off" instead of "checked". Overriding the role also
 * drops the browser's native checked-state-to-AT mapping, so `aria-checked`
 * is maintained explicitly — which means tracking checked state here even
 * when uncontrolled, unlike this file set's other native-checkbox controls.
 */
function SwitchImpl({
  ref,
  label,
  checked,
  defaultChecked,
  onChange,
  disabled,
  className,
  id,
  ...rest
}: SwitchProps) {
  const { fieldId } = useFormField({ id });
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;

  return (
    <Row as="label" display="inline-flex" alignItems="center" gap="8" className={styles.row}>
      <Row
        as="span"
        display="inline-flex"
        alignItems="center"
        flexShrink="0"
        className={styles.track}
      >
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          id={fieldId}
          checked={isChecked}
          aria-checked={isChecked}
          disabled={disabled}
          onChange={(event) => {
            if (!isControlled) setInternalChecked(event.target.checked);
            onChange?.(event);
          }}
          className={["dm-switch", styles.input, className].filter(Boolean).join(" ")}
          {...rest}
        />
        <Row as="span" className={styles.thumb} aria-hidden />
      </Row>
      {label && <Text fontSize="s">{label}</Text>}
    </Row>
  );
}
SwitchImpl.displayName = "Switch";

export const Switch = SwitchImpl;
