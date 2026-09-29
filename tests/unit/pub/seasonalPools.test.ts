// Seasonal card pools in Lost & Found and the Pawnbroker, and the
// permanence of ownership (seasonal-events-plan.md §2 rule 3, §5).

import { describe, expect, it } from "vitest";

import { EVENT_CARDS, EVENT_CARDS_BY_ID } from "../../../src/cards/data/eventCards.ts";
import { builderCards } from "../../../src/decks/cardCatalog.ts";
import { ownedCopies } from "../../../src/decks/ownership.ts";
import { HALLOWEEN } from "../../../src/events/seasonalEvents.ts";
import { ACQUIRABLE_CARDS_BY_ID, acquirablePoolFor, NON_LEGENDARY_ACQUIRABLE_CARDS } from "../../../src/pub/acquirableCards.ts";
import { rollLostAndFound } from "../../../src/pub/lostAndFound.ts";
import { pawnbrokerWindow } from "../../../src/pub/pawnbroker.ts";
import { addToPawnedCards, defaultPubState } from "../../../src/pub/pubState.ts";

const SEP_30 = new Date(2026, 8, 30);
const OCT_15 = new Date(2026, 9, 15);
const NOV_1 = new Date(2026, 10, 1);
const EVENT_IDS = new Set(EVENT_CARDS.map((c) => c.id));
const SEASONAL_POOL_IDS = new Set(HALLOWEEN.cardPool);

describe("acquirablePoolFor", () => {
  it("is exactly the year-round pool outside an event", () => {
    expect(acquirablePoolFor(SEP_30)).toBe(NON_LEGENDARY_ACQUIRABLE_CARDS);
    expect(acquirablePoolFor(NOV_1)).toBe(NON_LEGENDARY_ACQUIRABLE_CARDS);
  });

  it("adds the event's card pool while it's live", () => {
    const ids = new Set(acquirablePoolFor(OCT_15).map((c) => c.id));
    for (const id of HALLOWEEN.cardPool) expect(ids.has(id), id).toBe(true);
    for (const card of NON_LEGENDARY_ACQUIRABLE_CARDS) expect(ids.has(card.id)).toBe(true);
  });

  it("includes all eight Nightfall cards while live", () => {
    const ids = new Set(acquirablePoolFor(OCT_15).map((c) => c.id));
    for (const id of ["turnip-lantern", "resurrection-man", "spirit-photograph", "the-witching-hour", "grave-robber", "night-constable", "lamplighter-at-dusk", "galvanic-battery"]) {
      expect(ids.has(id), id).toBe(true);
    }
  });

  it("never rolls a legendary, even one an event lists, and skips ids that aren't authored yet", () => {
    const original = HALLOWEEN.cardPool;
    try {
      HALLOWEEN.cardPool = [...original, "mr-griffin", "not-a-card-yet"];
      const pool = acquirablePoolFor(OCT_15);
      expect(pool.some((c) => c.id === "mr-griffin")).toBe(false);
      expect(pool.some((c) => c.id === "not-a-card-yet")).toBe(false);
      expect(pool.some((c) => c.id === "turnip-lantern")).toBe(true);
    } finally {
      HALLOWEEN.cardPool = original;
    }
  });
});

describe("Lost & Found across the window", () => {
  it("can roll a Nightfall card in October, in any year", () => {
    let rolled = 0;
    for (let year = 2026; year < 2062; year++) {
      for (let day = 1; day <= 31; day++) {
        if (SEASONAL_POOL_IDS.has(rollLostAndFound([], new Date(year, 9, day)).id)) rolled++;
      }
    }
    expect(rolled).toBeGreaterThan(0);
  });

  it("never rolls an event card outside October", () => {
    for (let year = 2026; year < 2032; year++) {
      for (let month = 0; month < 12; month++) {
        if (month === 9) continue;
        for (let day = 1; day <= 28; day++) {
          const card = rollLostAndFound([], new Date(year, month, day));
          expect(EVENT_IDS.has(card.id), `${year}-${month + 1}-${day}: ${card.id}`).toBe(false);
        }
      }
    }
  });

  it("never rolls a legendary in October either", () => {
    for (let day = 1; day <= 31; day++) {
      expect(rollLostAndFound([], new Date(2026, 9, day)).rarity).not.toBe("legendary");
    }
  });
});

describe("Pawnbroker across the window", () => {
  it("can stock a Nightfall card in October, in any year", () => {
    let stocked = 0;
    for (let year = 2026; year < 2062; year++) {
      for (let day = 1; day <= 31; day++) {
        stocked += pawnbrokerWindow(defaultPubState(), new Date(year, 9, day)).filter((s) => SEASONAL_POOL_IDS.has(s.card.id)).length;
      }
    }
    expect(stocked).toBeGreaterThan(0);
  });

  it("never stocks an event card at random outside October", () => {
    for (let year = 2026; year < 2032; year++) {
      for (let month = 0; month < 12; month++) {
        if (month === 9) continue;
        for (let day = 1; day <= 28; day++) {
          const window = pawnbrokerWindow(defaultPubState(), new Date(year, month, day));
          for (const slot of window) expect(EVENT_IDS.has(slot.card.id), `${year}-${month + 1}-${day}`).toBe(false);
        }
      }
    }
  });

  it("still offers an event card the player lost in a Bar Bet, at any time of year", () => {
    const pawned = addToPawnedCards(defaultPubState(), "turnip-lantern");
    for (const date of [SEP_30, OCT_15, NOV_1, new Date(2027, 3, 12)]) {
      const window = pawnbrokerWindow(pawned, date);
      expect(window[0]?.card.id).toBe("turnip-lantern");
      expect(window[0]?.isPawned).toBe(true);
    }
  });
});

describe("ownership is permanent", () => {
  it("resolves every event card by id all year, so a collection entry always renders", () => {
    for (const card of EVENT_CARDS) expect(ACQUIRABLE_CARDS_BY_ID.get(card.id)).toBe(card);
  });

  it("counts an owned event card the same on Nov 1 as on Oct 15 (no date is involved)", () => {
    expect(ownedCopies("turnip-lantern", ["turnip-lantern"])).toBe(1);
  });

  it("gives an owned event card a deck-builder tile, and an unowned one none", () => {
    expect(builderCards([]).some((c) => c.id === "turnip-lantern")).toBe(false);
    expect(builderCards(["turnip-lantern"]).some((c) => c.id === "turnip-lantern")).toBe(true);
    expect(builderCards(["foil:turnip-lantern"]).some((c) => c.id === "turnip-lantern")).toBe(true);
  });

  it("keeps the labeled 60 first and unconditionally in the builder", () => {
    const cards = builderCards([]);
    expect(cards).toHaveLength(60);
    expect(cards.every((c) => !EVENT_IDS.has(c.id))).toBe(true);
  });

  it("registers every event card with a unique id, absent from the labeled 60", () => {
    expect(new Set(EVENT_CARDS.map((c) => c.id)).size).toBe(EVENT_CARDS.length);
    expect(EVENT_CARDS_BY_ID.size).toBe(EVENT_CARDS.length);
  });
});
