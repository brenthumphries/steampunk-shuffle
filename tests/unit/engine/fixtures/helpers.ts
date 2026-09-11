// Shared helpers for engine tests: quick synthetic card builders and the
// instanceId format createMatch() uses, so tests can name a card in hand
// without threading opaque ids around.

import type { Ability, Card, CardType, Family, Keywords } from "../../../../src/cards/cardTypes.ts";
import type { Deck } from "../../../../src/cards/cardTypes.ts";
import { playTurn, type MatchState, type PlayerId } from "../../../../src/engine/matchEngine.ts";

let counter = 0;

export function makeCard(opts: {
  name: string;
  points?: number;
  type?: CardType;
  family?: Family;
  keywords?: Keywords;
  abilities?: Ability[];
  rarity?: Card["rarity"];
  faces?: Card["faces"];
}): Card {
  counter += 1;
  if (opts.faces) {
    return { id: `${slug(opts.name)}-${counter}`, rarity: opts.rarity ?? "common", faces: opts.faces };
  }
  return {
    id: `${slug(opts.name)}-${counter}`,
    rarity: opts.rarity ?? "common",
    faces: [
      {
        name: opts.name,
        type: opts.type ?? "character",
        family: opts.family ?? "neutral",
        points: opts.points ?? 1,
        keywords: opts.keywords,
        abilities: opts.abilities,
        flavor: "Test fixture.",
        artId: "test",
      },
    ],
  };
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/** The instanceId createMatch() assigns to the Nth (0-indexed) copy of `card` in owner `ownerTag`'s deck. */
export function instanceId(ownerTag: "A" | "B", card: Card, copy = 0): string {
  return `${ownerTag}:${card.id}#${copy}`;
}

/** A one-copy-each Deck built from a card list, in that order — pair with `{ shuffle: false }`. */
export function orderedDeck(cards: Card[]): Deck {
  return cards.map((card) => ({ card, quantity: 1 }));
}

/**
 * Turns a fixed card sequence into a "player": each call plays the next card
 * in line, whenever it's actually that queue's turn. Used to script a whole
 * match (round outcomes especially) without hardcoding which global turn
 * index belongs to which player — that mapping shifts whenever a round's
 * leader isn't the match's round-1 leader (design.md §6.2.4).
 */
export function makeQueuePlayer(cards: Card[]) {
  const queue = [...cards];
  return (state: MatchState, playerId: PlayerId): MatchState => {
    const next = queue.shift();
    if (!next) throw new Error("queue exhausted — deck didn't have enough cards for this test");
    const hand = state.players[playerId].hand;
    const found = hand.find((c) => c.card.id === next.id);
    if (!found) {
      throw new Error(`expected "${next.faces[0].name}" in ${playerId}'s hand but it wasn't there`);
    }
    return playTurn(state, playerId, found.instanceId);
  };
}
