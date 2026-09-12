// 8-seat single-elimination bracket generation and progression (plan step
// 2.4, design.md §10).

import { describe, expect, it } from "vitest";

import { OPPONENTS } from "../../../src/pub/opponents.ts";
import { TOURNAMENTS_BY_ID } from "../../../src/tournaments/tournaments.ts";
import { advanceBracket, breakTournamentDraw, createBracket, currentMatchIndex, weightedDraw, type TournamentBracket } from "../../../src/tournaments/bracket.ts";

const knockout = TOURNAMENTS_BY_ID.get("tuesday-knockout")!;
const peelers = TOURNAMENTS_BY_ID.get("peelers-cup")!;

describe("createBracket", () => {
  it("draws 7 distinct seats from the eligible pool and resolves the non-player half immediately", { timeout: 30_000 }, () => {
    const pool = knockout.eligiblePool(OPPONENTS);
    const bracket = createBracket(knockout, pool, 42);

    expect(bracket.seatOpponentIds).toHaveLength(7);
    expect(new Set(bracket.seatOpponentIds).size).toBe(7);
    for (const id of bracket.seatOpponentIds) {
      expect(pool.some((o) => o.id === id)).toBe(true);
    }

    expect(bracket.playerMatches).toHaveLength(3);
    for (const slot of bracket.playerMatches) {
      expect(slot.outcome).toBe("pending");
      // The player's semifinal/final opponents are drawn from the resolved AI subtree, not necessarily a seat directly.
      expect(typeof slot.opponentId).toBe("string");
    }
    expect(bracket.status).toBe("in-progress");
  });

  it("is deterministic for a given seed", { timeout: 60_000 }, () => {
    const pool = knockout.eligiblePool(OPPONENTS);
    const a = createBracket(knockout, pool, 7);
    const b = createBracket(knockout, pool, 7);
    expect(a).toEqual(b);
  });

  // Exercises `weightedDraw` directly (the seat-selection step) rather than
  // full `createBracket`, which pays for real AI-vs-AI self-play per trial
  // and would make a several-hundred-trial statistical check far too slow
  // for a unit test.
  it("favours Yard-affiliated opponents (Mudd, Bucket) for the Peelers' Cup across many draws", () => {
    const pool = peelers.eligiblePool(OPPONENTS);
    const weightOf = peelers.seatWeight!;
    let muddDropped = 0;
    let buckDropped = 0;
    const trials = 400;
    for (let seed = 0; seed < trials; seed++) {
      const { picked } = weightedDraw(pool, 7, seed * 1000, weightOf);
      const pickedIds = picked.map((o) => o.id);
      if (!pickedIds.includes("mudd")) muddDropped++;
      if (!pickedIds.includes("bucket")) buckDropped++;
    }
    // Pool has 8 candidates for 7 seats — exactly one is dropped per draw.
    // Yard-affiliated opponents are weighted 5x, so they should be dropped
    // much less often than a uniform 1-in-8 rate across `trials` draws.
    expect(muddDropped).toBeLessThan(trials / 8);
    expect(buckDropped).toBeLessThan(trials / 8);
  });

  it("throws if the eligible pool has fewer than 7 opponents", () => {
    expect(() => createBracket(knockout, OPPONENTS.slice(0, 3), 1)).toThrow();
  });
});

describe("currentMatchIndex / advanceBracket", () => {
  function freshBracket(): TournamentBracket {
    return {
      tournamentId: "tuesday-knockout",
      seatOpponentIds: ["mudd", "nell-ashby", "reg-farrow", "prudence-hollis", "bucket", "lovelace", "adler"],
      playerMatches: [
        { opponentId: "mudd", outcome: "pending" },
        { opponentId: "nell-ashby", outcome: "pending" },
        { opponentId: "bucket", outcome: "pending" },
      ],
      status: "in-progress",
    };
  }

  it("starts at match 0 and advances on a win without ending the tournament", () => {
    const bracket = freshBracket();
    expect(currentMatchIndex(bracket)).toBe(0);

    const afterQF = advanceBracket(bracket, "win");
    expect(afterQF.playerMatches[0].outcome).toBe("won");
    expect(afterQF.status).toBe("in-progress");
    expect(currentMatchIndex(afterQF)).toBe(1);
  });

  it("eliminates the player immediately on a loss, at any stage", () => {
    const bracket = freshBracket();
    const afterLoss = advanceBracket(bracket, "loss");
    expect(afterLoss.status).toBe("eliminated");
    expect(afterLoss.playerMatches[0].outcome).toBe("lost");
    expect(currentMatchIndex(afterLoss)).toBe(-1);
  });

  it("crowns a champion on winning the final (match index 2)", () => {
    let bracket = freshBracket();
    bracket = advanceBracket(bracket, "win"); // QF
    bracket = advanceBracket(bracket, "win"); // SF
    expect(currentMatchIndex(bracket)).toBe(2);
    bracket = advanceBracket(bracket, "win"); // Final
    expect(bracket.status).toBe("champion");
    expect(bracket.playerMatches[2].outcome).toBe("won");
    expect(currentMatchIndex(bracket)).toBe(-1);
  });

  it("is a no-op once the bracket is already decided", () => {
    let bracket = freshBracket();
    bracket = advanceBracket(bracket, "loss");
    const again = advanceBracket(bracket, "win");
    expect(again).toBe(bracket);
  });
});

describe("breakTournamentDraw", () => {
  it("always returns win or loss, deterministically for a given seed", () => {
    const a = breakTournamentDraw(123);
    const b = breakTournamentDraw(123);
    expect(a).toBe(b);
    expect(["win", "loss"]).toContain(a);
  });
});
