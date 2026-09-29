// Spring-Heeled Jack (seasonal-events-plan.md §3.3): the All Hallows' Wake's
// own legend, not a visitor — he sits at the table only inside that
// tournament, plays the `legend` dial, and his card is the tournament's
// prize (../halloween.ts). Rookery: Elusive, Return and Flip, hard to pin
// down, with Grave Robber and Resurrection Man from the Nightfall set
// (../nightfall.ts) so his Flips don't cost him anything he'd meant to keep.
//
// Balanced with `npm run curve -- wake seasoned` (target: starter wins about
// 30% against a Legend, design.md §9.3). The first pass left the starter at
// 50%; Renfield (the Count's deck-local body, ./count.ts) and a second
// Forger in place of a Pickpocket and Skeleton Key brought it to 29%
// (n=24, legend dial is slow).

import type { Deck } from "../../cardTypes.ts";
import {
  pickpocket,
  forger,
  cracksman,
  fencesRunner,
  theLookout,
  emily,
  regsLedger,
  catBurglarStrikesAgain,
} from "../families/rookery.ts";
import { renfield } from "./count.ts";
import { springHeeledJack } from "../halloween.ts";
import { graveRobber, resurrectionMan } from "../nightfall.ts";

export const jacksDeck: Deck = [
  { card: springHeeledJack, quantity: 1 },
  { card: pickpocket, quantity: 1 },
  { card: renfield, quantity: 1 },
  { card: forger, quantity: 2 },
  { card: cracksman, quantity: 2 },
  { card: fencesRunner, quantity: 2 },
  { card: theLookout, quantity: 2 },
  { card: emily, quantity: 2 },
  { card: regsLedger, quantity: 2 },
  { card: catBurglarStrikesAgain, quantity: 1 },
  { card: graveRobber, quantity: 2 },
  { card: resurrectionMan, quantity: 2 },
];
