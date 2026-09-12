// Bar Bet (plan step 2.5, design.md §11.5).

import { describe, expect, it } from "vitest";

import { BAR_BET_UNLOCK_WINS, canOfferBarBet, pickBetPoolCard, resolveBarBet, stakeableCards } from "../../../src/pub/barBet.ts";
import { OPPONENTS_BY_ID } from "../../../src/pub/opponents.ts";
import { defaultPubState, type PubState } from "../../../src/pub/pubState.ts";

const MUDD = OPPONENTS_BY_ID.get("mudd")!;
const SIR_CHARLES = OPPONENTS_BY_ID.get("sir-charles")!;

describe("canOfferBarBet", () => {
  it("is unavailable below the unlock threshold", () => {
    expect(canOfferBarBet(MUDD, BAR_BET_UNLOCK_WINS - 1)).toBe(false);
  });

  it("is available at the unlock threshold for a real opponent", () => {
    expect(canOfferBarBet(MUDD, BAR_BET_UNLOCK_WINS)).toBe(true);
  });

  it("is never available for the house (Sir Charles)", () => {
    expect(canOfferBarBet(SIR_CHARLES, 999)).toBe(false);
  });
});

describe("stakeableCards", () => {
  it("dedupes multiple copies of the same card into one offer", () => {
    expect(stakeableCards(["charlotte", "charlotte", "banshee"])).toEqual(["charlotte", "banshee"]);
  });

  it("is empty with an empty collection", () => {
    expect(stakeableCards([])).toEqual([]);
  });
});

describe("pickBetPoolCard", () => {
  it("always returns one of the pool's own cards", () => {
    for (let seed = 0; seed < 20; seed++) {
      expect(MUDD.betPool).toContain(pickBetPoolCard(MUDD.betPool, seed));
    }
  });
});

describe("resolveBarBet", () => {
  it("on a win, adds a card from the opponent's bet pool and leaves the stake untouched", () => {
    const state: PubState = { ...defaultPubState(), collection: ["charlotte"] };
    const { next, wonCardId } = resolveBarBet(state, "charlotte", MUDD, "win", 0);
    expect(wonCardId).not.toBeNull();
    expect(MUDD.betPool).toContain(wonCardId);
    expect(next.collection).toContain("charlotte");
    expect(next.collection).toContain(wonCardId);
  });

  it("on a loss, moves the staked card from the collection to pawnedCards", () => {
    const state: PubState = { ...defaultPubState(), collection: ["charlotte", "banshee"] };
    const { next, wonCardId } = resolveBarBet(state, "charlotte", MUDD, "loss", 0);
    expect(wonCardId).toBeNull();
    expect(next.collection).toEqual(["banshee"]);
    expect(next.pawnedCards).toEqual(["charlotte"]);
  });

  it("on a draw, changes nothing", () => {
    const state: PubState = { ...defaultPubState(), collection: ["charlotte"] };
    const { next, wonCardId } = resolveBarBet(state, "charlotte", MUDD, "draw", 0);
    expect(wonCardId).toBeNull();
    expect(next).toBe(state);
  });
});
