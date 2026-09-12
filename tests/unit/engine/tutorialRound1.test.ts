// End-to-end replay of design.md §13.2's scripted tutorial round 1, using the
// real starter-deck and house-deck cards. Leader is fixed ("the house leads,
// the first time"), so turn->player order is known up front; this is the one
// engine test that plays cards by exact scripted order rather than driving
// through the public API generically, to mirror the beer-mat script line by
// line and catch a wrong intermediate score immediately.

import { describe, expect, it } from "vitest";

import { boardScore, createMatch, effectivePoints, playTurn } from "../../../src/engine/matchEngine.ts";
import {
  amateurSleuth,
  bramwell,
  charlotte,
  constableOnTheBeat,
  hiawatha,
  emily,
  inspectorsWarrant,
  nightWatchman,
  parlourGuest,
  policeWhistle,
  seance,
  theParsonageSnug,
} from "../cards/fixtures/starterDeck.ts";
import { apprenticeFitter, boilerHand, brassCog } from "./fixtures/houseDeck.ts";
import { instanceId, orderedDeck } from "./fixtures/helpers.ts";

describe("Tutorial round 1 (design.md §13.2)", () => {
  it("matches every intermediate score in the beer-mat script", () => {
    // Player's forced draws (§13.2): opening hand, then Whistle draws Bramwell.
    const playerDeck = orderedDeck([
      constableOnTheBeat,
      nightWatchman,
      parlourGuest,
      policeWhistle,
      inspectorsWarrant,
      bramwell, // drawn by Police Whistle
      amateurSleuth,
      charlotte,
      seance,
      theParsonageSnug,
      hiawatha,
      emily,
    ]);
    // House forced plays for round 1 only; round 2/3 cards aren't needed here.
    const houseDeck = orderedDeck([apprenticeFitter, boilerHand, brassCog]);

    let state = createMatch(playerDeck, houseDeck, { seed: 1, shuffle: false, leader: "B" }); // B = the house

    // H1: Apprentice Fitter (2). "That's two points, there, on my side."
    state = playTurn(state, "B", instanceId("B", apprenticeFitter));
    expect(boardScore(state, "B")).toBe(2);

    // P1: Constable on the Beat (3). "Three beats two."
    state = playTurn(state, "A", instanceId("A", constableOnTheBeat));
    expect(boardScore(state, "A")).toBe(3);

    // H2: Boiler Hand (3). "Five to three."
    state = playTurn(state, "B", instanceId("B", boilerHand));
    expect(boardScore(state, "B")).toBe(5);

    // P2: Night Watchman (5). "Eight."
    state = playTurn(state, "A", instanceId("A", nightWatchman));
    expect(boardScore(state, "A")).toBe(8);

    // H3: Brass Cog (1, Persist). "One point" -> "Nine to six" once P3 lands.
    state = playTurn(state, "B", instanceId("B", brassCog));
    expect(boardScore(state, "B")).toBe(6);

    // P3: Police Whistle (1, On Play: Draw 1) -> draws Bramwell. "Nine to six."
    // This is A's 6th and final turn of the round, so playTurn also resolves
    // end-of-round cleanup before returning — the score is captured in
    // roundHistory below rather than read live off the (already-swept) board.
    state = playTurn(state, "A", instanceId("A", policeWhistle));
    expect(state.players.A.hand.some((c) => c.instanceId === instanceId("A", bramwell))).toBe(true);

    // Round end: "Round's yours." Player (A) took round 1, 9-6.
    expect(state.round).toBe(2);
    expect(state.roundHistory[0]).toMatchObject({ round: 1, scores: { A: 9, B: 6 }, winner: "A" });
    // "House leads, the first time" but lost round 1, so the house leads round 2.
    expect(state.leader).toBe("B");

    // Brass Cog Persists onto the round-2 board; everything else was swept.
    expect(state.players.B.board.map((b) => b.instanceId)).toEqual([instanceId("B", brassCog)]);
    const cogBc = state.players.B.board[0]!;
    expect(effectivePoints(state, "B", cogBc)).toBe(1);
    expect(state.players.A.board).toHaveLength(0);
  });
});
