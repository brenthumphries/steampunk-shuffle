// Every seasonal-event card (seasonal-events-plan.md §3): the visitors'
// signature legendaries and the Nightfall set. Kept apart from ALL_CARDS on
// purpose — that array is design.md §8.1's labeled 60, which tests, the
// balance sim and the "random legendary" prize pool all assume — and
// surfaced to the game through `ACQUIRABLE_CARDS_BY_ID`
// (src/pub/acquirableCards.ts), which is what makes a card resolvable once
// it's in a player's collection.

import type { Card } from "../cardTypes.ts";
import { halloweenSignatureCards } from "./halloween.ts";
import { nightfallCards } from "./nightfall.ts";

export * from "./halloween.ts";
export * from "./nightfall.ts";

export const EVENT_CARDS: Card[] = [...halloweenSignatureCards, ...nightfallCards];

export const EVENT_CARDS_BY_ID: ReadonlyMap<string, Card> = new Map(EVENT_CARDS.map((c) => [c.id, c]));
