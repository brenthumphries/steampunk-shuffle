// "Dodgy" Reg Farrow (design.md §9.1): Rookery, Return tricks, one Flip.
//
// Re-pointed plan step 4.0a-correction (PT-32): never touched by the first
// 4.0a pass at all (that pass only re-authored Nell/Lovelace/Adler/Jekyll).
// `npm run curve` showed the starter winning 88% against his original
// 32-pt deck — Rookery has no dedicated buff Location among the 8
// authored (unlike Yard/Foundry/Salon/Irregulars, each of which has one),
// so the fix leans entirely on strengthening "Errand Runner," the one
// deck-local card available to change without touching shared canon.
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
      points: 5,
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
