// Turns the human player's target picks (collected by the UI, in the order
// previewOnPlayTargets reported the steps) into a TargetChooser for
// playTurn (design.md §6.4: targets must be chosen before the turn
// commits, since playTurn resolves On Play synchronously).

import { defaultSelect, type MatchState, type TargetChooser } from "../engine/matchEngine.ts";

/**
 * `selections[i]` is the instanceIds the player explicitly picked for the
 * i-th targeted effect, in the same order previewOnPlayTargets returned its
 * steps (also the order resolveEffect calls chooseTargets in — both walk
 * the card's onPlay abilities/effects front to back). Not every step needs
 * an entry: a step the UI didn't prompt the player on (only one legal
 * target, or a "highest/lowest points" effect where the card text already
 * says which one — see previewOnPlayTargets callers) falls back to the
 * engine's own defaultSelect, so it resolves exactly as it would with no
 * chooser at all.
 */
export function buildTargetChooser(state: MatchState, selections: readonly (readonly string[] | undefined)[]): TargetChooser {
  let step = 0;
  return (candidates, _effect, target) => {
    const picked = selections[step];
    step += 1;
    if (picked && picked.length > 0) {
      const chosenSet = new Set(picked);
      const matched = candidates.filter((oc) => chosenSet.has(oc.bc.instanceId));
      if (matched.length > 0) return matched;
    }
    return defaultSelect(candidates, target.filter, state);
  };
}
