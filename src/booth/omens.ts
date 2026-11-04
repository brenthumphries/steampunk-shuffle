// Omens (content plan §5.3): the closed set of small kindnesses a Booth card
// grants until local midnight. Each is a pure function the economy code asks
// at the moment it matters ("what's today's omen?"); nothing here touches the
// DOM or the clock. Today's omen is not stored: it is the arcana of today's
// entry in `ledger.boothDraws`, so it expires by itself when the date changes.
// Only the one-shot effects need a flag (`PubState.booth.used`, per day).

import { stepRandom } from "../engine/rng.ts";
import { localDayIndex } from "../pub/opponents.ts";
import { localDateKey, type PubState } from "../pub/pubState.ts";
import type { OneShotOmenKind } from "./boothState.ts";
import { spendToken } from "../events/advent.ts";
import { recordChecksEarned } from "../save/ledger.ts";
import { TAROT, TAROT_BY_ID, type TarotArcana } from "./tarot.ts";

export type ConcreteOmen =
  | { kind: "checksNow"; amount: number }
  | { kind: "firstWinBonus"; amount: number }
  | { kind: "checksPerWin"; amount: number }
  | { kind: "lostAndFoundUpgrade" }
  | { kind: "lostAndFoundExtra" }
  | { kind: "pawnbrokerDiscount"; percent: number }
  | { kind: "tinkerFree" }
  | { kind: "openingHandPlusOne" }
  | { kind: "barBetInsurance" };

export type Omen = ConcreteOmen | { kind: "wildcard" };

/** Cards added to the player's opening hand by `openingHandPlusOne` (design: 5 instead of 4). */
export const OPENING_HAND_OMEN_BONUS = 1;

/** Keeps the wildcard's date seed from lining up with any other daily roll. */
const WILDCARD_SALT = 0x71a2e0;

const PERCENT_DENOMINATOR = 100;

/** The distinct concrete omens in the whole deck, in table order: what a wildcard can turn into. */
function wildcardPool(): ConcreteOmen[] {
  const seen = new Set<string>();
  const pool: ConcreteOmen[] = [];
  for (const a of TAROT) {
    if (a.omen.kind === "wildcard") continue;
    const key = JSON.stringify(a.omen);
    if (seen.has(key)) continue;
    seen.add(key);
    pool.push(a.omen);
  }
  return pool;
}

/** A wildcard resolves to one of the other omens, seeded by the date so it is stable all day. */
export function resolveOmen(omen: Omen, date: Date): ConcreteOmen {
  if (omen.kind !== "wildcard") return omen;
  const pool = wildcardPool();
  return pool[Math.floor(stepRandom(localDayIndex(date) ^ WILDCARD_SALT).value * pool.length)]!;
}

export interface TodaysOmen {
  arcana: TarotArcana;
  /** The arcana's own omen, as printed (may be a wildcard). */
  printed: Omen;
  /** What it does today (a wildcard already resolved). */
  omen: ConcreteOmen;
}

/** Today's omen, or null when the Booth hasn't been used today. Expires at local midnight because it is keyed to the date. */
export function todaysOmen(pub: Pick<PubState, "ledger">, date: Date): TodaysOmen | null {
  const key = localDateKey(date);
  const draw = [...pub.ledger.boothDraws].reverse().find((d) => d.date === key);
  const arcana = draw ? TAROT_BY_ID.get(draw.arcanaId) : undefined;
  return arcana ? { arcana, printed: arcana.omen, omen: resolveOmen(arcana.omen, date) } : null;
}

/** The omen's effect in words, for the hub chip and the booth. */
export function describeOmen(omen: Omen): string {
  switch (omen.kind) {
    case "checksNow":
      return `${omen.amount} Checks, paid now`;
    case "firstWinBonus":
      return `+${omen.amount} Checks on your first win today`;
    case "checksPerWin":
      return `+${omen.amount} Checks on every win today`;
    case "lostAndFoundUpgrade":
      return "A better card in the Lost & Found box";
    case "lostAndFoundExtra":
      return "A second card in the Lost & Found box";
    case "pawnbrokerDiscount":
      return `${omen.percent}% off at the Pawnbroker`;
    case "tinkerFree":
      return "The Tinker's Bench is free (one fusing)";
    case "openingHandPlusOne":
      return "Your first match opens with an extra card";
    case "barBetInsurance":
      return "Your first lost Bar Bet today comes home";
    case "wildcard":
      return "A wildcard: it turns into another omen at dawn";
  }
}

/** The line on the hub chip, e.g. "Omen: The Fool · 10 Checks, paid now". */
export function omenChipText(today: TodaysOmen): string {
  const effect = describeOmen(today.omen);
  return today.printed.kind === "wildcard" ? `Omen: ${today.arcana.name} · wildcard: ${effect}` : `Omen: ${today.arcana.name} · ${effect}`;
}

// ---------------------------------------------------------------------------
// One-shot flags
// ---------------------------------------------------------------------------

