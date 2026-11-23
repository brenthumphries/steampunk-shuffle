// Earning a sleeve (design.md §17.5): a SeasonalEvent with a `sleeveId` hands
// that sleeve over once the player has `SLEEVE_WINS_REQUIRED` wins dated inside
// that event's window in the same year. Pure functions over PubState; main.ts
// calls them after each win and saves. Dates come from the caller's `date`
// (always `today()`), never `new Date()`.

import { isWithinWindow } from "../events/eventClock.ts";
import { SEASONAL_EVENTS, type SeasonalEvent } from "../events/seasonalEvents.ts";
import type { PubState } from "../pub/pubState.ts";
import { SLEEVES, type Sleeve } from "./sleeves.ts";

/** Wins inside an event's window, in one year, that earn its sleeve (the monthly plan's "3 wins"). */
export const SLEEVE_WINS_REQUIRED = 3;

/** Sir Charles's beer mat when a sleeve is handed over. */
export const SLEEVE_AWARD_LINE = "Sir Charles found these in the cellar. They fit your cards. They fit nobody else's.";

/**
 * Notes one win dated `date`: bumps the win count of every live event that has a
 * sleeve and whose window contains `date`. Returns the same object when no event
 * counts it. The caller decides which wins count (not Sir Charles's, matching `totalWins`).
 */
export function recordEventWin(pub: PubState, date: Date, events: readonly SeasonalEvent[] = SEASONAL_EVENTS): PubState {
  const year = String(date.getFullYear());
  let eventWins = pub.eventWins;
  for (const event of events) {
    if (event.sleeveId === undefined || !isWithinWindow(date, event.window.start, event.window.end)) continue;
    const byYear = eventWins[event.id] ?? {};
    eventWins = { ...eventWins, [event.id]: { ...byYear, [year]: (byYear[year] ?? 0) + 1 } };
  }
  return eventWins === pub.eventWins ? pub : { ...pub, eventWins };
}

export interface SleeveAwardResult {
  next: PubState;
  awarded: Sleeve[];
}

/**
 * Hands over every sleeve the player has now earned and doesn't own: some year
 * with `SLEEVE_WINS_REQUIRED` or more wins inside the event's window. Ownership
 * is permanent and one sleeve belongs to one event, so each is awarded once, and
 * a later year's wins never re-award it.
 */
export function awardSleeves(pub: PubState, events: readonly SeasonalEvent[] = SEASONAL_EVENTS, sleeves: readonly Sleeve[] = SLEEVES): SleeveAwardResult {
  const awarded: Sleeve[] = [];
  const owned = [...pub.ownedSleeves];
  for (const event of events) {
    const sleeve = event.sleeveId === undefined ? undefined : sleeves.find((s) => s.id === event.sleeveId);
    if (!sleeve || owned.includes(sleeve.id)) continue;
    const earned = Object.values(pub.eventWins[event.id] ?? {}).some((n) => n >= SLEEVE_WINS_REQUIRED);
    if (!earned) continue;
    owned.push(sleeve.id);
    awarded.push(sleeve);
  }
  return awarded.length === 0 ? { next: pub, awarded } : { next: { ...pub, ownedSleeves: owned }, awarded };
}
