// The Pawnbroker's window (plan step 2.5, design.md §11.4): three cards
// for sale, rotating daily and seeded from the date so it's testable.
// Cards the player lost in a Bar Bet (src/pub/barBet.ts) queue up here
// first, at their rarity's price, ahead of the random rotation —
// `PubState.pawnedCards` (src/pub/pubState.ts), oldest loss first, per
// design.md §11: "nothing is ever lost permanently."

import type { Card, Rarity } from "../cards/cardTypes.ts";
import { stepRandom } from "../engine/rng.ts";
import { localDayIndex, OPPONENTS } from "./opponents.ts";
import { ACQUIRABLE_CARDS_BY_ID, NON_LEGENDARY_ACQUIRABLE_CARDS } from "./acquirableCards.ts";
import { addCopyToCollection, localDateKey, removeOneFromPawnedCards, type PubState } from "./pubState.ts";

export const PAWNBROKER_WINDOW_SIZE = 3;

type PricedRarity = Extract<Rarity, "common" | "uncommon" | "rare">;

/** Legendaries never appear (design.md §11.4). */
export const PAWNBROKER_PRICES: Record<PricedRarity, number> = { common: 15, uncommon: 35, rare: 90 };

const PAWNBROKER_SALT = 0x5a1ecc;

export interface PawnbrokerSlot {
  card: Card;
  price: number;
  /** True when this slot is a card the player pawned after a lost Bar Bet, rather than the random daily rotation. */
  isPawned: boolean;
}

/** Today's already-bought rotation-slot ids, so a purchase actually removes that slot until tomorrow's rotation instead of being an unlimited faucet. */
function boughtRotationToday(state: PubState, date: Date): ReadonlySet<string> {
  return state.pawnbrokerPurchaseDate === localDateKey(date) ? new Set(state.pawnbrokerPurchasedToday) : new Set();
}

/**
 * PT-26: an opponent's not-yet-claimed first-win reward card shouldn't be
 * buyable here — it duplicates (and undercuts) the "First win: X" promise
 * on their patron row. A pawned copy of one (see below, this only filters
 * the random rotation, not `pawnedCards`) is unaffected: if a reward card
 * is already in `pawnedCards`, the player earned it once and then staked
 * and lost it, so there's nothing left to spoil by reoffering it.
 */
function unclaimedRewardCardIds(state: PubState): ReadonlySet<string> {
  const ids = new Set<string>();
  for (const opponent of OPPONENTS) {
    if (!opponent.rewardCardId) continue;
    if (!(state.opponents[opponent.id]?.rewardClaimed ?? false)) ids.add(opponent.rewardCardId);
  }
  return ids;
}

/** Today's 3-card window: pawned cards first (oldest loss first), then the random daily rotation filling any remaining slots — minus whatever's already been bought today. */
export function pawnbrokerWindow(state: PubState, date: Date): PawnbrokerSlot[] {
  const slots: PawnbrokerSlot[] = [];
  const shown = new Set<string>();
  const bought = boughtRotationToday(state, date);

  for (const cardId of state.pawnedCards) {
    if (slots.length >= PAWNBROKER_WINDOW_SIZE || shown.has(cardId)) continue;
    const card = ACQUIRABLE_CARDS_BY_ID.get(cardId);
    if (!card || card.rarity === "legendary") continue;
    slots.push({ card, price: PAWNBROKER_PRICES[card.rarity as PricedRarity], isPawned: true });
    shown.add(cardId);
  }

  const unclaimedRewards = unclaimedRewardCardIds(state);
  let seed = localDayIndex(date) ^ PAWNBROKER_SALT;
  let guard = 0;
  while (slots.length < PAWNBROKER_WINDOW_SIZE && guard < 200) {
    const step = stepRandom(seed);
    seed = step.seed;
    guard++;
    const card = NON_LEGENDARY_ACQUIRABLE_CARDS[Math.floor(step.value * NON_LEGENDARY_ACQUIRABLE_CARDS.length)]!;
    if (shown.has(card.id) || bought.has(card.id) || unclaimedRewards.has(card.id)) continue;
    slots.push({ card, price: PAWNBROKER_PRICES[card.rarity as PricedRarity], isPawned: false });
    shown.add(card.id);
  }

  return slots;
}

export function canAfford(state: PubState, price: number): boolean {
  return state.checks >= price;
}

/**
 * Buys a card from the window: deducts Checks, adds one copy to the
 * collection, clears it from `pawnedCards` if it was there, and marks it
 * bought for the rest of today so `pawnbrokerWindow` won't offer that same
 * rotation slot again until tomorrow. Callers must check `canAfford` first.
 */
export function buyFromPawnbroker(state: PubState, cardId: string, price: number, now: Date): PubState {
  const today = localDateKey(now);
  const purchasedToday = state.pawnbrokerPurchaseDate === today ? state.pawnbrokerPurchasedToday : [];
  const withPurchaseTracked: PubState = {
    ...state,
    checks: state.checks - price,
    pawnbrokerPurchaseDate: today,
    pawnbrokerPurchasedToday: [...purchasedToday, cardId],
  };
  return addCopyToCollection(removeOneFromPawnedCards(withPurchaseTracked, cardId), cardId);
}
