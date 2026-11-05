import type { ReactNode } from "react";
import type { StyleProps } from "../../system/types";
import { Row } from "../Row/Row";
import styles from "./Kbd.module.scss";

export interface KbdOwnProps extends StyleProps {
  children: ReactNode;
  className?: string;
}

/** A single keyboard key, e.g. `<Kbd>⌘</Kbd><Kbd>K</Kbd>`. Always `<kbd>`. */
export function Kbd({ children, className, ...rest }: KbdOwnProps) {
  return (
    <Row
      as="kbd"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      {...rest}
      className={["dm-kbd", styles.kbd, className].filter(Boolean).join(" ")}
    >
      {children}
    </Row>
  );
}
