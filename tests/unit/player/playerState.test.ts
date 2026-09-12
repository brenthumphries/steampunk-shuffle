// localStorage persistence for the player's name/dedication flag (plan step 3.5).

import { beforeEach, describe, expect, it } from "vitest";

import { defaultPlayerState, loadPlayerState, markDedicationSeen, savePlayerState, setPlayerName } from "../../../src/player/playerState.ts";

beforeEach(() => {
  localStorage.clear();
});

describe("loadPlayerState", () => {
  it("defaults to Sara, dedication not yet seen (design.md §14.2)", () => {
    expect(loadPlayerState()).toEqual({ name: "Sara", dedicationSeen: false });
    expect(defaultPlayerState()).toEqual({ name: "Sara", dedicationSeen: false });
  });

  it("falls back to defaults on corrupt JSON rather than throwing", () => {
    localStorage.setItem("steampunk-shuffle:player", "{not json");
    expect(loadPlayerState()).toEqual({ name: "Sara", dedicationSeen: false });
  });

  it("falls back to defaults when the shape doesn't match", () => {
    localStorage.setItem("steampunk-shuffle:player", JSON.stringify({ name: 5, dedicationSeen: false }));
    expect(loadPlayerState()).toEqual({ name: "Sara", dedicationSeen: false });
  });
});

describe("savePlayerState / loadPlayerState round trip", () => {
  it("persists a renamed player and the dedication flag across a reload", () => {
    savePlayerState(setPlayerName(markDedicationSeen(defaultPlayerState()), "Constance"));
    expect(loadPlayerState()).toEqual({ name: "Constance", dedicationSeen: true });
  });
});

describe("setPlayerName", () => {
  it("trims whitespace", () => {
    expect(setPlayerName(defaultPlayerState(), "  Constance  ").name).toBe("Constance");
  });

  it("falls back to the default name rather than allowing a blank one", () => {
    expect(setPlayerName(defaultPlayerState(), "   ").name).toBe("Sara");
  });
});

describe("markDedicationSeen", () => {
  it("flips the flag without touching the name", () => {
    const state = markDedicationSeen(setPlayerName(defaultPlayerState(), "Constance"));
    expect(state).toEqual({ name: "Constance", dedicationSeen: true });
  });
});
