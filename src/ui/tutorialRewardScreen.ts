// The tutorial's "After" beat (plan step 2.7, design.md §13.2): the reward
// reveal (the starter deck, formally, plus Checks) and Sir Charles's closing
// beer mat, shown once between the tutorial's match-over overlay and the
// pub hub opening for the first time.

import { TUTORIAL_AFTER_MAT, TUTORIAL_REWARD_CHECKS } from "../tutorial/tutorialScript.ts";
import { buildBeerMat } from "./beerMat.ts";

export interface TutorialRewardScreenOptions {
  deckName: string;
  onContinue: () => void;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Mounts the tutorial's reward screen into `root` and returns a teardown function. */
export function mountTutorialRewardScreen(root: HTMLElement, options: TutorialRewardScreenOptions): () => void {
  let matDismissed = false;
  let torn = false;

  function render(): void {
    if (torn) return;
    root.replaceChildren();

    const overlay = el("div", "overlay overlay--reveal");
    const box = el("div", "overlay-box reveal-box");
    box.appendChild(el("h2", "overlay-title", "Table's yours"));
    box.appendChild(el("p", "overlay-score", `You've been given the ${options.deckName} deck and ${TUTORIAL_REWARD_CHECKS} Checks.`));
    const btn = el("button", "action-button", "Continue");
    btn.type = "button";
    btn.addEventListener("click", options.onContinue);
    box.appendChild(btn);
    overlay.appendChild(box);
    root.appendChild(overlay);

    if (!matDismissed) {
      root.appendChild(
        buildBeerMat(TUTORIAL_AFTER_MAT, () => {
          matDismissed = true;
          render();
        }),
      );
    }
  }

  render();

  return () => {
    torn = true;
    root.replaceChildren();
  };
}
