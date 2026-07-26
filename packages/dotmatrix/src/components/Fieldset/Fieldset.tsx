import type { ReactNode } from "react";
import type { CommonProps } from "../../system/types";
import { Column } from "../Column/Column";
import { Text } from "../Text/Text";
import styles from "./Fieldset.module.scss";

export interface FieldsetOwnProps extends CommonProps {
  legend?: string;
  description?: string;
  disabled?: boolean;
  children: ReactNode;
}

/**
 * Groups related fields under a shared `<legend>`. A real `<fieldset>`, not
 * a styled `Column` with a heading on top — grouping semantics for
 * assistive tech and `disabled` cascading to every descendant control are
 * exactly what raw tags are for when a layout primitive doesn't cover them.
 */
export function Fieldset({
  legend,
  description,
  disabled,
  children,
  className,
  style,
}: FieldsetOwnProps) {
  return (
    <fieldset
      disabled={disabled}
      className={["dm-fieldset", styles.fieldset, className].filter(Boolean).join(" ")}
      style={style}
    >
      {legend && <legend className={styles.legend}>{legend}</legend>}
      <Column gap="16">
        {description && (
          <Text fontSize="s" color="weak">
            {description}
          </Text>
        )}
        {children}
      </Column>
    </fieldset>
  );
}
