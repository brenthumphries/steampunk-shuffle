// Tournament persistence and the Birthday Invitational's Oct-30 date
// trigger (plan step 2.4, design.md §10, §14.6). The exit check calls for
// "testing the date trigger by faking the clock" — every test here passes
// an explicit `Date` rather than relying on the real system clock.

import { beforeEach, describe, expect, it } from "vitest";

import {
  checkInvitationalTrigger,
  clearActiveBracket,
  defaultTournamentState,
  loadTournamentState,
  saveTournamentState,
  startBracket,
  updateActiveBracket,
  type TournamentState,
} from "../../../src/tournaments/tournamentState.ts";
import type { TournamentBracket } from "../../../src/tournaments/bracket.ts";

beforeEach(() => {
  localStorage.clear();
});

const bracket: TournamentBracket = {
  tournamentId: "tuesday-knockout",
  seatOpponentIds: ["mudd", "nell-ashby", "reg-farrow", "prudence-hollis", "bucket", "lovelace", "adler"],
  playerMatches: [
    { opponentId: "mudd", outcome: "pending" },
    { opponentId: "nell-ashby", outcome: "pending" },
    { opponentId: "bucket", outcome: "pending" },
  ],
  status: "in-progress",
};

describe("checkInvitationalTrigger", () => {
  it("does not trigger before October 30", () => {
    const state = checkInvitationalTrigger(defaultTournamentState(), new Date(2026, 9, 29));
    expect(state.invitationalTriggered).toBe(false);
  });

  it("triggers on October 30, any year", () => {
    const state2026 = checkInvitationalTrigger(defaultTournamentState(), new Date(2026, 9, 30));
    expect(state2026.invitationalTriggered).toBe(true);

    const state2031 = checkInvitationalTrigger(defaultTournamentState(), new Date(2031, 9, 30));
    expect(state2031.invitationalTriggered).toBe(true);
  });

  it("stays triggered on later dates once it has fired", () => {
    let state = checkInvitationalTrigger(defaultTournamentState(), new Date(2026, 9, 30));
    expect(state.invitationalTriggered).toBe(true);
    state = checkInvitationalTrigger(state, new Date(2026, 10, 15));
    expect(state.invitationalTriggered).toBe(true);
  });

  it("returns the same object reference when nothing changed (cheap no-op check for callers)", () => {
    const state = defaultTournamentState();
    expect(checkInvitationalTrigger(state, new Date(2026, 5, 1))).toBe(state);
  });
});

describe("bracket lifecycle helpers", () => {
  it("startBracket / updateActiveBracket / clearActiveBracket manage the active bracket", () => {
    let state: TournamentState = defaultTournamentState();
    state = startBracket(state, bracket);
    expect(state.active).toEqual(bracket);

    const advanced: TournamentBracket = { ...bracket, playerMatches: [{ ...bracket.playerMatches[0], outcome: "won" }, bracket.playerMatches[1], bracket.playerMatches[2]] };
    state = updateActiveBracket(state, advanced);
    expect(state.active?.playerMatches[0].outcome).toBe("won");

    state = clearActiveBracket(state);
    expect(state.active).toBeNull();
  });
});

describe("loadTournamentState / saveTournamentState", () => {
  it("returns the default state when nothing is saved", () => {
    expect(loadTournamentState()).toEqual(defaultTournamentState());
  });

  it("falls back to defaults on corrupt JSON", () => {
    localStorage.setItem("steampunk-shuffle:tournament-state", "{not json");
    expect(loadTournamentState()).toEqual(defaultTournamentState());
  });

  it("falls back to defaults when the shape doesn't match", () => {
    localStorage.setItem("steampunk-shuffle:tournament-state", JSON.stringify({ invitationalTriggered: "yes" }));
    expect(loadTournamentState()).toEqual(defaultTournamentState());
  });

  it("round-trips a real state with an active bracket", () => {
    const state = startBracket(checkInvitationalTrigger(defaultTournamentState(), new Date(2026, 9, 30)), bracket);
    saveTournamentState(state);
    expect(loadTournamentState()).toEqual(state);
  });
});
