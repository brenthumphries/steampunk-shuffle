// Checks balance, per-opponent win/loss + reward-claimed record, and the
// player's reward-card collection (plan step 2.3, design.md §11). Its own
// localStorage key, same reasoning as src/decks/deckStorage.ts: 2.6 owns
// the real unified save (collection with foil flags, unlock flags, etc.,
// design.md §12.4) and can fold this key into that blob once it exists;
// until then the pub hub needs *some* persistence to track Checks and
// first-win rewards at all.

import type { OpponentTier } from "./opponents.ts";

const STORAGE_KEY = "steampunk-shuffle:pub-state";

/** design.md §11.1's earning table names exactly "Regular / Seasoned / Legend" — no "house" row. */
export const WIN_CHECKS: Record<Exclude<OpponentTier, "house">, number> = { regular: 8, seasoned: 15, legend: 30 };
export const LOSE_CHECKS = 2;
export const DAILY_BONUS_CHECKS = 5;

export interface OpponentRecord {
  wins: number;
  losses: number;
  rewardClaimed: boolean;
}

export interface PubState {
  checks: number;
  /**
   * Wins that count toward design.md §12.1's unlock table ("by pickup +
   * tournament wins combined"). Tournaments (2.4) will add to this once
   * they exist. Sir Charles wins are deliberately excluded — his tutorial
   * win doesn't count toward "0 wins: Newcomer" either, so ongoing pickup
   * wins against him shouldn't move the same counter.
   */
  totalWins: number;
  opponents: Record<string, OpponentRecord>;
  /**
   * Card ids the player owns beyond the base 60's unrestricted access —
   * reward cards (§11.2), Lost & Found/Pawnbroker/Bar Bet wins (§11.3-
   * §11.5), and Tinker's Bench fuse results (§11.6). A flat array, not a
   * count map: duplicate entries are extra copies of the same id, which is
   * what Tinker's Bench and Bar Bet staking need to check for. A foil
   * (§11.6) is a distinct entry using a `"foil:<cardId>"` id — see
   * src/pub/tinkersBench.ts's `foilId`.
   */
  collection: string[];
  /** Local-date key ("YYYY-MM-DD") of the last pickup game that paid the daily bonus (§11.1). */
  lastDailyBonusDate: string | null;
  /** Local-date key of the last Lost & Found claim (§11.3) — once per real-world day, same pattern as the daily bonus above. */
  lastLostAndFoundDate: string | null;
  /** Cards lost in a Bar Bet (§11.5), oldest first — queued for the Pawnbroker's window (src/pub/pawnbroker.ts) ahead of its random rotation. */
  pawnedCards: string[];
  /**
   * Card ids already bought from today's Pawnbroker window
   * (src/pub/pawnbroker.ts) — the window is "three cards," a finite
   * stock, not a faucet the player can buy the same rotation slot from
   * over and over; a purchase removes that id from the window until
   * tomorrow's rotation. Paired with `pawnbrokerPurchaseDate` so it resets
   * on the next real-world day, same pattern as `lastDailyBonusDate`.
   */
  pawnbrokerPurchasedToday: string[];
  pawnbrokerPurchaseDate: string | null;
}

export function defaultPubState(): PubState {
  return {
    checks: 0,
    totalWins: 0,
    opponents: {},
    collection: [],
    lastDailyBonusDate: null,
    lastLostAndFoundDate: null,
    pawnedCards: [],
    pawnbrokerPurchasedToday: [],
    pawnbrokerPurchaseDate: null,
  };
}

/** How many copies of `cardId` are in `collection` right now. */
export function countInCollection(collection: readonly string[], cardId: string): number {
  return collection.filter((id) => id === cardId).length;
}

export function addCopyToCollection(state: PubState, cardId: string): PubState {
  return { ...state, collection: [...state.collection, cardId] };
}

/** Removes one occurrence of `cardId` from the collection, if present. A no-op if the player doesn't have it. */
export function removeOneFromCollection(state: PubState, cardId: string): PubState {
  const idx = state.collection.indexOf(cardId);
  if (idx === -1) return state;
  const next = state.collection.slice();
  next.splice(idx, 1);
  return { ...state, collection: next };
}

