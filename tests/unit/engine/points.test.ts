// Points and Friend (design.md §5.1, §5.4).

import { describe, expect, it } from "vitest";

import { createMatch, currentPlayer, effectivePoints, playTurn } from "../../../src/engine/matchEngine.ts";
import { instanceId, makeCard, orderedDeck } from "./fixtures/helpers.ts";

function findBoardCard(state: ReturnType<typeof createMatch>, playerId: "A" | "B", id: string) {
  const bc = state.players[playerId].board.find((b) => b.instanceId === id);
  if (!bc) throw new Error(`no board card ${id} for ${playerId}`);
  return bc;
}

describe("Friend +N (design.md §5.4)", () => {
  it("only grants the bonus while another face-up Friend card is on the same side", () => {
    const friendA = makeCard({ name: "Friend A", points: 2, keywords: { friend: 1 } });
    const friendB = makeCard({ name: "Friend B", points: 2, keywords: { friend: 2 } });
    const fillers = Array.from({ length: 5 }, (_, i) => makeCard({ name: `A filler ${i}`, points: 1 }));
    const bFillers = Array.from({ length: 5 }, (_, i) => makeCard({ name: `B filler ${i}`, points: 1 }));

    const deckA = orderedDeck([friendA, friendB, ...fillers]);
    const deckB = orderedDeck(bFillers);

    let state = createMatch(deckA, deckB, { seed: 1, shuffle: false, leader: "A" });
    expect(currentPlayer(state)).toBe("A");

    // Turn 0 (A): play Friend A alone — no other Friend on the board yet.
    state = playTurn(state, "A", instanceId("A", friendA));
    let bc = findBoardCard(state, "A", instanceId("A", friendA));
    expect(effectivePoints(state, "A", bc)).toBe(2);

    // Turn 1 (B): filler.
    state = playTurn(state, "B", instanceId("B", bFillers[0]!));

    // Turn 2 (A): play Friend B — now both get their bonus.
    state = playTurn(state, "A", instanceId("A", friendB));
    const bcA = findBoardCard(state, "A", instanceId("A", friendA));
    const bcB = findBoardCard(state, "A", instanceId("A", friendB));
    expect(effectivePoints(state, "A", bcA)).toBe(3); // 2 + 1
    expect(effectivePoints(state, "A", bcB)).toBe(4); // 2 + 2
  });
});

describe("Effective points floor at 0 (design.md §5.1)", () => {
  it("never goes negative even under a large debuff", () => {
    const target = makeCard({ name: "Target", points: 2 });
    const debuffLocation = makeCard({
      name: "Debuff Field",
      type: "location",
      family: "neutral",
      points: 0,
      abilities: [
        {
          trigger: "continuous",
          effects: [{ effect: "buff", target: { side: "each", filter: {} }, amount: -10 }],
        },
      ],
    });
    const fillers = Array.from({ length: 5 }, (_, i) => makeCard({ name: `A filler ${i}`, points: 1 }));
    const bFillers = Array.from({ length: 5 }, (_, i) => makeCard({ name: `B filler ${i}`, points: 1 }));

    const deckA = orderedDeck([target, debuffLocation, ...fillers]);
    const deckB = orderedDeck(bFillers);

    let state = createMatch(deckA, deckB, { seed: 1, shuffle: false, leader: "A" });
    state = playTurn(state, "A", instanceId("A", target));
    state = playTurn(state, "B", instanceId("B", bFillers[0]!));
    state = playTurn(state, "A", instanceId("A", debuffLocation));

    const bc = findBoardCard(state, "A", instanceId("A", target));
    expect(effectivePoints(state, "A", bc)).toBe(0);
  });
});
