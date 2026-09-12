// The Pawnbroker's window (plan step 2.5, design.md §11.4).

import { describe, expect, it } from "vitest";

import { buyFromPawnbroker, canAfford, PAWNBROKER_PRICES, PAWNBROKER_WINDOW_SIZE, pawnbrokerWindow } from "../../../src/pub/pawnbroker.ts";
import { defaultPubState, type PubState } from "../../../src/pub/pubState.ts";

const DAY_1 = new Date(2026, 8, 11, 20, 0, 0);
const DAY_1_LATER = new Date(2026, 8, 11, 23, 0, 0);
const DAY_2 = new Date(2026, 8, 12, 9, 0, 0);

describe("pawnbrokerWindow", () => {
  it("shows exactly three distinct, non-legendary cards with rarity-matched prices", () => {
    const slots = pawnbrokerWindow(defaultPubState(), DAY_1);
    expect(slots).toHaveLength(PAWNBROKER_WINDOW_SIZE);
    expect(new Set(slots.map((s) => s.card.id)).size).toBe(PAWNBROKER_WINDOW_SIZE);
    for (const slot of slots) {
      expect(slot.card.rarity).not.toBe("legendary");
      expect(slot.price).toBe(PAWNBROKER_PRICES[slot.card.rarity as "common" | "uncommon" | "rare"]);
      expect(slot.isPawned).toBe(false);
    }
  });

  it("is deterministic for the same real-world day", () => {
    const a = pawnbrokerWindow(defaultPubState(), DAY_1).map((s) => s.card.id);
    const b = pawnbrokerWindow(defaultPubState(), DAY_1_LATER).map((s) => s.card.id);
    expect(a).toEqual(b);
  });

  it("shows pawned cards first, ahead of the random rotation", () => {
    const state: PubState = { ...defaultPubState(), pawnedCards: ["charlotte"] };
    const slots = pawnbrokerWindow(state, DAY_1);
    expect(slots[0]!.card.id).toBe("charlotte");
    expect(slots[0]!.isPawned).toBe(true);
    expect(slots[0]!.price).toBe(PAWNBROKER_PRICES.uncommon);
  });

  it("fills every slot from pawnedCards when there are three or more", () => {
    const state: PubState = { ...defaultPubState(), pawnedCards: ["charlotte", "banshee", "cracksman", "seance"] };
    const slots = pawnbrokerWindow(state, DAY_1);
    expect(slots).toHaveLength(PAWNBROKER_WINDOW_SIZE);
    expect(slots.every((s) => s.isPawned)).toBe(true);
  });
});

describe("canAfford / buyFromPawnbroker", () => {
  it("reports affordability against the player's Checks", () => {
    const state: PubState = { ...defaultPubState(), checks: 20 };
    expect(canAfford(state, 15)).toBe(true);
    expect(canAfford(state, 35)).toBe(false);
  });

  it("deducts Checks and adds the card to the collection", () => {
    const state: PubState = { ...defaultPubState(), checks: 50 };
    const next = buyFromPawnbroker(state, "charlotte", 35, DAY_1);
    expect(next.checks).toBe(15);
    expect(next.collection).toEqual(["charlotte"]);
  });

  it("clears the card from pawnedCards when buying back a pawned card", () => {
    const state: PubState = { ...defaultPubState(), checks: 50, pawnedCards: ["charlotte", "banshee"] };
    const next = buyFromPawnbroker(state, "charlotte", 35, DAY_1);
    expect(next.pawnedCards).toEqual(["banshee"]);
  });

  it("swaps a bought rotation card out for a different one, rather than letting it be bought again the same day", () => {
    const state = defaultPubState();
    const [firstSlot] = pawnbrokerWindow(state, DAY_1);
    const afterBuy = buyFromPawnbroker({ ...state, checks: 1000 }, firstSlot!.card.id, firstSlot!.price, DAY_1);
    const windowAfter = pawnbrokerWindow(afterBuy, DAY_1_LATER);
    expect(windowAfter).toHaveLength(PAWNBROKER_WINDOW_SIZE);
    expect(windowAfter.map((s) => s.card.id)).not.toContain(firstSlot!.card.id);
  });

  it("restocks a bought rotation card on the next real-world day", () => {
    const state = defaultPubState();
    const [firstSlot] = pawnbrokerWindow(state, DAY_1);
    const afterBuy = buyFromPawnbroker({ ...state, checks: 1000 }, firstSlot!.card.id, firstSlot!.price, DAY_1);
    const windowNextDay = pawnbrokerWindow(afterBuy, DAY_2);
    expect(windowNextDay).toHaveLength(PAWNBROKER_WINDOW_SIZE);
  });
});
