// A shared full-card zoom overlay (PT-16/PT-17): the deck builder's card
// tiles and the Pawnbroker's tiles used to show only a name/rarity summary
// line, with no ability text and no way to see the rest of the card before
// spending a copy limit or Checks on it — the match screen's own card zoom
// (src/ui/matchScreen.ts) already solved this, just not shared. Extracted
// here rather than duplicated a third and fourth time (CLAUDE.md's 3.1
// gotcha flagged this exact duplication). Deliberately not rewiring
// matchScreen.ts's own zoom onto this — that file's `buildCardEl` shares a
// lot of code between its mini/zoom sizes already and touching it isn't
// this fix's job.

import type { Card, CardFace } from "../cards/cardTypes.ts";
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

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1);
}

/** The full-size `.card--zoom` detail view for one face of `card` — points, name, type/family/rarity, keyword chips, ability text, flavor. */
export function buildCardZoomEl(card: Card, faceIndex: 0 | 1 = 0): HTMLElement {
  const face = (card.faces as readonly CardFace[])[faceIndex] ?? card.faces[0];
  const wrap = el("div", "card card--zoom");
  wrap.dataset.family = face.family;
  wrap.dataset.rarity = card.rarity;
  wrap.style.setProperty("--illustration", `url(${artUrl(face.artId)})`);
  wrap.appendChild(el("span", "card-points", String(face.points)));
  wrap.appendChild(el("span", "card-name", face.name));
  wrap.appendChild(el("p", "card-meta", `${capitalize(face.type)} · ${capitalize(face.family)} · ${capitalize(card.rarity)}`));
  const chips = keywordChips(face);
  if (chips.length > 0) {
    const row = el("div", "card-chip-row");
    for (const chip of chips) row.appendChild(el("span", "card-chip", chip));
    wrap.appendChild(row);
  }
  for (const line of abilityLines(face)) wrap.appendChild(el("p", "card-ability", line));
  if (face.flavor) wrap.appendChild(el("p", "card-flavor", `"${face.flavor}"`));
  return wrap;
}

/** A full-screen "tap away to close" overlay wrapping `buildCardZoomEl`. */
export function buildCardZoomOverlay(card: Card, faceIndex: 0 | 1, onClose: () => void): HTMLElement {
  const overlay = el("div", "overlay overlay--zoom");
  overlay.addEventListener("click", onClose);
  const cardEl = buildCardZoomEl(card, faceIndex);
  cardEl.addEventListener("click", (event) => event.stopPropagation());
  overlay.appendChild(cardEl);
  return overlay;
}
