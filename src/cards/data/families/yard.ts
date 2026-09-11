// The Yard (design.md §4, §8, §9.1): grind — mid points, arrests (Flip),
// officers who Persist. Signature keywords: Flip, Persist.
// Target avg Character points 3.0 (design.md §4); actual here: 18/6 = 3.0.

import type { Card } from "../../cardTypes.ts";

function lockedCard(partial: Omit<Card, "tutorialLocked">): Card {
  return { ...partial, tutorialLocked: true };
}

// --- Locked (design.md §8.3, the Village Constable starter deck) ---------

export const constableOnTheBeat: Card = lockedCard({
  id: "constable-on-the-beat",
  rarity: "common",
  faces: [
    {
      name: "Constable on the Beat",
      type: "character",
      family: "yard",
      points: 3,
      flavor: "Whistle, helmet, boots. In that order of importance, he'd tell you.",
      artId: "constable-on-the-beat",
    },
  ],
});

export const nightWatchman: Card = lockedCard({
  id: "night-watchman",
  rarity: "common",
  faces: [
    {
      name: "Night Watchman",
      type: "character",
      family: "yard",
      points: 5,
      flavor: "Every lamp on the street knows his round by heart.",
      artId: "night-watchman",
    },
  ],
});

// Sergeant Pike doubles as Constable Tobias Mudd's reward card (design.md
// §9.1) — a deliberate overlap, not a rule every reward card follows.
export const sergeantPike: Card = lockedCard({
  id: "sergeant-pike",
  rarity: "uncommon",
  faces: [
    {
      name: "Sergeant Pike",
      type: "character",
      family: "yard",
      points: 4,
      keywords: { persist: true },
      flavor: "He's been on this corner longer than the corner has.",
      artId: "sergeant-pike",
    },
  ],
});

export const inspectorsWarrant: Card = lockedCard({
  id: "inspectors-warrant",
  rarity: "common",
  faces: [
    {
      name: "Inspector's Warrant",
      type: "scheme",
      family: "yard",
      points: 0,
      abilities: [
        {
          trigger: "onPlay",
          effects: [{ effect: "flip", target: { side: "opponent", filter: { maxPoints: 3 } } }],
        },
      ],
      flavor: "Signed, sealed, and extremely inconvenient.",
      artId: "inspectors-warrant",
    },
  ],
});

export const policeWhistle: Card = lockedCard({
  id: "police-whistle",
  rarity: "common",
  faces: [
    {
      name: "Police Whistle",
      type: "gadget",
      family: "yard",
      points: 1,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "draw", amount: 1 }] }],
      flavor: "One blast for trouble. Two for tea.",
      artId: "police-whistle",
    },
  ],
});

// One of the two cats outside the starter deck's core two families on
// purpose (design.md §8.3): Charlotte teaches that families are a guide,
// not a rule.
export const charlotte: Card = lockedCard({
  id: "charlotte",
  rarity: "uncommon",
  faces: [
    {
      name: "Charlotte",
      type: "character",
      family: "yard",
      points: 2,
      keywords: { persist: true, friend: 1 },
      flavor: "Once settled she is not moving, and neither, constable, are you.",
      artId: "charlotte",
    },
  ],
});

// --- New for v1 (plan step 1.5) -------------------------------------------

export const constableReeve: Card = {
  id: "constable-reeve",
  rarity: "common",
  faces: [
    {
      name: "Constable Reeve",
      type: "character",
      family: "yard",
      points: 2,
      flavor: "Newest badge on the beat. Salutes everyone, including cats.",
      artId: "constable-reeve",
    },
  ],
};

export const detectiveSergeantVale: Card = {
  id: "detective-sergeant-vale",
  rarity: "rare",
  faces: [
    {
      name: "Detective Sergeant Vale",
      type: "character",
      family: "yard",
      points: 2,
      abilities: [
        {
          trigger: "onPlay",
          effects: [{ effect: "flip", target: { side: "opponent", filter: { maxPoints: 1 } } }],
        },
      ],
      flavor: "Small fish, but she'll take the small fish. Habit of the trade.",
      artId: "detective-sergeant-vale",
    },
  ],
};

// The Yard's Headline slot. "Each player" is achievable here because a
// Headline is played by a player and has a real controller (unlike a
// Location — see ss-card-author's engine-vocabulary notes) — self/opponent
// resolve independently, so two flip effects genuinely cover both sides.
export const scotlandYardAnnouncesArrests: Card = {
  id: "scotland-yard-announces-arrests",
  rarity: "rare",
  faces: [
    {
      name: "Scotland Yard Announces Arrests",
      type: "headline",
      family: "yard",
      points: 0,
      abilities: [
        {
          trigger: "onPlay",
          effects: [
            { effect: "flip", target: { side: "self", filter: { highestPoints: true }, count: 1 } },
            { effect: "flip", target: { side: "opponent", filter: { highestPoints: true }, count: 1 } },
          ],
        },
      ],
      flavor: "Several men helping with enquiries. All of them helping a great deal.",
      artId: "scotland-yard-announces-arrests",
    },
  ],
};

export const yardCards: Card[] = [
  constableOnTheBeat,
  nightWatchman,
  sergeantPike,
  inspectorsWarrant,
  policeWhistle,
  charlotte,
  constableReeve,
  detectiveSergeantVale,
  scotlandYardAnnouncesArrests,
];
