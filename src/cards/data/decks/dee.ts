// Dr John Dee (November visitor, Coven + Foundry, docs/plans/monthly/
// 01-november.md §2): seasoned dial. Foundry bodies to carry the board, with
// Coven Scry and the Galvanic Battery's Undying for the long game.

import type { Card, Deck } from "../../cardTypes.ts";
import { apprenticeFitter, boilerHand, riveter, foremanGudgeon, sabotage, partyTimeExcellent } from "../families/foundry.ts";
import { johnDee } from "../cunningFolk.ts";
import { hedgeWitch, cunningWoman, witchBottle } from "../families/coven.ts";
import { galvanicBattery } from "../nightfall.ts";

// Deck-local body (not in the labeled 60 or the event pool), replacing the
// deck's two 1-point gadgets (curve check, 2026-11-02: starter 80% before).
// No art yet; tracked in KNOWN_MISSING (artAssets.test.ts).
export const galvanicMechanic: Card = {
  id: "galvanic-mechanic",
  rarity: "common",
  faces: [
    {
      name: "Galvanic Mechanic",
      type: "character",
      family: "foundry",
      points: 4,
      flavor: "Keeps the battery warm, the coils honest and the sparks in their box, mostly.",
      artId: "galvanic-mechanic",
    },
  ],
};

export const deesDeck: Deck = [
  { card: johnDee, quantity: 1 },
  { card: hedgeWitch, quantity: 2 },
  { card: witchBottle, quantity: 2 },
  { card: cunningWoman, quantity: 2 },
  { card: apprenticeFitter, quantity: 2 },
  { card: boilerHand, quantity: 2 },
  { card: riveter, quantity: 2 },
  { card: galvanicMechanic, quantity: 2 },
  { card: foremanGudgeon, quantity: 1 },
  { card: galvanicBattery, quantity: 2 },
  { card: sabotage, quantity: 1 },
  { card: partyTimeExcellent, quantity: 1 },
];
