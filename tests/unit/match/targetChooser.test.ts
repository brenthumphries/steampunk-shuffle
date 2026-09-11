import { describe, expect, it } from "vitest";

import { buildTargetChooser } from "../../../src/match/targetChooser.ts";
import type { MatchState, OwnedBoardCard, Target } from "../../../src/engine/matchEngine.ts";

function oc(instanceId: string, points = 1): OwnedBoardCard {
  return {
    owner: "A",
    bc: {
      instanceId,
      card: { id: instanceId, rarity: "common", faces: [{ name: instanceId, type: "character", family: "neutral", points, flavor: "", artId: "" }] },
      faceIndex: 0,
      faceUp: true,
      bonusPoints: 0,
    },
  };
}

const emptyState = { players: { A: { board: [] }, B: { board: [] } } } as unknown as MatchState;

describe("buildTargetChooser", () => {
  it("returns the candidate matching the player's pick for each step, in order", () => {
    const chooser = buildTargetChooser(emptyState, [["x2"], ["y1"]]);
    const target: Target = { side: "opponent" };
    const first = chooser([oc("x1"), oc("x2")], { effect: "flip", target }, target);
    expect(first.map((c) => c.bc.instanceId)).toEqual(["x2"]);
    const second = chooser([oc("y1"), oc("y2")], { effect: "flip", target }, target);
    expect(second.map((c) => c.bc.instanceId)).toEqual(["y1"]);
  });

  it("falls back to the engine's default (highest points, then leftmost) when nothing was picked for a step", () => {
    const chooser = buildTargetChooser(emptyState, [undefined]);
    const target: Target = { side: "opponent", count: 1 };
    const result = chooser([oc("low", 1), oc("high", 5)], { effect: "flip", target }, target);
    expect(result[0]!.bc.instanceId).toBe("high");
  });

  it("falls back to the default when the recorded pick isn't among the actual candidates", () => {
    const chooser = buildTargetChooser(emptyState, [["not-there"]]);
    const target: Target = { side: "opponent", count: 1 };
    const result = chooser([oc("a", 3), oc("b", 1)], { effect: "flip", target }, target);
    expect(result[0]!.bc.instanceId).toBe("a");
  });
});
