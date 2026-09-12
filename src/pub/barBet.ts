// Bar Bet (plan step 2.5, design.md §11.5): before a pickup game, stake
// one card from the collection of extras the player has earned beyond
// the printed 60 (src/pub/pubState.ts's `PubState.collection`) — win, and
// receive a card from the opponent's own bet pool (`Opponent.betPool`,
// src/pub/opponents.ts); lose, and the staked card moves to the
// Pawnbroker's window (src/pub/pawnbroker.ts) at its rarity price, where
// it can be bought back — "nothing is ever lost permanently" (§11).
//
// design.md's "not one that would make any saved deck illegal — the
// builder shows which" isn't implemented as a real check here: the deck
// builder's grid is still every one of the printed 60, unrestricted by
// ownership (the gap flagged repeatedly since 2.2/2.3/2.4), and it can't
// even reference a collection-only card at all. So no saved deck can ever
// depend on a `collection` card's presence — staking one is always safe
// under the current model. Revisit this file once that ownership-gating
// system exists; it's the one place this constraint would need real logic.

import { stepRandom } from "../engine/rng.ts";
import type { Opponent } from "./opponents.ts";
import { addCopyToCollection, addToPawnedCards, removeOneFromCollection, type PubState } from "./pubState.ts";

/** design.md §12.1: Bar Bet unlocks at 3 wins ("Regular"). */
export const BAR_BET_UNLOCK_WINS = 3;

/** Sir Charles ("house" tier) has no bet pool and isn't part of the Checks economy either (§11.1's table). */
export function canOfferBarBet(opponent: Opponent, totalWins: number): boolean {
  return opponent.tier !== "house" && opponent.betPool.length > 0 && totalWins >= BAR_BET_UNLOCK_WINS;
}

/** Distinct card ids the player could stake right now — one offer per id, even if they hold several copies. */
export function stakeableCards(collection: readonly string[]): string[] {
  return [...new Set(collection)];
}

/** Picks which of the opponent's bet-pool cards a won bet pays out. */
export function pickBetPoolCard(betPool: readonly string[], seed: number): string {
  const idx = Math.floor(stepRandom(seed).value * betPool.length);
  return betPool[idx]!;
}

export interface BarBetOutcome {
  next: PubState;
  /** The card id the player received, non-null exactly when the bet was won. */
  wonCardId: string | null;
}

/**
 * Applies a resolved Bar Bet for the same match `recordPickupResult`
 * (src/pub/pubState.ts) is already scoring. A draw leaves the stake with
 * the player — design.md §6.3's "pays no reward and counts as neither win
 * nor loss" for the match itself; a bet made on an unresolved match is
 * itself unresolved, not a loss.
 */
export function resolveBarBet(state: PubState, stakedCardId: string, opponent: Opponent, outcome: "win" | "loss" | "draw", seed: number): BarBetOutcome {
  if (outcome === "draw") {
    return { next: state, wonCardId: null };
  }
  if (outcome === "loss") {
    const next = addToPawnedCards(removeOneFromCollection(state, stakedCardId), stakedCardId);
    return { next, wonCardId: null };
  }
  const wonCardId = pickBetPoolCard(opponent.betPool, seed);
  return { next: addCopyToCollection(state, wonCardId), wonCardId };
}
