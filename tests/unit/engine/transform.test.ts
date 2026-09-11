// Transform (design.md §5.10) and endOfRound-triggered abilities, using the
// real Dr Jekyll / Mr Hyde card (design.md §9.3) — the only two-faced card
// in v1, and the only endOfRound-triggered ability.

import { describe, expect, it } from "vitest";

import { createMatch, currentPlayer, effectivePoints, type MatchState } from "../../../src/engine/matchEngine.ts";
import { drJekyllMrHyde } from "../cards/fixtures/legends.ts";
import { instanceId, makeCard, makeQueuePlayer, orderedDeck } from "./fixtures/helpers.ts";

function findBoard(state: MatchState, id: string) {
  const bc = state.players.A.board.find((b) => b.instanceId === id);
  if (!bc) throw new Error(`missing board card ${id}`);
  return bc;
}

describe("Transform (design.md §5.10) and Mr Hyde's endOfRound liability", () => {
  it("transforms at the start of the next round, and Hyde flips one of A's other cards before cleanup", () => {
    const loyalFiller = makeCard({ name: "Loyal Filler", points: 3, keywords: { persist: true } });
    // Everything else A ever plays is a 1-point vanilla, so Loyal Filler is
    // always the unique highest-points "other" candidate for Hyde's flip
    // (design.md §5.13 default target rule).
    const aFillers = Array.from({ length: 8 }, (_, i) => makeCard({ name: `A filler ${i}`, points: 1 }));
    const bFillers = Array.from({ length: 10 }, (_, i) => makeCard({ name: `B filler ${i}`, points: 1 }));

    const cardsA = [drJekyllMrHyde, loyalFiller, ...aFillers];
    const playA = makeQueuePlayer(cardsA);
    const playB = makeQueuePlayer(bFillers);

    let state = createMatch(orderedDeck(cardsA), orderedDeck(bFillers), { seed: 1, shuffle: false, leader: "A" });

    let afterRound1: MatchState | undefined;
    while (state.round <= 2 && state.status === "in-progress") {
      const roundBefore = state.round;
      state = currentPlayer(state) === "A" ? playA(state, "A") : playB(state, "B");
      if (roundBefore === 1 && state.round === 2 && !afterRound1) afterRound1 = state;
    }

    // Jekyll persisted into round 2 and transformed into Hyde before anyone
    // took a turn.
    const jekyllId = instanceId("A", drJekyllMrHyde);
    const hydeBc = findBoard(afterRound1!, jekyllId);
    expect(hydeBc.faceIndex).toBe(1);
    expect(hydeBc.card.faces[1]!.name).toBe("Mr Edward Hyde");
    expect(effectivePoints(afterRound1!, "A", hydeBc)).toBe(6);

    // By the end of round 2, Hyde's endOfRound ability has flipped Loyal
    // Filler face-down (never itself — the source of a targeted effect is
    // excluded from its own candidate pool) — and a face-down card is
    // discarded regardless of Persist (design.md §5.3), so it lands in the
    // discard, not surviving on the board.
    const fillerId = instanceId("A", loyalFiller);
    expect(state.players.A.discard.some((c) => c.instanceId === fillerId)).toBe(true);
    expect(state.players.A.board.some((b) => b.instanceId === fillerId)).toBe(false);
  });
});
