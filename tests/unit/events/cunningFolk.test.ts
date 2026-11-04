// The Cunning Folk (November, docs/plans/monthly/01-november.md §2, §4, §6):
// the pack's dates as the real registry sees them, who is in Tonight's
// Patrons, and the arrival gifts with their from/fromYear gates.

import { beforeEach, describe, expect, it } from "vitest";

import { CUNNING_FOLK } from "../../../src/events/packs/cunningFolk.ts";
import { grantArrivalGifts, hostMet, updateHostsMet } from "../../../src/events/arrivals.ts";
import { activeEvents, eventCardPoolIds, eventLineOverride, eventSirCharlesLines, SEASONAL_EVENTS, visitorArrived } from "../../../src/events/seasonalEvents.ts";
import { OPPONENTS_BY_ID, tonightsPatrons } from "../../../src/pub/opponents.ts";
import { ACQUIRABLE_CARDS_BY_ID } from "../../../src/pub/acquirableCards.ts";
import { countInCollection, defaultPubState, type PubState } from "../../../src/pub/pubState.ts";
import { migratedLedger } from "../../../src/save/ledger.ts";
import { EVENT_CARDS } from "../../../src/cards/data/eventCards.ts";
import { ALL_CARDS } from "../../../src/cards/data/index.ts";

const day = (year: number, month: number, date: number) => new Date(year, month - 1, date);

/** Copies of `id` the player holds. */
const copies = (pub: PubState, id: string): number => countInCollection(pub.collection, id);

function player(firstLaunch: string): PubState {
  return { ...defaultPubState(), ledger: migratedLedger(firstLaunch) };
}

beforeEach(() => localStorage.clear());

describe("the pack", () => {
  it("runs Nov 1-30 and is registered once", () => {
    expect(SEASONAL_EVENTS.filter((e) => e.id === "cunning-folk")).toEqual([CUNNING_FOLK]);
    expect(CUNNING_FOLK.window).toEqual({ start: { month: 11, day: 1 }, end: { month: 11, day: 30 } });
    expect(CUNNING_FOLK.minWins).toBe(3);
    expect(activeEvents(day(2026, 10, 31)).map((e) => e.id)).not.toContain("cunning-folk");
    expect(activeEvents(day(2026, 11, 30)).map((e) => e.id)).toContain("cunning-folk");
    expect(activeEvents(day(2026, 12, 1)).map((e) => e.id)).not.toContain("cunning-folk");
  });

  it("lists the Almanack Stakes as its one tournament, with the Petrifying Well as its house Location", () => {
    expect(CUNNING_FOLK.tournaments).toEqual(["almanack-stakes"]);
    expect(CUNNING_FOLK.dressing.taproomArtId).toBe("background-the-taproom-cunning-folk");
  });

  it("gives every visitor and host arrival a date inside the window", () => {
    const dates = [...CUNNING_FOLK.visitors.map((v) => v.arrives), ...(CUNNING_FOLK.hosts ?? []).map((h) => h.arrives)];
    for (const md of dates) expect(md.month).toBe(11);
  });

  it("is not giftOnly anywhere: none of it is a fan allusion", () => {
    const cards = [...EVENT_CARDS.filter((c) => CUNNING_FOLK.cardPool.some((p) => (typeof p === "string" ? p : p.id) === c.id))];
    for (const card of cards) expect(card.giftOnly, card.id).toBeFalsy();
    for (const id of ["mother-shipton", "john-dee", "mother-red-cap"]) expect(OPPONENTS_BY_ID.get(id)?.giftOnly, id).toBeFalsy();
  });

  it("keeps every pool id resolvable to an event card", () => {
    for (const entry of CUNNING_FOLK.cardPool) {
      const id = typeof entry === "string" ? entry : entry.id;
      expect(ACQUIRABLE_CARDS_BY_ID.has(id), id).toBe(true);
    }
  });

  it("keeps Penny for the Guy out of the 2026 pool and in it from 2027", () => {
    expect(eventCardPoolIds(day(2026, 11, 14))).not.toContain("penny-for-the-guy");
    expect(eventCardPoolIds(day(2027, 11, 14))).toContain("penny-for-the-guy");
  });

  it("uses only year-round card ids as the base 60 are never in the pool", () => {
    const base = new Set(ALL_CARDS.map((c) => c.id));
    for (const entry of CUNNING_FOLK.cardPool) expect(base.has(typeof entry === "string" ? entry : entry.id)).toBe(false);
  });
});

