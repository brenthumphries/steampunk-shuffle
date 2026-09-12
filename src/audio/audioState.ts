// localStorage persistence for the mute toggle (plan step 3.4, exit check:
// "mute persists"). Its own small store, same defensive load/save pattern
// as src/decks/deckStorage.ts / src/pub/pubState.ts — folded into
// src/save/saveFile.ts's SaveFile too, since a sound preference is exactly
// the kind of "settings" field design.md §12.4 lists but 2.6 left for
// whichever step actually builds a setting.

const STORAGE_KEY = "steampunk-shuffle:audio-muted";

export interface AudioState {
  muted: boolean;
}

export function defaultAudioState(): AudioState {
  return { muted: false };
}

export function loadAudioState(): AudioState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAudioState();
    const parsed = JSON.parse(raw) as Partial<AudioState>;
    if (typeof parsed.muted !== "boolean") return defaultAudioState();
    return { muted: parsed.muted };
  } catch {
    return defaultAudioState();
  }
}

export function saveAudioState(state: AudioState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Safari private mode / storage quota — muting just won't persist across reloads this session.
  }
}
