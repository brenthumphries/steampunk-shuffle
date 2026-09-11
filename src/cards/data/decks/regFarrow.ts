// "Dodgy" Reg Farrow (design.md §9.1): Rookery, Return tricks, one Flip.
// "Errand Runner" is plain deck-filler (see houseDeck.ts's note).

import type { Card, Deck } from "../../cardTypes.ts";
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

export const errandRunner: Card = {
  id: "errand-runner",
  rarity: "common",
  faces: [
    {
      name: "Errand Runner",
      type: "character",
      family: "rookery",
      points: 1,
      keywords: { return: true },
      flavor: "Delivers the parcel, delivers the message, delivers himself right back to Reg.",
      artId: "errand-runner",
    },
  ],
};

export const regsDeck: Deck = [
  { card: pickpocket, quantity: 2 },
  { card: forger, quantity: 2 },
  { card: cracksman, quantity: 2 },
  { card: fencesRunner, quantity: 2 },
  { card: theLookout, quantity: 2 },
  { card: emily, quantity: 2 },
  { card: skeletonKey, quantity: 2 },
  { card: regsLedger, quantity: 2 },
  { card: catBurglarStrikesAgain, quantity: 2 },
  { card: errandRunner, quantity: 2 },
];
