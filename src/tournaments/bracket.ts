// 8-seat single-elimination bracket (plan step 2.4, design.md §10). Player
// is always seat 0; the bracket generator draws 7 AI seats from the
// tournament's eligible pool and immediately resolves every match that
// doesn't involve the player (seats 2v3, 4v5, 6v7, and the AI-only
// semifinal among those winners) via the same headless AI-vs-AI self-play
// technique tools/sim.ts uses for balance runs — a real seat that never
// plays the player doesn't need the player present to be decided. That
// leaves the player with a fixed, already-known sequence of exactly three
// opponents (quarterfinal/semifinal/final) to actually play, matching
// design.md §10's "quarter, semi, final — three matches."
//
// The whole-tree-except-the-player's-branch approach only works because a
// single-elimination bracket's non-player half is entirely independent of
// how the player's own matches turn out — a player upset in the
// quarterfinal doesn't change who wins seats 4-7's sub-bracket.

import { stepRandom } from "../engine/rng.ts";
import { createMatch, currentPlayer, type MatchState, type PlayerId } from "../engine/matchEngine.ts";
import { playAITurn, type Difficulty } from "../ai/aiOpponent.ts";
import type { Opponent } from "../pub/opponents.ts";
import type { Tournament } from "./tournaments.ts";

const TURN_GUARD = 80;

export type BracketRoundIndex = 0 | 1 | 2;
export const ROUND_NAMES: readonly [string, string, string] = ["Quarterfinal", "Semifinal", "Final"];

export interface BracketMatchSlot {
  opponentId: string;
  outcome: "pending" | "won" | "lost";
}

export interface TournamentBracket {
  tournamentId: Tournament["id"];
  /** The 7 AI opponents drawn for this bracket, in seat order (seats 1-7; the player is seat 0). */
  seatOpponentIds: string[];
  playerMatches: [BracketMatchSlot, BracketMatchSlot, BracketMatchSlot];
  status: "in-progress" | "eliminated" | "champion";
}

function resolveDifficulty(difficulty: Opponent["difficulty"], state: MatchState): Difficulty {
  return typeof difficulty === "function" ? difficulty(state) : difficulty;
}

/**
 * Resolves one AI-vs-AI match instantly and returns the winner's id.
 * Tournament matches "cannot end in a draw — the sovereign is tossed"
 * (design.md §6.3); a coin flip (seeded, so still deterministic) stands in
 * for that here exactly as it would for a player's own drawn match.
 */
function simulateAIMatch(a: Opponent, b: Opponent, seed: number): string {
  let state = createMatch(a.deck, b.deck, { seed, shuffle: true });
  let seedA = seed ^ 0x1234567;
  let seedB = seed ^ 0x0badc0de;
  let guard = 0;
  while (state.status === "in-progress" && guard < TURN_GUARD) {
    guard++;
    const acting: PlayerId = currentPlayer(state);
    if (acting === "A") {
      const move = playAITurn(state, "A", b.deck, resolveDifficulty(a.difficulty, state), seedA);
      state = move.state;
      seedA = move.nextSeed;
    } else {
      const move = playAITurn(state, "B", a.deck, resolveDifficulty(b.difficulty, state), seedB);
      state = move.state;
      seedB = move.nextSeed;
    }
  }
  if (state.status !== "complete" || !state.result) return a.id; // turn guard tripped — shouldn't happen; arbitrary but deterministic
  if (state.result.winner === "draw") return stepRandom(seed ^ 0x5eed).value < 0.5 ? a.id : b.id;
  return state.result.winner === "A" ? a.id : b.id;
}

