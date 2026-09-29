// Mr Griffin, the Unseen (seasonal-events-plan.md §3): a Hallowe'en visitor,
// Irregulars. Elusive bodies, cheap draw, and Return effects — the deck
// nobody quite sees coming. His signature card, Mr Griffin, is an event
// card outside the labeled 60 (../halloween.ts); Turnip Lantern comes from
// the Nightfall set (../nightfall.ts).
//
// Balanced with `npm run curve -- visitor seasoned` (target: starter wins
// 40-50%, seasonal-events-plan.md §5). Irregulars' own cards top out at 3
// points, so a deck of just those and Nightfall cards left the starter
// winning 89% — "easier than a Regular" — the same finding that put deck-
// local cards on Adler's and Nell's decks (4.0a-correction, PT-32).
// Thomas Marvel and Mrs Hall are deck-local, named for the tramp and the
// landlady in Wells's *The Invisible Man*; Baker Street is Irregulars' own
// continuous-buff Location. The Witching Hour stays out of this deck: only
// one Location is ever active (design.md §5.6), so a second one is padding
// that can also overwrite the first.

import type { Card, Deck } from "../../cardTypes.ts";
import {
  flowerSeller,
  cabDriver,
  bakerStreetIrregular,
  telegraphBoy,
  hiawatha,
  nellsBasket,
  anonymousTip,
} from "../families/irregulars.ts";
import { bakerStreet } from "../locations.ts";
import { mrGriffin } from "../halloween.ts";
import { turnipLantern } from "../nightfall.ts";

// Thomas Marvel (Griffin deck-local card): the tramp who carried the books
// and never once admitted to it. Elusive, like everyone who works for him.
export const thomasMarvel: Card = {
  id: "thomas-marvel",
  rarity: "uncommon",
  faces: [
    {
      name: "Thomas Marvel",
      type: "character",
      family: "irregulars",
      points: 5,
      keywords: { elusive: true },
      flavor: "Carried the books, spent the money, and still insists he was never there.",
      artId: "thomas-marvel",
    },
  ],
};

// Mrs Hall (Griffin deck-local card): the landlady of the Coach and Horses,
// who wanted the rent and never did get to ask why the lodger kept his
// bandages on at breakfast.
export const mrsHall: Card = {
  id: "mrs-hall",
  rarity: "common",
  faces: [
    {
      name: "Mrs Hall",
      type: "character",
      family: "irregulars",
      points: 4,
      flavor: "Wanted the rent, the bandages explained, and a great deal fewer questions about the furniture.",
      artId: "mrs-hall",
    },
  ],
};

export const griffinsDeck: Deck = [
  { card: mrGriffin, quantity: 1 },
  { card: flowerSeller, quantity: 2 },
  { card: bakerStreetIrregular, quantity: 2 },
  { card: cabDriver, quantity: 2 },
  { card: telegraphBoy, quantity: 2 },
  { card: hiawatha, quantity: 2 },
  { card: nellsBasket, quantity: 1 },
  { card: anonymousTip, quantity: 2 },
  { card: thomasMarvel, quantity: 2 },
  { card: mrsHall, quantity: 2 },
  { card: turnipLantern, quantity: 1 },
  { card: bakerStreet, quantity: 1 },
];
