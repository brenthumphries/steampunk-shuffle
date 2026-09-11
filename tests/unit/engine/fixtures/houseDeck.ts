// Sir Charles's locked tutorial cards (design.md §8.3, "the House deck").
// Only used by the engine tests to replay design.md §13.2's scripted round 1.

import type { Card } from "../../../../src/cards/cardTypes.ts";

function card(partial: Omit<Card, "tutorialLocked">): Card {
  return { ...partial, tutorialLocked: true };
}

export const apprenticeFitter = card({
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

export const boilerHand = card({
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

export const riveter = card({
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

export const brassCog = card({
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

export const steamHammer = card({
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

export const foremanGudgeon = card({
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

export const differenceEngine = card({
  id: "difference-engine",
  rarity: "uncommon",
  faces: [
    {
      name: "Difference Engine",
      type: "character",
      family: "foundry",
      points: 6,
      // No Persist: it must not carry into round 3 of the tutorial (design.md §8.3).
      flavor: "Computes the tables so nobody has to trust a clerk's arithmetic.",
      artId: "difference-engine",
    },
  ],
});

export const sabotage = card({
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
      flavor: "If you can dodge a spanner, you can dodge a constable.",
      artId: "sabotage",
    },
  ],
});

export const theConcertinaWorks = card({
  id: "the-concertina-works",
  rarity: "uncommon",
  faces: [
    {
      name: "The Concertina Works",
      type: "location",
      family: "neutral",
      points: 0,
      abilities: [
        {
          trigger: "continuous",
          effects: [
            {
              effect: "buff",
              target: { side: "each", filter: { family: "foundry", cardType: "character" } },
              amount: 1,
            },
          ],
        },
      ],
      flavor: "Sign on the wall: NO STAIRWAY.",
      artId: "the-concertina-works",
    },
  ],
});
