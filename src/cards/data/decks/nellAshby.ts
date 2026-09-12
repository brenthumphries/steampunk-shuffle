// Old Nell Ashby (design.md §9.1): Irregulars, cheap Elusive cards, draw.
// "Street Sweeper" is plain deck-filler (see houseDeck.ts's note).

import type { Card, Deck } from "../../cardTypes.ts";
import {
  flowerSeller,
  cabDriver,
  theMudlark,
  bakerStreetIrregular,
  telegraphBoy,
  hiawatha,
  nellsBasket,
  anonymousTip,
  goodNewsEverybody,
} from "../families/irregulars.ts";

export const streetSweeper: Card = {
  id: "street-sweeper",
  rarity: "common",
  faces: [
    {
      name: "Street Sweeper",
      type: "character",
      family: "irregulars",
      points: 1,
      keywords: { elusive: true },
      flavor: "Clears a path for the carriages and hears every word spoken over his broom.",
      artId: "street-sweeper",
    },
  ],
};

// Correspondent (Nell Ashby deck-local card, plan step 4.0a): a detail-gatherer
// who exchanges information across the city. Draw effect synergizes with Nell's
// Basket and Telegraph Boy; 4 pts bridges cheap trickery to mid-range.
export const correspondent: Card = {
  id: "correspondent",
  rarity: "uncommon",
  faces: [
    {
      name: "Correspondent",
      type: "character",
      family: "irregulars",
      points: 4,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "draw", amount: 1 }] }],
      flavor: "Exchanges letters across the city and never misses a detail worth noting.",
      artId: "correspondent",
    },
  ],
};

// Street Runner (Nell Ashby deck-local card, plan step 4.0a): nimble information
// courier with Return keyword. Complements Correspondent's Draw with tactical
// repositioning; 3 pts × 2 copies reaches Mudd's 42-pt reference level.
export const streetRunner: Card = {
  id: "street-runner",
  rarity: "uncommon",
  faces: [
    {
      name: "Street Runner",
      type: "character",
      family: "irregulars",
      points: 3,
      keywords: { return: true },
      flavor: "Carries urgent messages through every street and always finds her way back to the bar.",
      artId: "street-runner",
    },
  ],
};

export const nellsDeck: Deck = [
  { card: flowerSeller, quantity: 2 },
  { card: cabDriver, quantity: 2 },
  { card: theMudlark, quantity: 2 },
  { card: bakerStreetIrregular, quantity: 2 },
  { card: telegraphBoy, quantity: 2 },
  { card: hiawatha, quantity: 2 },
  { card: nellsBasket, quantity: 2 },
  { card: correspondent, quantity: 2 },
  { card: streetRunner, quantity: 2 },
  { card: anonymousTip, quantity: 2 },
];