/** Whether today's one-shot effect `kind` has already been applied. A different day starts fresh. */
export function oneShotUsed(pub: Pick<PubState, "booth">, date: Date, kind: OneShotOmenKind): boolean {
  return pub.booth.usedDate === localDateKey(date) && pub.booth.used.includes(kind);
}

export function markOneShotUsed(pub: PubState, date: Date, kind: OneShotOmenKind): PubState {
  const key = localDateKey(date);
  const used = pub.booth.usedDate === key ? pub.booth.used : [];
  if (used.includes(kind)) return pub;
  return { ...pub, booth: { ...pub.booth, usedDate: key, used: [...used, kind] } };
}

/** Today's omen if it is of `kind` and (for a one-shot kind) not yet used; otherwise null. */
function liveOmen<K extends ConcreteOmen["kind"]>(pub: PubState, date: Date, kind: K): Extract<ConcreteOmen, { kind: K }> | null {
  const t = todaysOmen(pub, date);
  if (!t || t.omen.kind !== kind) return null;
  return t.omen as Extract<ConcreteOmen, { kind: K }>;
}

// ---------------------------------------------------------------------------
// The economy hooks
// ---------------------------------------------------------------------------

/** Extra Checks a win would pay under today's omen (peek only). */
export function winOmenBonus(pub: PubState, date: Date): number {
  const t = todaysOmen(pub, date);
  if (!t) return 0;
  if (t.omen.kind === "checksPerWin") return t.omen.amount;
  if (t.omen.kind === "firstWinBonus" && !oneShotUsed(pub, date, "firstWinBonus")) return t.omen.amount;
  return 0;
}

/** Applies the win omen: pays the bonus (and counts it in the Ledger) and spends a first-win flag. */
export function applyWinOmen(pub: PubState, date: Date): { next: PubState; bonus: number } {
  const bonus = winOmenBonus(pub, date);
  if (bonus === 0) return { next: pub, bonus: 0 };
  let next: PubState = { ...pub, checks: pub.checks + bonus, ledger: recordChecksEarned(pub.ledger, bonus) };
  if (liveOmen(pub, date, "firstWinBonus")) next = markOneShotUsed(next, date, "firstWinBonus");
  return { next, bonus };
}

/** Pawnbroker price after today's discount, rounded to whole Checks (never below 1). */
export function pawnbrokerPrice(pub: Pick<PubState, "ledger">, date: Date, basePrice: number): number {
  const t = todaysOmen(pub, date);
  if (!t || t.omen.kind !== "pawnbrokerDiscount") return basePrice;
  return Math.max(1, Math.round((basePrice * (PERCENT_DENOMINATOR - t.omen.percent)) / PERCENT_DENOMINATOR));
}

/** Whether the Lost & Found roll should be bumped one rarity (`lostAndFoundUpgrade`). */
export function lostAndFoundUpgradeActive(pub: PubState, date: Date): boolean {
  return liveOmen(pub, date, "lostAndFoundUpgrade") !== null;
}

/** Whether a second Lost & Found card is still on offer today. */
export function lostAndFoundExtraAvailable(pub: PubState, date: Date): boolean {
  return liveOmen(pub, date, "lostAndFoundExtra") !== null && !oneShotUsed(pub, date, "lostAndFoundExtra");
}

/** Whether the Booth's tinkerFree omen would waive a fusing right now. */
function tinkerOmenFree(pub: PubState, date: Date): boolean {
  return liveOmen(pub, date, "tinkerFree") !== null && !oneShotUsed(pub, date, "tinkerFree");
}

/** The Tinker's fee today: 0 for a free fusing (today's `tinkerFree` omen, or an Advent Cabinet token), otherwise `baseFee`. */
export function tinkerFee(pub: PubState, date: Date, baseFee: number): number {
  return tinkerOmenFree(pub, date) || pub.advent.tokens.tinkerFree > 0 ? 0 : baseFee;
}

/**
 * Pays for a free fusing: today's omen goes first (it lapses at midnight, a token keeps),
 * otherwise one token. Never both, so the two don't double-spend. Call once per fusing whose fee was 0.
 */
export function spendFreeFuse(pub: PubState, date: Date): PubState {
  return tinkerOmenFree(pub, date) ? markOneShotUsed(pub, date, "tinkerFree") : spendToken(pub, "tinkerFree");
}

/** Extra opening-hand cards for the player's next fresh match (0 once today's has been used). */
export function openingHandExtra(pub: PubState, date: Date): number {
  return liveOmen(pub, date, "openingHandPlusOne") !== null && !oneShotUsed(pub, date, "openingHandPlusOne") ? OPENING_HAND_OMEN_BONUS : 0;
}

/** Whether a lost Bar Bet would be insured right now (first loss today only). */
export function barBetInsuranceAvailable(pub: PubState, date: Date): boolean {
  return liveOmen(pub, date, "barBetInsurance") !== null && !oneShotUsed(pub, date, "barBetInsurance");
}
