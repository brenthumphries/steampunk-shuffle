// Keyword and effect resolution (design.md §5) that doesn't need a full
// round replay — each test plays just enough turns to exercise one rule.

import { describe, expect, it } from "vitest";

import { createMatch, effectivePoints, playTurn, type MatchState, type PlayerId } from "../../../src/engine/matchEngine.ts";
import { instanceId, makeCard, orderedDeck } from "./fixtures/helpers.ts";

function bc(state: MatchState, playerId: PlayerId, id: string) {
  const found = state.players[playerId].board.find((b) => b.instanceId === id);
  if (!found) throw new Error(`no board card ${id} for ${playerId}`);
  return found;
}

/** Plays out the rest of the current round with plain fillers so finishRound() fires. */
function finishRoundWithFillers(state: MatchState, remainingA: string[], remainingB: string[]): MatchState {
  let s = state;
  const startRound = s.round;
  let ai = 0;
  let bi = 0;
  while (s.round === startRound && s.status === "in-progress") {
    const leaderTurn = s.turnsPlayedThisRound % 2 === 0;
    const acting = leaderTurn ? s.leader : s.leader === "A" ? "B" : "A";
    if (acting === "A") {
      s = playTurn(s, "A", remainingA[ai++]);
    } else {
      s = playTurn(s, "B", remainingB[bi++]);
    }
  }
  return s;
}

describe("Persist (design.md §5.3)", () => {
  it("a face-up Persist card survives to next round's board; a non-Persist card is discarded", () => {
    const persistCard = makeCard({ name: "Persist Card", points: 2, keywords: { persist: true } });
    const plainCard = makeCard({ name: "Plain Card", points: 3 });
    const aFillers = [makeCard({ name: "A filler 1", points: 1 }), makeCard({ name: "A filler 2", points: 1 })];
    const bFillers = Array.from({ length: 3 }, (_, i) => makeCard({ name: `B filler ${i}`, points: 1 }));

    const deckA = orderedDeck([persistCard, plainCard, ...aFillers]);
    const deckB = orderedDeck(bFillers);

    let state = createMatch(deckA, deckB, { seed: 1, shuffle: false, leader: "A" });
    state = playTurn(state, "A", instanceId("A", persistCard));
    state = finishRoundWithFillers(
      state,
      [instanceId("A", plainCard), instanceId("A", aFillers[0]!)],
      bFillers.map((c) => instanceId("B", c)),
    );

    expect(state.round).toBe(2);
    expect(state.players.A.board.map((b) => b.instanceId)).toEqual([instanceId("A", persistCard)]);
    expect(state.players.A.discard.some((c) => c.instanceId === instanceId("A", plainCard))).toBe(true);
    expect(state.players.A.discard.some((c) => c.instanceId === instanceId("A", aFillers[0]!))).toBe(true);
  });
});

describe("Flip (design.md §5.7)", () => {
  it("turns a matching opposing card face-down, worth 0", () => {
    const target = makeCard({ name: "Target", points: 2 });
    const flipper = makeCard({
      name: "Flipper",
      points: 1,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "flip", target: { side: "opponent", filter: { maxPoints: 3 } } }] }],
    });
    const aFiller = makeCard({ name: "A filler", points: 1 });

    const deckA = orderedDeck([aFiller, flipper]);
    const deckB = orderedDeck([target]);

    let state = createMatch(deckA, deckB, { seed: 1, shuffle: false, leader: "A" });
    state = playTurn(state, "A", instanceId("A", aFiller));
    state = playTurn(state, "B", instanceId("B", target));
    state = playTurn(state, "A", instanceId("A", flipper));

    const targetBc = bc(state, "B", instanceId("B", target));
    expect(targetBc.faceUp).toBe(false);
    expect(effectivePoints(state, "B", targetBc)).toBe(0);
  });

  it("cannot target an Elusive card (design.md §5.5)", () => {
    const target = makeCard({ name: "Elusive Target", points: 2, keywords: { elusive: true } });
    const flipper = makeCard({
      name: "Flipper",
      points: 1,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "flip", target: { side: "opponent", filter: { maxPoints: 3 } } }] }],
    });
    const aFiller = makeCard({ name: "A filler", points: 1 });

    const deckA = orderedDeck([aFiller, flipper]);
    const deckB = orderedDeck([target]);

    let state = createMatch(deckA, deckB, { seed: 1, shuffle: false, leader: "A" });
    state = playTurn(state, "A", instanceId("A", aFiller));
    state = playTurn(state, "B", instanceId("B", target));
    state = playTurn(state, "A", instanceId("A", flipper));

    expect(bc(state, "B", instanceId("B", target)).faceUp).toBe(true);
  });

  it("does nothing when no legal target exists", () => {
    const flipper = makeCard({
      name: "Flipper",
      points: 1,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "flip", target: { side: "opponent", filter: { maxPoints: 3 } } }] }],
    });
    const filler = makeCard({ name: "filler", points: 1 });

    const deckA = orderedDeck([flipper]);
    const deckB = orderedDeck([filler]);

    let state = createMatch(deckA, deckB, { seed: 1, shuffle: false, leader: "A" });
    expect(() => {
      state = playTurn(state, "A", instanceId("A", flipper));
    }).not.toThrow();
    expect(state.players.B.board).toHaveLength(0);
  });
});

