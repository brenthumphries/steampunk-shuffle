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

// Furnace Stoker (Lovelace deck-local card, plan step 4.0a): industrial labor,
// no Persist or special abilities—vanilla Foundry filler to dilute synergy.
export const furnaceStoker: Card = {
  id: "furnace-stoker",
  rarity: "common",
  faces: [
    {
      name: "Furnace Stoker",
      type: "character",
      family: "foundry",
      points: 1,
      flavor: "Keeps the fire hot and the gears turning. Asks no questions.",
      artId: "furnace-stoker",
    },
  ],
};

// The Analytical Engine (Lovelace reward card, plan step 4.0a): reduced from 5 pts
// to 2 pts and removed from deck composition to dilute synergy. Kept as export
// for Lost & Found/Pawnbroker acquirable pool (design.md §11.3–§11.4).
export const theAnalyticalEngine: Card = {
  id: "the-analytical-engine",
  rarity: "rare",
  faces: [
    {
      name: "The Analytical Engine",
      type: "character",
      family: "foundry",
      points: 2,
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
  { card: furnaceStoker, quantity: 2 },
];
