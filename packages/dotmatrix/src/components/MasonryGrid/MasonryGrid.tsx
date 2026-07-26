import { Children, type ElementType as ReactElementType, type ReactNode, type Ref } from "react";
import { ElementType, type PolymorphicComponent } from "../../system/ElementType";
import type { SpacingValue } from "../../system/props";
import { resolveStyleProps } from "../../system/resolveStyleProps";
import type { CommonProps, StyleProps } from "../../system/types";
import styles from "./MasonryGrid.module.scss";

export interface MasonryGridOwnProps
  extends Omit<StyleProps, "gap" | "gapX" | "gapY" | "columns">,
    CommonProps {
  /**
   * Upper bound on column count — the browser renders fewer (down to 1)
   * once `minColumnWidth` no longer fits, which is what makes this
   * responsive with no breakpoint props of its own.
   * @default 3
   */
  columns?: number;
  /** The narrowest a column may get before the browser drops one, in px. @default 240 */
  minColumnWidth?: number;
  /**
   * Space between columns AND between stacked items in a column — a plain
   * CSS `gap` only gives the first half, since multi-column has no concept
   * of vertical space between stacked items, so each item also gets this as
   * its own `margin-bottom`.
   * @default "16"
   */
  gap?: SpacingValue;
  children?: ReactNode;
}

type MasonryGridProps = MasonryGridOwnProps & {
  as?: ReactElementType;
  ref?: Ref<Element>;
} & Record<string, unknown>;

/**
 * A Pinterest-style column layout via native CSS multi-column (`column-count`
 * + `column-width`), not JS height measurement — items fill down one column
 * before wrapping to the next, and the browser itself drops columns as the
 * container narrows. The tradeoff for that simplicity: items are read down
 * each column in turn, not left-to-right by row, which is the standard
 * CSS-columns masonry behavior (a JS-measured true masonry would preserve
 * row-reading order, at the cost of a layout-measurement effect).
 */
function MasonryGridImpl({
  as,
  ref,
  columns = 3,
  minColumnWidth = 240,
  gap = "16",
  children,
  ...props
}: MasonryGridProps) {
  const { className, style, rest } = resolveStyleProps(props);
  const gapVar = `var(--dm-space-${gap})`;
  const count = Children.count(children);

  return (
    <ElementType
      as={as}
      ref={ref}
      className={["dm-masonry-grid", styles.grid, className].filter(Boolean).join(" ")}
      style={{
        columnCount: columns,
        columnWidth: `${minColumnWidth}px`,
        columnGap: gapVar,
        ...style,
      }}
      {...rest}
    >
      {Children.map(children, (child, i) => (
        <div
          // Index is fine here: items are positional content passed by the
          // consumer in one shot, not an independently reordered/inserted
          // list — same reasoning as Meter's segment cells.
          // biome-ignore lint/suspicious/noArrayIndexKey: see comment above
          key={i}
          className={styles.item}
          // Only the last DOM item can be targeted this way (an equivalent
          // CSS `:last-child` rule can never fire — this inline style always
          // wins). Other columns keep a trailing gap, an accepted tradeoff
          // of not measuring real column heights in JS.
          style={{ marginBottom: i === count - 1 ? 0 : gapVar }}
        >
          {child}
        </div>
      ))}
    </ElementType>
  );
}
MasonryGridImpl.displayName = "MasonryGrid";

export const MasonryGrid = MasonryGridImpl as PolymorphicComponent<"div", MasonryGridOwnProps>;
