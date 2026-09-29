// The Clockwork Pharaoh (seasonal-events-plan.md §3): a Hallowe'en visitor,
// Salon. Friend chains that the Pharaoh's own curse and the deck's Spirit
// Photographs keep alive. His signature card is an event card outside the
// labeled 60 (../halloween.ts); Spirit Photograph and The Witching Hour come
// from the Nightfall set (../nightfall.ts).
//
// Balanced with `npm run curve -- visitor seasoned` (target: starter wins
// 40-50%, seasonal-events-plan.md §5). The first pass, with two copies of
// Miss Hollis, left the starter at 39%; trimming her to one copy and
// backfilling with Prudence Hollis's Church Fete Stall (a deck-local Salon
// gadget, so no shared canonical card changed) brought it to 46%.

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
import { churchFeteStall } from "./prudenceHollis.ts";
import { clockworkPharaoh } from "../halloween.ts";
import { spiritPhotograph, theWitchingHour } from "../nightfall.ts";

export const pharaohsDeck: Deck = [
  { card: clockworkPharaoh, quantity: 1 },
  { card: parlourGuest, quantity: 2 },
  { card: amateurSleuth, quantity: 2 },
  { card: bramwell, quantity: 2 },
  { card: banshee, quantity: 2 },
  { card: missHollisAuthoress, quantity: 1 },
  { card: churchFeteStall, quantity: 1 },
  { card: theHypnofrog, quantity: 2 },
  { card: afternoonTea, quantity: 2 },
  { card: seance, quantity: 1 },
  { card: spiritPhotograph, quantity: 2 },
  { card: theSeasonsMostTalkedAboutEngagement, quantity: 1 },
  { card: theWitchingHour, quantity: 1 },
];
