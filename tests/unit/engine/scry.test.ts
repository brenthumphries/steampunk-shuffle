// Scry N (design.md §5.16): look at the top N cards of the controller's deck,
// put any on the bottom, the rest back on top, in the controller's order.

import { describe, expect, it } from "vitest";

import { validateCard } from "../../../src/cards/cardValidator.ts";
import { createMatch, currentPlayer, playTurn, type MatchState, type PlayerId, type ScryChooser } from "../../../src/engine/matchEngine.ts";
import { stepRandom } from "../../../src/engine/rng.ts";
import { instanceId, makeCard, orderedDeck } from "./fixtures/helpers.ts";

function scryer(amount: number) {
  return makeCard({
    name: `Scryer ${amount}`,
    points: 1,
    family: "coven",
    abilities: [{ trigger: "onPlay", effects: [{ effect: "scry", amount }] }],
  });
}

const filler = Array.from({ length: 12 }, (_, i) => makeCard({ name: `Filler ${i}`, points: 1 }));

/**
 * A deck in a fixed order. A leads round 1, so A's first turn draws the card
 * after the opening hand of four. The Scryer is first, so it is in hand.
 * After A's turn-start draw, the top of A's deck is cards[5] onward.
 */
function setup(scryAmount: number, deckCards = filler) {
  const s = scryer(scryAmount);
  const cards = [s, ...deckCards];
  const state = createMatch(orderedDeck(cards), orderedDeck(filler), { shuffle: false, leader: "A", seed: 7 });
  return { s, cards, state };
}

const ids = (state: MatchState, p: PlayerId) => state.players[p].deck.map((c) => c.instanceId);

describe("Scry (design.md §5.16)", () => {
  it("with no chooser the deck order is left alone", () => {
    const { s, state } = setup(3);
    const plain = playTurn(state, "A", instanceId("A", s));
    const identity = playTurn(state, "A", instanceId("A", s), { chooseScry: (cards) => ({ top: cards.map((c) => c.instanceId), bottom: [] }) });
    expect(ids(plain, "A")).toEqual(ids(identity, "A"));
  });

  it("is told the top N cards, top first, after the turn-start draw", () => {
    const { s, state } = setup(3);
    let seen: string[] = [];
    const chooseScry: ScryChooser = (cards) => {
      seen = cards.map((c) => c.instanceId);
      return { top: seen, bottom: [] };
    };
    const after = playTurn(state, "A", instanceId("A", s), { chooseScry });
    const before = playTurn(state, "A", instanceId("A", s));
    expect(seen.length).toBe(3);
    expect(ids(after, "A").slice(0, 3)).toEqual(seen);
    expect(ids(before, "A").slice(0, 3)).toEqual(seen);
  });

  it("all-to-top reorders the looked-at cards and leaves the rest alone", () => {
    const { s, state } = setup(3);
    const base = ids(playTurn(state, "A", instanceId("A", s)), "A");
    const [a, b, c] = base as [string, string, string];
    const out = playTurn(state, "A", instanceId("A", s), { chooseScry: () => ({ top: [c, a, b], bottom: [] }) });
    expect(ids(out, "A")).toEqual([c, a, b, ...base.slice(3)]);
  });

  it("all-to-bottom sends every looked-at card under the deck, in the order given", () => {
    const { s, state } = setup(3);
    const base = ids(playTurn(state, "A", instanceId("A", s)), "A");
    const [a, b, c] = base as [string, string, string];
    const out = playTurn(state, "A", instanceId("A", s), { chooseScry: () => ({ top: [], bottom: [b, c, a] }) });
    expect(ids(out, "A")).toEqual([...base.slice(3), b, c, a]);
  });

  it("a mix: one to the bottom, the others back on top in a chosen order", () => {
    const { s, state } = setup(3);
    const base = ids(playTurn(state, "A", instanceId("A", s)), "A");
    const [a, b, c] = base as [string, string, string];
    const out = playTurn(state, "A", instanceId("A", s), { chooseScry: () => ({ top: [c, b], bottom: [a] }) });
    expect(ids(out, "A")).toEqual([c, b, ...base.slice(3), a]);
  });

  it("looks at fewer cards when N is larger than the deck", () => {
    const small = filler.slice(0, 6); // 7 cards: 4 in hand, 1 drawn, 1 left in the deck... then scry 5 sees what is there
    const { s, state } = setup(5, small);
    const calls: number[] = [];
    const out = playTurn(state, "A", instanceId("A", s), {
      chooseScry: (cards) => {
        calls.push(cards.length);
        return { top: [], bottom: cards.map((x) => x.instanceId) };
      },
    });
    expect(calls).toEqual([2]);
    expect(out.players.A.deck.length).toBe(2);
  });

  it("with no cards left it does nothing and never asks", () => {
    const small = filler.slice(0, 4); // 5 cards: 4 in hand, then the turn draw takes the last
    const { s, state } = setup(2, small);
    let asked = 0;
    const out = playTurn(state, "A", instanceId("A", s), {
      chooseScry: (cards) => {
        asked++;
        return { top: cards.map((x) => x.instanceId), bottom: [] };
      },
    });
    expect(asked).toBe(0);
    expect(out.players.A.deck).toEqual([]);
  });

  it("an answer that is not a permutation of the looked-at cards is ignored", () => {
    const { s, state } = setup(3);
    const base = ids(playTurn(state, "A", instanceId("A", s)), "A");
    for (const bad of [{ top: [base[0]!], bottom: [] }, { top: [base[0]!, base[0]!, base[1]!], bottom: [] }, { top: ["nope", base[1]!, base[2]!], bottom: [] }]) {
      const out = playTurn(state, "A", instanceId("A", s), { chooseScry: () => bad });
      expect(ids(out, "A")).toEqual(base);
    }
  });

  it("only touches the controller's own deck", () => {
    const { s, state } = setup(3);
    const out = playTurn(state, "A", instanceId("A", s), { chooseScry: (cards) => ({ top: [], bottom: cards.map((c) => c.instanceId) }) });
    expect(ids(out, "B")).toEqual(ids(state, "B"));
  });

  it("is deterministic given the choices", () => {
    const { s, state } = setup(3);
    const choose: ScryChooser = (cards) => ({ top: [cards[2]!.instanceId], bottom: [cards[0]!.instanceId, cards[1]!.instanceId] });
    const one = playTurn(state, "A", instanceId("A", s), { chooseScry: choose });
    const two = playTurn(state, "A", instanceId("A", s), { chooseScry: choose });
    expect(one).toEqual(two);
  });

  it("resolves at end of round with no chooser as a no-op", () => {
    const endScry = makeCard({
      name: "Tide Watcher",
      points: 1,
      abilities: [{ trigger: "endOfRound", effects: [{ effect: "scry", amount: 2 }] }],
    });
    const cards = [endScry, ...filler];
    let state = createMatch(orderedDeck(cards), orderedDeck(filler), { shuffle: false, leader: "A", seed: 3 });
    state = playTurn(state, "A", instanceId("A", endScry));
    expect(state.status).toBe("in-progress");
  });
});

