// The Advent Cabinet's slice of the save (docs/plans/monthly/02-december.md §5,
// design.md §17.3). It lives inside PubState, which is one localStorage key,
// because the privacy test whitelists keys. A leaf module so pubState.ts can
// import it without a cycle (same shape as src/booth/boothState.ts).

/** A door's token reward: held until used, then spent exactly once. */
export type AdventToken = "lostAndFoundUncommon" | "tinkerFree";

export const ADVENT_TOKEN_KINDS: readonly AdventToken[] = ["lostAndFoundUncommon", "tinkerFree"];

export interface AdventState {
  /** Doors opened: event id -> calendar year the occurrence opened in -> door days. Never granted twice. */
  claims: Record<string, Record<string, number[]>>;
  /** Tokens held, by kind. */
  tokens: Record<AdventToken, number>;
}

export function defaultAdventState(): AdventState {
  return { claims: {}, tokens: { lostAndFoundUncommon: 0, tinkerFree: 0 } };
}

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

export function parseAdventState(raw: unknown): AdventState {
  const out = defaultAdventState();
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return out;
  const r = raw as Record<string, unknown>;
  if (typeof r.claims === "object" && r.claims !== null && !Array.isArray(r.claims)) {
    for (const [eventId, years] of Object.entries(r.claims)) {
      if (typeof years !== "object" || years === null || Array.isArray(years)) continue;
      const byYear: Record<string, number[]> = {};
      for (const [year, days] of Object.entries(years)) {
        if (Array.isArray(days) && days.every(isCount)) byYear[year] = days;
      }
      out.claims[eventId] = byYear;
    }
  }
  if (typeof r.tokens === "object" && r.tokens !== null) {
    const t = r.tokens as Record<string, unknown>;
    for (const kind of ADVENT_TOKEN_KINDS) {
      const n = t[kind];
      if (isCount(n)) out.tokens[kind] = n;
    }
  }
  return out;
}
