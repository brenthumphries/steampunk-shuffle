// The Cunning Folk (November, docs/plans/monthly/01-november.md §2-§3): the
// five event cards, the three visitors' signature legendaries (Mother
// Shipton, Dr John Dee, Mother Red Cap) and the Booth host's signature card,
// Pamela Colman Smith. Event cards, so they sit outside ALL_CARDS
// (./eventCards.ts). The visitors' decks are in ./decks/.

import type { Card } from "../cardTypes.ts";
import { EVERY_BOARD_CARD } from "./almanack.ts";

// --- Event cards (01-november.md §3) --------------------------------------

export const stirUpPudding: Card = {
  id: "stir-up-pudding",
  rarity: "common",
  faces: [
    {
      name: "Stir-up Pudding",
      type: "gadget",
      family: "neutral",
      points: 1,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "draw", amount: 1 }] }],
      flavor: "Stir it east to west, make a wish, and don't tell Sir Charles. He'll want to know the method.",
      artId: "stir-up-pudding",
    },
  ],
};

// "Each face-up card worth 1 or less" is a flip with no count cap, so the
// same whole-board count as Scorpio's. Flip respects Elusive (engine).
export const rememberRemember: Card = {
  id: "remember-remember",
  rarity: "uncommon",
  faces: [
    {
      name: "REMEMBER, REMEMBER",
      type: "headline",
      family: "neutral",
      points: 0,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "flip", target: { side: "each", count: EVERY_BOARD_CARD, filter: { maxPoints: 1 } } }] }],
      flavor: "Fireworks over the river. Everything small jumps.",
      artId: "remember-remember",
    },
  ],
};

export const oldMooresAlmanack: Card = {
  id: "old-moores-almanack",
  rarity: "uncommon",
  faces: [
    {
      name: "Old Moore's Almanack",
      type: "gadget",
      family: "neutral",
      points: 1,
      keywords: { persist: true },
      abilities: [{ trigger: "onPlay", effects: [{ effect: "scry", amount: 2 }] }],
      flavor: "Predicts the weather, the harvest and the deaths of kings. Has been right about the weather twice.",
      artId: "old-moores-almanack",
    },
  ],
};

// A Location: its buff is continuous and applies to both players' face-up
// Gadgets (no controller, so `each`).
export const thePetrifyingWell: Card = {
  id: "the-petrifying-well",
  rarity: "rare",
  faces: [
    {
      name: "The Petrifying Well",
      type: "location",
      family: "neutral",
      points: 0,
      abilities: [{ trigger: "continuous", effects: [{ effect: "buff", target: { side: "each", filter: { cardType: "gadget" } }, amount: 1 }] }],
      flavor: "Hang a hat in the water at Knaresborough and in a few months you have a stone hat. Sir Charles has three.",
      artId: "the-petrifying-well",
    },
  ],
};

export const pennyForTheGuy: Card = {
  id: "penny-for-the-guy",
  rarity: "uncommon",
  faces: [
    {
      name: "Penny for the Guy",
      type: "character",
      family: "irregulars",
      points: 1,
      keywords: { elusive: true, return: true },
      flavor: "A straw man in a borrowed coat, a handcart, and three boys who'd like a penny for him. They'll be back next year.",
      artId: "penny-for-the-guy",
    },
  ],
};

// --- Visitors' signature cards (01-november.md §2) ------------------------

// Persist keeps her on the table; the Scry is her whole ability.
export const motherShipton: Card = {
  id: "mother-shipton",
  rarity: "legendary",
  faces: [
    {
      name: "Mother Shipton",
      type: "character",
      family: "coven",
      points: 3,
      keywords: { persist: true },
      abilities: [{ trigger: "onPlay", effects: [{ effect: "scry", amount: 3 }] }],
      flavor: "Foretold carriages without horses and ships of iron. Was right about the weather, too.",
      artId: "mother-shipton",
    },
  ],
};

// Reveal first, so the Scry is read with the opponent's hand in mind.
export const johnDee: Card = {
  id: "john-dee",
  rarity: "legendary",
  faces: [
    {
      name: "Dr John Dee",
      type: "character",
      family: "coven",
      points: 4,
      abilities: [
        {
          trigger: "onPlay",
          effects: [
            { effect: "reveal", target: { side: "opponent" } },
            { effect: "scry", amount: 2 },
          ],
        },
      ],
      flavor: "Chose the Queen's coronation day by the stars. It went rather well.",
      artId: "john-dee",
    },
  ],
};

// The -2 and the Flip both pick from the opponent's face-up cards.
export const motherRedCap: Card = {
  id: "mother-red-cap",
  rarity: "legendary",
  faces: [
    {
      name: "Mother Red Cap",
      type: "character",
      family: "coven",
      points: 3,
      keywords: { elusive: true },
      abilities: [
        {
          trigger: "onPlay",
          effects: [
            { effect: "buff", target: { side: "opponent" }, amount: -2 },
            { effect: "flip", target: { side: "opponent", filter: { maxPoints: 1 } } },
          ],
        },
      ],
      flavor: "Half the pubs in north London are named after her. She drinks in none of them.",
      artId: "mother-red-cap",
    },
  ],
};

// --- The Booth host's signature card (01-november.md §2) -------------------

// Pixie is the Booth's host, never an opponent: this card is granted on her
// first reading (src/booth/booth.ts, PIXIE_CARD_ID).
export const pamelaColmanSmith: Card = {
  id: "pamela-colman-smith",
  rarity: "legendary",
  faces: [
    {
      name: "Pamela Colman Smith",
      type: "character",
      family: "salon",
      points: 2,
      keywords: { friend: 1 },
      abilities: [
        {
          trigger: "onPlay",
          effects: [
            { effect: "draw", amount: 1 },
            { effect: "scry", amount: 2 },
          ],
        },
      ],
      flavor: "Painted seventy-eight cards for a few pounds and no royalties. Reads for free.",
      artId: "pamela-colman-smith",
    },
  ],
};

export const cunningFolkEventCards: Card[] = [stirUpPudding, rememberRemember, oldMooresAlmanack, thePetrifyingWell, pennyForTheGuy];
export const cunningFolkSignatureCards: Card[] = [motherShipton, johnDee, motherRedCap, pamelaColmanSmith];
export const cunningFolkCards: Card[] = [...cunningFolkEventCards, ...cunningFolkSignatureCards];
