// Mary Shelley (design.md §9.3, §15): Foundry "creature" deck with the
// Young Frankenstein easter eggs. Abby Normal and Eye-gor are extras beyond
// the labeled 60 (see ../README.md) — both are achievable with the current
// engine (a plain self-targeted Flip and a plain Draw), unlike Put the
// Candle Back's Location text, which needs a "whenever a card is played"
// trigger the engine doesn't have and so isn't authored (see ../README.md's
// schema-gap list).

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
import { maryShelley } from "../legends.ts";

export const abbyNormal: Card = {
  id: "abby-normal",
  rarity: "rare",
  faces: [
    {
      name: "Abby Normal",
      type: "character",
      family: "foundry",
      points: 6,
      abilities: [
        {
          trigger: "onPlay",
          effects: [{ effect: "flip", target: { side: "self", filter: { maxPoints: 2 }, count: 1 } }],
        },
      ],
      flavor: "It's pronounced Frankenstein.",
      artId: "abby-normal",
    },
  ],
};

export const eyeGor: Card = {
  id: "eye-gor",
  rarity: "common",
  faces: [
    {
      name: "Eye-gor",
      type: "character",
      family: "foundry",
      points: 1,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "draw", amount: 1 }] }],
      flavor: "Walk this way.",
      artId: "eye-gor",
    },
  ],
};

export const shelleysDeck: Deck = [
  { card: apprenticeFitter, quantity: 2 },
  { card: boilerHand, quantity: 2 },
  { card: riveter, quantity: 2 },
  { card: steamHammer, quantity: 2 },
  { card: foremanGudgeon, quantity: 2 },
  { card: differenceEngine, quantity: 1 },
  { card: brassCog, quantity: 2 },
  { card: sabotage, quantity: 2 },
  { card: partyTimeExcellent, quantity: 2 },
  { card: maryShelley, quantity: 1 },
  { card: abbyNormal, quantity: 1 },
  { card: eyeGor, quantity: 1 },
];
