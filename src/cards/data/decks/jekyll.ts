// Dr Jekyll / Mr Hyde (design.md §9.3): Salon front, Rookery back. Plays
// Jekyll in round one so round two opens with a 6-point Hyde already on
// the board, then plays round three around Hyde's liability.
//
// Re-pointed plan step 4.0a-correction (PT-32): the first 4.0a pass
// authored three deck-locals reaching 44 pts, but `npm run curve` (which
// runs the whole match on one fixed `legend` dial, not the per-round
// Jekyll/Hyde override `src/pub/opponents.ts` applies in the real app —
// see that file's own gotcha) still showed the starter winning 58%,
// "beating a Legend 2:1" per docs/newcomer-review.md. Bumped the three
// deck-locals further and swapped two of the weakest Salon vanillas for
// Rookery's own Flip tools (`regsLedger`/`catBurglarStrikesAgain`,
// previously unused here) for real tempo, not just points.
import type { Card, Deck } from "../../cardTypes.ts";
import { parlourGuest, amateurSleuth, bramwell, banshee, missHollisAuthoress, seance, theSeasonsMostTalkedAboutEngagement } from "../families/salon.ts";
import { pickpocket, forger, cracksman, fencesRunner, theLookout, emily, skeletonKey, regsLedger, catBurglarStrikesAgain } from "../families/rookery.ts";
import { drJekyllMrHyde } from "../legends.ts";

// Society Patron (Jekyll deck-local card, plan step 4.0a, re-pointed
// 4.0a-correction): elite Salon ally, Friend synergizes with Jekyll's own
// Friend 2.
export const societyPatron: Card = {
  id: "society-patron",
  rarity: "uncommon",
  faces: [
    {
      name: "Society Patron",
      type: "character",
      family: "salon",
      points: 6,
      keywords: { friend: 1 },
      flavor: "A respectable gentleman. Asks no questions about your guests.",
      artId: "society-patron",
    },
  ],
};

// Persistent Ally (Jekyll deck-local card, plan step 4.0a, re-pointed
// 4.0a-correction): steady Rookery operative, Persist mirrors Jekyll's
// own persistence.
export const persistentAlly: Card = {
  id: "persistent-ally",
  rarity: "uncommon",
  faces: [
    {
      name: "Persistent Ally",
      type: "character",
      family: "rookery",
      points: 6,
      keywords: { persist: true },
      flavor: "Doesn't leave. Can't be made to. Has your back through every round.",
      artId: "persistent-ally",
    },
  ],
};

// Shadow Confidant (Jekyll deck-local card, plan step 4.0a, re-pointed
// 4.0a-correction): trusted Salon confidant.
export const shadowConfidant: Card = {
  id: "shadow-confidant",
  rarity: "uncommon",
  faces: [
    {
      name: "Shadow Confidant",
      type: "character",
      family: "salon",
      points: 6,
      flavor: "Keeps your secrets. Helps dispose of your mistakes.",
      artId: "shadow-confidant",
    },
  ],
};

export const jekyllsDeck: Deck = [
  { card: parlourGuest, quantity: 1 },
  { card: amateurSleuth, quantity: 1 },
  { card: bramwell, quantity: 1 },
  { card: banshee, quantity: 1 },
  { card: missHollisAuthoress, quantity: 1 },
  { card: seance, quantity: 1 },
  { card: theSeasonsMostTalkedAboutEngagement, quantity: 1 },
  { card: pickpocket, quantity: 1 },
  { card: forger, quantity: 1 },
  { card: cracksman, quantity: 1 },
  { card: fencesRunner, quantity: 1 },
  { card: theLookout, quantity: 1 },
  { card: emily, quantity: 1 },
  { card: skeletonKey, quantity: 1 },
  { card: regsLedger, quantity: 1 },
  { card: catBurglarStrikesAgain, quantity: 1 },
  { card: societyPatron, quantity: 1 },
  { card: persistentAlly, quantity: 1 },
  { card: shadowConfidant, quantity: 1 },
  { card: drJekyllMrHyde, quantity: 1 },
];
