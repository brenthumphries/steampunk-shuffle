// The seasonal-event registry and its date predicates
// (seasonal-events-plan.md §2-§3, docs/design.md §17).

import { describe, expect, it } from "vitest";

import { isWithinWindow } from "../../../src/events/eventClock.ts";
import {
  activeEvents,
  eventCardPoolIds,
  eventLineOverride,
  eventSirCharlesLines,
  eventTaproomArtId,
  HALLOWEEN,
  isEventLive,
  isVisitorInTown,
  lockedVisitorHint,
  SEASONAL_EVENTS,
  visitorArrived,
} from "../../../src/events/seasonalEvents.ts";

const SEP_30 = new Date(2026, 8, 30);
const OCT_1 = new Date(2026, 9, 1);
const OCT_14 = new Date(2026, 9, 14);
const OCT_15 = new Date(2026, 9, 15);
const OCT_31 = new Date(2026, 9, 31);
const NOV_1 = new Date(2026, 10, 1);

describe("registry invariants", () => {
  it("gives every event a unique id and a window that doesn't span New Year", () => {
    const ids = SEASONAL_EVENTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const event of SEASONAL_EVENTS) {
      const { start, end } = event.window;
      expect(start.month * 100 + start.day, event.id).toBeLessThanOrEqual(end.month * 100 + end.day);
    }
  });

  it("schedules every visitor's arrival inside its event's window", () => {
    for (const event of SEASONAL_EVENTS) {
      for (const visitor of event.visitors) {
        const arrival = new Date(2026, visitor.arrives.month - 1, visitor.arrives.day);
        expect(isWithinWindow(arrival, event.window.start, event.window.end), `${event.id}/${visitor.opponentId}`).toBe(true);
      }
    }
  });
});

describe("activeEvents / isEventLive (Hallowe'en window, Oct 1 - Oct 31 local)", () => {
  it("is off on Sep 30, on for Oct 1 through Oct 31, and off again on Nov 1", () => {
    expect(isEventLive("halloween", SEP_30)).toBe(false);
    expect(isEventLive("halloween", OCT_1)).toBe(true);
    expect(isEventLive("halloween", OCT_15)).toBe(true);
    expect(isEventLive("halloween", OCT_31)).toBe(true);
    expect(isEventLive("halloween", NOV_1)).toBe(false);
  });

  it("lists Hallowe'en exactly while it's live", () => {
    expect(activeEvents(SEP_30)).toEqual([]);
    expect(activeEvents(OCT_15)).toEqual([HALLOWEEN]);
    expect(activeEvents(NOV_1)).toEqual([]);
  });

  it("recurs every year", () => {
    expect(isEventLive("halloween", new Date(2027, 9, 12))).toBe(true);
  });

  it("is false for an id that isn't registered", () => {
    expect(isEventLive("no-such-event", OCT_15)).toBe(false);
  });
});

describe("visitor arrival and gating", () => {
  it("has Wave 1's visitors arrive on Oct 1, not before", () => {
    expect(visitorArrived(HALLOWEEN, "mr-griffin", SEP_30)).toBe(false);
    expect(visitorArrived(HALLOWEEN, "mr-griffin", OCT_1)).toBe(true);
    expect(visitorArrived(HALLOWEEN, "clockwork-pharaoh", OCT_1)).toBe(true);
  });

  it("has Wave 2's three visitors arrive on Oct 15, not before", () => {
    for (const id of ["carpathian-count", "hampstead-wolf", "galvanic-creature"]) {
      expect(visitorArrived(HALLOWEEN, id, OCT_14), id).toBe(false);
      expect(visitorArrived(HALLOWEEN, id, OCT_15), id).toBe(true);
      expect(visitorArrived(HALLOWEEN, id, OCT_31), id).toBe(true);
    }
  });

  it("never treats a stranger, or a visitor after the window closes, as arrived", () => {
    expect(visitorArrived(HALLOWEEN, "mudd", OCT_15)).toBe(false);
    expect(visitorArrived(HALLOWEEN, "mr-griffin", NOV_1)).toBe(false);
  });

  it("shows a visitor only from their arrival date and only at 3+ wins", () => {
    expect(isVisitorInTown("mr-griffin", 3, SEP_30)).toBe(false);
    expect(isVisitorInTown("mr-griffin", 2, OCT_1)).toBe(false);
    expect(isVisitorInTown("mr-griffin", 3, OCT_1)).toBe(true);
    expect(isVisitorInTown("mr-griffin", 3, OCT_31)).toBe(true);
    expect(isVisitorInTown("mr-griffin", 30, NOV_1)).toBe(false);
  });
});

describe("lockedVisitorHint", () => {
  it("gives Sir Charles's hint only while the event is live, visitors have arrived, and wins are below the threshold", () => {
    expect(lockedVisitorHint(0, OCT_1)).toBe(HALLOWEEN.dressing.lockedHint);
    expect(lockedVisitorHint(2, OCT_31)).toBe(HALLOWEEN.dressing.lockedHint);
    expect(lockedVisitorHint(3, OCT_1)).toBeNull();
    expect(lockedVisitorHint(0, SEP_30)).toBeNull();
    expect(lockedVisitorHint(0, NOV_1)).toBeNull();
  });
});

describe("dressing", () => {
  it("swaps in the event's taproom art only while live", () => {
    expect(eventTaproomArtId(OCT_15)).toBe("background-the-taproom-halloween");
    expect(eventTaproomArtId(SEP_30)).toBeUndefined();
    expect(eventTaproomArtId(NOV_1)).toBeUndefined();
  });

  it("adds the event's Sir Charles lines only while live", () => {
    expect(eventSirCharlesLines(OCT_15)).toEqual(HALLOWEEN.dressing.sirCharlesLines);
    expect(eventSirCharlesLines(NOV_1)).toEqual([]);
  });

  it("applies Mary Shelley's line override only while live and only once the Galvanic Creature has arrived", () => {
    expect(eventLineOverride("shelley", OCT_14)).toBeNull();
    expect(eventLineOverride("shelley", OCT_15)).toBe("Oh. You've met him.");
    expect(eventLineOverride("shelley", OCT_31)).toBe("Oh. You've met him.");
    expect(eventLineOverride("shelley", NOV_1)).toBeNull();
    expect(eventLineOverride("mudd", OCT_15)).toBeNull();
  });
});

describe("eventCardPoolIds", () => {
  it("lists the event's card pool only while live", () => {
    expect(eventCardPoolIds(OCT_15)).toEqual(HALLOWEEN.cardPool);
    expect(eventCardPoolIds(SEP_30)).toEqual([]);
    expect(eventCardPoolIds(NOV_1)).toEqual([]);
  });
});
