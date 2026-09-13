// Mary Shelley (design.md §9.3, §15): Foundry "creature" deck with the
// Young Frankenstein easter eggs. Abby Normal and Eye-gor are extras beyond
// the labeled 60 (see ../README.md) — both are achievable with the current
// engine (a plain self-targeted Flip and a plain Draw), unlike Put the
// Candle Back's Location text, which needs a "whenever a card is played"
// trigger the engine doesn't have and so isn't authored (see ../README.md's
// schema-gap list).

// Re-pointed plan step 4.0a-correction (PT-32): never touched by the
// first 4.0a pass. `npm run curve` showed the starter winning 50% against
// the `legend` AI dial despite her already sitting near the top of the
// Legend band (52 pts) — raw points weren't the limiting factor here, so
// the fix adds `theGasworks` (Foundry's own +2-per-Character continuous
// buff, previously unused by any deck), which compounds hard across a
// deck this dense in Foundry Characters.
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
import { theGasworks } from "../locations.ts";
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
  { card: apprenticeFitter, quantity: 1 },
  { card: boilerHand, quantity: 2 },
  { card: riveter, quantity: 2 },
  { card: steamHammer, quantity: 2 },
  { card: foremanGudgeon, quantity: 2 },
  { card: differenceEngine, quantity: 1 },
  { card: brassCog, quantity: 2 },
  { card: sabotage, quantity: 2 },
  { card: partyTimeExcellent, quantity: 2 },
  { card: theGasworks, quantity: 1 },
  { card: maryShelley, quantity: 1 },
  { card: abbyNormal, quantity: 1 },
  { card: eyeGor, quantity: 1 },
];