export function addToPawnedCards(state: PubState, cardId: string): PubState {
  return { ...state, pawnedCards: [...state.pawnedCards, cardId] };
}

/** Removes one occurrence of `cardId` from `pawnedCards`, if present. A no-op if it isn't there. */
export function removeOneFromPawnedCards(state: PubState, cardId: string): PubState {
  const idx = state.pawnedCards.indexOf(cardId);
  if (idx === -1) return state;
  const next = state.pawnedCards.slice();
  next.splice(idx, 1);
  return { ...state, pawnedCards: next };
}

/** Claims today's Lost & Found card (design.md §11.3): adds it to the collection and marks today as claimed. Callers must check `hasClaimedLostAndFoundToday` first. */
export function claimLostAndFound(state: PubState, cardId: string, now: Date): PubState {
  return { ...addCopyToCollection(state, cardId), lastLostAndFoundDate: localDateKey(now) };
}

export function hasClaimedLostAndFoundToday(state: PubState, now: Date): boolean {
  return state.lastLostAndFoundDate === localDateKey(now);
}

function recordFor(state: PubState, opponentId: string): OpponentRecord {
  return state.opponents[opponentId] ?? { wins: 0, losses: 0, rewardClaimed: false };
}

/** The player's local calendar date as "YYYY-MM-DD" — real-world days, not UTC-shifted ones. */
export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export interface PickupOutcome {
  next: PubState;
  checksEarned: number;
  /** Non-null exactly when this result is a first-ever win against this opponent. */
  rewardCardId: string | null;
}

/**
 * Applies one pickup-game result (design.md §11.1-§11.2).
 *
 * - Sir Charles ("house" tier) pays no win/loss Checks and has no reward
 *   card — §11.1's table names exactly the three real tiers — but a game
 *   against him still counts for the daily bonus, same as any pickup game.
 * - A draw "pays no reward and counts as neither win nor loss" (design.md
 *   §6.3), so it's a no-op here, including the daily bonus.
 */
export function recordPickupResult(
  state: PubState,
  opponentId: string,
  tier: OpponentTier,
  rewardCardId: string | null,
  outcome: "win" | "loss" | "draw",
  now: Date,
): PickupOutcome {
  if (outcome === "draw") {
    return { next: state, checksEarned: 0, rewardCardId: null };
  }

  const won = outcome === "win";
  const record = recordFor(state, opponentId);
  const isFirstWin = won && !record.rewardClaimed;
  const nextRecord: OpponentRecord = {
    wins: record.wins + (won ? 1 : 0),
    losses: record.losses + (won ? 0 : 1),
    rewardClaimed: record.rewardClaimed || isFirstWin,
  };

  const tierChecks = tier === "house" ? 0 : won ? WIN_CHECKS[tier] : LOSE_CHECKS;
  const todayKey = localDateKey(now);
  const dailyBonus = state.lastDailyBonusDate !== todayKey ? DAILY_BONUS_CHECKS : 0;
  const checksEarned = tierChecks + dailyBonus;
  const earnedReward = isFirstWin ? rewardCardId : null;

  const next: PubState = {
    ...state,
    checks: state.checks + checksEarned,
    totalWins: state.totalWins + (tier !== "house" && won ? 1 : 0),
    opponents: { ...state.opponents, [opponentId]: nextRecord },
    collection: earnedReward ? [...state.collection, earnedReward] : state.collection,
    lastDailyBonusDate: todayKey,
  };

  return { next, checksEarned, rewardCardId: earnedReward };
}

/**
 * Records one tournament bracket-match result against `opponentId` (plan
 * step 2.4, design.md §10-§11.1). Tournament matches pay no per-match
 * Checks and no daily bonus — §11.1 lists "Tournament consolation / prize"
 * as its own row, separate from "Win/Lose a pickup game," and a tournament
 * match isn't itself a pickup game — but a win still updates the
 * opponent's win/loss record, still grants a first-win reward card, and
 * still counts toward `totalWins` (§12.1's "by pickup + tournament wins
 * combined"), same as `recordPickupResult`. A judgment call, not spelled
 * out card-by-card in design.md: whichever step wires up the real save
 * (2.6) should revisit if tournament wins turn out to feel like they
 * should count differently from pickup ones.
 */
