// Tournament registry: entry rules, unlock thresholds, eligible fields
// (plan step 2.4, design.md §10).

import { describe, expect, it } from "vitest";

import type { Deck } from "../../../src/cards/cardTypes.ts";
import { starterDeck } from "../../../src/cards/data/decks/starterDeck.ts";
import { emily } from "../../../src/cards/data/families/rookery.ts";
import { OPPONENTS } from "../../../src/pub/opponents.ts";
import { TOURNAMENTS_BY_ID } from "../../../src/tournaments/tournaments.ts";

const knockout = TOURNAMENTS_BY_ID.get("tuesday-knockout")!;
const peelers = TOURNAMENTS_BY_ID.get("peelers-cup")!;
const reichenbach = TOURNAMENTS_BY_ID.get("reichenbach-open")!;
const invitational = TOURNAMENTS_BY_ID.get("birthday-invitational")!;

describe("isUnlocked", () => {
  it("The Tuesday Knockout is always open", () => {
    expect(knockout.isUnlocked(0, false)).toBe(true);
  });

  it("The Peelers' Cup unlocks after 5 wins", () => {
    expect(peelers.isUnlocked(4, false)).toBe(false);
    expect(peelers.isUnlocked(5, false)).toBe(true);
  });

  it("The Reichenbach Open unlocks after 20 wins", () => {
    expect(reichenbach.isUnlocked(19, false)).toBe(false);
    expect(reichenbach.isUnlocked(20, false)).toBe(true);
  });

  it("The Birthday Invitational unlocks only once triggered, regardless of wins", () => {
    expect(invitational.isUnlocked(1000, false)).toBe(false);
    expect(invitational.isUnlocked(0, true)).toBe(true);
  });
});

describe("checkEntryDeck", () => {
  it("The Tuesday Knockout and Birthday Invitational accept any deck", () => {
    expect(knockout.checkEntryDeck(starterDeck).valid).toBe(true);
    expect(invitational.checkEntryDeck(starterDeck).valid).toBe(true);
  });

  it("The Peelers' Cup caps printed points at 45 (starter deck is 37)", () => {
    expect(peelers.checkEntryDeck(starterDeck).valid).toBe(true);

    const overBudget: Deck = starterDeck.map((e) => ({ ...e, quantity: e.quantity * 2 }));
    const result = peelers.checkEntryDeck(overBudget);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/45/);
  });

  it("The Reichenbach Open needs at least 12 cards from a single family (starter deck's Yard count is 10)", () => {
    const result = reichenbach.checkEntryDeck(starterDeck);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/12/);

    const singleFamilyHeavy: Deck = [{ card: emily, quantity: 12 }];
    expect(reichenbach.checkEntryDeck(singleFamilyHeavy).valid).toBe(true);
  });
});

describe("eligiblePool", () => {
  it("The Tuesday Knockout and Peelers' Cup draw from Regulars + Seasoned (8 opponents)", () => {
    expect(knockout.eligiblePool(OPPONENTS)).toHaveLength(8);
    expect(peelers.eligiblePool(OPPONENTS)).toHaveLength(8);
  });

  it("The Reichenbach Open draws from Seasoned + Legends (10 opponents)", () => {
    expect(reichenbach.eligiblePool(OPPONENTS)).toHaveLength(10);
  });

  it("The Birthday Invitational draws from all six Legends + Sir Charles (7 opponents)", () => {
    const pool = invitational.eligiblePool(OPPONENTS);
    expect(pool).toHaveLength(7);
    expect(pool.some((o) => o.id === "sir-charles")).toBe(true);
    expect(pool.every((o) => o.tier === "legend" || o.id === "sir-charles")).toBe(true);
  });
});
