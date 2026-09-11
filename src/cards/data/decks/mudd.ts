// Constable Tobias Mudd (design.md §9.1): Yard, "straight points, one
// Warrant". "Beat Partner" is plain deck-filler (see houseDeck.ts's note on
// why a 9-card family needs one to reach a legal 20-card deck).

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

export const muddsDeck: Deck = [
  { card: constableOnTheBeat, quantity: 2 },
  { card: nightWatchman, quantity: 2 },
  { card: sergeantPike, quantity: 2 },
  { card: inspectorsWarrant, quantity: 2 },
  { card: policeWhistle, quantity: 2 },
  { card: charlotte, quantity: 2 },
  { card: constableReeve, quantity: 2 },
  { card: detectiveSergeantVale, quantity: 2 },
  { card: scotlandYardAnnouncesArrests, quantity: 2 },
  { card: beatPartner, quantity: 2 },
];
