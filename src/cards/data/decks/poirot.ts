// Hercule Poirot (design.md §9.3): Yard + Salon, order and method —
// Persist officers, then Poirot in round three to remove the biggest thing
// on the opponent's side.

import type { Deck } from "../../cardTypes.ts";
import {
  constableOnTheBeat,
  nightWatchman,
  sergeantPike,
  inspectorsWarrant,
  policeWhistle,
  charlotte,
  constableReeve,
  detectiveSergeantVale,
  scotlandYardAnnouncesArrests,
} from "../families/yard.ts";
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
import { herculePoirot } from "../legends.ts";

export const poirotsDeck: Deck = [
  { card: constableOnTheBeat, quantity: 1 },
  { card: nightWatchman, quantity: 1 },
  { card: sergeantPike, quantity: 1 },
  { card: inspectorsWarrant, quantity: 1 },
  { card: policeWhistle, quantity: 1 },
  { card: charlotte, quantity: 2 },
  { card: constableReeve, quantity: 1 },
  { card: detectiveSergeantVale, quantity: 1 },
  { card: scotlandYardAnnouncesArrests, quantity: 1 },
  { card: parlourGuest, quantity: 1 },
  { card: amateurSleuth, quantity: 1 },
  { card: bramwell, quantity: 1 },
  { card: banshee, quantity: 1 },
  { card: missHollisAuthoress, quantity: 1 },
  { card: theHypnofrog, quantity: 1 },
  { card: afternoonTea, quantity: 1 },
  { card: seance, quantity: 1 },
  { card: theSeasonsMostTalkedAboutEngagement, quantity: 1 },
  { card: herculePoirot, quantity: 1 },
];
