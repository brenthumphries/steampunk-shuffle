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

import type { Card } from "../cards/cardTypes.ts";
import { ALL_CARDS } from "../cards/data/index.ts";
import { bucketsForefinger } from "../cards/data/decks/bucket.ts";
import { theAnalyticalEngine } from "../cards/data/decks/lovelace.ts";
import { thePhotograph } from "../cards/data/decks/adler.ts";
import { nextInstalment } from "../cards/data/decks/dickens.ts";

export const ACQUIRABLE_CARDS: Card[] = [...ALL_CARDS, bucketsForefinger, theAnalyticalEngine, thePhotograph, nextInstalment];

export const ACQUIRABLE_CARDS_BY_ID = new Map<string, Card>(ACQUIRABLE_CARDS.map((c) => [c.id, c]));

/** Legendaries never appear in Lost & Found or the Pawnbroker (design.md §11.3-§11.4). */
export const NON_LEGENDARY_ACQUIRABLE_CARDS = ACQUIRABLE_CARDS.filter((c) => c.rarity !== "legendary");
