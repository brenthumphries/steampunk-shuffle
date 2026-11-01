// Collects a human player's Scry answers before a play commits (design.md
// §5.16). playTurn resolves On Play synchronously and atomically, and the
// cards a Scry sees depend on the turn-start draw and any earlier effect, so
// the UI can't know them in advance. Instead it dry-runs the play: this
// module replays playTurn with a chooser that records the first unanswered
// Scry and aborts, the UI asks the player about those cards, and the loop
// repeats until nothing is left to ask. The engine is deterministic, so the
// final real playTurn sees exactly the cards the player was shown.

import { playTurn, type CardInstance, type MatchState, type PlayerId, type ScryChoice, type ScryChooser } from "../engine/matchEngine.ts";

export interface ScryRequest {
  cards: readonly CardInstance[];
  amount: number;
}

class ScryNeeded extends Error {
  constructor(readonly request: ScryRequest) {
    super("scry answer needed");
  }
}

/** The next Scry of this play that `answered` doesn't cover, or undefined when every Scry has an answer. */
export function nextScryRequest(state: MatchState, playerId: PlayerId, instanceId: string, answered: readonly ScryChoice[]): ScryRequest | undefined {
  let call = 0;
  const chooseScry: ScryChooser = (cards, amount) => {
    const given = answered[call++];
    if (given) return given;
    throw new ScryNeeded({ cards, amount });
  };
  try {
    playTurn(state, playerId, instanceId, { chooseScry });
  } catch (error) {
    if (error instanceof ScryNeeded) return error.request;
    throw error;
  }
  return undefined;
}

/** A chooser that replays collected answers in order, then leaves any further Scry alone. */
export function buildScryChooser(answered: readonly ScryChoice[]): ScryChooser {
  let call = 0;
  return (cards) => answered[call++] ?? { top: cards.map((c) => c.instanceId), bottom: [] };
}
