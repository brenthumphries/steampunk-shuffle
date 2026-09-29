// The Galvanic Creature (seasonal-events-plan.md §3): a Hallowe'en visitor,
// Foundry. Heavy bodies, and Undying on the top of the curve so the big
// cards keep coming back. His signature card, The Creature, is an event card
// outside the labeled 60 (../halloween.ts); Galvanic Battery and Turnip
// Lantern come from the Nightfall set (../nightfall.ts).
//
// Balanced with `npm run curve -- visitor seasoned`: first pass, starter
// wins 48% (n=200), inside the 40-50% target (seasonal-events-plan.md §5).

import type { Deck } from "../../cardTypes.ts";
import {
  apprenticeFitter,
  boilerHand,
  riveter,
  steamHammer,
  foremanGudgeon,
  differenceEngine,
  brassCog,
  sabotage,
  partyTimeExcellent,
} from "../families/foundry.ts";
import { theCreature } from "../halloween.ts";
import { galvanicBattery, turnipLantern } from "../nightfall.ts";

export const creaturesDeck: Deck = [
  { card: theCreature, quantity: 1 },
  { card: apprenticeFitter, quantity: 2 },
  { card: boilerHand, quantity: 2 },
  { card: riveter, quantity: 2 },
  { card: steamHammer, quantity: 2 },
  { card: foremanGudgeon, quantity: 1 },
  { card: differenceEngine, quantity: 1 },
  { card: brassCog, quantity: 2 },
  { card: sabotage, quantity: 2 },
  { card: partyTimeExcellent, quantity: 1 },
  { card: galvanicBattery, quantity: 2 },
  { card: turnipLantern, quantity: 2 },
];
