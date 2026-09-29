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

import { isOnOrAfter, isWithinWindow, type MonthDay } from "./eventClock.ts";

export interface EventVisitor {
  opponentId: string;
  /** First day (inclusive) this visitor is in the pub. They stay until the window ends. */
  arrives: MonthDay;
}

export interface LineOverride {
  opponentId: string;
  line: string;
  /** Apply only once this visitor has arrived, e.g. Mary Shelley reacting to the Creature. */
  whenArrived?: string;
}

export interface SeasonalEvent {
  id: string;
  name: string;
  /** Recurs every year, local time, both ends inclusive. */
  window: { start: MonthDay; end: MonthDay };
  visitors: EventVisitor[];
  /** Tournament ids that exist only while this event is live (each narrows its own sub-window). */
  tournaments: string[];
  /** Card ids added to Lost & Found and Pawnbroker rolls only while the event is live. Ownership is permanent. */
  cardPool: string[];
  /** Total wins before visitors show up; below it, Sir Charles hints instead. */
  minWins: number;
  dressing: {
    /** Taproom background swapped in while live. The hub falls back to the normal one if the asset is missing. */
    taproomArtId?: string;
    /** Sir Charles's line while the event is live but `minWins` hasn't been reached. */
    lockedHint: string;
    /** Added to Sir Charles's own line pool while the event is live. */
    sirCharlesLines: string[];
    lineOverrides: LineOverride[];
  };
}

export const HALLOWEEN: SeasonalEvent = {
  id: "halloween",
  name: "Hallowe'en at the Bridge",
  window: { start: { month: 10, day: 1 }, end: { month: 10, day: 31 } },
  visitors: [
    { opponentId: "mr-griffin", arrives: { month: 10, day: 1 } },
    { opponentId: "clockwork-pharaoh", arrives: { month: 10, day: 1 } },
    { opponentId: "carpathian-count", arrives: { month: 10, day: 15 } },
    { opponentId: "hampstead-wolf", arrives: { month: 10, day: 15 } },
    { opponentId: "galvanic-creature", arrives: { month: 10, day: 15 } },
  ],
  tournaments: ["all-hallows-wake"],
  cardPool: [
    "turnip-lantern",
    "resurrection-man",
    "spirit-photograph",
    "the-witching-hour",
    "grave-robber",
    "night-constable",
    "lamplighter-at-dusk",
    "galvanic-battery",
  ],
  minWins: 3,
  dressing: {
    taproomArtId: "background-the-taproom-halloween",
    lockedHint: "Odd folk on the cellar stairs this month. Win a few hands first, and I'll introduce you.",
    sirCharlesLines: [
      "The cellar door's been busy. I've stopped asking who's knocking.",
      "Turnips, mind. Not pumpkins. I'll not have a foreign vegetable on my bar.",
      "If a chair moves on its own tonight, it's the draught. It is always the draught.",
    ],
    lineOverrides: [{ opponentId: "shelley", line: "Oh. You've met him.", whenArrived: "galvanic-creature" }],
  },
};

export const SEASONAL_EVENTS: readonly SeasonalEvent[] = [HALLOWEEN];

export const SEASONAL_EVENTS_BY_ID: ReadonlyMap<string, SeasonalEvent> = new Map(SEASONAL_EVENTS.map((e) => [e.id, e]));

/** Every event whose window contains `date`'s local calendar day. */
export function activeEvents(date: Date): SeasonalEvent[] {
  return SEASONAL_EVENTS.filter((e) => isWithinWindow(date, e.window.start, e.window.end));
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

export function eventSirCharlesLines(date: Date): string[] {
  return activeEvents(date).flatMap((e) => e.dressing.sirCharlesLines);
}

/** An event's replacement pickup line for `opponentId`, if one applies today. */
export function eventLineOverride(opponentId: string, date: Date): string | null {
  for (const event of activeEvents(date)) {
    for (const override of event.dressing.lineOverrides) {
      if (override.opponentId !== opponentId) continue;
      if (override.whenArrived && !visitorArrived(event, override.whenArrived, date)) continue;
      return override.line;
    }
  }
  return null;
}

/** Card ids the live events add to Lost & Found / Pawnbroker rolls today. Callers skip ids they can't resolve. */
export function eventCardPoolIds(date: Date): string[] {
  return activeEvents(date).flatMap((e) => e.cardPool);
}
