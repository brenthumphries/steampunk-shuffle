// Rules engine (plan step 1.2; rules spec is design.md §5-§6 verbatim). Pure
// TypeScript, no DOM — see CLAUDE.md "No DOM in the rules engine".
//
// State is treated as immutable from the caller's perspective: playTurn()
// clones the incoming state (via structuredClone, so MatchState must stay
// plain data — no functions, hence rngSeed instead of a PRNG closure) and
// returns a new one. Callers hold onto old states for undo (plan §6.4) for
// free.

import type { Card, CardFace, Deck, Effect, Side, Target, TargetFilter } from "../cards/cardTypes.ts";
import { shuffle, stepRandom } from "./rng.ts";
import {
  otherPlayer,
  PLAYER_IDS,
  type BoardCard,
  type CardInstance,
  type MatchState,
  type OwnedBoardCard,
  type PlayerId,
  type PlayOptions,
  type TargetChooser,
} from "./matchTypes.ts";

export * from "./matchTypes.ts";

// ---------------------------------------------------------------------------
// Setup (design.md §6.1)
// ---------------------------------------------------------------------------

export interface CreateMatchOptions {
  /** Who leads round 1. Omit to decide by coin toss (design.md §6.1) using `seed`. */
  leader?: PlayerId;
  /** Deterministic seed for the shuffle (and the coin toss, if `leader` is omitted). */
  seed?: number;
  /**
   * Set false to deal each deck in its given array order instead of
   * shuffling it. Forced tutorial hands are "a deck-order override, not
   * special cards" (design.md §16, plan step 2.7) — this is that override.
   */
  shuffle?: boolean;
}

function expandDeck(deck: Deck, ownerTag: string): CardInstance[] {
  const out: CardInstance[] = [];
  for (const entry of deck) {
    for (let i = 0; i < entry.quantity; i++) {
      out.push({ instanceId: `${ownerTag}:${entry.card.id}#${i}`, card: entry.card });
    }
  }
  return out;
}

export function createMatch(deckA: Deck, deckB: Deck, opts: CreateMatchOptions = {}): MatchState {
  let seed = opts.seed ?? 1;
  const doShuffle = opts.shuffle ?? true;

  let orderedA = expandDeck(deckA, "A");
  let orderedB = expandDeck(deckB, "B");
  if (doShuffle) {
    const shuffledA = shuffle(orderedA, seed);
    seed = shuffledA.seed;
    orderedA = shuffledA.result;
    const shuffledB = shuffle(orderedB, seed);
    seed = shuffledB.seed;
    orderedB = shuffledB.result;
  }

  let leader = opts.leader;
  if (!leader) {
    const toss = stepRandom(seed);
    seed = toss.seed;
    leader = toss.value < 0.5 ? "A" : "B";
  }

  const state: MatchState = {
    players: {
      A: { id: "A", deck: orderedA, hand: [], board: [], discard: [] },
      B: { id: "B", deck: orderedB, hand: [], board: [], discard: [] },
    },
    location: undefined,
    neutralDiscard: [],
    round: 1,
    leader,
    turnsPlayedThisRound: 0,
    roundsWon: { A: 0, B: 0 },
    roundHistory: [],
    status: "in-progress",
    rngSeed: seed,
  };

  // Opening hands (design.md §6.1) — distinct from the start-of-round draw
  // (§6.2.1), which only fires from round 2 onward.
  drawCards(state, "A", 5);
  drawCards(state, "B", 5);

  return state;
}

// ---------------------------------------------------------------------------
// Turn order (design.md §6.2.2)
// ---------------------------------------------------------------------------

export function currentPlayer(state: MatchState): PlayerId {
  const leaderTurn = state.turnsPlayedThisRound % 2 === 0;
  return leaderTurn ? state.leader : otherPlayer(state.leader);
}

/**
 * Plays a card, or passes if the hand is already empty (design.md §6.2.2: "If
 * your hand is empty you pass. There is no voluntary pass" — so `instanceId`
 * is required whenever the hand is non-empty, and forbidden when it's empty).
 */
