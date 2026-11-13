// The "single JSON blob" export/import (plan step 2.6, design.md §12.4:
// "Export/import via Share sheet as a single JSON blob"). The game still
// keeps its actual state in separate localStorage keys (src/pub/
// pubState.ts, src/decks/deckStorage.ts, src/tournaments/
// tournamentState.ts, src/save/activeMatch.ts, src/tutorial/
// tutorialState.ts, src/audio/audioState.ts) — each already has its own
// defensive load/save and its own tests, and every e2e smoke test that
// seeds state does so by writing one of those keys directly, so merging
// them onto one shared key would touch a lot of well-tested surface for a
// mostly-cosmetic win. This module just gathers all of them into one
// object for export, and writes them all back on import — satisfying
// design.md's "single JSON blob" without merging their storage. A
// judgment call, not a locked spec, in the same vein as this project's
// other flagged ones (see CLAUDE.md).

import { loadDeckSlotsState, saveDeckSlotsState, type DeckSlotsState } from "../decks/deckStorage.ts";
import { today } from "../events/eventClock.ts";
import { titleForWins } from "../pub/progression.ts";
import { loadPubState, localDateKey, savePubState, type PubState } from "../pub/pubState.ts";
import { parseLedger } from "./ledger.ts";
import { sha256Hex } from "./sha256.ts";
import { PER_GAME_KEY_NAMES } from "./storageKey.ts";
import { defaultTournamentState, loadTournamentState, saveTournamentState, type TournamentState } from "../tournaments/tournamentState.ts";
import { clearActiveMatch, loadActiveMatch, saveActiveMatch, type ActiveMatchSave } from "./activeMatch.ts";
import { defaultTutorialState, loadTutorialState, saveTutorialState, type TutorialState } from "../tutorial/tutorialState.ts";
import { defaultAudioState, loadAudioState, saveAudioState, type AudioState } from "../audio/audioState.ts";
import { defaultPlayerState, loadPlayerState, savePlayerState, type PlayerState } from "../player/playerState.ts";

/**
 * 1: the original blob. 2: `pub` gained `ledger`, `hostsMet`, `giftsClaimed`
 * and `bannersSeen` (content plan §4.1/§4.3). Those live inside `pub`, which
 * is one localStorage key, because the privacy test whitelists keys.
 */
export const SAVE_FILE_VERSION = 2;

export interface SaveFile {
  version: number;
  exportedAt: string;
  pub: PubState;
  deckSlots: DeckSlotsState;
  tournament: TournamentState;
  activeMatch: ActiveMatchSave | null;
  /** design.md §12.4 lists "tutorial/hint progress" as one of the save's contents (plan step 2.7). */
  tutorial: TutorialState;
  /** design.md §12.4 also lists "settings" — the mute toggle is the first real one (plan step 3.4). */
  audio: AudioState;
  /** design.md §12.4's "first-launch flag", plus the editable player name (§14.2) it lives alongside (plan step 3.5). */
  player: PlayerState;
}

/** Gathers the current state of every store into one exportable object. */
export function buildSaveFile(now: Date = new Date()): SaveFile {
  return {
    version: SAVE_FILE_VERSION,
    exportedAt: now.toISOString(),
    pub: loadPubState(),
    deckSlots: loadDeckSlotsState(),
    tournament: loadTournamentState(),
    activeMatch: loadActiveMatch(),
    tutorial: loadTutorialState(),
    audio: loadAudioState(),
    player: loadPlayerState(),
  };
}

/**
 * Upgrades a save file of any older version to the current shape. A version-1
 * file has no ledger, so it gets an empty one whose first launch is
 * `migrationDate` (the day of the import or migration); the new `pub` fields
 * default to empty. A current file passes through with its ledger intact.
 */
export function migrateSaveFile(file: SaveFile, migrationDate: string = localDateKey(today())): SaveFile {
  if (file.version >= SAVE_FILE_VERSION) return file;
  const pub = file.pub as Partial<PubState>;
  return {
    ...file,
    version: SAVE_FILE_VERSION,
    pub: {
      ...(file.pub as PubState),
      hostsMet: pub.hostsMet ?? [],
      giftsClaimed: pub.giftsClaimed ?? {},
      bannersSeen: pub.bannersSeen ?? {},
      ledger: parseLedger(pub.ledger, migrationDate),
    },
  };
}

export interface ApplySaveFileResult {
  ok: boolean;
  error?: string;
}

