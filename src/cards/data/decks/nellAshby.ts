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

export const nellsDeck: Deck = [
  { card: flowerSeller, quantity: 2 },
  { card: cabDriver, quantity: 2 },
  { card: theMudlark, quantity: 2 },
  { card: bakerStreetIrregular, quantity: 2 },
  { card: telegraphBoy, quantity: 2 },
  { card: hiawatha, quantity: 2 },
  { card: nellsBasket, quantity: 2 },
  { card: anonymousTip, quantity: 2 },
  { card: goodNewsEverybody, quantity: 2 },
  { card: streetSweeper, quantity: 2 },
];