export function playTurn(state: MatchState, playerId: PlayerId, instanceId?: string, opts?: PlayOptions): MatchState {
  if (state.status !== "in-progress") {
    throw new Error("cannot play a turn: the match is already complete");
  }
  const acting = currentPlayer(state);
  if (playerId !== acting) {
    throw new Error(`it is ${acting}'s turn, not ${playerId}'s`);
  }

  const next = structuredClone(state);
  const player = next.players[playerId];

  if (player.hand.length === 0) {
    if (instanceId !== undefined) {
      throw new Error(`${playerId}'s hand is empty; must pass, not play`);
    }
  } else {
    if (instanceId === undefined) {
      throw new Error(`${playerId} must play a card from hand (hand is non-empty)`);
    }
    const idx = player.hand.findIndex((c) => c.instanceId === instanceId);
    if (idx === -1) {
      throw new Error(`card ${instanceId} is not in ${playerId}'s hand`);
    }
    const [instance] = player.hand.splice(idx, 1) as [CardInstance];
    resolvePlay(next, playerId, instance, opts);
  }

  next.turnsPlayedThisRound += 1;
  if (next.turnsPlayedThisRound >= 6) {
    finishRound(next);
  }
  return next;
}

function resolvePlay(state: MatchState, playerId: PlayerId, instance: CardInstance, opts?: PlayOptions): void {
  // A card always enters play on its front face (design.md §5.10: only the
  // front face counts for deck-building; Transform only ever turns a card
  // that's already in play, never on entry).
  const face = instance.card.faces[0];

  if (face.type === "location") {
    if (state.location) {
      state.neutralDiscard.push({ instanceId: state.location.instanceId, card: state.location.card });
    }
    state.location = { instanceId: instance.instanceId, card: instance.card, faceIndex: 0, faceUp: true, bonusPoints: 0 };
  } else {
    state.players[playerId].board.push({
      instanceId: instance.instanceId,
      card: instance.card,
      faceIndex: 0,
      faceUp: true,
      bonusPoints: 0,
    });
  }

  // On Play resolves immediately, before the turn passes (design.md §5.2).
  // It never fires for un-flipping or transforming — those call sites don't
  // go through resolvePlay.
  for (const ability of face.abilities ?? []) {
    if (ability.trigger !== "onPlay") continue;
    for (const effect of ability.effects) {
      resolveEffect(state, effect, playerId, opts?.chooseTargets, instance.instanceId);
    }
  }

  // Schemes and Headlines are one-shot ("On Play, then it's spent" — §3):
  // discard right after On Play resolves instead of sitting on the board as
  // a 0-point card, so a later "flip your lowest-point card" effect can't
  // hit an already-spent Scheme/Headline instead of a real board card.
  if (face.type === "scheme" || face.type === "headline") {
    const p = state.players[playerId];
    p.board = p.board.filter((bc) => bc.instanceId !== instance.instanceId);
    p.discard.push({ instanceId: instance.instanceId, card: instance.card });
  }
}

// ---------------------------------------------------------------------------
// Round lifecycle (design.md §6.2, §6.3)
// ---------------------------------------------------------------------------

function drawCards(state: MatchState, playerId: PlayerId, amount: number): void {
  // "If the deck has fewer than N, draw what's there. There is no hand limit." (§5.9)
  const p = state.players[playerId];
  const n = Math.min(amount, p.deck.length);
  const drawn = p.deck.splice(0, n);
  p.hand.push(...drawn);
}

function startOfRound(state: MatchState): void {
  // Transform every face-up two-faced card in play (§5.10). Round 1 is a
  // no-op here (nothing has been played yet); the opening deal happens in
  // createMatch, not here.
  for (const pid of PLAYER_IDS) {
    for (const bc of state.players[pid].board) {
      if (bc.faceUp && bc.card.faces.length === 2) {
        bc.faceIndex = bc.faceIndex === 0 ? 1 : 0;
      }
    }
  }
  resolveTriggeredAbilities(state, "startOfRound");
  if (state.round > 1) {
    for (const pid of PLAYER_IDS) drawCards(state, pid, 3);
  }
}

/**
 * Resolves every face-up card's (and the Location's) ability with the given
 * trigger — used for `startOfRound`/`endOfRound`; `onPlay` is resolved
 * directly in resolvePlay instead, since it fires at a specific moment
 * mid-turn rather than at a round boundary.
 */
