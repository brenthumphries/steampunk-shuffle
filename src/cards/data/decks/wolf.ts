// The Hampstead Wolf (seasonal-events-plan.md §3): a Hallowe'en visitor,
// Yard. Steady bodies that look mild until the last round, then bite:
// Moonrise. His signature card, The Gentleman of the Heath, is an event card
// outside the labeled 60 (../halloween.ts); Night Constable, Lamplighter at
// Dusk and Turnip Lantern come from the Nightfall set (../nightfall.ts).
//
// Balanced with `npm run curve -- visitor seasoned`: first pass, starter
// wins 44% (n=200), inside the 40-50% target (seasonal-events-plan.md §5).

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
import { gentlemanOfTheHeath } from "../halloween.ts";
import { nightConstable, lamplighterAtDusk, turnipLantern } from "../nightfall.ts";

export const wolfsDeck: Deck = [
  { card: gentlemanOfTheHeath, quantity: 1 },
  { card: constableOnTheBeat, quantity: 2 },
  { card: nightWatchman, quantity: 2 },
  { card: sergeantPike, quantity: 1 },
  { card: inspectorsWarrant, quantity: 1 },
  { card: policeWhistle, quantity: 2 },
  { card: charlotte, quantity: 1 },
  { card: constableReeve, quantity: 2 },
  { card: detectiveSergeantVale, quantity: 1 },
  { card: scotlandYardAnnouncesArrests, quantity: 1 },
  { card: nightConstable, quantity: 2 },
  { card: lamplighterAtDusk, quantity: 2 },
  { card: turnipLantern, quantity: 2 },
];
