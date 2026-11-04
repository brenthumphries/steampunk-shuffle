// The Ghost of Christmas Present (December visitor, Salon + Yard, docs/plans/
// monthly/02-december.md §2): seasoned dial, Friend synergy. Salon Friends
// and Yard constables, with the Christmas Eve wassail and a Parsonage Snug.

import type { Deck } from "../../cardTypes.ts";
import { parlourGuest, amateurSleuth, bramwell, banshee, theHypnofrog, afternoonTea, seance } from "../families/salon.ts";
import { constableReeve, charlotte } from "../families/yard.ts";
import { nightConstable } from "../nightfall.ts";
import { theParsonageSnug } from "../locations.ts";
import { theGhostOfChristmasPresent, wassailBowl } from "../ghostStory.ts";

export const ghostOfChristmasPresentsDeck: Deck = [
  { card: theGhostOfChristmasPresent, quantity: 1 },
  { card: parlourGuest, quantity: 2 },
  { card: amateurSleuth, quantity: 2 },
  { card: bramwell, quantity: 2 },
  { card: banshee, quantity: 1 },
  { card: theHypnofrog, quantity: 1 },
  { card: constableReeve, quantity: 2 },
  { card: nightConstable, quantity: 2 },
  { card: charlotte, quantity: 2 },
  { card: wassailBowl, quantity: 2 },
  { card: theParsonageSnug, quantity: 1 },
  { card: afternoonTea, quantity: 1 },
  { card: seance, quantity: 1 },
];
