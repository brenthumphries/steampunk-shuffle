// Seasonal events (seasonal-events-plan.md §2, docs/design.md §17): a
// registry of date-windowed content layers that gate visitor opponents,
// cards, tournaments and pub dressing by the phone's local calendar day.
// Pure data plus pure date predicates, same split as src/pub/opponents.ts
// (registry) vs src/pub/pubState.ts (persistence).
//
// Everything here references opponents, cards and tournaments by *id* and
// never imports them. Every consumer resolves an id against its own
// registry and skips one it can't find, so a later step adds content by
// adding data — this file's shape doesn't change.

import { forEdition, visibleLines, type TaggedLine } from "../edition.ts";
import type { AdventConfig } from "./advent.ts";
import { isOnOrAfter, isWithinWindow, type MonthDay } from "./eventClock.ts";
import { CUNNING_FOLK } from "./packs/cunningFolk.ts";
import { HALLOWEEN } from "./packs/halloween.ts";
import { TEST_PACK, testPackRequested } from "./packs/testPack.ts";

// Content packs (docs/plans/monthly/00-monthly-content-plan.md §4.1): each
// month is one file under ./packs/ exporting a SeasonalEvent. This file keeps
// only the types, the registry and the date predicates.
export { HALLOWEEN, CUNNING_FOLK };

export interface EventVisitor {
  opponentId: string;
  /** First day (inclusive) this visitor is in the pub. They stay until the window ends. */
  arrives: MonthDay;
}

export interface LineOverride {
  opponentId: string;
  line: string;
  /** Dropped from a `VITE_EDITION=public` build (src/edition.ts). */
  giftOnly?: boolean;
  /** Apply only once this visitor has arrived, e.g. Mary Shelley reacting to the Creature. */
  whenArrived?: string;
}

/**
 * A non-playing character who arrives on a date and then stays for good
 * (the Fortune-teller's Booth host). Not an Opponent: hosts never appear in
 * Tonight's Patrons, a tournament field or any opponent list, and the window
 * closing doesn't remove them. See src/events/arrivals.ts.
 */
export interface EventHost {
  id: string;
  arrives: MonthDay;
}

/** A card the player is handed, in a quantity (the November Coven trio is 2 x Hedge Witch + 1 x Witch Bottle). */
export interface GiftCard {
  id: string;
  qty: number;
}

/**
 * Cards granted once per event per calendar year, on the first launch on or
 * after max(window start, `from`) while the event is live, and only in years
 * >= `fromYear` when that is set. `line` is the beer-mat text.
 */
export interface ArrivalGift {
  /** Stable key for `giftsClaimed`; defaults to the gift's index in `arrivalGifts`. */
  id?: string;
  cardIds: GiftCard[];
  from?: MonthDay;
  fromYear?: number;
  line: string;
  giftOnly?: boolean;
}

/** A `cardPool` entry: a plain id, or one that joins the pool only from `fromYear` (Penny for the Guy, 2027). */
export type CardPoolEntry = string | { id: string; fromYear: number };

export interface SeasonalEvent {
  id: string;
  name: string;
  /** Recurs every year, local time, both ends inclusive. */
  window: { start: MonthDay; end: MonthDay };
  visitors: EventVisitor[];
  /** Tournament ids that exist only while this event is live (each narrows its own sub-window). */
  tournaments: string[];
  /** Card ids added to Lost & Found and Pawnbroker rolls only while the event is live. Ownership is permanent. */
  cardPool: CardPoolEntry[];
  /** Total wins before visitors show up; below it, Sir Charles hints instead. */
  minWins: number;
  dressing: {
    /** Taproom background swapped in while live. The hub falls back to the normal one if the asset is missing. */
    taproomArtId?: string;
    /** Sir Charles's line while the event is live but `minWins` hasn't been reached. */
    lockedHint: string;
    /** Added to Sir Charles's own line pool while the event is live. */
    sirCharlesLines: TaggedLine[];
    lineOverrides: LineOverride[];
    /** Weather drawn over the hub's window area while the event is live (design.md §17.3). */
    weather?: "snow";
  };
  /** Non-playing characters who arrive during the window and stay year-round afterwards. */
  hosts?: EventHost[];
  /** Cards handed over on a first launch inside the window (see ArrivalGift). */
  arrivalGifts?: ArrivalGift[];
  /** The month's thread items (plan §5), read from here by the year-round systems. */
  almanackIds?: string[];
  tarotIds?: string[];
  covenCardIds?: string[];
  sleeveId?: string;
  /** A one-time "new this month" beer mat on the first hub visit inside the window, once per event per year. */
  banner?: string;
  /** The Advent Cabinet: numbered doors that open a day at a time (src/events/advent.ts, design.md §17.3). */
  advent?: AdventConfig;
}

