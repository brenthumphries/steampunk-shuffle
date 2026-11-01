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
import { loadPubState, localDateKey, savePubState, type PubState } from "../pub/pubState.ts";
import { parseLedger } from "./ledger.ts";
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
