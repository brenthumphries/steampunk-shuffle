// The player's own small profile (plan step 3.5, design.md §14.2 and
// §12.4's "first-launch flag"): her name, defaulted to "Sara" and editable
// ("because the licence says so"), and whether the dedication screen
// (§14.1) has already been shown. Own localStorage key, same defensive
// load/save pattern as src/audio/audioState.ts — folded into
// src/save/saveFile.ts too, since both fields are exactly the kind of
// "settings"/"first-launch flag" content design.md §12.4 lists.
//
// This is deliberately separate from the dedication screen's own hardcoded
// "Licensed to Sara" wording (design.md §14.1, "resolved with Brent... is
// final") — that gift message never changes regardless of what the player
// later renames herself to here.

const STORAGE_KEY = "steampunk-shuffle:player";
const DEFAULT_NAME = "Sara";

export interface PlayerState {
  name: string;
  dedicationSeen: boolean;
}

export function defaultPlayerState(): PlayerState {
  return { name: DEFAULT_NAME, dedicationSeen: false };
}

export function loadPlayerState(): PlayerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPlayerState();
    const parsed = JSON.parse(raw) as Partial<PlayerState>;
    if (typeof parsed.name !== "string" || typeof parsed.dedicationSeen !== "boolean") return defaultPlayerState();
    return { name: parsed.name, dedicationSeen: parsed.dedicationSeen };
  } catch {
    return defaultPlayerState();
  }
}

export function savePlayerState(state: PlayerState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Safari private mode / storage quota — the name/flag just won't persist across reloads this session.
  }
}

export function markDedicationSeen(state: PlayerState): PlayerState {
  return { ...state, dedicationSeen: true };
}

/** Falls back to the default name if the edit is left blank (a settings field with no name isn't useful, and the licence has to say *something*). */
export function setPlayerName(state: PlayerState, name: string): PlayerState {
  const trimmed = name.trim();
  return { ...state, name: trimmed.length > 0 ? trimmed : DEFAULT_NAME };
}
