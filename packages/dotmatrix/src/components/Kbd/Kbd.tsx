import type { ReactNode } from "react";
import { Row } from "../Row/Row";
import styles from "./Kbd.module.scss";

export interface KbdOwnProps {
  children: ReactNode;
  className?: string;
}

/** A single keyboard key, e.g. `<Kbd>⌘</Kbd><Kbd>K</Kbd>`. Always `<kbd>`. */
export function Kbd({ children, className }: KbdOwnProps) {
  return (
    <Row
      as="kbd"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      className={["dm-kbd", styles.kbd, className].filter(Boolean).join(" ")}
    >
      {children}
    </Row>
  );
}
