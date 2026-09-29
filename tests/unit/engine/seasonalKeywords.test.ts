// Undying and Moonrise (design.md §5.14-§5.15, seasonal-events-plan.md §3.1).

import { describe, expect, it } from "vitest";

import { validateCard } from "../../../src/cards/cardValidator.ts";
import { clockworkPharaoh } from "../../../src/cards/data/halloween.ts";
import {
  createMatch,
  currentPlayer,
  effectivePoints,
  isFinalRound,
  playTurn,
  type MatchState,
  type PlayerId,
} from "../../../src/engine/matchEngine.ts";
import { instanceId, makeCard, makeQueuePlayer, orderedDeck } from "./fixtures/helpers.ts";

const flipper = () =>
  makeCard({
    name: "Flipper",
    type: "scheme",
    points: 0,
    abilities: [{ trigger: "onPlay", effects: [{ effect: "flip", target: { side: "opponent", filter: { maxPoints: 4 } } }] }],
  });

const vanilla = (name: string, points = 1) => makeCard({ name, points });

/** Plays turns for both sides, in each side's own queue order, until `round` changes or the match ends. */
function playThroughRound(state: MatchState, round: number, playA: (s: MatchState, p: PlayerId) => MatchState, playB: (s: MatchState, p: PlayerId) => MatchState): MatchState {
  let next = state;
  while (next.round === round && next.status === "in-progress") {
    next = currentPlayer(next) === "A" ? playA(next, "A") : playB(next, "B");
  }
  return next;
}

/** Round 1 where A plays [first, ...fillers] and B plays [bFirst, ...fillers]; A leads. */
function roundOneWith(aFirst: ReturnType<typeof makeCard>, bFirst: ReturnType<typeof makeCard>) {
  const aFillers = [vanilla("a1"), vanilla("a2")];
  const bFillers = [vanilla("b1"), vanilla("b2")];
  const deckA = [aFirst, ...aFillers];
  const deckB = [bFirst, ...bFillers];
  const state = createMatch(orderedDeck(deckA), orderedDeck(deckB), { seed: 1, shuffle: false, leader: "A" });
  return playThroughRound(state, 1, makeQueuePlayer(deckA), makeQueuePlayer(deckB));
}

describe("Undying (design.md §5.14)", () => {
  it("sends a face-down Undying card to its owner's hand at end of round instead of the discard", () => {
    const undying = makeCard({ name: "Undying", points: 2, keywords: { undying: true } });
    const state = roundOneWith(undying, flipper());
    expect(state.players.A.hand.map((c) => c.card.id)).toContain(undying.id);
    expect(state.players.A.discard.map((c) => c.card.id)).not.toContain(undying.id);
    expect(state.players.A.board).toHaveLength(0);
  });

  it("does nothing while face-up: a face-up Undying card is discarded like any other", () => {
    const undying = makeCard({ name: "Undying", points: 2, keywords: { undying: true } });
    const state = roundOneWith(undying, vanilla("plain B"));
    expect(state.players.A.hand.map((c) => c.card.id)).not.toContain(undying.id);
    expect(state.players.A.discard.map((c) => c.card.id)).toContain(undying.id);
  });

  it("leaves a face-down card without Undying in the discard, as before", () => {
    const plain = makeCard({ name: "Plain", points: 2 });
    const state = roundOneWith(plain, flipper());
    expect(state.players.A.hand.map((c) => c.card.id)).not.toContain(plain.id);
    expect(state.players.A.discard.map((c) => c.card.id)).toContain(plain.id);
  });

  it("reaches the hand either way for Undying + Return: Return while face-up, Undying while face-down", () => {
    const both = makeCard({ name: "Both", points: 2, keywords: { undying: true, return: true } });
    const faceUp = roundOneWith(both, vanilla("plain B"));
    expect(faceUp.players.A.hand.map((c) => c.card.id)).toContain(both.id);
    const faceDown = roundOneWith(both, flipper());
    expect(faceDown.players.A.hand.map((c) => c.card.id)).toContain(both.id);
    expect(faceDown.players.A.discard.map((c) => c.card.id)).not.toContain(both.id);
  });

  it("stays on the table for Undying + Persist while face-up, and goes to hand instead once Flipped", () => {
    const both = makeCard({ name: "Both", points: 2, keywords: { undying: true, persist: true } });
    const faceUp = roundOneWith(both, vanilla("plain B"));
    expect(faceUp.players.A.board.map((b) => b.card.id)).toEqual([both.id]);
    const faceDown = roundOneWith(both, flipper());
    expect(faceDown.players.A.board).toHaveLength(0);
    expect(faceDown.players.A.hand.map((c) => c.card.id)).toContain(both.id);
  });

  it("brings the card back when the opponent's own end-of-round Flip lands on it (The Clockwork Pharaoh's curse)", () => {
    const undying = makeCard({ name: "Undying", points: 2, keywords: { undying: true } });
    const state = roundOneWith(undying, clockworkPharaoh);
    // The Pharaoh flips A's highest-point card as the round ends; a plain card
    // would be discarded, Undying comes home.
    expect(state.players.A.hand.map((c) => c.card.id)).toContain(undying.id);
    expect(state.players.B.board.map((b) => b.card.id)).toEqual([clockworkPharaoh.id]); // and he persists
  });

  it("lets the returned card be played again the next round", () => {
    const undying = makeCard({ name: "Undying", points: 2, keywords: { undying: true } });
    let state = roundOneWith(undying, flipper());
    expect(state.round).toBe(2);
    const leader = state.leader;
    if (currentPlayer(state) !== "A") state = playTurn(state, leader, state.players[leader].hand[0]?.instanceId);
    state = playTurn(state, "A", instanceId("A", undying));
    expect(state.players.A.board.some((b) => b.card.id === undying.id && b.faceUp)).toBe(true);
  });
});

