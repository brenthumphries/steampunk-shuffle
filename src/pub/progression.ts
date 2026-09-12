// Player titles by total wins (plan step 2.6, design.md §12.1's table,
// "Title (shown on the deck-slot screen)"). §12.1's actual *unlocks* — new
// opponents, Bar Bet/Tinker's Bench, tournaments — are already wired
// directly off the same `PubState.totalWins` counter (src/pub/opponents.ts's
// `unlockWins`/`isOpponentInTown`, src/tournaments/tournaments.ts's
// `isUnlocked`, src/pub/barBet.ts, src/pub/tinkersBench.ts); this module
// only derives the display title, which had no home until now.

export interface Title {
  minWins: number;
  name: string;
}

export const TITLES: readonly Title[] = [
  { minWins: 0, name: "Newcomer" },
  { minWins: 3, name: "Regular" },
  { minWins: 5, name: "Known at the Bar" },
  { minWins: 10, name: "Seasoned" },
  { minWins: 20, name: "Notorious" },
  { minWins: 35, name: "Legend of the Bridge" },
];

export function titleForWins(totalWins: number): string {
  let current = TITLES[0]!.name;
  for (const title of TITLES) {
    if (totalWins < title.minWins) break;
    current = title.name;
  }
  return current;
}
