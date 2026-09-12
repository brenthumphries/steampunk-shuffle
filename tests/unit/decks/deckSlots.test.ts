// Pure deck-slot editing logic (plan step 2.2, design.md §7.2).

import { describe, expect, it } from "vitest";

import type { Card } from "../../../src/cards/cardTypes.ts";
import { ALL_CARDS } from "../../../src/cards/data/index.ts";
import { starterDeck } from "../../../src/cards/data/decks/starterDeck.ts";
import {
  addCopy,
  computeLegality,
  createEmptySlot,
  createEmptySlots,
  DECK_SLOT_COUNT,
  loadDeckInto,
  quantityInSlot,
  removeCopy,
  renameSlot,
  slotToDeck,
  slotTotalCards,
} from "../../../src/decks/deckSlots.ts";

const cardsById = new Map<string, Card>(ALL_CARDS.map((c) => [c.id, c]));
const constable = cardsById.get("constable-on-the-beat")!; // common, family card
const holmes = cardsById.get("sherlock-holmes")!; // legendary

describe("createEmptySlots", () => {
  it("creates 13 empty, distinctly-named slots", () => {
    const slots = createEmptySlots();
    expect(slots).toHaveLength(DECK_SLOT_COUNT);
    expect(new Set(slots.map((s) => s.name)).size).toBe(DECK_SLOT_COUNT);
    expect(slots.every((s) => s.entries.length === 0)).toBe(true);
  });
});

describe("addCopy / removeCopy", () => {
  it("adds a first and second copy of a common card", () => {
    let slot = createEmptySlot(0);
    slot = addCopy(slot, constable);
    expect(quantityInSlot(slot, constable.id)).toBe(1);
    slot = addCopy(slot, constable);
    expect(quantityInSlot(slot, constable.id)).toBe(2);
  });

  it("refuses a third copy of a non-legendary card (design.md §7.2 max 2 copies)", () => {
    let slot = createEmptySlot(0);
    slot = addCopy(slot, constable);
    slot = addCopy(slot, constable);
    slot = addCopy(slot, constable);
    expect(quantityInSlot(slot, constable.id)).toBe(2);
  });

  it("refuses a second copy of a legendary card (design.md §7.2 max 1 legendary)", () => {
    let slot = createEmptySlot(0);
    slot = addCopy(slot, holmes);
    slot = addCopy(slot, holmes);
    expect(quantityInSlot(slot, holmes.id)).toBe(1);
  });

  it("refuses to add past 20 total cards", () => {
    let slot = loadDeckInto(createEmptySlot(0), starterDeck);
    expect(slotTotalCards(slot)).toBe(20);
    const before = slotTotalCards(slot);
    slot = addCopy(slot, cardsById.get("banshee")!);
    expect(slotTotalCards(slot)).toBe(before);
  });

  it("removeCopy decrements, then drops the entry at zero", () => {
    let slot = createEmptySlot(0);
    slot = addCopy(slot, constable);
    slot = addCopy(slot, constable);
    slot = removeCopy(slot, constable.id);
    expect(quantityInSlot(slot, constable.id)).toBe(1);
    slot = removeCopy(slot, constable.id);
    expect(quantityInSlot(slot, constable.id)).toBe(0);
    expect(slot.entries.some((e) => e.cardId === constable.id)).toBe(false);
  });

  it("removeCopy on a card not in the deck is a no-op", () => {
    const slot = createEmptySlot(0);
    expect(removeCopy(slot, constable.id)).toEqual(slot);
  });
});

describe("renameSlot", () => {
  it("changes only the name", () => {
    const slot = addCopy(createEmptySlot(0), constable);
    const renamed = renameSlot(slot, "My Deck");
    expect(renamed.name).toBe("My Deck");
    expect(renamed.entries).toEqual(slot.entries);
  });
});

describe("loadDeckInto", () => {
  it("overwrites entries with another deck's composition", () => {
    const slot = loadDeckInto(createEmptySlot(0), starterDeck);
    const resolved = slotToDeck(slot, cardsById);
    expect(resolved).toHaveLength(starterDeck.length);
    expect(slotTotalCards(slot)).toBe(20);
  });
});

describe("slotToDeck", () => {
  it("drops entries whose card id no longer exists", () => {
    const slot = { name: "x", entries: [{ cardId: "not-a-real-card", quantity: 2 }, { cardId: constable.id, quantity: 1 }] };
    const deck = slotToDeck(slot, cardsById);
    expect(deck).toEqual([{ card: constable, quantity: 1 }]);
  });
});

describe("computeLegality", () => {
  it("reports the starter deck as legal (golden fixture, design.md §8.3)", () => {
    const slot = loadDeckInto(createEmptySlot(0), starterDeck);
    const legality = computeLegality(slot, cardsById);
    expect(legality.valid).toBe(true);
    expect(legality.errors).toEqual([]);
    expect(legality.totalCards).toBe(20);
    expect(legality.totalPoints).toBe(37);
  });

  it("reports why an empty slot is illegal", () => {
    const legality = computeLegality(createEmptySlot(0), cardsById);
    expect(legality.valid).toBe(false);
    expect(legality.totalCards).toBe(0);
    expect(legality.errors.some((e) => e.includes("must have exactly 20"))).toBe(true);
  });
});
