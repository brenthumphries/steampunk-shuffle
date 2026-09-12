// The Landlady (design.md §14.3): the last card in the collection, neutral,
// legendary. Earned by winning the Birthday Invitational.

import type { Card } from "../cardTypes.ts";

// Printed text: "every other face-up Friend card gets +1." She herself
// carries no Friend keyword, so filtering by hasKeyword: "friend" already
// excludes her — no separate self-exclusion needed.
export const theLandlady: Card = {
  id: "the-landlady",
  rarity: "legendary",
  faces: [
    {
      name: "The Landlady",
      type: "character",
      family: "neutral",
      points: 4,
      keywords: { persist: true, elusive: true },
      abilities: [
        {
          trigger: "continuous",
          effects: [{ effect: "buff", target: { side: "self", filter: { hasKeyword: "friend" } }, amount: 1 }],
        },
      ],
      flavor: "Her name is on the licence. Everyone else just drinks here.",
      artId: "the-landlady",
    },
  ],
};
