import { describe, expect, it } from "vitest";

import { abilityLines, describeAutoTarget, effectPromptLabel, keywordChips } from "../../../src/ui/cardText.ts";
import type { CardFace } from "../../../src/cards/cardTypes.ts";

function face(partial: Partial<CardFace>): CardFace {
  return { name: "Test", type: "character", family: "neutral", points: 1, flavor: "", artId: "", ...partial };
}

describe("keywordChips", () => {
  it("lists only the keywords present, Friend with its amount", () => {
    expect(keywordChips(face({ keywords: { persist: true, friend: 2 } }))).toEqual(["Persist", "Friend +2"]);
    expect(keywordChips(face({}))).toEqual([]);
  });
});

describe("abilityLines", () => {
  it("renders an On Play flip with a points filter", () => {
    const f = face({
      abilities: [{ trigger: "onPlay", effects: [{ effect: "flip", target: { side: "opponent", filter: { maxPoints: 3 } } }] }],
    });
    expect(abilityLines(f)).toEqual(["On Play: Flip an opposing card worth 3 or less."]);
  });

  it("renders a plain Draw N with no target", () => {
    const f = face({ abilities: [{ trigger: "onPlay", effects: [{ effect: "draw", amount: 1 }] }] });
    expect(abilityLines(f)).toEqual(["On Play: Draw 1."]);
  });

  it("omits the trigger label for a continuous ability", () => {
    const f = face({
      abilities: [{ trigger: "continuous", effects: [{ effect: "buff", target: { side: "each", filter: {} }, amount: 1 }] }],
    });
    expect(abilityLines(f)).toEqual(["Give each card +1."]);
  });
});

describe("effectPromptLabel", () => {
  it("labels a flip prompt", () => {
    const target = { side: "opponent" as const };
    expect(effectPromptLabel({ effect: "flip", target })).toBe("Choose a card to Flip");
  });
});

describe("describeAutoTarget (PT-12)", () => {
  const target = { side: "opponent" as const };

  it("says there's no legal target when the candidate list is empty", () => {
    expect(describeAutoTarget({ effect: "flip", target }, [])).toBe("No legal target — it does nothing.");
  });

  it("names a single auto-chosen target per effect kind", () => {
    expect(describeAutoTarget({ effect: "flip", target }, ["Charlotte"])).toBe("Flips Charlotte.");
    expect(describeAutoTarget({ effect: "unflip", target }, ["Charlotte"])).toBe("Turns Charlotte face-up.");
    expect(describeAutoTarget({ effect: "return", target }, ["Charlotte"])).toBe("Returns Charlotte to hand.");
    expect(describeAutoTarget({ effect: "buff", target, amount: 2 }, ["Charlotte"])).toBe("Gives Charlotte +2.");
  });

  it("joins two or more names with 'and'", () => {
    expect(describeAutoTarget({ effect: "flip", target }, ["Charlotte", "Brass Cog"])).toBe("Flips Charlotte and Brass Cog.");
    expect(describeAutoTarget({ effect: "flip", target }, ["A", "B", "C"])).toBe("Flips A, B and C.");
  });
});
