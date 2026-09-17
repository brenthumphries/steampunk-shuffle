// Pure timing/diff logic for the On-Play/discard 3-beat animation sequencing
// (plan step 3.3 extension). Kept separate from matchScreen.ts's DOM glue so
// the stagger/duration math is testable without jsdom — see CLAUDE.md "every
// new module gets a Vitest unit test".
//
// matchScreen.ts still owns *when* a card gets an animation class at all: it
// already diffs board/hand state against a persisted "as of last render"
// snapshot (see its own file-header comment) because it fully rebuilds the
// DOM every render and needs to know what just changed. This module only
// adds the *stagger ordering* and *total hold duration* on top of that
// existing diff, plus the small pure diffs (buff deltas, hand-origin
// discards) that need an explicit "before" value rather than a boolean flag.

import type { PlayerId } from "../engine/matchEngine.ts";

/** design.md's beat budget (plan/animation-and-turn-indicator-plan.md): announce ~250ms, resolve ~500-700ms, settle ~200ms. */
export const ANNOUNCE_MS = 250;
export const RESOLVE_MS = 650;
export const SETTLE_MS = 200;
/** Total on-play beat for a card with an ability, no stagger tail: 900ms-1.2s per the plan. */
export const ONPLAY_BEAT_MS = ANNOUNCE_MS + RESOLVE_MS + SETTLE_MS;

/** Discard's own three-beat budget: lift ~150ms, arc ~350-450ms, settle-bounce ~150ms — 650-750ms total. */
export const DISCARD_BEAT_MS = 700;

/** Stagger step for multi-target resolve beats (flip/buff/draw), within the plan's 120-150ms range. */
export const RESOLVE_STAGGER_STEP_MS = 140;
/** Stagger step for simultaneous discards (e.g. a hand-size trim), within the plan's "~100ms apart". */
export const DISCARD_STAGGER_STEP_MS = 100;

/** Above this many simultaneously-affected cards, switch to one grouped animation instead of per-card stagger. */
export const STAGGER_GROUP_THRESHOLD = 6;
/** Hard cap on a stagger tail, regardless of how many targets. */
export const MAX_STAGGER_TAIL_MS = 2000;
/** No sequence may hold input longer than this, under any circumstance (plan, reduced-motion paragraph). */
export const MAX_SEQUENCE_MS = 2500;
/** prefers-reduced-motion: collapse to one short cross-fade instead of eliminating the transition outright. */
export const REDUCED_MOTION_MS = 150;

export interface StaggerPlan {
  /** Per-card animation-delay in ms for this beat, 0 if not staggered/not found. */
  delayMs(instanceId: string): number;
  /** True once the affected count exceeds the threshold — callers should use one grouped animation, not per-card delays. */
  grouped: boolean;
}

/**
 * Builds a stagger plan for a set of cards affected in the same resolve beat
 * (flip + buff + draw targets are pooled together — the plan's stagger rule
 * is about "multi-target abilities" in general, not any one effect kind).
 * `orderedIds` should already be in a stable, deterministic order (board/hand
 * order) with duplicates removed by the caller's natural iteration.
 */
export function buildStaggerPlan(orderedIds: readonly string[], stepMs: number = RESOLVE_STAGGER_STEP_MS): StaggerPlan {
  if (orderedIds.length > STAGGER_GROUP_THRESHOLD) {
    return { delayMs: () => 0, grouped: true };
  }
  const delays = new Map(orderedIds.map((id, i) => [id, Math.min(i * stepMs, MAX_STAGGER_TAIL_MS)]));
  return { delayMs: (id) => delays.get(id) ?? 0, grouped: false };
}

/** The set of a hand's card ids that are now in that side's discard pile — i.e. discarded straight from hand (self-spent Scheme/Headline, discardRandom), not swept off the board at round end. */
export function discardedFromHand(prevHandIds: ReadonlySet<string>, afterDiscardIds: readonly string[]): string[] {
  const afterSet = new Set(afterDiscardIds);
  return [...prevHandIds].filter((id) => afterSet.has(id));
}

/** A one-shot buff's point delta for a card present on the board both before and after (bonusPoints diff — never the continuous/Location kind, which has no single "source" moment to float a number at). */
export function buffDelta(prevBonusPoints: number | undefined, nextBonusPoints: number): number {
  if (prevBonusPoints === undefined) return 0; // newly-entered card, not a buff on an existing one
  return nextBonusPoints - prevBonusPoints;
}

export interface SequenceInputs {
  /** A card with at least one onPlay ability was just played (announce/resolve/settle applies to it). */
  hasOnPlayAbilityCard: boolean;
  /** Combined count of cards affected by this commit's resolve beat (flip + buff + draw targets, deduped). */
  affectedTargetCount: number;
  /** Cards discarded straight from a hand this commit (self-spent instant, discardRandom trim). */
  discardFromHandCount: number;
}

/**
 * Total time to hold input for after a commit with visible on-play/discard
 * consequences — 0 means "nothing worth blocking for" (a plain point-card
 * with no ability and no discard just plays its ordinary quick enter
 * animation, already covered by the existing per-render diff). Reduced
 * motion collapses every case to one short, fixed hold rather than 0 (never
 * "eliminate the transition outright" per the plan) or the full budget.
 */
export function computeSequenceDurationMs(inputs: SequenceInputs, reducedMotion: boolean): number {
  const hasAnything = inputs.hasOnPlayAbilityCard || inputs.discardFromHandCount > 0;
  if (!hasAnything) return 0;
  if (reducedMotion) return REDUCED_MOTION_MS;

  let total = 0;
  if (inputs.hasOnPlayAbilityCard) {
    const n = Math.min(inputs.affectedTargetCount, STAGGER_GROUP_THRESHOLD);
    const staggerTail = inputs.affectedTargetCount > STAGGER_GROUP_THRESHOLD ? 400 : Math.max(0, n - 1) * RESOLVE_STAGGER_STEP_MS;
    total = Math.max(total, ONPLAY_BEAT_MS + Math.min(staggerTail, MAX_STAGGER_TAIL_MS));
  }
  if (inputs.discardFromHandCount > 0) {
    const n = Math.min(inputs.discardFromHandCount, STAGGER_GROUP_THRESHOLD);
    const staggerTail = Math.max(0, n - 1) * DISCARD_STAGGER_STEP_MS;
    total = Math.max(total, DISCARD_BEAT_MS + staggerTail);
  }
  return Math.min(total, MAX_SEQUENCE_MS);
}

/** One card's flight from wherever it left (hand or board) to its owner's discard pile. */
export interface DiscardFlight {
  owner: PlayerId;
  instanceId: string;
  delayMs: number;
}

/** Builds the per-card delay for a set of same-commit discard-from-hand events, in the order they should visually leave. */
export function planDiscardFlights(owner: PlayerId, instanceIds: readonly string[]): DiscardFlight[] {
  return instanceIds.map((instanceId, i) => ({
    owner,
    instanceId,
    delayMs: Math.min(i, STAGGER_GROUP_THRESHOLD - 1) * DISCARD_STAGGER_STEP_MS,
  }));
}