function resolveTriggeredAbilities(state: MatchState, trigger: "startOfRound" | "endOfRound"): void {
  for (const pid of PLAYER_IDS) {
    // Snapshot first: an effect that flips a card mid-pass shouldn't change
    // which cards' triggers fire during this same pass.
    for (const bc of [...state.players[pid].board]) {
      if (!bc.faceUp) continue;
      for (const ability of activeFace(bc).abilities ?? []) {
        if (ability.trigger !== trigger) continue;
        for (const effect of ability.effects) {
          resolveEffect(state, effect, pid, undefined, bc.instanceId);
        }
      }
    }
  }
  if (state.location) {
    for (const ability of activeFace(state.location).abilities ?? []) {
      if (ability.trigger !== trigger) continue;
      for (const effect of ability.effects) {
        resolveEffect(state, effect, undefined, undefined, state.location.instanceId);
      }
    }
  }
}

function sumRoundScores(state: MatchState, playerId: PlayerId): number {
  return state.roundHistory.reduce((sum, r) => sum + r.scores[playerId], 0);
}

function finishRound(state: MatchState): void {
  // Scores are locked in before any endOfRound ability resolves (e.g. Mr
  // Hyde's own end-of-round Flip, design.md §9.3, must not change who took
  // the round it just applies to).
  const scores: Record<PlayerId, number> = { A: boardScore(state, "A"), B: boardScore(state, "B") };
  const winner: PlayerId | "tie" = scores.A === scores.B ? "tie" : scores.A > scores.B ? "A" : "B";
  state.roundHistory.push({ round: state.round, scores, winner });
  if (winner !== "tie") state.roundsWon[winner] += 1;

  resolveTriggeredAbilities(state, "endOfRound");

  // End-of-round cleanup (§6.2.3), using board state *after* endOfRound
  // abilities have run. Return beats Persist if a card somehow has
  // both (§5.8); face-down cards are always discarded regardless of either.
  for (const pid of PLAYER_IDS) {
    const p = state.players[pid];
    const staying: BoardCard[] = [];
    for (const bc of p.board) {
      const keywords = bc.faceUp ? activeFace(bc).keywords : undefined;
      if (!bc.faceUp) {
        p.discard.push({ instanceId: bc.instanceId, card: bc.card });
      } else if (keywords?.return) {
        p.hand.push({ instanceId: bc.instanceId, card: bc.card });
      } else if (keywords?.persist) {
        staying.push(bc);
      } else {
        p.discard.push({ instanceId: bc.instanceId, card: bc.card });
      }
    }
    p.board = staying;
  }
  // The Location "stays through round ends" unconditionally (§5.6) — no
  // cleanup needed; it's replaced or discardLocation'd, never swept here.

  const nextLeader = winner === "tie" ? otherPlayer(state.leader) : otherPlayer(winner);

  // Match end: first to two rounds ends it immediately, even before round 3
  // is dealt (§6.3).
  if (state.roundsWon.A >= 2 || state.roundsWon.B >= 2) {
    state.status = "complete";
    state.result = { winner: state.roundsWon.A >= 2 ? "A" : "B", reason: "two-rounds" };
    return;
  }

  if (state.round >= 3) {
    if (state.roundsWon.A !== state.roundsWon.B) {
      state.status = "complete";
      state.result = { winner: state.roundsWon.A > state.roundsWon.B ? "A" : "B", reason: "more-rounds-after-three" };
      return;
    }
    const totalA = sumRoundScores(state, "A");
    const totalB = sumRoundScores(state, "B");
    if (totalA !== totalB) {
      state.status = "complete";
      state.result = { winner: totalA > totalB ? "A" : "B", reason: "total-score-after-three" };
      return;
    }
    state.status = "complete";
    state.result = { winner: "draw", reason: "draw-after-three" };
    return;
  }

  state.round += 1;
  state.leader = nextLeader;
  state.turnsPlayedThisRound = 0;
  startOfRound(state);
}

// ---------------------------------------------------------------------------
// Points (design.md §5.1, §5.4, §5.6, §5.13)
// ---------------------------------------------------------------------------

function activeFace(bc: BoardCard): CardFace {
  return bc.card.faces[bc.faceIndex] as CardFace;
}

function isElusive(bc: BoardCard): boolean {
  return bc.faceUp && Boolean(activeFace(bc).keywords?.elusive);
}

