// Runtime match state (design.md §5-§6). Structural card data lives in
// cardTypes.ts; these types are what the rules engine (matchEngine.ts)
// actually plays with.

import type { Ability, Card, Effect, Target } from "../cards/cardTypes.ts";

export type PlayerId = "A" | "B";
export const PLAYER_IDS: readonly PlayerId[] = ["A", "B"];

export function otherPlayer(id: PlayerId): PlayerId {
  return id === "A" ? "B" : "A";
}

/** A single physical copy of a card, wherever it currently lives (deck/hand/discard). */
export interface CardInstance {
  readonly instanceId: string;
  readonly card: Card;
}

/**
 * A card in play. `faceIndex` selects the active face (design.md §5.10 Transform);
 * `bonusPoints` accumulates one-shot `buff` effects (continuous buffs, e.g. from a
 * Location, are recomputed live in matchEngine.ts and are never baked in here).
 */
export interface BoardCard {
  readonly instanceId: string;
  readonly card: Card;
  faceIndex: 0 | 1;
  faceUp: boolean;
  bonusPoints: number;
}

export interface PlayerState {
  readonly id: PlayerId;
  /** Draw pile; index 0 is the top of the deck. */
  deck: CardInstance[];
  hand: CardInstance[];
  /** Play order; index 0 is the oldest/leftmost card (design.md §5.13 tie-break). */
  board: BoardCard[];
  discard: CardInstance[];
}

export interface RoundResult {
  round: number;
  scores: Record<PlayerId, number>;
  winner: PlayerId | "tie";
}

export interface MatchResult {
  winner: PlayerId | "draw";
  reason: "two-rounds" | "more-rounds-after-three" | "total-score-after-three" | "draw-after-three";
}

export interface MatchState {
  players: Record<PlayerId, PlayerState>;
  /** The single shared Location (design.md §5.6), or none active. */
  location: BoardCard | undefined;
  /** Locations discarded by being replaced or by a `discardLocation` effect. Not owned by either player. */
  neutralDiscard: CardInstance[];
  /** 1-based; the round currently in progress, or the last round played once `status` is "complete". */
  round: number;
  /** Leader of the current round (design.md §6.2.2, §6.2.4). */
  leader: PlayerId;
  /** 0-5; whose turn it is derives from this and `leader` (leader plays on even indices). */
  turnsPlayedThisRound: number;
  roundsWon: Record<PlayerId, number>;
  roundHistory: RoundResult[];
  status: "in-progress" | "complete";
  result?: MatchResult;
  rngSeed: number;
}

/** A board card together with which player's board it's on — needed once a target pool spans both sides. */
export interface OwnedBoardCard {
  owner: PlayerId;
  bc: BoardCard;
}

/**
 * Overrides the engine's default target-selection rule (design.md §5.13: highest
 * effective points, then leftmost/oldest). The human UI and the AI opponent (plan
 * step 1.3) supply their own choosers; tests use one to pin an otherwise-ambiguous
 * pick. Must return a subset (in chosen order) of `candidates`.
 */
export type TargetChooser = (candidates: OwnedBoardCard[], effect: Effect, target: Target) => OwnedBoardCard[];

export interface PlayOptions {
  chooseTargets?: TargetChooser;
}

export type { Ability, Effect, Target };
