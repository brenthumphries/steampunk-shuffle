// Persists an in-progress match so killing the app mid-match can resume it
// (plan step 2.6, design.md §12.4: "current match state" is one of the
// save's listed contents). Its own localStorage key, same pattern as
// src/pub/pubState.ts / src/decks/deckStorage.ts / src/tournaments/
// tournamentState.ts — src/main.ts is the only reader/writer, via
// src/ui/matchScreen.ts's `onStateChange` hook (fired on mount and after
// every committed turn) and `initialState` option (to resume into).
//
// A tournament match resumes by re-deriving its opponent and match index
// from the tournament's own persisted bracket
// (src/tournaments/tournamentState.ts, src/tournaments/bracket.ts's
// `currentMatchIndex`) rather than storing them redundantly here, so the
// two can never drift apart.

import type { Deck } from "../cards/cardTypes.ts";
import type { MatchState, PlayerState } from "../engine/matchEngine.ts";
import { isValidTournamentId } from "../tournaments/tournamentState.ts";
import type { TournamentId } from "../tournaments/tournaments.ts";

const STORAGE_KEY = "steampunk-shuffle:active-match";

export type MatchContext =
  | { kind: "pickup"; opponentId: string; stakedCardId: string | null }
  | { kind: "tournament"; tournamentId: TournamentId };

export interface ActiveMatchSave {
  matchState: MatchState;
  aiSeed: number;
  humanDeck: Deck;
  humanDeckName: string;
  context: MatchContext;
}

function isPlausibleDeck(value: unknown): value is Deck {
  return Array.isArray(value) && value.every((e) => !!e && typeof e === "object" && typeof (e as { quantity?: unknown }).quantity === "number" && !!(e as { card?: unknown }).card);
}

function isPlausiblePlayerState(value: unknown): value is PlayerState {
  const p = value as Partial<PlayerState> | undefined;
  return !!p && Array.isArray(p.deck) && Array.isArray(p.hand) && Array.isArray(p.board) && Array.isArray(p.discard);
}

/**
 * Only checks the shape actually needed to resume safely, not a deep
 * per-card validation — this data only ever comes from our own engine
 * output, so the real risk is a stale shape from a previous app version,
 * not adversarial input.
 */
function isPlausibleMatchState(value: unknown): value is MatchState {
  const s = value as Partial<MatchState> | undefined;
  return (
    !!s &&
    typeof s === "object" &&
    !!s.players &&
    isPlausiblePlayerState(s.players.A) &&
    isPlausiblePlayerState(s.players.B) &&
    typeof s.round === "number" &&
    (s.leader === "A" || s.leader === "B") &&
    typeof s.turnsPlayedThisRound === "number" &&
    !!s.roundsWon &&
    typeof s.roundsWon.A === "number" &&
    typeof s.roundsWon.B === "number" &&
    Array.isArray(s.roundHistory) &&
    (s.status === "in-progress" || s.status === "complete") &&
    typeof s.rngSeed === "number"
  );
}

function isPlausibleContext(value: unknown): value is MatchContext {
  const c = value as Partial<MatchContext> | undefined;
  if (!c || typeof c !== "object") return false;
  if (c.kind === "pickup") {
    const stakedCardId = (c as { stakedCardId?: unknown }).stakedCardId;
    return typeof (c as { opponentId?: unknown }).opponentId === "string" && (stakedCardId === null || typeof stakedCardId === "string");
  }
  if (c.kind === "tournament") {
    return isValidTournamentId((c as { tournamentId?: unknown }).tournamentId);
  }
  return false;
}

/** Reads the saved in-progress match, or null if there isn't one or the saved data doesn't parse. */
export function loadActiveMatch(): ActiveMatchSave | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ActiveMatchSave>;
    if (
      !isPlausibleMatchState(parsed.matchState) ||
      typeof parsed.aiSeed !== "number" ||
      !isPlausibleDeck(parsed.humanDeck) ||
      typeof parsed.humanDeckName !== "string" ||
      !isPlausibleContext(parsed.context)
    ) {
      return null;
    }
    return {
      matchState: parsed.matchState,
      aiSeed: parsed.aiSeed,
      humanDeck: parsed.humanDeck,
      humanDeckName: parsed.humanDeckName,
      context: parsed.context,
    };
  } catch {
    return null;
  }
}

export function saveActiveMatch(save: ActiveMatchSave): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  } catch {
    // Safari private mode / storage quota — same tradeoff as pubState.ts;
    // worst case a killed app just can't resume this particular match.
  }
}

export function clearActiveMatch(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore — same tradeoff as above.
  }
}
