// The Almanack Stakes (November, docs/plans/monthly/01-november.md §5): the
// Cunning Folk's tournament. Nov 20-30 after 3 wins, Mother Shipton, Dr John
// Dee and Mother Red Cap always seated with four Seasoned, every match
// starting with The Petrifying Well, and a 2-Coven entry rule.

import { describe, expect, it } from "vitest";

import { starterDeck } from "../../../src/cards/data/decks/starterDeck.ts";
import { deesDeck, shiptonsDeck, redCapsDeck } from "../../../src/cards/data/decks/index.ts";
import { createBracket } from "../../../src/tournaments/bracket.ts";
import { resolveHouseLocation } from "../../../src/tournaments/houseLocation.ts";
import { ALMANACK_STAKES_FIELD_IDS, isTournamentListed, TOURNAMENTS, TOURNAMENTS_BY_ID } from "../../../src/tournaments/tournaments.ts";
import { OPPONENTS, OPPONENTS_BY_ID, tonightsPatrons } from "../../../src/pub/opponents.ts";
import { ACQUIRABLE_CARDS_BY_ID } from "../../../src/pub/acquirableCards.ts";
import { CUNNING_FOLK } from "../../../src/events/packs/cunningFolk.ts";
import type { Deck } from "../../../src/cards/cardTypes.ts";
import { hedgeWitch, cunningWoman } from "../../../src/cards/data/families/coven.ts";
import { ALL_CARDS } from "../../../src/cards/data/index.ts";

const stakes = TOURNAMENTS_BY_ID.get("almanack-stakes")!;
const day = (month: number, date: number) => new Date(2026, month - 1, date);

describe("registry", () => {
  it("is registered inside the Cunning Folk event, and only there", () => {
    expect(stakes).toBeDefined();
    expect(stakes.eventId).toBe(CUNNING_FOLK.id);
    expect(CUNNING_FOLK.tournaments).toContain(stakes.id);
    expect(TOURNAMENTS.filter((t) => t.eventId === CUNNING_FOLK.id)).toEqual([stakes]);
  });

  it("has the economy in the plan: 13 to enter, 13 consolation, 150 Checks + Mother Red Cap", () => {
    expect(stakes.entryChecks).toBe(13);
    expect(stakes.consolationChecks).toBe(13);
    expect(stakes.prizeChecks).toBe(150);
    expect(stakes.prizeCard).toEqual({ kind: "fixed", cardId: "mother-red-cap" });
    expect(ACQUIRABLE_CARDS_BY_ID.get("mother-red-cap")?.rarity).toBe("legendary");
  });
});

describe("unlock window (Nov 20 - Nov 30, 3+ wins)", () => {
  it("is locked on Nov 19, open Nov 20 through Nov 30, and locked again on Dec 1", () => {
    expect(stakes.isUnlocked(3, false, day(11, 19))).toBe(false);
    expect(stakes.isUnlocked(3, false, day(11, 20))).toBe(true);
    expect(stakes.isUnlocked(3, false, day(11, 30))).toBe(true);
    expect(stakes.isUnlocked(3, false, day(12, 1))).toBe(false);
  });

  it("needs 3 wins even inside the window", () => {
    expect(stakes.isUnlocked(2, false, day(11, 25))).toBe(false);
    expect(stakes.isUnlocked(3, false, day(11, 25))).toBe(true);
  });

  it("is listed from Nov 20 (not Nov 19: a Locked row would spoil the prize, PT-46) and not after Nov 30", () => {
    expect(isTournamentListed(stakes, false, day(11, 19), false)).toBe(false);
    expect(isTournamentListed(stakes, false, day(11, 20), false)).toBe(true);
    expect(isTournamentListed(stakes, false, day(12, 1), false)).toBe(false);
    expect(isTournamentListed(stakes, false, day(12, 1), true)).toBe(true);
  });
});

