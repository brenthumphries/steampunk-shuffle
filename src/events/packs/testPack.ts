// A test-only content pack (docs/plans/monthly/00-monthly-content-plan.md
// §4.1, N-A): a tiny event that exercises every framework seam — a host, an
// arrival gift, a year-gated pool entry, a banner — so the unit tests and
// the Playwright smoke test have something to run without authoring any
// real month. It is not in `PACKS`; it joins the registry only on
// `?testpack=1` (see seasonalEvents.ts). Jan 10-12 overlaps no real pack.

import type { SeasonalEvent } from "../seasonalEvents.ts";

export const TEST_PACK: SeasonalEvent = {
  id: "test-pack",
  name: "Test Pack",
  window: { start: { month: 1, day: 10 }, end: { month: 1, day: 12 } },
  visitors: [],
  tournaments: [],
  cardPool: ["test-card-a", { id: "test-card-b", fromYear: 2027 }],
  minWins: 0,
  dressing: {
    lockedHint: "Test pack hint.",
    sirCharlesLines: ["Test pack Sir Charles line.", { text: "Test pack gift-only line.", giftOnly: true }],
    lineOverrides: [],
  },
  hosts: [{ id: "test-host", arrives: { month: 1, day: 11 } }],
  arrivalGifts: [
    { id: "welcome", cardIds: [{ id: "test-card-a", qty: 2 }], line: "Someone left this on the step.", from: { month: 1, day: 11 } },
    { id: "later", cardIds: [{ id: "test-card-b", qty: 1 }], line: "A card from the future.", fromYear: 2027 },
  ],
  banner: "Test pack banner: new this month.",
};

/** True when the URL asks for the test pack and the dev-clock gate (`allowed`) is open. */
export function testPackRequested(search: string, allowed: boolean): boolean {
  return allowed && new URLSearchParams(search).get("testpack") === "1";
}