describe("Un-flip (design.md §5.7)", () => {
  it("restores a face-down card's points and keywords", () => {
    const target = makeCard({ name: "Target", points: 2, keywords: { persist: true } });
    const flipper = makeCard({
      name: "Flipper",
      points: 1,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "flip", target: { side: "opponent", filter: { maxPoints: 5 } } }] }],
    });
    const unflipper = makeCard({
      name: "Unflipper",
      points: 0,
      type: "scheme",
      abilities: [{ trigger: "onPlay", effects: [{ effect: "unflip", target: { side: "self", filter: {} } }] }],
    });

    const deckA = orderedDeck([target, unflipper]);
    const deckB = orderedDeck([flipper]);

    let state = createMatch(deckA, deckB, { seed: 1, shuffle: false, leader: "A" });
    state = playTurn(state, "A", instanceId("A", target));
    state = playTurn(state, "B", instanceId("B", flipper));
    expect(bc(state, "A", instanceId("A", target)).faceUp).toBe(false);

    state = playTurn(state, "A", instanceId("A", unflipper));
    const targetBc = bc(state, "A", instanceId("A", target));
    expect(targetBc.faceUp).toBe(true);
    expect(effectivePoints(state, "A", targetBc)).toBe(2);
  });
});

describe("Return (design.md §5.8)", () => {
  it("moves a face-up Return card to hand at end of round, even if it also has Persist", () => {
    const returner = makeCard({ name: "Returner", points: 2, keywords: { return: true, persist: true } });
    const aFillers = [makeCard({ name: "A filler 1", points: 1 }), makeCard({ name: "A filler 2", points: 1 })];
    const bFillers = Array.from({ length: 3 }, (_, i) => makeCard({ name: `B filler ${i}`, points: 1 }));

    const deckA = orderedDeck([returner, ...aFillers]);
    const deckB = orderedDeck(bFillers);

    let state = createMatch(deckA, deckB, { seed: 1, shuffle: false, leader: "A" });
    state = playTurn(state, "A", instanceId("A", returner));
    state = finishRoundWithFillers(
      state,
      aFillers.map((c) => instanceId("A", c)),
      bFillers.map((c) => instanceId("B", c)),
    );

    expect(state.players.A.hand.some((c) => c.instanceId === instanceId("A", returner))).toBe(true);
    expect(state.players.A.board.some((b) => b.instanceId === instanceId("A", returner))).toBe(false);
    expect(state.players.A.discard.some((c) => c.instanceId === instanceId("A", returner))).toBe(false);
  });
});

describe("Draw N (design.md §5.9)", () => {
  it("draws what's there when the deck has fewer than N left", () => {
    const drawer = makeCard({
      name: "Drawer",
      points: 0,
      type: "scheme",
      abilities: [{ trigger: "onPlay", effects: [{ effect: "draw", amount: 3 }] }],
    });
    const onlyOneLeft = makeCard({ name: "Only One Left", points: 1 });
    const bFiller = makeCard({ name: "B filler", points: 1 });

    // Exactly 1 card left in the deck after the opening 5-card hand is dealt.
    const deckA = orderedDeck([
      makeCard({ name: "h1", points: 1 }),
      makeCard({ name: "h2", points: 1 }),
      makeCard({ name: "h3", points: 1 }),
      makeCard({ name: "h4", points: 1 }),
      drawer,
      onlyOneLeft,
    ]);
    const deckB = orderedDeck([bFiller]);

    let state = createMatch(deckA, deckB, { seed: 1, shuffle: false, leader: "A" });
    expect(state.players.A.deck).toHaveLength(1);
    state = playTurn(state, "A", instanceId("A", drawer));

    expect(state.players.A.deck).toHaveLength(0);
    expect(state.players.A.hand.some((c) => c.instanceId === instanceId("A", onlyOneLeft))).toBe(true);
  });
});

