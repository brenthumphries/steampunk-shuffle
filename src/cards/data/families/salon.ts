// The Salon (design.md §4, §8, §9.1): Friend synergy — individually weak,
// collectively strong. Signature keywords: Friend, un-flip.
// Target avg Character points 2.4 (design.md §4); actual here: 14/6 ≈ 2.33.

import type { Card } from "../../cardTypes.ts";

function lockedCard(partial: Omit<Card, "tutorialLocked">): Card {
  return { ...partial, tutorialLocked: true };
}

// --- Locked (design.md §8.3, the Village Constable starter deck) ---------

export const parlourGuest: Card = lockedCard({
  id: "parlour-guest",
  rarity: "common",
  faces: [
    {
      name: "Parlour Guest",
      type: "character",
      family: "salon",
      points: 2,
      keywords: { friend: 1 },
      flavor: "Arrived with the second post, will leave with the last train.",
      artId: "parlour-guest",
    },
  ],
});

export const amateurSleuth: Card = lockedCard({
  id: "amateur-sleuth",
  rarity: "uncommon",
  faces: [
    {
      name: "Amateur Sleuth",
      type: "character",
      family: "salon",
      points: 2,
      keywords: { friend: 2 },
      flavor: "Has a theory. Has several theories. Would like to share them.",
      artId: "amateur-sleuth",
    },
  ],
});

// The pub cat (design.md §8.2). One of the two cats outside the starter
// deck's core two families on purpose.
export const bramwell: Card = lockedCard({
  id: "bramwell",
  rarity: "common",
  faces: [
    {
      name: "Bramwell",
      type: "character",
      family: "salon",
      points: 2,
      keywords: { friend: 2 },
      flavor: "Announces himself in the doorway, then in your lap, then again in case you missed it.",
      artId: "bramwell",
    },
  ],
});

export const seance: Card = lockedCard({
  id: "seance",
  rarity: "uncommon",
  faces: [
    {
      name: "Séance",
      type: "scheme",
      family: "salon",
      points: 0,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "unflip", target: { side: "self" } }] }],
      flavor: "Not sure if the spirits, or the drains.",
      artId: "seance",
    },
  ],
});

export const afternoonTea: Card = lockedCard({
  id: "afternoon-tea",
  rarity: "common",
  faces: [
    {
      name: "Afternoon Tea",
      type: "gadget",
      family: "salon",
      points: 1,
      keywords: { friend: 1 },
      flavor: "Served whether or not anyone asked for it.",
      artId: "afternoon-tea",
    },
  ],
});

// --- New for v1 (plan step 1.5) -------------------------------------------

// A second pub cat lives in the Salon (design.md §8.2's clowder isn't
// strictly one-per-family: Salon has two, the Foundry has none).
export const banshee: Card = {
  id: "banshee",
  rarity: "uncommon",
  faces: [
    {
      name: "Banshee",
      type: "character",
      family: "salon",
      points: 3,
      keywords: { friend: 1 },
      abilities: [{ trigger: "onPlay", effects: [{ effect: "discardLocation" }] }],
      flavor: "Nobody is going anywhere in the carriage. Nobody. Ask her.",
      artId: "banshee",
    },
  ],
};

// Miss Prudence Hollis's reward card (design.md §9.1).
export const missHollisAuthoress: Card = {
  id: "miss-hollis-authoress",
  rarity: "rare",
  faces: [
    {
      name: "Miss Hollis, Authoress",
      type: "character",
      family: "salon",
      points: 3,
      keywords: { elusive: true, friend: 2 },
      flavor: "I've already worked out how you did it. Sit down.",
      artId: "miss-hollis-authoress",
    },
  ],
};

// design.md §15 (Futurama, "The Hypnofrog"). Fills the family's second
// rare slot as an easter egg rather than a plain Character.
export const theHypnofrog: Card = {
  id: "the-hypnofrog",
  rarity: "rare",
  faces: [
    {
      name: "The Hypnofrog",
      type: "character",
      family: "salon",
      points: 2,
      keywords: { elusive: true, friend: 1 },
      flavor: "All glory to it, the drawing room agreed, somewhat suddenly.",
      artId: "the-hypnofrog",
    },
  ],
};

// The Salon's Headline slot. Approximated as "your face-up Characters"
// rather than "your face-up Friend cards" — TargetFilter can't check for a
// keyword (see ss-card-author's engine-vocabulary notes); this stays
// honest about what it actually does rather than reusing The Parsonage
// Snug's broader (any-card) approximation a third time.
export const theSeasonsMostTalkedAboutEngagement: Card = {
  id: "the-seasons-most-talked-about-engagement",
  rarity: "uncommon",
  faces: [
    {
      name: "The Season's Most Talked-About Engagement",
      type: "headline",
      family: "salon",
      points: 0,
      abilities: [
        {
          trigger: "onPlay",
          effects: [{ effect: "buff", target: { side: "self", filter: { cardType: "character" } }, amount: 1 }],
        },
      ],
      flavor: "Nobody at the Bridge has met either party, which has not slowed the speculation.",
      artId: "the-seasons-most-talked-about-engagement",
    },
  ],
};

export const salonCards: Card[] = [
  parlourGuest,
  amateurSleuth,
  bramwell,
  banshee,
  missHollisAuthoress,
  theHypnofrog,
  afternoonTea,
  seance,
  theSeasonsMostTalkedAboutEngagement,
];
