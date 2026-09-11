// The Foundry (design.md §4, §8, §9.1, the House deck): points-fast/ramp —
// the highest printed points, fewest abilities. Signature: Persist, high
// points. No pub cat (design.md §8.2 assigns none to the Foundry).
// Target avg Character points 3.8 (design.md §4); actual here: 23/6 ≈ 3.83.

import type { Card } from "../../cardTypes.ts";

function lockedCard(partial: Omit<Card, "tutorialLocked">): Card {
  return { ...partial, tutorialLocked: true };
}

// --- Locked (design.md §8.3, Sir Charles's House deck) --------------------

export const apprenticeFitter: Card = lockedCard({
  id: "apprentice-fitter",
  rarity: "common",
  faces: [
    {
      name: "Apprentice Fitter",
      type: "character",
      family: "foundry",
      points: 2,
      flavor: "Still learning which end of the spanner is which.",
      artId: "apprentice-fitter",
    },
  ],
});

export const boilerHand: Card = lockedCard({
  id: "boiler-hand",
  rarity: "common",
  faces: [
    {
      name: "Boiler Hand",
      type: "character",
      family: "foundry",
      points: 3,
      flavor: "Reads the pressure gauge the way other men read the weather.",
      artId: "boiler-hand",
    },
  ],
});

export const riveter: Card = lockedCard({
  id: "riveter",
  rarity: "common",
  faces: [
    {
      name: "Riveter",
      type: "character",
      family: "foundry",
      points: 3,
      flavor: "Deafened in one ear, twenty years back, and proud of it.",
      artId: "riveter",
    },
  ],
});

export const brassCog: Card = lockedCard({
  id: "brass-cog",
  rarity: "common",
  faces: [
    {
      name: "Brass Cog",
      type: "gadget",
      family: "foundry",
      points: 1,
      keywords: { persist: true },
      flavor: "Small enough to lose, important enough that you don't.",
      artId: "brass-cog",
    },
  ],
});

export const steamHammer: Card = lockedCard({
  id: "steam-hammer",
  rarity: "common",
  faces: [
    {
      name: "Steam Hammer",
      type: "character",
      family: "foundry",
      points: 4,
      flavor: "One stroke. That's all it ever needs.",
      artId: "steam-hammer",
    },
  ],
});

export const foremanGudgeon: Card = lockedCard({
  id: "foreman-gudgeon",
  rarity: "uncommon",
  faces: [
    {
      name: "Foreman Gudgeon",
      type: "character",
      family: "foundry",
      points: 5,
      flavor: "Signs off on everything. Reads none of it.",
      artId: "foreman-gudgeon",
    },
  ],
});

// No Persist: it must not carry into round 3 of the tutorial (design.md §8.3).
export const differenceEngine: Card = lockedCard({
  id: "difference-engine",
  rarity: "uncommon",
  faces: [
    {
      name: "Difference Engine",
      type: "character",
      family: "foundry",
      points: 6,
      flavor: "Computes the tables so nobody has to trust a clerk's arithmetic.",
      artId: "difference-engine",
    },
  ],
});

export const sabotage: Card = lockedCard({
  id: "sabotage",
  rarity: "uncommon",
  faces: [
    {
      name: "Sabotage",
      type: "scheme",
      family: "foundry",
      points: 0,
      abilities: [
        {
          trigger: "onPlay",
          effects: [{ effect: "flip", target: { side: "opponent", filter: { maxPoints: 3 } } }],
        },
      ],
      // design.md §15 (Dodgeball) easter egg.
      flavor: "If you can dodge a spanner, you can dodge a constable.",
      artId: "sabotage",
    },
  ],
});

// --- New for v1 (plan step 1.5) -------------------------------------------

// design.md §15 (Wayne's World). "Each player draws" is approximated as
// self-only — `draw` has no target/side in the current engine schema (see
// ss-card-author's engine-vocabulary notes and src/cards/data/README.md).
export const partyTimeExcellent: Card = {
  id: "party-time-excellent",
  rarity: "uncommon",
  faces: [
    {
      name: "Party Time. Excellent.",
      type: "headline",
      family: "foundry",
      points: 0,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "draw", amount: 1 }] }],
      flavor: "The Foundry's whistle blew an hour early. Nobody's arguing.",
      artId: "party-time-excellent",
    },
  ],
};

export const foundryCards: Card[] = [
  apprenticeFitter,
  boilerHand,
  riveter,
  steamHammer,
  foremanGudgeon,
  differenceEngine,
  brassCog,
  sabotage,
  partyTimeExcellent,
];
