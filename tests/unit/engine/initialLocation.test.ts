// createMatch's `initialLocation` option: a tournament's "house Location"
// (seasonal-events-plan.md §2 rule 4) — placed in the shared slot before the
// first turn, replaceable like any other Location.

import { describe, expect, it } from "vitest";

import { theWitchingHour } from "../../../src/cards/data/nightfall.ts";
import { boardScore, createMatch, playTurn } from "../../../src/engine/matchEngine.ts";
import { instanceId, makeCard, orderedDeck } from "./fixtures/helpers.ts";

const hearth = makeCard({
  name: "House Hearth",
  type: "location",
  points: 0,
  abilities: [{ trigger: "continuous", effects: [{ effect: "buff", target: { side: "each" }, amount: 1 }] }],
});

describe("createMatch initialLocation", () => {
  it("leaves the shared slot empty by default", () => {
    const a = makeCard({ name: "A", points: 2 });
    const b = makeCard({ name: "B", points: 2 });
    const state = createMatch(orderedDeck([a]), orderedDeck([b]), { seed: 1, shuffle: false, leader: "A" });
    expect(state.location).toBeUndefined();
  });

  it("places the Location face-up in the shared slot before the first turn, owned by neither player", () => {
    const a = makeCard({ name: "A", points: 2 });
    const b = makeCard({ name: "B", points: 2 });
    const state = createMatch(orderedDeck([a]), orderedDeck([b]), { seed: 1, shuffle: false, leader: "A", initialLocation: hearth });
    expect(state.location?.card).toBe(hearth);
    expect(state.location?.faceUp).toBe(true);
    expect(state.location?.instanceId.startsWith("house:")).toBe(true);
    expect(state.players.A.deck.length + state.players.A.hand.length).toBe(1);
  });

  it("applies the Location's continuous effect from the very first play", () => {
    const a = makeCard({ name: "A", points: 2 });
    const b = makeCard({ name: "B", points: 2 });
    let state = createMatch(orderedDeck([a]), orderedDeck([b]), { seed: 1, shuffle: false, leader: "A", initialLocation: hearth });
    state = playTurn(state, "A", instanceId("A", a));
    expect(boardScore(state, "A")).toBe(3);
  });

  it("is replaced, not stacked, when a player plays their own Location, and goes to the neutral discard", () => {
    const rival = makeCard({ name: "Rival Room", type: "location", points: 0 });
    const b = makeCard({ name: "B", points: 2 });
    let state = createMatch(orderedDeck([rival]), orderedDeck([b]), { seed: 1, shuffle: false, leader: "A", initialLocation: hearth });
    state = playTurn(state, "A", instanceId("A", rival));
    expect(state.location?.card.id).toBe(rival.id);
    expect(state.neutralDiscard.map((c) => c.card.id)).toEqual([hearth.id]);
  });

  it("puts The Witching Hour in place, and at round end returns the two lowest-point face-up cards to their owners' hands", () => {
    const a = [makeCard({ name: "A high", points: 3 }), makeCard({ name: "A low", points: 1 }), makeCard({ name: "A mid", points: 2 })];
    const b = [makeCard({ name: "B mid", points: 2 }), makeCard({ name: "B high", points: 4 }), makeCard({ name: "B low", points: 1 })];
    let state = createMatch(orderedDeck(a), orderedDeck(b), { seed: 1, shuffle: false, leader: "A", initialLocation: theWitchingHour });
    expect(state.location?.card.id).toBe("the-witching-hour");

    for (let i = 0; i < 3; i++) {
      state = playTurn(state, "A", instanceId("A", a[i]!));
      state = playTurn(state, "B", instanceId("B", b[i]!));
    }

    expect(state.round).toBe(2);
    expect(state.players.A.hand.map((c) => c.card.id)).toEqual([a[1]!.id]);
    expect(state.players.B.hand.map((c) => c.card.id)).toEqual([b[2]!.id]);
    expect(state.location?.card.id).toBe("the-witching-hour"); // a Location stays through round ends
  });
});
