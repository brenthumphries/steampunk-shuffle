// Inspector Bucket (design.md §9.2): Yard + Irregulars, Persist officers,
// two Flips, reveal-ish draw. His reward card, Bucket's Forefinger, is an
// extra beyond the labeled 60 (design.md §8.1 only folds the *Regular*-tier
// reward cards into the family slices — see ../README.md).

import type { Card, Deck } from "../../cardTypes.ts";
import {
  constableOnTheBeat,
  nightWatchman,
  sergeantPike,
  inspectorsWarrant,
  policeWhistle,
  charlotte,
  constableReeve,
  detectiveSergeantVale,
  scotlandYardAnnouncesArrests,
} from "../families/yard.ts";
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

export const bucketsForefinger: Card = {
  id: "buckets-forefinger",
  rarity: "rare",
  faces: [
    {
      name: "Bucket's Forefinger",
      type: "scheme",
      family: "yard",
      points: 0,
      abilities: [
        {
          trigger: "onPlay",
          effects: [{ effect: "flip", target: { side: "opponent", filter: { maxPoints: 4 } } }],
        },
      ],
      flavor: "I'll just sit here, if I may, and think about you.",
      artId: "buckets-forefinger",
    },
  ],
};

export const bucketsDeck: Deck = [
  { card: constableOnTheBeat, quantity: 1 },
  { card: nightWatchman, quantity: 1 },
  { card: sergeantPike, quantity: 1 },
  { card: inspectorsWarrant, quantity: 1 },
  { card: policeWhistle, quantity: 1 },
  { card: charlotte, quantity: 1 },
  { card: constableReeve, quantity: 1 },
  { card: detectiveSergeantVale, quantity: 1 },
  { card: scotlandYardAnnouncesArrests, quantity: 1 },
  { card: flowerSeller, quantity: 1 },
  { card: cabDriver, quantity: 1 },
  { card: theMudlark, quantity: 1 },
  { card: bakerStreetIrregular, quantity: 1 },
  { card: telegraphBoy, quantity: 1 },
  { card: hiawatha, quantity: 1 },
  { card: nellsBasket, quantity: 1 },
  { card: anonymousTip, quantity: 1 },
  { card: goodNewsEverybody, quantity: 1 },
  { card: bucketsForefinger, quantity: 2 },
];
