// localStorage persistence for the 13 deck slots (plan step 2.2). This is
// deliberately its own small store rather than part of a larger save file:
// 2.6 owns the full autosave system (design.md §395 — collection, Checks,
// win/loss, etc.) and can fold this key into that blob once it exists;
// until then the deck builder needs *some* persistence to save, rename,
// and select decks at all.

import { createEmptySlots, DECK_SLOT_COUNT, type DeckSlot, type DeckSlotEntry } from "./deckSlots.ts";

const STORAGE_KEY = "steampunk-shuffle:deck-slots";

export interface DeckSlotsState {
  slots: DeckSlot[];
  /** Index into `slots` of the deck currently chosen for play, if any. */
  selectedIndex: number | null;
}

function defaultState(): DeckSlotsState {
  return { slots: createEmptySlots(), selectedIndex: null };
}

function isEntry(value: unknown): value is DeckSlotEntry {
  return !!value && typeof value === "object" && typeof (value as DeckSlotEntry).cardId === "string" && typeof (value as DeckSlotEntry).quantity === "number";
}

function isSlot(value: unknown): value is DeckSlot {
  return !!value && typeof value === "object" && typeof (value as DeckSlot).name === "string" && Array.isArray((value as DeckSlot).entries) && (value as DeckSlot).entries.every(isEntry);
}

/** Reads the saved deck slots, falling back to 13 empty slots if nothing is saved or the saved data doesn't parse (a different app version, manual tampering, etc.) rather than crashing the builder. */
export function loadDeckSlotsState(): DeckSlotsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<DeckSlotsState>;
    if (!Array.isArray(parsed.slots) || parsed.slots.length !== DECK_SLOT_COUNT || !parsed.slots.every(isSlot)) {
      return defaultState();
    }
    const selectedIndex = typeof parsed.selectedIndex === "number" && parsed.selectedIndex >= 0 && parsed.selectedIndex < DECK_SLOT_COUNT ? parsed.selectedIndex : null;
    return { slots: parsed.slots, selectedIndex };
  } catch {
    return defaultState();
  }
}

export function saveDeckSlotsState(state: DeckSlotsState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Safari private mode / storage quota — the builder still works for the
    // rest of the session, it just won't persist across reloads.
  }
}