/** Exported for direct unit testing of the weighting (e.g. "Yard opponents favoured") without paying for full AI-vs-AI bracket simulation per trial. */
export function weightedDraw(pool: readonly Opponent[], count: number, seed: number, weightOf: (o: Opponent) => number): { picked: Opponent[]; seed: number } {
  const remaining = pool.slice();
  const weights = remaining.map(weightOf);
  const picked: Opponent[] = [];
  let s = seed;
  while (picked.length < count && remaining.length > 0) {
    const total = weights.reduce((sum, w) => sum + w, 0);
    const step = stepRandom(s);
    s = step.seed;
    let r = step.value * total;
    let idx = weights.length - 1;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i]!;
      if (r <= 0) {
        idx = i;
        break;
      }
    }
    picked.push(remaining[idx]!);
    remaining.splice(idx, 1);
    weights.splice(idx, 1);
  }
  return { picked, seed: s };
}

/**
 * Draws 7 AI seats from `tournament`'s eligible pool and resolves the
 * entire non-player half of the bracket, leaving the player's three
 * matches (quarterfinal/semifinal/final) determined and ready to play.
 * The eligible pool must have at least 7 opponents.
 */
export function createBracket(tournament: Tournament, eligiblePool: readonly Opponent[], seed: number): TournamentBracket {
  if (eligiblePool.length < 7) {
    throw new Error(`${tournament.name}: eligible pool has ${eligiblePool.length} opponents, needs at least 7`);
  }
  const weightOf = tournament.seatWeight ?? (() => 1);
  const { picked, seed: seedAfterDraw } = weightedDraw(eligiblePool, 7, seed, weightOf);
  // picked[0] = seat 1 (the player's quarterfinal opponent); picked[1..6] = seats 2-7.
  const winner23 = simulateAIMatch(picked[1]!, picked[2]!, seedAfterDraw + 1);
  const winner45 = simulateAIMatch(picked[3]!, picked[4]!, seedAfterDraw + 2);
  const winner67 = simulateAIMatch(picked[5]!, picked[6]!, seedAfterDraw + 3);
  const opponentsById = new Map(picked.map((o) => [o.id, o]));
  const finalOpponentId = simulateAIMatch(opponentsById.get(winner45)!, opponentsById.get(winner67)!, seedAfterDraw + 4);

  return {
    tournamentId: tournament.id,
    seatOpponentIds: picked.map((o) => o.id),
    playerMatches: [
      { opponentId: picked[0]!.id, outcome: "pending" },
      { opponentId: winner23, outcome: "pending" },
      { opponentId: finalOpponentId, outcome: "pending" },
    ],
    status: "in-progress",
  };
}

/** "Tournaments cannot end in a draw — the sovereign is tossed" (design.md §6.3). Callers use this to turn a drawn player match into a win/loss before calling `advanceBracket`. */
export function breakTournamentDraw(seed: number): "win" | "loss" {
  return stepRandom(seed).value < 0.5 ? "win" : "loss";
}

/**
 * Index of the match the player still needs to play, or -1 once the
 * bracket is decided. Checks `status` first, not just "is there a pending
 * slot" — an eliminated bracket still has untouched `"pending"` slots for
 * the rounds the player never reached, which must not read as "still
 * playable."
 */
export function currentMatchIndex(bracket: TournamentBracket): BracketRoundIndex | -1 {
  if (bracket.status !== "in-progress") return -1;
  const idx = bracket.playerMatches.findIndex((m) => m.outcome === "pending");
  return idx === -1 ? -1 : (idx as BracketRoundIndex);
}

/**
 * Records the result of the player's current match. A loss eliminates the
 * player immediately (single elimination); a win on the final match makes
 * them champion; any other win just advances to the next slot. Draws
 * cannot reach here — the match screen breaks them with the sovereign
 * coin-toss (design.md §6.3) before calling this, same as `simulateAIMatch`.
 */
export function advanceBracket(bracket: TournamentBracket, outcome: "win" | "loss"): TournamentBracket {
  const idx = currentMatchIndex(bracket);
  if (idx === -1) return bracket;
  const playerMatches = [...bracket.playerMatches] as TournamentBracket["playerMatches"];
  playerMatches[idx] = { ...playerMatches[idx], outcome: outcome === "win" ? "won" : "lost" };
  const status: TournamentBracket["status"] = outcome === "loss" ? "eliminated" : idx === 2 ? "champion" : "in-progress";
  return { ...bracket, playerMatches, status };
}
