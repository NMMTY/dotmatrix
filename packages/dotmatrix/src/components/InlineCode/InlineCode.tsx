import type { ReactNode } from "react";
import styles from "./InlineCode.module.scss";

export interface InlineCodeOwnProps {
  children: ReactNode;
  className?: string;
}

/** Inline code, e.g. "run `<InlineCode>pnpm build</InlineCode>`". Always `<code>`. */
export function InlineCode({ children, className }: InlineCodeOwnProps) {
  return (
    <code className={["dm-inline-code", styles.code, className].filter(Boolean).join(" ")}>
      {children}
    </code>
  );
}
