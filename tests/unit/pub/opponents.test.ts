// Opponent unlock thresholds and the "legends in town" rotation (plan step
// 2.3, design.md §12.1/§12.3).

import { describe, expect, it } from "vitest";

import {
  isOpponentInTown,
  legendsInTown,
  LEGEND_IDS,
  OPPONENTS,
  OPPONENTS_BY_ID,
  tonightsPatrons,
} from "../../../src/pub/opponents.ts";
import { ACQUIRABLE_CARDS_BY_ID } from "../../../src/pub/acquirableCards.ts";

const A_DAY = new Date(2026, 8, 11);

describe("tonightsPatrons", () => {
  it("at 0 wins shows Sir Charles and all four Regulars, nothing else", () => {
    const names = tonightsPatrons(0, A_DAY).map((o) => o.id);
    expect(names).toEqual(expect.arrayContaining(["sir-charles", "mudd", "nell-ashby", "reg-farrow", "prudence-hollis"]));
    expect(names).toHaveLength(5);
  });

  it("at 3 wins adds Bucket only, not the other three Seasoned", () => {
    const names = tonightsPatrons(3, A_DAY).map((o) => o.id);
    expect(names).toContain("bucket");
    expect(names).not.toContain("lovelace");
    expect(names).not.toContain("adler");
    expect(names).not.toContain("dickens");
  });

  it("at 5 wins adds all four Seasoned", () => {
    const names = tonightsPatrons(5, A_DAY).map((o) => o.id);
    for (const id of ["bucket", "lovelace", "adler", "dickens"]) expect(names).toContain(id);
  });

  it("below 10 wins shows no Legends at all", () => {
    const names = tonightsPatrons(9, A_DAY).map((o) => o.id);
    for (const id of LEGEND_IDS) expect(names).not.toContain(id);
  });

  it("at 10+ wins shows exactly today's two Legends", () => {
    const names = tonightsPatrons(10, A_DAY).map((o) => o.id);
    const legendsShown = names.filter((id) => (LEGEND_IDS as string[]).includes(id));
    expect(legendsShown).toEqual([...legendsInTown(A_DAY)]);
    expect(legendsShown).toHaveLength(2);
  });
});

describe("legendsInTown", () => {
  it("is deterministic for a given date", () => {
    expect(legendsInTown(A_DAY)).toEqual(legendsInTown(new Date(2026, 8, 11, 23, 59)));
  });

  it("every legend appears at least once across any 3 consecutive days", () => {
    for (let start = 0; start < 10; start++) {
      const seen = new Set<string>();
      for (let offset = 0; offset < 3; offset++) {
        const date = new Date(2026, 0, 1 + start + offset);
        for (const id of legendsInTown(date)) seen.add(id);
      }
      expect([...seen].sort()).toEqual([...LEGEND_IDS].sort());
    }
  });
});

describe("isOpponentInTown", () => {
  it("gates a Legend on both the win threshold and the daily rotation", () => {
    const holmes = OPPONENTS_BY_ID.get("holmes")!;
    expect(isOpponentInTown(holmes, 10, A_DAY)).toBe(legendsInTown(A_DAY).includes("holmes"));
    expect(isOpponentInTown(holmes, 9, A_DAY)).toBe(false);
  });

  it("never gates Regulars or the house on the daily rotation", () => {
    const mudd = OPPONENTS_BY_ID.get("mudd")!;
    expect(isOpponentInTown(mudd, 0, A_DAY)).toBe(true);
  });
});

describe("OPPONENTS registry", () => {
  it("has a unique id for every opponent", () => {
    const ids = OPPONENTS.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every non-house opponent a reward card id", () => {
    for (const opponent of OPPONENTS) {
      if (opponent.tier === "house") {
        expect(opponent.rewardCardId).toBeNull();
      } else {
        expect(opponent.rewardCardId).not.toBeNull();
      }
    }
  });
});

describe("Opponent.betPool (plan step 2.5, design.md §11.5)", () => {
  it("gives Sir Charles no bet pool", () => {
    expect(OPPONENTS_BY_ID.get("sir-charles")!.betPool).toEqual([]);
  });

  it("gives every real opponent 3-4 real, non-legendary bet-pool cards", () => {
    for (const opponent of OPPONENTS) {
      if (opponent.tier === "house") continue;
      expect(opponent.betPool.length).toBeGreaterThanOrEqual(3);
      expect(opponent.betPool.length).toBeLessThanOrEqual(4);
      for (const cardId of opponent.betPool) {
        const card = ACQUIRABLE_CARDS_BY_ID.get(cardId);
        expect(card, `${opponent.id}'s bet pool references unknown card "${cardId}"`).toBeDefined();
        expect(card!.rarity).not.toBe("legendary");
      }
    }
  });

  it("gives every Seasoned/Legend opponent exactly one rare in their bet pool", () => {
    for (const opponent of OPPONENTS) {
      if (opponent.tier !== "seasoned" && opponent.tier !== "legend") continue;
      const rares = opponent.betPool.filter((id) => ACQUIRABLE_CARDS_BY_ID.get(id)!.rarity === "rare");
      expect(rares, `${opponent.id}`).toHaveLength(1);
    }
  });
});
