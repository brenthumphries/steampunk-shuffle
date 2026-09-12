// In-progress match persistence (plan step 2.6, design.md §12.4).

import { beforeEach, describe, expect, it } from "vitest";

import { starterDeck } from "../../../src/cards/data/decks/starterDeck.ts";
import { createMatch } from "../../../src/engine/matchEngine.ts";
import { clearActiveMatch, loadActiveMatch, saveActiveMatch, type ActiveMatchSave } from "../../../src/save/activeMatch.ts";

const STORAGE_KEY = "steampunk-shuffle:active-match";

beforeEach(() => {
  localStorage.clear();
});

function makeSave(): ActiveMatchSave {
  return {
    matchState: createMatch(starterDeck, starterDeck, { seed: 1 }),
    aiSeed: 42,
    humanDeck: starterDeck,
    humanDeckName: "The Village Constable",
    context: { kind: "pickup", opponentId: "constable-tobias-mudd", stakedCardId: null },
  };
}

describe("loadActiveMatch", () => {
  it("returns null when nothing is saved", () => {
    expect(loadActiveMatch()).toBeNull();
  });

  it("returns null on corrupt JSON rather than throwing", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadActiveMatch()).toBeNull();
  });

  it("returns null when the match state shape doesn't match", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...makeSave(), matchState: { status: "in-progress" } }));
    expect(loadActiveMatch()).toBeNull();
  });

  it("returns null for an unrecognized tournament id", () => {
    const save = { ...makeSave(), context: { kind: "tournament", tournamentId: "not-a-real-tournament" } };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
    expect(loadActiveMatch()).toBeNull();
  });
});

describe("saveActiveMatch / loadActiveMatch round trip", () => {
  it("persists a pickup match", () => {
    const save = makeSave();
    saveActiveMatch(save);
    expect(loadActiveMatch()).toEqual(save);
  });

  it("persists a tournament match", () => {
    const save: ActiveMatchSave = { ...makeSave(), context: { kind: "tournament", tournamentId: "tuesday-knockout" } };
    saveActiveMatch(save);
    expect(loadActiveMatch()).toEqual(save);
  });
});

describe("clearActiveMatch", () => {
  it("removes a saved match", () => {
    saveActiveMatch(makeSave());
    clearActiveMatch();
    expect(loadActiveMatch()).toBeNull();
  });

  it("is a no-op when nothing was saved", () => {
    expect(() => clearActiveMatch()).not.toThrow();
  });
});
