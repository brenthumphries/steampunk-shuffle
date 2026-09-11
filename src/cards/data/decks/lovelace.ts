// Ada Lovelace (design.md §9.2): Foundry, Heavy Industry with engines that
// Persist. Her reward card, The Analytical Engine, is an extra beyond the
// labeled 60 (see ../README.md).

import type { Card, Deck } from "../../cardTypes.ts";
import {
  apprenticeFitter,
  boilerHand,
  riveter,
  steamHammer,
  foremanGudgeon,
  differenceEngine,
  brassCog,
  sabotage,
  partyTimeExcellent,
} from "../families/foundry.ts";

export const theAnalyticalEngine: Card = {
  id: "the-analytical-engine",
  rarity: "rare",
  faces: [
    {
      name: "The Analytical Engine",
      type: "character",
      family: "foundry",
      points: 5,
      keywords: { persist: true, elusive: true },
      flavor: "Your deck has a loop in it. I can see it from here.",
      artId: "the-analytical-engine",
    },
  ],
};

export const lovelacesDeck: Deck = [
  { card: apprenticeFitter, quantity: 2 },
  { card: boilerHand, quantity: 2 },
  { card: riveter, quantity: 2 },
  { card: steamHammer, quantity: 2 },
  { card: foremanGudgeon, quantity: 2 },
  { card: differenceEngine, quantity: 2 },
  { card: brassCog, quantity: 2 },
  { card: sabotage, quantity: 2 },
  { card: partyTimeExcellent, quantity: 2 },
  { card: theAnalyticalEngine, quantity: 2 },
];
