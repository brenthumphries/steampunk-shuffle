// Miss Prudence Hollis (design.md §9.1): Salon, Friend, Afternoon Tea, the
// cats. "Church Fete Stall" is plain deck-filler (see houseDeck.ts's note).
//
// Re-pointed plan step 4.0a-correction (PT-32): never touched by the first
// 4.0a pass. `npm run curve` showed the starter winning 83% against her
// original 32-pt deck. "Church Fete Stall" is a Gadget, capped at 2
// printed points (`POINT_RANGES`), so it can only absorb a small bump —
// the real fix is `theReadingRoom` (Salon's own continuous-buff Location,
// previously unused by any deck) plus a new deck-local Character with
// real Friend-chain weight, since Salon's whole identity is "individually
// weak, collectively strong" and her deck was neither strong nor dense
// enough in Friend cards to actually get there.
//
// Re-pointed again after the draw-mechanic change (see CLAUDE.md's
// gotcha): `tools/curve.ts`'s "played sensibly" read had the starter
// beating Hollis only 43% of the time (target ~60%) — the same
// Friend-chain-plus-Reading-Room combo that fixed PT-32 now overshoots.
// Trimmed The Vicar's Wife (her single strongest card, and the Friend
// keyword compounds with Reading Room's own continuous buff to every
// Salon Character on the board) from 2 copies to 1, backfilled with a
// second copy of Reading Room itself — inert padding, since only one
// Location is ever active at a time (design.md §5.6), so it adds zero
// points and zero synergy while holding the deck at 20 cards.
import type { Card, Deck } from "../../cardTypes.ts";
import {
  parlourGuest,
  amateurSleuth,
  bramwell,
  banshee,
  missHollisAuthoress,
  theHypnofrog,
  afternoonTea,
  seance,
  theSeasonsMostTalkedAboutEngagement,
} from "../families/salon.ts";
import { theReadingRoom } from "../locations.ts";

export const churchFeteStall: Card = {
  id: "church-fete-stall",
  rarity: "common",
  faces: [
    {
      name: "Church Fete Stall",
      type: "gadget",
      family: "salon",
      points: 2,
      keywords: { friend: 1 },
      flavor: "Raises four shillings for the roof fund and considerably more gossip.",
      artId: "church-fete-stall",
    },
  ],
};

// The Vicar's Wife (Hollis deck-local card, plan step 4.0a-correction):
// a Friend-chain anchor with real points behind it, so her drawing room
// isn't relying on Church Fete Stall's capped-at-2 gadget alone.
export const theVicarsWife: Card = {
  id: "the-vicars-wife",
  rarity: "rare",
  faces: [
    {
      name: "The Vicar's Wife",
      type: "character",
      family: "salon",
      points: 6,
      keywords: { friend: 1 },
      flavor: "Runs the fete, the choir, and the parish gossip, in that order of importance.",
      artId: "the-vicars-wife",
    },
  ],
};

export const hollisDeck: Deck = [
  { card: parlourGuest, quantity: 1 },
  { card: amateurSleuth, quantity: 2 },
  { card: bramwell, quantity: 1 },
  { card: banshee, quantity: 2 },
  { card: missHollisAuthoress, quantity: 2 },
  { card: theHypnofrog, quantity: 2 },
  { card: afternoonTea, quantity: 1 },
  { card: seance, quantity: 2 },
  { card: theSeasonsMostTalkedAboutEngagement, quantity: 2 },
  { card: churchFeteStall, quantity: 2 },
  { card: theVicarsWife, quantity: 1 },
  { card: theReadingRoom, quantity: 2 },
];