/** Printed + one-shot bonuses + Friend, but *not* continuous buffs (see effectivePoints). */
function basePoints(state: MatchState, owner: PlayerId, bc: BoardCard): number {
  if (!bc.faceUp) return 0;
  const face = activeFace(bc);
  let pts = face.points + bc.bonusPoints;
  if (face.keywords?.friend !== undefined) {
    const hasOtherFriend = state.players[owner].board.some(
      (other) => other.instanceId !== bc.instanceId && other.faceUp && activeFace(other).keywords?.friend !== undefined,
    );
    if (hasOtherFriend) pts += face.keywords.friend;
  }
  return pts;
}

function sideToOwners(side: Side, controllerId: PlayerId | undefined): PlayerId[] {
  // A Location has no controller; its effects apply to both players by
  // default regardless of the authored side (§5.6: "unless the text says
  // 'your'" — a "your"-scoped Location effect isn't expressible with the
  // current Target DSL and doesn't occur in any v1 card).
  if (controllerId === undefined) return [...PLAYER_IDS];
  if (side === "self") return [controllerId];
  if (side === "opponent") return [otherPlayer(controllerId)];
  return [...PLAYER_IDS];
}

function matchesFilter(face: CardFace, points: number, filter: TargetFilter | undefined): boolean {
  if (!filter) return true;
  if (filter.maxPoints !== undefined && points > filter.maxPoints) return false;
  if (filter.minPoints !== undefined && points < filter.minPoints) return false;
  if (filter.family !== undefined && face.family !== filter.family) return false;
  if (filter.cardType !== undefined && face.type !== filter.cardType) return false;
  if (filter.hasKeyword !== undefined && face.keywords?.[filter.hasKeyword] === undefined) return false;
  // highestPoints/lowestPoints pick among matches (see defaultSelect); they
  // aren't a membership predicate, so they don't participate here.
  return true;
}

/**
 * Continuous abilities (Locations, or any face-up board card) recomputed
 * live, keyed by the instanceId they buff, so a buff disappears the instant
 * its source leaves play (§5.13: "recomputed whenever the board changes").
 * A continuous effect applies to *every* matching card, unlike a targeted
 * one-shot effect, which respects `count`.
 */
function continuousBuffMap(state: MatchState): Map<string, number> {
  const map = new Map<string, number>();
  const sources: Array<{ effects: Effect[]; ownerId: PlayerId | undefined }> = [];

  for (const pid of PLAYER_IDS) {
    for (const bc of state.players[pid].board) {
      if (!bc.faceUp) continue;
      for (const ability of activeFace(bc).abilities ?? []) {
        if (ability.trigger === "continuous") sources.push({ effects: ability.effects, ownerId: pid });
      }
    }
  }
  if (state.location) {
    for (const ability of activeFace(state.location).abilities ?? []) {
      if (ability.trigger === "continuous") sources.push({ effects: ability.effects, ownerId: undefined });
    }
  }

  for (const { effects, ownerId } of sources) {
    for (const effect of effects) {
      if (effect.effect !== "buff") continue;
      for (const owner of sideToOwners(effect.target.side, ownerId)) {
        for (const bc of state.players[owner].board) {
          if (!bc.faceUp) continue;
          // Matched against base (pre-buff) points to avoid a circular
          // dependency; no v1 card's continuous ability filters by points.
          if (!matchesFilter(activeFace(bc), basePoints(state, owner, bc), effect.target.filter)) continue;
          map.set(bc.instanceId, (map.get(bc.instanceId) ?? 0) + effect.amount);
        }
      }
    }
  }
  return map;
}

/** Effective points for one card in play (§5.1). Floored at 0. */
export function effectivePoints(state: MatchState, owner: PlayerId, bc: BoardCard): number {
  if (!bc.faceUp) return 0;
  const buff = continuousBuffMap(state).get(bc.instanceId) ?? 0;
  return Math.max(0, basePoints(state, owner, bc) + buff);
}

/** A player's round score: the sum of effective points of their face-up board cards (§5.1). */
export function boardScore(state: MatchState, playerId: PlayerId): number {
  return state.players[playerId].board.reduce((sum, bc) => sum + effectivePoints(state, playerId, bc), 0);
}

// ---------------------------------------------------------------------------
// Targeting (design.md §5.13)
// ---------------------------------------------------------------------------

