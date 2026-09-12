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
import { NON_LEGENDARY_ACQUIRABLE_CARDS } from "./acquirableCards.ts";

type RollableRarity = Extract<Rarity, "common" | "uncommon" | "rare">;

const RARITY_ORDER: readonly RollableRarity[] = ["common", "uncommon", "rare"];
const RARITY_WEIGHT: Record<RollableRarity, number> = { common: 0.7, uncommon: 0.25, rare: 0.05 };

/** design.md says "weighted away from," not "excluded" — a capped-out card can still turn up, just less often. */
const OWNED_CAP_WEIGHT = 0.15;

const LOST_AND_FOUND_SALT = 0x1274a1;

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
export function rollLostAndFound(collection: readonly string[], date: Date): Card {
  const daySeed = localDayIndex(date) ^ LOST_AND_FOUND_SALT;

  const rarity = pickWeighted(RARITY_ORDER, RARITY_ORDER.map((r) => RARITY_WEIGHT[r]), daySeed);

  const pool = NON_LEGENDARY_ACQUIRABLE_CARDS.filter((c) => c.rarity === rarity);
  const weights = pool.map((c) => (ownedCount(collection, c.id) >= 2 ? OWNED_CAP_WEIGHT : 1));
  return pickWeighted(pool, weights, daySeed + 1);
}
