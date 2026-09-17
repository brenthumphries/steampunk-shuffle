// Constable Tobias Mudd (design.md §9.1): Yard, "straight points, one
// Warrant". "Beat Partner" is plain deck-filler (see houseDeck.ts's note on
// why a 9-card family needs one to reach a legal 20-card deck).
//
// Re-pointed after the draw-mechanic change (see CLAUDE.md's gotcha):
// `tools/curve.ts`'s "played sensibly" read had the starter beating Mudd
// only 47% of the time (target ~60%). Every canonical Yard card was
// already at the 2-copy legal max, so there was no existing card to swap
// in as backfill — trimmed Sergeant Pike from 2 copies to 1 (also halves
// his Persist-carryover density, one of only two Persist cards in the
// deck) and added a second deck-local filler, "Desk Sergeant," to hold the
// 20-card count.

import type { Card, Deck } from "../../cardTypes.ts";
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

export const beatPartner: Card = {
  id: "beat-partner",
  rarity: "common",
  faces: [
    {
      name: "Beat Partner",
      type: "character",
      family: "yard",
      points: 2,
      flavor: "Walks the other half of Mudd's beat and never once complains about it.",
      artId: "beat-partner",
    },
  ],
};

// Second deck-local filler, added with the re-pointing above: backfills
// the slot freed by trimming Sergeant Pike to 1 copy.
export const deskSergeant: Card = {
  id: "desk-sergeant",
  rarity: "common",
  faces: [
    {
      name: "Desk Sergeant",
      type: "character",
      family: "yard",
      points: 1,
      flavor: "Minds the front desk, the lost-property cupboard, and the tea.",
      artId: "desk-sergeant",
    },
  ],
};

export const muddsDeck: Deck = [
  { card: constableOnTheBeat, quantity: 2 },
  { card: nightWatchman, quantity: 2 },
  { card: sergeantPike, quantity: 1 },
  { card: inspectorsWarrant, quantity: 2 },
  { card: policeWhistle, quantity: 2 },
  { card: charlotte, quantity: 2 },
  { card: constableReeve, quantity: 2 },
  { card: detectiveSergeantVale, quantity: 2 },
  { card: scotlandYardAnnouncesArrests, quantity: 2 },
  { card: beatPartner, quantity: 2 },
  { card: deskSergeant, quantity: 1 },
];
