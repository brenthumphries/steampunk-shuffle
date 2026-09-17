// The match screen (plan step 2.1): hand, both boards, score, round tracker,
// card zoom, play/undo-before-commit (design.md §6.4), end-of-round reveal.
// DOM glue only — turn staging lives in src/match/humanTurn.ts so it's
// testable without jsdom; this file wires that to the engine and rebuilds
// the DOM from scratch on every state change (small trees, cheap to redo).

import type { Card, CardFace, Deck } from "../cards/cardTypes.ts";
import {
  boardScore,
  createMatch,
  currentPlayer,
  effectivePoints,
  playTurn,
  type BoardCard,
  type MatchResult,
  type MatchState,
  type PlayerId,
  type RoundResult,
  type TargetChooser,
} from "../engine/matchEngine.ts";
import { playAITurn, type Difficulty } from "../ai/aiOpponent.ts";
import { abilityLines, describeAutoTarget, effectPromptLabel, keywordChips } from "./cardText.ts";
import { buildCardZoomEl } from "./cardZoom.ts";
import { currentStep, isReadyToConfirm, stagePlay, toChooserSelections, toggleTarget, type StagedPlay } from "../match/humanTurn.ts";
import { buildTargetChooser } from "../match/targetChooser.ts";
import { buildBeerMat } from "./beerMat.ts";
import { buildMuteToggle } from "./muteToggle.ts";
import { playSound } from "../audio/soundEngine.ts";
import type { HintId } from "../tutorial/tutorialState.ts";
import { buildMatchHud } from "./matchHud.ts";
import {
  buffDelta,
  buildStaggerPlan,
  computeSequenceDurationMs,
  DISCARD_BEAT_MS,
  discardedFromHand,
  planDiscardFlights,
  REDUCED_MOTION_MS,
  type DiscardFlight,
  type StaggerPlan,
} from "./matchAnimation.ts";

const HUMAN: PlayerId = "A";
const AI: PlayerId = "B";
const AI_DELAY_MS = 900;
const PASS_DELAY_MS = 900;

/** One turn of the tutorial's forced script (plan step 2.7, design.md §13.2). */
export interface ScriptedTurn {
  side: PlayerId;
  cardId: string;
  mat: string;
}

export interface TutorialMatchOptions {
  beforeDeal: string[];
  /** Every turn of the match, in play order — matchScreen drives both sides through it, including the house's, instead of the real AI. */
  turns: readonly ScriptedTurn[];
  /** Extra beer-mat text folded into the round-reveal overlay for a round that doesn't also end the match. */
  roundEndMats: Partial<Record<number, string>>;
  /** Extra beer-mat text folded into the match-over overlay. */
  matchEndMat: string;
}

/** design.md §13.3's hint chips: still-eligible ones (not yet shown, ever), their text, and how to record one as shown. */
export interface HintOptions {
  active: ReadonlySet<HintId>;
  text: Partial<Record<HintId, string>>;
  onShown: (hint: HintId) => void;
}

export interface MatchScreenOptions {
  humanDeck: Deck;
  aiDeck: Deck;
  aiName: string;
  aiPortraitArtId?: string;
  /**
   * Fixed for most opponents; a function lets an opponent's dial depend on
   * match state (e.g. Dr Jekyll/Mr Hyde's per-round override, design.md
   * §9.3 — see src/pub/opponents.ts).
   */
  difficulty: Difficulty | ((state: MatchState) => Difficulty);
  /** Resume a previously-saved mid-match state (design.md §12.4: "kill the app mid-match → resume") instead of dealing a fresh one. */
  initialState?: { state: MatchState; aiSeed: number };
  /** Called on mount and after every committed turn (human play, AI turn, forced pass) so the caller can autosave the match (design.md §12.4). */
  onStateChange?: (state: MatchState, aiSeed: number) => void;
  /** Called once the player dismisses the match-over overlay, with the final result. */
  onExit: (result: MatchResult) => void;
  /**
   * PT-14: a read-only preview of what this result will pay out (Checks,
   * reward card), shown on the match-over overlay before the player leaves
   * the table. Pure and side-effect-free — matchScreen never touches
   * PubState itself, so the caller computes this from its own state each
   * time it's asked. Omitted (e.g. tournament matches, whose payout shows
   * on the bracket screen instead) simply shows nothing extra.
   */
  previewResult?: (result: MatchResult) => string | null;
  /** Plays the tutorial's forced script (design.md §13.2) instead of a normal random-shuffled/AI-driven match. */
  tutorial?: TutorialMatchOptions;
  /** design.md §13.3's hint chips — ignored during a tutorial match (see `tutorial`). */
  hints?: HintOptions;
}

type Phase =
  | { kind: "coin-toss" }
  | { kind: "idle" }
  | { kind: "staging"; play: StagedPlay }
  | { kind: "ai-turn" }
  | { kind: "human-pass" }
  /** Bugfix cluster E (note #6): a brief hold on the opponent's just-played Scheme/Headline before moving on — see afterCommit's own comment. */
  | { kind: "instant-announce"; card: Card }
  /** Plan step 3.3 extension: a brief input-blocking hold while a just-committed turn's on-play/discard animation beats play out (any commit not already covered by instant-announce) — see afterCommit's holdMs computation. */
  | { kind: "resolving" }
  | { kind: "round-reveal"; result: RoundResult }
  | { kind: "match-over" };

/** design.md §3: Schemes and Headlines resolve their On Play and discard in the same instant (Nokturna's "Instant" cards) — see cluster E's fix. */
function isInstantType(card: Card): boolean {
  const type = card.faces[0].type;
  return type === "scheme" || type === "headline";
}

/** Plan step 3.3 extension: does this card's front face (the only face On Play ever resolves for — design.md §5.10) have a real On Play ability, i.e. is its entrance worth the fuller announce/resolve/settle beat instead of the plain quick enter? */
function cardHasOnPlayAbility(card: Card): boolean {
  return (card.faces[0].abilities ?? []).some((a) => a.trigger === "onPlay" && a.effects.length > 0);
}

const INSTANT_ANNOUNCE_MS = 1300;

function artUrl(assetId: string): string {
  return `${import.meta.env.BASE_URL}art/${assetId}.webp`;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1);
}

function activeFaceOf(card: Card, faceIndex: 0 | 1): CardFace {
  return (card.faces as readonly CardFace[])[faceIndex] ?? card.faces[0];
}

