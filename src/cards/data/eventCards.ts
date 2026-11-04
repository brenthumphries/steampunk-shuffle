// Every seasonal-event card (seasonal-events-plan.md §3, monthly plan §3-§5):
// the visitors' signature legendaries, the Nightfall set, the Cunning Folk
// (November) and the Coven and Almanack threads. Kept apart from ALL_CARDS on
// purpose — that array is design.md §8.1's labeled 60, which tests, the
// balance sim and the "random legendary" prize pool all assume — and
// surfaced to the game through `ACQUIRABLE_CARDS_BY_ID`
// (src/pub/acquirableCards.ts), which is what makes a card resolvable once
// it's in a player's collection.

import type { Card } from "../cardTypes.ts";
import { halloweenSignatureCards } from "./halloween.ts";
import { nightfallCards } from "./nightfall.ts";
import { cunningFolkCards } from "./cunningFolk.ts";
import { almanackCards } from "./almanack.ts";
import { covenCards } from "./families/coven.ts";
import { ghostStoryCards } from "./ghostStory.ts";

export * from "./halloween.ts";
export * from "./nightfall.ts";
export * from "./cunningFolk.ts";
export * from "./almanack.ts";
export * from "./families/coven.ts";
export * from "./ghostStory.ts";

export const EVENT_CARDS: Card[] = [...halloweenSignatureCards, ...nightfallCards, ...cunningFolkCards, ...almanackCards, ...covenCards, ...ghostStoryCards];

export const EVENT_CARDS_BY_ID: ReadonlyMap<string, Card> = new Map(EVENT_CARDS.map((c) => [c.id, c]));
