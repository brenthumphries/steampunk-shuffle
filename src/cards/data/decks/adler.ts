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
  { card: catBurglarStrikesAgain, quantity: 1 },
  { card: flowerSeller, quantity: 1 },
  { card: cabDriver, quantity: 1 },
  { card: theMudlark, quantity: 1 },
  { card: bakerStreetIrregular, quantity: 1 },
  { card: telegraphBoy, quantity: 1 },
  { card: hiawatha, quantity: 1 },
  { card: nellsBasket, quantity: 1 },
  { card: anonymousTip, quantity: 1 },
  { card: goodNewsEverybody, quantity: 1 },
  { card: thePhotograph, quantity: 2 },
];
