// Validates the whole v1 content module (plan step 1.5): every card in
// src/cards/data/ passes validateCard, every authored deck passes
// validateDeck, ids are unique, and the composition matches design.md §8.1.

import { describe, expect, it } from "vitest";

import { validateCard } from "../../../src/cards/cardValidator.ts";
import { validateDeck } from "../../../src/cards/deckValidator.ts";
import { ALL_CARDS } from "../../../src/cards/data/index.ts";
import { KNOWN_DECKS } from "../../../src/cards/data/decks/index.ts";

describe("v1 card set (design.md §8.1)", () => {
  it("has exactly 60 cards", () => {
    expect(ALL_CARDS).toHaveLength(60);
  });

  it("every card has a unique id", () => {
    const ids = ALL_CARDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(ALL_CARDS.map((card) => [card.faces[0]!.name, card] as const))("%s passes validateCard", (_name, card) => {
    const result = validateCard(card);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it("has 6 legendary signature/Landlady cards", () => {
    expect(ALL_CARDS.filter((c) => c.rarity === "legendary")).toHaveLength(7);
  });

  it("has 8 Locations, split 4 uncommon / 4 rare", () => {
    const locations = ALL_CARDS.filter((c) => c.faces[0]!.type === "location");
    expect(locations).toHaveLength(8);
    expect(locations.filter((c) => c.rarity === "uncommon")).toHaveLength(4);
    expect(locations.filter((c) => c.rarity === "rare")).toHaveLength(4);
  });
});

describe("authored decks (plan step 1.5)", () => {
  it.each(KNOWN_DECKS.map(({ name, deck }) => [name, deck] as const))("%s is a legal deck", (_name, deck) => {
    const result = validateDeck(deck);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });
});