export function recordTournamentMatchResult(state: PubState, opponentId: string, tier: OpponentTier, rewardCardId: string | null, outcome: "win" | "loss"): PubState {
  const won = outcome === "win";
  const record = recordFor(state, opponentId);
  const isFirstWin = won && !record.rewardClaimed;
  const nextRecord: OpponentRecord = {
    wins: record.wins + (won ? 1 : 0),
    losses: record.losses + (won ? 0 : 1),
    rewardClaimed: record.rewardClaimed || isFirstWin,
  };
  const earnedReward = isFirstWin ? rewardCardId : null;

  return {
    ...state,
    totalWins: state.totalWins + (tier !== "house" && won ? 1 : 0),
    opponents: { ...state.opponents, [opponentId]: nextRecord },
    collection: earnedReward ? [...state.collection, earnedReward] : state.collection,
  };
}

/** Deducts a tournament entry fee (design.md §10). Callers must check `state.checks >= amount` before offering entry; clamped to 0 here only as a defensive floor. */
export function deductChecks(state: PubState, amount: number): PubState {
  return { ...state, checks: Math.max(0, state.checks - amount) };
}

/** Adds Checks outside the pickup/tournament payout flows — currently just the tutorial's fixed reward (design.md §13.2's "After"). */
export function grantChecks(state: PubState, amount: number): PubState {
  return { ...state, checks: state.checks + amount };
}

/** Applies a tournament consolation or prize payout (design.md §10): Checks plus an optional prize card added to the collection. */
export function applyTournamentPayout(state: PubState, checksEarned: number, prizeCardId: string | null): PubState {
  return {
    ...state,
    checks: state.checks + checksEarned,
    collection: prizeCardId ? [...state.collection, prizeCardId] : state.collection,
  };
}

function isOpponentRecord(value: unknown): value is OpponentRecord {
  const r = value as OpponentRecord;
  return !!r && typeof r === "object" && typeof r.wins === "number" && typeof r.losses === "number" && typeof r.rewardClaimed === "boolean";
}

/** Reads the saved pub state, falling back to the default if nothing is saved or the saved data doesn't parse. */
export function loadPubState(): PubState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPubState();
    const parsed = JSON.parse(raw) as Partial<PubState>;
    if (
      typeof parsed.checks !== "number" ||
      typeof parsed.totalWins !== "number" ||
      typeof parsed.opponents !== "object" ||
      parsed.opponents === null ||
      !Object.values(parsed.opponents).every(isOpponentRecord) ||
      !Array.isArray(parsed.collection) ||
      !parsed.collection.every((c) => typeof c === "string")
    ) {
      return defaultPubState();
    }
    return {
      checks: parsed.checks,
      totalWins: parsed.totalWins,
      opponents: parsed.opponents as Record<string, OpponentRecord>,
      collection: parsed.collection,
      lastDailyBonusDate: typeof parsed.lastDailyBonusDate === "string" ? parsed.lastDailyBonusDate : null,
      lastLostAndFoundDate: typeof parsed.lastLostAndFoundDate === "string" ? parsed.lastLostAndFoundDate : null,
      pawnedCards: Array.isArray(parsed.pawnedCards) && parsed.pawnedCards.every((c) => typeof c === "string") ? parsed.pawnedCards : [],
      pawnbrokerPurchasedToday:
        Array.isArray(parsed.pawnbrokerPurchasedToday) && parsed.pawnbrokerPurchasedToday.every((c) => typeof c === "string") ? parsed.pawnbrokerPurchasedToday : [],
      pawnbrokerPurchaseDate: typeof parsed.pawnbrokerPurchaseDate === "string" ? parsed.pawnbrokerPurchaseDate : null,
    };
  } catch {
    return defaultPubState();
  }
}

export function savePubState(state: PubState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Safari private mode / storage quota — same tradeoff as deckStorage.ts.
  }
}
