// The Ledger (docs/plans/monthly/00-monthly-content-plan.md §4.3): a year of
// counts for the September recap and the Booth's Grand Reading. Counts only —
// no analytics, nothing leaves the device. It lives inside the existing
// `steampunk-shuffle:pub-state` key (PubState.ledger), because the privacy
// e2e test whitelists localStorage keys and a new field must not be a new key.
//
// Everything here is pure: each function takes a Ledger and returns a new one.
// main.ts calls them from the existing match-end and reward code paths.

export interface OpponentTally {
  wins: number;
  losses: number;
  draws: number;
}

export interface Ledger {
  /** Local-date key ("YYYY-MM-DD") of the first launch; for a save that predates the ledger, the day it was migrated. Null until the first launch registers. */
  firstLaunch: string | null;
  /** Times the player played each card (by card id) across pickup and tournament matches. */
  cardPlays: Record<string, number>;
  /** Pickup and tournament results by opponent id. */
  opponents: Record<string, OpponentTally>;
  /** Checks earned from play (match payouts, tournament payouts, the tutorial reward). Spending isn't subtracted. */
  checksEarned: number;
  /** The first legendary card the player came to own, and the day. */
  firstLegendary: { id: string; date: string } | null;
  tournamentsWon: { id: string; date: string }[];
  /** Plays of the five pub-cat cards, by card id. */
  catsPlayed: Record<string, number>;
  /** Every Booth reading, oldest first (appended by the Booth, N-C). */
  boothDraws: { arcanaId: string; date: string }[];
}

/** The five real pub cats' card ids (docs/app-store-readiness.md §7). */
export const CAT_CARD_IDS: readonly string[] = ["hiawatha", "banshee", "bramwell", "charlotte", "emily"];

export function defaultLedger(): Ledger {
  return { firstLaunch: null, cardPlays: {}, opponents: {}, checksEarned: 0, firstLegendary: null, tournamentsWon: [], catsPlayed: {}, boothDraws: [] };
}

/** A ledger for a save that predates it: everything zero, first launch = the migration day. */
export function migratedLedger(migrationDate: string): Ledger {
  return { ...defaultLedger(), firstLaunch: migrationDate };
}

/** Sets `firstLaunch` the first time it's called; a no-op afterwards. */
export function registerLaunch(ledger: Ledger, dateKey: string): Ledger {
  return ledger.firstLaunch === null ? { ...ledger, firstLaunch: dateKey } : ledger;
}

export function recordCardPlay(ledger: Ledger, cardId: string): Ledger {
  const next: Ledger = { ...ledger, cardPlays: { ...ledger.cardPlays, [cardId]: (ledger.cardPlays[cardId] ?? 0) + 1 } };
  if (CAT_CARD_IDS.includes(cardId)) next.catsPlayed = { ...ledger.catsPlayed, [cardId]: (ledger.catsPlayed[cardId] ?? 0) + 1 };
  return next;
}

export function recordOpponentResult(ledger: Ledger, opponentId: string, outcome: "win" | "loss" | "draw"): Ledger {
  const tally = ledger.opponents[opponentId] ?? { wins: 0, losses: 0, draws: 0 };
  const next: OpponentTally = {
    wins: tally.wins + (outcome === "win" ? 1 : 0),
    losses: tally.losses + (outcome === "loss" ? 1 : 0),
    draws: tally.draws + (outcome === "draw" ? 1 : 0),
  };
  return { ...ledger, opponents: { ...ledger.opponents, [opponentId]: next } };
}

export function recordChecksEarned(ledger: Ledger, amount: number): Ledger {
  return amount > 0 ? { ...ledger, checksEarned: ledger.checksEarned + amount } : ledger;
}

/** Records the first legendary the player owns; later ones don't replace it. */
export function recordCardAcquired(ledger: Ledger, cardId: string, rarity: string, dateKey: string): Ledger {
  return ledger.firstLegendary === null && rarity === "legendary" ? { ...ledger, firstLegendary: { id: cardId, date: dateKey } } : ledger;
}

export function recordTournamentWon(ledger: Ledger, tournamentId: string, dateKey: string): Ledger {
  return { ...ledger, tournamentsWon: [...ledger.tournamentsWon, { id: tournamentId, date: dateKey }] };
}

