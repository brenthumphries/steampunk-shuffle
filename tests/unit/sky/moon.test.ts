// src/sky/moon.ts: Meeus chapter 49, checked three ways.
//  1. Meeus's own worked example (example 49.a).
//  2. Full and new moon instants for 2026-2027 against an independent
//     implementation. The US Naval Observatory API (aa.usno.navy.mil) and the
//     HM Nautical Almanac Office tables could not be reached from the build
//     sandbox, so the dates below were taken from PyEphem 4.x (libastro,
//     VSOP87/ELP-based, `ephem.next_full_moon` / `next_new_moon`), which is
//     computed independently of Meeus's chapter 49 series. They are NOT a
//     published almanac table; compare them with the USNO table before leaning
//     on them as one. Tolerance: 10 minutes.
//  3. Synodic-month spacing, which needs no outside source.

import { describe, expect, it } from "vitest";

import { isFullMoonNight, moonEventInstant, moonEventJDE, moonPhase } from "../../../src/sky/moon.ts";

const MINUTE = 60_000;

describe("Meeus chapter 49", () => {
  it("reproduces worked example 49.a: the new moon of February 1977 (k = -283)", () => {
    expect(moonEventJDE(-283)).toBeCloseTo(2443192.65118, 4);
  });

  it("keeps the mean synodic month between successive full moons", () => {
    for (let k = 320.5; k < 345.5; k++) {
      const days = (moonEventInstant(k + 1).getTime() - moonEventInstant(k).getTime()) / 86_400_000;
      expect(days).toBeGreaterThan(29.27);
      expect(days).toBeLessThan(29.84);
    }
  });

  it("puts a full moon half a lunation after each new moon", () => {
    for (let k = 320; k < 345; k++) {
      const days = (moonEventInstant(k + 0.5).getTime() - moonEventInstant(k).getTime()) / 86_400_000;
      expect(days).toBeGreaterThan(13.8);
      expect(days).toBeLessThan(15.7);
    }
  });
});

// UT instants from PyEphem (see the header).
const FULL_MOONS_UT = [
  "2026-01-03T10:02:50Z", "2026-02-01T22:09:10Z", "2026-03-03T11:37:49Z", "2026-04-02T02:11:54Z",
  "2026-05-01T17:23:06Z", "2026-05-31T08:45:07Z", "2026-06-29T23:56:35Z", "2026-07-29T14:35:37Z",
  "2026-08-28T04:18:26Z", "2026-09-26T16:48:57Z", "2026-10-26T04:11:44Z", "2026-11-24T14:53:29Z",
  "2026-12-24T01:28:09Z", "2027-01-22T12:17:18Z", "2027-02-20T23:23:34Z", "2027-03-22T10:43:43Z",
  "2027-04-20T22:27:04Z", "2027-05-20T10:58:55Z", "2027-06-19T00:44:14Z", "2027-07-18T15:44:48Z",
  "2027-08-17T07:28:35Z", "2027-09-15T23:03:26Z", "2027-10-15T13:46:55Z", "2027-11-14T03:25:50Z",
  "2027-12-13T16:08:42Z",
];
const NEW_MOONS_UT = [
  "2026-01-18T19:51:54Z", "2026-02-17T12:01:04Z", "2026-03-19T01:23:24Z", "2026-04-17T11:51:44Z",
  "2026-05-16T20:00:58Z", "2026-06-15T02:54:04Z", "2026-07-14T09:43:31Z", "2026-08-12T17:36:39Z",
  "2026-09-11T03:26:55Z", "2026-10-10T15:50:01Z", "2026-11-09T07:02:03Z", "2026-12-09T00:51:46Z",
  "2027-01-07T20:24:18Z", "2027-02-06T15:56:02Z", "2027-03-08T09:29:24Z", "2027-04-06T23:51:05Z",
  "2027-05-06T10:58:32Z", "2027-06-04T19:40:15Z", "2027-07-04T03:01:58Z", "2027-08-02T10:05:08Z",
  "2027-08-31T17:41:05Z", "2027-09-30T02:35:59Z", "2027-10-29T13:36:28Z", "2027-11-28T03:24:21Z",
  "2027-12-27T20:12:14Z",
];

/** The lunation number (k) whose event is nearest `iso`. */
function kFor(iso: string, full: boolean): number {
  const mean = (Date.parse(iso) - Date.UTC(2000, 0, 6, 18, 14)) / 86_400_000 / 29.530588861;
  return full ? Math.round(mean - 0.5) + 0.5 : Math.round(mean);
}

