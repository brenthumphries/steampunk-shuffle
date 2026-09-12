// The unified export/import blob (plan step 2.6, design.md §12.4).

import { beforeEach, describe, expect, it } from "vitest";

import { ALL_CARDS } from "../../../src/cards/data/index.ts";
import { addCopy, createEmptySlots } from "../../../src/decks/deckSlots.ts";
import { loadDeckSlotsState, saveDeckSlotsState } from "../../../src/decks/deckStorage.ts";
import { defaultPubState, loadPubState, recordPickupResult, savePubState } from "../../../src/pub/pubState.ts";
import { applySaveFile, buildSaveFile } from "../../../src/save/saveFile.ts";
import { defaultTournamentState, loadTournamentState } from "../../../src/tournaments/tournamentState.ts";

beforeEach(() => {
  localStorage.clear();
});

describe("buildSaveFile", () => {
  it("gathers defaults from all four stores when nothing is saved", () => {
    const file = buildSaveFile(new Date("2026-01-01T00:00:00Z"));
    expect(file.version).toBe(1);
    expect(file.pub).toEqual(defaultPubState());
    expect(file.tournament).toEqual(defaultTournamentState());
    expect(file.activeMatch).toBeNull();
  });

  it("reflects real edits made through each store", () => {
    const { next } = recordPickupResult(defaultPubState(), "constable-tobias-mudd", "regular", null, "win", new Date());
    savePubState(next);
    const slots = createEmptySlots();
    slots[0] = addCopy(slots[0]!, ALL_CARDS[0]!);
    saveDeckSlotsState({ slots, selectedIndex: 0 });

    const file = buildSaveFile();
    expect(file.pub.checks).toBeGreaterThan(0);
    expect(file.deckSlots.slots[0]!.entries).toEqual([{ cardId: ALL_CARDS[0]!.id, quantity: 1 }]);
  });
});

describe("applySaveFile / buildSaveFile round trip", () => {
  it("restores everything from an exported blob after clearing storage", () => {
    const { next } = recordPickupResult(defaultPubState(), "constable-tobias-mudd", "regular", null, "win", new Date());
    savePubState(next);
    const slots = createEmptySlots();
    slots[0] = addCopy(slots[0]!, ALL_CARDS[0]!);
    saveDeckSlotsState({ slots, selectedIndex: 0 });

    const exported = buildSaveFile();

    localStorage.clear();
    expect(loadPubState()).toEqual(defaultPubState());

    const result = applySaveFile(JSON.parse(JSON.stringify(exported)));
    expect(result.ok).toBe(true);
    expect(loadPubState()).toEqual(exported.pub);
    expect(loadDeckSlotsState()).toEqual(exported.deckSlots);
    expect(loadTournamentState()).toEqual(exported.tournament);
  });

  it("rejects a file that isn't a save at all", () => {
    expect(applySaveFile({ hello: "world" }).ok).toBe(false);
    expect(applySaveFile(null).ok).toBe(false);
    expect(applySaveFile("just a string").ok).toBe(false);
    expect(applySaveFile(42).ok).toBe(false);
  });
});
