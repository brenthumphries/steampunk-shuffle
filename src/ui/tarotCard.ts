// A tarot card as shown in the Booth and the album. Missing art falls back to
// a parchment card carrying the arcana's number, so a month whose images
// haven't landed still plays.

import type { TarotArcana } from "../booth/tarot.ts";

const ROMAN: readonly [number, string][] = [
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

/** 0 -> "0", 1 -> "I", 21 -> "XXI". */
export function romanNumeral(n: number): string {
  if (n === 0) return "0";
  let rest = n;
  let out = "";
  for (const [value, glyph] of ROMAN) {
    while (rest >= value) {
      out += glyph;
      rest -= value;
    }
  }
  return out;
}

function artUrl(assetId: string): string {
  return `${import.meta.env.BASE_URL}art/${assetId}.webp`;
}

export type TarotFace = "front" | "back" | "silhouette";

/** The card face alone (no flip): the art over parchment, a plain back, or a silhouette. */
export function buildTarotFace(arcana: TarotArcana, face: TarotFace): HTMLElement {
  const node = document.createElement("div");
  node.className = `tarot-face tarot-face--${face}`;
  node.dataset.arcana = arcana.id;
  if (face === "back") {
    node.setAttribute("aria-label", "A face-down tarot card");
    return node;
  }
  if (face === "silhouette") {
    node.setAttribute("aria-label", "A tarot card not yet laid out");
    return node;
  }
  node.setAttribute("aria-label", arcana.name);
  const numeral = document.createElement("span");
  numeral.className = "tarot-numeral";
  numeral.textContent = romanNumeral(arcana.number);
  node.appendChild(numeral);
  const img = document.createElement("img");
  img.className = "tarot-art";
  img.alt = "";
  img.addEventListener("error", () => img.remove());
  img.src = artUrl(arcana.artId);
  node.appendChild(img);
  return node;
}
