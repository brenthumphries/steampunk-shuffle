// Agatha Christie (design.md §9.3): Salon, the Parlour Game with a twist —
// a Friend deck that Returns key cards so the drawing room fills again next
// round. Runs The Overnight Express when it suits her.

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
import { theOvernightExpress } from "../locations.ts";
import { dameAgatha } from "../legends.ts";

export const christiesDeck: Deck = [
  { card: parlourGuest, quantity: 2 },
  { card: amateurSleuth, quantity: 2 },
  { card: bramwell, quantity: 2 },
  { card: banshee, quantity: 2 },
  { card: missHollisAuthoress, quantity: 2 },
  { card: theHypnofrog, quantity: 2 },
  { card: afternoonTea, quantity: 2 },
  { card: seance, quantity: 2 },
  { card: theSeasonsMostTalkedAboutEngagement, quantity: 2 },
  { card: theOvernightExpress, quantity: 1 },
  { card: dameAgatha, quantity: 1 },
];
