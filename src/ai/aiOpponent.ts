// AI opponent (plan step 1.3; dials are design.md §9.4 verbatim). Pure
// TypeScript, no DOM — same rule as the rules engine (CLAUDE.md "No DOM in
// the rules engine"), so this stays testable headless and usable from the
// balance simulator (plan step 1.4) as well as the match screen.
//
// Shape: a heuristic evaluator scores a MatchState for one player; the AI
// picks a move by playing each hand card for real (its own hand is always
// known), then estimating the resulting position by sampling a plausible
// opponent hand from their public decklist (design.md §6.5) and running a
// short minimax search from there. More hidden-hand samples average out the
// guesswork; more lookahead turns let the search see further. Difficulty
// only changes the dials below — there is one search, not three.

import type { Card, Deck } from "../cards/cardTypes.ts";
import {
  boardScore,
  currentPlayer,
  otherPlayer,
  playTurn,
  type CardInstance,
  type MatchState,
  type PlayerId,
} from "../engine/matchEngine.ts";
import { shuffle, stepRandom } from "../engine/rng.ts";

export const DIFFICULTIES = ["regular", "seasoned", "legend"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export interface DifficultyDial {
  /** Turns simulated forward from the candidate move, this move included. */
  lookaheadTurns: number;
  /** How many plausible opponent hands to average the estimate over. */
  hiddenHandSamples: number;
  /** Chance of picking uniformly among the top N moves instead of the best one. */
  noise: { topN: number; chance: number };
}

/** design.md §9.4, verbatim. */
export const DIFFICULTY_DIALS: Record<Difficulty, DifficultyDial> = {
  regular: { lookaheadTurns: 1, hiddenHandSamples: 1, noise: { topN: 3, chance: 0.4 } },
  seasoned: { lookaheadTurns: 2, hiddenHandSamples: 8, noise: { topN: 2, chance: 0.15 } },
  legend: { lookaheadTurns: 3, hiddenHandSamples: 32, noise: { topN: 1, chance: 0 } },
};

export interface AIMove {
  /** Card to play, or undefined to pass (only legal when the hand is empty). */
  instanceId?: string;
  /** Threaded RNG seed for the AI's next decision — a separate stream from `state.rngSeed`. */
  nextSeed: number;
}

/**
 * Picks a move for `playerId` (must be `currentPlayer(state)`). `opponentDeckList`
 * is the opponent's public decklist (design.md §6.5: every opponent's deck is
 * public in the pub) — used only to sample a plausible hidden hand, never to
 * read the opponent's actual hand/deck contents.
 */
export function chooseAIMove(
  state: MatchState,
  playerId: PlayerId,
  opponentDeckList: Deck,
  difficulty: Difficulty,
  seed: number,
): AIMove {
  if (state.status !== "in-progress") {
    throw new Error("cannot choose a move: the match is already complete");
  }
  const acting = currentPlayer(state);
  if (playerId !== acting) {
    throw new Error(`it is ${acting}'s turn, not ${playerId}'s`);
  }

  const hand = state.players[playerId].hand;
  if (hand.length === 0) return { instanceId: undefined, nextSeed: seed };

  const dial = DIFFICULTY_DIALS[difficulty];
  const opponentId = otherPlayer(playerId);
  let s = seed;

  const scored = hand.map((instance) => {
    const afterOwnMove = playTurn(state, playerId, instance.instanceId);
    if (afterOwnMove.status === "complete") {
      // The outcome is exact — no hidden information left to sample over.
      return { instanceId: instance.instanceId, score: evaluateState(afterOwnMove, playerId) };
    }
    let sum = 0;
    for (let i = 0; i < dial.hiddenHandSamples; i++) {
      const step = stepRandom(s);
      s = step.seed;
      const believed = sampleOpponentHand(afterOwnMove, opponentId, opponentDeckList, s);
      sum += minimax(believed, dial.lookaheadTurns - 1, playerId);
    }
    return { instanceId: instance.instanceId, score: sum / dial.hiddenHandSamples };
  });

  applyBehaviorDials(state, playerId, hand, scored, difficulty);
  scored.sort((a, b) => b.score - a.score);

  const noiseStep = stepRandom(s);
  s = noiseStep.seed;
  let chosenIndex = 0;
  if (noiseStep.value < dial.noise.chance) {
    const topN = Math.min(dial.noise.topN, scored.length);
    const pickStep = stepRandom(s);
    s = pickStep.seed;
    chosenIndex = Math.floor(pickStep.value * topN);
  }

  return { instanceId: scored[chosenIndex]!.instanceId, nextSeed: s };
}

/** Convenience wrapper: choose a move and play it in one call. */
export function playAITurn(
  state: MatchState,
  playerId: PlayerId,
  opponentDeckList: Deck,
  difficulty: Difficulty,
  seed: number,
): { state: MatchState; nextSeed: number } {
  const move = chooseAIMove(state, playerId, opponentDeckList, difficulty, seed);
  return { state: playTurn(state, playerId, move.instanceId), nextSeed: move.nextSeed };
}

// ---------------------------------------------------------------------------
// Minimax: the turns after the AI's own candidate move, searched by true
// backward induction rather than a fixed forward playout — evaluateState is
// zero-sum by construction (evaluateState(s, A) === -evaluateState(s, B)),
// so from `forPlayer`'s fixed perspective this is plain minimax: whoever is
// acting at a node picks the child that's best *for them*, which is a max
// when it's forPlayer acting and a min when it's the opponent acting.
// Branching is small (hand size, typically 3-8) and depth is bounded by the
// dial (at most 2 here — the AI's own candidate move is already applied
// before this is called), so this stays cheap enough for the balance
// simulator (plan step 1.4) to run thousands of AI-vs-AI games.
// ---------------------------------------------------------------------------

function minimax(state: MatchState, depth: number, forPlayer: PlayerId): number {
  if (state.status !== "in-progress" || depth <= 0) {
    return evaluateState(state, forPlayer);
  }
  const acting = currentPlayer(state);
  const hand = state.players[acting].hand;
  if (hand.length === 0) {
    return minimax(playTurn(state, acting), depth - 1, forPlayer);
  }
  const maximizing = acting === forPlayer;
  let best = maximizing ? -Infinity : Infinity;
  for (const instance of hand) {
    const next = playTurn(state, acting, instance.instanceId);
    const score = minimax(next, depth - 1, forPlayer);
    if (maximizing ? score > best : score < best) best = score;
  }
  return best;
}

// ---------------------------------------------------------------------------
// Heuristic evaluator
// ---------------------------------------------------------------------------

function evaluateState(state: MatchState, forPlayer: PlayerId): number {
  if (state.status === "complete") {
    const result = state.result;
    if (!result || result.winner === "draw") return 0;
    return result.winner === forPlayer ? 10_000 : -10_000;
  }
  const opponent = otherPlayer(forPlayer);
  let score = (state.roundsWon[forPlayer] - state.roundsWon[opponent]) * 1000;
  score += boardScore(state, forPlayer) - boardScore(state, opponent);
  score += 0.5 * handPotential(state.players[forPlayer].hand);
  score -= 0.5 * handPotential(state.players[opponent].hand);
  return score;
}

function handPotential(hand: CardInstance[]): number {
  return hand.reduce((sum, instance) => sum + cardPotentialValue(instance.card), 0);
}

/** Rough future-scoring value of a card still in hand: printed points plus a nudge for useful keywords/abilities. */
function cardPotentialValue(card: Card): number {
  const face = card.faces[0];
  let value = face.points;
  if (face.keywords?.persist) value += 0.5;
  if (face.keywords?.elusive) value += 0.5;
  if (face.keywords?.friend) value += 0.5;
  if (face.abilities?.some((a) => a.trigger === "onPlay")) value += 0.5;
  return value;
}

// ---------------------------------------------------------------------------
// Behavior dials that adjust move scores directly, rather than through the
// evaluator (design.md §9.4's last two rows — root-level tendencies, not
// position quality).
// ---------------------------------------------------------------------------

function applyBehaviorDials(
  state: MatchState,
  playerId: PlayerId,
  hand: CardInstance[],
  scored: { instanceId: string; score: number }[],
  difficulty: Difficulty,
): void {
  if (difficulty === "regular") return; // "never holds", "never concedes" (§9.4)

  const conceded = roundIsUnwinnable(state, playerId);
  const isLastTurnOfRound = state.turnsPlayedThisRound >= 4;

  // These are root-level tendencies (§9.4's last two rows), not a
  // replacement for the search above — so they nudge scores rather than
  // override them. A hard override risks discarding a much better search
  // result over a heuristic (`roundIsUnwinnable`, `cardPotentialValue`) that
  // can't see synergy the search already accounted for (e.g. an unplayed
  // Friend card still boosting a card already on the board).
  for (const entry of scored) {
    const instance = hand.find((i) => i.instanceId === entry.instanceId);
    if (!instance) continue;
    const card = instance.card;

    if (conceded) {
      // Prefer dumping the least useful card over spending a good one on a
      // round that's already lost (§9.4: "dumps low cards").
      entry.score -= 0.5 * cardPotentialValue(card);
    }

    if (!isLastTurnOfRound && hasFlipOnPlay(card)) {
      // "Holds Flips for the last turn of a round": seasoned sometimes,
      // legend saves them for when the round is actually won by it.
      entry.score -= difficulty === "legend" ? 1.5 : 0.75;
    }
  }
}

function hasFlipOnPlay(card: Card): boolean {
  const face = card.faces[0];
  return Boolean(face.abilities?.some((a) => a.trigger === "onPlay" && a.effects.some((e) => e.effect === "flip")));
}

function roundIsUnwinnable(state: MatchState, playerId: PlayerId): boolean {
  const opponent = otherPlayer(playerId);
  const remainingTurns = remainingTurnsThisRound(state, playerId);
  const bestPossibleGain = topNHandPoints(state.players[playerId].hand, remainingTurns);
  return boardScore(state, playerId) + bestPossibleGain <= boardScore(state, opponent);
}

/** How many more turns `playerId` gets before this round's cleanup (design.md §6.2). */
function remainingTurnsThisRound(state: MatchState, playerId: PlayerId): number {
  let count = 0;
  for (let t = state.turnsPlayedThisRound; t < 6; t++) {
    const who = t % 2 === 0 ? state.leader : otherPlayer(state.leader);
    if (who === playerId) count++;
  }
  return count;
}

function topNHandPoints(hand: CardInstance[], n: number): number {
  return [...hand]
    .map((instance) => instance.card.faces[0].points)
    .sort((a, b) => b - a)
    .slice(0, n)
    .reduce((sum, points) => sum + points, 0);
}

// ---------------------------------------------------------------------------
// Hidden-hand sampling (design.md §6.5, plan step 1.3)
// ---------------------------------------------------------------------------

/**
 * Replaces `opponentId`'s hand and deck with a random sample consistent with
 * their public decklist minus what's already visible (board, discard, and
 * any Location/neutral-discard card that started in their deck). Relies on
 * the `${owner}:${card.id}#${n}` instanceId convention `createMatch` assigns
 * (matchEngine.ts `expandDeck`) to attribute Location/neutral-discard cards.
 */
function sampleOpponentHand(state: MatchState, opponentId: PlayerId, deckList: Deck, seed: number): MatchState {
  const opponent = state.players[opponentId];
  const handSize = opponent.hand.length;
  const deckSize = opponent.deck.length;
  const seen = seenCardsFor(state, opponentId);
  const pool = unseenPool(deckList, seen, handSize + deckSize);
  const shuffled = shuffle(pool, seed).result;

  const next = structuredClone(state);
  next.players[opponentId].hand = shuffled.slice(0, handSize);
  next.players[opponentId].deck = shuffled.slice(handSize, handSize + deckSize);
  return next;
}

function seenCardsFor(state: MatchState, owner: PlayerId): CardInstance[] {
  const seen: CardInstance[] = [];
  for (const bc of state.players[owner].board) seen.push({ instanceId: bc.instanceId, card: bc.card });
  seen.push(...state.players[owner].discard);
  if (state.location && state.location.instanceId.startsWith(`${owner}:`)) {
    seen.push({ instanceId: state.location.instanceId, card: state.location.card });
  }
  for (const ci of state.neutralDiscard) {
    if (ci.instanceId.startsWith(`${owner}:`)) seen.push(ci);
  }
  return seen;
}

/** The decklist's card multiset minus `seen`, as fresh instances safe to shuffle. */
function unseenPool(deckList: Deck, seen: CardInstance[], needed: number): CardInstance[] {
  const counts = new Map<string, { card: Card; count: number }>();
  for (const entry of deckList) {
    const cur = counts.get(entry.card.id);
    counts.set(entry.card.id, { card: entry.card, count: (cur?.count ?? 0) + entry.quantity });
  }
  for (const s of seen) {
    const cur = counts.get(s.card.id);
    if (cur && cur.count > 0) cur.count -= 1;
  }

  const pool: CardInstance[] = [];
  let uid = 0;
  for (const { card, count } of counts.values()) {
    for (let i = 0; i < count; i++) pool.push({ instanceId: `sample:${card.id}#${uid++}`, card });
  }
  // Defensive: a decklist that doesn't fully account for what's visible
  // (e.g. a mismatched list passed by a caller) shouldn't crash sampling —
  // top up by cycling the decklist instead of running short.
  while (pool.length < needed && deckList.length > 0) {
    const entry = deckList[pool.length % deckList.length]!;
    pool.push({ instanceId: `sample-topup:${entry.card.id}#${uid++}`, card: entry.card });
  }
  return pool;
}
