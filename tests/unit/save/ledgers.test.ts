// The Ledger Shelf's data layer (design.md §12.5) and the 1.1 migration
// (docs/plans/monthly/14-saves-and-android.md §2.3, non-negotiable).

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import fixture from "./fixtures/currentRelease.json";
import {
  CELLAR_DAYS,
  CELLAR_LINE,
  MAX_LEDGERS,
  cellarCopyAvailable,
  createLedger,
  deleteLedger,
  exportLedger,
  initLedgers,
  listLedgers,
  loadRegistry,
  readBackup,
  renameLedger,
  restoreCellarCopy,
  switchLedger,
  takeCellarNotice,
} from "../../../src/save/ledgers.ts";
import { BACKUP_KEY, GLOBAL_KEYS, REGISTRY_KEY, storageKey } from "../../../src/save/storageKey.ts";
import { defaultPubState, loadPubState, savePubState } from "../../../src/pub/pubState.ts";
import { loadDeckSlotsState, saveDeckSlotsState } from "../../../src/decks/deckStorage.ts";
import { loadPlayerState } from "../../../src/player/playerState.ts";
import { loadActiveMatch, saveActiveMatch } from "../../../src/save/activeMatch.ts";
import { createEmptySlots, addCopy } from "../../../src/decks/deckSlots.ts";
import { ALL_CARDS } from "../../../src/cards/data/index.ts";

const LEGACY = fixture as Record<string, string>;
const PER_GAME_LEGACY = Object.keys(LEGACY).filter((k) => k !== GLOBAL_KEYS.audioMuted);

function seedLegacy(): void {
  localStorage.clear();
  for (const [key, value] of Object.entries(LEGACY)) localStorage.setItem(key, value);
}

function setClock(iso: string): void {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(iso));
}

beforeEach(() => {
  localStorage.clear();
  vi.useRealTimers();
});
afterEach(() => vi.useRealTimers());

describe("storageKey", () => {
  it("is the pre-1.1 key before a registry exists, and ws:<id>:<name> after", () => {
    expect(storageKey("pub-state")).toBe("steampunk-shuffle:pub-state");
    const registry = initLedgers();
    expect(storageKey("pub-state")).toBe(`ws:${registry.activeId}:pub-state`);
  });

  it("follows a switch of the active ledger", () => {
    const first = initLedgers().activeId;
    const created = createLedger("Mum");
    switchLedger(created.id!);
    expect(storageKey("player")).toBe(`ws:${created.id}:player`);
    expect(storageKey("player")).not.toContain(first);
  });
});

describe("a fresh install", () => {
  it("gets one ledger called Sara, no backup and no migration notice", () => {
    const registry = initLedgers();
    expect(registry.ledgers).toHaveLength(1);
    expect(registry.ledgers[0]!.name).toBe("Sara");
    expect(registry.migratedAt).toBeUndefined();
    expect(localStorage.getItem(BACKUP_KEY)).toBeNull();
    expect(takeCellarNotice()).toBeNull();
    expect(cellarCopyAvailable()).toBe(false);
  });
});

