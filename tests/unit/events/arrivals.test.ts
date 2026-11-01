// Hosts, arrival gifts and banners (docs/plans/monthly/00-monthly-content-plan.md §4.1),
// exercised with the test-only pack: window Jan 10-12, host arrives Jan 11,
// gift "welcome" (2 x test-card-a) from Jan 11, gift "later" from 2027.

import { beforeEach, describe, expect, it } from "vitest";

import { allHostIds, dueBanner, dueGifts, grantArrivalGifts, hostMet, markBannerSeen, updateHostsMet } from "../../../src/events/arrivals.ts";
import { TEST_PACK } from "../../../src/events/packs/testPack.ts";
import { migratedLedger } from "../../../src/save/ledger.ts";
import { OPPONENTS, OPPONENTS_BY_ID, tonightsPatrons } from "../../../src/pub/opponents.ts";
import { TOURNAMENTS } from "../../../src/tournaments/tournaments.ts";
import { countInCollection, defaultPubState, loadPubState, savePubState, type PubState } from "../../../src/pub/pubState.ts";

const EVENTS = [TEST_PACK];

function player(firstLaunch: string): PubState {
  return { ...defaultPubState(), ledger: migratedLedger(firstLaunch) };
}

beforeEach(() => localStorage.clear());

describe("hosts", () => {
  it("are met on a launch on or after the arrival date, not before", () => {
    const pub = player("2026-10-31");
    expect(hostMet(updateHostsMet(pub, new Date(2027, 0, 10), EVENTS), "test-host")).toBe(false);
    expect(hostMet(updateHostsMet(pub, new Date(2027, 0, 11), EVENTS), "test-host")).toBe(true);
    expect(hostMet(updateHostsMet(pub, new Date(2027, 0, 12), EVENTS), "test-host")).toBe(true);
  });

  it("stay met after the window closes, in later months and in later years", () => {
    let pub = updateHostsMet(player("2026-10-31"), new Date(2027, 0, 11), EVENTS);
    for (const date of [new Date(2027, 0, 13), new Date(2027, 6, 1), new Date(2028, 0, 1), new Date(2028, 0, 11)]) {
      pub = updateHostsMet(pub, date, EVENTS);
      expect(hostMet(pub, "test-host"), date.toDateString()).toBe(true);
    }
  });

  it("survive a relaunch (persisted in the pub-state save)", () => {
    savePubState(updateHostsMet(player("2026-10-31"), new Date(2027, 0, 11), EVENTS));
    expect(hostMet(loadPubState(), "test-host")).toBe(true);
  });

  it("are met on a later year's arrival for a player who started after the window closed", () => {
    const late = player("2027-03-01");
    expect(hostMet(updateHostsMet(late, new Date(2027, 5, 1), EVENTS), "test-host")).toBe(false);
    expect(hostMet(updateHostsMet(late, new Date(2028, 0, 10), EVENTS), "test-host")).toBe(false);
    expect(hostMet(updateHostsMet(late, new Date(2028, 0, 11), EVENTS), "test-host")).toBe(true);
  });

  it("are met at once by a player who first launches mid-window after the host arrived", () => {
    expect(hostMet(updateHostsMet(player("2027-01-12"), new Date(2027, 0, 12), EVENTS), "test-host")).toBe(true);
  });

  it("are never an opponent: absent from the opponent registry, Tonight's Patrons and every tournament field", () => {
    const hostIds = new Set(allHostIds([TEST_PACK]));
    expect(hostIds.has("test-host")).toBe(true);
    for (const id of hostIds) {
      expect(OPPONENTS_BY_ID.has(id), id).toBe(false);
      expect(OPPONENTS.some((o) => o.id === id), id).toBe(false);
    }
    // Every year, every day of the test window and after, with a veteran's win count.
    for (const date of [new Date(2026, 0, 11), new Date(2027, 0, 11), new Date(2027, 5, 1), new Date(2028, 0, 11)]) {
      expect(tonightsPatrons(99, date).some((o) => hostIds.has(o.id))).toBe(false);
    }
    for (const t of TOURNAMENTS) expect(t.eligiblePool(OPPONENTS).some((o) => hostIds.has(o.id)), t.id).toBe(false);
  });
});

