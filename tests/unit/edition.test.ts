// The edition flag (docs/plans/monthly/00-monthly-content-plan.md §4.2,
// docs/app-store-readiness.md §7): in a `public` build nothing marked
// `giftOnly` is reachable. No real content is tagged yet, so each test plants
// a gift-only fixture in the live registries (and checks the gift edition
// still reaches it, which proves the fixture is wired in).

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Card } from "../../src/cards/cardTypes.ts";
import type { Opponent } from "../../src/pub/opponents.ts";
import type { LineOverride, SeasonalEvent } from "../../src/events/seasonalEvents.ts";
import { edition, forEdition, isPublicEdition, lineText, visibleInEdition, visibleLines } from "../../src/edition.ts";

const OCT_15 = new Date(2026, 9, 15);

function fixtureCard(id: string, giftOnly: boolean, rarity: Card["rarity"] = "common"): Card {
  return {
    id,
    rarity,
    ...(giftOnly ? { giftOnly: true } : {}),
    faces: [{ name: id, type: "character", family: "neutral", points: 1, flavor: "A fixture.", artId: "none" }],
  };
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("src/edition.ts", () => {
  it("defaults to the gift edition and reads VITE_EDITION at call time", () => {
    expect(edition()).toBe("gift");
    vi.stubEnv("VITE_EDITION", "public");
    expect(edition()).toBe("public");
    expect(isPublicEdition()).toBe(true);
    vi.stubEnv("VITE_EDITION", "anything-else");
    expect(edition()).toBe("gift");
  });

  it("keeps giftOnly things in the gift edition and drops them in public", () => {
    const items = [{ id: "a" }, { id: "b", giftOnly: true }];
    expect(forEdition(items)).toBe(items);
    expect(visibleInEdition(items[1]!)).toBe(true);
    vi.stubEnv("VITE_EDITION", "public");
    expect(forEdition(items)).toEqual([{ id: "a" }]);
    expect(visibleInEdition(items[1]!)).toBe(false);
  });

  it("lines accept plain strings and { text, giftOnly }", () => {
    const lines = ["plain", { text: "kept" }, { text: "gift", giftOnly: true }];
    expect(lineText(lines[1]!)).toBe("kept");
    expect(visibleLines(lines)).toEqual(["plain", "kept", "gift"]);
    vi.stubEnv("VITE_EDITION", "public");
    expect(visibleLines(lines)).toEqual(["plain", "kept"]);
  });
});

describe("a public build reaches nothing giftOnly", () => {
  const GIFT_CARD = fixtureCard("fx-gift-card", true);
  const GIFT_LEGEND = fixtureCard("fx-gift-legend", true, "legendary");
  const OK_CARD = fixtureCard("fx-ok-card", false);
  const GIFT_YEAR_ROUND = fixtureCard("fx-gift-yearround", true);

  const GIFT_OPPONENT = (o: Opponent): Opponent => ({ ...o, id: "fx-gift-opponent", name: "Gift Opponent", giftOnly: true, unlockWins: 0, tournamentOnly: false, tier: "regular" });

  async function load() {
    vi.resetModules();
    const [events, eventCards, acquirable, opponents, tournaments, lostAndFound, pawnbroker, pubState, catalog, seasonal] = await Promise.all([
      import("../../src/events/seasonalEvents.ts"),
      import("../../src/cards/data/eventCards.ts"),
      import("../../src/pub/acquirableCards.ts"),
      import("../../src/pub/opponents.ts"),
      import("../../src/tournaments/tournaments.ts"),
      import("../../src/pub/lostAndFound.ts"),
      import("../../src/pub/pawnbroker.ts"),
      import("../../src/pub/pubState.ts"),
      import("../../src/decks/cardCatalog.ts"),
      import("../../src/events/seasonalEvents.ts"),
    ]);
    // Plant the fixtures where the live registries will find them.
    const hall = events.HALLOWEEN as unknown as SeasonalEvent;
    hall.cardPool.push(GIFT_CARD.id, OK_CARD.id);
    for (const c of [GIFT_CARD, OK_CARD]) {
      eventCards.EVENT_CARDS.push(c);
      (eventCards.EVENT_CARDS_BY_ID as Map<string, Card>).set(c.id, c);
    }
    acquirable.ACQUIRABLE_CARDS.push(GIFT_YEAR_ROUND);
    acquirable.NON_LEGENDARY_ACQUIRABLE_CARDS.push(GIFT_YEAR_ROUND);
    for (const c of [GIFT_YEAR_ROUND, GIFT_LEGEND]) acquirable.ACQUIRABLE_CARDS_BY_ID.set(c.id, c);
    const gift = GIFT_OPPONENT(opponents.OPPONENTS[0]!);
    opponents.OPPONENTS.push(gift);
    (hall.dressing.sirCharlesLines as unknown[]).push({ text: "fx gift-only Sir Charles line", giftOnly: true });
    (hall.dressing.lineOverrides as LineOverride[]).push({ opponentId: "fx-line-target", line: "fx gift-only override", giftOnly: true });
    return { events, acquirable, opponents, tournaments, lostAndFound, pawnbroker, pubState, catalog, seasonal, gift };
  }

  const FIXTURE_IDS = [GIFT_CARD.id, GIFT_YEAR_ROUND.id];

  beforeEach(() => vi.stubEnv("VITE_EDITION", "gift"));

  it("sanity: the gift edition does reach every fixture", async () => {
    const m = await load();
    const pool = m.acquirable.acquirablePoolFor(OCT_15).map((c) => c.id);
    expect(pool).toEqual(expect.arrayContaining([...FIXTURE_IDS, OK_CARD.id]));
    expect(m.opponents.tonightsPatrons(0, OCT_15).map((o) => o.id)).toContain(m.gift.id);
    expect(m.events.eventSirCharlesLines(OCT_15)).toContain("fx gift-only Sir Charles line");
    expect(m.events.eventLineOverride("fx-line-target", OCT_15)).toBe("fx gift-only override");
    expect(m.tournaments.TOURNAMENTS_BY_ID.get("tuesday-knockout")!.eligiblePool([m.gift]).map((o) => o.id)).toContain(m.gift.id);
  });

  it("card catalog, Lost & Found and the Pawnbroker never offer a giftOnly card", async () => {
    vi.stubEnv("VITE_EDITION", "public");
    const m = await load();
    const pool = m.acquirable.acquirablePoolFor(OCT_15).map((c) => c.id);
    for (const id of FIXTURE_IDS) expect(pool).not.toContain(id);
    expect(pool).toContain(OK_CARD.id);

    const owned = [...FIXTURE_IDS, GIFT_LEGEND.id, OK_CARD.id];
    const builder = m.catalog.builderCards(owned).map((c) => c.id);
    for (const id of [...FIXTURE_IDS, GIFT_LEGEND.id]) expect(builder).not.toContain(id);

    let state = m.pubState.defaultPubState();
    state = { ...state, pawnedCards: [GIFT_CARD.id, GIFT_YEAR_ROUND.id] };
    for (let day = 0; day < 400; day++) {
      const date = new Date(2026, 8, 20 + day);
      expect(FIXTURE_IDS, `Lost & Found day ${day}`).not.toContain(m.lostAndFound.rollLostAndFound([], date).id);
      for (const slot of m.pawnbroker.pawnbrokerWindow(state, date)) expect(FIXTURE_IDS, `Pawnbroker day ${day}`).not.toContain(slot.card.id);
    }
  });

  it("Tonight's Patrons and every tournament field drop a giftOnly opponent", async () => {
    vi.stubEnv("VITE_EDITION", "public");
    const m = await load();
    for (const wins of [0, 5, 40]) expect(m.opponents.tonightsPatrons(wins, OCT_15).map((o) => o.id)).not.toContain(m.gift.id);
    for (const t of m.tournaments.TOURNAMENTS) {
      const field = t.eligiblePool([...m.opponents.OPPONENTS, { ...m.gift, tier: "legend" }, { ...m.gift, id: "fx-gift-seasoned", tier: "seasoned" }]);
      expect(field.some((o) => o.giftOnly), t.id).toBe(false);
    }
  });

  it("line pools drop giftOnly lines and overrides", async () => {
    vi.stubEnv("VITE_EDITION", "public");
    const m = await load();
    expect(m.events.eventSirCharlesLines(OCT_15)).not.toContain("fx gift-only Sir Charles line");
    expect(m.events.eventLineOverride("fx-line-target", OCT_15)).toBeNull();
    // Plain lines are untouched.
    expect(m.events.eventSirCharlesLines(OCT_15).length).toBeGreaterThan(0);
  });

  it("no card, opponent or line in the real content is giftOnly yet in a way a public build would reach", async () => {
    vi.stubEnv("VITE_EDITION", "public");
    vi.resetModules();
    const [acquirable, opponents, tournaments, events] = await Promise.all([
      import("../../src/pub/acquirableCards.ts"),
      import("../../src/pub/opponents.ts"),
      import("../../src/tournaments/tournaments.ts"),
      import("../../src/events/seasonalEvents.ts"),
    ]);
    for (const date of [OCT_15, new Date(2026, 10, 15), new Date(2027, 0, 11)]) {
      expect(acquirable.acquirablePoolFor(date).some((c) => c.giftOnly)).toBe(false);
      expect(opponents.tonightsPatrons(99, date).some((o) => o.giftOnly)).toBe(false);
      for (const t of tournaments.TOURNAMENTS) expect(t.eligiblePool(opponents.OPPONENTS).some((o) => o.giftOnly)).toBe(false);
      for (const line of events.eventSirCharlesLines(date)) expect(typeof line).toBe("string");
    }
  });
});
