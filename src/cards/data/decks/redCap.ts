// Mother Red Cap (the Almanack Stakes boss, Coven + Rookery, docs/
// plans/monthly/01-november.md §2 and §5): legend dial, tournament only, so
// she is never in Tonight's Patrons. Elusive Rookery bodies around a
// Coven hex core.

import type { Deck } from "../../cardTypes.ts";
import { pickpocket, forger, cracksman, fencesRunner, theLookout, emily, skeletonKey, regsLedger } from "../families/rookery.ts";
import { motherRedCap, oldMooresAlmanack } from "../cunningFolk.ts";
import { hedgeWitch, cunningWoman, witchBottle } from "../families/coven.ts";
import { resurrectionMan } from "../nightfall.ts";

export const redCapsDeck: Deck = [
  { card: motherRedCap, quantity: 1 },
  { card: hedgeWitch, quantity: 2 },
  { card: cunningWoman, quantity: 2 },
  { card: witchBottle, quantity: 1 },
  { card: pickpocket, quantity: 2 },
  { card: forger, quantity: 2 },
  { card: cracksman, quantity: 2 },
  { card: fencesRunner, quantity: 2 },
  { card: theLookout, quantity: 1 },
  { card: emily, quantity: 1 },
  { card: skeletonKey, quantity: 1 },
  { card: regsLedger, quantity: 1 },
  { card: resurrectionMan, quantity: 1 },
  { card: oldMooresAlmanack, quantity: 1 },
];
