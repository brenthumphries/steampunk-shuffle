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
  type MatchResult,
  type MatchState,
  type PlayerId,
  type RoundResult,
  type TargetChooser,
} from "../engine/matchEngine.ts";
import { playAITurn, type Difficulty } from "../ai/aiOpponent.ts";
import { abilityLines, effectPromptLabel, keywordChips } from "./cardText.ts";
import { currentStep, isReadyToConfirm, stagePlay, toChooserSelections, toggleTarget, type StagedPlay } from "../match/humanTurn.ts";
import { buildTargetChooser } from "../match/targetChooser.ts";
import { buildBeerMat } from "./beerMat.ts";
import { buildMuteToggle } from "./muteToggle.ts";
import { playSound } from "../audio/soundEngine.ts";
import type { HintId } from "../tutorial/tutorialState.ts";

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
  /** Plays the tutorial's forced script (design.md §13.2) instead of a normal random-shuffled/AI-driven match. */
  tutorial?: TutorialMatchOptions;
  /** design.md §13.3's hint chips — ignored during a tutorial match (see `tutorial`). */
  hints?: HintOptions;
}

type Phase =
  | { kind: "idle" }
  | { kind: "staging"; play: StagedPlay }
  | { kind: "ai-turn" }
  | { kind: "human-pass" }
  | { kind: "round-reveal"; result: RoundResult }
  | { kind: "match-over" };

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
  let phase: Phase = state.status === "complete" ? { kind: "match-over" } : { kind: "idle" };
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
  function snapshotBoard(s: MatchState): Record<PlayerId, Map<string, boolean>> {
    return {
      A: new Map(s.players.A.board.map((bc) => [bc.instanceId, bc.faceUp])),
      B: new Map(s.players.B.board.map((bc) => [bc.instanceId, bc.faceUp])),
    };
  }
  let boardAnimSnapshot: Record<PlayerId, Map<string, boolean>> = snapshotBoard(state);
  let locationAnimSnapshot: string | undefined = state.location?.instanceId;

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
      const prevBoard = boardAnimSnapshot[side];
      for (const bc of state.players[side].board) {
        const prevFaceUp = prevBoard.get(bc.instanceId);
        if (prevFaceUp === undefined) anyPlay = true;
        else if (prevFaceUp !== bc.faceUp) anyFlip = true;
      }
    }
    if (anyPlay) playSound("steam");
    if (anyFlip) playSound("flip");
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
    /** This card just entered play (board or Location) since the last render — plays the "card play" animation. */
    enterAnimation?: boolean;
    /** This card's faceUp flipped since the last render — plays the "flip" animation. */
    flipAnimation?: boolean;
  }

  function buildCardEl(card: Card, faceIndex: 0 | 1, opts: CardBuildOpts): HTMLElement {
    const face = activeFaceOf(card, faceIndex);
    const wrap = el("div", `card card--${opts.size}`);
    wrap.dataset.family = face.family;
    wrap.dataset.rarity = card.rarity;
    if (opts.enterAnimation) wrap.classList.add("card--play-enter");
    if (opts.flipAnimation) wrap.classList.add("card--flip");

    if (!opts.faceUp) {
      wrap.classList.add("card--facedown");
      const img = document.createElement("img");
      img.src = artUrl("card-back");
      img.alt = "";
      img.className = "card-back-img";
      wrap.appendChild(img);
      return wrap;
    }

    if (opts.highlight) wrap.classList.add("card--highlight");
    if (opts.selected) wrap.classList.add("card--selected");
    if (opts.disabled) wrap.classList.add("card--disabled");
    wrap.style.setProperty("--illustration", `url(${artUrl(face.artId)})`);

    wrap.appendChild(el("span", "card-points", String(opts.pointsOverride ?? face.points)));
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

  function captureHintSnapshot(): { prevLocationId: string | undefined; prevHandA: Set<string>; prevHandB: Set<string> } {
    return {
      prevLocationId: state.location?.instanceId,
      prevHandA: new Set(state.players.A.hand.map((c) => c.instanceId)),
      prevHandB: new Set(state.players.B.hand.map((c) => c.instanceId)),
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
    hintSnapshot?: { prevLocationId: string | undefined; prevHandA: ReadonlySet<string>; prevHandB: ReadonlySet<string> },
  ): void {
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
    // now-updated baseline and replays nothing.
    playCommitSounds();
    queueMicrotask(() => {
      boardAnimSnapshot = snapshotBoard(state);
      locationAnimSnapshot = state.location?.instanceId;
    });
    options.onStateChange?.(state, aiSeed);
    const roundJustEnded = state.roundHistory.length > prevRoundCount;

    if (options.hints && hintSnapshot) {
      if (state.location && state.location.instanceId !== hintSnapshot.prevLocationId) fireHint("location");
      const playedA = findPlayedCard(hintSnapshot.prevHandA, "A");
      const playedB = findPlayedCard(hintSnapshot.prevHandB, "B");
      if (playedA?.faces[0].type === "headline" || playedB?.faces[0].type === "headline") fireHint("headline");
      if (roundJustEnded) {
        const returnCardLeftTable = [...state.players.A.hand, ...state.players.B.hand].some((c) => c.card.faces[0].keywords?.return);
        if (returnCardLeftTable) fireHint("return");
      }
    }

    if (roundJustEnded) {
      playSound("brassHit");
      phase = { kind: "round-reveal", result: state.roundHistory[state.roundHistory.length - 1]! };
      render();
      return;
    }
    if (state.status === "complete") {
      playSound("brassHit");
      phase = { kind: "match-over" };
      render();
      return;
    }
    phase = { kind: "idle" };
    render();
    scheduleNext();
  }

  function continueAfterRoundReveal(): void {
    // The round that just ended may also have completed the match (e.g. the
    // second round win) — afterCommit() only checked for round-vs-match
    // completion once, before this overlay appeared, so that has to be
    // re-checked here rather than always falling through to scheduleNext().
    if (state.status === "complete") {
      playSound("brassHit");
      phase = { kind: "match-over" };
      render();
      return;
    }
    phase = { kind: "idle" };
    render();
    scheduleNext();
  }

  function scheduleNext(): void {
    if (torn || state.status !== "in-progress") return;
    if (options.tutorial && introQueue.length > 0) return; // wait for "before the deal" to be dismissed
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
          state = playTurn(state, AI, inst.instanceId);
          scriptIndex += 1;
          mat = turn.mat;
          afterCommit(prevRoundCount);
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

  function buildSideLabel(playerId: PlayerId, name: string, portraitArtId: string | undefined): HTMLElement {
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
    const scoreText = playerId === HUMAN ? `Your score: ${boardScore(state, playerId)}` : `Score: ${boardScore(state, playerId)}`;
    text.appendChild(el("span", "side-score", scoreText));
    if (playerId !== HUMAN) {
      text.appendChild(el("span", "side-hand-count", `Hand: ${state.players[playerId].hand.length}`));
    }
    wrap.appendChild(text);
    return wrap;
  }

  function buildBoardRow(playerId: PlayerId): HTMLElement {
    const row = el("div", "board-row");
    const step = phase.kind === "staging" ? currentStep(phase.play) : undefined;
    const candidateIds = new Set(step?.step.candidates.filter((oc) => oc.owner === playerId).map((oc) => oc.bc.instanceId) ?? []);
    const board = state.players[playerId].board;
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
      const prevFaceUp = prevBoard.get(bc.instanceId);
      row.appendChild(
        buildCardEl(bc.card, bc.faceIndex, {
          size: "mini",
          faceUp: bc.faceUp,
          pointsOverride: bc.faceUp ? effectivePoints(state, playerId, bc) : undefined,
          highlight: isCandidate,
          selected: isCandidate && (step?.selected.includes(bc.instanceId) ?? false),
          onPrimary: isCandidate ? () => handleTargetTap(bc.instanceId) : isElusiveFlipAttempt ? () => fireHint("elusive") : undefined,
          onZoom: bc.faceUp ? () => openZoom(bc.card, bc.faceIndex) : undefined,
          enterAnimation: prevFaceUp === undefined,
          flipAnimation: prevFaceUp !== undefined && prevFaceUp !== bc.faceUp,
        }),
      );
    }
    return row;
  }

  function buildLocationSlot(): HTMLElement {
    const wrap = el("div", "location-slot");
    if (state.location) {
      const loc = state.location;
      wrap.appendChild(
        buildCardEl(loc.card, loc.faceIndex, {
          size: "mini",
          faceUp: true,
          onZoom: () => openZoom(loc.card, loc.faceIndex),
          enterAnimation: locationAnimSnapshot !== loc.instanceId,
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

  function buildRoundRevealOverlay(result: RoundResult): HTMLElement {
    const overlay = el("div", "overlay overlay--round-reveal");
    const box = el("div", "overlay-box");
    const title = result.winner === "tie" ? "Round tied" : result.winner === HUMAN ? "You took the round" : `${options.aiName} took the round`;
    box.appendChild(el("h2", "overlay-title", `Round ${result.round}: ${title}`));
    box.appendChild(el("p", "overlay-score", `You ${result.scores[HUMAN]} — ${result.scores[AI]} ${options.aiName}`));
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
    box.appendChild(el("p", "overlay-score", `Rounds: You ${state.roundsWon.A} — ${state.roundsWon.B} ${options.aiName}`));
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
    root.replaceChildren();
    const screen = el("div", "match-screen");
    screen.style.setProperty("--table-bg", `url(${artUrl("background-the-snug")})`);

    const topbar = el("div", "match-topbar");
    const topbarLabels = el("div", "match-topbar-labels");
    topbarLabels.appendChild(el("span", "match-round-label", `Round ${Math.min(state.round, 3)} of 3`));
    topbarLabels.appendChild(el("span", "match-rounds-won", `You ${state.roundsWon.A} – ${state.roundsWon.B} ${options.aiName}`));
    topbar.appendChild(topbarLabels);
    topbar.appendChild(buildMuteToggle());
    screen.appendChild(topbar);

    const boardArea = el("div", "board-area");
    boardArea.appendChild(buildSideLabel(AI, options.aiName, options.aiPortraitArtId));
    boardArea.appendChild(buildBoardRow(AI));
    boardArea.appendChild(buildLocationSlot());
    boardArea.appendChild(buildBoardRow(HUMAN));
    boardArea.appendChild(buildSideLabel(HUMAN, "You", undefined));
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
      handRow.appendChild(
        buildCardEl(inst.card, 0, {
          size: "mini",
          faceUp: true,
          selected: isStaged,
          disabled: !tappable && !isStaged,
          onPrimary: tappable ? () => handleHandTap(inst.instanceId, inst.card) : undefined,
          onZoom: () => openZoom(inst.card, 0),
        }),
      );
    }
    handArea.appendChild(handRow);
    handArea.appendChild(buildActionBar());
    screen.appendChild(handArea);

    root.appendChild(screen);

    if (phase.kind === "round-reveal") root.appendChild(buildRoundRevealOverlay(phase.result));
    if (phase.kind === "match-over") root.appendChild(buildMatchOverOverlay());
    if (zoomed) root.appendChild(buildZoomOverlay());
    if (mat) root.appendChild(buildBeerMat(mat, dismissMat));
  }

  options.onStateChange?.(state, aiSeed);
  render();
  scheduleNext();

  return () => {
    torn = true;
    clearTimer();
    root.replaceChildren();
  };
}
