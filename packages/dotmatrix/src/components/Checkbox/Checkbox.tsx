"use client";

import { type ComponentPropsWithoutRef, type Ref, useEffect, useRef } from "react";
import { useFormField } from "../../system/useFormField";
import { Icon } from "../Icon/Icon";
import { Row } from "../Row/Row";
import { Text } from "../Text/Text";
import styles from "./Checkbox.module.scss";

export interface CheckboxOwnProps
  extends Omit<ComponentPropsWithoutRef<"input">, "type" | "size" | "className" | "style"> {
  label?: string;
  /** Visually distinct from checked/unchecked — e.g. a "select all" that's partially selected. */
  indeterminate?: boolean;
  className?: string;
}

type CheckboxProps = CheckboxOwnProps & { ref?: Ref<HTMLInputElement> };

/** A single checkbox. For a related group of radio options, use `RadioGroup`. */
function CheckboxImpl({
  ref,
  label,
  indeterminate = false,
  disabled,
  className,
  id,
  ...rest
}: CheckboxProps) {
  const { fieldId } = useFormField({ id });
  const internalRef = useRef<HTMLInputElement>(null);

  // `indeterminate` is a DOM property, not an HTML attribute — there's no
  // JSX prop for it, so it has to be set imperatively.
  useEffect(() => {
    if (internalRef.current) internalRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <Row as="label" display="inline-flex" alignItems="center" gap="8" className={styles.row}>
      <Row as="span" display="inline-flex" flexShrink="0" className={styles.control}>
        <input
          ref={(node) => {
            internalRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          type="checkbox"
          id={fieldId}
          disabled={disabled}
          className={["dm-checkbox", styles.input, className].filter(Boolean).join(" ")}
          {...rest}
        />
        <Row
          as="span"
          alignItems="center"
          justifyContent="center"
          className={styles.mark}
          aria-hidden
        >
          <Icon name={indeterminate ? "minus" : "check"} size="s" />
        </Row>
      </Row>
      {label && <Text fontSize="s">{label}</Text>}
    </Row>
  );
}
CheckboxImpl.displayName = "Checkbox";

export const Checkbox = CheckboxImpl;
