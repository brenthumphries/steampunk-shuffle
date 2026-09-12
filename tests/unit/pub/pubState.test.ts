// Checks economy and reward-claim bookkeeping for the pub hub (plan step
// 2.3, design.md §11).

import { beforeEach, describe, expect, it } from "vitest";

import {
  applyTournamentPayout,
  DAILY_BONUS_CHECKS,
  deductChecks,
  defaultPubState,
  loadPubState,
  localDateKey,
  LOSE_CHECKS,
  recordPickupResult,
  recordTournamentMatchResult,
  savePubState,
  WIN_CHECKS,
  type PubState,
} from "../../../src/pub/pubState.ts";

beforeEach(() => {
  localStorage.clear();
});

const DAY_1 = new Date(2026, 8, 11, 20, 0, 0);
const DAY_1_LATER = new Date(2026, 8, 11, 22, 0, 0);
const DAY_2 = new Date(2026, 8, 12, 9, 0, 0);

describe("recordPickupResult", () => {
  it("pays win Checks plus the daily bonus and grants the reward card on a first win", () => {
    const outcome = recordPickupResult(defaultPubState(), "mudd", "regular", "sergeant-pike", "win", DAY_1);
    expect(outcome.checksEarned).toBe(WIN_CHECKS.regular + DAILY_BONUS_CHECKS);
    expect(outcome.rewardCardId).toBe("sergeant-pike");
    expect(outcome.next.checks).toBe(WIN_CHECKS.regular + DAILY_BONUS_CHECKS);
    expect(outcome.next.totalWins).toBe(1);
    expect(outcome.next.collection).toEqual(["sergeant-pike"]);
    expect(outcome.next.opponents["mudd"]).toEqual({ wins: 1, losses: 0, rewardClaimed: true });
  });

  it("pays win Checks with no reward card and no extra daily bonus on a later win the same day", () => {
    const first = recordPickupResult(defaultPubState(), "mudd", "regular", "sergeant-pike", "win", DAY_1);
    const second = recordPickupResult(first.next, "mudd", "regular", "sergeant-pike", "win", DAY_1_LATER);
    expect(second.checksEarned).toBe(WIN_CHECKS.regular);
    expect(second.rewardCardId).toBeNull();
    expect(second.next.collection).toEqual(["sergeant-pike"]);
    expect(second.next.totalWins).toBe(2);
  });

  it("pays the daily bonus again on the next real-world day", () => {
    const first = recordPickupResult(defaultPubState(), "mudd", "regular", "sergeant-pike", "win", DAY_1);
    const second = recordPickupResult(first.next, "mudd", "regular", "sergeant-pike", "win", DAY_2);
    expect(second.checksEarned).toBe(WIN_CHECKS.regular + DAILY_BONUS_CHECKS);
  });

  it("pays LOSE_CHECKS on a loss and doesn't touch the reward", () => {
    const outcome = recordPickupResult(defaultPubState(), "mudd", "regular", "sergeant-pike", "loss", DAY_1);
    expect(outcome.checksEarned).toBe(LOSE_CHECKS + DAILY_BONUS_CHECKS);
    expect(outcome.rewardCardId).toBeNull();
    expect(outcome.next.totalWins).toBe(0);
    expect(outcome.next.opponents["mudd"]).toEqual({ wins: 0, losses: 1, rewardClaimed: false });
  });

  it("is a no-op on a draw (design.md §6.3: pays no reward, counts as neither win nor loss)", () => {
    const state = defaultPubState();
    const outcome = recordPickupResult(state, "mudd", "regular", "sergeant-pike", "draw", DAY_1);
    expect(outcome.checksEarned).toBe(0);
    expect(outcome.rewardCardId).toBeNull();
    expect(outcome.next).toBe(state);
  });

  it("pays no win/loss Checks for the house tier (Sir Charles), only the daily bonus", () => {
    const win = recordPickupResult(defaultPubState(), "sir-charles", "house", null, "win", DAY_1);
    expect(win.checksEarned).toBe(DAILY_BONUS_CHECKS);
    expect(win.next.totalWins).toBe(0);

    const loss = recordPickupResult(defaultPubState(), "sir-charles", "house", null, "loss", DAY_1);
    expect(loss.checksEarned).toBe(DAILY_BONUS_CHECKS);
  });

  it("uses the seasoned/legend Checks amounts for those tiers", () => {
    const seasoned = recordPickupResult(defaultPubState(), "bucket", "seasoned", "buckets-forefinger", "win", DAY_1);
    expect(seasoned.checksEarned).toBe(WIN_CHECKS.seasoned + DAILY_BONUS_CHECKS);

    const legend = recordPickupResult(defaultPubState(), "holmes", "legend", "sherlock-holmes", "win", DAY_1);
    expect(legend.checksEarned).toBe(WIN_CHECKS.legend + DAILY_BONUS_CHECKS);
  });
});

