// Tutorial/hint progress (plan step 2.7, design.md §12.4 lists "tutorial/hint
// progress" as its own save-file field). Its own localStorage key, same
// defensive load/save pattern as src/pub/pubState.ts and friends — 2.6's
// SaveFile already folds every existing store into the exported blob, so
// src/save/saveFile.ts also grows this one.

const STORAGE_KEY = "steampunk-shuffle:tutorial-state";

/** design.md §13.3's four hint chips, each dismissible once, ever. */
export const HINT_IDS = ["location", "elusive", "return", "headline", "hub"] as const;
export type HintId = (typeof HINT_IDS)[number];

/** design.md §13.3's beer-mat text, verbatim, for each hint chip. */
export const HINT_TEXT: Record<HintId, string> = {
  location: "One Location at a time, in the middle, for both of you. A new one replaces it.",
  elusive: "Elusive. Can't be flipped. Pick another.",
  return: "Return. Back to hand at the end of the round. Some people never leave.",
  headline: "A Headline. Happens to everybody. Read it.",
  hub: "You've enough Checks for the Pawnbroker. And you've cards you're not using — the deck builder's the ledger on the bar.",
};

export interface TutorialState {
  completed: boolean;
  /** Pickup matches played (the tutorial itself counts as the first) — design.md §13.3's "matches 2-4" window. */
  matchesPlayed: number;
  shownHints: HintId[];
}

export function defaultTutorialState(): TutorialState {
  return { completed: false, matchesPlayed: 0, shownHints: [] };
}

export function hasShownHint(state: TutorialState, hint: HintId): boolean {
  return state.shownHints.includes(hint);
}

export function markHintShown(state: TutorialState, hint: HintId): TutorialState {
  if (hasShownHint(state, hint)) return state;
  return { ...state, shownHints: [...state.shownHints, hint] };
}

/** Marks the tutorial won (design.md §13.2's "After") and starts the match counter at 1, matching how §13.3 counts it as the player's first match. */
export function markTutorialCompleted(state: TutorialState): TutorialState {
  return { ...state, completed: true, matchesPlayed: Math.max(1, state.matchesPlayed) };
}

export function recordMatchPlayed(state: TutorialState): TutorialState {
  return { ...state, matchesPlayed: state.matchesPlayed + 1 };
}

/**
 * design.md §13.3's hint window: "matches 2-4" is read loosely as any of
 * the player's 2nd, 3rd or 4th match (not bound to one specific match each)
 * — a real game might never happen to trigger a given condition on the
 * exact match design.md names for it, and there's no content for "the hint
 * never lands," so this fires the hint on the first eligible match_ that
 * actually meets its condition_, whichever of matches 2-4 that turns out
 * to be. `matchesPlayed` is read *before* the upcoming match starts, so
 * "2nd match" is `matchesPlayed === 1`.
 */
export function isWithinHintWindow(matchesPlayedBeforeThisMatch: number): boolean {
  return matchesPlayedBeforeThisMatch >= 1 && matchesPlayedBeforeThisMatch <= 3;
}

function isValidHint(value: unknown): value is HintId {
  return typeof value === "string" && (HINT_IDS as readonly string[]).includes(value);
}

export function loadTutorialState(): TutorialState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultTutorialState();
    const parsed = JSON.parse(raw) as Partial<TutorialState>;
    if (typeof parsed.completed !== "boolean" || typeof parsed.matchesPlayed !== "number" || !Array.isArray(parsed.shownHints) || !parsed.shownHints.every(isValidHint)) {
      return defaultTutorialState();
    }
    return { completed: parsed.completed, matchesPlayed: parsed.matchesPlayed, shownHints: parsed.shownHints };
  } catch {
    return defaultTutorialState();
  }
}

export function saveTutorialState(state: TutorialState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Safari private mode / storage quota — same tradeoff as pubState.ts.
  }
}
