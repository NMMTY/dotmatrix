import type { ReactNode } from "react";
import styles from "./Kbd.module.scss";

export interface KbdOwnProps {
  children: ReactNode;
  className?: string;
}

/** A single keyboard key, e.g. `<Kbd>⌘</Kbd><Kbd>K</Kbd>`. Always `<kbd>`. */
export function Kbd({ children, className }: KbdOwnProps) {
  return (
    <kbd className={["dm-kbd", styles.kbd, className].filter(Boolean).join(" ")}>{children}</kbd>
  );
}
