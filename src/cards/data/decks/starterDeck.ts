// The Village Constable — the tutorial-locked starter deck (design.md
// §8.3): Yard + Salon, 20 cards, 37 printed points. Canonical here;
// tests/unit/cards/fixtures/starterDeck.ts re-exports these rather than
// duplicating them.

import type { Deck } from "../../cardTypes.ts";
import {
  constableOnTheBeat,
  nightWatchman,
  sergeantPike,
  inspectorsWarrant,
  policeWhistle,
  charlotte,
} from "../families/yard.ts";
import { parlourGuest, amateurSleuth, bramwell, seance, afternoonTea } from "../families/salon.ts";
import { theParsonageSnug } from "../locations.ts";
import { hiawatha } from "../families/irregulars.ts";
import { emily } from "../families/rookery.ts";

// Quantities per design.md §8.3.
export const starterDeck: Deck = [
  { card: constableOnTheBeat, quantity: 2 },
  { card: nightWatchman, quantity: 2 },
  { card: sergeantPike, quantity: 1 },
  { card: inspectorsWarrant, quantity: 2 },
  { card: policeWhistle, quantity: 2 },
  { card: charlotte, quantity: 1 },
  { card: parlourGuest, quantity: 2 },
  { card: amateurSleuth, quantity: 1 },
  { card: bramwell, quantity: 1 },
  { card: seance, quantity: 1 },
  { card: afternoonTea, quantity: 2 },
  { card: theParsonageSnug, quantity: 1 },
  { card: hiawatha, quantity: 1 },
  { card: emily, quantity: 1 },
];
