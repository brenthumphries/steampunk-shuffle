// Tournament registry (plan step 2.4, design.md §10): the 4 named
// tournaments — entry rule, Checks cost, prize/consolation, eligible field,
// and unlock condition. Pure data + pure predicate functions, same split as
// src/pub/opponents.ts (registry) vs src/pub/pubState.ts (persistence) —
// bracket generation lives in bracket.ts, persistence in tournamentState.ts.

import type { Deck, Family } from "../cards/cardTypes.ts";
import { isWithinWindow, type MonthDay } from "../events/eventClock.ts";
import { HALLOWEEN, isEventLive, SEASONAL_EVENTS_BY_ID } from "../events/seasonalEvents.ts";
import type { Opponent } from "../pub/opponents.ts";

export type TournamentId = "tuesday-knockout" | "peelers-cup" | "reichenbach-open" | "birthday-invitational" | "all-hallows-wake";

export interface EntryCheck {
  valid: boolean;
  reason?: string;
}

export type PrizeCard = { kind: "randomRarity"; rarity: "uncommon" | "rare" | "legendary" } | { kind: "fixed"; cardId: string };

export interface Tournament {
  id: TournamentId;
  name: string;
  /** design.md §10's "When" / "Eligible field" columns, for display. */
  whenLabel: string;
  fieldLabel: string;
  entryRuleLabel: string;
  entryChecks: number;
  consolationChecks: number;
  prizeChecks: number;
  prizeCard: PrizeCard;
  /** Reichenbach Open only: paid instead of prizeChecks+card if every eligible legendary is already owned. */
  ownAllBonusChecks?: number;
  /**
   * A Location placed in the shared slot at the start of every match in this
   * tournament (seasonal-events-plan.md §2 rule 4) — either player can still
   * replace it. Resolved to a card by whoever starts the match.
   */
  houseLocationId?: string;
  /**
   * Whether the tournament can be entered. `date` is "today" from
   * src/events/eventClock.ts; only a seasonal tournament reads it. A bracket
   * already in progress isn't re-checked against this, so one started on the
   * last day of an event can still be finished after the window closes.
   */
  isUnlocked: (totalWins: number, invitationalTriggered: boolean, date: Date) => boolean;
  /**
   * Set for a seasonal tournament: the event (src/events/seasonalEvents.ts)
   * that must be live for it to be listed on the chalkboard at all. Its own
   * `isUnlocked` may narrow that further to a sub-window.
   */
  eventId?: string;
  eligiblePool: (opponents: readonly Opponent[]) => Opponent[];
  /**
   * Opponents who are always seated (chosen from `eligiblePool`'s result)
   * rather than drawn at random; the remaining seats are drawn from the rest
   * of the pool as usual. The bracket shuffles the final seating, so the
   * player's quarterfinal opponent isn't always one of these.
   */
  fixedSeats?: (eligiblePool: readonly Opponent[]) => Opponent[];
  /** Higher weight = more likely to be drawn into the 7 AI seats (design.md §10's "Yard opponents favoured"). Defaults to uniform. */
  seatWeight?: (opponent: Opponent) => number;
  checkEntryDeck: (deck: Deck) => EntryCheck;
}

function deckPrintedPoints(deck: Deck): number {
  return deck.reduce((sum, e) => sum + e.card.faces[0].points * e.quantity, 0);
}

function deckMaxSingleFamilyCount(deck: Deck): number {
  const counts = new Map<Family, number>();
  for (const e of deck) {
    const family = e.card.faces[0].family;
    counts.set(family, (counts.get(family) ?? 0) + e.quantity);
  }
  return Math.max(0, ...counts.values());
}

function anyLegalDeck(): EntryCheck {
  return { valid: true };
}

const REGULAR_OR_SEASONED = (opponents: readonly Opponent[]): Opponent[] => opponents.filter((o) => o.tier === "regular" || o.tier === "seasoned");

/** Spring-Heeled Jack, and any other opponent who only ever sits inside one specific tournament, never joins another's field. */
const EVERYDAY_OPPONENTS = (opponents: readonly Opponent[]): Opponent[] => opponents.filter((o) => !o.tournamentOnly);

/** The All Hallows' Wake opens for its last ten days, inside Hallowe'en's own window (seasonal-events-plan.md §3.3). */
const WAKE_START: MonthDay = { month: 10, day: 22 };
const WAKE_END: MonthDay = { month: 10, day: 31 };

/** The five Hallowe'en visitors, seated in the All Hallows' Wake. */
const isWakeVisitor = (o: Opponent): boolean => HALLOWEEN.visitors.some((v) => v.opponentId === o.id);

/** Mudd and Bucket are the Yard-affiliated Regular/Seasoned opponents (src/cards/data/decks/README.md's per-opponent family table). */
const YARD_AFFILIATED_IDS = new Set(["mudd", "bucket"]);

