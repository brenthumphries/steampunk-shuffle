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

const HUMAN: PlayerId = "A";
const AI: PlayerId = "B";
const AI_DELAY_MS = 900;
const PASS_DELAY_MS = 900;

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
  let state: MatchState = options.initialState?.state ?? createMatch(options.humanDeck, options.aiDeck, { seed: Date.now() });
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
  }

  function buildCardEl(card: Card, faceIndex: 0 | 1, opts: CardBuildOpts): HTMLElement {
    const face = activeFaceOf(card, faceIndex);
    const wrap = el("div", `card card--${opts.size}`);
    wrap.dataset.family = face.family;

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

  function handleHandTap(instanceId: string, card: Card): void {
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
    state = playTurn(state, HUMAN, instanceId, chooser ? { chooseTargets: chooser } : undefined);
    afterCommit(prevRoundCount);
  }

  function afterCommit(prevRoundCount: number): void {
    options.onStateChange?.(state, aiSeed);
    if (state.roundHistory.length > prevRoundCount) {
      phase = { kind: "round-reveal", result: state.roundHistory[state.roundHistory.length - 1]! };
      render();
      return;
    }
    if (state.status === "complete") {
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
    const acting = currentPlayer(state);
    if (acting === AI) {
      phase = { kind: "ai-turn" };
      render();
      timer = setTimeout(() => {
        timer = undefined;
        const prevRoundCount = state.roundHistory.length;
        const difficulty = typeof options.difficulty === "function" ? options.difficulty(state) : options.difficulty;
        const result = playAITurn(state, AI, options.aiDeck, difficulty, aiSeed);
        state = result.state;
        aiSeed = result.nextSeed;
        afterCommit(prevRoundCount);
      }, AI_DELAY_MS);
    } else if (state.players[HUMAN].hand.length === 0) {
      // "If your hand is empty you pass. There is no voluntary pass." (design.md §6.2.2)
      phase = { kind: "human-pass" };
      render();
      timer = setTimeout(() => {
        timer = undefined;
        const prevRoundCount = state.roundHistory.length;
        state = playTurn(state, HUMAN);
        afterCommit(prevRoundCount);
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
    if (board.length === 0) {
      row.appendChild(el("p", "board-empty", "—"));
    }
    for (const bc of board) {
      const isCandidate = candidateIds.has(bc.instanceId);
      row.appendChild(
        buildCardEl(bc.card, bc.faceIndex, {
          size: "mini",
          faceUp: bc.faceUp,
          pointsOverride: bc.faceUp ? effectivePoints(state, playerId, bc) : undefined,
          highlight: isCandidate,
          selected: isCandidate && (step?.selected.includes(bc.instanceId) ?? false),
          onPrimary: isCandidate ? () => handleTargetTap(bc.instanceId) : undefined,
          onZoom: bc.faceUp ? () => openZoom(bc.card, bc.faceIndex) : undefined,
        }),
      );
    }
    return row;
  }

  function buildLocationSlot(): HTMLElement {
    const wrap = el("div", "location-slot");
    if (state.location) {
      const loc = state.location;
      wrap.appendChild(buildCardEl(loc.card, loc.faceIndex, { size: "mini", faceUp: true, onZoom: () => openZoom(loc.card, loc.faceIndex) }));
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
      bar.appendChild(el("p", "action-prompt", currentPlayer(state) === HUMAN ? "Your turn — tap a card to play it." : ""));
    }
    return bar;
  }

  function buildRoundRevealOverlay(result: RoundResult): HTMLElement {
    const overlay = el("div", "overlay overlay--round-reveal");
    const box = el("div", "overlay-box");
    const title = result.winner === "tie" ? "Round tied" : result.winner === HUMAN ? "You took the round" : `${options.aiName} took the round`;
    box.appendChild(el("h2", "overlay-title", `Round ${result.round}: ${title}`));
    box.appendChild(el("p", "overlay-score", `You ${result.scores[HUMAN]} — ${result.scores[AI]} ${options.aiName}`));
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
    topbar.appendChild(el("span", "match-round-label", `Round ${Math.min(state.round, 3)} of 3`));
    topbar.appendChild(el("span", "match-rounds-won", `You ${state.roundsWon.A} – ${state.roundsWon.B} ${options.aiName}`));
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
    for (const inst of state.players[HUMAN].hand) {
      const isStaged = inst.instanceId === stagedInstanceId;
      handRow.appendChild(
        buildCardEl(inst.card, 0, {
          size: "mini",
          faceUp: true,
          selected: isStaged,
          disabled: !handInteractive && !isStaged,
          onPrimary: handInteractive ? () => handleHandTap(inst.instanceId, inst.card) : undefined,
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
