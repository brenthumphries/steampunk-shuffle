// Irene Adler (design.md §9.2): Rookery + Irregulars, the Long Con —
// Elusive, Return, one big Flip. Her reward card, The Photograph, is an
// extra beyond the labeled 60 (see ../README.md).
//
// Re-pointed plan step 4.0a-correction (PT-32): the first 4.0a pass
// authored her three deck-locals but only reached 39 pts, and `npm run
// curve` showed the starter still winning 90% — "easier than a Regular"
// despite a Seasoned dial, per docs/newcomer-review.md's own finding. Her
// cross-family structure (1 copy each across 16 shared cards) trades
// consistency for breadth, which likely compounds the weakness; the fix
// leans hard on the three deck-locals (now real threats, not just
// bridging filler), a second copy of two of her strongest shared cards,
// and Irregulars' own `bakerStreet` continuous buff.

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
import { bakerStreet } from "../locations.ts";

// Sleight of Hand (Adler deck-local card, plan step 4.0a, re-pointed
// 4.0a-correction): expert Rookery trickster, Elusive for quick escapes.
export const sleightOfHand: Card = {
  id: "sleight-of-hand",
  rarity: "uncommon",
  faces: [
    {
      name: "Sleight of Hand",
      type: "character",
      family: "rookery",
      points: 6,
      keywords: { elusive: true },
      flavor: "A coin vanishes. A watch reappears. Everyone stays friends.",
      artId: "sleight-of-hand",
    },
  ],
};

// Street Informant (Adler deck-local card, plan step 4.0a, re-pointed
// 4.0a-correction): Irregulars intelligence-gatherer, Draw synergizes
// with Nell's Basket and Telegraph Boy.
export const streetInformant: Card = {
  id: "street-informant",
  rarity: "uncommon",
  faces: [
    {
      name: "Street Informant",
      type: "character",
      family: "irregulars",
      points: 6,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "draw", amount: 1 }] }],
      flavor: "Hears everything. Forgets nothing. Asks for coins in return.",
      artId: "street-informant",
    },
  ],
};

// Quick Courier (Adler deck-local card, plan step 4.0a, re-pointed
// 4.0a-correction): nimble Irregulars messenger, Return for tactical
// repositioning.
export const quickCourier: Card = {
  id: "quick-courier",
  rarity: "uncommon",
  faces: [
    {
      name: "Quick Courier",
      type: "character",
      family: "irregulars",
      points: 5,
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
  { card: forger, quantity: 2 },
  { card: cracksman, quantity: 1 },
  { card: fencesRunner, quantity: 1 },
  { card: theLookout, quantity: 1 },
  { card: emily, quantity: 1 },
  { card: skeletonKey, quantity: 1 },
  { card: regsLedger, quantity: 1 },
  { card: cabDriver, quantity: 1 },
  { card: bakerStreetIrregular, quantity: 1 },
  { card: telegraphBoy, quantity: 2 },
  { card: hiawatha, quantity: 1 },
  { card: nellsBasket, quantity: 1 },
  { card: bakerStreet, quantity: 1 },
  { card: sleightOfHand, quantity: 1 },
  { card: streetInformant, quantity: 1 },
  { card: quickCourier, quantity: 1 },
  { card: thePhotograph, quantity: 2 },
];
