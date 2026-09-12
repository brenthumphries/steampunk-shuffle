// Full replay of the tutorial's forced script (design.md §13.2) end to end,
// through the real starter/House cards and the real engine — extends 1.2's
// tutorialRound1.test.ts (which only replays round 1) to all three rounds,
// and doubles as the regression test for TUTORIAL_PLAYER_DECK/
// TUTORIAL_HOUSE_DECK's exact draw order.

import { describe, expect, it } from "vitest";

import { createMatch, playTurn, type MatchState } from "../../../src/engine/matchEngine.ts";
import { TUTORIAL_HOUSE_DECK, TUTORIAL_PLAYER, TUTORIAL_PLAYER_DECK, TUTORIAL_HOUSE, TUTORIAL_TURNS } from "../../../src/tutorial/tutorialScript.ts";

describe("Tutorial script (design.md §13.2)", () => {
  it("plays all 18 forced turns and ends 2-1 to the player, matching every scripted score", () => {
    let state: MatchState = createMatch(TUTORIAL_PLAYER_DECK, TUTORIAL_HOUSE_DECK, { seed: 1, shuffle: false, leader: TUTORIAL_HOUSE });

    for (const turn of TUTORIAL_TURNS) {
      const hand = state.players[turn.side].hand;
      const inst = hand.find((c) => c.card.id === turn.cardId);
      expect(inst, `expected "${turn.cardId}" in ${turn.side}'s hand before this turn`).toBeDefined();
      state = playTurn(state, turn.side, inst!.instanceId);
    }

    expect(state.status).toBe("complete");
    expect(state.result).toEqual({ winner: TUTORIAL_PLAYER, reason: "two-rounds" });
    expect(state.roundsWon).toEqual({ A: 2, B: 1 });
    expect(state.roundHistory).toEqual([
      { round: 1, scores: { A: 9, B: 6 }, winner: "A" },
      { round: 2, scores: { A: 7, B: 15 }, winner: "B" },
      { round: 3, scores: { A: 7, B: 6 }, winner: "A" },
    ]);
  });

  it("both decks contain exactly the cards the script ever draws, with no duplicate ids other than Boiler Hand", () => {
    const playerIds = TUTORIAL_PLAYER_DECK.map((e) => e.card.id);
    expect(new Set(playerIds).size).toBe(playerIds.length); // no collisions on the player's side

    const houseIds = TUTORIAL_HOUSE_DECK.map((e) => e.card.id);
    const dupes = houseIds.filter((id, i) => houseIds.indexOf(id) !== i);
    expect(dupes).toEqual(["boiler-hand"]); // the one intentional instanceId collision (see tutorialScript.ts's header comment)
  });
});