describe("arrival gifts", () => {
  const grantOn = (pub: PubState, y: number, m: number, d: number) => grantArrivalGifts(pub, new Date(y, m - 1, d), EVENTS);

  it("waits for max(window start, gift.from): nothing before the window or on Jan 10, the gift on Jan 11", () => {
    const pub = player("2026-10-31");
    expect(grantOn(pub, 2026, 1, 9).granted).toEqual([]);
    expect(grantOn(pub, 2026, 1, 10).granted).toEqual([]);
    const r = grantOn(pub, 2026, 1, 11);
    expect(r.granted.map((g) => g.key)).toEqual(["welcome"]);
    expect(countInCollection(r.next.collection, "test-card-a")).toBe(2);
  });

  it("is granted once per event per calendar year, however many launches follow", () => {
    let pub = grantOn(player("2026-10-31"), 2026, 1, 11).next;
    for (const day of [11, 12]) {
      const again = grantOn(pub, 2026, 1, day);
      expect(again.granted).toEqual([]);
      pub = again.next;
    }
    expect(countInCollection(pub.collection, "test-card-a")).toBe(2);
    expect(pub.giftsClaimed["test-pack"]).toEqual({ "2026": ["welcome"] });
  });

  it("survives a relaunch: the claim is in the save, so a reload grants nothing twice", () => {
    savePubState(grantOn(player("2026-10-31"), 2026, 1, 11).next);
    const reloaded = loadPubState();
    expect(grantOn(reloaded, 2026, 1, 12).granted).toEqual([]);
    expect(countInCollection(reloaded.collection, "test-card-a")).toBe(2);
  });

  it("is granted again the next year", () => {
    const y1 = grantOn(player("2026-10-31"), 2026, 1, 11).next;
    const y2 = grantOn(y1, 2027, 1, 11);
    expect(y2.granted.map((g) => g.key)).toContain("welcome");
    expect(countInCollection(y2.next.collection, "test-card-a")).toBe(4);
    expect(y2.next.giftsClaimed["test-pack"]!["2027"]).toContain("welcome");
  });

  it("holds a fromYear gift back in 2026 and grants it in 2027", () => {
    const in2026 = grantOn(player("2026-10-31"), 2026, 1, 12);
    expect(in2026.granted.map((g) => g.key)).toEqual(["welcome"]);
    const in2027 = grantOn(player("2026-10-31"), 2027, 1, 12);
    expect(in2027.granted.map((g) => g.key).sort()).toEqual(["later", "welcome"]);
    expect(countInCollection(in2027.next.collection, "test-card-b")).toBe(1);
  });

  it("kindness rule: an unclaimed gift is still granted within 7 days after the window closes, not on day 8", () => {
    const pub = player("2026-10-31");
    expect(grantOn(pub, 2026, 1, 13).granted.map((g) => g.key)).toEqual(["welcome"]);
    expect(grantOn(pub, 2026, 1, 19).granted.map((g) => g.key)).toEqual(["welcome"]);
    expect(grantOn(pub, 2026, 1, 20).granted).toEqual([]);
  });

  it("a late claim is recorded against the event's own year, so it is not granted twice", () => {
    const late = grantOn(player("2026-10-31"), 2026, 1, 15).next;
    expect(late.giftsClaimed["test-pack"]).toEqual({ "2026": ["welcome"] });
    expect(grantOn(late, 2026, 1, 16).granted).toEqual([]);
  });

  it("counts the grace period across New Year (an event ending Dec 31 is claimable on Jan 1-7)", () => {
    const december: typeof TEST_PACK = { ...TEST_PACK, id: "dec", window: { start: { month: 12, day: 1 }, end: { month: 12, day: 31 } }, arrivalGifts: [{ cardIds: [{ id: "x", qty: 1 }], line: "l" }] };
    const due = dueGifts(player("2026-10-31"), new Date(2027, 0, 5), [december]);
    expect(due).toHaveLength(1);
    expect(due[0]).toMatchObject({ eventId: "dec", year: 2026, key: "0" });
    expect(dueGifts(player("2026-10-31"), new Date(2027, 0, 8), [december])).toEqual([]);
  });
});

describe("banner", () => {
  it("shows on a hub visit inside the window, once per event per year", () => {
    let pub = player("2026-10-31");
    expect(dueBanner(pub, new Date(2027, 0, 9), EVENTS)).toBeNull();
    const first = dueBanner(pub, new Date(2027, 0, 10), EVENTS);
    expect(first).toMatchObject({ eventId: "test-pack", year: 2027, text: TEST_PACK.banner });
    pub = markBannerSeen(pub, first!.eventId, first!.year);
    expect(dueBanner(pub, new Date(2027, 0, 11), EVENTS)).toBeNull();
    expect(dueBanner(pub, new Date(2027, 0, 13), EVENTS)).toBeNull();
  });

  it("comes back the next year, and survives a relaunch", () => {
    savePubState(markBannerSeen(player("2026-10-31"), "test-pack", 2027));
    const reloaded = loadPubState();
    expect(dueBanner(reloaded, new Date(2027, 0, 11), EVENTS)).toBeNull();
    expect(dueBanner(reloaded, new Date(2028, 0, 11), EVENTS)?.year).toBe(2028);
  });
});
