// The small painted moon in the taproom window (design.md §5.17), drawn in SVG
// by code so it needs no art: eight states, a soft glow on the full moon.

import type { MoonPhaseName } from "../sky/moon.ts";
import { PHASE_TITLES } from "../sky/moonLines.ts";

const SVG_NS = "http://www.w3.org/2000/svg";
const R = 20;
const C = 24;

/** The cycle fraction each named state is drawn at (the middle of its slice). */
const DRAWN_CYCLE: Record<MoonPhaseName, number> = {
  new: 0,
  "waxing-crescent": 0.125,
  "first-quarter": 0.25,
  "waxing-gibbous": 0.375,
  full: 0.5,
  "waning-gibbous": 0.625,
  "last-quarter": 0.75,
  "waning-crescent": 0.875,
};

/** The lit part of a waxing disc (lit on the right); a waning one is this mirrored. Empty at new moon. */
function litPath(cycle: number): string {
  const c = cycle <= 0.5 ? cycle : 1 - cycle;
  if (c === 0) return "";
  if (c === 0.5) return `M ${C} ${C - R} A ${R} ${R} 0 1 1 ${C} ${C + R} A ${R} ${R} 0 1 1 ${C} ${C - R} Z`;
  const rx = R * Math.abs(Math.cos(2 * Math.PI * c));
  const sweep = Math.cos(2 * Math.PI * c) >= 0 ? 0 : 1;
  return `M ${C} ${C - R} A ${R} ${R} 0 0 1 ${C} ${C + R} A ${rx.toFixed(2)} ${R} 0 0 ${sweep} ${C} ${C - R} Z`;
}

function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string>): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

export function buildMoonSvg(name: MoonPhaseName): SVGSVGElement {
  const root = svg("svg", { viewBox: "0 0 48 48", class: "hub-moon-svg", "aria-hidden": "true", focusable: "false" });
  root.appendChild(svg("circle", { cx: String(C), cy: String(C), r: String(R), class: "hub-moon-dark" }));
  const cycle = DRAWN_CYCLE[name];
  const d = litPath(cycle);
  if (d) {
    const lit = svg("path", { d, class: "hub-moon-lit" });
    if (cycle > 0.5) lit.setAttribute("transform", `translate(${C * 2} 0) scale(-1 1)`);
    root.appendChild(lit);
  }
  root.appendChild(svg("circle", { cx: String(C), cy: String(C), r: String(R), class: "hub-moon-rim" }));
  return root;
}

export function buildHubMoon(name: MoonPhaseName, onTap: () => void): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `hub-moon${name === "full" ? " hub-moon--full" : ""}`;
  btn.dataset.phase = name;
  btn.setAttribute("aria-label", `The moon tonight: ${PHASE_TITLES[name].toLowerCase()}. Tap to read the beer mat.`);
  btn.appendChild(buildMoonSvg(name));
  btn.addEventListener("click", onTap);
  return btn;
}
