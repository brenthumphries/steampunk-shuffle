// Dr Jekyll / Mr Hyde (design.md §9.3): Salon front, Rookery back. Plays
// Jekyll in round one so round two opens with a 6-point Hyde already on
// the board, then plays round three around Hyde's liability.

import type { Deck } from "../../cardTypes.ts";
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

export const jekyllsDeck: Deck = [
  { card: parlourGuest, quantity: 1 },
  { card: amateurSleuth, quantity: 1 },
  { card: bramwell, quantity: 1 },
  { card: banshee, quantity: 2 },
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
  { card: regsLedger, quantity: 1 },
  { card: catBurglarStrikesAgain, quantity: 1 },
  { card: drJekyllMrHyde, quantity: 1 },
];
