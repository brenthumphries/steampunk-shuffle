// Card ownership (plan step 4.0d, PT-1): starter deck + collection, with
// foil entries counting toward their base card.

import { describe, expect, it } from "vitest";

import { isOwned, ownedCopies } from "../../../src/decks/ownership.ts";
import { starterDeck } from "../../../src/cards/data/decks/starterDeck.ts";
import { foilId } from "../../../src/pub/tinkersBench.ts";

describe("ownedCopies", () => {
  it("counts a starter-deck card's fixed quantity with an empty collection", () => {
    const entry = starterDeck.find((e) => e.quantity === 2)!;
    expect(ownedCopies(entry.card.id, [])).toBe(entry.quantity);
  });

  it("returns 0 for a non-starter card with an empty collection", () => {
    expect(ownedCopies("difference-engine", [])).toBe(0);
    expect(isOwned("difference-engine", [])).toBe(false);
  });

  it("adds collection entries on top of a starter quantity", () => {
    const entry = starterDeck.find((e) => e.quantity === 1)!;
    expect(ownedCopies(entry.card.id, [entry.card.id])).toBe(entry.quantity + 1);
  });

  it("counts a collection-only card from its collection entries alone", () => {
    expect(ownedCopies("difference-engine", ["difference-engine", "difference-engine"])).toBe(2);
    expect(isOwned("difference-engine", ["difference-engine"])).toBe(true);
  });

  it("counts a foil entry toward its base card's total", () => {
    expect(ownedCopies("difference-engine", [foilId("difference-engine")])).toBe(1);
    expect(ownedCopies("difference-engine", ["difference-engine", foilId("difference-engine")])).toBe(2);
  });

  it("doesn't cross-count a different card's foil", () => {
    expect(ownedCopies("difference-engine", [foilId("brass-cog")])).toBe(0);
  });
});
