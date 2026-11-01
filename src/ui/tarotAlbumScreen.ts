// The Tarot album (design.md §17.2): 22 slots in order. Unlocked and drawn shows
// the art; unlocked and not yet drawn shows a face-down back; locked shows a
// silhouette. Tapping a slot shows what Pixie said (once drawn).

import { hasDrawn, isUnlocked } from "../booth/booth.ts";
import { describeOmen } from "../booth/omens.ts";
import { TAROT, type TarotArcana } from "../booth/tarot.ts";
import { today } from "../events/eventClock.ts";
import { loadPubState } from "../pub/pubState.ts";
import { buildTarotFace, romanNumeral, type TarotFace } from "./tarotCard.ts";

export interface TarotAlbumOptions {
  onBack: () => void;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function mountTarotAlbumScreen(root: HTMLElement, options: TarotAlbumOptions): () => void {
  const pub = loadPubState();
  const date = today();
  let selected: TarotArcana | null = null;
  let torn = false;

  function faceOf(arcana: TarotArcana): TarotFace {
    if (!isUnlocked(arcana, pub.ledger.firstLaunch, date)) return "silhouette";
    return hasDrawn(pub, arcana.id) ? "front" : "back";
  }

  function buildDetail(arcana: TarotArcana): HTMLElement {
    const overlay = el("div", "overlay");
    const box = el("div", "overlay-box tarot-detail");
    const face = faceOf(arcana);
    if (face === "front") {
      box.appendChild(el("h2", "overlay-title", `${romanNumeral(arcana.number)} · ${arcana.name}`));
      box.appendChild(el("p", "booth-line", `"${arcana.line}"`));
      box.appendChild(el("p", "booth-omen", `Omen: ${describeOmen(arcana.omen)}`));
    } else if (face === "back") {
      box.appendChild(el("h2", "overlay-title", "Not drawn yet"));
      box.appendChild(el("p", "booth-note", "Pixie has this one in the deck. It turns up when it turns up."));
    } else {
      box.appendChild(el("h2", "overlay-title", "Not yet laid out"));
      box.appendChild(el("p", "booth-note", "Pixie hasn't dealt this one into the deck yet."));
    }
    const close = el("button", "action-button", "Close");
    close.type = "button";
    close.addEventListener("click", () => {
      selected = null;
      render();
    });
    box.appendChild(close);
    overlay.appendChild(box);
    return overlay;
  }

  function render(): void {
    if (torn) return;
    root.replaceChildren();
    const screen = el("div", "booth-screen tarot-album");
    const header = el("div", "pub-hub-header");
    const back = el("button", "taproom-button taproom-button--secondary", "Back");
    back.type = "button";
    back.addEventListener("click", options.onBack);
    header.appendChild(back);
    header.appendChild(el("h1", "backroom-title", "Tarot album"));
    screen.appendChild(header);

    const drawn = TAROT.filter((a) => hasDrawn(pub, a.id)).length;
    screen.appendChild(el("p", "booth-note", `${drawn} of ${TAROT.length} drawn`));

    const grid = el("div", "tarot-grid");
    for (const arcana of TAROT) {
      const slot = el("button", "tarot-slot");
      slot.type = "button";
      slot.dataset.slot = String(arcana.number);
      const face = faceOf(arcana);
      slot.dataset.state = face === "front" ? "drawn" : face === "back" ? "undrawn" : "locked";
      slot.setAttribute("aria-label", face === "front" ? arcana.name : face === "back" ? "Face-down card" : "Locked card");
      slot.appendChild(buildTarotFace(arcana, face));
      slot.addEventListener("click", () => {
        selected = arcana;
        render();
      });
      grid.appendChild(slot);
    }
    screen.appendChild(grid);
    root.appendChild(screen);
    if (selected) root.appendChild(buildDetail(selected));
  }

  render();

  return () => {
    torn = true;
    root.replaceChildren();
  };
}
