// Unit tests for tools/sim.ts's pure computation helpers (plan step 1.4).
// The simulator's game-playing/report-writing is exercised by actually
// running `npm run sim` (fast — see tools/sim.ts's own timing output), so
// these focus on the two things worth regression-testing in isolation: the
// family-curve grouping and the per-card lift/outlier math (design.md §4, §7.4).

import { describe, expect, it } from "vitest";

import type { Card } from "../../../src/cards/cardTypes.ts";
import { computeCardLift, computeFamilyCurves } from "../../../tools/sim.ts";

function characterCard(id: string, family: Card["faces"][0]["family"], points: number): Card {
  return {
    id,
    rarity: "common",
    faces: [{ name: id, type: "character", family, points, flavor: "", artId: id }],
  };
}

describe("computeFamilyCurves", () => {
  it("averages printed points per family, across Characters only", () => {
    const cards: Card[] = [
      characterCard("a", "yard", 3),
      characterCard("b", "yard", 5),
      {
        id: "c",
        rarity: "common",
        faces: [{ name: "c", type: "scheme", family: "yard", points: 0, flavor: "", artId: "c" }],
      },
      characterCard("d", "salon", 2),
    ];
    const rows = computeFamilyCurves(cards);
    const yard = rows.find((r) => r.family === "yard")!;
    const salon = rows.find((r) => r.family === "salon")!;
    expect(yard.avgPoints).toBe(4); // (3+5)/2, the scheme is excluded
    expect(yard.sampleSize).toBe(2);
    expect(yard.target).toBe(3.0);
    expect(yard.delta).toBeCloseTo(1.0);
    expect(salon.avgPoints).toBe(2);
  });

  it("reports no target for families design.md §4 doesn't set a curve for", () => {
    const rows = computeFamilyCurves([characterCard("a", "neutral", 3)]);
    const neutral = rows.find((r) => r.family === "neutral")!;
    expect(neutral.target).toBeUndefined();
    expect(neutral.delta).toBeUndefined();
  });
});

describe("computeCardLift", () => {
  it("averages effective points per card face and computes lift over printed", () => {
    const rows = computeCardLift([
      { cardId: "x", cardName: "X", faceIndex: 0, printed: 2, effective: 3 },
      { cardId: "x", cardName: "X", faceIndex: 0, printed: 2, effective: 5 },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.avgEffective).toBe(4);
    expect(rows[0]!.lift).toBe(2);
    expect(rows[0]!.samples).toBe(2);
    expect(rows[0]!.outlier).toBe(false); // design.md §7.4: outlier only above printed + 3
  });

  it("flags a card as an outlier once its average effective points exceed printed + 3", () => {
    const rows = computeCardLift([
      { cardId: "y", cardName: "Y", faceIndex: 0, printed: 1, effective: 5 },
      { cardId: "y", cardName: "Y", faceIndex: 0, printed: 1, effective: 5 },
    ]);
    expect(rows[0]!.lift).toBe(4);
    expect(rows[0]!.outlier).toBe(true);
  });

  it("keeps two faces of the same card as separate rows", () => {
    const rows = computeCardLift([
      { cardId: "z", cardName: "Z front", faceIndex: 0, printed: 2, effective: 2 },
      { cardId: "z", cardName: "Z back", faceIndex: 1, printed: 6, effective: 6 },
    ]);
    expect(rows).toHaveLength(2);
  });

  it("sorts descending by lift", () => {
    const rows = computeCardLift([
      { cardId: "low", cardName: "Low", faceIndex: 0, printed: 3, effective: 3 },
      { cardId: "high", cardName: "High", faceIndex: 0, printed: 1, effective: 4 },
    ]);
    expect(rows[0]!.cardId).toBe("high");
    expect(rows[1]!.cardId).toBe("low");
  });
});
