import { beforeEach, describe, expect, it } from "vitest";

import {
  defaultTutorialState,
  hasShownHint,
  isWithinHintWindow,
  loadTutorialState,
  markHintShown,
  markTutorialCompleted,
  recordMatchPlayed,
  saveTutorialState,
} from "../../../src/tutorial/tutorialState.ts";

describe("tutorial state (plan step 2.7)", () => {
  beforeEach(() => localStorage.clear());

  it("defaults to not-completed with no matches played and no hints shown", () => {
    expect(loadTutorialState()).toEqual(defaultTutorialState());
  });

  it("marking the tutorial completed sets matchesPlayed to 1 (design.md §13.3 counts it as the first match)", () => {
    const next = markTutorialCompleted(defaultTutorialState());
    expect(next).toEqual({ completed: true, matchesPlayed: 1, shownHints: [] });
  });

  it("records match plays and hint shows, and round-trips through storage", () => {
    let state = markTutorialCompleted(defaultTutorialState());
    state = recordMatchPlayed(state); // match 2
    expect(state.matchesPlayed).toBe(2);
    state = markHintShown(state, "location");
    expect(hasShownHint(state, "location")).toBe(true);
    expect(hasShownHint(state, "headline")).toBe(false);

    saveTutorialState(state);
    expect(loadTutorialState()).toEqual(state);
  });

  it("marking an already-shown hint again is a no-op", () => {
    const once = markHintShown(defaultTutorialState(), "return");
    const twice = markHintShown(once, "return");
    expect(twice.shownHints).toEqual(["return"]);
  });

  it("the hint window covers matches 2-4 (matchesPlayed 1-3 before the upcoming match)", () => {
    expect(isWithinHintWindow(0)).toBe(false); // about to play match 1 (the tutorial itself)
    expect(isWithinHintWindow(1)).toBe(true); // about to play match 2
    expect(isWithinHintWindow(3)).toBe(true); // about to play match 4
    expect(isWithinHintWindow(4)).toBe(false); // about to play match 5
  });

  it("falls back to the default on corrupt storage", () => {
    localStorage.setItem("steampunk-shuffle:tutorial-state", "{not json");
    expect(loadTutorialState()).toEqual(defaultTutorialState());
  });
});
