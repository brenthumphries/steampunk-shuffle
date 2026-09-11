// Sir Charles's House deck (design.md §8.3, §9): the Foundry, his everyday
// deck. The 9 named cards are tutorial-locked; "Line Fitter" is a plain
// deck-filler card (not part of the labeled 60 — design.md §8.1 only
// requires 9 Foundry cards, and 9 unique cards at 2 copies each caps out
// at 18, two short of a legal 20-card deck).

import type { Card, Deck } from "../../cardTypes.ts";
import {
  apprenticeFitter,
  boilerHand,
  riveter,
  brassCog,
  steamHammer,
  foremanGudgeon,
  differenceEngine,
  sabotage,
} from "../families/foundry.ts";
import { theConcertinaWorks } from "../locations.ts";

export const lineFitter: Card = {
  id: "line-fitter",
  rarity: "common",
  faces: [
    {
      name: "Line Fitter",
      type: "character",
      family: "foundry",
      points: 2,
      flavor: "Keeps the belts running and the opinions to himself.",
      artId: "line-fitter",
    },
  ],
};

export const houseDeck: Deck = [
  { card: apprenticeFitter, quantity: 2 },
  { card: boilerHand, quantity: 2 },
  { card: riveter, quantity: 2 },
  { card: brassCog, quantity: 2 },
  { card: steamHammer, quantity: 2 },
  { card: foremanGudgeon, quantity: 2 },
  { card: differenceEngine, quantity: 2 },
  { card: sabotage, quantity: 2 },
  { card: theConcertinaWorks, quantity: 2 },
  { card: lineFitter, quantity: 2 },
];
