// The Advent Cabinet (design.md §17.3): door-open rules across the year wrap,
// claims that persist and never pay twice, tokens spent exactly once (also
// alongside the Booth's tinkerFree omen), and the foil grant.

import { describe, expect, it } from "vitest";

import { claimDoor, doorStatus, liveAdvent, openableCount, spendToken, tokenCount, type AdventConfig } from "../../../src/events/advent.ts";
import { parseAdventState } from "../../../src/events/adventState.ts";
import type { SeasonalEvent } from "../../../src/events/seasonalEvents.ts";
import { eventWeather, SEASONAL_EVENTS } from "../../../src/events/seasonalEvents.ts";
import { spendFreeFuse, tinkerFee } from "../../../src/booth/omens.ts";
import { rollLostAndFound } from "../../../src/pub/lostAndFound.ts";
import { defaultPubState, loadPubState, savePubState, type PubState } from "../../../src/pub/pubState.ts";
import { defaultLedger } from "../../../src/save/ledger.ts";
import { TINKER_FEE_CHECKS } from "../../../src/pub/tinkersBench.ts";

const ADVENT: AdventConfig = {
  opensFrom: { month: 12, day: 1 },
  lastClaim: { month: 1, day: 6 },
  doors: [
    { day: 1, reward: { checks: 10 } },
    { day: 2, reward: { cardId: "wassail-bowl" } },
    { day: 3, reward: { token: "lostAndFoundUncommon" } },
    { day: 4, reward: { token: "tinkerFree" } },
    { day: 5, reward: { foilOf: "bramwell" } },
    { day: 6, reward: { foilOf: "yule-log" } },
    { day: 24, reward: { checks: 50 }, line: "Christmas Eve." },
    { day: 25, reward: { foilOf: "bramwell" } },
  ],
};

const EVENT: SeasonalEvent = {
  id: "ghost-story-test",
  name: "Advent test",
  window: { start: { month: 12, day: 1 }, end: { month: 12, day: 31 } },
  visitors: [],
  tournaments: [],
  cardPool: [],
  minWins: 0,
  dressing: { lockedHint: "", sirCharlesLines: [], lineOverrides: [] },
  advent: ADVENT,
};
const EVENTS = [EVENT];

const NOV_30 = new Date(2026, 10, 30, 12);
const DEC_1 = new Date(2026, 11, 1, 12);
const DEC_3 = new Date(2026, 11, 3, 12);
const DEC_24 = new Date(2026, 11, 24, 12);
const DEC_25 = new Date(2026, 11, 25, 12);
const JAN_6 = new Date(2027, 0, 6, 12);
const JAN_7 = new Date(2027, 0, 7, 12);

function status(pub: PubState, day: number, date: Date) {
  const live = liveAdvent(date, EVENTS)!;
  return doorStatus(pub, live, ADVENT.doors.find((d) => d.day === day)!, date);
}

describe("door-open rules", () => {
  it("has no cabinet on Nov 30", () => {
    expect(liveAdvent(NOV_30, EVENTS)).toBeNull();
  });

  it("opens only door 1 on Dec 1, doors 1-3 on Dec 3, the rest staying shut", () => {
    const pub = defaultPubState();
    expect(status(pub, 1, DEC_1)).toBe("openable");
    expect(status(pub, 2, DEC_1)).toBe("shut");
    expect(status(pub, 3, DEC_3)).toBe("openable");
    expect(status(pub, 4, DEC_3)).toBe("shut");
    expect(openableCount(pub, liveAdvent(DEC_3, EVENTS)!, DEC_3)).toBe(3);
  });

  it("keeps door 25 shut on Dec 24 and opens it on Dec 25", () => {
    const pub = defaultPubState();
    expect(status(pub, 24, DEC_24)).toBe("openable");
    expect(status(pub, 25, DEC_24)).toBe("shut");
    expect(status(pub, 25, DEC_25)).toBe("openable");
  });

  it("handles the year wrap: still claimable on Jan 6, gone on Jan 7", () => {
    const pub = defaultPubState();
    const jan6 = liveAdvent(JAN_6, EVENTS);
    expect(jan6).not.toBeNull();
    expect(jan6!.year).toBe(2026);
    expect(status(pub, 1, JAN_6)).toBe("openable");
    expect(status(pub, 25, JAN_6)).toBe("openable");
    expect(liveAdvent(JAN_7, EVENTS)).toBeNull();
  });

  it("refuses to claim a shut door or one outside the cabinet's dates", () => {
    const pub = defaultPubState();
    expect(claimDoor(pub, DEC_1, 2, EVENTS)).toBeNull();
    expect(claimDoor(pub, NOV_30, 1, EVENTS)).toBeNull();
    expect(claimDoor(pub, JAN_7, 1, EVENTS)).toBeNull();
    expect(claimDoor(pub, DEC_1, 99, EVENTS)).toBeNull();
  });
});

