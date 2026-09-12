// The dedication screen (plan step 3.5, design.md §14.1): shown once, on a
// truly fresh install, before the tutorial even starts. Two taps: the card
// face itself, then Sir Charles's greeting. Reuses the existing legendary
// card frame (data-rarity="legendary" — gold-leaf, foil shimmer, all from
// src/style.css's 3.1/3.3 work) and the "unwrap" reveal treatment
// (.reveal-card) rather than inventing new chrome for a screen that's only
// ever shown once. The wording here is design.md §14.1's, resolved with
// Brent as final — it does not read from src/player/playerState.ts's
// editable name, which is a separate, later-editable setting (§14.2).

import { playSound } from "../audio/soundEngine.ts";

export interface DedicationScreenOptions {
  onContinue: () => void;
}

type Step = "card" | "greeting";

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function artUrl(assetId: string): string {
  return `${import.meta.env.BASE_URL}art/${assetId}.webp`;
}

/** Mounts the dedication screen into `root` and returns a teardown function. */
export function mountDedicationScreen(root: HTMLElement, options: DedicationScreenOptions): () => void {
  let step: Step = "card";
  let torn = false;

  function render(): void {
    if (torn) return;
    root.replaceChildren();

    const overlay = el("div", "overlay overlay--reveal");
    const box = el("div", "overlay-box reveal-box dedication-box");

    if (step === "card") {
      const card = el("div", "card card--zoom reveal-card dedication-card");
      card.dataset.family = "neutral";
      card.dataset.rarity = "legendary";
      card.style.setProperty("--illustration", `url(${artUrl("the-landlady")})`);
      card.appendChild(el("p", "dedication-line", "The Wheatstone Bridge"));
      const licensedTo = el("p", "dedication-line");
      licensedTo.append("Licensed to ", el("strong", undefined, "Sara"));
      card.appendChild(licensedTo);
      card.appendChild(el("p", "dedication-line", "in every century, the best is yet to come"));
      card.appendChild(el("p", "dedication-sign", "Happy birthday. — B."));
      box.appendChild(card);

      const btn = el("button", "action-button", "Continue");
      btn.type = "button";
      btn.addEventListener("click", () => {
        step = "greeting";
        render();
      });
      box.appendChild(btn);
    } else {
      // PT-28: the second beat was a text box on black — the room and the
      // person saying it are both already-ingested assets, just never used
      // here.
      overlay.classList.add("overlay--dedication-greeting");
      overlay.style.setProperty("--scene-bg", `url(${artUrl("background-the-taproom")})`);

      const portrait = document.createElement("img");
      portrait.src = artUrl("portrait-sir-charles-wheatstone");
      portrait.alt = "";
      portrait.className = "dedication-portrait";
      box.appendChild(portrait);

      box.appendChild(el("p", "overlay-score dedication-greeting", "“You're expected. Your chair's by the fire.”"));
      box.appendChild(el("p", "dedication-sign", "— Sir Charles"));

      const btn = el("button", "action-button", "Continue");
      btn.type = "button";
      btn.addEventListener("click", options.onContinue);
      box.appendChild(btn);
    }

    overlay.appendChild(box);
    root.appendChild(overlay);
  }

  render();
  playSound("brassHit");

  return () => {
    torn = true;
    root.replaceChildren();
  };
}
