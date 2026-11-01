// The Scry overlay's working state (design.md §5.16), kept out of the DOM so
// it's testable: which looked-at cards are headed for the top and which for
// the bottom, and the order within each. Phone-friendly by design: tapping a
// card sends it to the other row, and each card has earlier/later buttons.

import type { ScryChoice } from "../engine/matchEngine.ts";

export interface ScryDraft {
  /** Instance ids staying on top, first card is drawn first. */
  top: string[];
  /** Instance ids going under the deck, last card ends up on the very bottom. */
  bottom: string[];
}

/** Everything starts on top in its current order: confirming straight away changes nothing. */
export function startDraft(ids: readonly string[]): ScryDraft {
  return { top: [...ids], bottom: [] };
}

/** Sends a card to the other row, at the end of that row. */
export function toggleZone(draft: ScryDraft, id: string): ScryDraft {
  if (draft.top.includes(id)) return { top: draft.top.filter((x) => x !== id), bottom: [...draft.bottom, id] };
  if (draft.bottom.includes(id)) return { top: [...draft.top, id], bottom: draft.bottom.filter((x) => x !== id) };
  return draft;
}

/** Moves a card one place earlier (-1) or later (+1) within its own row; a no-op at either end. */
export function moveWithin(draft: ScryDraft, id: string, direction: -1 | 1): ScryDraft {
  const move = (row: string[]): string[] => {
    const i = row.indexOf(id);
    const j = i + direction;
    if (i === -1 || j < 0 || j >= row.length) return row;
    const next = row.slice();
    [next[i], next[j]] = [next[j]!, next[i]!];
    return next;
  };
  return { top: move(draft.top), bottom: move(draft.bottom) };
}

export function draftToChoice(draft: ScryDraft): ScryChoice {
  return { top: [...draft.top], bottom: [...draft.bottom] };
}
