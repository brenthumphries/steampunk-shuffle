// Content packs (docs/plans/monthly/00-monthly-content-plan.md §4.1, design.md §17.1):
// the registry's invariants and the pack-level fields (pool entries gated by year).

import { describe, expect, it } from "vitest";

import { isWithinWindow } from "../../../src/events/eventClock.ts";
import { HALLOWEEN as PACK_HALLOWEEN } from "../../../src/events/packs/halloween.ts";
import { TEST_PACK, testPackRequested } from "../../../src/events/packs/testPack.ts";
import { eventCardPoolIds, HALLOWEEN, SEASONAL_EVENTS, windowsOverlap, type SeasonalEvent } from "../../../src/events/seasonalEvents.ts";

describe("pack registry", () => {
  it("re-exports Hallowe'en from its pack file, unchanged", () => {
    expect(HALLOWEEN).toBe(PACK_HALLOWEEN);
    expect(SEASONAL_EVENTS).toContain(HALLOWEEN);
  });

  it("never loads the test-only pack outside an explicit ?testpack=1 on an allowed build", () => {
    expect(SEASONAL_EVENTS).not.toContain(TEST_PACK);
    expect(testPackRequested("?testpack=1", true)).toBe(true);
    expect(testPackRequested("?testpack=1", false)).toBe(false);
    expect(testPackRequested("?preview=1", true)).toBe(false);
  });

  it("gives every pack a unique id", () => {
    const ids = SEASONAL_EVENTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps no two packs' windows overlapping (one event live at a time)", () => {
    for (let i = 0; i < SEASONAL_EVENTS.length; i++) {
      for (let j = i + 1; j < SEASONAL_EVENTS.length; j++) {
        const [a, b] = [SEASONAL_EVENTS[i]!, SEASONAL_EVENTS[j]!];
        expect(windowsOverlap(a, b), `${a.id} overlaps ${b.id}`).toBe(false);
      }
    }
  });

  it("windowsOverlap really detects an overlap, a shared edge day and a clean gap", () => {
    const at = (s: [number, number], e: [number, number]): SeasonalEvent => ({
      ...TEST_PACK,
      window: { start: { month: s[0], day: s[1] }, end: { month: e[0], day: e[1] } },
    });
    expect(windowsOverlap(at([11, 1], [11, 30]), at([11, 15], [12, 5]))).toBe(true);
    expect(windowsOverlap(at([11, 1], [11, 30]), at([11, 30], [12, 31]))).toBe(true);
    expect(windowsOverlap(at([11, 1], [11, 30]), at([12, 1], [12, 31]))).toBe(false);
  });

  it("keeps every pack's host and gift dates inside its own window", () => {
    for (const event of [...SEASONAL_EVENTS, TEST_PACK]) {
      for (const host of event.hosts ?? []) {
        expect(isWithinWindow(new Date(2026, host.arrives.month - 1, host.arrives.day), event.window.start, event.window.end), `${event.id}/${host.id}`).toBe(true);
      }
      for (const gift of event.arrivalGifts ?? []) {
        if (!gift.from) continue;
        expect(isWithinWindow(new Date(2026, gift.from.month - 1, gift.from.day), event.window.start, event.window.end), `${event.id} gift`).toBe(true);
      }
    }
  });
});

describe("cardPool entries with fromYear (2026 vs 2027)", () => {
  const JAN_11_2026 = new Date(2026, 0, 11);
  const JAN_11_2027 = new Date(2027, 0, 11);

  it("joins the pool only from its year; a plain id is in every year", () => {
    expect(eventCardPoolIds(JAN_11_2026, [TEST_PACK])).toEqual(["test-card-a"]);
    expect(eventCardPoolIds(JAN_11_2027, [TEST_PACK])).toEqual(["test-card-a", "test-card-b"]);
  });

  it("is empty outside the window in either year", () => {
    expect(eventCardPoolIds(new Date(2027, 0, 13), [TEST_PACK])).toEqual([]);
    expect(eventCardPoolIds(new Date(2027, 0, 9), [TEST_PACK])).toEqual([]);
  });

  it("leaves Hallowe'en's pool unchanged", () => {
    expect(eventCardPoolIds(new Date(2026, 9, 15))).toEqual(HALLOWEEN.cardPool);
  });
});