describe("claims", () => {
  it("pays once, records the claim per event per year, and keeps the door open", () => {
    const first = claimDoor(defaultPubState(), DEC_1, 1, EVENTS)!;
    expect(first.next.checks).toBe(10);
    expect(first.next.advent.claims["ghost-story-test"]).toEqual({ "2026": [1] });
    expect(status(first.next, 1, DEC_1)).toBe("opened");
    expect(claimDoor(first.next, DEC_1, 1, EVENTS)).toBeNull();
    expect(claimDoor(first.next, JAN_6, 1, EVENTS)).toBeNull();
  });

  it("files a January claim under the December year it belongs to", () => {
    const claimed = claimDoor(defaultPubState(), JAN_6, 3, EVENTS)!;
    expect(claimed.next.advent.claims["ghost-story-test"]).toEqual({ "2026": [3] });
  });

  it("survives a save and reload", () => {
    localStorage.clear();
    const claimed = claimDoor(defaultPubState(), DEC_1, 1, EVENTS)!.next;
    savePubState(claimed);
    const reloaded = loadPubState();
    expect(reloaded.advent.claims["ghost-story-test"]).toEqual({ "2026": [1] });
    expect(claimDoor(reloaded, DEC_1, 1, EVENTS)).toBeNull();
    localStorage.clear();
  });

  it("gives a card to the collection and records Checks in the ledger", () => {
    const withCard = claimDoor(defaultPubState(), DEC_3, 2, EVENTS)!;
    expect(withCard.next.collection).toEqual(["wassail-bowl"]);
    expect(withCard.cardIds).toEqual(["wassail-bowl"]);
    expect(claimDoor(defaultPubState(), DEC_1, 1, EVENTS)!.next.ledger.checksEarned).toBe(10);
  });

  it("parses a missing or garbled advent slice to an empty one", () => {
    expect(parseAdventState(undefined)).toEqual(defaultPubState().advent);
    expect(parseAdventState({ claims: { x: { "2026": [1, "a"] } }, tokens: { tinkerFree: -2 } })).toEqual({ ...defaultPubState().advent, claims: { x: {} } });
  });
});

describe("foil grant", () => {
  it("gives only the foil for a card the player owns (Bramwell is in the starter deck)", () => {
    const claimed = claimDoor(defaultPubState(), DEC_25, 5, EVENTS)!;
    expect(claimed.next.collection).toEqual(["foil:bramwell"]);
    expect(claimed.cardIds).toEqual(["foil:bramwell"]);
  });

  it("gives the card plus its foil for a card the player does not own", () => {
    const claimed = claimDoor(defaultPubState(), DEC_25, 6, EVENTS)!;
    expect(claimed.next.collection).toEqual(["yule-log", "foil:yule-log"]);
  });

  it("gives only the foil once the card is owned in the collection", () => {
    const owned: PubState = { ...defaultPubState(), collection: ["yule-log"] };
    expect(claimDoor(owned, DEC_25, 6, EVENTS)!.next.collection).toEqual(["yule-log", "foil:yule-log"]);
  });
});

describe("tokens", () => {
  it("are granted by a door and held until spent, exactly once", () => {
    const held = claimDoor(defaultPubState(), DEC_24, 3, EVENTS)!.next;
    expect(tokenCount(held, "lostAndFoundUncommon")).toBe(1);
    const spent = spendToken(held, "lostAndFoundUncommon");
    expect(tokenCount(spent, "lostAndFoundUncommon")).toBe(0);
    expect(spendToken(spent, "lostAndFoundUncommon")).toBe(spent);
  });

  it("the Lost & Found token makes the next pull at least uncommon", () => {
    for (let day = 0; day < 40; day++) {
      const date = new Date(2026, 0, 1 + day);
      expect(rollLostAndFound([], date, { atLeastUncommon: true }).rarity).not.toBe("common");
    }
  });

  it("the Tinker's Bench token makes one fusing free, then the fee returns", () => {
    const held = claimDoor(defaultPubState(), DEC_24, 4, EVENTS)!.next;
    expect(tinkerFee(held, DEC_24, TINKER_FEE_CHECKS)).toBe(0);
    const after = spendFreeFuse(held, DEC_24);
    expect(tokenCount(after, "tinkerFree")).toBe(0);
    expect(tinkerFee(after, DEC_24, TINKER_FEE_CHECKS)).toBe(TINKER_FEE_CHECKS);
  });

  it("stacks with the Booth's tinkerFree omen without double-spending: the omen goes first, then the token", () => {
    const magician: PubState = {
      ...defaultPubState(),
      ledger: { ...defaultLedger(), firstLaunch: "2026-12-01", boothDraws: [{ arcanaId: "tarot-the-magician", date: "2026-12-24" }] },
    };
    const both = claimDoor(magician, DEC_24, 4, EVENTS)!.next;
    expect(tinkerFee(both, DEC_24, TINKER_FEE_CHECKS)).toBe(0);
    const first = spendFreeFuse(both, DEC_24);
    expect(tokenCount(first, "tinkerFree")).toBe(1);
    expect(tinkerFee(first, DEC_24, TINKER_FEE_CHECKS)).toBe(0); // the token covers the second fusing
    const second = spendFreeFuse(first, DEC_24);
    expect(tokenCount(second, "tinkerFree")).toBe(0);
    expect(tinkerFee(second, DEC_24, TINKER_FEE_CHECKS)).toBe(TINKER_FEE_CHECKS);
  });
});

describe("weather", () => {
  it("is undefined outside any pack that sets it", () => {
    expect(eventWeather(new Date(2026, 5, 1))).toBeUndefined();
  });
});

describe("registered cabinets", () => {
  it("number their doors uniquely from 1, and no two cabinets share a day", () => {
    const cabinets = SEASONAL_EVENTS.filter((e) => e.advent);
    for (const e of cabinets) {
      const days = e.advent!.doors.map((d) => d.day);
      expect(new Set(days).size, e.id).toBe(days.length);
      expect(Math.min(...days), e.id).toBeGreaterThanOrEqual(1);
    }
    for (let m = 0; m < 12; m++) {
      for (let d = 1; d <= 28; d++) {
        const date = new Date(2026, m, d, 12);
        expect(cabinets.filter((e) => liveAdvent(date, [e])).length, `${m + 1}/${d}`).toBeLessThanOrEqual(1);
      }
    }
  });
});
