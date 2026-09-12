// Player titles by wins (plan step 2.6, design.md §12.1).

import { describe, expect, it } from "vitest";

import { TITLES, titleForWins } from "../../../src/pub/progression.ts";

describe("titleForWins (design.md §12.1)", () => {
  it("matches every threshold in the table", () => {
    expect(titleForWins(0)).toBe("Newcomer");
    expect(titleForWins(2)).toBe("Newcomer");
    expect(titleForWins(3)).toBe("Regular");
    expect(titleForWins(4)).toBe("Regular");
    expect(titleForWins(5)).toBe("Known at the Bar");
    expect(titleForWins(9)).toBe("Known at the Bar");
    expect(titleForWins(10)).toBe("Seasoned");
    expect(titleForWins(19)).toBe("Seasoned");
    expect(titleForWins(20)).toBe("Notorious");
    expect(titleForWins(34)).toBe("Notorious");
    expect(titleForWins(35)).toBe("Legend of the Bridge");
    expect(titleForWins(100)).toBe("Legend of the Bridge");
  });

  it("thresholds are sorted strictly ascending", () => {
    for (let i = 1; i < TITLES.length; i++) {
      expect(TITLES[i]!.minWins).toBeGreaterThan(TITLES[i - 1]!.minWins);
    }
  });
});
