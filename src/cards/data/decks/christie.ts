// Agatha Christie (design.md §9.3): Salon, the Parlour Game with a twist —
// a Friend deck that Returns key cards so the drawing room fills again next
// round. Runs The Overnight Express when it suits her.
//
// Re-pointed plan step 4.0a-correction (PT-32): never touched by the
// first 4.0a pass. `npm run curve` showed the starter winning 58% against
// the `legend` AI dial — a mono-Salon deck at every family card's full 2
// copies still couldn't push effective points high enough for the
// strongest AI's search to find a real edge; Salon's own family curve is
// deliberately the lowest of the five (design.md §4), so there's a real
// ceiling here that raw copies alone can't clear. Added a new deck-local
// Character with real Friend-chain weight (replacing Afternoon Tea, whose
// Gadget type caps it at 2 printed points) plus `theReadingRoom`
// (previously unused), alongside her own Overnight Express.
//
// First attempt at The Reading Circle ran 2 copies at Friend +2 with an
// onPlay draw — combined with her own Season's Most Talked-About
// Engagement (+1 to every face-up Friend card) and The Reading Room's own
// continuous Salon buff, that stacked into the starter winning only 8%,
// well past the ~30% target. Cutting to a single copy at Friend +1 (no
// draw) overcorrected the other way, to 50% — a Friend engine is
// threshold-sensitive (whether "enough" Friend cards are face-up at once
// swings the buff multiplicatively, not additively), so halving the card
// count and halving its Friend value compounded into a much bigger drop
// than either change alone. Landed on 2 copies at the lower Friend +1
// value: keeps the density a Friend deck needs without the draw-fuelled
// double-Friend-2 engine that broke it the first time.
import type { Card, Deck } from "../../cardTypes.ts";
import {
  parlourGuest,
  amateurSleuth,
  bramwell,
  banshee,
  missHollisAuthoress,
  theHypnofrog,
  seance,
  theSeasonsMostTalkedAboutEngagement,
} from "../families/salon.ts";
import { theOvernightExpress, theReadingRoom } from "../locations.ts";
import { dameAgatha } from "../legends.ts";

// The Reading Circle (Christie deck-local card, plan step 4.0a-correction):
// a Friend-chain anchor with real points, since Salon's own Gadgets are
// capped at 2 printed points and can't carry that weight alone.
export const theReadingCircle: Card = {
  id: "the-reading-circle",
  rarity: "rare",
  faces: [
    {
      name: "The Reading Circle",
      type: "character",
      family: "salon",
      points: 6,
      keywords: { friend: 1 },
      flavor: "Meets Tuesdays, ostensibly for Trollope. Nobody has finished a Trollope in years.",
      artId: "the-reading-circle",
    },
  ],
};

export const christiesDeck: Deck = [
  { card: parlourGuest, quantity: 1 },
  { card: amateurSleuth, quantity: 2 },
  { card: bramwell, quantity: 2 },
  { card: banshee, quantity: 2 },
  { card: missHollisAuthoress, quantity: 2 },
  { card: theHypnofrog, quantity: 2 },
  { card: seance, quantity: 2 },
  { card: theSeasonsMostTalkedAboutEngagement, quantity: 2 },
  { card: theReadingCircle, quantity: 2 },
  { card: theReadingRoom, quantity: 1 },
  { card: theOvernightExpress, quantity: 1 },
  { card: dameAgatha, quantity: 1 },
];