describe("migrating the current release's save (plan §2.3)", () => {
  beforeEach(() => {
    seedLegacy();
    setClock("2026-12-05T12:00:00");
  });

  it("copies every key and value into the new ledger, identically", () => {
    const registry = initLedgers();
    const id = registry.activeId;
    for (const key of PER_GAME_LEGACY) {
      const name = key.slice("steampunk-shuffle:".length);
      expect(localStorage.getItem(`ws:${id}:${name}`), key).toBe(LEGACY[key]);
    }
    expect(registry.ledgers[0]!.name).toBe("Sara");
    expect(registry.ledgers[0]!.summary.wins).toBe(3);
    expect(registry.migratedAt).toBe("2026-12-05");
  });

  it("leaves every original key untouched (copy, not move)", () => {
    initLedgers();
    for (const [key, value] of Object.entries(LEGACY)) expect(localStorage.getItem(key), key).toBe(value);
  });

  it("the migrated ledger loads exactly what the old code loaded", () => {
    const before = { pub: loadPubState(), decks: loadDeckSlotsState(), player: loadPlayerState(), match: loadActiveMatch() };
    initLedgers();
    expect(loadPubState()).toEqual(before.pub);
    expect(loadDeckSlotsState()).toEqual(before.decks);
    expect(loadPlayerState()).toEqual(before.player);
    expect(loadActiveMatch()).toEqual(before.match);
    expect(loadPubState().booth.salt).toBe(481516);
    expect(loadPubState().giftsClaimed["ghost-story"]).toEqual({ "2026": ["salt-on-the-step"] });
  });

  it("copies a key this build has never heard of, too", () => {
    localStorage.setItem("steampunk-shuffle:from-the-future", '{"x":1}');
    const id = initLedgers().activeId;
    expect(localStorage.getItem(`ws:${id}:from-the-future`)).toBe('{"x":1}');
  });

  it("leaves the device-wide mute setting where it was", () => {
    const id = initLedgers().activeId;
    expect(localStorage.getItem(GLOBAL_KEYS.audioMuted)).toBe(LEGACY[GLOBAL_KEYS.audioMuted]);
    expect(localStorage.getItem(`ws:${id}:audio-muted`)).toBeNull();
  });

  it("writes a version-1 backup holding the raw keys and a normal export", () => {
    initLedgers();
    const backup = readBackup()!;
    expect(backup.format).toBe(1);
    expect(Object.keys(backup.keys).sort()).toEqual([...PER_GAME_LEGACY].sort());
    for (const key of PER_GAME_LEGACY) expect(backup.keys[key]).toBe(LEGACY[key]);
    expect(backup.save?.pub.totalWins).toBe(3);
    expect(backup.save?.version).toBe(2);
  });

  it("is idempotent: a second and third launch change nothing", () => {
    initLedgers();
    const snapshot = { ...localStorage };
    const registryBefore = loadRegistry();
    initLedgers();
    initLedgers();
    expect(loadRegistry()!.ledgers.map((l) => l.id)).toEqual(registryBefore!.ledgers.map((l) => l.id));
    expect(loadRegistry()!.migratedAt).toBe("2026-12-05");
    for (const [key, value] of Object.entries(snapshot)) {
      if (key === REGISTRY_KEY) continue;
      expect(localStorage.getItem(key), key).toBe(value);
    }
  });

  it("an interrupted migration (backup written, no registry) re-uses the same ledger id", () => {
    const id = initLedgers().activeId;
    localStorage.removeItem(REGISTRY_KEY);
    expect(initLedgers().activeId).toBe(id);
  });

  it("shows the beer mat once", () => {
    initLedgers();
    expect(takeCellarNotice()).toBe(CELLAR_LINE);
    expect(takeCellarNotice()).toBeNull();
    initLedgers();
    expect(takeCellarNotice()).toBeNull();
  });

  it("then exporting and importing into a fresh install gives identical data", () => {
    initLedgers();
    const file = exportLedger(loadRegistry()!.activeId);
    const exported = JSON.parse(JSON.stringify(file));
    localStorage.clear();
    initLedgers();
    // applySaveFile is covered in saveFile.test.ts; here: the export reflects the migrated data.
    expect(exported.pub.totalWins).toBe(3);
    expect(exported.pub.booth.salt).toBe(481516);
    expect(exported.activeMatch).not.toBeNull();
  });

  describe("the 30-day window", () => {
    it("keeps the originals and offers the cellar copy until day 30", () => {
      initLedgers();
      setClock("2026-12-31T12:00:00");
      initLedgers();
      expect(PER_GAME_LEGACY.every((k) => localStorage.getItem(k) === LEGACY[k])).toBe(true);
      expect(cellarCopyAvailable()).toBe(true);
      expect(CELLAR_DAYS).toBe(30);
    });

    it("deletes the originals (but not the mute setting) on a launch 30 days on", () => {
      initLedgers();
      setClock("2027-01-04T12:00:00");
      initLedgers();
      for (const key of PER_GAME_LEGACY) expect(localStorage.getItem(key), key).toBeNull();
      expect(localStorage.getItem(GLOBAL_KEYS.audioMuted)).not.toBeNull();
      expect(cellarCopyAvailable()).toBe(false);
      const id = loadRegistry()!.activeId;
      expect(localStorage.getItem(`ws:${id}:pub-state`)).toBe(LEGACY["steampunk-shuffle:pub-state"]);
    });
  });

  describe("restoring the cellar copy", () => {
    it("puts the old save back over what was played since", () => {
      const id = initLedgers().activeId;
      savePubState({ ...loadPubState(), totalWins: 99, checks: 5 });
      expect(loadPubState().totalWins).toBe(99);
      expect(restoreCellarCopy()).toEqual({ ok: true });
      for (const key of PER_GAME_LEGACY) expect(localStorage.getItem(`ws:${id}:${key.slice(18)}`), key).toBe(LEGACY[key]);
      expect(loadPubState().totalWins).toBe(3);
      expect(loadRegistry()!.activeId).toBe(id);
    });

    it("is refused after the window and when there was no migration", () => {
      initLedgers();
      setClock("2027-01-10T12:00:00");
      expect(restoreCellarCopy().ok).toBe(false);
      localStorage.clear();
      initLedgers();
      expect(restoreCellarCopy().ok).toBe(false);
    });

    it("re-creates the migrated ledger if it was deleted and there is room", () => {
      const id = initLedgers().activeId;
      const other = createLedger("Mum").id!;
      switchLedger(other);
      deleteLedger(id, { backedUp: true });
      expect(restoreCellarCopy()).toEqual({ ok: true });
      expect(loadRegistry()!.ledgers.map((l) => l.id)).toContain(id);
      expect(loadRegistry()!.activeId).toBe(id);
    });
  });
});

