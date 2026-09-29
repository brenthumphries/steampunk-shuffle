// The one place "today" comes from for anything that gates gameplay on the
// calendar (seasonal-events-plan.md §2, rules 1 and 6): event windows,
// legends-in-town, Lost & Found, the Pawnbroker, the daily bonus. Everything
// else calls `today()` instead of `new Date()`, so a dev clock override
// reaches all of it at once.
//
// The override is `?now=YYYY-MM-DD`. It is honoured in dev builds, and in a
// deployed build only when the URL also carries `?preview=1` — so Brent can
// check any date on his phone, and the copy she plays never reads it unless
// someone types both parameters on purpose.

/** A recurring calendar date. `month` is 1-12, as people write dates, not `Date#getMonth()`'s 0-11. */
export interface MonthDay {
  month: number;
  day: number;
}

export function monthDayOf(date: Date): MonthDay {
  return { month: date.getMonth() + 1, day: date.getDate() };
}

function ordinal(md: MonthDay): number {
  return md.month * 100 + md.day;
}

/** True when `date`'s local calendar day falls on or after `md` in its own year. */
export function isOnOrAfter(date: Date, md: MonthDay): boolean {
  return ordinal(monthDayOf(date)) >= ordinal(md);
}

/**
 * True when `date`'s local calendar day is inside [start, end], both ends
 * inclusive. A window can't span New Year (start must not be after end) —
 * nothing here needs it, and `seasonalEvents.test.ts` pins every registered
 * window to that.
 */
export function isWithinWindow(date: Date, start: MonthDay, end: MonthDay): boolean {
  const today = ordinal(monthDayOf(date));
  return today >= ordinal(start) && today <= ordinal(end);
}

/**
 * Parses `?now=YYYY-MM-DD` out of a URL query string into local noon of that
 * day, or null if the override is absent, malformed, not a real calendar
 * date, or not permitted. Pure so it can be unit-tested without a browser.
 */
export function parseNowOverride(search: string, allowed: boolean): Date | null {
  if (!allowed) return null;
  const raw = new URLSearchParams(search).get("now");
  if (!raw) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day, 12, 0, 0);
  // `new Date(2026, 1, 31)` rolls over to March 3 rather than failing.
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

/** The current date for gameplay decisions — real time, unless the dev clock override applies. */
export function today(): Date {
  try {
    const search = typeof location === "undefined" ? "" : location.search;
    const allowed = import.meta.env.DEV || new URLSearchParams(search).get("preview") === "1";
    return parseNowOverride(search, allowed) ?? new Date();
  } catch {
    return new Date();
  }
}
