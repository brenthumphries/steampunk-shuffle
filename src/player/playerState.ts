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

/** Start of the stretch before her birthday in which the dedication is held back (option b below). A judgment call, not locked spec. */
const DEDICATION_HOLD_FROM = { month: 9, day: 1 } as const;
const BIRTHDAY = { month: 10, day: 30 } as const;

/**
 * ★ NOT WIRED IN — waiting on Brent's decision (seasonal-events-plan.md §1).
 * `src/main.ts` still shows the dedication on the first launch, whenever
 * that is. If she first opens the game in early October to get the
 * Hallowe'en content, she'd read the birthday dedication weeks early.
 *
 * This is option (b): hold it back from Sep 1 until Oct 30, then show it on
 * her first launch on or after her birthday. The hold has a start date on
 * purpose: "before Oct 30 in the calendar year" alone would also hold a
 * first launch in, say, February 2027 until October 2027.
 *
 * To adopt it, change `main.ts`'s `if (!loadPlayerState().dedicationSeen)` to
 * `if (dedicationShouldShow(today(), loadPlayerState().dedicationSeen))`.
 */
export function dedicationShouldShow(date: Date, dedicationSeen: boolean): boolean {
  if (dedicationSeen) return false;
  const today = (date.getMonth() + 1) * 100 + date.getDate();
  const holdFrom = DEDICATION_HOLD_FROM.month * 100 + DEDICATION_HOLD_FROM.day;
  const birthday = BIRTHDAY.month * 100 + BIRTHDAY.day;
  return !(today >= holdFrom && today < birthday);
}

/** Falls back to the default name if the edit is left blank (a settings field with no name isn't useful, and the licence has to say *something*). */
export function setPlayerName(state: PlayerState, name: string): PlayerState {
  const trimmed = name.trim();
  return { ...state, name: trimmed.length > 0 ? trimmed : DEFAULT_NAME };
}
