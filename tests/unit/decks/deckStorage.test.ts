// localStorage persistence for the 13 deck slots (plan step 2.2).

import { beforeEach, describe, expect, it } from "vitest";

import { addCopy, createEmptySlots, DECK_SLOT_COUNT, loadDeckInto, renameSlot } from "../../../src/decks/deckSlots.ts";
import { loadDeckSlotsState, saveDeckSlotsState, seedStarterDeckIfMissing } from "../../../src/decks/deckStorage.ts";
import { ALL_CARDS } from "../../../src/cards/data/index.ts";
import { starterDeck } from "../../../src/cards/data/decks/starterDeck.ts";
import type { Card } from "../../../src/cards/cardTypes.ts";

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

describe("seedStarterDeckIfMissing (PT-4)", () => {
  const cardsById = new Map<string, Card>(ALL_CARDS.map((c) => [c.id, c]));

  it("seeds slot 1 with the starter composition, named and selected, when no slot is legal", () => {
    const state = { slots: createEmptySlots(), selectedIndex: null };
    const next = seedStarterDeckIfMissing(state, starterDeck, cardsById);

    expect(next.selectedIndex).toBe(0);
    expect(next.slots[0]!.name).toBe("The Village Constable");
    expect(next.slots[0]!.entries).toEqual(starterDeck.map((e) => ({ cardId: e.card.id, quantity: e.quantity })));
    // Every other slot is untouched.
    for (let i = 1; i < next.slots.length; i++) {
      expect(next.slots[i]).toEqual(state.slots[i]);
    }
  });

  it("does nothing once any slot is already legal", () => {
    const slots = createEmptySlots();
    slots[3] = renameSlot(loadDeckInto(slots[3]!, starterDeck), "My Deck");
    const state = { slots, selectedIndex: 3 };

    const next = seedStarterDeckIfMissing(state, starterDeck, cardsById);
    expect(next).toBe(state); // no-op, same reference
  });

  it("does nothing if slot 1 already has cards in it, even with no legal slot elsewhere", () => {
    const slots = createEmptySlots();
    slots[0] = addCopy(slots[0]!, ALL_CARDS[0]!); // one card, not a legal 20-card deck
    const state = { slots, selectedIndex: null };

    const next = seedStarterDeckIfMissing(state, starterDeck, cardsById);
    expect(next).toBe(state); // refuses to clobber a slot the player's touched
  });
});
