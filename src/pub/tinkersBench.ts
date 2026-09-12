// The Tinker's Bench (plan step 2.5, design.md §11.6): trade two copies
// of the same card plus 10 Checks for either a foil of that card, or a
// random card of the next rarity up (common → uncommon → rare). Rares
// can only become foils; legendaries can't be fused at all.
//
// A foil is modeled as a distinct collection entry using a `"foil:"`-
// prefixed id (design.md: "shows as a distinct collection entry"), since
// `PubState.collection` is a flat string[] with no richer per-entry shape.
// Whoever builds 2.6's real save system should decide whether this stays
// a string convention or becomes a proper `{ cardId, foil }` record —
// flagged the same way 2.3 flagged `collection: string[]` itself for 2.6
// to revisit.

import { stepRandom } from "../engine/rng.ts";
import type { Rarity } from "../cards/cardTypes.ts";
import { ACQUIRABLE_CARDS_BY_ID, NON_LEGENDARY_ACQUIRABLE_CARDS } from "./acquirableCards.ts";
import { addCopyToCollection, countInCollection, removeOneFromCollection, type PubState } from "./pubState.ts";

/** design.md §12.1: Tinker's Bench unlocks at 3 wins ("Regular"), same threshold as Bar Bet. */
export const TINKERS_BENCH_UNLOCK_WINS = 3;

export const TINKER_FEE_CHECKS = 10;

type FusableRarity = Extract<Rarity, "common" | "uncommon">;

const NEXT_RARITY_UP: Record<FusableRarity, "uncommon" | "rare"> = { common: "uncommon", uncommon: "rare" };

export function foilId(cardId: string): string {
  return `foil:${cardId}`;
}

export type FuseChoice = "foil" | "upgrade";

/** Whether the collection currently has two fusable copies of `cardId`. */
export function canFuse(collection: readonly string[], cardId: string): boolean {
  const card = ACQUIRABLE_CARDS_BY_ID.get(cardId);
  if (!card || card.rarity === "legendary") return false;
  return countInCollection(collection, cardId) >= 2;
}

/** "Rares can only become foils" — a rare card offers just the one choice; commons/uncommons offer both. */
export function fuseChoicesFor(cardId: string): FuseChoice[] {
  const card = ACQUIRABLE_CARDS_BY_ID.get(cardId);
  if (!card) return [];
  return card.rarity === "rare" ? ["foil"] : ["foil", "upgrade"];
}

export interface FuseResult {
  next: PubState;
  resultCardId: string;
}

/** Fuses two copies of `cardId` plus `TINKER_FEE_CHECKS` into a foil or a random card one rarity up. Callers must check `canFuse`, `fuseChoicesFor`, and affordability first. */
export function fuse(state: PubState, cardId: string, choice: FuseChoice, seed: number): FuseResult {
  const card = ACQUIRABLE_CARDS_BY_ID.get(cardId)!;
  const afterFee: PubState = { ...removeOneFromCollection(removeOneFromCollection(state, cardId), cardId), checks: state.checks - TINKER_FEE_CHECKS };

  if (choice === "foil") {
    const resultCardId = foilId(cardId);
    return { next: addCopyToCollection(afterFee, resultCardId), resultCardId };
  }

  const nextRarity = NEXT_RARITY_UP[card.rarity as FusableRarity];
  const pool = NON_LEGENDARY_ACQUIRABLE_CARDS.filter((c) => c.rarity === nextRarity);
  const resultCardId = pool[Math.floor(stepRandom(seed).value * pool.length)]!.id;
  return { next: addCopyToCollection(afterFee, resultCardId), resultCardId };
}
