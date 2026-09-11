import { describe, expect, it } from "vitest";

import { validateDeck } from "../../../src/cards/deckValidator.ts";
import type { Deck } from "../../../src/cards/cardTypes.ts";
import { starterDeck, constableOnTheBeat } from "./fixtures/starterDeck.ts";
import { drJekyllMrHyde } from "./fixtures/legends.ts";

function cloneDeck(deck: Deck): Deck {
  return deck.map((entry) => ({ card: structuredClone(entry.card), quantity: entry.quantity }));
}

describe("validateDeck — legal fixtures", () => {
  it("accepts the starter deck: exactly 20 cards, 37 printed points", () => {
    expect(validateDeck(starterDeck)).toEqual({ valid: true, errors: [] });
  });
});

describe("validateDeck — illegal fixtures", () => {
  it("rejects a deck with fewer than 20 cards", () => {
    const deck = cloneDeck(starterDeck);
    deck[0]!.quantity = 1; // Constable on the Beat has 2 copies; drop to 19 total
    const result = validateDeck(deck);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("19 cards"))).toBe(true);
  });

  it("rejects a deck with more than 20 cards", () => {
    const deck = cloneDeck(starterDeck);
    deck[0]!.quantity = 3; // Constable on the Beat: 20 -> 21 cards, and over the 2-copy max
    const result = validateDeck(deck);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("21 cards"))).toBe(true);
  });

  it("rejects more than 2 copies of a non-legendary card", () => {
    const deck = cloneDeck(starterDeck);
    deck[0]!.quantity = 3; // Constable on the Beat
    const result = validateDeck(deck);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("constable-on-the-beat") && e.includes("3 times"))).toBe(true);
  });

  it("rejects more than 1 copy of a legendary card", () => {
    // Drop Constable on the Beat's 2 copies to make room for 2 copies of a
    // legendary, keeping the deck at exactly 20 cards so only the legendary
    // rule is under test.
    const deck = cloneDeck(starterDeck).filter((e) => e.card.id !== "constable-on-the-beat");
    deck.push({ card: structuredClone(drJekyllMrHyde), quantity: 2 });
    const result = validateDeck(deck);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("dr-jekyll-mr-hyde") && e.includes("legendary"))).toBe(true);
  });

  it("rejects a deck over the 60-point cap", () => {
    const deck = cloneDeck(starterDeck);
    for (const entry of deck) {
      entry.card.faces[0].points = 6; // every card maxed out, well past 60 total
    }
    const result = validateDeck(deck);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("must be at most 60"))).toBe(true);
  });

  it("rejects a deck containing an illegal card", () => {
    const deck = cloneDeck(starterDeck);
    deck[0]!.card.rarity = "mythic" as never;
    const result = validateDeck(deck);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("not a legal card"))).toBe(true);
  });

  it("rejects a duplicate entry for the same card id instead of a combined quantity", () => {
    const deck = cloneDeck(starterDeck);
    deck.push({ card: structuredClone(constableOnTheBeat), quantity: 1 });
    const result = validateDeck(deck);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("more than one deck entry"))).toBe(true);
  });
});
