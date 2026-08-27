"use client";

import { useControllableState } from "../../system/useControllableState";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { Row } from "../Row/Row";
import { Text } from "../Text/Text";

export type PaginationRangeItem = number | "ellipsis-start" | "ellipsis-end";

/**
 * Always includes the first and last page and `siblingCount` pages either
 * side of `page`, collapsing whatever's left into one ellipsis per side —
 * the standard shape (`1 … 4 5 [6] 7 8 … 20`), not literally every page
 * number, once the total exceeds what fits.
 */
export function getPaginationRange(
  page: number,
  totalPages: number,
  siblingCount = 1,
): PaginationRangeItem[] {
  const totalVisibleNumbers = siblingCount * 2 + 5; // first + last + current + siblings + room for both ellipsis slots
  if (totalPages <= totalVisibleNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(page - siblingCount, 1);
  const rightSibling = Math.min(page + siblingCount, totalPages);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRangeLength = 3 + siblingCount * 2;
    const leftRange = Array.from({ length: leftRangeLength }, (_, i) => i + 1);
    return [...leftRange, "ellipsis-end", totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRangeLength = 3 + siblingCount * 2;
    const rightRange = Array.from(
      { length: rightRangeLength },
      (_, i) => totalPages - rightRangeLength + 1 + i,
    );
    return [1, "ellipsis-start", ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSibling - leftSibling + 1 },
    (_, i) => leftSibling + i,
  );
  return [1, "ellipsis-start", ...middleRange, "ellipsis-end", totalPages];
}

export interface PaginationOwnProps {
  /** 1-indexed. Omit along with `onChange` for uncontrolled use. */
  page?: number;
  /** @default 1 */
  defaultPage?: number;
  totalPages: number;
  onChange?: (page: number) => void;
  /** Page numbers shown on either side of the current page, not counting the always-shown first/last. @default 1 */
  siblingCount?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * Previous/next controls plus a collapsing range of page numbers — see
 * {@link getPaginationRange} for how the range collapses. Controlled if
 * `page` is given, uncontrolled otherwise, the same hybrid every other
 * field in this system uses.
 */
export function Pagination({
  page,
  defaultPage,
  totalPages,
  onChange,
  siblingCount = 1,
  disabled,
  className,
}: PaginationOwnProps) {
  const [current, setCurrent] = useControllableState(page, defaultPage ?? 1, onChange);
  const range = getPaginationRange(current, totalPages, siblingCount);

  return (
    <Row as="nav" aria-label="Pagination" gap="4" alignItems="center" className={className}>
      <IconButton
        icon="chevron-left"
        aria-label="Previous page"
        variant="ghost"
        size="s"
        disabled={disabled || current <= 1}
        onClick={() => setCurrent(current - 1)}
      />
      {range.map((item) =>
        typeof item === "number" ? (
          <Button
            key={item}
            size="s"
            variant={item === current ? "solid" : "ghost"}
            disabled={disabled}
            aria-current={item === current ? "page" : undefined}
            onClick={() => setCurrent(item)}
          >
            {item}
          </Button>
        ) : (
          <Text key={item} color="weak" fontSize="s" aria-hidden style={{ paddingInline: 4 }}>
            …
          </Text>
        ),
      )}
      <IconButton
        icon="chevron-right"
        aria-label="Next page"
        variant="ghost"
        size="s"
        disabled={disabled || current >= totalPages}
        onClick={() => setCurrent(current + 1)}
      />
    </Row>
  );
}
