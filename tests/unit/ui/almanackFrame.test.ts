// The Almanack frame and the Heather token (content plan §4.4; style-bible.md §2, §4).

import { describe, expect, it } from "vitest";

import { validateCard } from "../../../src/cards/cardValidator.ts";
import type { Card, CardFace } from "../../../src/cards/cardTypes.ts";
import { FAMILIES } from "../../../src/cards/cardTypes.ts";
import { applyFaceFrame, buildAlmanackFrame, usesAlmanackFrame } from "../../../src/ui/almanackFrame.ts";
import { HEATHER } from "../../../src/ui/familyColors.ts";
import { readFileSync } from "node:fs";

const face = (over: Partial<CardFace> = {}): CardFace => ({ name: "Scorpio", type: "headline", family: "neutral", points: 0, flavor: "Born under the Scorpion.", artId: "almanack-scorpio", ...over });
const card = (f: CardFace, rarity: Card["rarity"] = "rare"): Card => ({ id: "almanack-scorpio", rarity, faces: [f] });

describe("frame validation", () => {
  it("accepts frame \"almanack\" with a glyph on a Headline", () => {
    expect(validateCard(card(face({ frame: "almanack", glyph: "♏" })))).toEqual({ valid: true, errors: [] });
  });

  it("rejects the almanack frame on any other card type", () => {
    for (const type of ["character", "gadget", "scheme", "location"] as const) {
      const f = face({ type, frame: "almanack", points: type === "character" ? 2 : 0 });
      const r = validateCard(card(f, "common"));
      expect(r.valid, type).toBe(false);
      expect(r.errors.join("\n")).toContain("only a headline may use");
    }
  });

  it("rejects an unknown frame, and a glyph on a face with no almanack frame", () => {
    expect(validateCard(card(face({ frame: "gothic" as never }))).valid).toBe(false);
    expect(validateCard(card(face({ glyph: "♏" }))).errors.join()).toContain("glyph");
  });

  it("accepts giftOnly as a boolean only", () => {
    expect(validateCard({ ...card(face()), giftOnly: true }).valid).toBe(true);
    expect(validateCard({ ...card(face()), giftOnly: "yes" }).valid).toBe(false);
  });
});

describe("rendering", () => {
  it("draws an SVG frame with the orrery ring and the glyph in text presentation", () => {
    const svg = buildAlmanackFrame("♏");
    expect(svg.tagName.toLowerCase()).toBe("svg");
    expect(svg.querySelectorAll("circle").length).toBeGreaterThanOrEqual(5);
    expect(svg.querySelectorAll("line").length).toBe(24);
    expect(svg.querySelector("text")?.textContent).toBe("♏︎");
    expect(svg.getAttribute("aria-hidden")).toBe("true");
  });

  it("dresses only almanack faces", () => {
    const plain = document.createElement("div");
    applyFaceFrame(plain, face());
    expect(plain.dataset.frame).toBeUndefined();
    expect(plain.children.length).toBe(0);

    const framed = document.createElement("div");
    framed.appendChild(document.createElement("span"));
    applyFaceFrame(framed, face({ frame: "almanack", glyph: "♏" }));
    expect(usesAlmanackFrame(face({ frame: "almanack" }))).toBe(true);
    expect(framed.dataset.frame).toBe("almanack");
    expect(framed.firstElementChild?.classList.contains("card-frame-almanack")).toBe(true);
    expect(framed.children.length).toBe(2);
  });
});

describe("Heather", () => {
  const hex = (h: string): [number, number, number] => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number];
  const lum = (h: string): number => {
    const [r, g, b] = hex(h).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [number, number, number];
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a: string, b: string): number => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);

  it("is dusky violet, readable against the parchment text colour (WCAG AA, 4.5:1)", () => {
    expect(HEATHER).toBe("#6e5a7e");
    expect(contrast(HEATHER, "#f2e6d0")).toBeGreaterThanOrEqual(4.5);
  });

  it("matches the --family-coven token in style.css, and \"coven\" is not a family yet", () => {
    const css = readFileSync("src/style.css", "utf8");
    expect(css).toMatch(/--family-coven:\s*#6e5a7e;/);
    expect(css).toContain('.card[data-family="coven"]');
    expect((FAMILIES as readonly string[]).includes("coven")).toBe(false);
  });
});
