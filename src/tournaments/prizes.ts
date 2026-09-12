// Tournament prize resolution (plan step 2.4, design.md §10): turns a
// Tournament's PrizeCard descriptor into an actual card id at the moment a
// bracket is won, using the live card set and the player's current
// collection. Kept separate from tournaments.ts (pure registry data) and
// tournamentState.ts (bracket persistence) since this is the one piece
// that needs both ALL_CARDS and the pub's collection at call time.

import { stepRandom } from "../engine/rng.ts";
import type { Card } from "../cards/cardTypes.ts";
import type { PubState } from "../pub/pubState.ts";
import type { Tournament } from "./tournaments.ts";

/** design.md §14.3: The Landlady is reserved for the Birthday Invitational's own fixed prize, never a "random legendary" draw. */
const EXCLUDED_FROM_RANDOM_LEGENDARY = new Set(["the-landlady"]);

export interface ResolvedPrize {
  checks: number;
  cardId: string | null;
}

/** Resolves the winner's prize for `tournament` (design.md §10's prize column). `seed` picks the random card, if any. */
export function resolvePrize(tournament: Tournament, allCards: readonly Card[], pub: PubState, seed: number): ResolvedPrize {
  if (tournament.prizeCard.kind === "fixed") {
    return { checks: tournament.prizeChecks, cardId: tournament.prizeCard.cardId };
  }

  const rarity = tournament.prizeCard.rarity;
  let pool = allCards.filter((c) => c.rarity === rarity);
  if (rarity === "legendary") {
    pool = pool.filter((c) => !EXCLUDED_FROM_RANDOM_LEGENDARY.has(c.id) && !pub.collection.includes(c.id));
    if (pool.length === 0) {
      // "a random legendary you don't own (or 300 Checks if you own them all)" — design.md §10, Reichenbach Open.
      return { checks: tournament.ownAllBonusChecks ?? tournament.prizeChecks, cardId: null };
    }
  }

  const idx = Math.floor(stepRandom(seed).value * pool.length);
  return { checks: tournament.prizeChecks, cardId: pool[idx]!.id };
}
