// Pure staging logic for a human player's turn (design.md §6.4: a card can be
// taken back any time before it commits). Keeps target-selection state out of
// the DOM layer (src/ui/matchScreen.ts) so it's unit-testable without jsdom.

import type { Card, Target } from "../cards/cardTypes.ts";
import { previewOnPlayTargets, type MatchState, type PlayerId, type TargetPreviewStep } from "../engine/matchEngine.ts";

export interface StagedStep {
  step: TargetPreviewStep;
  /** False when there's nothing to choose — one legal target, or the card text already says which one ("the highest-point card"). */
  needsChoice: boolean;
  /** How many targets this step needs, capped to what's actually on the board. */
  need: number;
  /** InstanceIds picked so far. Pre-filled (and irrelevant to touch) when `needsChoice` is false. */
  selected: string[];
}

export interface StagedPlay {
  instanceId: string;
  card: Card;
  steps: StagedStep[];
}

/** "highest/lowest points" filters aren't a real choice — the card text already names the target (design.md §5.13's AI rule doubles as the human's here). */
function isDeterministic(target: Target): boolean {
  return Boolean(target.filter?.highestPoints || target.filter?.lowestPoints);
}

export function stagePlay(state: MatchState, playerId: PlayerId, instanceId: string, card: Card): StagedPlay {
  const rawSteps = previewOnPlayTargets(state, playerId, card).filter((s) => s.candidates.length > 0);
  const steps: StagedStep[] = rawSteps.map((step) => {
    const count = step.effect.target.count ?? 1;
    const need = Math.min(count, step.candidates.length);
    const needsChoice = !isDeterministic(step.effect.target) && step.candidates.length > count;
    return {
      step,
      needsChoice,
      need,
      selected: needsChoice ? [] : step.candidates.slice(0, need).map((c) => c.bc.instanceId),
    };
  });
  return { instanceId, card, steps };
}

/** The first step still waiting on the player, or undefined once every step is resolved. */
export function pendingStep(play: StagedPlay): StagedStep | undefined {
  return play.steps.find((s) => s.needsChoice && s.selected.length < s.need);
}

export function isReadyToConfirm(play: StagedPlay): boolean {
  return pendingStep(play) === undefined;
}

/**
 * The step the player is currently working on: the first incomplete
 * choice-step, or — once every choice-step is full — the last one, so a
 * completed pick can still be amended before confirming. No v1 card has
 * more than one step needing a real choice, so that "amend" case only ever
 * revisits the step the player just finished. Also what the UI highlights
 * candidate board cards for.
 */
export function currentStep(play: StagedPlay): StagedStep | undefined {
  const incomplete = pendingStep(play);
  if (incomplete) return incomplete;
  const choiceSteps = play.steps.filter((s) => s.needsChoice);
  return choiceSteps[choiceSteps.length - 1];
}

/**
 * Toggles one board card in or out of the active step's selection (see
 * `currentStep`). No-ops once that step is full and the tapped card isn't
 * already selected — deselect one first. No-ops entirely if the card has no
 * step that ever needs a player choice.
 */
export function toggleTarget(play: StagedPlay, boardInstanceId: string): StagedPlay {
  const step = currentStep(play);
  if (!step) return play;
  const already = step.selected.includes(boardInstanceId);
  let selected: string[];
  if (already) {
    selected = step.selected.filter((id) => id !== boardInstanceId);
  } else if (step.selected.length < step.need) {
    selected = [...step.selected, boardInstanceId];
  } else {
    return play;
  }
  return { ...play, steps: play.steps.map((s) => (s === step ? { ...s, selected } : s)) };
}

/** In previewOnPlayTargets/resolveEffect order — feed straight to buildTargetChooser. */
export function toChooserSelections(play: StagedPlay): (readonly string[] | undefined)[] {
  return play.steps.map((s) => (s.selected.length > 0 ? s.selected : undefined));
}
