// The Rookery (design.md §4, §8, §9.1): trickery/aggro — low-to-mid points,
// tempo Flips, cards that leave before they can be arrested. Signature
// keywords: Flip, Return, Elusive.
// Target avg Character points 2.4 (design.md §4); actual here: 14/6 ≈ 2.33.

import type { Card } from "../../cardTypes.ts";

export const pickpocket: Card = {
  id: "pickpocket",
  rarity: "common",
  faces: [
    {
      name: "Pickpocket",
      type: "character",
      family: "rookery",
      points: 1,
      keywords: { elusive: true },
      flavor: "You'll notice the watch is gone about the time she's gone too.",
      artId: "pickpocket",
    },
  ],
};

export const forger: Card = {
  id: "forger",
  rarity: "common",
  faces: [
    {
      name: "Forger",
      type: "character",
      family: "rookery",
      points: 4,
      flavor: "His signatures are better than the originals. He finds that insulting.",
      artId: "forger",
    },
  ],
};

export const cracksman: Card = {
  id: "cracksman",
  rarity: "uncommon",
  faces: [
    {
      name: "Cracksman",
      type: "character",
      family: "rookery",
      points: 4,
      keywords: { return: true },
      flavor: "Every safe has a weak hinge. He's very patient about finding it.",
      artId: "cracksman",
    },
  ],
};

export const fencesRunner: Card = {
  id: "fences-runner",
  rarity: "uncommon",
  faces: [
    {
      name: "Fence's Runner",
      type: "character",
      family: "rookery",
      points: 2,
      keywords: { elusive: true },
      flavor: "Carries the parcel three streets before anyone thinks to ask what's in it.",
      artId: "fences-runner",
    },
  ],
};

export const theLookout: Card = {
  id: "the-lookout",
  rarity: "rare",
  faces: [
    {
      name: "The Lookout",
      type: "character",
      family: "rookery",
      points: 2,
      keywords: { elusive: true },
      abilities: [
        {
          trigger: "onPlay",
          effects: [{ effect: "flip", target: { side: "opponent", filter: { maxPoints: 1 } } }],
        },
      ],
      flavor: "Whistles once for the beat copper, twice for the more interesting kind of trouble.",
      artId: "the-lookout",
    },
  ],
};

// The pub cat (design.md §8.2).
export const emily: Card = {
  id: "emily",
  rarity: "rare",
  faces: [
    {
      name: "Emily",
      type: "character",
      family: "rookery",
      points: 1,
      keywords: { elusive: true, return: true },
      abilities: [{ trigger: "onPlay", effects: [{ effect: "draw", amount: 1 }] }],
      flavor: "Small, brown, and gone before the treat tin closes.",
      artId: "emily",
    },
  ],
};

export const skeletonKey: Card = {
  id: "skeleton-key",
  rarity: "common",
  faces: [
    {
      name: "Skeleton Key",
      type: "gadget",
      family: "rookery",
      points: 1,
      keywords: { return: true },
      flavor: "Fits every lock in Whitechapel and no lock it was cut for.",
      artId: "skeleton-key",
    },
  ],
};

// "Dodgy" Reg Farrow's reward card (design.md §9.1).
export const regsLedger: Card = {
  id: "regs-ledger",
  rarity: "uncommon",
  faces: [
    {
      name: "Reg's Ledger",
      type: "scheme",
      family: "rookery",
      points: 0,
      abilities: [
        {
          trigger: "onPlay",
          effects: [
            { effect: "flip", target: { side: "opponent", filter: { maxPoints: 2 } } },
            { effect: "draw", amount: 1 },
          ],
        },
      ],
      flavor: "Everything on this page is legitimate. Mostly.",
      artId: "regs-ledger",
    },
  ],
};

// design.md §8.2. Implemented as two independent flips (self, then
// opponent) rather than one combined-side effect — a Headline is played by
// a player and has a real controller, so self/opponent resolve correctly,
// unlike a Location (see ss-card-author's engine-vocabulary notes).
export const catBurglarStrikesAgain: Card = {
  id: "cat-burglar-strikes-again",
  rarity: "rare",
  faces: [
    {
      name: "Cat Burglar Strikes Again",
      type: "headline",
      family: "rookery",
      points: 0,
      abilities: [
        {
          trigger: "onPlay",
          effects: [
            { effect: "flip", target: { side: "self", filter: { lowestPoints: true }, count: 1 } },
            { effect: "flip", target: { side: "opponent", filter: { lowestPoints: true }, count: 1 } },
          ],
        },
      ],
      flavor: "Nothing taken but a sardine. Constabulary baffled.",
      artId: "cat-burglar-strikes-again",
    },
  ],
};

export const rookeryCards: Card[] = [
  pickpocket,
  forger,
  cracksman,
  fencesRunner,
  theLookout,
  emily,
  skeletonKey,
  regsLedger,
  catBurglarStrikesAgain,
];