describe("moon instants, 2026-2027", () => {
  it.each(FULL_MOONS_UT)("full moon %s", (iso) => {
    const got = moonEventInstant(kFor(iso, true)).getTime();
    expect(Math.abs(got - Date.parse(iso))).toBeLessThan(10 * MINUTE);
  });

  it.each(NEW_MOONS_UT)("new moon %s", (iso) => {
    const got = moonEventInstant(kFor(iso, false)).getTime();
    expect(Math.abs(got - Date.parse(iso))).toBeLessThan(10 * MINUTE);
  });
});

/** Local noon on the UT calendar date of an instant, whatever the machine's time zone. */
const noonOnUtDate = (iso: string, offsetDays = 0) => {
  const d = new Date(iso);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + offsetDays, 12);
};

describe("isFullMoonNight", () => {
  it.each(FULL_MOONS_UT)("is true on the day of the full moon, %s, and false three days either side", (iso) => {
    expect(isFullMoonNight(noonOnUtDate(iso))).toBe(true);
    expect(isFullMoonNight(noonOnUtDate(iso, -3))).toBe(false);
    expect(isFullMoonNight(noonOnUtDate(iso, 3))).toBe(false);
  });

  it("covers the day before and the day after a full moon (24 Nov 2026 14:53 UT), in the machine's local time", () => {
    // Local days are read from the local clock, so build them in local time and
    // check the three-day window around whichever local day holds the instant.
    const local = new Date("2026-11-24T14:53:29Z");
    const day = (offset: number) => new Date(local.getFullYear(), local.getMonth(), local.getDate() + offset, 12);
    expect([-2, -1, 0, 1, 2].map((o) => isFullMoonNight(day(o)))).toEqual([false, true, true, true, false]);
  });

  it("is a different answer at either end of a day, but only by calendar day: 00:01 and 23:59 agree", () => {
    const morning = new Date(2026, 10, 10, 0, 1);
    const night = new Date(2026, 10, 10, 23, 59);
    expect(isFullMoonNight(morning)).toBe(isFullMoonNight(night));
  });

  it("holds on about three days in twenty-nine", () => {
    let nights = 0;
    for (let d = 0; d < 365; d++) if (isFullMoonNight(new Date(2027, 0, 1 + d, 12))) nights++;
    expect(nights).toBeGreaterThanOrEqual(36);
    expect(nights).toBeLessThanOrEqual(40);
  });
});

describe("moonPhase", () => {
  it("is full and fully lit at a full moon, new and dark at a new moon", () => {
    const full = moonPhase(new Date("2026-11-24T14:53:29Z"));
    expect(full.name).toBe("full");
    expect(full.illumination).toBeGreaterThan(0.99);
    const fresh = moonPhase(new Date("2026-11-09T07:02:03Z"));
    expect(fresh.name).toBe("new");
    expect(fresh.illumination).toBeLessThan(0.01);
  });

  it("passes through all eight named states, in order, over a lunation", () => {
    const start = Date.parse("2026-11-09T07:02:03Z");
    const names: string[] = [];
    for (let h = 0; h < 29.4 * 24; h += 6) {
      const name = moonPhase(new Date(start + h * 3_600_000)).name;
      if (names[names.length - 1] !== name) names.push(name);
    }
    expect(names).toEqual(["new", "waxing-crescent", "first-quarter", "waxing-gibbous", "full", "waning-gibbous", "last-quarter", "waning-crescent", "new"]);
  });

  it("is about half lit a week after a new moon and waxes then wanes", () => {
    const start = Date.parse("2026-11-09T07:02:03Z");
    const at = (days: number) => moonPhase(new Date(start + days * 86_400_000));
    expect(at(7.4).illumination).toBeGreaterThan(0.45);
    expect(at(7.4).illumination).toBeLessThan(0.55);
    expect(at(3).illumination).toBeLessThan(at(7).illumination);
    expect(at(18).illumination).toBeGreaterThan(at(25).illumination);
    expect(at(3).name).toBe("waxing-crescent");
    expect(at(25).name).toBe("waning-crescent");
  });

  it("gives plausible dates for known phases (13 Dec 2026 is a waxing crescent, 27 Dec is a waning gibbous)", () => {
    expect(moonPhase(new Date(2026, 11, 13, 12)).name).toBe("waxing-crescent");
    expect(moonPhase(new Date(2026, 11, 27, 12)).name).toBe("waning-gibbous");
  });
});
