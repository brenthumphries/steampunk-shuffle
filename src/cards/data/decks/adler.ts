// Irene Adler (design.md §9.2): Rookery + Irregulars, the Long Con —
// Elusive, Return, one big Flip. Her reward card, The Photograph, is an
// extra beyond the labeled 60 (see ../README.md).

import type { Card, Deck } from "../../cardTypes.ts";
import {
  pickpocket,
  forger,
  cracksman,
  fencesRunner,
  theLookout,
  emily,
  skeletonKey,
  regsLedger,
  catBurglarStrikesAgain,
} from "../families/rookery.ts";
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

// Sleight of Hand (Adler deck-local card, plan step 4.0a): expert Rookery trickster.
// Elusive keyword for quick escapes; no ability needed—vanilla 4 pts bridges to mid-range.
export const sleightOfHand: Card = {
  id: "sleight-of-hand",
  rarity: "uncommon",
  faces: [
    {
      name: "Sleight of Hand",
      type: "character",
      family: "rookery",
      points: 4,
      keywords: { elusive: true },
      flavor: "A coin vanishes. A watch reappears. Everyone stays friends.",
      artId: "sleight-of-hand",
    },
  ],
};

// Street Informant (Adler deck-local card, plan step 4.0a): Irregulars intelligence-gatherer.
// Draw effect synergizes with Nell's Basket and Telegraph Boy; 4 pts reaches mid-range.
export const streetInformant: Card = {
  id: "street-informant",
  rarity: "uncommon",
  faces: [
    {
      name: "Street Informant",
      type: "character",
      family: "irregulars",
      points: 4,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "draw", amount: 1 }] }],
      flavor: "Hears everything. Forgets nothing. Asks for coins in return.",
      artId: "street-informant",
    },
  ],
};

// Quick Courier (Adler deck-local card, plan step 4.0a): nimble Irregulars messenger.
// Return keyword complements Draw with tactical repositioning; 3 pts × 2 copies reaches 44-pt band.
export const quickCourier: Card = {
  id: "quick-courier",
  rarity: "uncommon",
  faces: [
    {
      name: "Quick Courier",
      type: "character",
      family: "irregulars",
      points: 3,
      keywords: { return: true },
      flavor: "Delivers a message and vanishes before you can reply. Always finds her way back.",
      artId: "quick-courier",
    },
  ],
};

export const thePhotograph: Card = {
  id: "the-photograph",
  rarity: "uncommon",
  faces: [
    {
      name: "The Photograph",
      type: "scheme",
      family: "rookery",
      points: 0,
      abilities: [
        {
          trigger: "onPlay",
          effects: [
            { effect: "return", target: { side: "self", count: 1 } },
            { effect: "draw", amount: 1 },
          ],
        },
      ],
      flavor: "Good night, Mr Sherlock Holmes.",
      artId: "the-photograph",
    },
  ],
};

export const adlersDeck: Deck = [
  { card: pickpocket, quantity: 1 },
  { card: forger, quantity: 1 },
  { card: cracksman, quantity: 1 },
  { card: fencesRunner, quantity: 1 },
  { card: theLookout, quantity: 1 },
  { card: emily, quantity: 1 },
  { card: skeletonKey, quantity: 1 },
  { card: regsLedger, quantity: 1 },
  { card: flowerSeller, quantity: 1 },
  { card: cabDriver, quantity: 1 },
  { card: theMudlark, quantity: 1 },
  { card: bakerStreetIrregular, quantity: 1 },
  { card: telegraphBoy, quantity: 1 },
  { card: hiawatha, quantity: 1 },
  { card: nellsBasket, quantity: 1 },
  { card: sleightOfHand, quantity: 1 },
  { card: streetInformant, quantity: 1 },
  { card: quickCourier, quantity: 1 },
  { card: thePhotograph, quantity: 2 },
];
