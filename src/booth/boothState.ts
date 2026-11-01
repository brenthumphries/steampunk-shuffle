// The Booth's own small slice of the save (it lives inside PubState, which is
// one localStorage key, because the privacy test whitelists keys). Kept as a
// leaf module so pubState.ts can import it without a cycle.

/** The one-shot omen effects whose "once today" flag is tracked here. */
export type OneShotOmenKind = "firstWinBonus" | "lostAndFoundExtra" | "tinkerFree" | "openingHandPlusOne" | "barBetInsurance";

export interface BoothState {
  /** Per-save salt mixed into the daily draw's seed. Null until the first reading. */
  salt: number | null;
  /** Local-date key the `used` list belongs to; a different day resets it. */
  usedDate: string | null;
  /** One-shot omen effects already applied on `usedDate`. */
  used: OneShotOmenKind[];
}

export function defaultBoothState(): BoothState {
  return { salt: null, usedDate: null, used: [] };
}

const ONE_SHOT_KINDS: readonly string[] = ["firstWinBonus", "lostAndFoundExtra", "tinkerFree", "openingHandPlusOne", "barBetInsurance"];

export function parseBoothState(raw: unknown): BoothState {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return defaultBoothState();
  const r = raw as Record<string, unknown>;
  return {
    salt: typeof r.salt === "number" && Number.isFinite(r.salt) ? r.salt : null,
    usedDate: typeof r.usedDate === "string" ? r.usedDate : null,
    used: Array.isArray(r.used) ? (r.used.filter((k) => typeof k === "string" && ONE_SHOT_KINDS.includes(k)) as OneShotOmenKind[]) : [],
  };
}
