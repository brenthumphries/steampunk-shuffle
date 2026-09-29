// The Nightfall set (seasonal-events-plan.md §3.2): Hallowe'en event cards,
// obtainable only while the event is live (Lost & Found, Pawnbroker, Bar
// Bet, visitor decks) but owned and playable all year once earned.
//
// No art exists for these yet (plan step F / `ss-art-prompts`): each artId is
// the card's own id, and the UI simply shows no illustration until the WebP
// is ingested — same handling as the deck-local fillers (e.g. Desk Sergeant).
//
// Wave 1 was the four cards that need no new engine keyword; Wave 2 added
// the four that use Undying and Moonrise (design.md §5.14-§5.15).

import type { Card } from "../cardTypes.ts";

// Victorian Britain carved turnips, not pumpkins.
export const turnipLantern: Card = {
  id: "turnip-lantern",
  rarity: "common",
  faces: [
    {
      name: "Turnip Lantern",
      type: "gadget",
      family: "neutral",
      points: 1,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "draw", amount: 1 }] }],
      flavor: "Carved from a turnip with a butter knife and a grudge. The cat won't go near it.",
      artId: "turnip-lantern",
    },
  ],
};

export const resurrectionMan: Card = {
  id: "resurrection-man",
  rarity: "uncommon",
  faces: [
    {
      name: "Resurrection Man",
      type: "character",
      family: "rookery",
      points: 3,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "unflip", target: { side: "self" } }] }],
      flavor: "Paid by the body, and not fussy about the paperwork.",
      artId: "resurrection-man",
    },
  ],
};

// "Up to two": Target.count is a ceiling — the engine turns up as many as
// there are face-down Friend cards, and stagePlay (src/match/humanTurn.ts)
// asks the player to pick only when there are more candidates than that.
export const spiritPhotograph: Card = {
  id: "spirit-photograph",
  rarity: "uncommon",
  faces: [
    {
      name: "Spirit Photograph",
      type: "scheme",
      family: "salon",
      points: 0,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "unflip", target: { side: "self", count: 2, filter: { hasKeyword: "friend" } } }] }],
      flavor: "Three friends in the portrait. Only two were in the room.",
      artId: "spirit-photograph",
    },
  ],
};

// Known engine-schema gap #3 (src/cards/data/README.md): a Location has no
// controller, so "each player returns their own lowest card" isn't
// expressible. Written as a combined-pool effect instead — the two
// lowest-point face-up cards on the whole table go back to their owners'
// hands — same reword The Reichenbach Falls and The Overnight Express got.
export const theWitchingHour: Card = {
  id: "the-witching-hour",
  rarity: "rare",
  faces: [
    {
      name: "The Witching Hour",
      type: "location",
      family: "neutral",
      points: 0,
      abilities: [
        {
          trigger: "endOfRound",
          effects: [{ effect: "return", target: { side: "each", filter: { lowestPoints: true }, count: 2 } }],
        },
      ],
      flavor: "Midnight, and every card in the room has second thoughts.",
      artId: "the-witching-hour",
    },
  ],
};

export const graveRobber: Card = {
  id: "grave-robber",
  rarity: "common",
  faces: [
    {
      name: "Grave Robber",
      type: "character",
      family: "rookery",
      points: 2,
      keywords: { undying: true },
      flavor: "Digs by night, sells by morning, and has never once been the one in the hole.",
      artId: "grave-robber",
    },
  ],
};

export const nightConstable: Card = {
  id: "night-constable",
  rarity: "common",
  faces: [
    {
      name: "Night Constable",
      type: "character",
      family: "yard",
      points: 2,
      keywords: { moonrise: 2 },
      flavor: "Walks the same beat after dark. It is somehow longer.",
      artId: "night-constable",
    },
  ],
};

export const lamplighterAtDusk: Card = {
  id: "lamplighter-at-dusk",
  rarity: "common",
  faces: [
    {
      name: "Lamplighter at Dusk",
      type: "character",
      family: "irregulars",
      points: 1,
      keywords: { elusive: true, moonrise: 2 },
      flavor: "Lights the lamps and is somewhere else by the time anyone thinks to thank him.",
      artId: "lamplighter-at-dusk",
    },
  ],
};

export const galvanicBattery: Card = {
  id: "galvanic-battery",
  rarity: "uncommon",
  faces: [
    {
      name: "Galvanic Battery",
      type: "gadget",
      family: "foundry",
      points: 2,
      keywords: { undying: true },
      flavor: "A jar of lightning. Stored, never spent.",
      artId: "galvanic-battery",
    },
  ],
};

export const nightfallCards: Card[] = [
  turnipLantern,
  resurrectionMan,
  spiritPhotograph,
  theWitchingHour,
  graveRobber,
  nightConstable,
  lamplighterAtDusk,
  galvanicBattery,
];
