// The Village Constable — the tutorial-locked starter deck (design.md §8.3).
// Used as the canonical legal fixture: 20 cards, 37 printed points.

import type { Card, Deck } from "../../../../src/cards/cardTypes.ts";

function card(partial: Omit<Card, "tutorialLocked">): Card {
  return { ...partial, tutorialLocked: true };
}

export const constableOnTheBeat = card({
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

export const nightWatchman = card({
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

export const sergeantPike = card({
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

export const inspectorsWarrant = card({
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

export const policeWhistle = card({
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

export const charlotte = card({
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

export const parlourGuest = card({
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

export const amateurSleuth = card({
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

export const bramwell = card({
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

export const seance = card({
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

export const afternoonTea = card({
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

export const theParsonageSnug = card({
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
          effects: [{ effect: "buff", target: { side: "each", filter: {} }, amount: 1 }],
        },
      ],
      flavor: "Where the cats sleep. Named for a house in Haworth none of them have visited.",
      artId: "the-parsonage-snug",
    },
  ],
});

export const hiawatha = card({
  id: "hiawatha",
  rarity: "rare",
  faces: [
    {
      name: "Hiawatha",
      type: "character",
      family: "irregulars",
      points: 2,
      keywords: { elusive: true, friend: 1 },
      abilities: [
        {
          trigger: "onPlay",
          effects: [{ effect: "flip", target: { side: "opponent", filter: { maxPoints: 2 } } }],
        },
      ],
      flavor: "He called from down the hall and round the corner. You went. That was the mistake.",
      artId: "hiawatha",
    },
  ],
});

export const emily = card({
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
});

export const starterDeckCards: Card[] = [
  constableOnTheBeat,
  nightWatchman,
  sergeantPike,
  inspectorsWarrant,
  policeWhistle,
  charlotte,
  parlourGuest,
  amateurSleuth,
  bramwell,
  seance,
  afternoonTea,
  theParsonageSnug,
  hiawatha,
  emily,
];

// Quantities per design.md §8.3.
export const starterDeck: Deck = [
  { card: constableOnTheBeat, quantity: 2 },
  { card: nightWatchman, quantity: 2 },
  { card: sergeantPike, quantity: 1 },
  { card: inspectorsWarrant, quantity: 2 },
  { card: policeWhistle, quantity: 2 },
  { card: charlotte, quantity: 1 },
  { card: parlourGuest, quantity: 2 },
  { card: amateurSleuth, quantity: 1 },
  { card: bramwell, quantity: 1 },
  { card: seance, quantity: 1 },
  { card: afternoonTea, quantity: 2 },
  { card: theParsonageSnug, quantity: 1 },
  { card: hiawatha, quantity: 1 },
  { card: emily, quantity: 1 },
];
