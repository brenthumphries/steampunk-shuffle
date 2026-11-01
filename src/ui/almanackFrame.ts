// The Almanack frame (docs/plans/monthly/00-monthly-content-plan.md §4.4): a
// Headline card face with `frame: "almanack"` is drawn as a printed almanack
// page instead of the newspaper frame — a parchment border, a brass orrery
// ring around the art window, and a medallion holding the zodiac glyph
// (`face.glyph`). Rules are unchanged; this is only the dressing.
//
// The SVG sits behind the card's text (style.css gives the card its own
// stacking context and the SVG z-index -1), above the illustration, so the
// art shows through the ring and the card text stays on the same dark scrim
// as every other card. Everything is vector, crisp at mini and zoom size.

import type { CardFace } from "../cards/cardTypes.ts";

const SVG_NS = "http://www.w3.org/2000/svg";

/** U+FE0E asks for text presentation; without it iOS draws the zodiac signs as colour emoji. */
const TEXT_PRESENTATION = "︎";

const PARCHMENT = "#e8d9b4";
const INK = "#2b1d10";
const BRASS = "#b8862b";
const BRASS_LIGHT = "#f0d28a";

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

/** True when `face` asks for the Almanack frame. */
export function usesAlmanackFrame(face: Pick<CardFace, "frame">): boolean {
  return face.frame === "almanack";
}

/** Builds the frame as an SVG that fills its card (viewBox 300 x 400, stretched to the card box). */
export function buildAlmanackFrame(glyph?: string): SVGSVGElement {
  const svg = svgEl("svg", { viewBox: "0 0 300 400", preserveAspectRatio: "none", class: "card-frame-svg card-frame-almanack", "aria-hidden": "true", focusable: "false" });

  // Parchment ground: the page margin around the art window, as one even-odd path.
  svg.appendChild(svgEl("path", { d: "M0 0H300V400H0Z M16 16V384H284V16Z", "fill-rule": "evenodd", fill: PARCHMENT }));
  // Two printer's rules just inside the margin.
  svg.appendChild(svgEl("rect", { x: 16, y: 16, width: 268, height: 368, fill: "none", stroke: INK, "stroke-width": 1.6 }));
  svg.appendChild(svgEl("rect", { x: 9, y: 9, width: 282, height: 382, fill: "none", stroke: INK, "stroke-width": 0.8, opacity: 0.7 }));

  // The orrery ring: brass band, inner hairline, 24 tick marks, three small planets.
  const cx = 150;
  const cy = 206;
  svg.appendChild(svgEl("circle", { cx, cy, r: 112, fill: "none", stroke: BRASS, "stroke-width": 7 }));
  svg.appendChild(svgEl("circle", { cx, cy, r: 112, fill: "none", stroke: BRASS_LIGHT, "stroke-width": 1.4, opacity: 0.9 }));
  svg.appendChild(svgEl("circle", { cx, cy, r: 100, fill: "none", stroke: INK, "stroke-width": 1, opacity: 0.8 }));
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI * 2) / 24;
    const long = i % 6 === 0;
    const r1 = 116;
    const r2 = long ? 128 : 123;
    svg.appendChild(
      svgEl("line", { x1: cx + Math.sin(a) * r1, y1: cy - Math.cos(a) * r1, x2: cx + Math.sin(a) * r2, y2: cy - Math.cos(a) * r2, stroke: INK, "stroke-width": long ? 2 : 1.1 }),
    );
  }
  for (const [deg, r] of [[40, 112], [160, 112], [275, 112]] as const) {
    const a = (deg * Math.PI) / 180;
    svg.appendChild(svgEl("circle", { cx: cx + Math.sin(a) * r, cy: cy - Math.cos(a) * r, r: 4.5, fill: BRASS_LIGHT, stroke: INK, "stroke-width": 1 }));
  }

  // The zodiac glyph slot: a parchment medallion in the top-right corner of the page.
  const gx = 252;
  const gy = 50;
  svg.appendChild(svgEl("circle", { cx: gx, cy: gy, r: 27, fill: PARCHMENT, stroke: BRASS, "stroke-width": 4 }));
  svg.appendChild(svgEl("circle", { cx: gx, cy: gy, r: 21, fill: "none", stroke: INK, "stroke-width": 0.9 }));
  if (glyph) {
    const text = svgEl("text", { x: gx, y: gy + 11, "text-anchor": "middle", "font-size": 32, fill: INK, class: "card-frame-glyph" });
    text.setAttribute("font-family", "'Apple Symbols', 'Segoe UI Symbol', 'Noto Sans Symbols', 'DejaVu Sans', serif");
    text.textContent = glyph + TEXT_PRESENTATION;
    svg.appendChild(text);
  }
  return svg;
}

/**
 * Dresses a card element for its face: for an Almanack face, marks it
 * `data-frame="almanack"` and inserts the SVG frame as its first child.
 * Any other face is left exactly as it was.
 */
export function applyFaceFrame(cardEl: HTMLElement, face: Pick<CardFace, "frame" | "glyph">): void {
  if (!usesAlmanackFrame(face)) return;
  cardEl.dataset.frame = "almanack";
  cardEl.prepend(buildAlmanackFrame(face.glyph));
}
