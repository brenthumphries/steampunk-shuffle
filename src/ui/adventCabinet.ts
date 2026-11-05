// Shared pieces of the Advent Cabinet UI (design.md §17.3): the brass cabinet
// graphic with its SVG fallback, and the plain-words description of a door's
// reward. DOM glue only; the rules are in src/events/advent.ts.

import { ACQUIRABLE_CARDS_BY_ID } from "../pub/acquirableCards.ts";
import { TOKEN_LABEL, type AdventReward } from "../events/advent.ts";

export const ADVENT_CABINET_ART_ID = "advent-cabinet";

const SVG_NS = "http://www.w3.org/2000/svg";
const FALLBACK_COLUMNS = 6;
const FALLBACK_ROWS = 4;

function artUrl(assetId: string): string {
  return `${import.meta.env.BASE_URL}art/${assetId}.webp`;
}

/** A brass grid of little doors, drawn in SVG: what the cabinet looks like before (or without) its art. */
function buildFallbackSvg(): SVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 120 80");
  svg.setAttribute("class", "advent-cabinet-svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
  const frame = document.createElementNS(SVG_NS, "rect");
  frame.setAttribute("x", "1");
  frame.setAttribute("y", "1");
  frame.setAttribute("width", "118");
  frame.setAttribute("height", "78");
  frame.setAttribute("rx", "4");
  frame.setAttribute("fill", "#3a2814");
  frame.setAttribute("stroke", "#c8862c");
  frame.setAttribute("stroke-width", "2");
  svg.appendChild(frame);
  for (let row = 0; row < FALLBACK_ROWS; row++) {
    for (let col = 0; col < FALLBACK_COLUMNS; col++) {
      const door = document.createElementNS(SVG_NS, "rect");
      door.setAttribute("x", String(6 + col * 18.5));
      door.setAttribute("y", String(6 + row * 18.5));
      door.setAttribute("width", "15");
      door.setAttribute("height", "15");
      door.setAttribute("rx", "1.5");
      door.setAttribute("fill", "#a8712f");
      door.setAttribute("stroke", "#f6dfa0");
      door.setAttribute("stroke-width", "0.8");
      svg.appendChild(door);
    }
  }
  return svg;
}

/** The cabinet picture: the SVG brass grid at once, swapped for the "advent-cabinet" image when it loads. */
export function buildCabinetPicture(): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "advent-cabinet-picture";
  wrap.appendChild(buildFallbackSvg());
  const probe = new Image();
  probe.onload = () => {
    probe.className = "advent-cabinet-img";
    probe.alt = "";
    wrap.replaceChildren(probe);
  };
  probe.src = artUrl(ADVENT_CABINET_ART_ID);
  return wrap;
}

function cardName(id: string): string {
  if (id.startsWith("foil:")) return `${cardName(id.slice(5))} (foil)`;
  return ACQUIRABLE_CARDS_BY_ID.get(id)?.faces[0].name ?? id;
}

/** A door's contents in words, e.g. "15 Checks", "Wassail Bowl", "Bramwell (foil)". */
export function describeReward(reward: AdventReward): string {
  const parts: string[] = [];
  if (reward.checks) parts.push(`${reward.checks} Checks`);
  if (reward.cardId) parts.push(cardName(reward.cardId));
  if (reward.foilOf) parts.push(`${cardName(reward.foilOf)} (foil)`);
  if (reward.token) parts.push(TOKEN_LABEL[reward.token]);
  return parts.join(" + ");
}

/** A door's line followed by its contents in brackets; contents that already carry brackets ("Bramwell (foil)") aren't wrapped again (PT-49). */
export function withContents(line: string, contents: string): string {
  return contents.includes("(") ? `${line} ${contents}` : `${line} (${contents})`;
}

/** A short label for a door tile, which is small: tokens and foils get a word, the rest their text. */
export function shortReward(reward: AdventReward): string {
  if (reward.token === "lostAndFoundUncommon") return "L&F token";
  if (reward.token === "tinkerFree") return "Tinker token";
  return describeReward(reward);
}
