// `dedicationShouldShow` (seasonal-events-plan.md §1, option b) is not wired
// into src/main.ts yet — waiting on Brent's call. These pin its behaviour so
// adopting it is a one-line change.

import { describe, expect, it } from "vitest";

import { dedicationShouldShow } from "../../../src/player/playerState.ts";

describe("dedicationShouldShow (option b, not yet wired in)", () => {
  it("never shows once it's been seen", () => {
    expect(dedicationShouldShow(new Date(2026, 9, 30), true)).toBe(false);
    expect(dedicationShouldShow(new Date(2026, 11, 1), true)).toBe(false);
  });

  it("holds it back on a first launch between Sep 1 and Oct 29", () => {
    for (const date of [new Date(2026, 8, 1), new Date(2026, 8, 30), new Date(2026, 9, 1), new Date(2026, 9, 15), new Date(2026, 9, 29)]) {
      expect(dedicationShouldShow(date, false), date.toDateString()).toBe(false);
    }
  });

  it("shows it on her first launch on or after Oct 30", () => {
    expect(dedicationShouldShow(new Date(2026, 9, 30), false)).toBe(true);
    expect(dedicationShouldShow(new Date(2026, 9, 31), false)).toBe(true);
    expect(dedicationShouldShow(new Date(2026, 10, 12), false)).toBe(true);
  });

  it("does not hold a first launch earlier in the year or in the new year until next October", () => {
    expect(dedicationShouldShow(new Date(2026, 7, 31), false)).toBe(true);
    expect(dedicationShouldShow(new Date(2027, 1, 14), false)).toBe(true);
    expect(dedicationShouldShow(new Date(2027, 5, 1), false)).toBe(true);
  });
});
