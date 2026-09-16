// Bugfix cluster A (notes #1, #2): the Bar Bet stakes window used to stake
// a card the instant it was tapped, with no card stats shown and no way to
// back out. Pulled the select/confirm state into its own pure module —
// select only ever previews a card, a separate confirm action is what
// actually commits the stake (src/ui/pubHubScreen.ts calls
// `options.onStartMatch` for that, which isn't this module's job) — so the
// state machine has a real unit test rather than living only as untested
// DOM-glue state.

export interface StakeSelectionState {
  /** The card id currently previewed, or null once nothing is selected. Nothing is staked until a separate confirm action fires. */
  selectedCardId: string | null;
}

export const EMPTY_STAKE_SELECTION: StakeSelectionState = { selectedCardId: null };

/** Selecting a card only ever moves into a preview state — it never stakes anything. Selecting a second card replaces the first outright. */
export function selectStakeCard(cardId: string): StakeSelectionState {
  return { selectedCardId: cardId };
}

export function clearStakeSelection(): StakeSelectionState {
  return EMPTY_STAKE_SELECTION;
}