describe("recordTournamentMatchResult (plan step 2.4)", () => {
  it("pays no Checks on a win, but still updates the record, grants a first-win reward, and counts toward totalWins", () => {
    const next = recordTournamentMatchResult(defaultPubState(), "mudd", "regular", "sergeant-pike", "win");
    expect(next.checks).toBe(0);
    expect(next.totalWins).toBe(1);
    expect(next.collection).toEqual(["sergeant-pike"]);
    expect(next.opponents["mudd"]).toEqual({ wins: 1, losses: 0, rewardClaimed: true });
  });

  it("pays no Checks on a loss and doesn't touch totalWins", () => {
    const next = recordTournamentMatchResult(defaultPubState(), "mudd", "regular", "sergeant-pike", "loss");
    expect(next.checks).toBe(0);
    expect(next.totalWins).toBe(0);
    expect(next.opponents["mudd"]).toEqual({ wins: 0, losses: 1, rewardClaimed: false });
  });

  it("doesn't grant the reward card again on a later win against the same opponent", () => {
    const first = recordTournamentMatchResult(defaultPubState(), "mudd", "regular", "sergeant-pike", "win");
    const second = recordTournamentMatchResult(first, "mudd", "regular", "sergeant-pike", "win");
    expect(second.collection).toEqual(["sergeant-pike"]);
    expect(second.totalWins).toBe(2);
  });

  it("doesn't count a Sir Charles win toward totalWins, same as pickup games", () => {
    const next = recordTournamentMatchResult(defaultPubState(), "sir-charles", "house", null, "win");
    expect(next.totalWins).toBe(0);
  });
});

describe("deductChecks / applyTournamentPayout (plan step 2.4)", () => {
  it("deducts an entry fee", () => {
    const state: PubState = { ...defaultPubState(), checks: 50 };
    expect(deductChecks(state, 20).checks).toBe(30);
  });

  it("never goes below 0", () => {
    const state: PubState = { ...defaultPubState(), checks: 10 };
    expect(deductChecks(state, 20).checks).toBe(0);
  });

  it("applies a consolation payout with no card", () => {
    const next = applyTournamentPayout(defaultPubState(), 10, null);
    expect(next.checks).toBe(10);
    expect(next.collection).toEqual([]);
  });

  it("applies a prize payout with a card added to the collection", () => {
    const next = applyTournamentPayout(defaultPubState(), 60, "some-uncommon");
    expect(next.checks).toBe(60);
    expect(next.collection).toEqual(["some-uncommon"]);
  });
});

describe("localDateKey", () => {
  it("formats the local calendar date, not the UTC one", () => {
    expect(localDateKey(new Date(2026, 8, 11, 23, 30))).toBe("2026-09-11");
    expect(localDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("loadPubState / savePubState", () => {
  it("returns the default state when nothing is saved", () => {
    expect(loadPubState()).toEqual(defaultPubState());
  });

  it("falls back to defaults on corrupt JSON rather than throwing", () => {
    localStorage.setItem("steampunk-shuffle:pub-state", "{not json");
    expect(loadPubState()).toEqual(defaultPubState());
  });

  it("falls back to defaults when the shape doesn't match", () => {
    localStorage.setItem("steampunk-shuffle:pub-state", JSON.stringify({ checks: "lots" }));
    expect(loadPubState()).toEqual(defaultPubState());
  });

  it("round-trips a real state", () => {
    const outcome = recordPickupResult(defaultPubState(), "mudd", "regular", "sergeant-pike", "win", DAY_1);
    savePubState(outcome.next);
    const reloaded: PubState = loadPubState();
    expect(reloaded).toEqual(outcome.next);
  });
});
