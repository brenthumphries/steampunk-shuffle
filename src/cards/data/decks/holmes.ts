// Sherlock Holmes (design.md §9.3): Irregulars + Yard, the information
// game — cheap Elusive cards, holds his Flips for round three.
//
// Re-pointed plan step 4.0a-correction (PT-32): never touched by the
// first 4.0a pass. `npm run curve` showed the starter winning 58% even
// against the `legend` AI dial — a "coin flip" against the strongest AI
// this game has, per docs/newcomer-review.md. His original 38-pt,
// mostly-1-copy structure spread thin across 18 different shared cards
// traded consistency for breadth the same way Adler's did; doubled up on
// his strongest Persist/Flip/draw cards instead, dropped the weakest
// vanilla 1-pointers, and added `bakerStreet` (Irregulars' own
// continuous buff, previously unused by any deck).

import type { Deck } from "../../cardTypes.ts";
import {
  constableOnTheBeat,
  nightWatchman,
  sergeantPike,
  inspectorsWarrant,
  policeWhistle,
  charlotte,
  scotlandYardAnnouncesArrests,
  detectiveSergeantVale,
} from "../families/yard.ts";
import { bakerStreetIrregular, telegraphBoy, hiawatha, nellsBasket } from "../families/irregulars.ts";
import { bakerStreet } from "../locations.ts";
import { sherlockHolmes } from "../legends.ts";

export const holmesDeck: Deck = [
  { card: constableOnTheBeat, quantity: 1 },
  { card: nightWatchman, quantity: 1 },
  { card: sergeantPike, quantity: 2 },
  { card: inspectorsWarrant, quantity: 1 },
  { card: policeWhistle, quantity: 1 },
  { card: charlotte, quantity: 1 },
  { card: detectiveSergeantVale, quantity: 2 },
  { card: scotlandYardAnnouncesArrests, quantity: 1 },
  { card: bakerStreetIrregular, quantity: 2 },
  { card: telegraphBoy, quantity: 2 },
  { card: hiawatha, quantity: 2 },
  { card: nellsBasket, quantity: 2 },
  { card: bakerStreet, quantity: 1 },
  { card: sherlockHolmes, quantity: 1 },
];
