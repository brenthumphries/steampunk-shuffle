// Legend signature cards (design.md §9.3): 6 legendary Characters, one per
// legend, earned on first win against them. Sherlock Holmes and Dr Jekyll /
// Mr Hyde were authored in plan step 1.1 to exercise `reveal`, `Transform`
// and two-faced cards; they're canonical here and re-exported by
// tests/unit/cards/fixtures/legends.ts rather than duplicated.

import type { Card } from "../cardTypes.ts";

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

export const professorMoriarty: Card = {
  id: "professor-moriarty",
  rarity: "legendary",
  faces: [
    {
      name: "Professor Moriarty",
      type: "character",
      family: "rookery",
      points: 5,
      keywords: { persist: true },
      abilities: [
        {
          trigger: "onPlay",
          effects: [{ effect: "flip", target: { side: "opponent", filter: { maxPoints: 4 } } }],
        },
      ],
      flavor: "You stand fire admirably.",
      artId: "professor-moriarty",
    },
  ],
};

export const dameAgatha: Card = {
  id: "dame-agatha",
  rarity: "legendary",
  faces: [
    {
      name: "Dame Agatha",
      type: "character",
      family: "salon",
      points: 3,
      keywords: { elusive: true, friend: 2 },
      abilities: [
        {
          trigger: "onPlay",
          effects: [{ effect: "return", target: { side: "self", count: 1 } }],
        },
      ],
      // design.md §9.3: missing for eleven days in 1926; no relation to
      // Samuel Hunter Christie, who actually invented the bridge.
      flavor: "The obvious suspect is the deck you built.",
      artId: "dame-agatha",
    },
  ],
};

export const herculePoirot: Card = {
  id: "hercule-poirot",
  rarity: "legendary",
  faces: [
    {
      name: "Hercule Poirot",
      type: "character",
      family: "yard",
      points: 4,
      keywords: { friend: 1 },
      abilities: [
        {
          trigger: "onPlay",
          effects: [{ effect: "flip", target: { side: "opponent", filter: { highestPoints: true }, count: 1 } }],
        },
      ],
      flavor: "The little grey cells, mon ami, have already finished.",
      artId: "hercule-poirot",
    },
  ],
};

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

// design.md §9.3, §15 (Young Frankenstein). Printed text also gives the
// un-flipped card "+2 this round" — dropped here: the engine has no way
// for a second effect to target the specific card a prior effect just
// touched (each effect in an ability picks its own targets independently),
// so a chained "+2 to the card just un-flipped" isn't reliably buildable.
export const maryShelley: Card = {
  id: "mary-shelley",
  rarity: "legendary",
  faces: [
    {
      name: "Mary Shelley",
      type: "character",
      family: "foundry",
      points: 3,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "unflip", target: { side: "self", count: 1 } }] }],
      // "It's pronounced Frankenstein" (design.md §15).
      flavor: "I wrote him at nineteen. What have you made?",
      artId: "mary-shelley",
    },
  ],
};

export const legendCards: Card[] = [
  sherlockHolmes,
  professorMoriarty,
  dameAgatha,
  herculePoirot,
  drJekyllMrHyde,
  maryShelley,
];
