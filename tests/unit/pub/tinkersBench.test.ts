// The Tinker's Bench (plan step 2.5, design.md §11.6).

import { describe, expect, it } from "vitest";

import { canFuse, foilId, fuse, fuseChoicesFor, TINKER_FEE_CHECKS } from "../../../src/pub/tinkersBench.ts";
import { defaultPubState, type PubState } from "../../../src/pub/pubState.ts";

describe("canFuse", () => {
  it("requires two copies in the collection", () => {
    expect(canFuse(["charlotte"], "charlotte")).toBe(false);
    expect(canFuse(["charlotte", "charlotte"], "charlotte")).toBe(true);
  });

  it("refuses a legendary even with two copies", () => {
    expect(canFuse(["sherlock-holmes", "sherlock-holmes"], "sherlock-holmes")).toBe(false);
  });

  it("refuses an unknown card id", () => {
    expect(canFuse(["not-a-card", "not-a-card"], "not-a-card")).toBe(false);
  });
});

describe("fuseChoicesFor", () => {
  it("offers foil and upgrade for a common", () => {
    expect(fuseChoicesFor("charlotte")).toEqual(["foil", "upgrade"]);
  });

  it("offers only foil for a rare — rares can only become foils", () => {
    expect(fuseChoicesFor("hiawatha")).toEqual(["foil"]);
  });
});

describe("fuse", () => {
  it("consumes two copies and the fee, and adds a foil entry", () => {
    const state: PubState = { ...defaultPubState(), checks: 20, collection: ["charlotte", "charlotte"] };
    const { next, resultCardId } = fuse(state, "charlotte", "foil", 0);
    expect(resultCardId).toBe(foilId("charlotte"));
    expect(next.checks).toBe(20 - TINKER_FEE_CHECKS);
    expect(next.collection).toEqual([resultCardId]);
  });

  it("upgrading a common yields a random uncommon", () => {
    const state: PubState = { ...defaultPubState(), checks: 20, collection: ["charlotte", "charlotte"] };
    const { resultCardId } = fuse(state, "charlotte", "upgrade", 0);
    expect(resultCardId).not.toBe(foilId("charlotte"));
  });

  it("leaves any extra copies beyond the two consumed untouched", () => {
    const state: PubState = { ...defaultPubState(), checks: 20, collection: ["charlotte", "charlotte", "charlotte"] };
    const { next } = fuse(state, "charlotte", "foil", 0);
    expect(next.collection.filter((id) => id === "charlotte")).toHaveLength(1);
  });
});
