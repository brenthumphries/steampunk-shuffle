// The public-build fallback rule (design.md §17.5, a general rule): a
// giftOnly boss is replaced by a random eligible Seasoned, and a giftOnly
// prize card pays the event's first visitor's signature card if the player
// doesn't own it, else 300 Checks. Exercised with a test-only tournament and
// event now; the Meridian Cup gets the same test once January's content lands.

import { afterEach, describe, expect, it, vi } from "vitest";

import type { Card } from "../../../src/cards/cardTypes.ts";
import { ALL_CARDS } from "../../../src/cards/data/index.ts";
import { TEST_PACK } from "../../../src/events/packs/testPack.ts";
import type { SeasonalEvent } from "../../../src/events/seasonalEvents.ts";
import { ACQUIRABLE_CARDS_BY_ID } from "../../../src/pub/acquirableCards.ts";
import { OPPONENTS, OPPONENTS_BY_ID, type Opponent } from "../../../src/pub/opponents.ts";
import { defaultPubState } from "../../../src/pub/pubState.ts";
import { createBracket } from "../../../src/tournaments/bracket.ts";
import { FALLBACK_PRIZE_CHECKS, resolveFixedPrize, resolvePrize, type PrizeLookups } from "../../../src/tournaments/prizes.ts";
import { TOURNAMENTS_BY_ID, withEditionFilter, type Tournament } from "../../../src/tournaments/tournaments.ts";

afterEach(() => vi.unstubAllEnvs());

const base = (id: string): Card => ({ ...ACQUIRABLE_CARDS_BY_ID.get("sherlock-holmes")!, id });
const BOSS_CARD: Card = { ...base("test-boss-card"), giftOnly: true };
const VISITOR_CARD = base("test-visitor-card");
const GIFT_VISITOR_CARD: Card = { ...base("test-gift-visitor-card"), giftOnly: true };
const CARDS = new Map<string, Card>([BOSS_CARD, VISITOR_CARD, GIFT_VISITOR_CARD].map((c) => [c.id, c]));

const donor = OPPONENTS_BY_ID.get("lovelace")!;
const BOSS: Opponent = { ...donor, id: "test-boss", name: "Test Boss", tier: "legend", tournamentOnly: true, giftOnly: true, rewardCardId: BOSS_CARD.id };
const VISITOR: Opponent = { ...donor, id: "test-visitor", name: "Test Visitor", tier: "visitor", rewardCardId: VISITOR_CARD.id };
const VISITOR_TWO: Opponent = { ...donor, id: "test-visitor-two", name: "Test Visitor Two", tier: "visitor" };
const VISITOR_THREE: Opponent = { ...donor, id: "test-visitor-three", name: "Test Visitor Three", tier: "visitor" };
const GIFT_VISITOR: Opponent = { ...donor, id: "test-gift-visitor", name: "Test Gift Visitor", tier: "visitor", rewardCardId: GIFT_VISITOR_CARD.id };

const EVENT: SeasonalEvent = { ...TEST_PACK, id: "test-event", visitors: [{ opponentId: VISITOR.id, arrives: { month: 1, day: 10 } }] };
const GIFT_FIRST_EVENT: SeasonalEvent = { ...EVENT, id: "test-gift-first", visitors: [{ opponentId: GIFT_VISITOR.id, arrives: { month: 1, day: 10 } }] };

const OPPONENT_LIST = [...OPPONENTS, BOSS, VISITOR, VISITOR_TWO, VISITOR_THREE, GIFT_VISITOR];
const lookups: PrizeLookups = {
  card: (id) => CARDS.get(id) ?? ACQUIRABLE_CARDS_BY_ID.get(id),
  event: (id) => [EVENT, GIFT_FIRST_EVENT].find((e) => e.id === id),
  opponent: (id) => OPPONENT_LIST.find((o) => o.id === id),
};

// Like the Meridian Cup: three visitors and the boss seated, three random Seasoned (there are four to draw from, so a public build seats all four).
const FIELD_IDS = [VISITOR.id, VISITOR_TWO.id, VISITOR_THREE.id, BOSS.id];

function testTournament(eventId = EVENT.id): Tournament {
  return withEditionFilter({
    id: "tuesday-knockout",
    name: "The Test Cup",
    eventId,
    whenLabel: "",
    fieldLabel: "",
    entryRuleLabel: "",
    entryChecks: 13,
    consolationChecks: 13,
    prizeChecks: 150,
    prizeCard: { kind: "fixed", cardId: BOSS_CARD.id },
    isUnlocked: () => true,
    eligiblePool: (opponents) => opponents.filter((o) => FIELD_IDS.includes(o.id) || o.tier === "seasoned"),
    fixedSeats: (pool) => pool.filter((o) => FIELD_IDS.includes(o.id)),
    checkEntryDeck: () => ({ valid: true }),
  });
}