describe("Location (design.md §5.6)", () => {
  it("only one is active; playing a new one replaces and discards the old", () => {
    const locA = makeCard({ name: "Loc A", type: "location", family: "neutral", points: 0 });
    const locB = makeCard({ name: "Loc B", type: "location", family: "neutral", points: 0 });
    const bFillers = Array.from({ length: 2 }, (_, i) => makeCard({ name: `B filler ${i}`, points: 1 }));

    const deckA = orderedDeck([locA, locB]);
    const deckB = orderedDeck(bFillers);

    let state = createMatch(deckA, deckB, { seed: 1, shuffle: false, leader: "A" });
    state = playTurn(state, "A", instanceId("A", locA));
    expect(state.location?.instanceId).toBe(instanceId("A", locA));

    state = playTurn(state, "B", instanceId("B", bFillers[0]!));
    state = playTurn(state, "A", instanceId("A", locB));
    expect(state.location?.instanceId).toBe(instanceId("A", locB));
    expect(state.neutralDiscard.some((c) => c.instanceId === instanceId("A", locA))).toBe(true);
  });

  it("discardLocation clears the active Location with no replacement", () => {
    const loc = makeCard({ name: "Loc", type: "location", family: "neutral", points: 0 });
    const banisher = makeCard({
      name: "Banisher",
      points: 1,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "discardLocation" }] }],
    });
    const bFiller = makeCard({ name: "B filler", points: 1 });

    const deckA = orderedDeck([loc, banisher]);
    const deckB = orderedDeck([bFiller]);

    let state = createMatch(deckA, deckB, { seed: 1, shuffle: false, leader: "A" });
    state = playTurn(state, "A", instanceId("A", loc));
    state = playTurn(state, "B", instanceId("B", bFiller));
    state = playTurn(state, "A", instanceId("A", banisher));

    expect(state.location).toBeUndefined();
    expect(state.neutralDiscard.some((c) => c.instanceId === instanceId("A", loc))).toBe(true);
  });
});

describe("hasKeyword filter (design.md §5.4, plan step 4.0b / PT-3)", () => {
  it("a continuous buff filtered by hasKeyword only affects cards carrying that keyword", () => {
    const buffer = makeCard({
      name: "Buffer",
      points: 1,
      abilities: [
        { trigger: "continuous", effects: [{ effect: "buff", target: { side: "self", filter: { hasKeyword: "friend" } }, amount: 1 }] },
      ],
    });
    const friendCard = makeCard({ name: "Friend Card", points: 2, keywords: { friend: 1 } });
    const plainCard = makeCard({ name: "Plain Card", points: 2 });
    const bFiller1 = makeCard({ name: "B filler 1", points: 1 });
    const bFiller2 = makeCard({ name: "B filler 2", points: 1 });

    const deckA = orderedDeck([buffer, friendCard, plainCard]);
    const deckB = orderedDeck([bFiller1, bFiller2]);

    let state = createMatch(deckA, deckB, { seed: 1, shuffle: false, leader: "A" });
    state = playTurn(state, "A", instanceId("A", buffer));
    state = playTurn(state, "B", instanceId("B", bFiller1));
    state = playTurn(state, "A", instanceId("A", friendCard));
    state = playTurn(state, "B", instanceId("B", bFiller2));
    state = playTurn(state, "A", instanceId("A", plainCard));

    expect(effectivePoints(state, "A", bc(state, "A", instanceId("A", friendCard)))).toBe(3);
    expect(effectivePoints(state, "A", bc(state, "A", instanceId("A", plainCard)))).toBe(2);
  });
});

