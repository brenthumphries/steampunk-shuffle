// Old Nell Ashby (design.md §9.1): Irregulars, cheap Elusive cards, draw.
// "Street Sweeper" is plain deck-filler (see houseDeck.ts's note).
//
// Re-pointed plan step 4.0a-correction (PT-32): the first 4.0a pass raised
// her to 40 pts (matching Mudd's reference band) but `npm run curve`
// showed the starter still winning 85% — printed points alone don't track
// win rate against the real AI (see Inspector Bucket/Charles Dickens,
// both well under their nominal bands yet on target); ability quality and
// synergy density matter more. Bumped `correspondent`/`streetRunner`
// further and added `bakerStreet` (Irregulars' own continuous-buff
// Location, previously unused by any deck) to give her Elusive-heavy
// board real ongoing value instead of one-off points.

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
import { bakerStreet } from "../locations.ts";

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

// Correspondent (Nell Ashby deck-local card, plan step 4.0a, re-pointed
// 4.0a-correction): a detail-gatherer who exchanges information across
// the city. Draw effect synergizes with Nell's Basket and Telegraph Boy.
export const correspondent: Card = {
  id: "correspondent",
  rarity: "uncommon",
  faces: [
    {
      name: "Correspondent",
      type: "character",
      family: "irregulars",
      points: 5,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "draw", amount: 1 }] }],
      flavor: "Exchanges letters across the city and never misses a detail worth noting.",
      artId: "correspondent",
    },
  ],
};

// Street Runner (Nell Ashby deck-local card, plan step 4.0a, re-pointed
// 4.0a-correction): nimble information courier with Return keyword.
export const streetRunner: Card = {
  id: "street-runner",
  rarity: "uncommon",
  faces: [
    {
      name: "Street Runner",
      type: "character",
      family: "irregulars",
      points: 4,
      keywords: { return: true },
      flavor: "Carries urgent messages through every street and always finds her way back to the bar.",
      artId: "street-runner",
    },
  ],
};

export const nellsDeck: Deck = [
  { card: flowerSeller, quantity: 2 },
  { card: cabDriver, quantity: 2 },
  { card: theMudlark, quantity: 1 },
  { card: bakerStreetIrregular, quantity: 2 },
  { card: telegraphBoy, quantity: 2 },
  { card: hiawatha, quantity: 2 },
  { card: nellsBasket, quantity: 2 },
  { card: correspondent, quantity: 2 },
  { card: streetRunner, quantity: 2 },
  { card: anonymousTip, quantity: 2 },
  { card: bakerStreet, quantity: 1 },
];
