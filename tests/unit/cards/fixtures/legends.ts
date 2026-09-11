// Legend cards (design.md §9.3) used to exercise schema features that the
// starter deck doesn't: a two-faced Transform card, `reveal`, and the
// reserved `steal` effect.

import type { Card } from "../../../../src/cards/cardTypes.ts";

export const drJekyllMrHyde: Card = {
  id: "dr-jekyll-mr-hyde",
  rarity: "legendary",
  faces: [
    {
      name: "Dr Henry Jekyll",
      type: "character",
      family: "salon",
      points: 2,
      keywords: { persist: true, friend: 2 },
      flavor: "I'm quite well. Round two, ask again.",
      artId: "dr-henry-jekyll",
    },
    {
      name: "Mr Edward Hyde",
      type: "character",
      family: "rookery",
      points: 6,
      keywords: { elusive: true },
      abilities: [
        {
          trigger: "endOfRound",
          effects: [{ effect: "flip", target: { side: "self", filter: {}, count: 1 } }],
        },
      ],
      flavor: "He's a liability.",
      artId: "mr-edward-hyde",
    },
  ],
};

export const sherlockHolmes: Card = {
  id: "sherlock-holmes",
  rarity: "legendary",
  faces: [
    {
      name: "Sherlock Holmes",
      type: "character",
      family: "irregulars",
      points: 4,
      keywords: { elusive: true },
      abilities: [
        {
          trigger: "onPlay",
          effects: [
            { effect: "reveal", target: { side: "opponent" } },
            { effect: "flip", target: { side: "opponent", filter: { maxPoints: 3 } } },
          ],
        },
      ],
      flavor: "You've been to the Foundry. It's on your cuff.",
      artId: "sherlock-holmes",
    },
  ],
};

// Stretch legend (design.md §9.3): the only card that uses `steal`, which
// is reserved but not resolved by the engine in v1 (design.md §16).
export const robinOfLocksley: Card = {
  id: "robin-of-locksley",
  rarity: "legendary",
  faces: [
    {
      name: "Robin of Locksley",
      type: "character",
      family: "rookery",
      points: 3,
      keywords: { elusive: true },
      abilities: [
        {
          trigger: "onPlay",
          effects: [
            {
              effect: "steal",
              target: { side: "opponent", filter: { maxPoints: 2, excludeElusive: true } },
            },
          ],
        },
      ],
      flavor: "He never took more than the sheriff could spare.",
      artId: "robin-of-locksley",
    },
  ],
};
