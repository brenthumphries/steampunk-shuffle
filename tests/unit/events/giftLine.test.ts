// Beer-mat wording for arrival gifts (PT-47, PT-50): an on-time gift in a later
// year uses its normal line, and only a late (grace-period) claim reads as late.

import { beforeEach, describe, expect, it } from "vitest";

import { giftLine, grantArrivalGifts } from "../../../src/events/arrivals.ts";
import { CUNNING_FOLK } from "../../../src/events/packs/cunningFolk.ts";
import { GHOST_STORY } from "../../../src/events/packs/ghostStory.ts";
import { defaultPubState, type PubState } from "../../../src/pub/pubState.ts";
import { migratedLedger } from "../../../src/save/ledger.ts";
import { withContents } from "../../../src/ui/adventCabinet.ts";

const day = (year: number, month: number, date: number) => new Date(year, month - 1, date);
const player = (firstLaunch: string): PubState => ({ ...defaultPubState(), ledger: migratedLedger(firstLaunch) });
const lineFor = (pub: PubState, date: Date, key: string): string => {
  const due = grantArrivalGifts(pub, date).granted.find((g) => g.key === key);
  if (!due) throw new Error(`no gift ${key} on ${date.toDateString()}`);
  return giftLine(due);
};
const scorpio = CUNNING_FOLK.arrivalGifts.find((g) => g.id === "left-on-the-step")!;

beforeEach(() => localStorage.clear());

describe("Scorpio gift wording", () => {
  it("2026 on time keeps the belated line", () => {
    expect(lineFor(player("2026-10-31"), day(2026, 11, 1), "left-on-the-step")).toBe(scorpio.line);
    expect(scorpio.line).toContain("belated");
  });

  it("2027 on time uses the repeat line, not 'belated'", () => {
    const line = lineFor(player("2026-10-31"), day(2027, 11, 4), "left-on-the-step");
    expect(line).toBe(scorpio.repeatLine);
    expect(line).not.toContain("belated");
  });

  it("a late 2027 claim (in the grace period) says belated", () => {
    expect(lineFor(player("2026-10-31"), day(2027, 12, 3), "left-on-the-step")).toContain("belated");
  });
});

describe("Capricorn gift wording", () => {
  const capricorn = GHOST_STORY.arrivalGifts.find((g) => g.id === "almanack-seller")!;

  it("on Dec 22 keeps the original line", () => {
    expect(lineFor(player("2026-10-31"), day(2026, 12, 22), "almanack-seller")).toBe(capricorn.line);
  });

  it("a late claim on Jan 1 does not say 'next month's page'", () => {
    const line = lineFor(player("2026-10-31"), day(2027, 1, 1), "almanack-seller");
    expect(line).toBe(capricorn.lateLine);
    expect(line).not.toContain("next month");
  });
});

describe("withContents (PT-49)", () => {
  it("brackets plain contents", () => {
    expect(withContents("Merry.", "50 Checks")).toBe("Merry. (50 Checks)");
  });
  it("does not nest brackets around a foil name", () => {
    expect(withContents("They didn't wrap it.", "Bramwell (foil)")).toBe("They didn't wrap it. Bramwell (foil)");
  });
});