/**
 * Validates and writes a save file back into each localStorage key.
 * Each individual load*State function already re-validates its own slice
 * the next time it's read, so this only needs to reject data that isn't
 * shaped like a save file at all (e.g. an unrelated JSON file) before
 * writing — a garbled slice inside an otherwise-valid file just falls
 * back to that slice's own default on the next load, same as any other
 * corruption those stores already handle.
 */
export function applySaveFile(data: unknown): ApplySaveFileResult {
  if (!data || typeof data !== "object") {
    return { ok: false, error: "That doesn't look like a Steampunk Shuffle save file." };
  }
  const raw = data as Partial<SaveFile>;
  if (typeof raw.version !== "number" || !raw.pub || !raw.deckSlots) {
    return { ok: false, error: "That doesn't look like a Steampunk Shuffle save file." };
  }
  const file = migrateSaveFile(raw as SaveFile);

  savePubState(file.pub as PubState);
  saveDeckSlotsState(file.deckSlots as DeckSlotsState);
  saveTournamentState((file.tournament as TournamentState | undefined) ?? defaultTournamentState());
  saveTutorialState((file.tutorial as TutorialState | undefined) ?? defaultTutorialState());
  saveAudioState((file.audio as AudioState | undefined) ?? defaultAudioState());
  savePlayerState((file.player as PlayerState | undefined) ?? defaultPlayerState());
  if (file.activeMatch) {
    saveActiveMatch(file.activeMatch as ActiveMatchSave);
  } else {
    clearActiveMatch();
  }

  return { ok: true };
}

// ---------------------------------------------------------------------------
// The ledger file (.wheatstone), release 1.1 (plan 14 §2.2, design.md §12.5).
// One ledger per file: the raw per-game localStorage strings by key name (so a
// round trip is byte-identical and the file does not depend on which id the
// receiving device gives it), a summary for the "which copy?" prompt, and a
// SHA-256 of all of that so a damaged file is refused rather than half-loaded.
// "version: 2" also names the older whole-save blob above (which has no `keys`);
// the two are told apart by shape, and the blob is still accepted as a new ledger.
// ---------------------------------------------------------------------------

export const LEDGER_FILE_VERSION = 2;
export const LEDGER_FILE_EXTENSION = ".wheatstone";
const LEDGER_NAME_LIMIT = 24;

export interface LedgerFileSummary {
  title: string;
  wins: number;
  collectionCount: number;
}

export interface LedgerFile {
  version: typeof LEDGER_FILE_VERSION;
  ledgerId: string;
  ledgerName: string;
  summary: LedgerFileSummary;
  exportedAt: string;
  keys: Record<string, string>;
  sha256: string;
}

/** The text that is hashed: fixed field order and sorted keys, so any serializer reproduces it. */
function checksumInput(file: Omit<LedgerFile, "sha256">): string {
  const keys = Object.keys(file.keys)
    .sort()
    .map((name) => [name, file.keys[name]]);
  return JSON.stringify([file.version, file.ledgerId, file.ledgerName, [file.summary.title, file.summary.wins, file.summary.collectionCount], file.exportedAt, keys]);
}

export function ledgerChecksum(file: Omit<LedgerFile, "sha256">): string {
  return sha256Hex(checksumInput(file));
}

/** `keys` are the ledger's raw per-game strings by name (read by `exportLedger` in ledgers.ts, the one module allowed to touch another ledger's keys). */
export function buildLedgerFile(ledger: { id: string; name: string; summary: LedgerFileSummary; keys: Record<string, string> }, now: Date = new Date()): LedgerFile {
  const body = { version: LEDGER_FILE_VERSION, ledgerId: ledger.id, ledgerName: ledger.name, summary: { ...ledger.summary }, exportedAt: now.toISOString(), keys: ledger.keys } as const;
  return { ...body, sha256: ledgerChecksum(body) };
}

/** `<name>-<date>.wheatstone` */
export function ledgerFileName(name: string, now: Date): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "ledger";
  return `${slug}-${now.toISOString().slice(0, 10)}${LEDGER_FILE_EXTENSION}`;
}

/** A ledger arriving from a file, whichever format it was in, ready to be put on the shelf. */
export interface IncomingLedger {
  /** The id the sender's ledger had; null for an old whole-save file, which has none. */
  ledgerId: string | null;
  name: string;
  summary: LedgerFileSummary;
  exportedAt: string | null;
  keys: Record<string, string>;
}

