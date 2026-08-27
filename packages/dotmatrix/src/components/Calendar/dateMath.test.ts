import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  formatMonthYear,
  getMonthGrid,
  getWeekdayLabels,
  isOutOfRange,
  isSameDay,
  startOfDay,
  startOfMonth,
} from "./dateMath";

describe("isSameDay", () => {
  it("is true for the same calendar day regardless of time", () => {
    expect(isSameDay(new Date(2026, 5, 15, 3, 0), new Date(2026, 5, 15, 23, 59))).toBe(true);
  });

  it("is false for a different day", () => {
    expect(isSameDay(new Date(2026, 5, 15), new Date(2026, 5, 16))).toBe(false);
  });
});

describe("startOfDay / startOfMonth", () => {
  it("zeroes out the time", () => {
    const result = startOfDay(new Date(2026, 5, 15, 14, 30));
    expect(result.getHours()).toBe(0);
    expect(result.getDate()).toBe(15);
  });

  it("resets to the 1st", () => {
    expect(startOfMonth(new Date(2026, 5, 15)).getDate()).toBe(1);
  });
});

describe("addDays / addMonths", () => {
  it("rolls over into the next month", () => {
    const result = addDays(new Date(2026, 5, 30), 3);
    expect(result.getMonth()).toBe(6);
    expect(result.getDate()).toBe(3);
  });

  it("clamps to the 1st, not the same day-of-month, to avoid month-length skew", () => {
    // Jan 31 + 1 month should not silently become "Mar 3" the way native
    // Date math would (Feb has no 31st) — addMonths always lands on the 1st.
    const result = addMonths(new Date(2026, 0, 31), 1);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(1);
  });
});

describe("isOutOfRange", () => {
  it("is false with no bounds", () => {
    expect(isOutOfRange(new Date(2026, 5, 15))).toBe(false);
  });

  it("is true before minDate and after maxDate", () => {
    const min = new Date(2026, 5, 10);
    const max = new Date(2026, 5, 20);
    expect(isOutOfRange(new Date(2026, 5, 5), min, max)).toBe(true);
    expect(isOutOfRange(new Date(2026, 5, 25), min, max)).toBe(true);
    expect(isOutOfRange(new Date(2026, 5, 15), min, max)).toBe(false);
  });

  it("treats the bounds themselves as in range", () => {
    const min = new Date(2026, 5, 10);
    const max = new Date(2026, 5, 20);
    expect(isOutOfRange(min, min, max)).toBe(false);
    expect(isOutOfRange(max, min, max)).toBe(false);
  });
});

describe("getMonthGrid", () => {
  it("always returns 42 cells", () => {
    expect(getMonthGrid(new Date(2026, 1, 1), 0)).toHaveLength(42);
    expect(getMonthGrid(new Date(2026, 0, 1), 0)).toHaveLength(42);
  });

  it("starts the grid on the configured weekday", () => {
    const grid = getMonthGrid(new Date(2026, 5, 1), 1); // June 2026, week starts Monday
    expect(grid[0]!.getDay()).toBe(1);
  });

  it("includes every day of the target month", () => {
    const grid = getMonthGrid(new Date(2026, 1, 1), 0); // February 2026 (28 days)
    const daysInMonth = grid.filter((d) => d.getMonth() === 1 && d.getFullYear() === 2026);
    expect(daysInMonth).toHaveLength(28);
  });
});

describe("formatMonthYear", () => {
  it("formats a readable month and year", () => {
    expect(formatMonthYear(new Date(2026, 7, 1), "en-US")).toBe("August 2026");
  });
});

describe("getWeekdayLabels", () => {
  it("returns 7 labels starting from the configured weekday", () => {
    const sundayFirst = getWeekdayLabels(0, "en-US");
    expect(sundayFirst).toHaveLength(7);
    expect(sundayFirst[0]).toMatch(/sun/i);

    const mondayFirst = getWeekdayLabels(1, "en-US");
    expect(mondayFirst[0]).toMatch(/mon/i);
  });
});
