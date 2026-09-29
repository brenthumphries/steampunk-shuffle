// The Carpathian Count (seasonal-events-plan.md §3): a Hallowe'en visitor,
// Rookery. Flip-heavy, and built around Undying: what he Flips he means to
// keep, and what's Flipped in return comes home again. His signature card,
// The Count, is an event card outside the labeled 60 (../halloween.ts); Grave
// Robber and Resurrection Man come from the Nightfall set (../nightfall.ts).

import type { Card, Deck } from "../../cardTypes.ts";
import {
  pickpocket,
  forger,
  cracksman,
  fencesRunner,
  theLookout,
  emily,
  regsLedger,
  catBurglarStrikesAgain,
} from "../families/rookery.ts";
import { theCount } from "../halloween.ts";
import { graveRobber, resurrectionMan } from "../nightfall.ts";

// Renfield (Count deck-local card): the Count's patient, who eats what he's
// given and promises anything. A plain heavy body — Rookery's own cards are
// mostly small Elusive ones, and the first pass of this deck left the
// starter winning 52% (target 40-50%, seasonal-events-plan.md §5).
export const renfield: Card = {
  id: "renfield",
  rarity: "uncommon",
  faces: [
    {
      name: "Renfield",
      type: "character",
      family: "rookery",
      points: 5,
      flavor: "Eats what he's given, promises what he's asked, and has never once been thanked.",
      artId: "renfield",
    },
  ],
};

export const countsDeck: Deck = [
  { card: theCount, quantity: 1 },
  { card: pickpocket, quantity: 1 },
  { card: renfield, quantity: 1 },
  { card: forger, quantity: 2 },
  { card: cracksman, quantity: 2 },
  { card: fencesRunner, quantity: 2 },
  { card: theLookout, quantity: 2 },
  { card: emily, quantity: 2 },
  { card: regsLedger, quantity: 2 },
  { card: catBurglarStrikesAgain, quantity: 1 },
  { card: graveRobber, quantity: 2 },
  { card: resurrectionMan, quantity: 2 },
];
