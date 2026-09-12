// The "single JSON blob" export/import (plan step 2.6, design.md §12.4:
// "Export/import via Share sheet as a single JSON blob"). The game still
// keeps its actual state in four separate localStorage keys
// (src/pub/pubState.ts, src/decks/deckStorage.ts,
// src/tournaments/tournamentState.ts, src/save/activeMatch.ts) — each
// already has its own defensive load/save and its own tests, and every
// e2e smoke test that seeds state does so by writing one of those keys
// directly, so merging them onto one shared key would touch a lot of
// well-tested surface for a mostly-cosmetic win. This module just gathers
// all four into one object for export, and writes all four back on
// import — satisfying design.md's "single JSON blob" without merging
// their storage. A judgment call, not a locked spec, in the same vein as
// this project's other flagged ones (see CLAUDE.md).

import { loadDeckSlotsState, saveDeckSlotsState, type DeckSlotsState } from "../decks/deckStorage.ts";
import { loadPubState, savePubState, type PubState } from "../pub/pubState.ts";
import { defaultTournamentState, loadTournamentState, saveTournamentState, type TournamentState } from "../tournaments/tournamentState.ts";
import { clearActiveMatch, loadActiveMatch, saveActiveMatch, type ActiveMatchSave } from "./activeMatch.ts";

export const SAVE_FILE_VERSION = 1;

export interface SaveFile {
  version: number;
  exportedAt: string;
  pub: PubState;
  deckSlots: DeckSlotsState;
  tournament: TournamentState;
  activeMatch: ActiveMatchSave | null;
}

/** Gathers the current state of all four stores into one exportable object. */
export function buildSaveFile(now: Date = new Date()): SaveFile {
  return {
    version: SAVE_FILE_VERSION,
    exportedAt: now.toISOString(),
    pub: loadPubState(),
    deckSlots: loadDeckSlotsState(),
    tournament: loadTournamentState(),
    activeMatch: loadActiveMatch(),
  };
}

export interface ApplySaveFileResult {
  ok: boolean;
  error?: string;
}

/**
 * Validates and writes a save file back into the four localStorage keys.
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
  const file = data as Partial<SaveFile>;
  if (typeof file.version !== "number" || !file.pub || !file.deckSlots) {
    return { ok: false, error: "That doesn't look like a Steampunk Shuffle save file." };
  }

  savePubState(file.pub as PubState);
  saveDeckSlotsState(file.deckSlots as DeckSlotsState);
  saveTournamentState((file.tournament as TournamentState | undefined) ?? defaultTournamentState());
  if (file.activeMatch) {
    saveActiveMatch(file.activeMatch as ActiveMatchSave);
  } else {
    clearActiveMatch();
  }

  return { ok: true };
}
