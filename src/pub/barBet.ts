// Bar Bet (plan step 2.5, design.md §11.5): before a pickup game, stake
// one card from the collection of extras the player has earned beyond
// the printed 60 (src/pub/pubState.ts's `PubState.collection`) — win, and
// receive a card from the opponent's own bet pool (`Opponent.betPool`,
// src/pub/opponents.ts); lose, and the staked card moves to the
// Pawnbroker's window (src/pub/pawnbroker.ts) at its rarity price, where
// it can be bought back — "nothing is ever lost permanently" (§11).
//
// `stakeableCards` only ever offers `collection` entries, never a base-60/
// starter card — resolved as a deliberate decision, not the ownership gap
// this comment used to flag: design.md's own wording is "stake one card
// from your collection," and `PubState.collection` has always specifically
// meant "owned beyond the base 60" (see its own doc comment). Now that
// plan step 4.0d's ownership system exists (src/decks/ownership.ts), that
// reading still holds — widening the stakeable pool to base-60/starter
// cards was never what design.md asked for.
//
// design.md's "not one that would make any saved deck illegal — the
// builder shows which" genuinely isn't implemented, though: nothing here
// checks whether losing a staked card would drop the player below what a
// saved deck's entries assume they own. Since a bet loss only ever removes
// a `collection` extra (never a base-60 card), and the builder doesn't yet
// re-validate a saved deck's entries against current ownership at all
// (adding a copy is gated at add-time, but a deck already saved with more
// copies than are currently owned — e.g. after fusing one away at the
// Tinker's Bench — isn't flagged), this is a real but narrower gap than
// the one this comment used to describe. Left open; design.md frames it as
// a UI nicety ("the builder shows which"), not a hard rule the bet itself
// must enforce.

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
