// Dr Jekyll / Mr Hyde (design.md §9.3): Salon front, Rookery back. Plays
// Jekyll in round one so round two opens with a 6-point Hyde already on
// the board, then plays round three around Hyde's liability.

import type { Card, Deck } from "../../cardTypes.ts";
import {
  parlourGuest,
  amateurSleuth,
  bramwell,
  banshee,
  missHollisAuthoress,
  theHypnofrog,
  afternoonTea,
  seance,
  theSeasonsMostTalkedAboutEngagement,
} from "../families/salon.ts";
import {
  pickpocket,
  forger,
  cracksman,
  fencesRunner,
  theLookout,
  emily,
  skeletonKey,
  regsLedger,
  catBurglarStrikesAgain,
} from "../families/rookery.ts";
import { drJekyllMrHyde } from "../legends.ts";

// Society Patron (Jekyll deck-local card, plan step 4.0a): elite Salon ally.
// Friend keyword synergizes with Jekyll's Friend 2 mechanic; 5 pts mid-range boost.
export const societyPatron: Card = {
  id: "society-patron",
  rarity: "uncommon",
  faces: [
    {
      name: "Society Patron",
      type: "character",
      family: "salon",
      points: 5,
      keywords: { friend: 1 },
      flavor: "A respectable gentleman. Asks no questions about your guests.",
      artId: "society-patron",
    },
  ],
};

// Persistent Ally (Jekyll deck-local card, plan step 4.0a): steady Rookery operative.
// Persist keyword mirrors Jekyll's own persistence; stays on board across rounds.
export const persistentAlly: Card = {
  id: "persistent-ally",
  rarity: "uncommon",
  faces: [
    {
      name: "Persistent Ally",
      type: "character",
      family: "rookery",
      points: 4,
      keywords: { persist: true },
      flavor: "Doesn't leave. Can't be made to. Has your back through every round.",
      artId: "persistent-ally",
    },
  ],
};

// Shadow Confidant (Jekyll deck-local card, plan step 4.0a): trusted Salon confidant.
// No keywords—vanilla 3 pts fills the 45–54 pt Legend band cleanly.
export const shadowConfidant: Card = {
  id: "shadow-confidant",
  rarity: "uncommon",
  faces: [
    {
      name: "Shadow Confidant",
      type: "character",
      family: "salon",
      points: 3,
      flavor: "Keeps your secrets. Helps dispose of your mistakes.",
      artId: "shadow-confidant",
    },
  ],
};

export const jekyllsDeck: Deck = [
  { card: parlourGuest, quantity: 1 },
  { card: amateurSleuth, quantity: 1 },
  { card: bramwell, quantity: 1 },
  { card: banshee, quantity: 1 },
  { card: missHollisAuthoress, quantity: 1 },
  { card: theHypnofrog, quantity: 1 },
  { card: afternoonTea, quantity: 1 },
  { card: seance, quantity: 1 },
  { card: theSeasonsMostTalkedAboutEngagement, quantity: 1 },
  { card: pickpocket, quantity: 1 },
  { card: forger, quantity: 1 },
  { card: cracksman, quantity: 1 },
  { card: fencesRunner, quantity: 1 },
  { card: theLookout, quantity: 1 },
  { card: emily, quantity: 1 },
  { card: skeletonKey, quantity: 1 },
  { card: societyPatron, quantity: 1 },
  { card: persistentAlly, quantity: 1 },
  { card: shadowConfidant, quantity: 1 },
  { card: drJekyllMrHyde, quantity: 1 },
];
