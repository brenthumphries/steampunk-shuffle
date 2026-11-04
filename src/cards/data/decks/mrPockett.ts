// Mr Pockett, Toymaker (December visitor, Foundry + Irregulars, docs/plans/
// monthly/02-december.md §2): seasoned dial, the toy-maker's Persist and Draw
// shell over cheap Foundry bodies and Irregular street trade. Giftonly (the
// Chetney allusion): dropped from a public build with the rest of his deck.

import type { Deck } from "../../cardTypes.ts";
import { apprenticeFitter, boilerHand, riveter, brassCog, steamHammer, sabotage } from "../families/foundry.ts";
import { flowerSeller, theMudlark, bakerStreetIrregular, cabDriver, telegraphBoy } from "../families/irregulars.ts";
import { mrPockett, aWhistleOnTheShingle } from "../ghostStory.ts";

export const mrPocketts: Deck = [
  { card: mrPockett, quantity: 1 },
  { card: apprenticeFitter, quantity: 2 },
  { card: boilerHand, quantity: 2 },
  { card: riveter, quantity: 2 },
  { card: brassCog, quantity: 2 },
  { card: flowerSeller, quantity: 2 },
  { card: theMudlark, quantity: 2 },
  { card: bakerStreetIrregular, quantity: 2 },
  { card: steamHammer, quantity: 1 },
  { card: telegraphBoy, quantity: 1 },
  { card: cabDriver, quantity: 1 },
  { card: sabotage, quantity: 1 },
  { card: aWhistleOnTheShingle, quantity: 1 },
];
