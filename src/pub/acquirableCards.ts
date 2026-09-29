// The generic card pool used by Lost & Found (design.md §11.3) and the
// Pawnbroker (§11.4): every non-legendary card the game can hand out at
// random, not tied to a specific opponent. This is ALL_CARDS (the labeled
// 60) plus the four Seasoned reward cards, which are real cards but live
// as extras on their opponent's own deck file rather than in ALL_CARDS
// (src/cards/data/README.md) — nothing in design.md says Lost & Found or
// the Pawnbroker should exclude them, and they're otherwise only
// reachable by beating that specific opponent once. Mary Shelley's two
// easter-egg extras (Abby Normal, Eye-gor) are deliberately left out —
// design.md never calls them acquirable this way and they're pure flavor
// filler, not a named reward; revisit if that judgment call turns out
// wrong.
//
// Seasonal-event cards (src/cards/data/eventCards.ts) are resolvable here —
// so a reward, bet win or Pawnbroker entry for one renders and can be owned —
// but they're not part of the year-round pool: `acquirablePoolFor(date)`
// adds an event's `cardPool` only while that event is live
// (seasonal-events-plan.md §2 rule 3).

import type { Card } from "../cards/cardTypes.ts";
import { ALL_CARDS } from "../cards/data/index.ts";
import { EVENT_CARDS, EVENT_CARDS_BY_ID } from "../cards/data/eventCards.ts";
import { bucketsForefinger } from "../cards/data/decks/bucket.ts";
import { theAnalyticalEngine } from "../cards/data/decks/lovelace.ts";
import { thePhotograph } from "../cards/data/decks/adler.ts";
import { nextInstalment } from "../cards/data/decks/dickens.ts";
import { eventCardPoolIds } from "../events/seasonalEvents.ts";

export const ACQUIRABLE_CARDS: Card[] = [...ALL_CARDS, bucketsForefinger, theAnalyticalEngine, thePhotograph, nextInstalment];

/** Every card an id in a collection can resolve to — the year-round pool plus every event card, in or out of season. */
export const ACQUIRABLE_CARDS_BY_ID = new Map<string, Card>([...ACQUIRABLE_CARDS, ...EVENT_CARDS].map((c) => [c.id, c]));

/** Legendaries never appear in Lost & Found or the Pawnbroker (design.md §11.3-§11.4). */
export const NON_LEGENDARY_ACQUIRABLE_CARDS = ACQUIRABLE_CARDS.filter((c) => c.rarity !== "legendary");

/**
 * Today's random-roll pool for Lost & Found and the Pawnbroker: the
 * year-round non-legendary cards plus any live event's `cardPool`. An id the
 * event lists that isn't an authored event card (content that hasn't landed
 * yet) is skipped, as is a legendary — those never roll.
 */
export function acquirablePoolFor(date: Date): Card[] {
  const seasonal = eventCardPoolIds(date)
    .map((id) => EVENT_CARDS_BY_ID.get(id))
    .filter((c): c is Card => c !== undefined && c.rarity !== "legendary");
  return seasonal.length === 0 ? NON_LEGENDARY_ACQUIRABLE_CARDS : [...NON_LEGENDARY_ACQUIRABLE_CARDS, ...seasonal];
}