describe("the shelf", () => {
  it("holds at most MAX_LEDGERS (4)", () => {
    expect(MAX_LEDGERS).toBe(4);
    initLedgers();
    for (const name of ["Mum", "Dad", "Gran"]) expect(createLedger(name).ok).toBe(true);
    const fifth = createLedger("Auntie");
    expect(fifth.ok).toBe(false);
    expect(loadRegistry()!.ledgers).toHaveLength(4);
  });

  it("rejects blank and duplicate names", () => {
    initLedgers();
    expect(createLedger("   ").ok).toBe(false);
    expect(createLedger("sara").ok).toBe(false);
    const id = createLedger("Mum").id!;
    expect(renameLedger(id, "Sara").ok).toBe(false);
    expect(renameLedger(id, "Mother").ok).toBe(true);
    expect(loadRegistry()!.ledgers.find((l) => l.id === id)!.name).toBe("Mother");
  });

  it("a new ledger begins at the tutorial with a default player", () => {
    initLedgers();
    const id = createLedger("Mum").id!;
    switchLedger(id);
    expect(loadPlayerState()).toEqual({ name: "Mum", dedicationSeen: true });
    expect(loadPubState()).toEqual(defaultPubState());
  });

  it("switching isolates every system: wins, gifts, booth draws, decks, active match", () => {
    seedLegacy();
    const sara = initLedgers().activeId;
    const mum = createLedger("Mum").id!;
    switchLedger(mum);

    expect(loadPubState().totalWins).toBe(0);
    expect(loadPubState().giftsClaimed).toEqual({});
    expect(loadPubState().ledger.boothDraws).toEqual([]);
    expect(loadPubState().booth.salt).toBeNull();
    expect(loadActiveMatch()).toBeNull();
    expect(loadDeckSlotsState().slots.every((s) => s.entries.length === 0)).toBe(true);

    const slots = createEmptySlots();
    slots[2] = addCopy(slots[2]!, ALL_CARDS[3]!);
    saveDeckSlotsState({ slots, selectedIndex: 2 });
    savePubState({ ...loadPubState(), totalWins: 7, giftsClaimed: { x: { "2026": ["y"] } } });

    switchLedger(sara);
    expect(loadPubState().totalWins).toBe(3);
    expect(loadPubState().giftsClaimed["cunning-folk"]).toBeDefined();
    expect(loadPubState().giftsClaimed["x"]).toBeUndefined();
    expect(loadPubState().ledger.boothDraws).toHaveLength(2);
    expect(loadDeckSlotsState().selectedIndex).toBe(0);
    expect(loadActiveMatch()).not.toBeNull();

    switchLedger(mum);
    expect(loadPubState().totalWins).toBe(7);
    expect(loadDeckSlotsState().selectedIndex).toBe(2);
    expect(loadActiveMatch()).toBeNull();
  });

  it("a match in progress is kept for the ledger and resumes when switching back", () => {
    seedLegacy();
    const sara = initLedgers().activeId;
    const saved = loadActiveMatch()!;
    const mum = createLedger("Mum").id!;
    switchLedger(mum);
    saveActiveMatch({ ...saved, aiSeed: 1234 });
    switchLedger(sara);
    expect(loadActiveMatch()!.aiSeed).toBe(99);
    switchLedger(mum);
    expect(loadActiveMatch()!.aiSeed).toBe(1234);
  });

  it("summaries come from each ledger's own data", () => {
    seedLegacy();
    initLedgers();
    createLedger("Mum");
    const { ledgers } = listLedgers();
    const sara = ledgers.find((l) => l.name === "Sara")!;
    const mum = ledgers.find((l) => l.name === "Mum")!;
    expect(sara.summary).toEqual({ title: "Regular", wins: 3, collectionCount: 6 });
    expect(mum.summary).toEqual({ title: "Newcomer", wins: 0, collectionCount: 0 });
  });

  it("deleting requires the backup, then removes only that ledger's keys", () => {
    seedLegacy();
    const sara = initLedgers().activeId;
    const mum = createLedger("Mum").id!;
    expect(deleteLedger(mum, { backedUp: false }).ok).toBe(false);
    expect(loadRegistry()!.ledgers).toHaveLength(2);
    expect(localStorage.getItem(`ws:${mum}:player`)).not.toBeNull();

    expect(deleteLedger(mum, { backedUp: true }).ok).toBe(true);
    expect(loadRegistry()!.ledgers.map((l) => l.id)).toEqual([sara]);
    for (let i = 0; i < localStorage.length; i += 1) expect(localStorage.key(i)).not.toContain(mum);
    expect(localStorage.getItem(`ws:${sara}:pub-state`)).toBe(LEGACY["steampunk-shuffle:pub-state"]);
  });

  it("deleting the active ledger moves to another; deleting the last starts a blank one", () => {
    const first = initLedgers().activeId;
    const second = createLedger("Mum").id!;
    const result = deleteLedger(first, { backedUp: true });
    expect(result).toMatchObject({ ok: true, activeChanged: true });
    expect(loadRegistry()!.activeId).toBe(second);
    deleteLedger(second, { backedUp: true });
    expect(loadRegistry()!.ledgers).toHaveLength(1);
    expect(loadRegistry()!.ledgers[0]!.id).not.toBe(second);
  });

  it("exports a ledger that is not active without touching the active one", () => {
    seedLegacy();
    const sara = initLedgers().activeId;
    const mum = createLedger("Mum").id!;
    switchLedger(mum);
    const file = exportLedger(sara);
    expect(file.pub.totalWins).toBe(3);
    expect(exportLedger(mum).pub.totalWins).toBe(0);
    expect(loadRegistry()!.activeId).toBe(mum);
  });

  it("rebuilds a corrupt registry from the ledger keys that survive", () => {
    seedLegacy();
    const sara = initLedgers().activeId;
    localStorage.setItem(REGISTRY_KEY, "{not json");
    const registry = initLedgers();
    expect(registry.ledgers.map((l) => l.id)).toEqual([sara]);
    expect(registry.ledgers[0]!.name).toBe("Sara");
  });
});
