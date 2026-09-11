// The Irregulars (design.md §4, §8, §9.1): trickery/information — low
// points, Elusive, draw, reveal. Signature keywords: Elusive, Draw, Return.
// Target avg Character points 2.0 (design.md §4); actual here: 12/6 = 2.0.

import type { Card } from "../../cardTypes.ts";

export const flowerSeller: Card = {
  id: "flower-seller",
  rarity: "common",
  faces: [
    {
      name: "Flower Seller",
      type: "character",
      family: "irregulars",
      points: 1,
      keywords: { elusive: true },
      flavor: "Sells violets on the corner and everything else out the side of her mouth.",
      artId: "flower-seller",
    },
  ],
};

export const cabDriver: Card = {
  id: "cab-driver",
  rarity: "common",
  faces: [
    {
      name: "Cab Driver",
      type: "character",
      family: "irregulars",
      points: 3,
      flavor: "Knows every address in London and repeats none of them.",
      artId: "cab-driver",
    },
  ],
};

export const theMudlark: Card = {
  id: "the-mudlark",
  rarity: "common",
  faces: [
    {
      name: "The Mudlark",
      type: "character",
      family: "irregulars",
      points: 1,
      keywords: { elusive: true },
      flavor: "Waist-deep in the Thames at low tide, and never once caught at anything.",
      artId: "the-mudlark",
    },
  ],
};

export const bakerStreetIrregular: Card = {
  id: "baker-street-irregular",
  rarity: "uncommon",
  faces: [
    {
      name: "Baker Street Irregular",
      type: "character",
      family: "irregulars",
      points: 2,
      keywords: { elusive: true },
      flavor: "Paid a shilling a day and worth considerably more.",
      artId: "baker-street-irregular",
    },
  ],
};

export const telegraphBoy: Card = {
  id: "telegraph-boy",
  rarity: "uncommon",
  faces: [
    {
      name: "Telegraph Boy",
      type: "character",
      family: "irregulars",
      points: 3,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "draw", amount: 1 }] }],
      flavor: "Whatever's in the envelope, he already knows. He just doesn't say.",
      artId: "telegraph-boy",
    },
  ],
};

// The pub cat (design.md §8.2).
export const hiawatha: Card = {
  id: "hiawatha",
  rarity: "rare",
  faces: [
    {
      name: "Hiawatha",
      type: "character",
      family: "irregulars",
      points: 2,
      keywords: { elusive: true, friend: 1 },
      abilities: [
        {
          trigger: "onPlay",
          effects: [{ effect: "flip", target: { side: "opponent", filter: { maxPoints: 2 } } }],
        },
      ],
      flavor: "He called from down the hall and round the corner. You went. That was the mistake.",
      artId: "hiawatha",
    },
  ],
};

// Old Nell Ashby's reward card (design.md §9.1). Nell trades in information
// the way the rest of the family does — a strong effect on a cheap card.
export const nellsBasket: Card = {
  id: "nells-basket",
  rarity: "rare",
  faces: [
    {
      name: "Nell's Basket",
      type: "gadget",
      family: "irregulars",
      points: 1,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "draw", amount: 2 }] }],
      flavor: "Violets on top. Everything worth knowing underneath.",
      artId: "nells-basket",
    },
  ],
};

export const anonymousTip: Card = {
  id: "anonymous-tip",
  rarity: "uncommon",
  faces: [
    {
      name: "Anonymous Tip",
      type: "scheme",
      family: "irregulars",
      points: 0,
      abilities: [
        {
          trigger: "onPlay",
          effects: [{ effect: "flip", target: { side: "opponent", filter: { maxPoints: 2 } } }],
        },
      ],
      flavor: "Unsigned, but the handwriting's familiar.",
      artId: "anonymous-tip",
    },
  ],
};

// design.md §15 (Futurama). The "each player" of the printed text is
// approximated as self-only: `draw` has no target/side in the current
// engine schema, so it always resolves for whoever played the card — see
// ss-card-author's engine-vocabulary notes and src/cards/data/README.md's
// gap list.
export const goodNewsEverybody: Card = {
  id: "good-news-everybody",
  rarity: "rare",
  faces: [
    {
      name: "Good News, Everybody!",
      type: "headline",
      family: "irregulars",
      points: 0,
      abilities: [
        {
          trigger: "onPlay",
          effects: [
            { effect: "draw", amount: 2 },
            { effect: "discardRandom", target: { side: "self" }, amount: 1 },
          ],
        },
      ],
      flavor: "Wernstrom! No — sorry. Wrong headline. Still good news, though.",
      artId: "good-news-everybody",
    },
  ],
};

export const irregularsCards: Card[] = [
  flowerSeller,
  cabDriver,
  theMudlark,
  bakerStreetIrregular,
  telegraphBoy,
  hiawatha,
  nellsBasket,
  anonymousTip,
  goodNewsEverybody,
];
