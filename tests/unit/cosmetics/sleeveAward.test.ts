// Earning a sleeve (design.md §17.5): 3 wins dated inside the event's window,
// in the same year; wins outside it don't count; awarded once.

import { describe, expect, it } from "vitest";

import { SLEEVE_AWARD_LINE, SLEEVE_WINS_REQUIRED, awardSleeves, recordEventWin } from "../../../src/cosmetics/sleeveAward.ts";
import { DEFAULT_SLEEVE_ID, SLEEVES, type Sleeve } from "../../../src/cosmetics/sleeves.ts";
import { TEST_PACK } from "../../../src/events/packs/testPack.ts";
import type { SeasonalEvent } from "../../../src/events/seasonalEvents.ts";
import { defaultPubState, recordPickupResult, recordTournamentMatchResult, type PubState } from "../../../src/pub/pubState.ts";

// A test-only event with a sleeve, Jan 10-12 (the test pack's window; no real pack overlaps it).
const SLEEVE: Sleeve = { id: "sleeve-test", name: "Test Sleeve", artId: "sleeve-test", source: { kind: "event", eventId: "test-pack" } };
const EVENT: SeasonalEvent = { ...TEST_PACK, sleeveId: SLEEVE.id };
const EVENTS = [EVENT];
const SLEEVE_REGISTRY = [...SLEEVES, SLEEVE];

const day = (year: number, month: number, date: number) => new Date(year, month - 1, date, 12);

/** Plays `dates` as wins: counts each, awards after each, returns the final state and every award. */
function winOn(pub: PubState, dates: Date[]): { pub: PubState; awards: Sleeve[] } {
  const awards: Sleeve[] = [];
  let state = pub;
  for (const date of dates) {
    state = recordEventWin(state, date, EVENTS);
    const result = awardSleeves(state, EVENTS, SLEEVE_REGISTRY);
    state = result.next;
    awards.push(...result.awarded);
  }
  return { pub: state, awards };
}

describe("recordEventWin", () => {
  it("counts a win inside the window under the event and year", () => {
    expect(recordEventWin(defaultPubState(), day(2027, 1, 11), EVENTS).eventWins).toEqual({ "test-pack": { "2027": 1 } });
  });

  it("ignores wins before the window opens and after it closes", () => {
    const pub = defaultPubState();
    expect(recordEventWin(pub, day(2027, 1, 9), EVENTS)).toBe(pub);
    expect(recordEventWin(pub, day(2027, 1, 13), EVENTS)).toBe(pub);
  });

  it("counts both ends of the window", () => {
    const { pub } = winOn(defaultPubState(), [day(2027, 1, 10), day(2027, 1, 12)]);
    expect(pub.eventWins["test-pack"]!["2027"]).toBe(2);
  });

  it("ignores an event with no sleeve", () => {
    const pub = defaultPubState();
    expect(recordEventWin(pub, day(2027, 1, 11), [TEST_PACK])).toBe(pub);
  });

  it("keeps each year's count separate", () => {
    const { pub } = winOn(defaultPubState(), [day(2027, 1, 11), day(2028, 1, 11)]);
    expect(pub.eventWins["test-pack"]).toEqual({ "2027": 1, "2028": 1 });
  });
});

describe("awardSleeves", () => {
  it("needs exactly SLEEVE_WINS_REQUIRED wins: nothing at two, the sleeve at three", () => {
    expect(SLEEVE_WINS_REQUIRED).toBe(3);
    const two = winOn(defaultPubState(), [day(2027, 1, 10), day(2027, 1, 11)]);
    expect(two.awards).toEqual([]);
    expect(two.pub.ownedSleeves).toEqual([DEFAULT_SLEEVE_ID]);
    const three = winOn(two.pub, [day(2027, 1, 12)]);
    expect(three.awards).toEqual([SLEEVE]);
    expect(three.pub.ownedSleeves).toEqual([DEFAULT_SLEEVE_ID, SLEEVE.id]);
  });

  it("wins outside the window don't count toward the three", () => {
    const { pub, awards } = winOn(defaultPubState(), [day(2027, 1, 9), day(2027, 1, 10), day(2027, 1, 11), day(2027, 1, 13), day(2027, 2, 1)]);
    expect(awards).toEqual([]);
    expect(pub.ownedSleeves).toEqual([DEFAULT_SLEEVE_ID]);
  });

  it("wins in different years don't add up", () => {
    const { awards } = winOn(defaultPubState(), [day(2027, 1, 10), day(2027, 1, 11), day(2028, 1, 10), day(2028, 1, 11)]);
    expect(awards).toEqual([]);
  });

  it("is awarded once: more wins, and a later year's three, never award it again", () => {
    const first = winOn(defaultPubState(), [day(2027, 1, 10), day(2027, 1, 11), day(2027, 1, 12), day(2027, 1, 12), day(2027, 1, 12)]);
    expect(first.awards).toHaveLength(1);
    const nextYear = winOn(first.pub, [day(2028, 1, 10), day(2028, 1, 11), day(2028, 1, 12)]);
    expect(nextYear.awards).toEqual([]);
    expect(nextYear.pub.ownedSleeves.filter((id) => id === SLEEVE.id)).toHaveLength(1);
  });

  it("returns the same state when there is nothing to award", () => {
    const pub = defaultPubState();
    const result = awardSleeves(pub, EVENTS, SLEEVE_REGISTRY);
    expect(result.next).toBe(pub);
    expect(result.awarded).toEqual([]);
  });

  it("ignores an event whose sleeve is not in the registry (nothing earnable on the live site)", () => {
    let pub = defaultPubState();
    for (const d of [day(2027, 1, 10), day(2027, 1, 11), day(2027, 1, 12)]) pub = recordEventWin(pub, d, EVENTS);
    expect(awardSleeves(pub, EVENTS, SLEEVES).awarded).toEqual([]);
  });

  it("no real event has a sleeveId yet, so no real win is counted or awarded", async () => {
    const { SEASONAL_EVENTS } = await import("../../../src/events/seasonalEvents.ts");
    expect(SEASONAL_EVENTS.filter((e) => e.sleeveId !== undefined)).toEqual([]);
    const pub = defaultPubState();
    expect(recordEventWin(pub, day(2027, 1, 15))).toBe(pub);
  });

  it("the beer mat line is Sir Charles's", () => {
    expect(SLEEVE_AWARD_LINE).toBe("Sir Charles found these in the cellar. They fit your cards. They fit nobody else's.");
  });
});

describe("the win recording itself stays unchanged", () => {
  it("recordPickupResult and recordTournamentMatchResult leave sleeves and dated wins alone", () => {
    const pub = defaultPubState();
    const { next } = recordPickupResult(pub, "constable-tobias-mudd", "regular", null, "win", day(2027, 1, 11));
    expect(next.ownedSleeves).toEqual(pub.ownedSleeves);
    expect(next.eventWins).toEqual({});
    expect(recordTournamentMatchResult(pub, "constable-tobias-mudd", "regular", null, "win").eventWins).toEqual({});
  });
});