function boardCandidates(
  state: MatchState,
  side: Side,
  controllerId: PlayerId | undefined,
  faceUp: boolean,
  excludeInstanceId: string | undefined,
): OwnedBoardCard[] {
  const out: OwnedBoardCard[] = [];
  for (const owner of sideToOwners(side, controllerId)) {
    for (const bc of state.players[owner].board) {
      if (bc.faceUp === faceUp && bc.instanceId !== excludeInstanceId) out.push({ owner, bc });
    }
  }
  return out;
}

/**
 * Default automatic target selection: highest effective points, then
 * leftmost/oldest (§5.13). Exported so a human TargetChooser (plan step 2.1)
 * can fall back to it for a step it didn't prompt the player on — e.g. a
 * "flip the highest-point card" effect, where the card's own text already
 * says which one, not a real choice — without duplicating the sort here.
 */
export function defaultSelect(matched: OwnedBoardCard[], filter: TargetFilter | undefined, state: MatchState): OwnedBoardCard[] {
  const ascending = Boolean(filter?.lowestPoints);
  return matched
    .map((oc, i) => ({ oc, i, pts: effectivePoints(state, oc.owner, oc.bc) }))
    .sort((a, b) => (ascending ? a.pts - b.pts : b.pts - a.pts) || a.i - b.i)
    .map((w) => w.oc);
}

function selectTargets(
  matched: OwnedBoardCard[],
  effect: Effect & { target: Target },
  state: MatchState,
  chooseTargets: TargetChooser | undefined,
): OwnedBoardCard[] {
  if (matched.length === 0) return [];
  const count = effect.target.count ?? 1;
  if (chooseTargets) {
    return chooseTargets(matched, effect, effect.target).slice(0, count);
  }
  return defaultSelect(matched, effect.target.filter, state).slice(0, count);
}

/** One targeted onPlay effect a human player must (or may) choose targets for before committing. */
export interface TargetPreviewStep {
  effect: Effect & { target: Target };
  /** Legal targets, mirroring the pool resolveEffect will compute for this same effect. */
  candidates: OwnedBoardCard[];
}

const TARGETABLE_EFFECTS = new Set(["flip", "unflip", "return", "buff"]);

/**
 * Previews, in resolution order, every onPlay effect of `card` that will need
 * a target if `controllerId` plays it against `state` right now — the human
 * UI (plan step 2.1) uses this to ask the player to pick targets *before*
 * calling playTurn, since playTurn resolves On Play synchronously and
 * atomically. Mirrors resolveEffect's own pool-building so the candidates
 * here match what resolveEffect will compute, as long as no other play
 * happens in between (true while the player is still deciding their own
 * turn). AI target selection doesn't need this — it supplies its own
 * TargetChooser (or accepts the engine's default) directly to playTurn.
 */
export function previewOnPlayTargets(state: MatchState, controllerId: PlayerId, card: Card): TargetPreviewStep[] {
  const face = card.faces[0];
  const steps: TargetPreviewStep[] = [];
  for (const ability of face.abilities ?? []) {
    if (ability.trigger !== "onPlay") continue;
    for (const effect of ability.effects) {
      if (!TARGETABLE_EFFECTS.has(effect.effect)) continue;
      const withTarget = effect as Effect & { target: Target };
      let pool: OwnedBoardCard[];
      if (withTarget.effect === "flip") {
        pool = boardCandidates(state, withTarget.target.side, controllerId, true, undefined).filter((oc) => !isElusive(oc.bc));
      } else if (withTarget.effect === "unflip") {
        pool = boardCandidates(state, withTarget.target.side, controllerId, false, undefined);
      } else if (withTarget.effect === "return") {
        pool = boardCandidates(state, withTarget.target.side, controllerId, true, undefined).filter(
          (oc) => oc.owner === controllerId || !isElusive(oc.bc),
        );
      } else {
        pool = boardCandidates(state, withTarget.target.side, controllerId, true, undefined);
      }
      const points = (oc: OwnedBoardCard) => (withTarget.effect === "unflip" ? 0 : effectivePoints(state, oc.owner, oc.bc));
      const matched = pool.filter((oc) => matchesFilter(activeFace(oc.bc), points(oc), withTarget.target.filter));
      steps.push({ effect: withTarget, candidates: matched });
    }
  }
  return steps;
}