describe("Scheme/Headline discard (design.md §3, plan step 4.0b / PT-25)", () => {
  it("a played Scheme or Headline is discarded right after On Play, not left as a 0-point board card", () => {
    const scheme = makeCard({ name: "Test Scheme", points: 0, type: "scheme" });
    const headline = makeCard({ name: "Test Headline", points: 0, type: "headline" });
    const bFiller = makeCard({ name: "B filler", points: 1 });

    const deckA = orderedDeck([scheme, headline]);
    const deckB = orderedDeck([bFiller]);

    let state = createMatch(deckA, deckB, { seed: 1, shuffle: false, leader: "A" });
    state = playTurn(state, "A", instanceId("A", scheme));
    expect(state.players.A.board).toHaveLength(0);
    expect(state.players.A.discard.some((c) => c.instanceId === instanceId("A", scheme))).toBe(true);

    state = playTurn(state, "B", instanceId("B", bFiller));
    state = playTurn(state, "A", instanceId("A", headline));
    expect(state.players.A.board).toHaveLength(0);
    expect(state.players.A.discard.some((c) => c.instanceId === instanceId("A", headline))).toBe(true);
  });

  it("a later 'flip your lowest-point card' effect cannot hit an already-spent Scheme (PT-25's repro)", () => {
    const scheme = makeCard({ name: "Test Scheme", points: 0, type: "scheme" });
    const character = makeCard({ name: "Real Character", points: 3 });
    const headline = makeCard({
      name: "Test Headline",
      points: 0,
      type: "headline",
      abilities: [{ trigger: "onPlay", effects: [{ effect: "flip", target: { side: "self", filter: { lowestPoints: true }, count: 1 } }] }],
    });
    const bFiller1 = makeCard({ name: "B filler 1", points: 1 });
    const bFiller2 = makeCard({ name: "B filler 2", points: 1 });

    const deckA = orderedDeck([scheme, character, headline]);
    const deckB = orderedDeck([bFiller1, bFiller2]);

    let state = createMatch(deckA, deckB, { seed: 1, shuffle: false, leader: "A" });
    state = playTurn(state, "A", instanceId("A", scheme));
    state = playTurn(state, "B", instanceId("B", bFiller1));
    state = playTurn(state, "A", instanceId("A", character));
    state = playTurn(state, "B", instanceId("B", bFiller2));
    state = playTurn(state, "A", instanceId("A", headline));

    // The spent Scheme is already gone, so the only legal target is the real
    // board card — before the fix, the (still-present) Scheme's 0 points
    // would have absorbed this instead.
    expect(bc(state, "A", instanceId("A", character)).faceUp).toBe(false);
  });
});

describe("Reserved / no-op effects", () => {
  it("steal is accepted but unresolved in v1 (design.md §16, §9.3)", () => {
    const target = makeCard({ name: "Target", points: 1 });
    const stealer = makeCard({
      name: "Stealer",
      points: 1,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "steal", target: { side: "opponent", filter: {} } }] }],
    });
    const aFiller = makeCard({ name: "A filler", points: 1 });

    const deckA = orderedDeck([aFiller, stealer]);
    const deckB = orderedDeck([target]);

    let state = createMatch(deckA, deckB, { seed: 1, shuffle: false, leader: "A" });
    state = playTurn(state, "A", instanceId("A", aFiller));
    state = playTurn(state, "B", instanceId("B", target));
    expect(() => {
      state = playTurn(state, "A", instanceId("A", stealer));
    }).not.toThrow();
    expect(state.players.B.board.some((b) => b.instanceId === instanceId("B", target))).toBe(true);
    expect(state.players.A.board.some((b) => b.instanceId === instanceId("B", target))).toBe(false);
  });

  it("reveal doesn't mutate state — hands stay exactly as they were", () => {
    const revealer = makeCard({
      name: "Revealer",
      points: 1,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "reveal", target: { side: "opponent" } }] }],
    });
    const bFiller = makeCard({ name: "B filler", points: 1 });

    const deckA = orderedDeck([revealer]);
    const deckB = orderedDeck([bFiller]);

    let state = createMatch(deckA, deckB, { seed: 1, shuffle: false, leader: "A" });
    const handBBefore = state.players.B.hand.map((c) => c.instanceId);
    state = playTurn(state, "A", instanceId("A", revealer));
    expect(state.players.B.hand.map((c) => c.instanceId)).toEqual(handBBefore);
  });
});
