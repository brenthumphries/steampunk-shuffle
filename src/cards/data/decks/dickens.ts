// Charles Dickens (design.md §9.2): Salon, the Parlour Game — Friend and
// draw, Return cards that come back every round. His reward card, Next
// Instalment, is an extra beyond the labeled 60 (see ../README.md).

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

export const nextInstalment: Card = {
  id: "next-instalment",
  rarity: "uncommon",
  faces: [
    {
      name: "Next Instalment",
      type: "gadget",
      family: "salon",
      points: 1,
      keywords: { return: true, friend: 1 },
      flavor: "You'll have to wait for the ending. Everyone does.",
      artId: "next-instalment",
    },
  ],
};

export const dickensDeck: Deck = [
  { card: parlourGuest, quantity: 2 },
  { card: amateurSleuth, quantity: 2 },
  { card: bramwell, quantity: 2 },
  { card: banshee, quantity: 2 },
  { card: missHollisAuthoress, quantity: 2 },
  { card: theHypnofrog, quantity: 2 },
  { card: afternoonTea, quantity: 2 },
  { card: seance, quantity: 2 },
  { card: theSeasonsMostTalkedAboutEngagement, quantity: 2 },
  { card: nextInstalment, quantity: 2 },
];
