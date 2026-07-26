import type { ReactNode, Ref } from "react";
import { resolveStyleProps } from "../../system/resolveStyleProps";
import type { CommonProps, StyleProps } from "../../system/types";
import styles from "./Chip.module.scss";

interface ChipBaseProps extends StyleProps, CommonProps {
  children?: ReactNode;
}

// `removeLabel` is required whenever `onRemove` is passed — a discriminated
// union rather than an optional prop with a generic fallback ("Remove"),
// because a generic label is exactly the kind of silently-shipped a11y gap
// this session already found once (see IconButton's `aria-label`).
export type ChipOwnProps = ChipBaseProps &
  ({ onRemove?: undefined; removeLabel?: never } | { onRemove: () => void; removeLabel: string });

type ChipProps = ChipOwnProps & { ref?: Ref<HTMLSpanElement> } & Record<string, unknown>;

/** A removable tag. For a non-removable label, use `Badge` instead. */
function ChipImpl({ ref, children, onRemove, removeLabel, ...props }: ChipProps) {
  const { className, style, rest } = resolveStyleProps(props);
  return (
    <span
      ref={ref}
      className={["dm-chip", styles.base, className].filter(Boolean).join(" ")}
      style={style}
      {...rest}
    >
      {children}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={removeLabel} className={styles.remove}>
          {/* biome-ignore lint/a11y/noSvgWithoutTitle: decorative — the button's own aria-label is the accessible name. */}
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
            <path
              d="M1 1L9 9M9 1L1 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="square"
            />
          </svg>
        </button>
      )}
    </span>
  );
}
ChipImpl.displayName = "Chip";

export const Chip = ChipImpl;