// ---------------------------------------------------------------------------
// Effects (design.md §5, effect kinds per cardTypes.ts)
// ---------------------------------------------------------------------------

function resolveEffect(
  state: MatchState,
  effect: Effect,
  controllerId: PlayerId | undefined,
  chooseTargets: TargetChooser | undefined,
  sourceInstanceId?: string,
): void {
  switch (effect.effect) {
    case "flip": {
      // Elusive cannot be Flipped, full stop (§5.5) — not just from an
      // opponent's effect, so this exclusion is unconditional. A card's own
      // ability never targets its own physical card via this DSL.
      const pool = boardCandidates(state, effect.target.side, controllerId, true, sourceInstanceId).filter((oc) => !isElusive(oc.bc));
      const matched = pool.filter((oc) => matchesFilter(activeFace(oc.bc), effectivePoints(state, oc.owner, oc.bc), effect.target.filter));
      for (const oc of selectTargets(matched, effect, state, chooseTargets)) oc.bc.faceUp = false;
      break;
    }
    case "unflip": {
      const pool = boardCandidates(state, effect.target.side, controllerId, false, sourceInstanceId);
      // A face-down card has 0 effective points by definition (§5.1); filter
      // checks (if any) see that, not a hypothetical un-flipped value.
      const matched = pool.filter((oc) => matchesFilter(activeFace(oc.bc), 0, effect.target.filter));
      for (const oc of selectTargets(matched, effect, state, chooseTargets)) oc.bc.faceUp = true;
      break;
    }
    case "return": {
      // Elusive "cannot be chosen by an opponent's Return... effect" (§5.5) —
      // protected only when the effect's controller isn't the card's owner.
      const pool = boardCandidates(state, effect.target.side, controllerId, true, sourceInstanceId).filter(
        (oc) => oc.owner === controllerId || !isElusive(oc.bc),
      );
      const matched = pool.filter((oc) => matchesFilter(activeFace(oc.bc), effectivePoints(state, oc.owner, oc.bc), effect.target.filter));
      for (const oc of selectTargets(matched, effect, state, chooseTargets)) {
        const p = state.players[oc.owner];
        p.board = p.board.filter((bc) => bc.instanceId !== oc.bc.instanceId);
        p.hand.push({ instanceId: oc.bc.instanceId, card: oc.bc.card });
      }
      break;
    }
    case "buff": {
      // A one-shot (e.g. onPlay) buff: baked permanently into the target's
      // bonusPoints. Distinct from a *continuous* buff ability, which is
      // recomputed live in continuousBuffMap and applies to every match, not
      // just `count` of them.
      const pool = boardCandidates(state, effect.target.side, controllerId, true, sourceInstanceId);
      const matched = pool.filter((oc) => matchesFilter(activeFace(oc.bc), effectivePoints(state, oc.owner, oc.bc), effect.target.filter));
      for (const oc of selectTargets(matched, effect, state, chooseTargets)) oc.bc.bonusPoints += effect.amount;
      break;
    }
    case "draw":
      // No target field — a Location (controllerId undefined) has no deck of
      // its own to draw from; not exercised by any v1 card.
      if (controllerId) drawCards(state, controllerId, effect.amount);
      break;
    case "discardRandom": {
      for (const owner of sideToOwners(effect.target.side, controllerId)) {
        const p = state.players[owner];
        const n = Math.min(effect.amount, p.hand.length);
        for (let i = 0; i < n; i++) {
          const step = stepRandom(state.rngSeed);
          state.rngSeed = step.seed;
          const idx = Math.floor(step.value * p.hand.length);
          const [discarded] = p.hand.splice(idx, 1) as [CardInstance];
          p.discard.push(discarded);
        }
      }
      break;
    }
    case "discardLocation":
      if (state.location) {
        state.neutralDiscard.push({ instanceId: state.location.instanceId, card: state.location.card });
        state.location = undefined;
      }
      break;
    case "reveal":
      // Concealment is a UI/AI concern, not engine state (design.md §6.5 —
      // hand-sampling is plan step 1.3's problem). The engine's MatchState
      // already holds both hands in full, so there's nothing to mutate.
      break;
    case "steal":
      // Reserved for the stretch legend Robin Hood; unresolved in v1
      // (design.md §16, §9.3). The schema accepts it; the engine no-ops it.
      break;
  }
}
