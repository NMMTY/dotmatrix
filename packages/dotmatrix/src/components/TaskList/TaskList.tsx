import type { ReactNode, Ref } from "react";
import { resolveStyleProps } from "../../system/resolveStyleProps";
import type { CommonProps, StyleProps } from "../../system/types";
import { Column } from "../Column/Column";
import { Icon } from "../Icon/Icon";
import { Row } from "../Row/Row";
import styles from "./TaskList.module.scss";

export type TaskStatus = "pending" | "active" | "done" | "failed";

export interface TaskListItem {
  label: ReactNode;
  status: TaskStatus;
}

export interface TaskListOwnProps extends StyleProps, CommonProps {
  /** Summary line above the items, e.g. `"Working on 2 to-dos"`. */
  title?: ReactNode;
  items: TaskListItem[];
}

type TaskListProps = TaskListOwnProps & { ref?: Ref<HTMLDivElement> } & Record<string, unknown>;

const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: "Pending",
  active: "In progress",
  done: "Done",
  failed: "Failed",
};

function Marker({ status }: { status: TaskStatus }) {
  if (status === "done") return <Icon name="check" size="s" />;
  if (status === "failed") return <Icon name="close" size="s" />;
  return (
    <span
      aria-hidden
      className={status === "active" ? styles.markerActive : styles.markerPending}
    />
  );
}

/** An agent-style checklist: one row per step with a pixel marker for pending, active, done or failed. */
function TaskListImpl({ ref, title, items, ...props }: TaskListProps) {
  const { className, style, rest } = resolveStyleProps(props);
  return (
    <Column
      ref={ref}
      gap="8"
      className={["dm-task-list", styles.base, className].filter(Boolean).join(" ")}
      style={style}
      {...rest}
    >
      {title != null && (
        <Row alignItems="center" gap="8" className={styles.title}>
          <span aria-hidden className={styles.markerActive} />
          {title}
        </Row>
      )}
      <Column as="ul" gap="8" className={styles.list}>
        {items.map((item, i) => (
          <Row
            as="li"
            // biome-ignore lint/suspicious/noArrayIndexKey: items carry no id; the list is positional.
            key={i}
            alignItems="center"
            gap="8"
            data-status={item.status}
            className={styles[`is-${item.status}`]}
          >
            <Row
              as="span"
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              flexShrink="0"
              className={styles.marker}
            >
              <Marker status={item.status} />
            </Row>
            <span className={styles.srOnly}>{STATUS_LABEL[item.status]}: </span>
            <span className={styles.label}>{item.label}</span>
          </Row>
        ))}
      </Column>
    </Column>
  );
}
TaskListImpl.displayName = "TaskList";

export const TaskList = TaskListImpl;
