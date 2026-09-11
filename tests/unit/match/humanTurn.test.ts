import { describe, expect, it } from "vitest";

import { createMatch, playTurn, type MatchState } from "../../../src/engine/matchEngine.ts";
import { isReadyToConfirm, pendingStep, stagePlay, toChooserSelections, toggleTarget } from "../../../src/match/humanTurn.ts";
import { instanceId, makeCard, orderedDeck } from "../engine/fixtures/helpers.ts";

describe("stagePlay / pendingStep / toggleTarget (design.md §6.4)", () => {
  it("a card with no ability needs no steps and is immediately ready", () => {
    const plain = makeCard({ name: "Plain", points: 2 });
    const state = createMatch(orderedDeck([plain]), orderedDeck([makeCard({ name: "Filler", points: 1 })]), {
      seed: 1,
      shuffle: false,
      leader: "A",
    });
    const play = stagePlay(state, "A", instanceId("A", plain), plain);
    expect(play.steps).toEqual([]);
    expect(isReadyToConfirm(play)).toBe(true);
  });

  it("a single legal target auto-fills with no player choice needed", () => {
    const flipper = makeCard({
      name: "Flipper",
      points: 1,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "flip", target: { side: "opponent", filter: { maxPoints: 3 } } }] }],
    });
    const onlyTarget = makeCard({ name: "Only", points: 2 });
    const filler = makeCard({ name: "A Filler", points: 1 });

    let state: MatchState = createMatch(orderedDeck([filler, flipper]), orderedDeck([onlyTarget]), {
      seed: 1,
      shuffle: false,
      leader: "B",
    });
    state = playTurn(state, "B", instanceId("B", onlyTarget));
    state = playTurn(state, "A", instanceId("A", filler));

    const play = stagePlay(state, "A", instanceId("A", flipper), flipper);
    expect(play.steps).toHaveLength(1);
    expect(play.steps[0]!.needsChoice).toBe(false);
    expect(play.steps[0]!.selected).toEqual([instanceId("B", onlyTarget)]);
    expect(isReadyToConfirm(play)).toBe(true);
  });

  it("multiple legal targets require an explicit pick, and toggling fills it in", () => {
    const flipper = makeCard({
      name: "Flipper",
      points: 1,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "flip", target: { side: "opponent", filter: { maxPoints: 5 } } }] }],
    });
    const targetA = makeCard({ name: "Target A", points: 2 });
    const targetB = makeCard({ name: "Target B", points: 3 });
    const filler = makeCard({ name: "A Filler", points: 1 });

    let state: MatchState = createMatch(orderedDeck([filler, filler, flipper]), orderedDeck([targetA, targetB]), {
      seed: 1,
      shuffle: false,
      leader: "B",
    });
    state = playTurn(state, "B", instanceId("B", targetA));
    state = playTurn(state, "A", instanceId("A", filler));
    state = playTurn(state, "B", instanceId("B", targetB));

    let play = stagePlay(state, "A", instanceId("A", flipper), flipper);
    expect(play.steps[0]!.needsChoice).toBe(true);
    expect(isReadyToConfirm(play)).toBe(false);
    expect(pendingStep(play)?.step.candidates.map((c) => c.bc.instanceId)).toEqual([
      instanceId("B", targetA),
      instanceId("B", targetB),
    ]);

    play = toggleTarget(play, instanceId("B", targetA));
    expect(isReadyToConfirm(play)).toBe(true);
    expect(toChooserSelections(play)).toEqual([[instanceId("B", targetA)]]);

    // Tapping the same one again deselects it.
    play = toggleTarget(play, instanceId("B", targetA));
    expect(isReadyToConfirm(play)).toBe(false);
  });

  it("a highest-points filter never needs a player choice even with several candidates", () => {
    const scholar = makeCard({
      name: "Trader",
      points: 1,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "flip", target: { side: "opponent", filter: { highestPoints: true }, count: 1 } }] }],
    });
    const low = makeCard({ name: "Low", points: 1 });
    const high = makeCard({ name: "High", points: 4 });
    const filler = makeCard({ name: "A Filler", points: 1 });

    let state: MatchState = createMatch(orderedDeck([filler, filler, scholar]), orderedDeck([low, high]), {
      seed: 1,
      shuffle: false,
      leader: "B",
    });
    state = playTurn(state, "B", instanceId("B", low));
    state = playTurn(state, "A", instanceId("A", filler));
    state = playTurn(state, "B", instanceId("B", high));

    const play = stagePlay(state, "A", instanceId("A", scholar), scholar);
    expect(play.steps[0]!.needsChoice).toBe(false);
    expect(isReadyToConfirm(play)).toBe(true);
  });
});