export type ParsedIncoming = { ok: true; incoming: IncomingLedger } | { ok: false; error: string };

const NOT_A_LEDGER = "That doesn't look like a Wheatstone ledger.";
const DAMAGED = "That ledger file looks damaged, so nothing was changed. Ask for it to be sent again.";

function cleanLedgerName(value: unknown): string {
  const text = typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, LEDGER_NAME_LIMIT) : "";
  return text || "Sara";
}

function summaryOf(value: unknown): LedgerFileSummary {
  const s = (value && typeof value === "object" ? value : {}) as Partial<LedgerFileSummary>;
  return {
    title: typeof s.title === "string" ? s.title.slice(0, 60) : "Newcomer",
    wins: typeof s.wins === "number" && Number.isFinite(s.wins) ? s.wins : 0,
    collectionCount: typeof s.collectionCount === "number" && Number.isFinite(s.collectionCount) ? s.collectionCount : 0,
  };
}

/** An old whole-save blob (versions 1 and 2) as the per-game strings a ledger holds. */
function keysFromBlob(blob: SaveFile): Record<string, string> {
  const file = migrateSaveFile(blob);
  const keys: Record<string, string> = {
    "pub-state": JSON.stringify(file.pub),
    "deck-slots": JSON.stringify(file.deckSlots),
    "tournament-state": JSON.stringify(file.tournament ?? defaultTournamentState()),
    "tutorial-state": JSON.stringify(file.tutorial ?? defaultTutorialState()),
    player: JSON.stringify(file.player ?? defaultPlayerState()),
  };
  if (file.activeMatch) keys["active-match"] = JSON.stringify(file.activeMatch);
  return keys;
}

/**
 * Reads the text of a .wheatstone file (or an old "Export save" .json). Refuses
 * anything that is not a ledger, and any version-2 file whose checksum does not
 * match; accepts the old blob (version 1 or 2, which has `pub` instead of `keys`)
 * as a ledger with no id of its own.
 */
export function parseIncomingSave(text: string): ParsedIncoming {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: NOT_A_LEDGER };
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return { ok: false, error: NOT_A_LEDGER };
  const raw = data as Record<string, unknown>;
  if (typeof raw.version !== "number") return { ok: false, error: NOT_A_LEDGER };

  if (raw.keys && typeof raw.keys === "object" && !Array.isArray(raw.keys)) {
    if (raw.version !== LEDGER_FILE_VERSION) return { ok: false, error: "That ledger was made by a newer version of the game. Update the game and try again." };
    if (typeof raw.ledgerId !== "string" || !/^[0-9a-zA-Z-]{8,64}$/.test(raw.ledgerId) || typeof raw.sha256 !== "string" || typeof raw.exportedAt !== "string") return { ok: false, error: DAMAGED };
    const keys: Record<string, string> = {};
    for (const [name, value] of Object.entries(raw.keys as Record<string, unknown>)) {
      if (typeof value !== "string" || !(PER_GAME_KEY_NAMES as readonly string[]).includes(name)) return { ok: false, error: DAMAGED };
      keys[name] = value;
    }
    const file = { version: LEDGER_FILE_VERSION, ledgerId: raw.ledgerId, ledgerName: typeof raw.ledgerName === "string" ? raw.ledgerName : "", summary: summaryOf(raw.summary), exportedAt: raw.exportedAt, keys } as const;
    if (ledgerChecksum(file) !== raw.sha256.toLowerCase()) return { ok: false, error: DAMAGED };
    return { ok: true, incoming: { ledgerId: file.ledgerId, name: cleanLedgerName(file.ledgerName), summary: file.summary, exportedAt: file.exportedAt, keys } };
  }

  if (raw.pub && typeof raw.pub === "object" && raw.deckSlots && typeof raw.deckSlots === "object") {
    const blob = raw as unknown as SaveFile;
    const keys = keysFromBlob(blob);
    const pub = blob.pub as Partial<PubState>;
    const wins = typeof pub.totalWins === "number" ? pub.totalWins : 0;
    const collectionCount = Array.isArray(pub.collection) ? pub.collection.length : 0;
    const player = blob.player as Partial<PlayerState> | undefined;
    return {
      ok: true,
      incoming: { ledgerId: null, name: cleanLedgerName(player?.name), summary: { title: titleForWins(wins), wins, collectionCount }, exportedAt: typeof blob.exportedAt === "string" ? blob.exportedAt : null, keys },
    };
  }
  return { ok: false, error: NOT_A_LEDGER };
}
