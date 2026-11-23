// Card sleeves (docs/design.md §17.5): the registry, ownership and its
// migration from a real pre-sleeve save, the per-slot pick and its
// persistence, and the save-file round trip.

import { beforeEach, describe, expect, it } from "vitest";

import fixture from "../save/fixtures/currentRelease.json";
import { ALL_CARDS } from "../../../src/cards/data/index.ts";
import { DEFAULT_SLEEVE, DEFAULT_SLEEVE_ID, SLEEVES, SLEEVES_BY_ID, defaultOwnedSleeves, ownedSleeves, parseOwnedSleeves, resolveSleeve, sleeveArtUrl, type Sleeve } from "../../../src/cosmetics/sleeves.ts";
import { addCopy, createEmptySlots } from "../../../src/decks/deckSlots.ts";
import { loadDeckSlotsState, saveDeckSlotsState } from "../../../src/decks/deckStorage.ts";
import { defaultPubState, loadPubState, savePubState } from "../../../src/pub/pubState.ts";
import { applySaveFile, buildSaveFile, migrateSaveFile, type SaveFile } from "../../../src/save/saveFile.ts";
import { storageKey } from "../../../src/save/storageKey.ts";

const STARFIELD: Sleeve = { id: "sleeve-starfield", name: "Starfield", artId: "sleeve-starfield", source: { kind: "event", eventId: "aether-voyage" } };
const WITH_STARFIELD = [...SLEEVES, STARFIELD];

beforeEach(() => {
  localStorage.clear();
});

describe("registry", () => {
  it("has the default sleeve, always owned, on the current card-back art", () => {
    expect(DEFAULT_SLEEVE_ID).toBe("sleeve-the-bridge");
    expect(SLEEVES_BY_ID.get(DEFAULT_SLEEVE_ID)).toEqual({ id: "sleeve-the-bridge", name: "The Bridge", artId: "card-back", source: { kind: "default" } });
    expect(sleeveArtUrl(DEFAULT_SLEEVE.artId)).toMatch(/art\/card-back\.webp$/);
    expect(defaultOwnedSleeves()).toEqual([DEFAULT_SLEEVE_ID]);
  });

  it("ships only the default sleeve until a month's content adds one", () => {
    expect(SLEEVES.map((s) => s.id)).toEqual([DEFAULT_SLEEVE_ID]);
  });
});

describe("ownership helpers", () => {
  it("parseOwnedSleeves keeps the default first, drops junk and duplicates", () => {
    expect(parseOwnedSleeves(undefined)).toEqual([DEFAULT_SLEEVE_ID]);
    expect(parseOwnedSleeves("nope")).toEqual([DEFAULT_SLEEVE_ID]);
    expect(parseOwnedSleeves([])).toEqual([DEFAULT_SLEEVE_ID]);
    expect(parseOwnedSleeves(["sleeve-starfield", 7, "sleeve-starfield", DEFAULT_SLEEVE_ID])).toEqual([DEFAULT_SLEEVE_ID, "sleeve-starfield"]);
  });

  it("ownedSleeves lists only registered, owned sleeves, default always", () => {
    expect(ownedSleeves([], WITH_STARFIELD).map((s) => s.id)).toEqual([DEFAULT_SLEEVE_ID]);
    expect(ownedSleeves(["sleeve-starfield"], WITH_STARFIELD).map((s) => s.id)).toEqual([DEFAULT_SLEEVE_ID, "sleeve-starfield"]);
    expect(ownedSleeves(["sleeve-ghost"], WITH_STARFIELD).map((s) => s.id)).toEqual([DEFAULT_SLEEVE_ID]);
  });

  it("resolveSleeve falls back to the default for no pick, an unknown sleeve or one not owned", () => {
    expect(resolveSleeve(undefined, [DEFAULT_SLEEVE_ID], WITH_STARFIELD)).toBe(DEFAULT_SLEEVE);
    expect(resolveSleeve("sleeve-nope", [DEFAULT_SLEEVE_ID, "sleeve-nope"], WITH_STARFIELD)).toBe(DEFAULT_SLEEVE);
    expect(resolveSleeve("sleeve-starfield", [DEFAULT_SLEEVE_ID], WITH_STARFIELD)).toBe(DEFAULT_SLEEVE);
    expect(resolveSleeve("sleeve-starfield", [DEFAULT_SLEEVE_ID, "sleeve-starfield"], WITH_STARFIELD)).toBe(STARFIELD);
  });
});

