// Professor Moriarty (design.md §9.3): Rookery + Foundry ("Sabotage").
// Round one is a feint, round two he Persists something ugly, round three
// is arithmetic — and he'll play The Reichenbach Falls when behind.

import type { Deck } from "../../cardTypes.ts";
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
import { theReichenbachFalls } from "../locations.ts";
import { professorMoriarty } from "../legends.ts";

export const moriartysDeck: Deck = [
  { card: pickpocket, quantity: 1 },
  { card: forger, quantity: 1 },
  { card: cracksman, quantity: 1 },
  { card: fencesRunner, quantity: 1 },
  { card: theLookout, quantity: 1 },
  { card: emily, quantity: 1 },
  { card: skeletonKey, quantity: 1 },
  { card: regsLedger, quantity: 1 },
  { card: catBurglarStrikesAgain, quantity: 1 },
  { card: apprenticeFitter, quantity: 1 },
  { card: boilerHand, quantity: 1 },
  { card: riveter, quantity: 1 },
  { card: steamHammer, quantity: 1 },
  { card: foremanGudgeon, quantity: 1 },
  { card: differenceEngine, quantity: 1 },
  { card: brassCog, quantity: 1 },
  { card: sabotage, quantity: 1 },
  { card: partyTimeExcellent, quantity: 1 },
  { card: theReichenbachFalls, quantity: 1 },
  { card: professorMoriarty, quantity: 1 },
];
