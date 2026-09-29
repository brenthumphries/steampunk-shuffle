// Which cards a deck can be built from (plan step 4.0d's ownership system,
// extended for seasonal events — seasonal-events-plan.md §2 rule 3: "event
// cards stay owned and playable all year").
//
// `ALL_CARDS` is design.md §8.1's labeled 60 and always has a tile in the
// builder. Everything else the game can hand out — the Seasoned reward
// cards and every seasonal-event card — has no tile until the player owns a
// copy, then gets one (an unowned event card is a spoiler, not a wishlist).
// Without this an owned event card would sit in the collection forever with
// no way to put it in a deck, and a saved deck listing one would silently
// lose it in `slotToDeck`.

import type { Card } from "../cards/cardTypes.ts";
import { ALL_CARDS } from "../cards/data/index.ts";
import { ACQUIRABLE_CARDS_BY_ID } from "../pub/acquirableCards.ts";
import { ownedCopies } from "./ownership.ts";

const BASE_IDS: ReadonlySet<string> = new Set(ALL_CARDS.map((c) => c.id));

/** Every card a saved deck slot can resolve by id, owned or not — feed to `slotToDeck` / `computeLegality`. */
export function deckCardsById(): ReadonlyMap<string, Card> {
  return ACQUIRABLE_CARDS_BY_ID;
}

/** The deck builder's grid: the labeled 60, then any extra card (reward or event) the player currently owns. */
export function builderCards(collection: readonly string[]): Card[] {
  const extras: Card[] = [];
  for (const card of ACQUIRABLE_CARDS_BY_ID.values()) {
    if (BASE_IDS.has(card.id)) continue;
    if (ownedCopies(card.id, collection) > 0) extras.push(card);
  }
  return [...ALL_CARDS, ...extras];
}
