// Miss Prudence Hollis (design.md §9.1): Salon, Friend, Afternoon Tea, the
// cats. "Church Fete Stall" is plain deck-filler (see houseDeck.ts's note).

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

export const churchFeteStall: Card = {
  id: "church-fete-stall",
  rarity: "common",
  faces: [
    {
      name: "Church Fete Stall",
      type: "gadget",
      family: "salon",
      points: 1,
      keywords: { friend: 1 },
      flavor: "Raises four shillings for the roof fund and considerably more gossip.",
      artId: "church-fete-stall",
    },
  ],
};

export const hollisDeck: Deck = [
  { card: parlourGuest, quantity: 2 },
  { card: amateurSleuth, quantity: 2 },
  { card: bramwell, quantity: 2 },
  { card: banshee, quantity: 2 },
  { card: missHollisAuthoress, quantity: 2 },
  { card: theHypnofrog, quantity: 2 },
  { card: afternoonTea, quantity: 2 },
  { card: seance, quantity: 2 },
  { card: theSeasonsMostTalkedAboutEngagement, quantity: 2 },
  { card: churchFeteStall, quantity: 2 },
];
