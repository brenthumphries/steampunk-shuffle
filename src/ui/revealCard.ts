// The card "unwrap" overlay (design.md §11.2) as a reusable builder, for screens
// that grant a card outside the hub's own reveal queue (the Advent Cabinet).
// Same markup and classes as the hub's reveal, so the existing unwrap animation
// (and its Reduce Motion variant) applies unchanged.

import { ACQUIRABLE_CARDS_BY_ID } from "../pub/acquirableCards.ts";
import { abilityLines, keywordChips } from "./cardText.ts";

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function artUrl(assetId: string): string {
  return `${import.meta.env.BASE_URL}art/${assetId}.webp`;
}

/** `cardId` may be a `foil:<id>` collection entry; it shows the base card, labelled as a foil. */
export function buildRevealOverlay(title: string, cardId: string, onCollect: () => void): HTMLElement {
  const isFoil = cardId.startsWith("foil:");
  const card = ACQUIRABLE_CARDS_BY_ID.get(isFoil ? cardId.slice(5) : cardId);
  const face = card?.faces[0];
  const overlay = el("div", "overlay overlay--reveal");
  const box = el("div", "overlay-box reveal-box");
  box.appendChild(el("h2", "overlay-title", title));

  const cardEl = el("div", "card card--zoom reveal-card");
  if (face && card) {
    cardEl.dataset.family = face.family;
    cardEl.dataset.rarity = card.rarity;
    if (isFoil) cardEl.classList.add("reveal-card--foil");
    cardEl.style.setProperty("--illustration", `url(${artUrl(face.artId)})`);
    cardEl.appendChild(el("span", "card-points", String(face.points)));
    cardEl.appendChild(el("span", "card-name", isFoil ? `${face.name} (foil)` : face.name));
    const chips = keywordChips(face);
    if (chips.length > 0) {
      const row = el("div", "card-chip-row");
      for (const chip of chips) row.appendChild(el("span", "card-chip", chip));
      cardEl.appendChild(row);
    }
    for (const line of abilityLines(face)) cardEl.appendChild(el("p", "card-ability", line));
    if (face.flavor) cardEl.appendChild(el("p", "card-flavor", `"${face.flavor}"`));
  } else {
    cardEl.appendChild(el("span", "card-name", cardId));
  }
  box.appendChild(cardEl);
  box.appendChild(el("p", "overlay-score", "Added to your collection."));
  const btn = el("button", "action-button", "Collect");
  btn.type = "button";
  btn.addEventListener("click", onCollect);
  box.appendChild(btn);
  overlay.appendChild(box);
  return overlay;
}