describe("Moonrise (design.md §5.15)", () => {
  function stateWithMoonriseOnBoard() {
    const moon = makeCard({ name: "Moon", points: 2, keywords: { moonrise: 4 } });
    const filler = vanilla("B filler");
    let state = createMatch(orderedDeck([moon]), orderedDeck([filler]), { seed: 1, shuffle: false, leader: "A" });
    state = playTurn(state, "A", instanceId("A", moon));
    return { state, moon };
  }

  const roundResult = (round: number, winner: "A" | "B" | "tie") => ({
    round,
    scores: { A: 0, B: 0 },
    winner,
    finalBoard: { A: [], B: [] },
  });

  it("is worth only its printed points in round 1", () => {
    const { state } = stateWithMoonriseOnBoard();
    expect(isFinalRound(state)).toBe(false);
    expect(effectivePoints(state, "A", state.players.A.board[0]!)).toBe(2);
  });

  it("is live in round 3, which always ends the match", () => {
    const { state } = stateWithMoonriseOnBoard();
    const round3: MatchState = { ...state, round: 3, roundHistory: [roundResult(1, "tie"), roundResult(2, "tie")] };
    expect(isFinalRound(round3)).toBe(true);
    expect(effectivePoints(round3, "A", round3.players.A.board[0]!)).toBe(6);
  });

  it("is live in round 2 when a player already holds a round win, since that round can end the match", () => {
    const { state } = stateWithMoonriseOnBoard();
    for (const winner of ["A", "B"] as const) {
      const round2: MatchState = { ...state, round: 2, roundHistory: [roundResult(1, winner)] };
      expect(isFinalRound(round2), `round 1 won by ${winner}`).toBe(true);
      expect(effectivePoints(round2, "A", round2.players.A.board[0]!)).toBe(6);
    }
  });

  it("is not live in round 2 after a tied round 1, since nobody can win the match yet", () => {
    const { state } = stateWithMoonriseOnBoard();
    const round2: MatchState = { ...state, round: 2, roundHistory: [roundResult(1, "tie")] };
    expect(isFinalRound(round2)).toBe(false);
    expect(effectivePoints(round2, "A", round2.players.A.board[0]!)).toBe(2);
  });

  it("gives the same answer before and after a round's own result is recorded", () => {
    const { state } = stateWithMoonriseOnBoard();
    const round2Live: MatchState = { ...state, round: 2, roundHistory: [roundResult(1, "tie")] };
    const round2Recorded: MatchState = { ...round2Live, roundHistory: [...round2Live.roundHistory, roundResult(2, "A")], roundsWon: { A: 1, B: 0 } };
    expect(isFinalRound(round2Live)).toBe(isFinalRound(round2Recorded));
  });

  it("does not count when face-down, and stacks with a continuous buff", () => {
    const { state } = stateWithMoonriseOnBoard();
    const round3: MatchState = { ...state, round: 3, roundHistory: [roundResult(1, "tie"), roundResult(2, "tie")] };
    const flippedBoard = structuredClone(round3);
    flippedBoard.players.A.board[0]!.faceUp = false;
    expect(effectivePoints(flippedBoard, "A", flippedBoard.players.A.board[0]!)).toBe(0);

    const buffed = structuredClone(round3);
    buffed.players.A.board[0]!.bonusPoints = 1;
    expect(effectivePoints(buffed, "A", buffed.players.A.board[0]!)).toBe(7);
  });

  it("scores a match round with the bonus in round 2 after a round-1 win, and without it after a round-1 tie", () => {
    function roundTwoScoreOfMoonCard(round1BigA: boolean) {
      const moon = makeCard({ name: "Moon", points: 2, keywords: { moonrise: 3 } });
      const aCards = [vanilla("a1", round1BigA ? 3 : 1), vanilla("a2", round1BigA ? 3 : 1), vanilla("a3", round1BigA ? 3 : 1), moon, vanilla("z1", 0), vanilla("z2", 0)];
      const bCards = [vanilla("b1"), vanilla("b2"), vanilla("b3"), vanilla("b4"), vanilla("b5"), vanilla("b6")];
      const playA = makeQueuePlayer(aCards);
      const playB = makeQueuePlayer(bCards);
      let state = createMatch(orderedDeck(aCards), orderedDeck(bCards), { seed: 1, shuffle: false, leader: "A" });
      state = playThroughRound(state, 1, playA, playB);
      expect(state.roundHistory[0]!.winner).toBe(round1BigA ? "A" : "tie");
      state = playThroughRound(state, 2, playA, playB);
      return state.roundHistory[1]!.scores.A;
    }
    expect(roundTwoScoreOfMoonCard(true)).toBe(5); // 2 printed + 3 Moonrise: round 2 could end the match
    expect(roundTwoScoreOfMoonCard(false)).toBe(2); // round 1 tied: round 2 can't end it yet
  });
});

describe("keyword schema validation", () => {
  const withKeywords = (keywords: unknown) => ({
    id: "k",
    rarity: "common",
    faces: [{ name: "K", type: "character", family: "neutral", points: 1, keywords, flavor: "f", artId: "k" }],
  });

  it("accepts undying and moonrise", () => {
    expect(validateCard(withKeywords({ undying: true, moonrise: 2 })).valid).toBe(true);
  });

  it("rejects a malformed undying or moonrise", () => {
    expect(validateCard(withKeywords({ undying: "yes" })).errors.join()).toMatch(/undying/);
    expect(validateCard(withKeywords({ moonrise: 0 })).errors.join()).toMatch(/moonrise/);
    expect(validateCard(withKeywords({ moonrise: 1.5 })).errors.join()).toMatch(/moonrise/);
  });
});
