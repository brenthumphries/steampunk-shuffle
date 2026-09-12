// Card ownership (plan step 4.0d, PT-1): what the player actually has to
// build decks from. Flagged unbuilt since 2.2 — every one of the 60 v1
// cards had a live "+" in the deck builder from the first minute, which
// made design.md §11's Checks economy (Lost & Found, the Pawnbroker, Bar
// Bet, first-win rewards) buy nothing that wasn't already free.
//
// Owned = the starter deck's fixed composition (design.md §8.3 — she's
// given it at the end of the tutorial, it's always hers) plus
// `PubState.collection`. A `foil:<id>` collection entry (src/pub/
// tinkersBench.ts's `foilId`) counts toward its base card's owned total —
// a foil is the same card, cosmetically upgraded (Tinker's Bench already
// treats it that way when fusing: two base copies go in, one foil comes
// out), not a separately-ownable variant a deck could list distinctly.

import { starterDeck } from "../cards/data/decks/starterDeck.ts";
import { foilId } from "../pub/tinkersBench.ts";

const STARTER_QUANTITIES: ReadonlyMap<string, number> = new Map(starterDeck.map((e) => [e.card.id, e.quantity]));

/** How many copies of `cardId` the player owns right now — the starter deck's fixed quantity (0 if it isn't a starter card) plus matching collection entries (base and foil). */
export function ownedCopies(cardId: string, collection: readonly string[]): number {
  const starter = STARTER_QUANTITIES.get(cardId) ?? 0;
  const foil = foilId(cardId);
  const fromCollection = collection.reduce((n, id) => n + (id === cardId || id === foil ? 1 : 0), 0);
  return starter + fromCollection;
}

export function isOwned(cardId: string, collection: readonly string[]): boolean {
  return ownedCopies(cardId, collection) > 0;
}
