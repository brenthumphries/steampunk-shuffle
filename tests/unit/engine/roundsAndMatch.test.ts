// Turn order, round scoring, leader alternation, and match end (design.md
// §6.2-§6.3).

import { describe, expect, it } from "vitest";

import { createMatch, currentPlayer, playTurn } from "../../../src/engine/matchEngine.ts";
import { instanceId, makeCard, makeQueuePlayer, orderedDeck } from "./fixtures/helpers.ts";

describe("Turn order (design.md §6.2.2)", () => {
  it("alternates starting with the leader, and rejects the wrong player", () => {
    const cardA = makeCard({ name: "A card", points: 1 });
    const cardB = makeCard({ name: "B card", points: 1 });
    const state = createMatch(orderedDeck([cardA]), orderedDeck([cardB]), { seed: 1, shuffle: false, leader: "A" });

    expect(currentPlayer(state)).toBe("A");
    expect(() => playTurn(state, "B", instanceId("B", cardB))).toThrow(/not B/);
  });

  it("rejects playing a card that isn't in hand", () => {
    const cardA = makeCard({ name: "A card", points: 1 });
    const cardB = makeCard({ name: "B card", points: 1 });
    const state = createMatch(orderedDeck([cardA]), orderedDeck([cardB]), { seed: 1, shuffle: false, leader: "A" });
    expect(() => playTurn(state, "A", "not-a-real-instance-id")).toThrow(/not in A's hand/);
  });

  it("must pass with an empty hand and cannot voluntarily pass otherwise", () => {
    const cardA = makeCard({ name: "A card", points: 1 });
    const cardB = makeCard({ name: "B card", points: 1 });
    let state = createMatch(orderedDeck([cardA]), orderedDeck([cardB]), { seed: 1, shuffle: false, leader: "A" });

    expect(() => playTurn(state, "A")).toThrow(/must play a card/);

    state = playTurn(state, "A", instanceId("A", cardA));
    expect(state.players.A.hand).toHaveLength(0);
    // A's hand is now empty; A won't act again until round 2, but exercise
    // the pass path directly once it's A's turn again isn't needed here —
    // covered by the property test's random games, which regularly empty a
    // hand mid-round via draw effects.
  });
});

describe("Round scoring and leader alternation (design.md §6.2.3, §6.2.4)", () => {
  it("higher score takes the round; the loser leads next", () => {
    const bigA = makeCard({ name: "Big A", points: 6 });
    const smallB = makeCard({ name: "Small B", points: 1 });
    const fillerA = [makeCard({ name: "fa1", points: 1 }), makeCard({ name: "fa2", points: 1 })];
    const fillerB = [makeCard({ name: "fb1", points: 1 }), makeCard({ name: "fb2", points: 1 })];

    const playA = makeQueuePlayer([bigA, ...fillerA]);
    const playB = makeQueuePlayer([smallB, ...fillerB]);

    let state = createMatch(orderedDeck([bigA, ...fillerA]), orderedDeck([smallB, ...fillerB]), {
      seed: 1,
      shuffle: false,
      leader: "A",
    });
    while (state.round === 1 && state.status === "in-progress") {
      state = currentPlayer(state) === "A" ? playA(state, "A") : playB(state, "B");
    }

    expect(state.roundHistory[0]).toMatchObject({ winner: "A" });
    expect(state.leader).toBe("B"); // A won round 1, so B (the loser) leads round 2
  });

  it("a tied round swaps the leader even though nobody takes it", () => {
    const tieA = makeCard({ name: "Tie A", points: 3 });
    const tieB = makeCard({ name: "Tie B", points: 3 });
    const fillerA = [makeCard({ name: "fa1", points: 0 }), makeCard({ name: "fa2", points: 0 })];
    const fillerB = [makeCard({ name: "fb1", points: 0 }), makeCard({ name: "fb2", points: 0 })];

    const playA = makeQueuePlayer([tieA, ...fillerA]);
    const playB = makeQueuePlayer([tieB, ...fillerB]);

    let state = createMatch(orderedDeck([tieA, ...fillerA]), orderedDeck([tieB, ...fillerB]), {
      seed: 1,
      shuffle: false,
      leader: "A",
    });
    while (state.round === 1 && state.status === "in-progress") {
      state = currentPlayer(state) === "A" ? playA(state, "A") : playB(state, "B");
    }

    expect(state.roundHistory[0]).toMatchObject({ winner: "tie" });
    expect(state.roundsWon).toEqual({ A: 0, B: 0 });
    expect(state.leader).toBe("B"); // A led round 1; a tie flips the leader
  });
});

describe("Round-end board snapshot (PT-9)", () => {
  it("finalBoard captures the board as it stood before cleanup, including cards about to be discarded", () => {
    const persistCard = makeCard({ name: "Persist Card", points: 2, keywords: { persist: true } });
    const plainCard = makeCard({ name: "Plain Card", points: 3 });
    const bFillers = [makeCard({ name: "bf1", points: 1 }), makeCard({ name: "bf2", points: 1 }), makeCard({ name: "bf3", points: 1 })];

    const deckA = orderedDeck([persistCard, plainCard]);
    const deckB = orderedDeck(bFillers);

    let state = createMatch(deckA, deckB, { seed: 1, shuffle: false, leader: "A" });
    state = playTurn(state, "A", instanceId("A", persistCard));
    state = playTurn(state, "B", instanceId("B", bFillers[0]!));
    state = playTurn(state, "A", instanceId("A", plainCard));
    state = playTurn(state, "B", instanceId("B", bFillers[1]!));
    state = playTurn(state, "A"); // A's hand is empty — forced pass
    state = playTurn(state, "B", instanceId("B", bFillers[2]!));

    const finalBoard = state.roundHistory[0]!.finalBoard;
    expect(finalBoard.A.map((bc) => bc.instanceId).sort()).toEqual([instanceId("A", persistCard), instanceId("A", plainCard)].sort());
    // The snapshot still shows Plain Card even though real cleanup swept it to discard.
    expect(state.players.A.board.some((b) => b.instanceId === instanceId("A", plainCard))).toBe(false);
    expect(state.players.A.discard.some((c) => c.instanceId === instanceId("A", plainCard))).toBe(true);
  });
});

describe("Match end (design.md §6.3)", () => {
  function scoredMatch(roundPointsA: number[], roundPointsB: number[]) {
    // Each side plays exactly 3 cards a round; distribute a round's total
    // evenly enough across 3 cards (remainder on the first) that summing
    // them reproduces the intended round score exactly.
    const split = (total: number) => [total - 2 * Math.floor(total / 3), Math.floor(total / 3), Math.floor(total / 3)];
    const cardsFor = (owner: string, points: number[]) =>
      points.flatMap((total, round) => split(total).map((p, i) => makeCard({ name: `${owner}-r${round}-${i}`, points: p })));

    const cardsA = cardsFor("A", roundPointsA);
    const cardsB = cardsFor("B", roundPointsB);
    const playA = makeQueuePlayer(cardsA);
    const playB = makeQueuePlayer(cardsB);

    let state = createMatch(orderedDeck(cardsA), orderedDeck(cardsB), { seed: 1, shuffle: false, leader: "A" });
    while (state.status === "in-progress") {
      state = currentPlayer(state) === "A" ? playA(state, "A") : playB(state, "B");
    }
    return state;
  }

  it("ends immediately at two rounds taken — round 3 is never dealt", () => {
    const state = scoredMatch([5, 5], [1, 1]);
    expect(state.status).toBe("complete");
    expect(state.result).toEqual({ winner: "A", reason: "two-rounds" });
    expect(state.round).toBe(2); // never advanced into round 3
  });

  it("after three rounds, more rounds taken wins", () => {
    // tie, A win, tie -> A:1 B:0 rounds, deciding it without either reaching 2.
    const state = scoredMatch([3, 5, 4], [3, 2, 4]);
    expect(state.status).toBe("complete");
    expect(state.roundsWon).toEqual({ A: 1, B: 0 });
    expect(state.result).toEqual({ winner: "A", reason: "more-rounds-after-three" });
  });

  it("after three rounds with rounds tied, higher total score wins", () => {
    // A wins round 1 by a lot, B wins round 2 by a little, round 3 ties:
    // roundsWon 1-1, but totals differ.
    const state = scoredMatch([8, 3, 2], [1, 6, 2]);
    expect(state.status).toBe("complete");
    expect(state.roundsWon).toEqual({ A: 1, B: 1 });
    const totalA = state.roundHistory.reduce((s, r) => s + r.scores.A, 0);
    const totalB = state.roundHistory.reduce((s, r) => s + r.scores.B, 0);
    expect(totalA).not.toBe(totalB);
    expect(state.result).toEqual({ winner: totalA > totalB ? "A" : "B", reason: "total-score-after-three" });
  });

  it("after three rounds fully tied on rounds and total score, it's a draw", () => {
    const state = scoredMatch([3, 3, 3], [3, 3, 3]);
    expect(state.status).toBe("complete");
    expect(state.roundsWon).toEqual({ A: 0, B: 0 });
    expect(state.result).toEqual({ winner: "draw", reason: "draw-after-three" });
  });
});