/** Mounts the match screen into `root` and returns a teardown function. */
export function mountMatchScreen(root: HTMLElement, options: MatchScreenOptions): () => void {
  let state: MatchState =
    options.initialState?.state ??
    (options.tutorial
      ? createMatch(options.humanDeck, options.aiDeck, { seed: 1, shuffle: false, leader: AI }) // design.md §13.1: "the house always leads" in the tutorial
      : createMatch(options.humanDeck, options.aiDeck, { seed: Date.now() }));
  let aiSeed = options.initialState?.aiSeed ?? (Date.now() ^ 0x9e3779b9);
  // A resumed match may have finished (killed while the match-over overlay
  // was up, before "Leave the table" was tapped) — scheduleNext() no-ops
  // once status isn't "in-progress", so idle would never show the overlay.
  // PT-11: a genuinely fresh (non-resumed, non-tutorial) match opens on a
  // one-beat coin-toss overlay instead of going straight to idle — the
  // tutorial already narrates "the house always leads" itself (design.md
  // §13.1), and a resumed match's leader was already announced last session.
  const isFreshMatch = !options.initialState && !options.tutorial;
  let phase: Phase = state.status === "complete" ? { kind: "match-over" } : isFreshMatch ? { kind: "coin-toss" } : { kind: "idle" };
  let zoomed: { card: Card; faceIndex: 0 | 1 } | null = null;
  // Typed via the ambient (Node) `setTimeout` rather than `window.setTimeout`
  // — with both the "dom" lib and @types/node loaded (tsconfig.json), only
  // the bare global's return type resolves consistently; it's still the
  // real browser timer at runtime, just an opaquely-typed handle here.
  let timer: ReturnType<typeof setTimeout> | undefined;
  let torn = false;

  // Animation (plan step 3.3): this screen fully rebuilds its DOM on every
  // render (see the file-header comment), so there's no persistent card
  // element to animate a transition on. Instead these snapshots capture
  // "what the board/location looked like as of the last render" so the
  // next render can diff against them and flag exactly which cards are
  // newly played (not in the snapshot) or just flipped (same instanceId,
  // faceUp toggled) — everything else renders with no animation class at
  // all. Updated at the end of every render(), so a re-render that isn't
  // caused by a board change (opening the zoom modal, a beer mat firing)
  // never replays an animation a prior render already showed.
  interface BoardSideSnapshot {
    faceUp: Map<string, boolean>;
    /** Plan step 3.3 extension: also snapshotted so a render can diff a one-shot buff's bonusPoints delta for the floating "+N"/"-N" indicator — the flip/enter flags above only ever needed a boolean. */
    bonusPoints: Map<string, number>;
  }
  function snapshotBoardSide(s: MatchState, pid: PlayerId): BoardSideSnapshot {
    return {
      faceUp: new Map(s.players[pid].board.map((bc) => [bc.instanceId, bc.faceUp])),
      bonusPoints: new Map(s.players[pid].board.map((bc) => [bc.instanceId, bc.bonusPoints])),
    };
  }
  function snapshotBoard(s: MatchState): Record<PlayerId, BoardSideSnapshot> {
    return { A: snapshotBoardSide(s, "A"), B: snapshotBoardSide(s, "B") };
  }
  let boardAnimSnapshot: Record<PlayerId, BoardSideSnapshot> = snapshotBoard(state);
  let locationAnimSnapshot: string | undefined = state.location?.instanceId;

  /** Plan step 3.3 extension: same "as of last render" idea as the board snapshot above, for the human's own hand — a newly-drawn card (routine turn draw or an On Play draw effect) gets the draw-in entrance instead of appearing with no animation at all. Only the human's hand is ever rendered card-by-card (the AI's is a bare count), so only side A needs tracking. */
  function snapshotHumanHand(s: MatchState): Set<string> {
    return new Set(s.players[HUMAN].hand.map((c) => c.instanceId));
  }
  let handAnimSnapshot: Set<string> = snapshotHumanHand(state);

  /** Plan step 3.3 extension: round/whose-turn "as of last render", so the HUD can flag a just-advanced round or just-changed turn for its handoff animation — same deferred-update timing as the snapshots above (see afterCommit). */
  let hudAnimSnapshot: { round: number; activePlayer: PlayerId } = { round: state.round, activePlayer: currentPlayer(state) };

  /** Read fresh each render rather than cached/listened-to — cheap, and avoids a matchMedia listener's lifecycle for a setting that changing mid-session is a rare edge case anyway. */
  function prefersReducedMotion(): boolean {
    return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
  }

  /**
   * Plays "steam"/"flip" for whatever this commit just changed, by diffing
   * against the same pre-commit snapshot buildBoardRow/buildLocationSlot
   * use for their enter/flip animation classes — computed once here rather
   * than read off those per-render flags, since afterCommit() is called
   * exactly once per real game event while render() can run more than once
   * for it (see afterCommit's own comment on the queued snapshot update).
   * Must run before that snapshot update lands, so it always sees "before
   * this commit" state, same reasoning as the animation diff.
   */
  function playCommitSounds(): void {
    let anyPlay = !!state.location && state.location.instanceId !== locationAnimSnapshot;
    let anyFlip = false;
    for (const side of [HUMAN, AI]) {
      const prevBoard = boardAnimSnapshot[side].faceUp;
      for (const bc of state.players[side].board) {
        const prevFaceUp = prevBoard.get(bc.instanceId);
        if (prevFaceUp === undefined) anyPlay = true;
        else if (prevFaceUp !== bc.faceUp) anyFlip = true;
      }
    }
    if (anyPlay) playSound("steam");
    if (anyFlip) playSound("flip");
  }

  /**
   * Plan step 3.3 extension: everything afterCommit needs to know about this
   * commit's visible on-play/discard consequences, computed once against the
   * not-yet-updated snapshots (same timing reasoning as playCommitSounds —
   * must run before the queueMicrotask snapshot update lands). `cardOf`
   * resolves an instanceId to its Card for the "does the played card have an
   * onPlay ability" check, covering hand, board, and discard so it works
   * whichever zone the played card ended up in.
   */
  function analyzeCommitAnimation(hintSnapshot?: {
    prevHandA: ReadonlySet<string>;
    prevHandB: ReadonlySet<string>;
  }): { holdMs: number; discardFlights: DiscardFlight[] } {
    function cardOf(instanceId: string): Card | undefined {
      for (const pid of [HUMAN, AI]) {
        const p = state.players[pid];
        const found = p.board.find((bc) => bc.instanceId === instanceId)?.card ?? p.discard.find((d) => d.instanceId === instanceId)?.card;
        if (found) return found;
      }
      return undefined;
    }
    function hasOnPlayAbility(card: Card | undefined): boolean {
      return card !== undefined && cardHasOnPlayAbility(card);
    }

    const affected = new Set<string>();
    let newlyPlayedCard: Card | undefined;
    for (const side of [HUMAN, AI] as const) {
      const prevBoard = boardAnimSnapshot[side];
      for (const bc of state.players[side].board) {
        const prevFaceUp = prevBoard.faceUp.get(bc.instanceId);
        if (prevFaceUp === undefined) {
          newlyPlayedCard = bc.card; // just entered play this commit
          continue;
        }
        if (prevFaceUp !== bc.faceUp) affected.add(bc.instanceId);
        const delta = buffDelta(prevBoard.bonusPoints.get(bc.instanceId), bc.bonusPoints);
        if (delta !== 0) affected.add(bc.instanceId);
      }
    }
    if (state.location && state.location.instanceId !== locationAnimSnapshot) newlyPlayedCard ??= state.location.card;

    let discardFlights: DiscardFlight[] = [];
    if (hintSnapshot) {
      const discardedA = discardedFromHand(hintSnapshot.prevHandA, state.players.A.discard.map((d) => d.instanceId));
      const discardedB = discardedFromHand(hintSnapshot.prevHandB, state.players.B.discard.map((d) => d.instanceId));
      discardFlights = [...planDiscardFlights("A", discardedA), ...planDiscardFlights("B", discardedB)];
      // A self-spent Scheme/Headline never rendered on the board at all
      // (resolvePlay discards it in the same synchronous pass it enters play
      // — see matchEngine.ts's resolvePlay) — its onPlay ability still
      // counts as "the played card" for the announce/resolve beat.
      newlyPlayedCard ??= cardOf(discardedA[0] ?? discardedB[0] ?? "");
    }

    const holdMs = computeSequenceDurationMs(
      {
        hasOnPlayAbilityCard: hasOnPlayAbility(newlyPlayedCard),
        affectedTargetCount: affected.size,
        discardFromHandCount: discardFlights.length,
      },
      prefersReducedMotion(),
    );
    return { holdMs, discardFlights };
  }

  interface CapturedDiscardFlight extends DiscardFlight {
    fromRect: DOMRect;
    toRect: DOMRect;
    card: Card;
  }

  /**
   * Reads the still-current (pre-render) DOM for each discard's origin card
   * and its owner's discard-pile marker — must run before any render() call
   * for this commit (see afterCommit). Silently drops a flight whose origin/
   * destination element or card can't be found (e.g. a unit test's minimal
   * DOM, or root not yet attached) rather than throwing — a missed fly
   * animation is a cosmetic gap, not worth failing the actual turn over.
   */
  function captureDiscardFlightRects(flights: readonly DiscardFlight[]): CapturedDiscardFlight[] {
    const out: CapturedDiscardFlight[] = [];
    for (const f of flights) {
      const fromEl = root.querySelector(`[data-instance-id="${f.instanceId}"]`);
      const toEl = root.querySelector(`.discard-pile[data-side="${f.owner}"] .discard-pile-stack`);
      const card = state.players[f.owner].discard.find((d) => d.instanceId === f.instanceId)?.card;
      if (!fromEl || !toEl || !card) continue;
      out.push({ ...f, fromRect: fromEl.getBoundingClientRect(), toRect: toEl.getBoundingClientRect(), card });
    }
    return out;
  }

  /**
   * Appends the flying discard clones directly to `root`, outside the
   * normal render() tree, so the next unrelated render() (which does
   * root.replaceChildren()) cleans them up for free if one happens to land
   * mid-flight; otherwise their own removal timer does it. Positioned via
   * `position: fixed` using the viewport rects captureDiscardFlightRects
   * already grabbed, so this needs no further DOM measurement.
   */
  function spawnDiscardFlightClones(flights: readonly CapturedDiscardFlight[]): void {
    if (torn) return;
    const reduced = prefersReducedMotion();
    for (const f of flights) {
      const clone = buildCardEl(f.card, 0, { size: "mini", faceUp: true });
      clone.classList.add("discard-flight-clone");
      clone.style.position = "fixed";
      clone.style.margin = "0";
      clone.style.width = `${f.fromRect.width}px`;
      clone.style.height = `${f.fromRect.height}px`;
      clone.style.pointerEvents = "none";
      clone.style.zIndex = "5";
      const dx = f.toRect.left - f.fromRect.left;
      const dy = f.toRect.top - f.fromRect.top;
      if (reduced) {
        // Collapse to the plan's single short cross-fade, shown already at
        // the destination — never a zero-transition instant swap, but also
        // never the full lift/arc/bounce trajectory.
        clone.style.left = `${f.toRect.left}px`;
        clone.style.top = `${f.toRect.top}px`;
        clone.classList.add("discard-flight-clone--reduced");
      } else {
        clone.style.left = `${f.fromRect.left}px`;
        clone.style.top = `${f.fromRect.top}px`;
        clone.style.setProperty("--dx", `${dx}px`);
        clone.style.setProperty("--dy", `${dy}px`);
        clone.style.animationDelay = `${f.delayMs}ms`;
      }
      root.appendChild(clone);
      const arrivalMs = (reduced ? REDUCED_MOTION_MS : Math.round(DISCARD_BEAT_MS * 0.78)) + f.delayMs;
      const lifetime = (reduced ? REDUCED_MOTION_MS : DISCARD_BEAT_MS) + f.delayMs + 60;
      setTimeout(() => clone.remove(), lifetime);
      // The pile itself is already part of the (rebuilt) live DOM by now —
      // re-queried fresh rather than reusing the captured `toEl` reference,
      // which belongs to the pre-commit tree render() just tore down.
      setTimeout(() => {
        const pile = root.querySelector(`.discard-pile[data-side="${f.owner}"] .discard-pile-stack`);
        if (!pile) return;
        pile.classList.add("discard-pile-stack--bump");
        setTimeout(() => pile.classList.remove("discard-pile-stack--bump"), 320);
      }, arrivalMs);
    }
  }

  // Tutorial script cursor (design.md §13.2) — index into options.tutorial.turns.
  let scriptIndex = 0;
  let introQueue: string[] = options.tutorial ? [...options.tutorial.beforeDeal] : [];
  // The beer mat currently showing (tutorial narration or a §13.3 hint chip)
  // — a non-blocking banner, never a full-screen overlay (design.md §13.1:
  // "never blocking a legal move").
  let mat: string | null = introQueue[0] ?? null;
  const hintsFired = new Set<HintId>();

  function fireHint(hint: HintId): void {
    if (!options.hints || hintsFired.has(hint) || !options.hints.active.has(hint)) return;
    const text = options.hints.text[hint];
    if (!text) return;
    hintsFired.add(hint);
    mat = text;
    options.hints.onShown(hint);
    render();
  }

  /** The name of the board card (either side) with this instanceId — for PT-12's auto-target preview text. */
  function boardCardName(instanceId: string): string {
    for (const pid of [HUMAN, AI]) {
      const bc = state.players[pid].board.find((b) => b.instanceId === instanceId);
      if (bc) return activeFaceOf(bc.card, bc.faceIndex).name;
    }
    return "it";
  }

  /** The card that left `playerId`'s hand between `before` and the current `state` — undefined for a pass. */
  function findPlayedCard(before: ReadonlySet<string>, playerId: PlayerId): Card | undefined {
    const afterIds = new Set(state.players[playerId].hand.map((c) => c.instanceId));
    for (const id of before) {
      if (afterIds.has(id)) continue;
      const onBoard = state.players[playerId].board.find((b) => b.instanceId === id);
      if (onBoard) return onBoard.card;
      const discarded = state.players[playerId].discard.find((d) => d.instanceId === id);
      if (discarded) return discarded.card;
    }
    return undefined;
  }

  function dismissMat(): void {
    if (introQueue.length > 0) {
      introQueue = introQueue.slice(1);
      mat = introQueue[0] ?? null;
      render();
      if (introQueue.length === 0) scheduleNext();
      return;
    }
    mat = null;
    render();
    // PT-2: in tutorial mode, scheduleNext() itself waits while a mat is
    // showing (see its own comment) so the house's reply can't overwrite
    // the player's own mat mid-read — dismissing is what lets it proceed.
    if (options.tutorial) scheduleNext();
  }

  function dismissCoinToss(): void {
    if (phase.kind !== "coin-toss") return;
    phase = { kind: "idle" };
    render();
    scheduleNext();
  }

  function clearTimer(): void {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  }

  // -------------------------------------------------------------------
  // Card rendering
  // -------------------------------------------------------------------

  interface CardBuildOpts {
    size: "mini" | "zoom";
    faceUp: boolean;
    highlight?: boolean;
    selected?: boolean;
    disabled?: boolean;
    pointsOverride?: number;
    onPrimary?: () => void;
    onZoom?: () => void;
    /** Stable id for the flight-clone lookup (plan step 3.3 extension — see captureDiscardFlightRects) and for future DOM queries; harmless to set everywhere. */
    instanceId?: string;
    /** This card just entered play (board or Location) since the last render — plays the "card play" announce beat. */
    enterAnimation?: boolean;
    /** The just-played card (enterAnimation) has at least one On Play ability — plays the fuller announce/resolve/settle beat (card-onplay-enter) instead of the plain quick enter. */
    onPlayAbility?: boolean;
    /** This card's faceUp flipped since the last render — plays the "flip" animation, as this commit's resolve-beat target. */
    flipAnimation?: boolean;
    /** This card was just drawn into the human's hand since the last render (routine turn draw or an On Play draw effect) — plays a distinct slide-in entrance. */
    drawAnimation?: boolean;
    /** A one-shot buff resolved on this card this commit — the signed point delta to float ("+2"/"-2") over the points badge. */
    buffDeltaAmount?: number;
    /** This card's resolve-beat animation-delay (flip/buff/draw stagger), in ms — 0 or omitted plays immediately. */
    resolveDelayMs?: number;
  }

  function buildCardEl(card: Card, faceIndex: 0 | 1, opts: CardBuildOpts): HTMLElement {
    const face = activeFaceOf(card, faceIndex);
    const wrap = el("div", `card card--${opts.size}`);
    wrap.dataset.family = face.family;
    wrap.dataset.rarity = card.rarity;
    if (opts.instanceId) wrap.dataset.instanceId = opts.instanceId;
    if (opts.enterAnimation) wrap.classList.add(opts.onPlayAbility ? "card--onplay-enter" : "card--play-enter");
    if (opts.flipAnimation) wrap.classList.add("card--flip");
    if (opts.drawAnimation) wrap.classList.add("card--draw-in");
    if ((opts.flipAnimation || opts.drawAnimation) && opts.resolveDelayMs) wrap.style.animationDelay = `${opts.resolveDelayMs}ms`;

    if (!opts.faceUp) {
      wrap.classList.add("card--facedown");
      const img = document.createElement("img");
      img.src = artUrl("card-back");
      img.alt = "";
      img.className = "card-back-img";
      wrap.appendChild(img);
      // PT-13: both players already saw this card face-up before it was
      // flipped, so hiding its name/points hides nothing real — it just
      // makes "which one was that again?" harder. Dimmed, over the back art.
      const label = el("div", "card-facedown-label");
      label.appendChild(el("span", "card-facedown-points", String(face.points)));
      label.appendChild(el("span", "card-facedown-name", face.name));
      wrap.appendChild(label);
      return wrap;
    }

    if (opts.highlight) wrap.classList.add("card--highlight");
    if (opts.selected) wrap.classList.add("card--selected");
    if (opts.disabled) wrap.classList.add("card--disabled");
    wrap.style.setProperty("--illustration", `url(${artUrl(face.artId)})`);

    const shownPoints = opts.pointsOverride ?? face.points;
    const pointsWrap = el("span", "card-points-wrap");
    const pointsEl = el("span", "card-points", String(shownPoints));
    // PT-27: a card's shown points only ever differ from printed via a
    // buff (bonusPoints, Friend, a continuous Location/card effect) —
    // `pointsOverride` is only ever passed for face-up board cards, so a
    // hand/zoom card (no override) never gets a colour class here.
    if (shownPoints > face.points) pointsEl.classList.add("card-points--boosted");
    else if (shownPoints < face.points) pointsEl.classList.add("card-points--reduced");
    if (opts.buffDeltaAmount) {
      pointsEl.classList.add("card-points--pulse");
      const float = el("span", "points-float", opts.buffDeltaAmount > 0 ? `+${opts.buffDeltaAmount}` : String(opts.buffDeltaAmount));
      if (opts.resolveDelayMs) {
        pointsEl.style.animationDelay = `${opts.resolveDelayMs}ms`;
        float.style.animationDelay = `${opts.resolveDelayMs}ms`;
      }
      pointsWrap.appendChild(float);
    }
    pointsWrap.appendChild(pointsEl);
    wrap.appendChild(pointsWrap);
    wrap.appendChild(el("span", "card-name", face.name));

    const chips = keywordChips(face);
    if (opts.size === "zoom") {
      wrap.appendChild(el("p", "card-meta", `${capitalize(face.type)} · ${capitalize(face.family)} · ${capitalize(card.rarity)}`));
      if (chips.length > 0) {
        const row = el("div", "card-chip-row");
        for (const chip of chips) row.appendChild(el("span", "card-chip", chip));
        wrap.appendChild(row);
      }
      for (const line of abilityLines(face)) wrap.appendChild(el("p", "card-ability", line));
      if (face.flavor) wrap.appendChild(el("p", "card-flavor", `"${face.flavor}"`));
    } else if (chips.length > 0) {
      wrap.appendChild(el("span", "card-chip-mini", chips.join(" · ")));
    }

    if (opts.onPrimary) {
      wrap.classList.add("card--tappable");
      wrap.tabIndex = 0;
      wrap.setAttribute("role", "button");
      wrap.addEventListener("click", (event) => {
        event.stopPropagation();
        if (!opts.disabled) opts.onPrimary!();
      });
    }
    if (opts.onZoom) {
      const zoomBtn = el("button", "card-zoom-btn", "i");
      zoomBtn.type = "button";
      zoomBtn.setAttribute("aria-label", `Show full card: ${face.name}`);
      zoomBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        opts.onZoom!();
      });
      wrap.appendChild(zoomBtn);
    }
    return wrap;
  }

  function openZoom(card: Card, faceIndex: 0 | 1): void {
    zoomed = { card, faceIndex };
    render();
  }

  // -------------------------------------------------------------------
  // Turn handling
  // -------------------------------------------------------------------

  function boardReturnIds(playerId: PlayerId): Set<string> {
    return new Set(
      state.players[playerId].board
        .filter((bc) => bc.faceUp && activeFaceOf(bc.card, bc.faceIndex).keywords?.return)
        .map((bc) => bc.instanceId),
    );
  }

  function captureHintSnapshot(): {
    prevLocationId: string | undefined;
    prevHandA: Set<string>;
    prevHandB: Set<string>;
    prevBoardReturnA: Set<string>;
    prevBoardReturnB: Set<string>;
  } {
    return {
      prevLocationId: state.location?.instanceId,
      prevHandA: new Set(state.players.A.hand.map((c) => c.instanceId)),
      prevHandB: new Set(state.players.B.hand.map((c) => c.instanceId)),
      prevBoardReturnA: boardReturnIds("A"),
      prevBoardReturnB: boardReturnIds("B"),
    };
  }

  function handleHandTap(instanceId: string, card: Card): void {
    if (options.tutorial) {
      const turn = options.tutorial.turns[scriptIndex];
      if (!turn || turn.side !== HUMAN || turn.cardId !== card.id) return; // only the scripted card is tappable — see render()'s hand loop
      scriptIndex += 1;
      mat = turn.mat;
      commitHumanPlay(instanceId, undefined);
      return;
    }
    phase = { kind: "staging", play: stagePlay(state, HUMAN, instanceId, card) };
    render();
  }

  function handleTargetTap(boardInstanceId: string): void {
    if (phase.kind !== "staging") return;
    phase = { kind: "staging", play: toggleTarget(phase.play, boardInstanceId) };
    render();
  }

  function cancelStaging(): void {
    phase = { kind: "idle" };
    render();
  }

  function confirmStaging(): void {
    if (phase.kind !== "staging" || !isReadyToConfirm(phase.play)) return;
    const play = phase.play;
    const chooser: TargetChooser | undefined =
      play.steps.length > 0 ? buildTargetChooser(state, toChooserSelections(play)) : undefined;
    commitHumanPlay(play.instanceId, chooser);
  }

  function commitHumanPlay(instanceId: string | undefined, chooser?: TargetChooser): void {
    const prevRoundCount = state.roundHistory.length;
    const hintSnapshot = captureHintSnapshot();
    state = playTurn(state, HUMAN, instanceId, chooser ? { chooseTargets: chooser } : undefined);
    afterCommit(prevRoundCount, hintSnapshot);
  }

  function afterCommit(
    prevRoundCount: number,
    hintSnapshot?: {
      prevLocationId: string | undefined;
      prevHandA: ReadonlySet<string>;
      prevHandB: ReadonlySet<string>;
      prevBoardReturnA: ReadonlySet<string>;
      prevBoardReturnB: ReadonlySet<string>;
    },
  ): void {
    // Plan step 3.3 extension: a discarded card's element won't exist in any
    // future render (it's just gone from hand/board, nothing to attach a
    // "just discarded" class to) — the only DOM it's ever in is *this*
    // still-current, pre-commit tree, so its flight has to be captured here,
    // synchronously, before anything below calls render() and tears it down.
    const { holdMs, discardFlights } = analyzeCommitAnimation(hintSnapshot);
    const capturedFlights = captureDiscardFlightRects(discardFlights);

    // A single commit can trigger several synchronous render() calls (the
    // idle-phase render right below, then immediately scheduleNext()'s
    // "ai-turn"/"human-pass" phase render) before the browser ever paints —
    // only the last one painted matters, and it must still see this
    // commit's changes as new. Deferring the baseline update to a
    // microtask means it only takes effect once this whole synchronous
    // commit has finished rendering, so every render in that chain diffs
    // against the *previous* commit's board and correctly shows this
    // commit's plays/flips as animated — while a later, unrelated render
    // (opening the zoom modal, a beer mat firing) diffs against the
    // now-updated baseline and replays nothing. handAnimSnapshot/
    // hudAnimSnapshot ride along on the same deferred timing, same reasoning.
    playCommitSounds();
    queueMicrotask(() => {
      boardAnimSnapshot = snapshotBoard(state);
      locationAnimSnapshot = state.location?.instanceId;
      handAnimSnapshot = snapshotHumanHand(state);
      hudAnimSnapshot = { round: state.round, activePlayer: currentPlayer(state) };
    });
    if (capturedFlights.length > 0) queueMicrotask(() => spawnDiscardFlightClones(capturedFlights));
    options.onStateChange?.(state, aiSeed);
    const roundJustEnded = state.roundHistory.length > prevRoundCount;

    // Bugfix cluster E (note #6): computed here, once, regardless of
    // `options.hints` — `playedByAI` (the opponent's) also drives the
    // instant-announce hold below, not just the headline hint.
    const playedByAI = hintSnapshot ? findPlayedCard(hintSnapshot.prevHandB, AI) : undefined;

    if (options.hints && hintSnapshot) {
      if (state.location && state.location.instanceId !== hintSnapshot.prevLocationId) fireHint("location");
      const playedA = findPlayedCard(hintSnapshot.prevHandA, "A");
      if (playedA?.faces[0].type === "headline" || playedByAI?.faces[0].type === "headline") fireHint("headline");
      if (roundJustEnded) {
        // PT-10: diff "on board, face-up, had Return" (before this turn) against
        // "now in hand" (after cleanup), per side — not just "any Return card is
        // in a hand," which also fires for one merely drawn at the round break
        // (2.7's flagged approximation) and never actually left the table.
        const handA = new Set(state.players.A.hand.map((c) => c.instanceId));
        const handB = new Set(state.players.B.hand.map((c) => c.instanceId));
        const returnCardLeftTable =
          [...hintSnapshot.prevBoardReturnA].some((id) => handA.has(id)) ||
          [...hintSnapshot.prevBoardReturnB].some((id) => handB.has(id));
        if (returnCardLeftTable) fireHint("return");
      }
    }

    function proceed(): void {
      if (roundJustEnded) {
        playSound("brassHit");
        // In tutorial mode, the round-ending turn's own mat is never
        // explicitly dismissed once the round-reveal/match-over overlay
        // takes over (its "Continue"/"Leave the table" isn't dismissMat()) —
        // left set, PT-2's scheduleNext() mat gate would wait on it forever,
        // stalling the next round. Non-tutorial hints aren't gated the same
        // way, so a hint mat that happens to fire on the round-ending turn
        // is left alone and stays visible alongside the overlay.
        if (options.tutorial) mat = null;
        // PT-22: a round that also ends the match used to show its own
        // round-reveal overlay, then match-over right behind it on the next
        // tap — checked first here instead, so a deciding round goes
        // straight to the one overlay that actually matters (its own score
        // line moves into buildMatchOverOverlay).
        phase = state.status === "complete" ? { kind: "match-over" } : { kind: "round-reveal", result: state.roundHistory[state.roundHistory.length - 1]! };
        render();
        return;
      }
      phase = { kind: "idle" };
      render();
      scheduleNext();
    }

    // Bugfix cluster E (note #6): a Scheme/Headline resolves its On Play
    // and discards in the same atomic playTurn() call (design.md's
    // "Instant" cards) — by the time this function runs, its effect has
    // already landed and it's already gone from the board, which is
    // exactly what made it "too fast to read" for the tester. This is a
    // UI-only hold, not a change to the engine's resolution timing
    // (`playTurn` stays atomic, same as every other card) — it just pauses
    // the *next* turn from starting until the player's had a moment to see
    // what the opponent just played. Only for the opponent's own plays,
    // never the human's (who already sees the card while staging/
    // confirming it, before it's ever committed).
    if (playedByAI && isInstantType(playedByAI)) {
      phase = { kind: "instant-announce", card: playedByAI };
      render();
      timer = setTimeout(() => {
        timer = undefined;
        proceed();
      }, INSTANT_ANNOUNCE_MS);
      return;
    }

    // Plan step 3.3 extension: every other commit with a visible on-play
    // resolve/discard beat (the human's own play, or a non-instant AI card)
    // gets the same kind of hold, sized to the sequence it actually needs to
    // show (analyzeCommitAnimation, above) rather than the fixed
    // INSTANT_ANNOUNCE_MS — round-ending turns skip this because the
    // round-reveal/match-over overlay right above already blocks input on
    // its own "Continue"/"Leave the table" tap.
    if (!roundJustEnded && holdMs > 0) {
      phase = { kind: "resolving" };
      render();
      timer = setTimeout(() => {
        timer = undefined;
        proceed();
      }, holdMs);
      return;
    }
    proceed();
  }

  function continueAfterRoundReveal(): void {
    // PT-22: afterCommit() now routes a match-ending round straight to
    // match-over instead of round-reveal (see its own comment), so this
    // overlay is only ever reached for a round that didn't also end the
    // match — no need to re-check state.status here any more.
    phase = { kind: "idle" };
    render();
    scheduleNext();
  }

  function scheduleNext(): void {
    if (torn || state.status !== "in-progress") return;
    if (options.tutorial && introQueue.length > 0) return; // wait for "before the deal" to be dismissed
    // PT-2: in tutorial mode, wait for the player to read and dismiss the
    // current beer mat before scheduling the house's reply — otherwise the
    // house's own mat (set inside afterCommit, below) replaces it
    // AI_DELAY_MS later, cutting off narration the player never finished
    // reading. dismissMat() re-calls this once mat clears.
    if (options.tutorial && mat !== null) return;
    const acting = currentPlayer(state);
    if (acting === AI) {
      phase = { kind: "ai-turn" };
      render();
      timer = setTimeout(() => {
        timer = undefined;
        const prevRoundCount = state.roundHistory.length;
        if (options.tutorial) {
          const turn = options.tutorial.turns[scriptIndex];
          if (!turn || turn.side !== AI) throw new Error("tutorial script is out of sync with the match state");
          const inst = state.players[AI].hand.find((c) => c.card.id === turn.cardId);
          if (!inst) throw new Error(`tutorial script expected "${turn.cardId}" in the house's hand`);
          const hintSnapshot = captureHintSnapshot();
          state = playTurn(state, AI, inst.instanceId);
          scriptIndex += 1;
          mat = turn.mat;
          afterCommit(prevRoundCount, hintSnapshot);
        } else {
          const hintSnapshot = captureHintSnapshot();
          const difficulty = typeof options.difficulty === "function" ? options.difficulty(state) : options.difficulty;
          const result = playAITurn(state, AI, options.aiDeck, difficulty, aiSeed);
          state = result.state;
          aiSeed = result.nextSeed;
          afterCommit(prevRoundCount, hintSnapshot);
        }
      }, AI_DELAY_MS);
    } else if (state.players[HUMAN].hand.length === 0) {
      // "If your hand is empty you pass. There is no voluntary pass." (design.md §6.2.2)
      phase = { kind: "human-pass" };
      render();
      timer = setTimeout(() => {
        timer = undefined;
        const prevRoundCount = state.roundHistory.length;
        const hintSnapshot = captureHintSnapshot();
        state = playTurn(state, HUMAN);
        afterCommit(prevRoundCount, hintSnapshot);
      }, PASS_DELAY_MS);
    }
    // Otherwise it's the human's turn with cards in hand — wait for a tap.
  }

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------

  function buildSideLabel(playerId: PlayerId, name: string, portraitArtId: string | undefined, scoreOverride?: number): HTMLElement {
    const wrap = el("div", "side-label");
    if (portraitArtId) {
      const img = document.createElement("img");
      img.src = artUrl(portraitArtId);
      img.alt = "";
      img.className = "side-portrait";
      wrap.appendChild(img);
    }
    const text = el("div", "side-label-text");
    text.appendChild(el("span", "side-name", name));
    // PT-9: during round-reveal, the score paired with the frozen backdrop
    // board is that round's final score, not the next round's (already
    // live in `state` by this point) — see render()'s revealBoards.
    const score = scoreOverride ?? boardScore(state, playerId);
    const scoreText = playerId === HUMAN ? `Your score: ${score}` : `Score: ${score}`;
    text.appendChild(el("span", "side-score", scoreText));
    if (playerId !== HUMAN) {
      text.appendChild(el("span", "side-hand-count", `Hand: ${state.players[playerId].hand.length}`));
    }
    wrap.appendChild(text);
    wrap.appendChild(buildDiscardPile(playerId));
    return wrap;
  }

  /**
   * Plan step 3.3 extension: a small discard-pile marker per side — there
   * was no discard-pile UI at all before this (discarded cards simply
   * vanished), which left "can tell which card left hand and see it land in
   * the discard pile" unsatisfiable. `.discard-pile-stack`'s rect is the
   * landing target `captureDiscardFlightRects` flies a clone toward; the
   * `data-side` attribute is how that lookup finds the right pile.
   */
  function buildDiscardPile(playerId: PlayerId): HTMLElement {
    const wrap = el("div", "discard-pile");
    wrap.dataset.side = playerId;
    wrap.appendChild(el("div", "discard-pile-stack"));
    wrap.appendChild(el("span", "discard-pile-count", String(state.players[playerId].discard.length)));
    return wrap;
  }

  /**
   * `frozen` (PT-9): render a past round's board exactly as it stood at
   * round end — `RoundResult.finalBoard`, from before cleanup — instead of
   * the live (already-swept) one, for the round-reveal overlay's backdrop.
   * `pointsState` is a stand-in MatchState whose board is that same frozen
   * snapshot, so `effectivePoints` still sees the right continuous buffs
   * (the Location doesn't change at round end, so `state.location` itself
   * is still correct to reuse here — see render()'s revealState).
   */
  function buildBoardRow(playerId: PlayerId, resolvePlan: StaggerPlan, frozen?: { board: readonly BoardCard[]; pointsState: MatchState }): HTMLElement {
    const row = el("div", "board-row");
    const step = !frozen && phase.kind === "staging" ? currentStep(phase.play) : undefined;
    const candidateIds = new Set(step?.step.candidates.filter((oc) => oc.owner === playerId).map((oc) => oc.bc.instanceId) ?? []);
    // PT-12: while a card is staged and every targeted effect auto-resolves
    // (no `step` pending a choice), highlight the board card(s) it will
    // actually hit — `humanTurn.ts`'s `selected` already names them.
    const autoTargetIds =
      !frozen && phase.kind === "staging" && !step ? new Set(phase.play.steps.flatMap((s) => (s.needsChoice ? [] : s.selected))) : new Set<string>();
    const board = frozen ? frozen.board : state.players[playerId].board;
    const pointsState = frozen ? frozen.pointsState : state;
    const prevBoard = boardAnimSnapshot[playerId];
    if (board.length === 0) {
      row.appendChild(el("p", "board-empty", "—"));
    }
    for (const bc of board) {
      const isCandidate = candidateIds.has(bc.instanceId);
      // design.md §13.3's Elusive hint: a tap on a face-up, non-candidate,
      // Elusive card while a Flip is being staged means the player just
      // tried to target it — `excludeElusive` already keeps it out of
      // `candidateIds`, so without this it's simply untappable and silent.
      const isElusiveFlipAttempt = !isCandidate && bc.faceUp && step?.step.effect.effect === "flip" && (activeFaceOf(bc.card, bc.faceIndex).keywords?.elusive ?? false);
      const prevFaceUp = frozen ? undefined : prevBoard.faceUp.get(bc.instanceId);
      const justEntered = !frozen && prevFaceUp === undefined;
      const flipAnimation = !frozen && !justEntered && prevFaceUp !== bc.faceUp;
      const delta = frozen || justEntered ? 0 : buffDelta(prevBoard.bonusPoints.get(bc.instanceId), bc.bonusPoints);
      row.appendChild(
        buildCardEl(bc.card, bc.faceIndex, {
          size: "mini",
          faceUp: bc.faceUp,
          instanceId: bc.instanceId,
          pointsOverride: bc.faceUp ? effectivePoints(pointsState, playerId, bc) : undefined,
          highlight: isCandidate || autoTargetIds.has(bc.instanceId),
          selected: isCandidate && (step?.selected.includes(bc.instanceId) ?? false),
          onPrimary: frozen ? undefined : isCandidate ? () => handleTargetTap(bc.instanceId) : isElusiveFlipAttempt ? () => fireHint("elusive") : undefined,
          onZoom: bc.faceUp ? () => openZoom(bc.card, bc.faceIndex) : undefined,
          enterAnimation: justEntered,
          onPlayAbility: justEntered && cardHasOnPlayAbility(bc.card),
          flipAnimation,
          buffDeltaAmount: delta,
          resolveDelayMs: flipAnimation || delta ? resolvePlan.delayMs(bc.instanceId) : undefined,
        }),
      );
    }
    return row;
  }

  function buildLocationSlot(): HTMLElement {
    const wrap = el("div", "location-slot");
    if (state.location) {
      const loc = state.location;
      const justEntered = locationAnimSnapshot !== loc.instanceId;
      wrap.appendChild(
        buildCardEl(loc.card, loc.faceIndex, {
          size: "mini",
          faceUp: true,
          instanceId: loc.instanceId,
          onZoom: () => openZoom(loc.card, loc.faceIndex),
          enterAnimation: justEntered,
          onPlayAbility: justEntered && cardHasOnPlayAbility(loc.card),
        }),
      );
    } else {
      wrap.appendChild(el("p", "location-empty", "No Location in play"));
    }
    return wrap;
  }

  function buildActionBar(): HTMLElement {
    const bar = el("div", "action-bar");
    if (phase.kind === "staging") {
      const step = currentStep(phase.play);
      if (step) {
        const need = step.need - step.selected.length;
        bar.appendChild(
          el(
            "p",
            "action-prompt",
            `${effectPromptLabel(step.step.effect)}${need > 0 ? ` (${need} more)` : ""} for ${activeFaceOf(phase.play.card, 0).name}`,
          ),
        );
      } else {
        bar.appendChild(el("p", "action-prompt", `Play ${activeFaceOf(phase.play.card, 0).name}?`));
        // PT-12: every targetable effect this card has that the player
        // doesn't get to choose a target for — either a single/deterministic
        // auto-pick (named here, matching humanTurn.ts's own defaultSelect
        // resolution) or, if the board has nothing legal, a plain "does
        // nothing" instead of silently committing as a no-op.
        for (const raw of phase.play.allTargetableSteps) {
          const staged = phase.play.steps.find((s) => s.step === raw);
          const names = staged ? staged.selected.map(boardCardName) : [];
          bar.appendChild(el("p", "action-auto-target", describeAutoTarget(raw.effect, names)));
        }
      }
      const buttons = el("div", "action-buttons");
      const cancelBtn = el("button", "action-button action-button--secondary", "Cancel");
      cancelBtn.type = "button";
      cancelBtn.addEventListener("click", cancelStaging);
      buttons.appendChild(cancelBtn);
      if (isReadyToConfirm(phase.play)) {
        const confirmBtn = el("button", "action-button", "Play");
        confirmBtn.type = "button";
        confirmBtn.addEventListener("click", confirmStaging);
        buttons.appendChild(confirmBtn);
      }
      bar.appendChild(buttons);
    } else if (phase.kind === "ai-turn") {
      bar.appendChild(el("p", "action-prompt", `${options.aiName} is thinking…`));
    } else if (phase.kind === "human-pass") {
      bar.appendChild(el("p", "action-prompt", "No cards in hand — passing…"));
    } else if (phase.kind === "resolving") {
      bar.appendChild(el("p", "action-prompt", "Resolving…"));
    } else if (phase.kind === "idle" && state.status === "in-progress") {
      let prompt = currentPlayer(state) === HUMAN ? "Your turn — tap a card to play it." : "";
      if (options.tutorial && currentPlayer(state) === HUMAN) {
        const turn = options.tutorial.turns[scriptIndex];
        const name = turn ? state.players[HUMAN].hand.find((c) => c.card.id === turn.cardId)?.card.faces[0].name : undefined;
        if (name) prompt = `Play this one: ${name}.`;
      }
      bar.appendChild(el("p", "action-prompt", prompt));
    }
    return bar;
  }

  /** Bugfix cluster E (note #6): a held, non-interactive reveal of the opponent's just-resolved Scheme/Headline — see afterCommit's own comment. */
  function buildInstantAnnounceOverlay(card: Card): HTMLElement {
    const overlay = el("div", "overlay overlay--instant-announce");
    const box = el("div", "overlay-box");
    box.appendChild(el("h2", "overlay-title", `${options.aiName} plays…`));
    box.appendChild(buildCardZoomEl(card));
    overlay.appendChild(box);
    return overlay;
  }

  function buildCoinTossOverlay(): HTMLElement {
    // PT-11: design.md §6.1's "Sir Charles's sovereign is tossed" has no
    // canonical heads/tails mapping — this is flavor, not a real coin, so
    // the human leading is arbitrarily "Heads."
    const overlay = el("div", "overlay overlay--coin-toss");
    const box = el("div", "overlay-box");
    const humanLeads = state.leader === HUMAN;
    box.appendChild(el("h2", "overlay-title", humanLeads ? "Heads." : "Tails."));
    box.appendChild(el("p", "overlay-score", humanLeads ? "You lead." : `${options.aiName} leads.`));
    box.appendChild(el("p", "overlay-tutorial-note", "Game on."));
    const btn = el("button", "action-button", "Continue");
    btn.type = "button";
    btn.addEventListener("click", dismissCoinToss);
    box.appendChild(btn);
    overlay.appendChild(box);
    return overlay;
  }

  function buildRoundRevealOverlay(result: RoundResult): HTMLElement {
    const overlay = el("div", "overlay overlay--round-reveal");
    const box = el("div", "overlay-box");
    const title = result.winner === "tie" ? "Round tied" : result.winner === HUMAN ? "You took the round" : `${options.aiName} took the round`;
    box.appendChild(el("h2", "overlay-title", `Round ${result.round}: ${title}`));
    box.appendChild(el("p", "overlay-score", `You ${result.scores[HUMAN]} — ${result.scores[AI]} ${options.aiName}`));
    // PT-22 means this overlay never shows for a match-ending round (see
    // afterCommit) — the match always continues past here, so state.round/
    // state.leader are already the *next* round's, safe to name (PT-30:
    // design.md §6.2.4 — "whoever did not take the previous round leads").
    const nextLeaderLabel = state.leader === HUMAN ? "You lead" : `${options.aiName} leads`;
    box.appendChild(el("p", "overlay-next-leader", `${nextLeaderLabel} round ${state.round}.`));
    const tutorialNote = options.tutorial?.roundEndMats[result.round];
    if (tutorialNote) box.appendChild(el("p", "overlay-tutorial-note", tutorialNote));
    const btn = el("button", "action-button", "Continue");
    btn.type = "button";
    btn.addEventListener("click", continueAfterRoundReveal);
    box.appendChild(btn);
    overlay.appendChild(box);
    return overlay;
  }

  function buildMatchOverOverlay(): HTMLElement {
    const overlay = el("div", "overlay overlay--match-over");
    const box = el("div", "overlay-box");
    const result = state.result!;
    const title = result.winner === "draw" ? "The match is a draw" : result.winner === HUMAN ? "You took the table" : `${options.aiName} took the table`;
    box.appendChild(el("h2", "overlay-title", title));
    // PT-22: a round that both ends the round AND the match used to show
    // this overlay right after its own round-reveal one — now it's the
    // only overlay, so the deciding round's own score line moves here too.
    const finalRound = state.roundHistory[state.roundHistory.length - 1];
    if (finalRound) {
      box.appendChild(el("p", "overlay-score", `Round ${finalRound.round}: You ${finalRound.scores[HUMAN]} — ${finalRound.scores[AI]} ${options.aiName}`));
    }
    box.appendChild(el("p", "overlay-score", `Rounds: You ${state.roundsWon.A} — ${state.roundsWon.B} ${options.aiName}`));
    // PT-14: a read-only preview of what leaving the table pays out — never
    // mutates anything; matchScreen doesn't know what PubState even is.
    const reward = options.previewResult?.(result);
    if (reward) box.appendChild(el("p", "overlay-reward", reward));
    if (options.tutorial) box.appendChild(el("p", "overlay-tutorial-note", options.tutorial.matchEndMat));
    const btn = el("button", "action-button", "Leave the table");
    btn.type = "button";
    btn.addEventListener("click", () => options.onExit(result));
    box.appendChild(btn);
    overlay.appendChild(box);
    return overlay;
  }

  function buildZoomOverlay(): HTMLElement {
    const overlay = el("div", "overlay overlay--zoom");
    overlay.addEventListener("click", () => {
      zoomed = null;
      render();
    });
    const cardEl = buildCardEl(zoomed!.card, zoomed!.faceIndex, { size: "zoom", faceUp: true });
    cardEl.addEventListener("click", (event) => event.stopPropagation());
    overlay.appendChild(cardEl);
    return overlay;
  }

  function render(): void {
    if (torn) return;
    const reducedMotion = prefersReducedMotion();
    root.replaceChildren();
    const screen = el("div", "match-screen");
    screen.style.setProperty("--table-bg", `url(${artUrl("background-the-snug")})`);

    // Plan step 3.3 extension: one stagger plan per render, shared by both
    // board rows and the hand row, so "more than ~6 cards affected at once"
    // is judged across the whole commit (e.g. a cross-board Death-style
    // flip) rather than per row — see matchAnimation.ts's buildStaggerPlan.
    const resolveAffectedIds: string[] = [];
    for (const side of [AI, HUMAN] as const) {
      for (const bc of state.players[side].board) {
        const prev = boardAnimSnapshot[side];
        const prevFaceUp = prev.faceUp.get(bc.instanceId);
        if (prevFaceUp === undefined) continue; // newly entered, not a resolve-beat target
        const flipped = prevFaceUp !== bc.faceUp;
        const buffed = buffDelta(prev.bonusPoints.get(bc.instanceId), bc.bonusPoints) !== 0;
        if (flipped || buffed) resolveAffectedIds.push(bc.instanceId);
      }
    }
    for (const inst of state.players[HUMAN].hand) {
      if (!handAnimSnapshot.has(inst.instanceId)) resolveAffectedIds.push(inst.instanceId);
    }
    const resolvePlan = reducedMotion ? { delayMs: () => 0, grouped: false } : buildStaggerPlan(resolveAffectedIds);

    const topbar = el("div", "match-topbar");
    const topbarLabels = el("div", "match-topbar-labels");
    const turnInRound = Math.floor(state.turnsPlayedThisRound / 2) + 1;
    const activePlayer = currentPlayer(state);
    topbarLabels.appendChild(
      buildMatchHud({
        round: state.round,
        turnInRound,
        activeSide: activePlayer === HUMAN ? "human" : "ai",
        humanName: "You",
        aiName: options.aiName,
        roundJustAdvanced: state.round > hudAnimSnapshot.round,
        turnJustChanged: activePlayer !== hudAnimSnapshot.activePlayer,
      }),
    );
    topbarLabels.appendChild(el("span", "match-rounds-won", `You ${state.roundsWon.A} – ${state.roundsWon.B} ${options.aiName}`));
    topbar.appendChild(topbarLabels);
    topbar.appendChild(buildMuteToggle());
    screen.appendChild(topbar);

    // PT-9: while the round-reveal overlay is up, the board behind it shows
    // that round's actual final state (RoundResult.finalBoard) rather than
    // the live one, which by now already reflects next round's cleanup.
    const revealResult = phase.kind === "round-reveal" ? phase.result : undefined;
    const revealState: MatchState | undefined = revealResult && {
      ...state,
      players: { A: { ...state.players.A, board: revealResult.finalBoard.A }, B: { ...state.players.B, board: revealResult.finalBoard.B } },
    };
    const frozenFor = (playerId: PlayerId) => (revealResult && revealState ? { board: revealResult.finalBoard[playerId], pointsState: revealState } : undefined);

    const boardArea = el("div", "board-area" + (resolvePlan.grouped ? " board-area--group-resolve" : ""));
    boardArea.appendChild(buildSideLabel(AI, options.aiName, options.aiPortraitArtId, revealResult?.scores[AI]));
    boardArea.appendChild(buildBoardRow(AI, resolvePlan, frozenFor(AI)));
    boardArea.appendChild(buildLocationSlot());
    boardArea.appendChild(buildBoardRow(HUMAN, resolvePlan, frozenFor(HUMAN)));
    boardArea.appendChild(buildSideLabel(HUMAN, "You", undefined, revealResult?.scores[HUMAN]));
    screen.appendChild(boardArea);

    const handArea = el("div", "hand-area");
    handArea.appendChild(el("p", "hand-label", `Your hand (${state.players[HUMAN].hand.length})`));
    const handRow = el("div", "hand-row");
    const stagedInstanceId = phase.kind === "staging" ? phase.play.instanceId : undefined;
    const handInteractive = phase.kind === "idle" && state.status === "in-progress" && currentPlayer(state) === HUMAN;
    // Tutorial mode restricts every player turn to the one scripted card
    // (design.md §13.1) — every other hand card is untappable, so the
    // beer-mat narration always lands on the exact score it names.
    const tutorialExpectedCardId = options.tutorial && handInteractive ? options.tutorial.turns[scriptIndex]?.cardId : undefined;
    for (const inst of state.players[HUMAN].hand) {
      const isStaged = inst.instanceId === stagedInstanceId;
      const tappable = options.tutorial ? handInteractive && inst.card.id === tutorialExpectedCardId : handInteractive;
      const drawAnimation = !handAnimSnapshot.has(inst.instanceId);
      handRow.appendChild(
        buildCardEl(inst.card, 0, {
          size: "mini",
          faceUp: true,
          instanceId: inst.instanceId,
          selected: isStaged,
          disabled: !tappable && !isStaged,
          onPrimary: tappable ? () => handleHandTap(inst.instanceId, inst.card) : undefined,
          onZoom: () => openZoom(inst.card, 0),
          drawAnimation,
          resolveDelayMs: drawAnimation ? resolvePlan.delayMs(inst.instanceId) : undefined,
        }),
      );
    }
    handArea.appendChild(handRow);
    handArea.appendChild(buildActionBar());
    screen.appendChild(handArea);

    root.appendChild(screen);

    if (phase.kind === "coin-toss") root.appendChild(buildCoinTossOverlay());
    if (phase.kind === "instant-announce") root.appendChild(buildInstantAnnounceOverlay(phase.card));
    if (phase.kind === "round-reveal") root.appendChild(buildRoundRevealOverlay(phase.result));
    if (phase.kind === "match-over") root.appendChild(buildMatchOverOverlay());
    if (zoomed) root.appendChild(buildZoomOverlay());
    if (mat) root.appendChild(buildBeerMat(mat, dismissMat));
  }

  options.onStateChange?.(state, aiSeed);
  render();
  if (phase.kind !== "coin-toss") scheduleNext(); // PT-11: wait for the coin-toss overlay to be dismissed first

  return () => {
    torn = true;
    clearTimer();
    root.replaceChildren();
  };
}
