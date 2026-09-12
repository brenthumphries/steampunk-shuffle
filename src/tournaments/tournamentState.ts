// Tournament persistence (plan step 2.4, design.md §10, §12.4): the active
// bracket (so a tournament can be left mid-way and resumed) and the
// Birthday Invitational's date-trigger flag ("unlocks October 30 (any
// year), stays unlocked once triggered"). Own localStorage key, same
// reasoning as src/pub/pubState.ts and src/decks/deckStorage.ts — 2.6 owns
// the real unified save and can fold this key in once it exists.

import type { TournamentBracket } from "./bracket.ts";
import type { TournamentId } from "./tournaments.ts";

const STORAGE_KEY = "steampunk-shuffle:tournament-state";

export interface TournamentState {
  invitationalTriggered: boolean;
  active: TournamentBracket | null;
}

export function defaultTournamentState(): TournamentState {
  return { invitationalTriggered: false, active: null };
}

/**
 * design.md §14.6: "date-triggered so it arrives while she's already
 * playing" — checked against the *local* calendar date so it fires on the
 * player's October 30, not a UTC-shifted one, and takes `now` as a
 * parameter precisely so 2.4's exit check can test it by faking the clock
 * rather than the real system date.
 */
export function checkInvitationalTrigger(state: TournamentState, now: Date): TournamentState {
  if (state.invitationalTriggered) return state;
  const isOct30 = now.getMonth() === 9 && now.getDate() === 30;
  return isOct30 ? { ...state, invitationalTriggered: true } : state;
}

export function startBracket(state: TournamentState, bracket: TournamentBracket): TournamentState {
  return { ...state, active: bracket };
}

export function updateActiveBracket(state: TournamentState, bracket: TournamentBracket): TournamentState {
  return { ...state, active: bracket };
}

export function clearActiveBracket(state: TournamentState): TournamentState {
  return { ...state, active: null };
}

export function isValidTournamentId(value: unknown): value is TournamentId {
  return value === "tuesday-knockout" || value === "peelers-cup" || value === "reichenbach-open" || value === "birthday-invitational";
}

function isValidBracket(value: unknown): value is TournamentBracket {
  const b = value as TournamentBracket;
  return (
    !!b &&
    typeof b === "object" &&
    isValidTournamentId(b.tournamentId) &&
    Array.isArray(b.seatOpponentIds) &&
    b.seatOpponentIds.every((id) => typeof id === "string") &&
    Array.isArray(b.playerMatches) &&
    b.playerMatches.length === 3 &&
    b.playerMatches.every((m) => typeof m.opponentId === "string" && (m.outcome === "pending" || m.outcome === "won" || m.outcome === "lost")) &&
    (b.status === "in-progress" || b.status === "eliminated" || b.status === "champion")
  );
}

/** Reads the saved tournament state, falling back to the default if nothing is saved or the saved data doesn't parse. */
export function loadTournamentState(): TournamentState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultTournamentState();
    const parsed = JSON.parse(raw) as Partial<TournamentState>;
    if (typeof parsed.invitationalTriggered !== "boolean") return defaultTournamentState();
    if (parsed.active !== null && parsed.active !== undefined && !isValidBracket(parsed.active)) return defaultTournamentState();
    return { invitationalTriggered: parsed.invitationalTriggered, active: parsed.active ?? null };
  } catch {
    return defaultTournamentState();
  }
}

export function saveTournamentState(state: TournamentState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Safari private mode / storage quota — same tradeoff as pubState.ts.
  }
}
