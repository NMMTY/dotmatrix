import type { ReactNode, Ref } from "react";
import { resolveStyleProps } from "../../system/resolveStyleProps";
import type { CommonProps, StyleProps } from "../../system/types";
import { Column } from "../Column/Column";
import { Row } from "../Row/Row";
import { Text } from "../Text/Text";
import styles from "./List.module.scss";

export interface ListOwnProps extends StyleProps, CommonProps {
  children?: ReactNode;
}

type ListProps = ListOwnProps & { ref?: Ref<HTMLUListElement> } & Record<string, unknown>;

/**
 * A vertical list of records — no columns/header, unlike `Table`. Renders as
 * a real `<ul>`; `role="list"` is required alongside it because Safari/
 * VoiceOver drop the implicit list semantics from any `<ul>` that has
 * `list-style: none` (which this does, via the global reset), a well-known
 * gap between "looks like a list" and "announces as one."
 */
function ListImpl({ ref, ...props }: ListProps) {
  const { className, style, rest } = resolveStyleProps(props);
  return (
    <ul
      ref={ref}
      // biome-ignore lint/a11y/noRedundantRoles: not redundant in practice — Safari/VoiceOver drop the implicit list role from a `list-style: none` <ul> (which the global reset applies to every <ul>), so this restores it explicitly.
      role="list"
      className={["dm-list", styles.list, className].filter(Boolean).join(" ")}
      style={style}
      {...rest}
    />
  );
}
ListImpl.displayName = "List";
export const List = ListImpl;

export interface ListItemOwnProps {
  /** Omit together with `description`/`action` to render fully custom `children` instead. */
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
}

function ListItemImpl({ title, description, action, children }: ListItemOwnProps) {
  return (
    <li className={styles.item}>
      {title !== undefined ? (
        <Row alignItems="center" justifyContent="between" gap="16">
          <Column gap="2" minWidth="0">
            <Text fontSize="s" weight="medium" truncate>
              {title}
            </Text>
            {description !== undefined && (
              <Text fontSize="xs" color="weak">
                {description}
              </Text>
            )}
          </Column>
          {action !== undefined && (
            <Row gap="8" alignItems="center" flexShrink="0">
              {action}
            </Row>
          )}
        </Row>
      ) : (
        children
      )}
    </li>
  );
}
ListItemImpl.displayName = "ListItem";
export const ListItem = ListItemImpl;
