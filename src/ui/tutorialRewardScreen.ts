// The tutorial's "After" beat (plan step 2.7, design.md §13.2): the reward
// reveal (the starter deck, formally, plus Checks) and Sir Charles's closing
// beer mat, shown once between the tutorial's match-over overlay and the
// pub hub opening for the first time.

import { TUTORIAL_AFTER_MAT, TUTORIAL_REWARD_CHECKS } from "../tutorial/tutorialScript.ts";
import { buildBeerMat } from "./beerMat.ts";
import { playSound } from "../audio/soundEngine.ts";

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

function artUrl(assetId: string): string {
  return `${import.meta.env.BASE_URL}art/${assetId}.webp`;
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

    // PT-20: the same unwrap treatment every other card/Checks reveal
    // gets (buildRevealOverlay in pubHubScreen.ts/acquisitionScreen.ts),
    // instead of a bare text box on the one screen every player sees.
    const deckCard = el("div", "card card--zoom reveal-card reward-deck-card");
    deckCard.dataset.family = "neutral";
    deckCard.style.setProperty("--illustration", `url(${artUrl("card-back")})`);
    deckCard.appendChild(el("span", "card-name", options.deckName));
    box.appendChild(deckCard);

    const disc = el("div", "checks-disc");
    disc.appendChild(el("span", "checks-disc-value", String(TUTORIAL_REWARD_CHECKS)));
    disc.appendChild(el("span", "checks-disc-label", "Checks"));
    box.appendChild(disc);

    // PT-6: `options.deckName` already carries its own "The" ("The Village
    // Constable") — the old wording duplicated it ("...given the The
    // Village Constable deck...").
    box.appendChild(el("p", "overlay-score", `You've been given ${options.deckName}, and ${TUTORIAL_REWARD_CHECKS} Checks.`));
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
  playSound("brassHit");

  return () => {
    torn = true;
    root.replaceChildren();
  };
}