export const TOURNAMENTS: Tournament[] = [
  {
    id: "tuesday-knockout",
    name: "The Tuesday Knockout",
    whenLabel: "Always open",
    fieldLabel: "Regulars + Seasoned",
    entryRuleLabel: "Any legal deck",
    entryChecks: 20,
    consolationChecks: 10,
    prizeChecks: 60,
    prizeCard: { kind: "randomRarity", rarity: "uncommon" },
    isUnlocked: () => true,
    eligiblePool: REGULAR_OR_SEASONED,
    checkEntryDeck: anyLegalDeck,
  },
  {
    id: "peelers-cup",
    name: "The Peelers' Cup",
    whenLabel: "After 5 wins",
    fieldLabel: "Regulars + Seasoned (Yard opponents favoured)",
    entryRuleLabel: "≤45 printed points (pauper format)",
    entryChecks: 40,
    consolationChecks: 15,
    prizeChecks: 120,
    prizeCard: { kind: "randomRarity", rarity: "rare" },
    isUnlocked: (totalWins) => totalWins >= 5,
    eligiblePool: REGULAR_OR_SEASONED,
    seatWeight: (o) => (YARD_AFFILIATED_IDS.has(o.id) ? 5 : 1),
    checkEntryDeck: (deck) => {
      const points = deckPrintedPoints(deck);
      return points <= 45 ? { valid: true } : { valid: false, reason: `Deck is ${points} printed points — the Peelers' Cup is a pauper format, capped at 45.` };
    },
  },
  {
    id: "reichenbach-open",
    name: "The Reichenbach Open",
    whenLabel: "After 20 wins",
    fieldLabel: "Seasoned + all Legends",
    entryRuleLabel: "≥12 cards from a single family",
    entryChecks: 80,
    consolationChecks: 30,
    prizeChecks: 250,
    prizeCard: { kind: "randomRarity", rarity: "legendary" },
    ownAllBonusChecks: 300,
    isUnlocked: (totalWins) => totalWins >= 20,
    eligiblePool: (opponents) => EVERYDAY_OPPONENTS(opponents).filter((o) => o.tier === "seasoned" || o.tier === "legend"),
    checkEntryDeck: (deck) => {
      const count = deckMaxSingleFamilyCount(deck);
      return count >= 12 ? { valid: true } : { valid: false, reason: `Deck's largest single family is ${count} cards — the Reichenbach Open needs at least 12.` };
    },
  },
  {
    id: "birthday-invitational",
    name: "The Birthday Invitational",
    whenLabel: "Unlocks October 30",
    fieldLabel: "All six Legends + Sir Charles",
    entryRuleLabel: "Any legal deck",
    entryChecks: 0,
    consolationChecks: 0,
    prizeChecks: 500,
    prizeCard: { kind: "fixed", cardId: "the-landlady" },
    isUnlocked: (_totalWins, invitationalTriggered) => invitationalTriggered,
    eligiblePool: (opponents) => EVERYDAY_OPPONENTS(opponents).filter((o) => o.tier === "legend" || o.id === "sir-charles"),
    checkEntryDeck: anyLegalDeck,
  },
  // Seasonal (seasonal-events-plan.md §3.3). The Witching Hour is placed in
  // the shared slot at the start of every match; either player can still
  // replace it. Spring-Heeled Jack's card is the prize, so he pays no
  // separate first-win reward (`Opponent.tournamentOnly`).
  {
    id: "all-hallows-wake",
    name: "The All Hallows' Wake",
    eventId: HALLOWEEN.id,
    whenLabel: "Oct 22 – Oct 31, after 3 wins",
    fieldLabel: "The five Hallowe'en visitors, Spring-Heeled Jack + one Seasoned",
    entryRuleLabel: "Any legal deck",
    entryChecks: 13,
    consolationChecks: 13,
    prizeChecks: 150,
    prizeCard: { kind: "fixed", cardId: "spring-heeled-jack" },
    houseLocationId: "the-witching-hour",
    isUnlocked: (totalWins, _invitationalTriggered, date) =>
      totalWins >= (SEASONAL_EVENTS_BY_ID.get(HALLOWEEN.id)?.minWins ?? 0) && isEventLive(HALLOWEEN.id, date) && isWithinWindow(date, WAKE_START, WAKE_END),
    eligiblePool: (opponents) => opponents.filter((o) => isWakeVisitor(o) || o.id === "spring-heeled-jack" || o.tier === "seasoned"),
    fixedSeats: (pool) => pool.filter((o) => isWakeVisitor(o) || o.id === "spring-heeled-jack"),
    checkEntryDeck: anyLegalDeck,
  },
];

export const TOURNAMENTS_BY_ID = new Map<TournamentId, Tournament>(TOURNAMENTS.map((t) => [t.id, t]));

/**
 * Whether the chalkboard and the House Rules table list `tournament` at
 * all. The Birthday Invitational stays invisible until its date trigger
 * fires (PT-5, design.md §14.6 — a surprise); a seasonal tournament isn't
 * listed outside its event's window. A tournament with a bracket already in
 * progress is always listed, so it can be resumed after its window closes.
 */
export function isTournamentListed(tournament: Tournament, invitationalTriggered: boolean, date: Date, hasActiveBracket: boolean): boolean {
  if (hasActiveBracket) return true;
  if (tournament.id === "birthday-invitational" && !invitationalTriggered) return false;
  if (tournament.eventId !== undefined && !isEventLive(tournament.eventId, date)) return false;
  return true;
}
