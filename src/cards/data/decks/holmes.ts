// Sherlock Holmes (design.md §9.3): Irregulars + Yard, the information
// game — cheap Elusive cards, holds his Flips for round three.

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
  flowerSeller,
  cabDriver,
  theMudlark,
  bakerStreetIrregular,
  telegraphBoy,
  hiawatha,
  nellsBasket,
  anonymousTip,
  goodNewsEverybody,
} from "../families/irregulars.ts";
import { sherlockHolmes } from "../legends.ts";

export const holmesDeck: Deck = [
  { card: constableOnTheBeat, quantity: 1 },
  { card: nightWatchman, quantity: 1 },
  { card: sergeantPike, quantity: 1 },
  { card: inspectorsWarrant, quantity: 1 },
  { card: policeWhistle, quantity: 1 },
  { card: charlotte, quantity: 1 },
  { card: constableReeve, quantity: 1 },
  { card: detectiveSergeantVale, quantity: 1 },
  { card: scotlandYardAnnouncesArrests, quantity: 1 },
  { card: flowerSeller, quantity: 1 },
  { card: cabDriver, quantity: 1 },
  { card: theMudlark, quantity: 1 },
  { card: bakerStreetIrregular, quantity: 2 },
  { card: telegraphBoy, quantity: 1 },
  { card: hiawatha, quantity: 1 },
  { card: nellsBasket, quantity: 1 },
  { card: anonymousTip, quantity: 1 },
  { card: goodNewsEverybody, quantity: 1 },
  { card: sherlockHolmes, quantity: 1 },
];
