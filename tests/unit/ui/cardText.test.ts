import { describe, expect, it } from "vitest";

import { abilityLines, effectPromptLabel, keywordChips } from "../../../src/ui/cardText.ts";
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