describe("validateCard: scry", () => {
  it("accepts scry on a character, gadget or scheme", () => {
    for (const type of ["character", "gadget", "scheme"] as const) {
      const card = makeCard({ name: `S ${type}`, type, points: type === "character" ? 1 : 0, abilities: [{ trigger: "onPlay", effects: [{ effect: "scry", amount: 2 }] }] });
      expect(validateCard(card)).toEqual({ valid: true, errors: [] });
    }
  });

  it("rejects scry on a location, which has no controller", () => {
    const card = makeCard({ name: "Scrying Pool", type: "location", points: 0, abilities: [{ trigger: "continuous", effects: [{ effect: "scry", amount: 1 }] }] });
    const result = validateCard(card);
    expect(result.valid).toBe(false);
    expect(result.errors.join("\n")).toMatch(/location has no controller/);
  });

  it("rejects a non-positive or fractional amount", () => {
    for (const amount of [0, -1, 1.5]) {
      const card = makeCard({ name: "Bad Scry", points: 1, abilities: [{ trigger: "onPlay", effects: [{ effect: "scry", amount }] }] });
      expect(validateCard(card).valid).toBe(false);
    }
  });

  it("accepts the coven family", () => {
    expect(validateCard(scryer(2))).toEqual({ valid: true, errors: [] });
  });
});

describe("Property: Scry never changes the deck's multiset", () => {
  it("across many random games with random Scry answers, every card instance stays accounted for", { timeout: 60_000 }, () => {
    const pool = [scryer(1), scryer(2), scryer(4), ...filler.slice(0, 5)];
    const spec = pool.map((card) => ({ card, quantity: 2 }));

    const allIds = (state: MatchState): string[] => {
      const out: string[] = [];
      for (const pid of ["A", "B"] as PlayerId[]) {
        const p = state.players[pid];
        out.push(...p.deck.map((c) => c.instanceId), ...p.hand.map((c) => c.instanceId), ...p.board.map((b) => b.instanceId), ...p.discard.map((c) => c.instanceId));
      }
      if (state.location) out.push(state.location.instanceId);
      out.push(...state.neutralDiscard.map((c) => c.instanceId));
      return out.sort();
    };

    for (let game = 0; game < 300; game++) {
      let seed = 999_983 * (game + 1);
      let state = createMatch(spec, spec, { seed, shuffle: true });
      const expected = allIds(state);
      let guard = 0;
      while (state.status === "in-progress" && guard++ < 60) {
        const p = currentPlayer(state);
        const hand = state.players[p].hand;
        if (hand.length === 0) {
          state = playTurn(state, p);
        } else {
          const pick = stepRandom(seed);
          seed = pick.seed;
          const chooseScry: ScryChooser = (cards) => {
            const top: string[] = [];
            const bottom: string[] = [];
            let s = seed;
            for (const c of cards) {
              const r = stepRandom(s);
              s = r.seed;
              (r.value < 0.5 ? top : bottom).splice(Math.floor(r.value * 7) % (top.length + 1), 0, c.instanceId);
            }
            seed = s;
            return { top, bottom };
          };
          state = playTurn(state, p, hand[Math.floor(pick.value * hand.length)]!.instanceId, { chooseScry });
        }
        expect(allIds(state)).toEqual(expected);
      }
    }
  });
});