describe("Tonight's Patrons in November", () => {
  it("has no visitors, host or booth-era patrons on Nov 12, and nothing from the Cunning Folk at all", () => {
    const names = tonightsPatrons(30, day(2026, 11, 12)).map((o) => o.id);
    expect(names).not.toContain("mother-shipton");
    expect(names).not.toContain("john-dee");
    expect(names).not.toContain("pamela-colman-smith");
  });

  it("shows Shipton and Dee on Nov 13 to a player with 3+ wins, and never Pixie", () => {
    const names = tonightsPatrons(3, day(2026, 11, 13)).map((o) => o.id);
    expect(names).toContain("mother-shipton");
    expect(names).toContain("john-dee");
    expect(names).not.toContain("pamela-colman-smith");
  });

  it("keeps the visitors out below 3 wins", () => {
    const names = tonightsPatrons(2, day(2026, 11, 13)).map((o) => o.id);
    expect(names).not.toContain("mother-shipton");
    expect(names).not.toContain("john-dee");
  });

  it("never lists Mother Red Cap, the tournament-only boss, even on Nov 20-30 with every win", () => {
    for (const d of [day(2026, 11, 20), day(2026, 11, 25), day(2026, 11, 30)]) {
      expect(tonightsPatrons(40, d).map((o) => o.id)).not.toContain("mother-red-cap");
    }
  });

  it("drops the visitors on Dec 1 and never lists Pixie", () => {
    const names = tonightsPatrons(40, day(2026, 12, 1)).map((o) => o.id);
    expect(names).not.toContain("mother-shipton");
    expect(names).not.toContain("john-dee");
    expect(names).not.toContain("pamela-colman-smith");
  });

  it("registers Mother Red Cap as a tournament-only legend with no reward card of her own", () => {
    const red = OPPONENTS_BY_ID.get("mother-red-cap")!;
    expect(red.tier).toBe("legend");
    expect(red.tournamentOnly).toBe(true);
    expect(red.rewardCardId).toBeNull();
  });

  it("has Mudd react to Red Cap only from Nov 20, and Lovelace to Dee from Nov 13", () => {
    expect(eventLineOverride("mudd", day(2026, 11, 19))).toBeNull();
    expect(eventLineOverride("mudd", day(2026, 11, 20))).toMatch(/Camden/);
    expect(eventLineOverride("lovelace", day(2026, 11, 12))).toBeNull();
    expect(eventLineOverride("lovelace", day(2026, 11, 13))).toMatch(/angels/);
  });

  it("has Prudence Hollis react to Shipton from Nov 13", () => {
    expect(eventLineOverride("prudence-hollis", day(2026, 11, 12))).toBeNull();
    expect(eventLineOverride("prudence-hollis", day(2026, 11, 13))).toMatch(/novel/);
    expect(visitorArrived(CUNNING_FOLK, "mother-shipton", day(2026, 11, 13))).toBe(true);
  });

  it("gives Sir Charles the three November lines while the event is live", () => {
    expect(eventSirCharlesLines(day(2026, 11, 2))).toHaveLength(3);
    expect(eventSirCharlesLines(day(2027, 1, 2))).toEqual([]);
  });
});

describe("the Booth host", () => {
  it("is Pixie from Nov 13, and met on a launch from then on", () => {
    const pub = player("2026-11-02");
    expect(hostMet(updateHostsMet(pub, day(2026, 11, 12)), "pamela-colman-smith")).toBe(false);
    expect(hostMet(updateHostsMet(pub, day(2026, 11, 13)), "pamela-colman-smith")).toBe(true);
    expect(hostMet(updateHostsMet(pub, day(2026, 12, 20)), "pamela-colman-smith")).toBe(true);
  });
});

describe("arrival gifts", () => {
  it("hands over the 1 Nov gift (Scorpio, two Hedge Witches, one Witch Bottle) once, on the first launch in November", () => {
    const pub = player("2026-10-31");
    const first = grantArrivalGifts(pub, day(2026, 11, 1));
    expect(copies(first.next, "almanack-scorpio")).toBe(1);
    expect(copies(first.next, "hedge-witch")).toBe(2);
    expect(copies(first.next, "witch-bottle")).toBe(1);
    const again = grantArrivalGifts(first.next, day(2026, 11, 2));
    expect(again.granted).toEqual([]);
    expect(copies(again.next, "hedge-witch")).toBe(2);
  });

  it("hands over Cunning Woman from Nov 13 and not before", () => {
    const pub = player("2026-11-01");
    const before = grantArrivalGifts(pub, day(2026, 11, 12)).next;
    expect(copies(before, "cunning-woman")).toBe(0);
    const after = grantArrivalGifts(pub, day(2026, 11, 13)).next;
    expect(copies(after, "cunning-woman")).toBe(1);
  });

  it("hands over Sagittarius from Nov 22, once", () => {
    const pub = player("2026-11-01");
    expect(copies(grantArrivalGifts(pub, day(2026, 11, 21)).next, "almanack-sagittarius")).toBe(0);
    const on = grantArrivalGifts(pub, day(2026, 11, 22)).next;
    expect(copies(on, "almanack-sagittarius")).toBe(1);
    expect(grantArrivalGifts(on, day(2026, 11, 23)).granted).toEqual([]);
  });

  it("does not hand over the Penny for the Guy in 2026, not even on Nov 14", () => {
    const pub = player("2026-11-01");
    const next = grantArrivalGifts(pub, day(2026, 11, 14)).next;
    expect(copies(next, "penny-for-the-guy")).toBe(0);
  });

  it("does not hand over the Penny for the Guy on Nov 4, 2027, but does on Nov 5, 2027, once", () => {
    const pub = player("2026-11-01");
    expect(copies(grantArrivalGifts(pub, day(2027, 11, 4)).next, "penny-for-the-guy")).toBe(0);
    const on = grantArrivalGifts(pub, day(2027, 11, 5)).next;
    expect(copies(on, "penny-for-the-guy")).toBe(1);
    expect(grantArrivalGifts(on, day(2027, 11, 6)).granted.filter((g) => g.key === "penny-for-the-guy")).toEqual([]);
  });

  it("keeps the Penny for the Guy gift and the pool entry gated by year, not by the calendar alone", () => {
    const pool = CUNNING_FOLK.cardPool.find((e) => typeof e !== "string" && e.id === "penny-for-the-guy");
    expect(pool).toEqual({ id: "penny-for-the-guy", fromYear: 2027 });
  });
});