describe("seating", () => {
  it("the gift build seats the boss and the visitor", { timeout: 60_000 }, () => {
    const t = testTournament();
    const pool = t.eligiblePool(OPPONENT_LIST);
    expect(pool.map((o) => o.id)).toContain(BOSS.id);
    const bracket = createBracket(t, pool, 7);
    expect(bracket.seatOpponentIds).toContain(BOSS.id);
    expect(bracket.seatOpponentIds).toContain(VISITOR.id);
  });

  it("a public build never offers the boss and fills the seat with a random Seasoned", { timeout: 60_000 }, () => {
    vi.stubEnv("VITE_EDITION", "public");
    const t = testTournament();
    const pool = t.eligiblePool(OPPONENT_LIST);
    expect(pool.map((o) => o.id)).not.toContain(BOSS.id);
    const seasoned = OPPONENTS.filter((o) => o.tier === "seasoned").map((o) => o.id);
    for (const seed of [1, 2]) {
      const bracket = createBracket(t, pool, seed);
      expect(bracket.seatOpponentIds).toHaveLength(7);
      expect(new Set(bracket.seatOpponentIds).size).toBe(7);
      expect(bracket.seatOpponentIds).not.toContain(BOSS.id);
      expect(bracket.seatOpponentIds).toContain(VISITOR.id);
      const filled = bracket.seatOpponentIds.filter((id) => !FIELD_IDS.includes(id));
      expect(filled).toHaveLength(4);
      for (const id of filled) expect(seasoned).toContain(id);
    }
  });

  it("the gift build seats the boss plus three of the Seasoned, so the boss's seat is what the fourth Seasoned fills", { timeout: 60_000 }, () => {
    const bracket = createBracket(testTournament(), testTournament().eligiblePool(OPPONENT_LIST), 3);
    expect(bracket.seatOpponentIds.filter((id) => !FIELD_IDS.includes(id))).toHaveLength(3);
  });
});

describe("the prize", () => {
  it("the gift build pays the printed card and the printed Checks", () => {
    const prize = resolvePrize(testTournament(), ALL_CARDS, defaultPubState(), 1, lookups);
    expect(prize).toEqual({ checks: 150, cardId: BOSS_CARD.id });
  });

  it("a public build pays the first visitor's signature card when it isn't owned", () => {
    vi.stubEnv("VITE_EDITION", "public");
    const prize = resolvePrize(testTournament(), ALL_CARDS, defaultPubState(), 1, lookups);
    expect(prize).toEqual({ checks: 150, cardId: VISITOR_CARD.id });
  });

  it("a public build pays 300 Checks when the first visitor's card is already owned", () => {
    vi.stubEnv("VITE_EDITION", "public");
    const owned = { ...defaultPubState(), collection: [VISITOR_CARD.id] };
    const prize = resolvePrize(testTournament(), ALL_CARDS, owned, 1, lookups);
    expect(prize).toEqual({ checks: FALLBACK_PRIZE_CHECKS, cardId: null });
    expect(FALLBACK_PRIZE_CHECKS).toBe(300);
  });

  it("a public build falls to 300 Checks when the fallback card is itself giftOnly", () => {
    vi.stubEnv("VITE_EDITION", "public");
    const prize = resolvePrize(testTournament(GIFT_FIRST_EVENT.id), ALL_CARDS, defaultPubState(), 1, lookups);
    expect(prize).toEqual({ checks: 300, cardId: null });
  });

  it("a public build with no event to fall back on pays 300 Checks", () => {
    vi.stubEnv("VITE_EDITION", "public");
    const t = { ...testTournament(), eventId: undefined };
    expect(resolvePrize(t, ALL_CARDS, defaultPubState(), 1, lookups)).toEqual({ checks: 300, cardId: null });
  });

  it("a prize that isn't giftOnly is untouched in a public build", () => {
    vi.stubEnv("VITE_EDITION", "public");
    const t: Tournament = { ...testTournament(), prizeCard: { kind: "fixed", cardId: VISITOR_CARD.id } };
    expect(resolveFixedPrize(t, [], lookups)).toEqual({ cardId: VISITOR_CARD.id, fellBack: false });
  });

  it("the real Almanack Stakes and Fireside Circle (no giftOnly prize) pay their cards in a public build", () => {
    vi.stubEnv("VITE_EDITION", "public");
    expect(resolvePrize(TOURNAMENTS_BY_ID.get("almanack-stakes")!, ALL_CARDS, defaultPubState(), 1).cardId).toBe("mother-red-cap");
    expect(resolvePrize(TOURNAMENTS_BY_ID.get("fireside-circle")!, ALL_CARDS, defaultPubState(), 1).cardId).toBe("ghost-of-christmas-yet-to-come");
  });

  it("random-rarity prizes don't use the fallback", () => {
    vi.stubEnv("VITE_EDITION", "public");
    const prize = resolvePrize(TOURNAMENTS_BY_ID.get("tuesday-knockout")!, ALL_CARDS, defaultPubState(), 1);
    expect(prize.checks).toBe(60);
    expect(prize.cardId).not.toBeNull();
  });
});
