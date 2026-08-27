import type { ElementType as ReactElementType } from "react";
import type { IconName } from "../../icons";
import { Icon } from "../Icon/Icon";
import { Row } from "../Row/Row";
import { Text } from "../Text/Text";

export interface BreadcrumbItem {
  label: string;
  /** Omit for the current page (the last item) — it renders as plain text regardless of whether this is set, since the current page shouldn't link to itself. */
  href?: string;
}

export interface BreadcrumbsOwnProps {
  items: BreadcrumbItem[];
  /** @default "chevron-right" */
  separator?: IconName;
  /** Your router's own link component, e.g. Next's `Link` — passed through to every non-current item, the same `as` convention `Card`/`Button` use for `href`. */
  as?: ReactElementType;
  className?: string;
}

/**
 * A navigation trail. Every item but the last renders as a link; the last
 * is always plain text marked `aria-current="page"` — server-renderable, no
 * hooks, since a breadcrumb trail is derived from the current route, not
 * interactive state.
 */
export function Breadcrumbs({
  items,
  separator = "chevron-right",
  as,
  className,
}: BreadcrumbsOwnProps) {
  return (
    <Row as="nav" aria-label="Breadcrumb" className={className}>
      <Row as="ol" gap="4" alignItems="center" style={{ listStyle: "none" }}>
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: a breadcrumb trail is positional, static content from the current route, not an independently reordered/inserted list — same reasoning as Meter's segment cells.
            <Row key={index} as="li" gap="4" alignItems="center">
              {isCurrent ? (
                <Text fontSize="s" color="strong" aria-current="page">
                  {item.label}
                </Text>
              ) : (
                <Text as={as ?? "a"} href={item.href} fontSize="s" color="medium">
                  {item.label}
                </Text>
              )}
              {!isCurrent && <Icon name={separator} size="s" />}
            </Row>
          );
        })}
      </Row>
    </Row>
  );
}
