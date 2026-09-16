import { describe, expect, it } from "vitest";
import { FAMILIES } from "../../../src/cards/cardTypes.ts";
import { ALL_FAMILY_COLORS, FAMILY_COLOR, familyColor } from "../../../src/ui/familyColors.ts";

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

describe("family → color mapping (bugfix cluster B)", () => {
  it("covers every family with no fallback/undefined case", () => {
    for (const family of FAMILIES) {
      expect(FAMILY_COLOR[family]).toBeDefined();
      expect(familyColor(family)).toMatch(HEX_COLOR);
    }
  });

  it("assigns a distinct color to every family", () => {
    const colors = FAMILIES.map((f) => familyColor(f));
    expect(new Set(colors).size).toBe(colors.length);
  });

  it("ALL_FAMILY_COLORS lists every family exactly once, in FAMILIES order", () => {
    expect(ALL_FAMILY_COLORS.map((entry) => entry.family)).toEqual([...FAMILIES]);
  });
});