export function recordBoothDraw(ledger: Ledger, arcanaId: string, dateKey: string): Ledger {
  return { ...ledger, boothDraws: [...ledger.boothDraws, { arcanaId, date: dateKey }] };
}

function isCountMap(value: unknown): value is Record<string, number> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && Object.values(value).every((n) => typeof n === "number" && Number.isFinite(n));
}

function isDated<T extends string>(value: unknown, key: T): value is Record<T, string> & { date: string } {
  const v = value as Record<string, unknown> | null;
  return typeof v === "object" && v !== null && typeof v[key] === "string" && typeof v.date === "string";
}

/**
 * Reads a ledger out of untrusted saved data. A save with no ledger at all
 * (it predates it) migrates to `migratedLedger(migrationDate)`; a ledger
 * that's present but partly garbled keeps whatever fields parse and zeroes
 * the rest.
 */
export function parseLedger(raw: unknown, migrationDate: string): Ledger {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return migratedLedger(migrationDate);
  const r = raw as Record<string, unknown>;
  const base = defaultLedger();
  const opponents: Record<string, OpponentTally> = {};
  if (typeof r.opponents === "object" && r.opponents !== null) {
    for (const [id, t] of Object.entries(r.opponents)) {
      const tt = t as Partial<OpponentTally> | null;
      if (tt && typeof tt.wins === "number" && typeof tt.losses === "number" && typeof tt.draws === "number") opponents[id] = { wins: tt.wins, losses: tt.losses, draws: tt.draws };
    }
  }
  const fl = r.firstLegendary;
  return {
    firstLaunch: typeof r.firstLaunch === "string" ? r.firstLaunch : r.firstLaunch === null ? null : migrationDate,
    cardPlays: isCountMap(r.cardPlays) ? r.cardPlays : base.cardPlays,
    opponents,
    checksEarned: typeof r.checksEarned === "number" ? r.checksEarned : 0,
    firstLegendary: isDated(fl, "id") ? { id: fl.id, date: fl.date } : null,
    tournamentsWon: Array.isArray(r.tournamentsWon) ? r.tournamentsWon.filter((t) => isDated(t, "id")).map((t) => ({ id: t.id, date: t.date })) : [],
    catsPlayed: isCountMap(r.catsPlayed) ? r.catsPlayed : base.catsPlayed,
    boothDraws: Array.isArray(r.boothDraws) ? r.boothDraws.filter((d) => isDated(d, "arcanaId")).map((d) => ({ arcanaId: d.arcanaId, date: d.date })) : [],
  };
}

// ---------------------------------------------------------------------------
// Match-end and reward hooks: main.ts calls these from the existing pickup,
// bar-bet and tournament code paths so the wiring is one pure, tested call.
// ---------------------------------------------------------------------------

/** A pickup game ended: the opponent's tally, the Checks it paid, and the first-win reward card if there was one. */
export function ledgerAfterPickup(
  ledger: Ledger,
  result: { opponentId: string; outcome: "win" | "loss" | "draw"; checksEarned: number; reward?: { id: string; rarity: string } | null; dateKey: string },
): Ledger {
  let next = recordChecksEarned(recordOpponentResult(ledger, result.opponentId, result.outcome), result.checksEarned);
  if (result.reward) next = recordCardAcquired(next, result.reward.id, result.reward.rarity, result.dateKey);
  return next;
}

/** A tournament bracket match ended: the opponent's tally only (the payout comes at the end of the bracket). */
export function ledgerAfterTournamentMatch(ledger: Ledger, opponentId: string, outcome: "win" | "loss"): Ledger {
  return recordOpponentResult(ledger, opponentId, outcome);
}

/** A bracket finished: the Checks paid (consolation or prize), the win if it was one, and a prize card. */
export function ledgerAfterTournamentEnd(
  ledger: Ledger,
  result: { tournamentId: string; champion: boolean; checks: number; prize?: { id: string; rarity: string } | null; dateKey: string },
): Ledger {
  let next = recordChecksEarned(ledger, result.checks);
  if (result.champion) next = recordTournamentWon(next, result.tournamentId, result.dateKey);
  if (result.prize) next = recordCardAcquired(next, result.prize.id, result.prize.rarity, result.dateKey);
  return next;
}
