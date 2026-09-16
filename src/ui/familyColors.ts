// Bugfix cluster B (notes #4, #5, #11): the deck builder's family filter
// had no visual tie to the card frame colours it filters by. The colours
// here are kept identical by hand to the `--family-*` custom properties in
// src/style.css (CSS can't import this module — same duplication
// precedent as tools/ingest-art.py's ASPECT_BY_CATEGORY, which documents
// the same tradeoff) — this is the one place the mapping is exhaustively
// unit-tested, so the deck builder's family legend (src/ui/
// deckBuilderScreen.ts) reads from here rather than a second hand-copied
// list.

import { FAMILIES, type Family } from "../cards/cardTypes.ts";

export const FAMILY_COLOR: Record<Family, string> = {
  yard: "#3a4f63",
  irregulars: "#c8862c",
  rookery: "#6e2a2a",
  foundry: "#a8712f",
  salon: "#3e6b5a",
  neutral: "#7c6a4d",
};

export function familyColor(family: Family): string {
  return FAMILY_COLOR[family];
}

export const ALL_FAMILY_COLORS: ReadonlyArray<{ family: Family; color: string }> = FAMILIES.map((family) => ({
  family,
  color: FAMILY_COLOR[family],
}));
