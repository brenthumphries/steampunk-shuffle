// Tournament registry (plan step 2.4, design.md §10): the 4 named
// tournaments — entry rule, Checks cost, prize/consolation, eligible field,
// and unlock condition. Pure data + pure predicate functions, same split as
// src/pub/opponents.ts (registry) vs src/pub/pubState.ts (persistence) —
// bracket generation lives in bracket.ts, persistence in tournamentState.ts.

import { visibleInEdition } from "../edition.ts";
import type { Deck, Family } from "../cards/cardTypes.ts";
import { isWithinWindow, type MonthDay } from "../events/eventClock.ts";
import { CUNNING_FOLK, GHOST_STORY, HALLOWEEN, isEventLive, SEASONAL_EVENTS_BY_ID } from "../events/seasonalEvents.ts";
import { isPublicEdition } from "../edition.ts";
import type { Opponent } from "../pub/opponents.ts";

export type TournamentId = "tuesday-knockout" | "peelers-cup" | "reichenbach-open" | "birthday-invitational" | "all-hallows-wake" | "almanack-stakes" | "fireside-circle";

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
  /** A sub-window of the event (the Fireside Circle, Dec 18-31): the chalkboard lists it only inside it. */
  listWindow?: { start: MonthDay; end: MonthDay };
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

/** Copies of Coven-family cards in a deck (the Almanack Stakes' entry rule, 01-november.md §5). */
function deckCovenCount(deck: Deck): number {
  return deck.reduce((sum, e) => sum + (e.card.faces[0].family === "coven" ? e.quantity : 0), 0);
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

/** The Almanack Stakes' field (01-november.md §5): the three Cunning Folk, always seated; the other four seats are Seasoned. */
export const ALMANACK_STAKES_FIELD_IDS: readonly string[] = ["mother-shipton", "john-dee", "mother-red-cap"];

/** The Fireside Circle's field (02-december.md §6): four fixed seats, the rest drawn from the Seasoned. */
export const FIRESIDE_CIRCLE_FIELD_IDS: readonly string[] = ["ghost-of-christmas-present", "mr-pockett", "dickens", "ghost-of-christmas-yet-to-come"];

/** The Fireside Circle runs Dec 18-31, inside the Ghost Story window. */
const FIRESIDE_START: MonthDay = { month: 12, day: 18 };
const FIRESIDE_END: MonthDay = { month: 12, day: 31 };

/** The Stakes open for the last ten days of the Cunning Folk window, with the event's own minWins. */
const STAKES_START: MonthDay = { month: 11, day: 20 };
const STAKES_END: MonthDay = { month: 11, day: 30 };

/** Coven cards a deck needs to enter the Almanack Stakes. */
export const ALMANACK_STAKES_MIN_COVEN = 2;

/** Mudd and Bucket are the Yard-affiliated Regular/Seasoned opponents (src/cards/data/decks/README.md's per-opponent family table). */
const YARD_AFFILIATED_IDS = new Set(["mudd", "bucket"]);

const ALL_TOURNAMENTS: Tournament[] = [
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
  // The Cunning Folk (01-november.md §5): Nov 20-30, after 3 wins. Mother Red
  // Cap is the prize; she is seated here by id, so `tournamentOnly` (which
  // keeps her out of every other field) doesn't apply.
  {
    id: "almanack-stakes",
    name: "The Almanack Stakes",
    eventId: CUNNING_FOLK.id,
    whenLabel: "Nov 20 – Nov 30, after 3 wins",
    fieldLabel: "Mother Shipton, Dr John Dee, Mother Red Cap + 4 Seasoned",
    entryRuleLabel: "At least 2 Coven cards",
    entryChecks: 13,
    consolationChecks: 13,
    prizeChecks: 150,
    prizeCard: { kind: "fixed", cardId: "mother-red-cap" },
    houseLocationId: "the-petrifying-well",
    isUnlocked: (totalWins, _invitationalTriggered, date) =>
      totalWins >= (SEASONAL_EVENTS_BY_ID.get(CUNNING_FOLK.id)?.minWins ?? 0) && isEventLive(CUNNING_FOLK.id, date) && isWithinWindow(date, STAKES_START, STAKES_END),
    eligiblePool: (opponents) => opponents.filter((o) => ALMANACK_STAKES_FIELD_IDS.includes(o.id) || o.tier === "seasoned"),
    fixedSeats: (pool) => pool.filter((o) => ALMANACK_STAKES_FIELD_IDS.includes(o.id)),
    checkEntryDeck: (deck) => {
      const count = deckCovenCount(deck);
      return count >= ALMANACK_STAKES_MIN_COVEN
        ? { valid: true }
        : { valid: false, reason: `The Almanack Stakes needs at least ${ALMANACK_STAKES_MIN_COVEN} Coven cards in the deck.` };
    },
  },
  // A Ghost Story for Christmas (02-december.md §6): Dec 18-31, after 3 wins.
  // The Yet to Come is the prize and sits here by id (`tournamentOnly` keeps
  // him out of every other field); Mr Pockett is a giftOnly seat.
  {
    id: "fireside-circle",
    name: "The Fireside Circle",
    eventId: GHOST_STORY.id,
    listWindow: { start: FIRESIDE_START, end: FIRESIDE_END },
    whenLabel: "Dec 18 – Dec 31, after 3 wins",
    fieldLabel: "The Ghost of Christmas Present, Mr Pockett, Dickens, the Ghost of Christmas Yet to Come + 3 random Seasoned",
    entryRuleLabel: "Any legal deck",
    entryChecks: 13,
    consolationChecks: 13,
    prizeChecks: 150,
    prizeCard: { kind: "fixed", cardId: "ghost-of-christmas-yet-to-come" },
    houseLocationId: "the-fireside-tale",
    // The public build's field is one seat short (see FIRESIDE_CIRCLE_FIELD_IDS): it is not offered there until a fourth Seasoned or another filler exists.
    isUnlocked: (totalWins, _invitationalTriggered, date) =>
      !isPublicEdition() && totalWins >= (SEASONAL_EVENTS_BY_ID.get(GHOST_STORY.id)?.minWins ?? 0) && isEventLive(GHOST_STORY.id, date) && isWithinWindow(date, FIRESIDE_START, FIRESIDE_END),
    eligiblePool: (opponents) => opponents.filter((o) => FIRESIDE_CIRCLE_FIELD_IDS.includes(o.id) || o.tier === "seasoned"),
    fixedSeats: (pool) => pool.filter((o) => FIRESIDE_CIRCLE_FIELD_IDS.includes(o.id)),
    checkEntryDeck: anyLegalDeck,
  },
];

/**
 * Every tournament's field is drawn after the edition filter, so a public
 * build never seats a `giftOnly` opponent (src/edition.ts).
 */
export const TOURNAMENTS: Tournament[] = ALL_TOURNAMENTS.map((t) => ({
  ...t,
  eligiblePool: (opponents: readonly Opponent[]) => t.eligiblePool(opponents.filter(visibleInEdition)),
}));

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
  if (tournament.listWindow && !isWithinWindow(date, tournament.listWindow.start, tournament.listWindow.end)) return false;
  return true;
}