describe("migration from a real pre-sleeve save", () => {
  function seedFixture(): void {
    for (const [key, value] of Object.entries(fixture as Record<string, string>)) localStorage.setItem(key, value);
  }

  it("the fixture really has no sleeve fields", () => {
    const pub = JSON.parse((fixture as Record<string, string>)["steampunk-shuffle:pub-state"]!);
    const slots = JSON.parse((fixture as Record<string, string>)["steampunk-shuffle:deck-slots"]!);
    expect(pub.ownedSleeves).toBeUndefined();
    expect(pub.eventWins).toBeUndefined();
    expect(slots.slots.every((s: { sleeveId?: string }) => s.sleeveId === undefined)).toBe(true);
  });

  it("loads with the default sleeve owned, no dated wins, and every slot on the default", () => {
    seedFixture();
    const raw = JSON.parse((fixture as Record<string, string>)["steampunk-shuffle:pub-state"]!);
    const pub = loadPubState();
    expect(pub.ownedSleeves).toEqual([DEFAULT_SLEEVE_ID]);
    expect(pub.eventWins).toEqual({});
    expect(pub.checks).toBe(raw.checks);
    expect(pub.totalWins).toBe(raw.totalWins);
    const slots = loadDeckSlotsState();
    expect(slots.slots.every((s) => resolveSleeve(s.sleeveId, pub.ownedSleeves) === DEFAULT_SLEEVE)).toBe(true);
  });

  it("a v1 save file (no ledger, no sleeves) still imports and reads as default-only", () => {
    const file: SaveFile = {
      version: 1,
      exportedAt: "2026-01-01T00:00:00.000Z",
      pub: { ...defaultPubState(), checks: 42 },
      deckSlots: { slots: createEmptySlots(), selectedIndex: null },
    } as unknown as SaveFile;
    delete (file.pub as Partial<typeof file.pub>).ownedSleeves;
    delete (file.pub as Partial<typeof file.pub>).eventWins;
    expect(migrateSaveFile(file).pub.ownedSleeves).toEqual([DEFAULT_SLEEVE_ID]);
    expect(applySaveFile(file).ok).toBe(true);
    expect(loadPubState().checks).toBe(42);
    expect(loadPubState().ownedSleeves).toEqual([DEFAULT_SLEEVE_ID]);
  });

  it("an old current-version file with no sleeve fields imports too", () => {
    const file = JSON.parse(JSON.stringify({ ...buildSaveFile(), version: 2 })) as SaveFile;
    delete (file.pub as Partial<typeof file.pub>).ownedSleeves;
    delete (file.pub as Partial<typeof file.pub>).eventWins;
    expect(applySaveFile(file).ok).toBe(true);
    expect(loadPubState().ownedSleeves).toEqual([DEFAULT_SLEEVE_ID]);
  });

  it("a garbled ownedSleeves reads as default-only without losing the rest of the save", () => {
    localStorage.setItem(storageKey("pub-state"), JSON.stringify({ ...defaultPubState(), checks: 9, ownedSleeves: { nope: true }, eventWins: [1, 2] }));
    const pub = loadPubState();
    expect(pub.checks).toBe(9);
    expect(pub.ownedSleeves).toEqual([DEFAULT_SLEEVE_ID]);
    expect(pub.eventWins).toEqual({});
  });
});

describe("per-slot persistence", () => {
  it("a slot's sleeveId survives a save and reload, and other slots are untouched", () => {
    const slots = createEmptySlots();
    slots[2] = { ...addCopy(slots[2]!, ALL_CARDS[0]!), sleeveId: "sleeve-starfield" };
    saveDeckSlotsState({ slots, selectedIndex: 2 });
    const loaded = loadDeckSlotsState();
    expect(loaded.slots[2]!.sleeveId).toBe("sleeve-starfield");
    expect(loaded.slots[2]!.entries).toEqual([{ cardId: ALL_CARDS[0]!.id, quantity: 1 }]);
    expect(loaded.slots.filter((_, i) => i !== 2).every((s) => s.sleeveId === undefined)).toBe(true);
  });

  it("two slots can carry two different sleeves", () => {
    const slots = createEmptySlots();
    slots[0] = { ...slots[0]!, sleeveId: DEFAULT_SLEEVE_ID };
    slots[1] = { ...slots[1]!, sleeveId: "sleeve-starfield" };
    saveDeckSlotsState({ slots, selectedIndex: 0 });
    const loaded = loadDeckSlotsState();
    expect(loaded.slots[0]!.sleeveId).toBe(DEFAULT_SLEEVE_ID);
    expect(loaded.slots[1]!.sleeveId).toBe("sleeve-starfield");
  });

  it("a non-string sleeveId is dropped on load rather than breaking the slot", () => {
    const slots = createEmptySlots();
    localStorage.setItem(storageKey("deck-slots"), JSON.stringify({ slots: slots.map((s, i) => (i === 0 ? { ...s, sleeveId: 5 } : s)), selectedIndex: null }));
    const loaded = loadDeckSlotsState();
    expect(loaded.slots).toHaveLength(slots.length);
    expect(loaded.slots[0]!.sleeveId).toBeUndefined();
  });

  it("renaming and loading a deck into a slot keep its sleeve", async () => {
    const { renameSlot, loadDeckInto } = await import("../../../src/decks/deckSlots.ts");
    const { starterDeck } = await import("../../../src/cards/data/decks/starterDeck.ts");
    const slot = { ...createEmptySlots()[0]!, sleeveId: "sleeve-starfield" };
    expect(renameSlot(slot, "Night").sleeveId).toBe("sleeve-starfield");
    expect(loadDeckInto(slot, starterDeck).sleeveId).toBe("sleeve-starfield");
  });
});

describe("save file round trip (v2)", () => {
  it("export and import carry owned sleeves, dated wins and each slot's sleeve", () => {
    savePubState({ ...defaultPubState(), ownedSleeves: [DEFAULT_SLEEVE_ID, "sleeve-starfield"], eventWins: { "aether-voyage": { "2027": 2 } } });
    const slots = createEmptySlots();
    slots[4] = { ...slots[4]!, sleeveId: "sleeve-starfield" };
    saveDeckSlotsState({ slots, selectedIndex: null });

    const exported = JSON.parse(JSON.stringify(buildSaveFile()));
    expect(exported.version).toBe(2);
    localStorage.clear();
    expect(loadPubState().ownedSleeves).toEqual([DEFAULT_SLEEVE_ID]);

    expect(applySaveFile(exported).ok).toBe(true);
    expect(loadPubState().ownedSleeves).toEqual([DEFAULT_SLEEVE_ID, "sleeve-starfield"]);
    expect(loadPubState().eventWins).toEqual({ "aether-voyage": { "2027": 2 } });
    expect(loadDeckSlotsState().slots[4]!.sleeveId).toBe("sleeve-starfield");
  });
});
