// Difficulty-curve check (plan step 3.7's newcomer review; see
// docs/newcomer-review.md). Plays the starter deck against every opponent
// of one tier, with the opponent on its own tier's AI dial (design.md §9.4)
// and the starter on a "human skill" proxy: `regular` stands in for a
// fumbling newcomer, `seasoned` for the starter "played sensibly"
// (design.md §12.2's wording). Complements `tools/sim.ts`, whose
// starter-vs-Regular row uses `regular` on both sides.
//
// Run: `npm run curve -- <regular|seasoned|legend|visitor|wake> [humanDial] [games] [deckName]`
// Targets (design.md §9.1-§9.3, §12.2): starter should win ~60% vs
// Regulars, ~40-45% vs Seasoned, ~30% vs Legends; seasonal visitors are
// Seasoned-tier intent (seasonal-events-plan.md §5: 40-50%).

import { chooseAIMove, type Difficulty } from "../src/ai/aiOpponent.ts";
import { createMatch, currentPlayer, playTurn, type MatchResult } from "../src/engine/matchEngine.ts";
import type { Deck } from "../src/cards/cardTypes.ts";
import {
  KNOWN_DECKS,
  starterDeck,
  REGULAR_DECK_NAMES,
  SEASONED_DECK_NAMES,
  LEGEND_DECK_NAMES,
  VISITOR_DECK_NAMES,
  WAKE_LEGEND_DECK_NAME,
} from "../src/cards/data/decks/index.ts";

const TURN_GUARD = 60;

function playGame(deckA: Deck, deckB: Deck, difA: Difficulty, difB: Difficulty, g: number): MatchResult | undefined {
  let state = createMatch(deckA, deckB, { seed: 11_000_003 * (g + 1), shuffle: true });
  let seedA = 12_000_017 * (g + 1);
  let seedB = 13_000_029 * (g + 1);
  let guard = 0;
  while (state.status === "in-progress" && guard++ < TURN_GUARD) {
    if (currentPlayer(state) === "A") {
      const move = chooseAIMove(state, "A", deckB, difA, seedA);
      state = playTurn(state, "A", move.instanceId);
      seedA = move.nextSeed;
    } else {
      const move = chooseAIMove(state, "B", deckA, difB, seedB);
      state = playTurn(state, "B", move.instanceId);
      seedB = move.nextSeed;
    }
  }
  return state.result;
}

const TIERS: Record<string, { names: readonly string[]; dial: Difficulty; defaultGames: number }> = {
  regular: { names: REGULAR_DECK_NAMES, dial: "regular", defaultGames: 40 },
  seasoned: { names: SEASONED_DECK_NAMES, dial: "seasoned", defaultGames: 30 },
  legend: { names: LEGEND_DECK_NAMES, dial: "legend", defaultGames: 12 },
  // Seasonal visitors play the seasoned dial and pay Seasoned Checks (src/pub/opponents.ts).
  visitor: { names: VISITOR_DECK_NAMES, dial: "seasoned", defaultGames: 30 },
  // Spring-Heeled Jack alone, on the legend dial (seasonal-events-plan.md §3.3).
  wake: { names: [WAKE_LEGEND_DECK_NAME], dial: "legend", defaultGames: 12 },
};

function main(): void {
  const tierName = process.argv[2] ?? "regular";
  const tier = TIERS[tierName];
  if (!tier) throw new Error(`unknown tier "${tierName}" — expected regular | seasoned | legend | visitor | wake`);
  const humanDial = (process.argv[3] ?? "seasoned") as Difficulty;
  const games = Number(process.argv[4] ?? tier.defaultGames);
  // Optional 5th argument: play only the deck with this exact name, to re-check one deck without paying for the whole tier.
  const only = process.argv[5];
  const names = only ? tier.names.filter((n) => n === only) : tier.names;
  if (only && names.length === 0) throw new Error(`no deck named "${only}" in tier "${tierName}"`);

  for (const name of names) {
    const entry = KNOWN_DECKS.find((d) => d.name === name);
    if (!entry) throw new Error(`no deck named "${name}"`);
    let wins = 0;
    let losses = 0;
    let draws = 0;
    const started = Date.now();
    for (let g = 0; g < games; g++) {
      const result = playGame(starterDeck, entry.deck, humanDial, tier.dial, g);
      if (result?.winner === "A") wins++;
      else if (result?.winner === "B") losses++;
      else draws++;
    }
    const secs = ((Date.now() - started) / 1000).toFixed(0);
    console.log(
      `${tierName.padEnd(8)} starter@${humanDial.padEnd(8)} vs ${name.padEnd(24)} W${wins} L${losses} D${draws}  starter wins ${Math.round((100 * wins) / games)}%  (${secs}s)`,
    );
  }
}

main();
