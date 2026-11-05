// Hosts, arrival gifts and banners (docs/plans/monthly/00-monthly-content-plan.md
// §4.1, design.md §17.1). Pure functions over PubState: main.ts decides when to
// call them (a launch, a hub visit) and saves the result. Every function takes
// the `events` registry as an optional last argument so tests can pass a
// test-only pack; production callers leave it at SEASONAL_EVENTS.
//
// Dates come from the `date` the caller passes (always `today()`), never from
// `new Date()`.

import { forEdition } from "../edition.ts";
import { addCopyToCollection, type PubState } from "../pub/pubState.ts";
import type { MonthDay } from "./eventClock.ts";
import { SEASONAL_EVENTS, type ArrivalGift, type SeasonalEvent } from "./seasonalEvents.ts";

/** A gift left unclaimed when its window closed is still handed over on a launch within this many days (the kindness rule, plan §2.6). */
export const GIFT_GRACE_DAYS = 7;

function dayNumber(year: number, md: MonthDay): number {
  return Math.floor(Date.UTC(year, md.month - 1, md.day) / 86_400_000);
}

function dayNumberOf(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

// ---------------------------------------------------------------------------
// Hosts
// ---------------------------------------------------------------------------

/** Whether the player has met host `id`. Hosts are permanent: this never reverts. */
export function hostMet(pub: Pick<PubState, "hostsMet">, id: string): boolean {
  return pub.hostsMet.includes(id);
}

/**
 * Whether a launch on `date` counts as meeting a host who arrives on
 * `host.arrives` in `event`: some year Y, from the year of the first launch
 * on, has reached the arrival date (`date` is on or after it) in an
 * occurrence of the event that was still running, or yet to run, on the
 * first launch day. So a player who starts mid-window after the host has
 * arrived meets her at once; one who starts after the window closed meets
 * her on next year's arrival date; and a host is never "unmet" afterwards
 * (`updateHostsMet` persists the result).
 */
export function hostArrivalReached(firstLaunch: string | null, event: SeasonalEvent, arrives: MonthDay, date: Date): boolean {
  const year = date.getFullYear();
  const todayN = dayNumberOf(date);
  const parsed = firstLaunch === null ? NaN : Date.UTC(Number(firstLaunch.slice(0, 4)), Number(firstLaunch.slice(5, 7)) - 1, Number(firstLaunch.slice(8, 10))) / 86_400_000;
  const firstN = Number.isFinite(parsed) ? Math.floor(parsed) : todayN;
  for (let y = new Date(firstN * 86_400_000).getUTCFullYear(); y <= year; y++) {
    if (dayNumber(y, arrives) <= todayN && firstN <= dayNumber(y, event.window.end)) return true;
  }
  return false;
}

/** Adds every host whose arrival the player has now reached to `hostsMet`. Returns the same object when nothing is new. */
export function updateHostsMet(pub: PubState, date: Date, events: readonly SeasonalEvent[] = SEASONAL_EVENTS): PubState {
  const met = new Set(pub.hostsMet);
  for (const event of events) {
    for (const host of event.hosts ?? []) {
      if (!met.has(host.id) && hostArrivalReached(pub.ledger.firstLaunch, event, host.arrives, date)) met.add(host.id);
    }
  }
  return met.size === pub.hostsMet.length ? pub : { ...pub, hostsMet: [...met] };
}

/** Every host id any registered event defines. Hosts are not Opponents, so none of these may be an opponent id. */
export function allHostIds(events: readonly SeasonalEvent[] = SEASONAL_EVENTS): string[] {
  return events.flatMap((e) => (e.hosts ?? []).map((h) => h.id));
}

// ---------------------------------------------------------------------------
// Arrival gifts
// ---------------------------------------------------------------------------

export interface DueGift {
  eventId: string;
  /** The calendar year of the event occurrence this gift belongs to (a late claim in January still belongs to December's year). */
  year: number;
  key: string;
  gift: ArrivalGift;
  /** Claimed in the grace period after the window closed. */
  late: boolean;
}

/** The beer-mat line for a due gift: a late claim uses `lateLine`, a later year's on-time claim `repeatLine`, else `line` (PT-47, PT-50). */
export function giftLine(due: Pick<DueGift, "gift" | "year" | "late">): string {
  const { gift } = due;
  if (due.late) return gift.lateLine ?? gift.line;
  if (gift.repeatLine !== undefined && gift.repeatFromYear !== undefined && due.year >= gift.repeatFromYear) return gift.repeatLine;
  return gift.line;
}

function giftKey(gift: ArrivalGift, index: number): string {
  return gift.id ?? String(index);
}

function claimedKeys(pub: Pick<PubState, "giftsClaimed">, eventId: string, year: number): readonly string[] {
  return pub.giftsClaimed[eventId]?.[String(year)] ?? [];
}

/**
 * Gifts the player should be handed on a launch on `date`: per event
 * occurrence (this year's, or last year's within the grace period), each gift
 * not yet claimed, once its day has come (`max(window start, gift.from)`),
 * and only in years >= `fromYear`. Live occurrences grant from that day on;
 * a closed occurrence grants for `GIFT_GRACE_DAYS` after its last day.
 */
export function dueGifts(pub: Pick<PubState, "giftsClaimed">, date: Date, events: readonly SeasonalEvent[] = SEASONAL_EVENTS): DueGift[] {
  const due: DueGift[] = [];
  const todayN = dayNumberOf(date);
  const thisYear = date.getFullYear();
  for (const event of events) {
    const gifts = forEdition(event.arrivalGifts ?? []);
    if (gifts.length === 0) continue;
    for (const year of [thisYear, thisYear - 1]) {
      const startN = dayNumber(year, event.window.start);
      const endN = dayNumber(year, event.window.end);
      const live = todayN >= startN && todayN <= endN;
      const inGrace = todayN > endN && todayN <= endN + GIFT_GRACE_DAYS;
      if (!live && !inGrace) continue;
      const claimed = claimedKeys(pub, event.id, year);
      (event.arrivalGifts ?? []).forEach((gift, index) => {
        if (!gifts.includes(gift)) return;
        const key = giftKey(gift, index);
        if (claimed.includes(key)) return;
        if (gift.fromYear !== undefined && year < gift.fromYear) return;
        if (live) {
          const giftDayN = Math.max(startN, gift.from ? dayNumber(year, gift.from) : startN);
          if (todayN < giftDayN) return;
        }
        due.push({ eventId: event.id, year, key, gift, late: inGrace });
      });
    }
  }
  return due;
}

export interface GrantResult {
  next: PubState;
  granted: DueGift[];
}

/** Hands over every due gift: copies into the collection, and the key recorded so it can never be granted again. */
export function grantArrivalGifts(pub: PubState, date: Date, events: readonly SeasonalEvent[] = SEASONAL_EVENTS): GrantResult {
  const granted = dueGifts(pub, date, events);
  if (granted.length === 0) return { next: pub, granted };
  let next = pub;
  const claims: Record<string, Record<string, string[]>> = { ...pub.giftsClaimed };
  for (const g of granted) {
    for (const card of g.gift.cardIds) {
      for (let i = 0; i < card.qty; i++) next = addCopyToCollection(next, card.id);
    }
    const byYear = { ...(claims[g.eventId] ?? {}) };
    byYear[String(g.year)] = [...(byYear[String(g.year)] ?? []), g.key];
    claims[g.eventId] = byYear;
  }
  return { next: { ...next, giftsClaimed: claims }, granted };
}

// ---------------------------------------------------------------------------
// Banner
// ---------------------------------------------------------------------------

export interface DueBanner {
  eventId: string;
  year: number;
  text: string;
}

/** The "new this month" banner for a live event the player hasn't been shown this year, if any. */
export function dueBanner(pub: Pick<PubState, "bannersSeen">, date: Date, events: readonly SeasonalEvent[] = SEASONAL_EVENTS): DueBanner | null {
  const year = date.getFullYear();
  for (const event of events) {
    if (!event.banner || !liveIn(event, date)) continue;
    if ((pub.bannersSeen[event.id] ?? []).includes(year)) continue;
    return { eventId: event.id, year, text: event.banner };
  }
  return null;
}

function liveIn(event: SeasonalEvent, date: Date): boolean {
  const n = dayNumberOf(date);
  const year = date.getFullYear();
  return n >= dayNumber(year, event.window.start) && n <= dayNumber(year, event.window.end);
}

export function markBannerSeen(pub: PubState, eventId: string, year: number): PubState {
  const seen = pub.bannersSeen[eventId] ?? [];
  return seen.includes(year) ? pub : { ...pub, bannersSeen: { ...pub.bannersSeen, [eventId]: [...seen, year] } };
}
