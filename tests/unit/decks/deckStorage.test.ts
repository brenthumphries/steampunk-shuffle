// localStorage persistence for the 13 deck slots (plan step 2.2).

import { beforeEach, describe, expect, it } from "vitest";

import { addCopy, createEmptySlots, DECK_SLOT_COUNT } from "../../../src/decks/deckSlots.ts";
import { loadDeckSlotsState, saveDeckSlotsState } from "../../../src/decks/deckStorage.ts";
import { ALL_CARDS } from "../../../src/cards/data/index.ts";

beforeEach(() => {
  localStorage.clear();
});

describe("loadDeckSlotsState", () => {
  it("returns 13 empty slots and no selection when nothing is saved", () => {
    const state = loadDeckSlotsState();
    expect(state.slots).toHaveLength(DECK_SLOT_COUNT);
    expect(state.slots.every((s) => s.entries.length === 0)).toBe(true);
    expect(state.selectedIndex).toBeNull();
  });

  it("falls back to defaults on corrupt JSON rather than throwing", () => {
    localStorage.setItem("steampunk-shuffle:deck-slots", "{not json");
    const state = loadDeckSlotsState();
    expect(state.slots).toHaveLength(DECK_SLOT_COUNT);
    expect(state.selectedIndex).toBeNull();
  });

  it("falls back to defaults when the shape doesn't match (e.g. wrong slot count)", () => {
    localStorage.setItem("steampunk-shuffle:deck-slots", JSON.stringify({ slots: [], selectedIndex: 0 }));
    const state = loadDeckSlotsState();
    expect(state.slots).toHaveLength(DECK_SLOT_COUNT);
  });

  it("ignores an out-of-range selectedIndex", () => {
    const slots = createEmptySlots();
    localStorage.setItem("steampunk-shuffle:deck-slots", JSON.stringify({ slots, selectedIndex: 99 }));
    const state = loadDeckSlotsState();
    expect(state.selectedIndex).toBeNull();
  });
});

describe("saveDeckSlotsState / loadDeckSlotsState round trip", () => {
  it("persists edited slots and a selection", () => {
    const slots = createEmptySlots();
    slots[0] = addCopy(slots[0]!, ALL_CARDS[0]!);
    saveDeckSlotsState({ slots, selectedIndex: 0 });

    const reloaded = loadDeckSlotsState();
    expect(reloaded.selectedIndex).toBe(0);
    expect(reloaded.slots[0]!.entries).toEqual([{ cardId: ALL_CARDS[0]!.id, quantity: 1 }]);
  });
});
