// Tournament registry (plan step 2.4, design.md §10): the 4 named
// tournaments — entry rule, Checks cost, prize/consolation, eligible field,
// and unlock condition. Pure data + pure predicate functions, same split as
// src/pub/opponents.ts (registry) vs src/pub/pubState.ts (persistence) —
// bracket generation lives in bracket.ts, persistence in tournamentState.ts.

import type { Deck, Family } from "../cards/cardTypes.ts";
import type { Opponent } from "../pub/opponents.ts";

export type TournamentId = "tuesday-knockout" | "peelers-cup" | "reichenbach-open" | "birthday-invitational";

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
  isUnlocked: (totalWins: number, invitationalTriggered: boolean) => boolean;
  eligiblePool: (opponents: readonly Opponent[]) => Opponent[];
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
    eligiblePool: (opponents) => opponents.filter((o) => o.tier === "seasoned" || o.tier === "legend"),
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
    eligiblePool: (opponents) => opponents.filter((o) => o.tier === "legend" || o.id === "sir-charles"),
    checkEntryDeck: anyLegalDeck,
  },
];

export const TOURNAMENTS_BY_ID = new Map<TournamentId, Tournament>(TOURNAMENTS.map((t) => [t.id, t]));
