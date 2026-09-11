// Legend cards (design.md §9.3) used to exercise schema features that the
// starter deck doesn't: a two-faced Transform card, `reveal`, and the
// reserved `steal` effect. Sherlock Holmes and Dr Jekyll / Mr Hyde are
// canonical in src/cards/data/legends.ts (plan step 1.5) and re-exported
// here; Robin of Locksley is a stretch legend (design.md §9.3) not in the
// v1 set, so it stays test-only.

import type { Card } from "../../../../src/cards/cardTypes.ts";

export { sherlockHolmes, drJekyllMrHyde } from "../../../../src/cards/data/legends.ts";

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
