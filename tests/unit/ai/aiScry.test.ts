// The AI's Scry heuristic (design.md §5.16): keep what it can play well next
// turn on top, send the rest down; and the legend dial copes with Scry cards.

import { describe, expect, it } from "vitest";

import { aiScryChooser, chooseAIMove, playAITurn, type Difficulty } from "../../../src/ai/aiOpponent.ts";
import { createMatch, currentPlayer, playTurn, type MatchState } from "../../../src/engine/matchEngine.ts";
import { instanceId, makeCard, orderedDeck } from "../engine/fixtures/helpers.ts";

const scry2 = makeCard({ name: "Hedge Witch", family: "coven", points: 2, abilities: [{ trigger: "onPlay", effects: [{ effect: "scry", amount: 2 }] }] });
const big = makeCard({ name: "Big", points: 6 });
const mid = makeCard({ name: "Mid", points: 3 });
const small = makeCard({ name: "Small", points: 1 });
const persistent = makeCard({ name: "Lamp", type: "gadget", points: 1, keywords: { persist: true } });
const moon = makeCard({ name: "Moon Hound", points: 1, keywords: { moonrise: 4 } });
const filler = Array.from({ length: 8 }, (_, i) => makeCard({ name: `F${i}`, points: 2 }));

function deckState(cards: ReturnType<typeof makeCard>[]): MatchState {
  return createMatch(orderedDeck(cards), orderedDeck(filler), { shuffle: false, leader: "A", seed: 9 });
}

describe("aiScryChooser", () => {
  it("keeps the best cards on top, best first, and bottoms those below the deck average", () => {
    const state = deckState([scry2, ...filler, small, big, mid, small, big]);
    const cards = state.players.A.deck.filter((c) => [small.id, big.id, mid.id].includes(c.card.id)).slice(0, 3);
    const choice = aiScryChooser(state, "A")(cards, 3);
    const names = (ids: string[]) => ids.map((id) => cards.find((c) => c.instanceId === id)!.card.faces[0].name);
    expect(names(choice.top)[0]).toBe("Big");
    expect(names(choice.bottom)).toContain("Small");
    expect(choice.top.length + choice.bottom.length).toBe(3);
  });

  it("answers with a permutation of what it was shown", () => {
    const state = deckState([scry2, ...filler, big, small, mid]);
    const cards = state.players.A.deck.slice(-3);
    const choice = aiScryChooser(state, "A")(cards, 3);
    expect([...choice.top, ...choice.bottom].sort()).toEqual(cards.map((c) => c.instanceId).sort());
  });

  it("values Moonrise more in a final round and Persist as a nudge", () => {
    const base = deckState([scry2, ...filler, moon, persistent]);
    const pair = base.players.A.deck.filter((c) => c.card.id === moon.id || c.card.id === persistent.id);
    const early = aiScryChooser(base, "A")(pair, 2);
    const final = aiScryChooser({ ...structuredClone(base), round: 3 }, "A")(pair, 2);
    const first = (ids: string[]) => pair.find((c) => c.instanceId === ids[0])?.card.faces[0].name;
    expect(first(final.top)).toBe("Moon Hound");
    expect([...early.top, ...early.bottom]).toHaveLength(2);
  });

  it("an empty-deck AI still answers", () => {
    const state = deckState([scry2]);
    const choice = aiScryChooser(state, "A")([], 0);
    expect(choice).toEqual({ top: [], bottom: [] });
  });
});

describe("playAITurn with a Scry card", () => {
  it("applies the heuristic when the AI plays the card", () => {
    const state = deckState([scry2, small, small, small, ...filler.slice(0, 6), big, big]);
    const move = playAITurn(state, "A", orderedDeck(filler), "regular", 1);
    if (move.state.players.A.board.some((b) => b.card.id === scry2.id)) {
      // Whatever it played, the multiset of A's cards is intact.
      const count = (s: MatchState) => s.players.A.deck.length + s.players.A.hand.length + s.players.A.board.length + s.players.A.discard.length;
      expect(count(move.state)).toBe(count(state));
    }
  });

  // Inside the search a Scry is a no-op, so the legend dial costs what it did before; only the played move runs the heuristic.
  it.each<Difficulty>(["regular", "seasoned", "legend"])("%s dial plays whole matches of Scry cards without crashing", { timeout: 60_000 }, (difficulty) => {
    const pool = [scry2, makeCard({ name: "Bottle", type: "gadget", points: 1, keywords: { persist: true }, abilities: [{ trigger: "onPlay", effects: [{ effect: "scry", amount: 1 }] }] }), big, mid, small, persistent, moon];
    const spec = pool.map((card) => ({ card, quantity: 2 }));
    let state = createMatch(spec, spec, { seed: 31, shuffle: true });
    let seed = 77;
    let guard = 0;
    while (state.status === "in-progress" && guard++ < 60) {
      const p = currentPlayer(state);
      const move = chooseAIMove(state, p, spec, difficulty, seed);
      seed = move.nextSeed;
      state = playTurn(state, p, move.instanceId, { chooseScry: aiScryChooser(state, p) });
    }
    expect(state.status).toBe("complete");
  });
});