describe("entry rule", () => {
  it("refuses a deck with one Coven card, with the exact reason", () => {
    const oneCoven: Deck = [
      { card: hedgeWitch, quantity: 1 },
      { card: starterDeck[0]!.card, quantity: 19 },
    ];
    const result = stakes.checkEntryDeck(oneCoven);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("The Almanack Stakes needs at least 2 Coven cards in the deck.");
  });

  it("admits a deck with two Coven cards, whether in one card or split across two", () => {
    expect(stakes.checkEntryDeck([{ card: hedgeWitch, quantity: 2 }, { card: starterDeck[0]!.card, quantity: 18 }]).valid).toBe(true);
    expect(stakes.checkEntryDeck([{ card: hedgeWitch, quantity: 1 }, { card: cunningWoman, quantity: 1 }, { card: starterDeck[0]!.card, quantity: 18 }]).valid).toBe(true);
  });

  it("refuses a deck with no Coven cards at all", () => {
    expect(stakes.checkEntryDeck(starterDeck).valid).toBe(false);
  });

  it("counts Coven cards by family, not by name, so a visitor's own deck qualifies", () => {
    expect(stakes.checkEntryDeck(shiptonsDeck).valid).toBe(true);
    expect(stakes.checkEntryDeck(deesDeck).valid).toBe(true);
    expect(stakes.checkEntryDeck(redCapsDeck).valid).toBe(true);
  });
});

describe("house Location and field", () => {
  it("starts every match with The Petrifying Well", () => {
    expect(resolveHouseLocation(stakes)?.id).toBe("the-petrifying-well");
  });

  it("seats Mother Shipton, Dr John Dee and Mother Red Cap, and draws four Seasoned around them", () => {
    expect([...ALMANACK_STAKES_FIELD_IDS].sort()).toEqual(["john-dee", "mother-red-cap", "mother-shipton"]);
    const pool = stakes.eligiblePool(OPPONENTS);
    expect(pool).toHaveLength(7);
    expect(pool.filter((o) => o.tier === "seasoned")).toHaveLength(4);
    const fixed = stakes.fixedSeats!(pool).map((o) => o.id).sort();
    expect(fixed).toEqual(["john-dee", "mother-red-cap", "mother-shipton"]);
  });

  it("builds a full bracket from that pool, with the three fixed seats in it", () => {
    const pool = stakes.eligiblePool(OPPONENTS);
    const bracket = createBracket(stakes, pool, 7);
    const ids = JSON.stringify(bracket);
    for (const id of ALMANACK_STAKES_FIELD_IDS) expect(ids.includes(`"${id}"`), id).toBe(true);
  });

  it("keeps Mother Red Cap out of every other tournament's field and out of Tonight's Patrons", () => {
    for (const tournament of TOURNAMENTS) {
      if (tournament.id === stakes.id) continue;
      expect(tournament.eligiblePool(OPPONENTS).some((o) => o.id === "mother-red-cap"), tournament.id).toBe(false);
    }
    for (const d of [day(11, 20), day(11, 30)]) expect(tonightsPatrons(40, d).some((o) => o.id === "mother-red-cap")).toBe(false);
  });

  it("gives the boss the legend dial, tournament-only, and no first-win reward of her own", () => {
    const red = OPPONENTS_BY_ID.get("mother-red-cap")!;
    expect(red.difficulty).toBe("legend");
    expect(red.tournamentOnly).toBe(true);
    expect(red.rewardCardId).toBeNull();
  });
});

describe("the Cunning Folk decks", () => {
  it.each([
    ["Mother Shipton", shiptonsDeck],
    ["Dr John Dee", deesDeck],
    ["Mother Red Cap", redCapsDeck],
  ])("%s's deck is 20 cards with exactly one legendary", (_name, deck) => {
    const total = deck.reduce((sum, e) => sum + e.quantity, 0);
    expect(total).toBe(20);
    expect(deck.filter((e) => e.card.rarity === "legendary").reduce((sum, e) => sum + e.quantity, 0)).toBe(1);
  });

  it("gives every Cunning Folk opponent a signature card of the same id", () => {
    for (const id of ["mother-shipton", "john-dee"]) {
      expect(OPPONENTS_BY_ID.get(id)?.rewardCardId).toBe(id);
      expect(ALL_CARDS.some((c) => c.id === id)).toBe(false);
      expect(ACQUIRABLE_CARDS_BY_ID.get(id)?.rarity).toBe("legendary");
    }
  });
});
