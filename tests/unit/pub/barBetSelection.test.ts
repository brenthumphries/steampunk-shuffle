import { describe, expect, it } from "vitest";
import { EMPTY_STAKE_SELECTION, clearStakeSelection, selectStakeCard } from "../../../src/pub/barBetSelection.ts";

describe("bar bet stake selection state (bugfix cluster A)", () => {
  it("starts with nothing selected", () => {
    expect(EMPTY_STAKE_SELECTION.selectedCardId).toBeNull();
  });

  it("select → preview state", () => {
    const state = selectStakeCard("nells-basket");
    expect(state.selectedCardId).toBe("nells-basket");
  });

  it("select a different card → previous selection cleared", () => {
    const first = selectStakeCard("nells-basket");
    const second = selectStakeCard("the-photograph");
    expect(second.selectedCardId).toBe("the-photograph");
    expect(first.selectedCardId).toBe("nells-basket");
  });

  it("clearing returns to the empty state", () => {
    selectStakeCard("nells-basket");
    expect(clearStakeSelection()).toEqual(EMPTY_STAKE_SELECTION);
  });

  it("no stake is committed by selecting alone — selection is a plain data object with no side effects", () => {
    const state = selectStakeCard("nells-basket");
    expect(state).toEqual({ selectedCardId: "nells-basket" });
  });
});
