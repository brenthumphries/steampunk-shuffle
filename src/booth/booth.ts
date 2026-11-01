// The Fortune-teller's Booth (content plan §5.3, design.md §17.2): one reading
// a day from the Major Arcana unlocked so far. Pure functions over PubState;
// the screen decides when to call them and saves the result.

import type { MonthDay } from "../events/eventClock.ts";
import { stepRandom } from "../engine/rng.ts";
import { localDayIndex } from "../pub/opponents.ts";
import { ACQUIRABLE_CARDS_BY_ID } from "../pub/acquirableCards.ts";
import { addCopyToCollection, localDateKey, type PubState } from "../pub/pubState.ts";
import { recordBoothDraw, recordCardAcquired, recordChecksEarned } from "../save/ledger.ts";
import { resolveOmen, todaysOmen, type ConcreteOmen } from "./omens.ts";
import { TAROT, type TarotArcana } from "./tarot.ts";

/** The Booth host (a non-playing character, not an Opponent) and her signature card. */
export const PIXIE_HOST_ID = "pamela-colman-smith";
export const PIXIE_CARD_ID = "pamela-colman-smith";
export const PIXIE_PORTRAIT_ART_ID = "portrait-pamela-colman-smith";
export const PIXIE_GIFT_LINE = "I painted one of me. Vanity. Keep it.";
export const COME_BACK_LINE = "Come back tomorrow, love.";

/** Keeps the daily draw's seed from lining up with the other daily rolls. */
const BOOTH_SALT = 0x600717;
const SALT_RANGE = 0x7fffffff;

/**
 * The Booth host's arrival and the end of the Cunning Folk window (Nov 30).
 * Mirrors the pack's `hosts[].arrives` and `window.end`; the pack is authored
 * in N-D, so these named constants stand in until booth.ts can read it.
 */
export const BOOTH_HOST_ARRIVES: MonthDay = { month: 11, day: 13 };
export const BOOTH_WINDOW_END: MonthDay = { month: 11, day: 30 };

function parseKey(key: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  return m ? Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

/**
 * An arcana is unlocked once the calendar has passed its `unlocks` date at
 * least once since the first launch: some year's occurrence of that date falls
 * on or after the first-launch day and on or before today. Computed from dates,
 * never stored; once true it stays true because later days only add occurrences.
 *
 * Fallback: an arcana that unlocks on the host's arrival date also counts when
 * the first launch fell after that date but still inside the same year's
 * window (arrival to window end), since the player met the host that launch.
 */
export function isUnlocked(arcana: TarotArcana, firstLaunch: string | null, date: Date): boolean {
  const first = firstLaunch === null ? null : parseKey(firstLaunch);
  if (first === null) return false;
  const todayUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  if (arcana.unlocks.month === BOOTH_HOST_ARRIVES.month && arcana.unlocks.day === BOOTH_HOST_ARRIVES.day) {
    const year = new Date(first).getUTCFullYear();
    const arrival = Date.UTC(year, BOOTH_HOST_ARRIVES.month - 1, BOOTH_HOST_ARRIVES.day);
    const windowEnd = Date.UTC(year, BOOTH_WINDOW_END.month - 1, BOOTH_WINDOW_END.day);
    if (first > arrival && first <= windowEnd && todayUtc >= first) return true;
  }
  for (let year = new Date(first).getUTCFullYear(); year <= date.getFullYear(); year++) {
    const occurrence = Date.UTC(year, arcana.unlocks.month - 1, arcana.unlocks.day);
    if (occurrence >= first && occurrence <= todayUtc) return true;
  }
  return false;
}

export function unlockedArcana(firstLaunch: string | null, date: Date): TarotArcana[] {
  return TAROT.filter((a) => isUnlocked(a, firstLaunch, date));
}

/** Whether `arcanaId` has ever been drawn. */
export function hasDrawn(pub: Pick<PubState, "ledger">, arcanaId: string): boolean {
  return pub.ledger.boothDraws.some((d) => d.arcanaId === arcanaId);
}

export function readingDoneToday(pub: Pick<PubState, "ledger">, date: Date): boolean {
  const key = localDateKey(date);
  return pub.ledger.boothDraws.some((d) => d.date === key);
}

/**
 * Today's pick from `unlocked`: seeded from the date plus the per-save `salt`,
 * and never `previousId` when there is any other choice.
 */
export function chooseArcana(unlocked: readonly TarotArcana[], previousId: string | null, date: Date, salt: number): TarotArcana | null {
  const choices = unlocked.length > 1 ? unlocked.filter((a) => a.id !== previousId) : unlocked;
  if (choices.length === 0) return null;
  const seed = localDayIndex(date) ^ BOOTH_SALT ^ salt;
  return choices[Math.floor(stepRandom(seed).value * choices.length)]!;
}

export interface Reading {
  next: PubState;
  arcana: TarotArcana;
  omen: ConcreteOmen;
  /** Checks paid by a `checksNow` omen. */
  checksPaid: number;
  /** Pixie's signature card, handed over on the first reading ever (null otherwise, or if the card isn't authored yet). */
  grantedCardId: string | null;
}

/**
 * Today's reading, or null when one has already been done today or no arcana is
 * unlocked yet. Records the draw in the Ledger, pays a `checksNow` omen, and on
 * the very first reading hands over Pixie's card (skipped safely if its id
 * doesn't resolve in the card registry).
 */
export function performReading(pub: PubState, date: Date, newSalt: () => number = () => Math.floor(Math.random() * SALT_RANGE)): Reading | null {
  if (readingDoneToday(pub, date)) return null;
  const salt = pub.booth.salt ?? newSalt();
  const last = pub.ledger.boothDraws[pub.ledger.boothDraws.length - 1];
  const arcana = chooseArcana(unlockedArcana(pub.ledger.firstLaunch, date), last?.arcanaId ?? null, date, salt);
  if (!arcana) return null;

  const dateKey = localDateKey(date);
  const omen = resolveOmen(arcana.omen, date);
  const first = pub.ledger.boothDraws.length === 0;
  let next: PubState = { ...pub, booth: { ...pub.booth, salt }, ledger: recordBoothDraw(pub.ledger, arcana.id, dateKey) };

  let checksPaid = 0;
  if (omen.kind === "checksNow") {
    checksPaid = omen.amount;
    next = { ...next, checks: next.checks + checksPaid, ledger: recordChecksEarned(next.ledger, checksPaid) };
  }

  let grantedCardId: string | null = null;
  const gift = ACQUIRABLE_CARDS_BY_ID.get(PIXIE_CARD_ID);
  if (first && gift && !next.collection.includes(PIXIE_CARD_ID)) {
    grantedCardId = PIXIE_CARD_ID;
    next = addCopyToCollection(next, PIXIE_CARD_ID);
    next = { ...next, ledger: recordCardAcquired(next.ledger, PIXIE_CARD_ID, gift.rarity, dateKey) };
  }
  return { next, arcana, omen, checksPaid, grantedCardId };
}

/** Today's already-drawn arcana, if any. */
export function arcanaDrawnToday(pub: Pick<PubState, "ledger">, date: Date): TarotArcana | null {
  return todaysOmen(pub, date)?.arcana ?? null;
}
