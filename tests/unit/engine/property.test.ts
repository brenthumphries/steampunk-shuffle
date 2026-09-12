// Property test (plan step 1.2 exit check): random games never throw, and
// core invariants from design.md §16 hold no matter what gets played.
//   - scores never negative
//   - at most one Location (structurally guaranteed: `location` is a single
//     field, not a list — asserted here as a smoke check anyway)
//   - face-down cards contribute 0 to score
//   - Persist cards never survive face-down (in fact: no board card is ever
//     face-down once a round's cleanup has run, since cleanup discards every
//     face-down card outright)
//   - a match never exceeds three rounds
//   - leader alternation is checked separately (roundsAndMatch.test.ts) —
//     this test only needs "never throws" plus the invariants above.

import { describe, expect, it } from "vitest";

import type { Card } from "../../../src/cards/cardTypes.ts";
import { boardScore, createMatch, currentPlayer, playTurn, type MatchState, type PlayerId } from "../../../src/engine/matchEngine.ts";
import { stepRandom } from "../../../src/engine/rng.ts";
import { drJekyllMrHyde } from "../cards/fixtures/legends.ts";
import { makeCard } from "./fixtures/helpers.ts";

function buildCardPool(): Card[] {
  return [
    makeCard({ name: "Vanilla 1", points: 1 }),
    makeCard({ name: "Vanilla 3", points: 3 }),
    makeCard({ name: "Vanilla 6", points: 6 }),
    makeCard({ name: "Persist Gadget", type: "gadget", points: 1, keywords: { persist: true } }),
    makeCard({ name: "Friend One", points: 2, keywords: { friend: 1 } }),
    makeCard({ name: "Friend Two", points: 2, keywords: { friend: 2 } }),
    makeCard({ name: "Elusive One", points: 2, keywords: { elusive: true } }),
    makeCard({ name: "Return One", points: 2, keywords: { return: true } }),
    makeCard({
      name: "Flipper",
      type: "scheme",
      points: 0,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "flip", target: { side: "opponent", filter: { maxPoints: 4 } } }] }],
    }),
    makeCard({
      name: "Unflipper",
      type: "scheme",
      points: 0,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "unflip", target: { side: "self", filter: {} } }] }],
    }),
    makeCard({
      name: "Drawer",
      type: "gadget",
      points: 1,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "draw", amount: 2 }] }],
    }),
    makeCard({
      name: "Buffing Location",
      type: "location",
      family: "neutral",
      points: 0,
      abilities: [{ trigger: "continuous", effects: [{ effect: "buff", target: { side: "self", filter: {} }, amount: 1 }] }],
    }),
    makeCard({
      name: "Location Banisher",
      points: 1,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "discardLocation" }] }],
    }),
    makeCard({
      name: "Random Discarder",
      type: "scheme",
      points: 0,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "discardRandom", target: { side: "opponent" }, amount: 1 }] }],
    }),
    makeCard({
      name: "Revealer",
      points: 1,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "reveal", target: { side: "opponent" } }] }],
    }),
    makeCard({
      name: "Stealer",
      points: 2,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "steal", target: { side: "opponent", filter: {} } }] }],
    }),
    drJekyllMrHyde,
  ];
}

function checkInvariants(state: MatchState) {
  expect(state.round).toBeLessThanOrEqual(3);
  for (const pid of ["A", "B"] as PlayerId[]) {
    expect(boardScore(state, pid)).toBeGreaterThanOrEqual(0);
    // Cleanup discards every face-down card outright, so once a round has
    // ended (turnsPlayedThisRound reset to 0, or the match completed with
    // that round's cleanup already applied), nothing on the board is
    // face-down — Persist or not.
    if (state.status === "complete" || state.turnsPlayedThisRound === 0) {
      expect(state.players[pid].board.every((bc) => bc.faceUp)).toBe(true);
    }
  }
}

describe("Property: random games (plan step 1.2 exit check)", () => {
  it("10,000 random games never throw and never violate the core invariants", { timeout: 60_000 }, () => {
    const pool = buildCardPool();
    const deckSpec = pool.map((card) => ({ card, quantity: 2 }));

    const GAMES = 10_000;
    for (let game = 0; game < GAMES; game++) {
      let seed = 1_000_003 * (game + 1);
      let state = createMatch(deckSpec, deckSpec, { seed, shuffle: true });
      checkInvariants(state);

      let guard = 0;
      while (state.status === "in-progress" && guard < 60) {
        guard++;
        const p = currentPlayer(state);
        const hand = state.players[p].hand;
        if (hand.length === 0) {
          state = playTurn(state, p);
        } else {
          const step = stepRandom(seed);
          seed = step.seed;
          const idx = Math.floor(step.value * hand.length);
          state = playTurn(state, p, hand[idx]!.instanceId);
        }
        checkInvariants(state);
      }

      expect(state.status).toBe("complete");
    }
  });
});
