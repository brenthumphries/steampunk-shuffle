// The Coven (sixth family, docs/plans/monthly/00-monthly-content-plan.md §5.1):
// foresight, Scry and hexes. Event cards, so they sit outside ALL_CARDS
// (../eventCards.ts). Hedge Witch and Witch Bottle are the November trio's
// Scry payoffs; Cunning Woman is the one-shot hex (a negative buff).

import type { Card } from "../../cardTypes.ts";

export const hedgeWitch: Card = {
  id: "hedge-witch",
  rarity: "common",
  faces: [
    {
      name: "Hedge Witch",
      type: "character",
      family: "coven",
      points: 2,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "scry", amount: 2 }] }],
      flavor: "Knows which herb is for what, and which neighbour is for what, and won't tell you either.",
      artId: "hedge-witch",
    },
  ],
};

export const cunningWoman: Card = {
  id: "cunning-woman",
  rarity: "uncommon",
  faces: [
    {
      name: "Cunning Woman",
      type: "character",
      family: "coven",
      points: 3,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "buff", target: { side: "opponent" }, amount: -1 }] }],
      flavor: "Finds lost rings, cures warts and settles feuds. Charges in eggs.",
      artId: "cunning-woman",
    },
  ],
};

export const witchBottle: Card = {
  id: "witch-bottle",
  rarity: "uncommon",
  faces: [
    {
      name: "Witch Bottle",
      type: "gadget",
      family: "coven",
      points: 1,
      keywords: { persist: true },
      abilities: [{ trigger: "onPlay", effects: [{ effect: "scry", amount: 1 }] }],
      flavor: "Buried under the hearthstone, it keeps ill will out. Mostly.",
      artId: "witch-bottle",
    },
  ],
};

export const covenCards: Card[] = [hedgeWitch, cunningWoman, witchBottle];
