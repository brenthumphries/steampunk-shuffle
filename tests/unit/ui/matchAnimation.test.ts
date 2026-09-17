import { describe, expect, it } from "vitest";
import {
  buffDelta,
  buildStaggerPlan,
  computeSequenceDurationMs,
  discardedFromHand,
  DISCARD_BEAT_MS,
  DISCARD_STAGGER_STEP_MS,
  MAX_SEQUENCE_MS,
  ONPLAY_BEAT_MS,
  planDiscardFlights,
  REDUCED_MOTION_MS,
  RESOLVE_STAGGER_STEP_MS,
} from "../../../src/ui/matchAnimation.ts";

describe("buildStaggerPlan", () => {
  it("assigns increasing delays in list order", () => {
    const plan = buildStaggerPlan(["a", "b", "c"]);
    expect(plan.grouped).toBe(false);
    expect(plan.delayMs("a")).toBe(0);
    expect(plan.delayMs("b")).toBe(RESOLVE_STAGGER_STEP_MS);
    expect(plan.delayMs("c")).toBe(RESOLVE_STAGGER_STEP_MS * 2);
  });

  it("returns 0 for an id not in the plan", () => {
    const plan = buildStaggerPlan(["a"]);
    expect(plan.delayMs("z")).toBe(0);
  });

  it("switches to a grouped animation past the stagger threshold (plan: 'more than ~6 cards')", () => {
    const plan = buildStaggerPlan(["a", "b", "c", "d", "e", "f", "g"]);
    expect(plan.grouped).toBe(true);
    expect(plan.delayMs("a")).toBe(0);
    expect(plan.delayMs("g")).toBe(0);
  });

  it("stays per-card (not grouped) at exactly the threshold", () => {
    const plan = buildStaggerPlan(["a", "b", "c", "d", "e", "f"]);
    expect(plan.grouped).toBe(false);
  });

  it("uses a custom step (discard's own stagger cadence)", () => {
    const plan = buildStaggerPlan(["a", "b"], DISCARD_STAGGER_STEP_MS);
    expect(plan.delayMs("b")).toBe(DISCARD_STAGGER_STEP_MS);
  });
});

describe("discardedFromHand", () => {
  it("returns only ids that were in the hand and are now in the discard pile", () => {
    const prevHand = new Set(["x", "y", "z"]);
    expect(discardedFromHand(prevHand, ["y", "w"])).toEqual(["y"]);
  });

  it("excludes a round-end board sweep discard — never in the pre-commit hand, so it never appears here", () => {
    const prevHand = new Set(["hand-card"]);
    expect(discardedFromHand(prevHand, ["board-swept-card"])).toEqual([]);
  });

  it("returns nothing when nothing left the hand", () => {
    expect(discardedFromHand(new Set(["a"]), [])).toEqual([]);
  });
});

describe("buffDelta", () => {
  it("computes the signed change for a card present before and after", () => {
    expect(buffDelta(0, 2)).toBe(2);
    expect(buffDelta(3, 1)).toBe(-2);
    expect(buffDelta(1, 1)).toBe(0);
  });

  it("is 0 for a card with no prior snapshot (just entered play, not a buff on an existing card)", () => {
    expect(buffDelta(undefined, 5)).toBe(0);
  });
});

describe("planDiscardFlights", () => {
  it("staggers same-commit discards ~100ms apart, in order", () => {
    const flights = planDiscardFlights("A", ["x", "y", "z"]);
    expect(flights).toEqual([
      { owner: "A", instanceId: "x", delayMs: 0 },
      { owner: "A", instanceId: "y", delayMs: DISCARD_STAGGER_STEP_MS },
      { owner: "A", instanceId: "z", delayMs: DISCARD_STAGGER_STEP_MS * 2 },
    ]);
  });

  it("caps the stagger tail at the group threshold rather than growing unbounded", () => {
    const ids = Array.from({ length: 10 }, (_, i) => `c${i}`);
    const flights = planDiscardFlights("B", ids);
    const delays = flights.map((f) => f.delayMs);
    expect(new Set(delays.slice(5))).toEqual(new Set([delays[5]])); // every flight past the cap shares the same delay
    expect(Math.max(...delays)).toBeLessThan(DISCARD_STAGGER_STEP_MS * 6);
  });
});

describe("computeSequenceDurationMs", () => {
  it("holds for nothing when there's no on-play ability and no discard", () => {
    expect(computeSequenceDurationMs({ hasOnPlayAbilityCard: false, affectedTargetCount: 0, discardFromHandCount: 0 }, false)).toBe(0);
  });

  it("returns the base on-play beat with no targets", () => {
    const ms = computeSequenceDurationMs({ hasOnPlayAbilityCard: true, affectedTargetCount: 0, discardFromHandCount: 0 }, false);
    expect(ms).toBe(ONPLAY_BEAT_MS);
  });

  it("adds a stagger tail for multiple targets", () => {
    const ms = computeSequenceDurationMs({ hasOnPlayAbilityCard: true, affectedTargetCount: 3, discardFromHandCount: 0 }, false);
    expect(ms).toBe(ONPLAY_BEAT_MS + 2 * RESOLVE_STAGGER_STEP_MS);
  });

  it("uses a flat, shorter grouped-animation tail once targets exceed the stagger threshold — one simultaneous flash beats waiting through a full sequential stagger", () => {
    const six = computeSequenceDurationMs({ hasOnPlayAbilityCard: true, affectedTargetCount: 6, discardFromHandCount: 0 }, false);
    const seven = computeSequenceDurationMs({ hasOnPlayAbilityCard: true, affectedTargetCount: 7, discardFromHandCount: 0 }, false);
    expect(six).toBe(ONPLAY_BEAT_MS + 5 * RESOLVE_STAGGER_STEP_MS);
    expect(seven).toBe(ONPLAY_BEAT_MS + 400);
    expect(seven).toBeLessThan(six);
  });

  it("takes the discard beat into account too, whichever is longer", () => {
    const ms = computeSequenceDurationMs({ hasOnPlayAbilityCard: false, affectedTargetCount: 0, discardFromHandCount: 3 }, false);
    expect(ms).toBe(DISCARD_BEAT_MS + 2 * DISCARD_STAGGER_STEP_MS);
  });

  it("never exceeds the hard 2.5s cap regardless of target count", () => {
    const ms = computeSequenceDurationMs({ hasOnPlayAbilityCard: true, affectedTargetCount: 40, discardFromHandCount: 40 }, false);
    expect(ms).toBeLessThanOrEqual(MAX_SEQUENCE_MS);
  });

  it("collapses to the fixed reduced-motion hold, not 0 and not the full budget", () => {
    const ms = computeSequenceDurationMs({ hasOnPlayAbilityCard: true, affectedTargetCount: 6, discardFromHandCount: 3 }, true);
    expect(ms).toBe(REDUCED_MOTION_MS);
    expect(ms).toBeLessThan(ONPLAY_BEAT_MS);
    expect(ms).toBeGreaterThan(0);
  });

  it("reduced motion still holds for nothing when there's genuinely nothing to show", () => {
    expect(computeSequenceDurationMs({ hasOnPlayAbilityCard: false, affectedTargetCount: 0, discardFromHandCount: 0 }, true)).toBe(0);
  });
});
