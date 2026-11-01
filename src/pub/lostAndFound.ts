// Lost & Found (plan step 2.5, design.md §11.3): one free card per
// real-world day, 70% common / 25% uncommon / 5% rare, weighted away from
// cards the player already has two or more of. Seeded from the local
// calendar day (src/pub/opponents.ts's `localDayIndex`), salted so this
// doesn't roll in lockstep with the Pawnbroker's own daily rotation or
// "legends in town" — three unrelated systems all keying off the same day
// number would otherwise correlate in ways no one intended.

import type { Card, Rarity } from "../cards/cardTypes.ts";
import { stepRandom } from "../engine/rng.ts";
import { localDayIndex } from "./opponents.ts";
import { acquirablePoolFor } from "./acquirableCards.ts";

type RollableRarity = Extract<Rarity, "common" | "uncommon" | "rare">;

const RARITY_ORDER: readonly RollableRarity[] = ["common", "uncommon", "rare"];
const RARITY_WEIGHT: Record<RollableRarity, number> = { common: 0.7, uncommon: 0.25, rare: 0.05 };

/** design.md says "weighted away from," not "excluded" — a capped-out card can still turn up, just less often. */
const OWNED_CAP_WEIGHT = 0.15;

const LOST_AND_FOUND_SALT = 0x1274a1;
const LOST_AND_FOUND_EXTRA_SALT = 0x3c91d7;
const EXTRA_REROLL_LIMIT = 20;

function ownedCount(collection: readonly string[], cardId: string): number {
  return collection.filter((id) => id === cardId).length;
}

function pickWeighted<T>(items: readonly T[], weights: readonly number[], seed: number): T {
  const total = weights.reduce((a, b) => a + b, 0);
  const roll = stepRandom(seed).value * total;
  let acc = 0;
  for (let i = 0; i < items.length; i++) {
    acc += weights[i]!;
    if (roll < acc) return items[i]!;
  }
  return items[items.length - 1]!;
}

/**
 * Rolls today's Lost & Found card. Pure — callers gate "once per
 * real-world day" via `PubState.lastLostAndFoundDate`
 * (src/pub/pubState.ts's `hasClaimedLostAndFoundToday`/`claimLostAndFound`).
 */
export function rollLostAndFound(collection: readonly string[], date: Date, options: { upgrade?: boolean } = {}): Card {
  return rollFrom(collection, date, localDayIndex(date) ^ LOST_AND_FOUND_SALT, options.upgrade ?? false);
}

/** The second card of a `lostAndFoundExtra` day: its own seed, and never the same card as the first. */
export function rollLostAndFoundExtra(collection: readonly string[], date: Date, firstCardId: string, options: { upgrade?: boolean } = {}): Card {
  let seed = localDayIndex(date) ^ LOST_AND_FOUND_EXTRA_SALT;
  let card = rollFrom(collection, date, seed, options.upgrade ?? false);
  for (let tries = 0; card.id === firstCardId && tries < EXTRA_REROLL_LIMIT; tries++) {
    seed += 2;
    card = rollFrom(collection, date, seed, options.upgrade ?? false);
  }
  return card;
}

function rollFrom(collection: readonly string[], date: Date, daySeed: number, upgrade: boolean): Card {
  const rolled = pickWeighted(RARITY_ORDER, RARITY_ORDER.map((r) => RARITY_WEIGHT[r]), daySeed);
  // lostAndFoundUpgrade (the Booth's omen): one rarity better, a rare staying rare.
  const rarity = upgrade ? RARITY_ORDER[Math.min(RARITY_ORDER.indexOf(rolled) + 1, RARITY_ORDER.length - 1)]! : rolled;

  const pool = acquirablePoolFor(date).filter((c) => c.rarity === rarity);
  const weights = pool.map((c) => (ownedCount(collection, c.id) >= 2 ? OWNED_CAP_WEIGHT : 1));
  return pickWeighted(pool, weights, daySeed + 1);
}
