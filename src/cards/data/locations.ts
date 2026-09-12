// Locations (design.md §5.6, §8.1): one active at a time, shared, 0 points,
// cannot be Flipped. 8 total: 4 uncommon, 4 rare.
//
// A Location has no controller, so `sideToOwners` resolves `self`,
// `opponent` and `each` identically to *both players* (matchEngine.ts) —
// a Location cannot say "each player does X to their own board" distinct
// from "do X to a pool combined across both boards." Every ability below
// is written in those terms. See ss-card-author's engine-vocabulary notes.

import type { Card } from "../cardTypes.ts";

function lockedCard(partial: Omit<Card, "tutorialLocked">): Card {
  return { ...partial, tutorialLocked: true };
}

// --- Locked (design.md §8.3) ----------------------------------------------

export const theParsonageSnug: Card = lockedCard({
  id: "the-parsonage-snug",
  rarity: "uncommon",
  faces: [
    {
      name: "The Parsonage Snug",
      type: "location",
      family: "neutral",
      points: 0,
      abilities: [
        {
          trigger: "continuous",
          // Printed text (design.md §8.2): "each face-up Friend card gets +1."
          effects: [{ effect: "buff", target: { side: "each", filter: { hasKeyword: "friend" } }, amount: 1 }],
        },
      ],
      flavor: "Where the cats sleep. Named for a house in Haworth none of them have visited.",
      artId: "the-parsonage-snug",
    },
  ],
});

export const theConcertinaWorks: Card = lockedCard({
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
      // design.md §15 (Wayne's World) easter egg: the sign on the wall.
      flavor: "Sign on the wall: NO STAIRWAY.",
      artId: "the-concertina-works",
    },
  ],
});

// --- New for v1 (plan step 1.5) -------------------------------------------

export const theReadingRoom: Card = {
  id: "the-reading-room",
  rarity: "uncommon",
  faces: [
    {
      name: "The Reading Room",
      type: "location",
      family: "neutral",
      points: 0,
      abilities: [
        {
          trigger: "continuous",
          effects: [
            {
              effect: "buff",
              target: { side: "each", filter: { family: "salon", cardType: "character" } },
              amount: 1,
            },
          ],
        },
      ],
      flavor: "Nobody has finished the book on the side table. Everyone's read the inscription.",
      artId: "the-reading-room",
    },
  ],
};

export const bakerStreet: Card = {
  id: "baker-street",
  rarity: "uncommon",
  faces: [
    {
      name: "Baker Street",
      type: "location",
      family: "neutral",
      points: 0,
      abilities: [
        {
          trigger: "continuous",
          effects: [
            {
              effect: "buff",
              target: { side: "each", filter: { family: "irregulars", cardType: "character" } },
              amount: 1,
            },
          ],
        },
      ],
      flavor: "A fog so reliable you could set a watch by which lamp it swallowed first.",
      artId: "baker-street",
    },
  ],
};

export const theBowStreetOffice: Card = {
  id: "the-bow-street-office",
  rarity: "rare",
  faces: [
    {
      name: "The Bow Street Office",
      type: "location",
      family: "neutral",
      points: 0,
      abilities: [
        {
          trigger: "continuous",
          effects: [
            {
              effect: "buff",
              target: { side: "each", filter: { family: "yard", cardType: "character" } },
              amount: 2,
            },
          ],
        },
      ],
      flavor: "The oldest office of them all, and still the one everyone else measures against.",
      artId: "the-bow-street-office",
    },
  ],
};

export const theGasworks: Card = {
  id: "the-gasworks",
  rarity: "rare",
  faces: [
    {
      name: "The Gasworks",
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
              amount: 2,
            },
          ],
        },
      ],
      flavor: "You can hear it three streets off and smell it from five.",
      artId: "the-gasworks",
    },
  ],
};

// Professor Moriarty's own Location (design.md §9.3): "each player Flips
// their own highest-point card, no Elusive exception." Elusive is already
// unconditionally immune to Flip (design.md §5.5, engine-enforced), so
// that part needs no special case. The "each player, their own" part does:
// a Location has no controller, so this resolves as "Flip the two
// highest-point face-up cards in play" (a combined pool of two, not
// guaranteed one per side) rather than one-per-side.
export const theReichenbachFalls: Card = {
  id: "the-reichenbach-falls",
  rarity: "rare",
  faces: [
    {
      name: "The Reichenbach Falls",
      type: "location",
      family: "neutral",
      points: 0,
      abilities: [
        {
          trigger: "endOfRound",
          effects: [{ effect: "flip", target: { side: "each", filter: { highestPoints: true }, count: 2 } }],
        },
      ],
      flavor: "You stand fire admirably. Most people don't stand at all.",
      artId: "the-reichenbach-falls",
    },
  ],
};

// Agatha Christie's own Location (design.md §9.3): printed as "Persist
// cards are discarded instead" of staying — there is no effect kind for
// changing what end-of-round cleanup does with Persist (that's hardcoded
// in matchEngine.ts, not exposed to card text). Approximated with the
// closest achievable effect in the same spirit: something that was going
// to stay behind gets caught out instead.
export const theOvernightExpress: Card = {
  id: "the-overnight-express",
  rarity: "rare",
  faces: [
    {
      name: "The Overnight Express",
      type: "location",
      family: "neutral",
      points: 0,
      abilities: [
        {
          trigger: "endOfRound",
          effects: [{ effect: "flip", target: { side: "each", filter: { highestPoints: true }, count: 1 } }],
        },
      ],
      flavor: "Everybody had a compartment. Somebody's still explaining theirs.",
      artId: "the-overnight-express",
    },
  ],
};

export const locationCards: Card[] = [
  theParsonageSnug,
  theConcertinaWorks,
  theReadingRoom,
  bakerStreet,
  theBowStreetOffice,
  theGasworks,
  theReichenbachFalls,
  theOvernightExpress,
];
