// previewOnPlayTargets (plan step 2.1): the human match screen needs to know,
// before committing a play, which onPlay effects will need a target and what
// the legal candidates are — this mirrors resolveEffect's own pool-building.

import { describe, expect, it } from "vitest";

import { createMatch, playTurn, previewOnPlayTargets, type MatchState } from "../../../src/engine/matchEngine.ts";
import { instanceId, makeCard, orderedDeck } from "./fixtures/helpers.ts";

describe("previewOnPlayTargets (design.md §5.13)", () => {
  it("previews a flip step matching resolveEffect's own resolution, excluding Elusive and non-matching points", () => {
    const flipper = makeCard({
      name: "Flipper",
      points: 1,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "flip", target: { side: "opponent", filter: { maxPoints: 3 } } }] }],
    });
    const cheapTarget = makeCard({ name: "Cheap", points: 2 });
    const elusiveTarget = makeCard({ name: "Elusive One", points: 1, keywords: { elusive: true } });
    const filler = makeCard({ name: "B Filler", points: 1 });

    let state: MatchState = createMatch(orderedDeck([filler, flipper]), orderedDeck([cheapTarget, elusiveTarget]), {
      seed: 1,
      shuffle: false,
      leader: "B",
    });
    // B plays first (leader) so its cards land on the board before A previews.
    state = playTurn(state, "B", instanceId("B", cheapTarget));
    state = playTurn(state, "A", instanceId("A", filler));
    state = playTurn(state, "B", instanceId("B", elusiveTarget));

    const steps = previewOnPlayTargets(state, "A", flipper);
    expect(steps).toHaveLength(1);
    expect(steps[0]!.candidates.map((oc) => oc.bc.instanceId)).toEqual([instanceId("B", cheapTarget)]);

    const afterFlip = playTurn(state, "A", instanceId("A", flipper));
    const flipped = afterFlip.players.B.board.find((b) => b.instanceId === instanceId("B", cheapTarget));
    expect(flipped?.faceUp).toBe(false);
  });

  it("returns no steps for an ability with no target (e.g. plain Draw N)", () => {
    const drawer = makeCard({ name: "Drawer", points: 1, abilities: [{ trigger: "onPlay", effects: [{ effect: "draw", amount: 1 }] }] });
    const state: MatchState = createMatch(orderedDeck([drawer]), orderedDeck([makeCard({ name: "Filler", points: 1 })]), {
      seed: 1,
      shuffle: false,
      leader: "A",
    });
    expect(previewOnPlayTargets(state, "A", drawer)).toEqual([]);
  });
});
