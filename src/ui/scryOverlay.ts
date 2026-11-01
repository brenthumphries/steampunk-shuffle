// The Scry overlay (design.md §5.16): the looked-at cards fanned in two rows,
// "Top of your deck" and "Bottom of your deck". Tap a card to send it to the
// other row; the arrows reorder within a row (buttons rather than drag, which
// is fiddly at 402x874). Stateless: the caller owns the ScryDraft and
// re-renders on every change.

import type { Card, CardFace } from "../cards/cardTypes.ts";
import type { CardInstance } from "../engine/matchEngine.ts";
import type { ScryDraft } from "../match/scryDraft.ts";
import { abilityLines } from "./cardText.ts";

export interface ScryOverlayHandlers {
  onToggle: (instanceId: string) => void;
  onMove: (instanceId: string, direction: -1 | 1) => void;
  onDone: () => void;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function buildTile(card: Card, row: readonly string[], instanceId: string, handlers: ScryOverlayHandlers): HTMLElement {
  const face: CardFace = card.faces[0];
  const index = row.indexOf(instanceId);
  const tile = el("div", "scry-tile");
  tile.dataset.family = face.family;
  tile.dataset.rarity = card.rarity;
  tile.dataset.instanceId = instanceId;

  const body = el("button", "scry-card");
  body.type = "button";
  body.setAttribute("aria-label", `${face.name}, ${face.points} points. Tap to send to the other row.`);
  body.appendChild(el("span", "scry-card-points", String(face.points)));
  body.appendChild(el("span", "scry-card-name", face.name));
  body.appendChild(el("span", "scry-card-type", face.type));
  for (const line of abilityLines(face)) body.appendChild(el("span", "scry-card-text", line));
  body.addEventListener("click", () => handlers.onToggle(instanceId));
  tile.appendChild(body);

  const arrows = el("div", "scry-arrows");
  const earlier = el("button", "scry-arrow", "◀");
  earlier.type = "button";
  earlier.setAttribute("aria-label", `Move ${face.name} earlier`);
  earlier.disabled = index <= 0;
  earlier.addEventListener("click", () => handlers.onMove(instanceId, -1));
  const later = el("button", "scry-arrow", "▶");
  later.type = "button";
  later.setAttribute("aria-label", `Move ${face.name} later`);
  later.disabled = index === row.length - 1;
  later.addEventListener("click", () => handlers.onMove(instanceId, 1));
  arrows.append(earlier, later);
  tile.appendChild(arrows);
  return tile;
}

function buildRow(title: string, hint: string, ids: readonly string[], byId: ReadonlyMap<string, CardInstance>, modifier: string, handlers: ScryOverlayHandlers): HTMLElement {
  const section = el("section", `scry-row scry-row--${modifier}`);
  section.appendChild(el("h3", "scry-row-title", title));
  section.appendChild(el("p", "scry-row-hint", hint));
  const tiles = el("div", "scry-tiles");
  if (ids.length === 0) tiles.appendChild(el("p", "scry-empty", "None"));
  for (const id of ids) {
    const inst = byId.get(id);
    if (inst) tiles.appendChild(buildTile(inst.card, ids, id, handlers));
  }
  section.appendChild(tiles);
  return section;
}

export function buildScryOverlay(cards: readonly CardInstance[], draft: ScryDraft, handlers: ScryOverlayHandlers): HTMLElement {
  const byId = new Map(cards.map((c) => [c.instanceId, c] as const));
  const overlay = el("div", "overlay overlay--scry");
  const box = el("div", "overlay-box scry-box");
  box.appendChild(el("h2", "overlay-title", `Scry ${cards.length}`));
  box.appendChild(el("p", "overlay-score", "Tap a card to send it to the other row. The first card on top is drawn next."));
  box.appendChild(buildRow("Top of your deck", "Drawn first, left to right", draft.top, byId, "top", handlers));
  box.appendChild(buildRow("Bottom of your deck", "Last card is the very bottom", draft.bottom, byId, "bottom", handlers));
  const done = el("button", "action-button scry-done", "Done");
  done.type = "button";
  done.addEventListener("click", handlers.onDone);
  box.appendChild(done);
  overlay.appendChild(box);
  return overlay;
}
