// The canonical v1 card set (plan step 1.5, design.md §8). Every real card
// in the game lives here or under decks/; tests and tools import from this
// module rather than duplicating card data.

import type { Card } from "../cardTypes.ts";
import { yardCards } from "./families/yard.ts";
import { irregularsCards } from "./families/irregulars.ts";
import { rookeryCards } from "./families/rookery.ts";
import { foundryCards } from "./families/foundry.ts";
import { salonCards } from "./families/salon.ts";
import { locationCards } from "./locations.ts";
import { legendCards } from "./legends.ts";
import { theLandlady } from "./landlady.ts";

export * from "./families/yard.ts";
export * from "./families/irregulars.ts";
export * from "./families/rookery.ts";
export * from "./families/foundry.ts";
export * from "./families/salon.ts";
export * from "./locations.ts";
export * from "./legends.ts";
export * from "./landlady.ts";

/** Every card in the v1 set (design.md §8.1: 60 — 45 family + 8 location + 6 legend + 1 Landlady). */
export const ALL_CARDS: Card[] = [
  ...yardCards,
  ...irregularsCards,
  ...rookeryCards,
  ...foundryCards,
  ...salonCards,
  ...locationCards,
  ...legendCards,
  theLandlady,
];
