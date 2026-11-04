// The Ghost of Christmas Yet to Come (December tournament boss, Rookery +
// Coven, docs/plans/monthly/02-december.md §2): legend dial, tournament only
// (Fireside Circle, §6), so never in Tonight's Patrons. Elusive Rookery
// bodies around a Coven hex and Scry core.

import type { Deck } from "../../cardTypes.ts";
import { pickpocket, forger, cracksman, fencesRunner, theLookout, skeletonKey, regsLedger } from "../families/rookery.ts";
import { hedgeWitch, cunningWoman, witchBottle, saltAtTheThreshold } from "../families/coven.ts";
import { resurrectionMan, graveRobber } from "../nightfall.ts";
import { oldMooresAlmanack } from "../cunningFolk.ts";
import { theGhostOfChristmasYetToCome } from "../ghostStory.ts";

export const ghostOfChristmasYetToComesDeck: Deck = [
  { card: theGhostOfChristmasYetToCome, quantity: 1 },
  { card: pickpocket, quantity: 2 },
  { card: forger, quantity: 1 },
  { card: cracksman, quantity: 1 },
  { card: fencesRunner, quantity: 2 },
  { card: theLookout, quantity: 1 },
  { card: skeletonKey, quantity: 1 },
  { card: regsLedger, quantity: 1 },
  { card: graveRobber, quantity: 2 },
  { card: resurrectionMan, quantity: 1 },
  { card: hedgeWitch, quantity: 2 },
  { card: cunningWoman, quantity: 2 },
  { card: witchBottle, quantity: 1 },
  { card: saltAtTheThreshold, quantity: 1 },
  { card: oldMooresAlmanack, quantity: 1 },
];
