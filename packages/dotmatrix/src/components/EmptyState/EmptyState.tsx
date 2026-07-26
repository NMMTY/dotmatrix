import type { ReactNode, Ref } from "react";
import { resolveStyleProps } from "../../system/resolveStyleProps";
import type { CommonProps, StyleProps } from "../../system/types";
import { Column } from "../Column/Column";
import { Text } from "../Text/Text";
import styles from "./EmptyState.module.scss";

export interface EmptyStateOwnProps extends StyleProps, CommonProps {
  /** Decorative — this component isn't the one giving it an accessible name, so pass an icon without its own `title`. */
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

type EmptyStateProps = EmptyStateOwnProps & { ref?: Ref<HTMLDivElement> } & Record<string, unknown>;

/** A placeholder for an empty `Table`/`List` — nothing to switch on, unlike `Skeleton`, which is a loading state. */
function EmptyStateImpl({ ref, icon, title, description, action, ...props }: EmptyStateProps) {
  const { className, style, rest } = resolveStyleProps(props);
  return (
    <Column
      ref={ref}
      alignItems="center"
      justifyContent="center"
      gap="8"
      padding="32"
      className={["dm-empty-state", className].filter(Boolean).join(" ")}
      style={style}
      {...rest}
    >
      {icon && (
        <div className={styles.icon} aria-hidden>
          {icon}
        </div>
      )}
      <Text fontSize="s" weight="medium">
        {title}
      </Text>
      {description && (
        <Text fontSize="xs" color="weak" align="center">
          {description}
        </Text>
      )}
      {action && <div className={styles.action}>{action}</div>}
    </Column>
  );
}
EmptyStateImpl.displayName = "EmptyState";
export const EmptyState = EmptyStateImpl;
