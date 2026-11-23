// Tournament prize resolution (plan step 2.4, design.md §10): turns a
// Tournament's PrizeCard descriptor into an actual card id at the moment a
// bracket is won, using the live card set and the player's current
// collection. Kept separate from tournaments.ts (pure registry data) and
// tournamentState.ts (bracket persistence) since this is the one piece
// that needs both ALL_CARDS and the pub's collection at call time.

import { isPublicEdition } from "../edition.ts";
import { stepRandom } from "../engine/rng.ts";
import type { Card } from "../cards/cardTypes.ts";
import { SEASONAL_EVENTS_BY_ID, type SeasonalEvent } from "../events/seasonalEvents.ts";
import { ACQUIRABLE_CARDS_BY_ID } from "../pub/acquirableCards.ts";
import { OPPONENTS_BY_ID, type Opponent } from "../pub/opponents.ts";
import type { PubState } from "../pub/pubState.ts";
import type { Tournament } from "./tournaments.ts";

/** Paid in place of a `giftOnly` fixed prize in a public build when the fallback card is already owned (design.md §17.5). */
export const FALLBACK_PRIZE_CHECKS = 300;

/** Where the public-build fallback looks things up; tests pass their own. */
export interface PrizeLookups {
  card: (id: string) => Card | undefined;
  event: (id: string) => SeasonalEvent | undefined;
  opponent: (id: string) => Opponent | undefined;
}

const DEFAULT_LOOKUPS: PrizeLookups = {
  card: (id) => ACQUIRABLE_CARDS_BY_ID.get(id),
  event: (id) => SEASONAL_EVENTS_BY_ID.get(id),
  opponent: (id) => OPPONENTS_BY_ID.get(id),
};

export interface FixedPrize {
  /** Null when the prize is Checks only. */
  cardId: string | null;
  /** Replaces the tournament's own `prizeChecks` when set (the all-owned fallback). */
  checks?: number;
  fellBack: boolean;
}

/**
 * The public-build fallback (design.md §17.5, a general rule): when a fixed
 * prize card is `giftOnly` and the edition is "public", the prize becomes the
 * event's first visitor's signature card if the player doesn't own it, else
 * `FALLBACK_PRIZE_CHECKS`. In the gift build, or for a prize that isn't
 * `giftOnly`, the printed card is paid as is.
 */
export function resolveFixedPrize(tournament: Tournament, ownedCardIds: readonly string[], lookups: PrizeLookups = DEFAULT_LOOKUPS): FixedPrize {
  if (tournament.prizeCard.kind !== "fixed") return { cardId: null, fellBack: false };
  const printed = tournament.prizeCard.cardId;
  if (!isPublicEdition() || lookups.card(printed)?.giftOnly !== true) return { cardId: printed, fellBack: false };
  const firstVisitor = tournament.eventId ? lookups.event(tournament.eventId)?.visitors[0] : undefined;
  const fallbackId = firstVisitor ? lookups.opponent(firstVisitor.opponentId)?.rewardCardId : null;
  const fallbackCard = fallbackId ? lookups.card(fallbackId) : undefined;
  if (fallbackId && fallbackCard && fallbackCard.giftOnly !== true && !ownedCardIds.includes(fallbackId)) return { cardId: fallbackId, fellBack: true };
  return { cardId: null, checks: FALLBACK_PRIZE_CHECKS, fellBack: true };
}

/** design.md §14.3: The Landlady is reserved for the Birthday Invitational's own fixed prize, never a "random legendary" draw. */
const EXCLUDED_FROM_RANDOM_LEGENDARY = new Set(["the-landlady"]);

export interface ResolvedPrize {
  checks: number;
  cardId: string | null;
}

/** Resolves the winner's prize for `tournament` (design.md §10's prize column). `seed` picks the random card, if any. */
export function resolvePrize(tournament: Tournament, allCards: readonly Card[], pub: PubState, seed: number, lookups: PrizeLookups = DEFAULT_LOOKUPS): ResolvedPrize {
  if (tournament.prizeCard.kind === "fixed") {
    const fixed = resolveFixedPrize(tournament, pub.collection, lookups);
    return { checks: fixed.checks ?? tournament.prizeChecks, cardId: fixed.cardId };
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
