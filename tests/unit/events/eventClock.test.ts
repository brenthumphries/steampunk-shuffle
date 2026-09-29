// The dev clock and calendar-window helpers (seasonal-events-plan.md §2
// rules 1 and 6).

import { describe, expect, it } from "vitest";

import { isOnOrAfter, isWithinWindow, monthDayOf, parseNowOverride, today } from "../../../src/events/eventClock.ts";

const OCT_1 = { month: 10, day: 1 };
const OCT_31 = { month: 10, day: 31 };

describe("monthDayOf", () => {
  it("reports the month 1-based, as a person writes a date", () => {
    expect(monthDayOf(new Date(2026, 9, 1))).toEqual({ month: 10, day: 1 });
    expect(monthDayOf(new Date(2026, 0, 31))).toEqual({ month: 1, day: 31 });
  });
});

describe("isWithinWindow", () => {
  it("is inclusive at both ends and exclusive just outside, in any year", () => {
    for (const year of [2026, 2027, 2031]) {
      expect(isWithinWindow(new Date(year, 8, 30), OCT_1, OCT_31)).toBe(false);
      expect(isWithinWindow(new Date(year, 9, 1), OCT_1, OCT_31)).toBe(true);
      expect(isWithinWindow(new Date(year, 9, 31), OCT_1, OCT_31)).toBe(true);
      expect(isWithinWindow(new Date(year, 10, 1), OCT_1, OCT_31)).toBe(false);
    }
  });

  it("goes by the local calendar day, not the time of day", () => {
    expect(isWithinWindow(new Date(2026, 9, 1, 0, 0, 0), OCT_1, OCT_31)).toBe(true);
    expect(isWithinWindow(new Date(2026, 9, 31, 23, 59, 59), OCT_1, OCT_31)).toBe(true);
    expect(isWithinWindow(new Date(2026, 8, 30, 23, 59, 59), OCT_1, OCT_31)).toBe(false);
  });
});

describe("isOnOrAfter", () => {
  it("is true on the day itself and after, false before", () => {
    const oct15 = { month: 10, day: 15 };
    expect(isOnOrAfter(new Date(2026, 9, 14), oct15)).toBe(false);
    expect(isOnOrAfter(new Date(2026, 9, 15), oct15)).toBe(true);
    expect(isOnOrAfter(new Date(2026, 9, 16), oct15)).toBe(true);
  });
});

describe("parseNowOverride", () => {
  it("reads ?now=YYYY-MM-DD as local noon of that day when permitted", () => {
    const parsed = parseNowOverride("?now=2026-10-15", true);
    expect(parsed).not.toBeNull();
    expect([parsed!.getFullYear(), parsed!.getMonth(), parsed!.getDate(), parsed!.getHours()]).toEqual([2026, 9, 15, 12]);
  });

  it("ignores the override entirely when not permitted", () => {
    expect(parseNowOverride("?now=2026-10-15", false)).toBeNull();
  });

  it("ignores a missing, malformed or impossible date", () => {
    expect(parseNowOverride("", true)).toBeNull();
    expect(parseNowOverride("?now=", true)).toBeNull();
    expect(parseNowOverride("?now=tomorrow", true)).toBeNull();
    expect(parseNowOverride("?now=2026-1-5", true)).toBeNull();
    expect(parseNowOverride("?now=2026-02-31", true)).toBeNull();
    expect(parseNowOverride("?now=2026-13-01", true)).toBeNull();
  });

  it("works alongside other query parameters", () => {
    expect(parseNowOverride("?preview=1&now=2026-10-22", true)?.getDate()).toBe(22);
  });
});

describe("today", () => {
  it("returns a real Date when no override is present", () => {
    const before = Date.now();
    const value = today().getTime();
    expect(value).toBeGreaterThanOrEqual(before - 1000);
    expect(value).toBeLessThanOrEqual(Date.now() + 1000);
  });
});
