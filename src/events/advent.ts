// The Advent Cabinet (docs/plans/monthly/02-december.md §5, design.md §17.3):
// a generic event feature. An event may carry `advent`: a row of numbered
// doors that open one a day from `opensFrom` and stay claimable until
// `lastClaim`, which may fall in the next calendar year (Jan 6 after a
// December window). Pure functions over PubState; callers pass `today()`.

import { isOwned } from "../decks/ownership.ts";
import { foilId } from "../pub/tinkersBench.ts";
import { addCopyToCollection, grantChecks, type PubState } from "../pub/pubState.ts";
import { recordChecksEarned } from "../save/ledger.ts";
import type { MonthDay } from "./eventClock.ts";
import { ADVENT_TOKEN_KINDS, type AdventToken } from "./adventState.ts";
import { SEASONAL_EVENTS, type SeasonalEvent } from "./seasonalEvents.ts";

export type { AdventToken };

export interface AdventReward {
  checks?: number;
  cardId?: string;
  token?: AdventToken;
  /** A foil of this card; if the player doesn't own the card, they get the card as well. */
  foilOf?: string;
}

export interface AdventDoor {
  /** 1-based: door N opens N-1 days after `opensFrom`. */
  day: number;
  reward: AdventReward;
  /** A beer mat shown when the door is opened. */
  line?: string;
}

export interface AdventConfig {
  opensFrom: MonthDay;
  /** Last day (inclusive) a door can be opened. Earlier in the year than `opensFrom` means the next calendar year. */
  lastClaim: MonthDay;
  doors: AdventDoor[];
}

const MS_PER_DAY = 86_400_000;

function dayNumber(year: number, md: MonthDay): number {
  return Math.floor(Date.UTC(year, md.month - 1, md.day) / MS_PER_DAY);
}

function dayNumberOf(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY);
}

function ordinal(md: MonthDay): number {
  return md.month * 100 + md.day;
}

/** Whether `lastClaim` falls in the calendar year after `opensFrom`'s. */
export function adventWraps(advent: AdventConfig): boolean {
  return ordinal(advent.lastClaim) < ordinal(advent.opensFrom);
}

function rangeFor(advent: AdventConfig, year: number): { startN: number; endN: number } {
  return { startN: dayNumber(year, advent.opensFrom), endN: dayNumber(adventWraps(advent) ? year + 1 : year, advent.lastClaim) };
}

export interface LiveAdvent {
  event: SeasonalEvent;
  advent: AdventConfig;
  /** The calendar year the occurrence opened in. A claim on Jan 3 2027 belongs to 2026. */
  year: number;
}

/** The event whose cabinet is visible on `date` (between `opensFrom` and `lastClaim`, wrapping New Year), if any. */
export function liveAdvent(date: Date, events: readonly SeasonalEvent[] = SEASONAL_EVENTS): LiveAdvent | null {
  const todayN = dayNumberOf(date);
  for (const event of events) {
    const advent = event.advent;
    if (!advent) continue;
    for (const year of [date.getFullYear(), date.getFullYear() - 1]) {
      const { startN, endN } = rangeFor(advent, year);
      if (todayN >= startN && todayN <= endN) return { event, advent, year };
    }
  }
  return null;
}

/** True once door `day` has reached its opening day in the occurrence (it may be claimed from then until `lastClaim`). */
export function isDoorUnlocked(live: LiveAdvent, day: number, date: Date): boolean {
  return dayNumberOf(date) >= rangeFor(live.advent, live.year).startN + day - 1;
}

export function claimedDoors(pub: Pick<PubState, "advent">, eventId: string, year: number): readonly number[] {
  return pub.advent.claims[eventId]?.[String(year)] ?? [];
}

export type DoorStatus = "shut" | "openable" | "opened";

export function doorStatus(pub: Pick<PubState, "advent">, live: LiveAdvent, door: AdventDoor, date: Date): DoorStatus {
  if (claimedDoors(pub, live.event.id, live.year).includes(door.day)) return "opened";
  return isDoorUnlocked(live, door.day, date) ? "openable" : "shut";
}

/** How many doors the player could open right now. */
export function openableCount(pub: Pick<PubState, "advent">, live: LiveAdvent, date: Date): number {
  return live.advent.doors.filter((d) => doorStatus(pub, live, d, date) === "openable").length;
}

export interface DoorClaim {
  next: PubState;
  door: AdventDoor;
  /** Card ids added to the collection by this door (for the unwrap), foil entries as `foil:<id>`. */
  cardIds: string[];
}

/** Opens door `day`. Null when it is shut, already open, unknown, or the cabinet is not live: a door is never granted twice. */
export function claimDoor(pub: PubState, date: Date, day: number, events: readonly SeasonalEvent[] = SEASONAL_EVENTS): DoorClaim | null {
  const live = liveAdvent(date, events);
  const door = live?.advent.doors.find((d) => d.day === day);
  if (!live || !door || doorStatus(pub, live, door, date) !== "openable") return null;

  let next = pub;
  const cardIds: string[] = [];
  const { checks, cardId, token, foilOf } = door.reward;
  if (checks) next = { ...grantChecks(next, checks), ledger: recordChecksEarned(next.ledger, checks) };
  if (cardId) {
    next = addCopyToCollection(next, cardId);
    cardIds.push(cardId);
  }
  if (foilOf) {
    if (!isOwned(foilOf, next.collection)) {
      next = addCopyToCollection(next, foilOf);
      cardIds.push(foilOf);
    }
    next = addCopyToCollection(next, foilId(foilOf));
    cardIds.push(foilId(foilOf));
  }
  if (token) next = { ...next, advent: { ...next.advent, tokens: { ...next.advent.tokens, [token]: next.advent.tokens[token] + 1 } } };

  const byYear = { ...(next.advent.claims[live.event.id] ?? {}) };
  byYear[String(live.year)] = [...(byYear[String(live.year)] ?? []), day];
  next = { ...next, advent: { ...next.advent, claims: { ...next.advent.claims, [live.event.id]: byYear } } };
  return { next, door, cardIds };
}

export function tokenCount(pub: Pick<PubState, "advent">, kind: AdventToken): number {
  return pub.advent.tokens[kind];
}

/** Spends one token of `kind`. A no-op (same object) when none is held. */
export function spendToken(pub: PubState, kind: AdventToken): PubState {
  if (pub.advent.tokens[kind] <= 0) return pub;
  return { ...pub, advent: { ...pub.advent, tokens: { ...pub.advent.tokens, [kind]: pub.advent.tokens[kind] - 1 } } };
}

export const TOKEN_LABEL: Record<AdventToken, string> = {
  lostAndFoundUncommon: "A Lost & Found token: your next pull is uncommon or better",
  tinkerFree: "A Tinker's Bench token: one free fusing",
};

export { ADVENT_TOKEN_KINDS };
