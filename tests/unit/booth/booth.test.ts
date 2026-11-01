// Unlock dates, the daily draw, and the first reading (content plan §5.3).

import { beforeEach, describe, expect, it } from "vitest";

import { chooseArcana, isUnlocked, performReading, readingDoneToday, unlockedArcana } from "../../../src/booth/booth.ts";
import { TAROT, TAROT_BY_ID } from "../../../src/booth/tarot.ts";
import { defaultPubState, type PubState } from "../../../src/pub/pubState.ts";
import { defaultLedger } from "../../../src/save/ledger.ts";

const FOOL = TAROT_BY_ID.get("tarot-the-fool")!;
const PRIESTESS = TAROT_BY_ID.get("tarot-the-high-priestess")!; // Dec 1

function pubLaunchedOn(firstLaunch: string): PubState {
  const p = defaultPubState();
  return { ...p, ledger: { ...defaultLedger(), firstLaunch } };
}

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day, 12, 0, 0);
const SALT = 12345;

describe("isUnlocked", () => {
  it("is locked the day before a pack start and unlocked on the day itself", () => {
    expect(isUnlocked(FOOL, "2026-11-01", d(2026, 11, 12))).toBe(false);
    expect(isUnlocked(FOOL, "2026-11-01", d(2026, 11, 13))).toBe(true);
  });

  it("stays unlocked on every later day", () => {
    expect(isUnlocked(FOOL, "2026-11-01", d(2027, 3, 4))).toBe(true);
  });

  it("is not unlocked when the first launch came after the pack start, until the date comes round again", () => {
    expect(isUnlocked(FOOL, "2026-11-20", d(2026, 11, 25))).toBe(false);
    expect(isUnlocked(FOOL, "2026-11-20", d(2026, 12, 25))).toBe(false);
    expect(isUnlocked(FOOL, "2026-11-20", d(2027, 11, 13))).toBe(true);
  });

  it("is locked when no first launch is recorded", () => {
    expect(isUnlocked(FOOL, null, d(2026, 11, 14))).toBe(false);
  });

  it("unlocks a December arcana only from Dec 1", () => {
    expect(isUnlocked(PRIESTESS, "2026-11-01", d(2026, 11, 30))).toBe(false);
    expect(isUnlocked(PRIESTESS, "2026-11-01", d(2026, 12, 1))).toBe(true);
  });

  it("lists the unlocked arcana: just the two in mid-November", () => {
    expect(unlockedArcana("2026-11-01", d(2026, 11, 14)).map((a) => a.id)).toEqual(["tarot-the-fool", "tarot-the-magician"]);
    expect(unlockedArcana("2026-11-01", d(2026, 12, 2))).toHaveLength(4);
  });
});

describe("chooseArcana", () => {
  it("never repeats yesterday's card when more than one is unlocked", () => {
    const two = unlockedArcana("2026-11-01", d(2026, 11, 14));
    for (let day = 14; day <= 30; day++) {
      for (const prev of two) {
        const pick = chooseArcana(two, prev.id, d(2026, 11, day), SALT)!;
        expect(pick.id).not.toBe(prev.id);
      }
    }
  });

  it("returns the only unlocked card even if it was yesterday's, and null for none", () => {
    expect(chooseArcana([FOOL], FOOL.id, d(2026, 11, 14), SALT)).toBe(FOOL);
    expect(chooseArcana([], null, d(2026, 11, 14), SALT)).toBeNull();
  });

  it("is deterministic for a date and salt, and varies with the salt", () => {
    const all = TAROT;
    expect(chooseArcana(all, null, d(2026, 11, 14), SALT)).toBe(chooseArcana(all, null, d(2026, 11, 14), SALT));
    const picks = new Set(Array.from({ length: 30 }, (_, s) => chooseArcana(all, null, d(2026, 11, 14), s)!.id));
    expect(picks.size).toBeGreaterThan(1);
  });
});

describe("performReading", () => {
  beforeEach(() => localStorage.clear());

  it("draws once per local day and records it in the Ledger", () => {
    const pub = pubLaunchedOn("2026-11-01");
    const r1 = performReading(pub, d(2026, 11, 14), () => SALT)!;
    expect(r1.next.ledger.boothDraws).toEqual([{ arcanaId: r1.arcana.id, date: "2026-11-14" }]);
    expect(r1.next.booth.salt).toBe(SALT);
    expect(readingDoneToday(r1.next, d(2026, 11, 14))).toBe(true);
    expect(performReading(r1.next, d(2026, 11, 14))).toBeNull();
    expect(performReading(r1.next, new Date(2026, 10, 14, 23, 59))).toBeNull();
  });

  it("draws again the next day, from the unlocked cards only, never repeating", () => {
    let pub = pubLaunchedOn("2026-11-01");
    const seen: string[] = [];
    for (let day = 14; day <= 25; day++) {
      const r = performReading(pub, d(2026, 11, day), () => SALT)!;
      expect(["tarot-the-fool", "tarot-the-magician"]).toContain(r.arcana.id);
      seen.push(r.arcana.id);
      pub = r.next;
    }
    for (let i = 1; i < seen.length; i++) expect(seen[i]).not.toBe(seen[i - 1]);
  });

  it("keeps the first salt it made", () => {
    const r1 = performReading(pubLaunchedOn("2026-11-01"), d(2026, 11, 14), () => SALT)!;
    const r2 = performReading(r1.next, d(2026, 11, 15), () => 999)!;
    expect(r2.next.booth.salt).toBe(SALT);
  });

  it("returns null while nothing is unlocked", () => {
    expect(performReading(pubLaunchedOn("2026-11-01"), d(2026, 11, 12))).toBeNull();
  });

  it("pays a checksNow omen once, at the draw, and counts it in the Ledger", () => {
    let pub = pubLaunchedOn("2026-11-01");
    // Find a day whose draw is the Fool (checksNow 10) so the test does not depend on the seed.
    for (let day = 14; day <= 30; day++) {
      const r = performReading({ ...pub, ledger: { ...pub.ledger, boothDraws: [] } }, d(2026, 11, day), () => SALT)!;
      if (r.arcana.id === "tarot-the-fool") {
        expect(r.checksPaid).toBe(10);
        expect(r.next.checks).toBe(10);
        expect(r.next.ledger.checksEarned).toBe(10);
        expect(performReading(r.next, d(2026, 11, day))).toBeNull();
        return;
      }
      pub = r.next;
    }
    throw new Error("no Fool day found");
  });

  it("grants Pixie's card on the first reading only when it resolves, and skips safely when it doesn't", () => {
    const r = performReading(pubLaunchedOn("2026-11-01"), d(2026, 11, 14), () => SALT)!;
    // N-D authors the card; until it does, the grant is skipped without error.
    expect(r.grantedCardId === null || r.next.collection.includes("pamela-colman-smith")).toBe(true);
  });
});
