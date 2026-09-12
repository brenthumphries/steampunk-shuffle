// Lost & Found (plan step 2.5, design.md §11.3).

import { describe, expect, it } from "vitest";

import { rollLostAndFound } from "../../../src/pub/lostAndFound.ts";
import { NON_LEGENDARY_ACQUIRABLE_CARDS } from "../../../src/pub/acquirableCards.ts";

const NON_LEGENDARY_IDS = new Set(NON_LEGENDARY_ACQUIRABLE_CARDS.map((c) => c.id));

describe("rollLostAndFound", () => {
  it("never rolls a legendary", () => {
    for (let day = 0; day < 60; day++) {
      const date = new Date(2026, 0, 1 + day);
      const card = rollLostAndFound([], date);
      expect(card.rarity).not.toBe("legendary");
      expect(NON_LEGENDARY_IDS.has(card.id)).toBe(true);
    }
  });

  it("is deterministic for the same real-world day", () => {
    const morning = new Date(2026, 8, 11, 8, 0, 0);
    const night = new Date(2026, 8, 11, 23, 0, 0);
    expect(rollLostAndFound([], morning).id).toBe(rollLostAndFound([], night).id);
  });

  it("can roll differently on different days", () => {
    const results = new Set<string>();
    for (let day = 0; day < 30; day++) {
      results.add(rollLostAndFound([], new Date(2026, 0, 1 + day)).id);
    }
    expect(results.size).toBeGreaterThan(1);
  });

  it("hits roughly the 70/25/5 rarity split over many days", () => {
    const counts: Record<string, number> = { common: 0, uncommon: 0, rare: 0 };
    const days = 400;
    for (let day = 0; day < days; day++) {
      const card = rollLostAndFound([], new Date(2026, 0, 1 + day));
      counts[card.rarity] = (counts[card.rarity] ?? 0) + 1;
    }
    expect(counts.common! / days).toBeGreaterThan(0.55);
    expect(counts.common! / days).toBeLessThan(0.85);
    expect(counts.rare! / days).toBeLessThan(0.15);
  });
});
