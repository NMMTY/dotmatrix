"use client";

import { type KeyboardEvent, useMemo, useRef, useState } from "react";
import { useControllableState } from "../../system/useControllableState";
import { Column } from "../Column/Column";
import { Grid } from "../Grid/Grid";
import { IconButton } from "../IconButton/IconButton";
import { Row } from "../Row/Row";
import { Text } from "../Text/Text";
import styles from "./Calendar.module.scss";
import {
  addDays,
  addMonths,
  dateKey,
  formatMonthYear,
  getMonthGrid,
  getWeekdayLabels,
  isOutOfRange,
  isSameDay,
  startOfMonth,
} from "./dateMath";

export interface CalendarOwnProps {
  /** The selected date, or `null`/omitted for none. */
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date) => void;
  /** The month currently shown. @default `value` if given, else today */
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  /** Dates outside this range render disabled. */
  minDate?: Date;
  maxDate?: Date;
  /** @default 0 (Sunday) */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  disabled?: boolean;
  className?: string;
}

const ARROW_KEY_DELTA: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
};

/**
 * A month grid, always 42 cells (6 weeks), padded with the adjacent months'
 * leading/trailing days so the grid's height never jumps between months —
 * see {@link getMonthGrid}. One cell is tabbable at a time (roving
 * `tabIndex`, arrow keys move it) rather than all 42 in the natural tab
 * order, the same pattern a native `<select>`'s options get for free.
 */
function CalendarImpl({
  value,
  defaultValue = null,
  onChange,
  month,
  defaultMonth,
  onMonthChange,
  minDate,
  maxDate,
  weekStartsOn = 0,
  disabled,
  className,
}: CalendarOwnProps) {
  const isValueControlled = value !== undefined;
  const [internalSelected, setInternalSelected] = useState<Date | null>(defaultValue);
  const selected = isValueControlled ? value : internalSelected;

  const [visibleMonth, setVisibleMonth] = useControllableState(
    month,
    defaultMonth ?? selected ?? new Date(),
    onMonthChange,
  );

  const grid = useMemo(
    () => getMonthGrid(visibleMonth, weekStartsOn),
    [visibleMonth, weekStartsOn],
  );
  const weekdayLabels = useMemo(() => getWeekdayLabels(weekStartsOn), [weekStartsOn]);
  const gridRef = useRef<HTMLDivElement>(null);

  const tabbableDate = useMemo(() => {
    if (selected && grid.some((d) => isSameDay(d, selected))) return selected;
    const today = new Date();
    if (grid.some((d) => isSameDay(d, today))) return today;
    return (
      grid.find(
        (d) =>
          d.getMonth() === visibleMonth.getMonth() &&
          d.getFullYear() === visibleMonth.getFullYear(),
      ) ?? grid[0]!
    );
  }, [grid, selected, visibleMonth]);

  const commit = (date: Date) => {
    if (disabled || isOutOfRange(date, minDate, maxDate)) return;
    if (!isValueControlled) setInternalSelected(date);
    if (
      date.getMonth() !== visibleMonth.getMonth() ||
      date.getFullYear() !== visibleMonth.getFullYear()
    ) {
      setVisibleMonth(startOfMonth(date));
    }
    onChange?.(date);
  };

  const handleDayKeyDown = (event: KeyboardEvent<HTMLButtonElement>, date: Date) => {
    const delta = ARROW_KEY_DELTA[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    const next = addDays(date, delta);
    // Only moves within the already-rendered 42-cell grid — the rare case of
    // arrowing past its edge is a no-op rather than crossing a month
    // boundary, keeping this a simple roving-tabindex instead of the more
    // elaborate cross-month focus transfer a full ARIA grid would need.
    if (!grid.some((d) => isSameDay(d, next))) return;
    // Landing on a disabled day is a no-op too — a disabled `<button>`
    // silently refuses `.focus()`, so without this check the keyboard user
    // just sees nothing happen with no indication why.
    if (disabled || isOutOfRange(next, minDate, maxDate)) return;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${dateKey(next)}"]`)?.focus();
  };

  return (
    <Column gap="8" className={[styles.calendar, className].filter(Boolean).join(" ")}>
      <Row justifyContent="between" alignItems="center">
        <IconButton
          icon="chevron-left"
          aria-label="Previous month"
          variant="ghost"
          size="s"
          disabled={disabled}
          onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))}
        />
        <Text fontSize="s" weight="medium" className={styles.monthLabel}>
          {formatMonthYear(visibleMonth)}
        </Text>
        <IconButton
          icon="chevron-right"
          aria-label="Next month"
          variant="ghost"
          size="s"
          disabled={disabled}
          onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))}
        />
      </Row>
      <Grid
        ref={gridRef}
        columns="7"
        gap="2"
        role="grid"
        aria-label={formatMonthYear(visibleMonth)}
      >
        {weekdayLabels.map((label) => (
          <Text key={label} fontSize="xs" color="weak" className={styles.weekday} aria-hidden>
            {label}
          </Text>
        ))}
        {grid.map((date) => {
          const inMonth =
            date.getMonth() === visibleMonth.getMonth() &&
            date.getFullYear() === visibleMonth.getFullYear();
          const isSelected = selected ? isSameDay(date, selected) : false;
          const isToday = isSameDay(date, new Date());
          const outOfRange = isOutOfRange(date, minDate, maxDate);
          return (
            <button
              key={dateKey(date)}
              type="button"
              data-date={dateKey(date)}
              disabled={disabled || outOfRange}
              tabIndex={isSameDay(date, tabbableDate) ? 0 : -1}
              aria-current={isToday ? "date" : undefined}
              aria-pressed={isSelected}
              aria-label={date.toDateString()}
              onClick={() => commit(date)}
              onKeyDown={(event) => handleDayKeyDown(event, date)}
              className={[
                styles.day,
                !inMonth ? styles.outside : undefined,
                isToday ? styles.today : undefined,
                isSelected ? styles.selected : undefined,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {date.getDate()}
            </button>
          );
        })}
      </Grid>
    </Column>
  );
}
CalendarImpl.displayName = "Calendar";

export const Calendar = CalendarImpl;