/** Every month's pack, in calendar order. One event is live at a time: tests/unit/events/packs.test.ts asserts no two windows overlap. */
const PACKS: readonly SeasonalEvent[] = [HALLOWEEN, CUNNING_FOLK];

function urlSearch(): string {
  try {
    return typeof location === "undefined" ? "" : location.search;
  } catch {
    return "";
  }
}

// The test-only pack (src/events/packs/testPack.ts) joins the registry only
// when the URL asks for it (`?testpack=1`) in a dev build or with `&preview=1`
// — the same gate as the `?now=` dev clock — so the Playwright smoke test can
// exercise the framework and the copy Sara plays never loads it.
export const SEASONAL_EVENTS: readonly SeasonalEvent[] = testPackRequested(urlSearch(), import.meta.env?.DEV || new URLSearchParams(urlSearch()).get("preview") === "1")
  ? [...PACKS, TEST_PACK]
  : PACKS;

export const SEASONAL_EVENTS_BY_ID: ReadonlyMap<string, SeasonalEvent> = new Map(SEASONAL_EVENTS.map((e) => [e.id, e]));

/** Every event whose window contains `date`'s local calendar day. */
export function activeEvents(date: Date, events: readonly SeasonalEvent[] = SEASONAL_EVENTS): SeasonalEvent[] {
  return events.filter((e) => isWithinWindow(date, e.window.start, e.window.end));
}

export function isEventLive(id: string, date: Date): boolean {
  const event = SEASONAL_EVENTS_BY_ID.get(id);
  return event !== undefined && isWithinWindow(date, event.window.start, event.window.end);
}

/** True once `opponentId` has reached its arrival date in a live event. */
export function visitorArrived(event: SeasonalEvent, opponentId: string, date: Date): boolean {
  if (!isWithinWindow(date, event.window.start, event.window.end)) return false;
  const visitor = event.visitors.find((v) => v.opponentId === opponentId);
  return visitor !== undefined && isOnOrAfter(date, visitor.arrives);
}

/** Whether `opponentId` is a visitor who should be in Tonight's Patrons for a player with `totalWins`. */
export function isVisitorInTown(opponentId: string, totalWins: number, date: Date): boolean {
  return activeEvents(date).some((e) => totalWins >= e.minWins && visitorArrived(e, opponentId, date));
}

/**
 * Sir Charles's "win a few hands first" line, shown when a live event has
 * visitors who've already arrived but the player hasn't reached `minWins`.
 */
export function lockedVisitorHint(totalWins: number, date: Date): string | null {
  for (const event of activeEvents(date)) {
    if (totalWins >= event.minWins) continue;
    if (event.visitors.some((v) => visitorArrived(event, v.opponentId, date))) return event.dressing.lockedHint;
  }
  return null;
}

/** The live event's taproom art id, if any. The first live event wins; only one is ever authored at a time. */
export function eventTaproomArtId(date: Date): string | undefined {
  for (const event of activeEvents(date)) {
    if (event.dressing.taproomArtId) return event.dressing.taproomArtId;
  }
  return undefined;
}

/** The live event's weather, if any ("snow"). */
export function eventWeather(date: Date): "snow" | undefined {
  for (const event of activeEvents(date)) {
    if (event.dressing.weather) return event.dressing.weather;
  }
  return undefined;
}

/** Sir Charles's extra lines for today; gift-only lines are dropped in a public build. */
export function eventSirCharlesLines(date: Date): string[] {
  return activeEvents(date).flatMap((e) => visibleLines(e.dressing.sirCharlesLines));
}

/** An event's replacement pickup line for `opponentId`, if one applies today. */
export function eventLineOverride(opponentId: string, date: Date): string | null {
  for (const event of activeEvents(date)) {
    for (const override of forEdition(event.dressing.lineOverrides)) {
      if (override.opponentId !== opponentId) continue;
      if (override.whenArrived && !visitorArrived(event, override.whenArrived, date)) continue;
      return override.line;
    }
  }
  return null;
}

/** Card ids the live events add to Lost & Found / Pawnbroker rolls today. Callers skip ids they can't resolve. */
export function eventCardPoolIds(date: Date, events: readonly SeasonalEvent[] = SEASONAL_EVENTS): string[] {
  const year = date.getFullYear();
  return activeEvents(date, events).flatMap((e) => e.cardPool.flatMap((entry) => (typeof entry === "string" ? [entry] : entry.fromYear <= year ? [entry.id] : [])));
}

/** True when two events' windows share a calendar day (the one-event-at-a-time rule, plan §4.1). */
export function windowsOverlap(a: SeasonalEvent, b: SeasonalEvent): boolean {
  const ord = (md: MonthDay): number => md.month * 100 + md.day;
  return ord(a.window.start) <= ord(b.window.end) && ord(b.window.start) <= ord(a.window.end);
}
