/**
 * Pure, DOM-free date math shared by `Calendar` and `DatePicker` — hand
 * rolled on top of native `Date`/`Intl`, not a date library, since the
 * operations a month-grid calendar actually needs (add days/months, compare
 * calendar days, format a month/weekday label) are small enough that a
 * dependency would cost more in bundle weight and API surface than it saves.
 */

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addDays(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta);
}

export function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function isOutOfRange(date: Date, minDate?: Date, maxDate?: Date): boolean {
  const day = startOfDay(date);
  if (minDate && day.getTime() < startOfDay(minDate).getTime()) return true;
  if (maxDate && day.getTime() > startOfDay(maxDate).getTime()) return true;
  return false;
}

/**
 * A fixed 6-row×7-column (42-cell) grid of dates covering `month`, padded
 * with the trailing days of the previous month and the leading days of the
 * next. Always 42 cells — not just as many as the month needs — so the
 * grid's height never jumps between a 4-week and a 6-week month.
 */
export function getMonthGrid(month: Date, weekStartsOn: number): Date[] {
  const first = startOfMonth(month);
  const firstWeekday = first.getDay();
  const leadingDays = (firstWeekday - weekStartsOn + 7) % 7;
  const gridStart = addDays(first, -leadingDays);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

export function formatMonthYear(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date);
}

/** Weekday abbreviations in calendar column order, starting from `weekStartsOn`. */
export function getWeekdayLabels(weekStartsOn: number, locale?: string): string[] {
  // 2023-01-01 was a Sunday — a fixed known-Sunday reference to rotate from,
  // rather than depending on whatever "today" happens to be.
  const reference = new Date(2023, 0, 1 + weekStartsOn);
  const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
  return Array.from({ length: 7 }, (_, i) => formatter.format(addDays(reference, i)));
}

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
