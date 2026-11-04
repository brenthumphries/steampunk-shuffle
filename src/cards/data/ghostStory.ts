// A Ghost Story for Christmas (December, docs/plans/monthly/02-december.md
// §2-§3, §6): the four event cards, the three visitors' signature legendaries
// (Mr Pockett, the Ghost of Christmas Present, the Ghost of Christmas Yet to
// Come). Event cards, so they sit outside ALL_CARDS (./eventCards.ts). The
// visitors' decks are in ./decks/.

import type { Card } from "../cardTypes.ts";
import { EVERY_BOARD_CARD } from "./almanack.ts";

// --- Event cards (02-december.md §3) --------------------------------------

export const wassailBowl: Card = {
  id: "wassail-bowl",
  rarity: "common",
  faces: [
    {
      name: "Wassail Bowl",
      type: "gadget",
      family: "neutral",
      points: 1,
      keywords: { friend: 1 },
      flavor: "\"Wassail! Drink hail!\" The cats decline.",
      artId: "wassail-bowl",
    },
  ],
};

export const yuleLog: Card = {
  id: "yule-log",
  rarity: "uncommon",
  faces: [
    {
      name: "Yule Log",
      type: "gadget",
      family: "neutral",
      points: 1,
      keywords: { persist: true, undying: true },
      flavor: "Lit from a piece of last year's. It has never once gone out.",
      artId: "yule-log",
    },
  ],
};

// "Turn one of your face-down cards face-up, then Draw 1" (the draft's
// "Draw 1" is the engine's draw, which only ever draws for the controller).
export const aWhistleOnTheShingle: Card = {
  id: "a-whistle-on-the-shingle",
  rarity: "uncommon",
  faces: [
    {
      name: "A Whistle on the Shingle",
      type: "scheme",
      family: "irregulars",
      points: 0,
      abilities: [
        {
          trigger: "onPlay",
          effects: [
            { effect: "unflip", target: { side: "self", count: 1 } },
            { effect: "draw", amount: 1 },
          ],
        },
      ],
      flavor: "Found in a ruin on the Suffolk shore. Don't blow it. He blew it.",
      artId: "a-whistle-on-the-shingle",
    },
  ],
};

// Two continuous buffs, one per keyword: a card with both Undying and Return
// gets +2 (the second buff is a separate ability, so it stacks). Locations
// have no controller, so both reach each side (`each`).
export const theFiresideTale: Card = {
  id: "the-fireside-tale",
  rarity: "rare",
  faces: [
    {
      name: "The Fireside Tale",
      type: "location",
      family: "neutral",
      points: 0,
      abilities: [
        { trigger: "continuous", effects: [{ effect: "buff", target: { side: "each", count: EVERY_BOARD_CARD, filter: { hasKeyword: "undying" } }, amount: 1 }] },
        { trigger: "continuous", effects: [{ effect: "buff", target: { side: "each", count: EVERY_BOARD_CARD, filter: { hasKeyword: "return" } }, amount: 1 }] },
      ],
      flavor: "Christmas Eve, the lamps turned down, and someone always begins: \"This happened to a friend of mine.\"",
      artId: "the-fireside-tale",
    },
  ],
};

// --- Visitors' signature cards (02-december.md §2) ------------------------

// Mr Pockett is a fan allusion (giftOnly, the Chetney nod): dropped from a
// public build with his deck, his lines and the Fireside Circle seat.
export const mrPockett: Card = {
  id: "mr-pockett",
  rarity: "legendary",
  giftOnly: true,
  faces: [
    {
      name: "Mr Pockett",
      type: "character",
      family: "foundry",
      points: 2,
      keywords: { persist: true, moonrise: 3 },
      abilities: [{ trigger: "onPlay", effects: [{ effect: "draw", amount: 1 }] }],
      flavor: "The finest clockmaker in Bethnal Green. Doesn't want to talk about the full moon.",
      artId: "mr-pockett",
    },
  ],
};

// "Each of your other face-up Friend cards gets +1": the engine never
// targets the source card, so "other" needs no extra filter.
export const theGhostOfChristmasPresent: Card = {
  id: "ghost-of-christmas-present",
  rarity: "legendary",
  faces: [
    {
      name: "The Ghost of Christmas Present",
      type: "character",
      family: "salon",
      points: 4,
      keywords: { friend: 2 },
      abilities: [{ trigger: "onPlay", effects: [{ effect: "buff", target: { side: "self", count: EVERY_BOARD_CARD, filter: { hasKeyword: "friend" } }, amount: 1 }] }],
      flavor: "Has more than eighteen hundred brothers, and brought every one of them a mince pie.",
      artId: "ghost-of-christmas-present",
    },
  ],
};

// "Each opposing face-up card gets -1": one-shot buffs only ever pick from
// face-up cards (boardCandidates(..., true) in matchEngine.ts), so this works
// as printed.
export const theGhostOfChristmasYetToCome: Card = {
  id: "ghost-of-christmas-yet-to-come",
  rarity: "legendary",
  faces: [
    {
      name: "The Ghost of Christmas Yet to Come",
      type: "character",
      family: "rookery",
      points: 4,
      keywords: { elusive: true },
      abilities: [
        {
          trigger: "onPlay",
          effects: [
            { effect: "scry", amount: 3 },
            { effect: "buff", target: { side: "opponent", count: EVERY_BOARD_CARD }, amount: -1 },
          ],
        },
      ],
      flavor: "Says nothing. Points.",
      artId: "ghost-of-christmas-yet-to-come",
    },
  ],
};

export const ghostStoryCards: Card[] = [
  wassailBowl,
  yuleLog,
  aWhistleOnTheShingle,
  theFiresideTale,
  mrPockett,
  theGhostOfChristmasPresent,
  theGhostOfChristmasYetToCome,
];
