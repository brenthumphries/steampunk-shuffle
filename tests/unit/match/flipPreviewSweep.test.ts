import { describe, expect, it } from "vitest";

import type { Card, Deck } from "../../../src/cards/cardTypes.ts";
import { chooseAIMove } from "../../../src/ai/aiOpponent.ts";
import { herculePoirot } from "../../../src/cards/data/legends.ts";
import { hiawatha } from "../../../src/cards/data/families/irregulars.ts";
import { KNOWN_DECKS, starterDeck } from "../../../src/cards/data/decks/index.ts";
import { createMatch, currentPlayer, effectivePoints, playTurn, type BoardCard, type MatchState, type PlayerId } from "../../../src/engine/matchEngine.ts";
import { stepRandom } from "../../../src/engine/rng.ts";
import { isReadyToConfirm, stagePlay, toChooserSelections, toggleTarget } from "../../../src/match/humanTurn.ts";
import { buildTargetChooser } from "../../../src/match/targetChooser.ts";
import { describeAutoTarget } from "../../../src/ui/cardText.ts";
import { instanceId, makeCard, orderedDeck } from "../engine/fixtures/helpers.ts";

// PT-36 sweep: for Hiawatha ("Flip an opposing card worth 2 or less") and
// Hercule Poirot ("Flip the opponent's highest-point card"), the confirm bar's
// line before Play ("Flips X." / "No legal target — it does nothing.") must
// match what then happens, across face-up, face-down, Elusive and buffed
// opposing cards, and across whole games. The oracle below reads design.md
// §5.5/§5.7 straight off the board, not the engine's own pool-building.

type Flipper = "hiawatha" | "poirot";
const CARD: Record<Flipper, Card> = { hiawatha, poirot: herculePoirot };

function oracleTargets(state: MatchState, mover: PlayerId, which: Flipper): BoardCard[] {
  const foe = mover === "A" ? "B" : "A";
  return state.players[foe].board.filter((bc) => {
    if (!bc.faceUp) return false;
    if (bc.card.faces[bc.faceIndex]?.keywords?.elusive) return false;
    return which === "poirot" || effectivePoints(state, foe, bc) <= 2;
  });
}

function oracleHighest(state: MatchState, mover: PlayerId, cands: BoardCard[]): BoardCard {
  const foe = mover === "A" ? "B" : "A";
  return cands.reduce((best, bc) => (effectivePoints(state, foe, bc) > effectivePoints(state, foe, best) ? bc : best));
}

const nameOf = (bc: BoardCard) => bc.card.faces[bc.faceIndex]?.name ?? "";

/** Plays `which` as player `mover` the way the match screen does; returns the bar line (if any) and the instanceIds that were flipped. */
function playAndObserve(state: MatchState, mover: PlayerId, which: Flipper, pickIndex = 0): { next: MatchState; line: string | undefined; flipped: string[]; chose: boolean } {
  const card = CARD[which];
  const hand = state.players[mover].hand;
  const id = hand.find((c) => c.card.id === card.id)!.instanceId;
  let play = stagePlay(state, mover, id, card);
  const chose = play.steps.some((s) => s.needsChoice);
  if (chose) play = toggleTarget(play, play.steps[0]!.step.candidates[pickIndex]!.bc.instanceId);
  expect(isReadyToConfirm(play)).toBe(true);

  let line: string | undefined;
  if (!chose) {
    const raw = play.allTargetableSteps[0]!;
    const staged = play.steps.find((s) => s.step === raw);
    const names = staged ? staged.selected.map((sid) => nameOf(state.players[mover === "A" ? "B" : "A"].board.find((b) => b.instanceId === sid)!)) : [];
    line = describeAutoTarget(raw.effect, names);
  }
  const chooser = play.steps.length > 0 ? buildTargetChooser(state, toChooserSelections(play)) : undefined;
  const next = playTurn(state, mover, id, chooser ? { chooseTargets: chooser } : undefined);
  const foe = mover === "A" ? "B" : "A";
  const wasUp = state.players[foe].board.filter((bc) => bc.faceUp).map((bc) => bc.instanceId);
  // A play that ends the round sweeps the board, so read the board as it stood at round end (PT-9's finalBoard).
  const after = next.roundHistory.length > state.roundHistory.length ? next.roundHistory[next.roundHistory.length - 1]!.finalBoard[foe] : next.players[foe].board;
  const flipped = wasUp.filter((bid) => after.find((bc) => bc.instanceId === bid)?.faceUp === false);
  return { next, line, flipped, chose };
}

function expectBarMatchesOutcome(state: MatchState, mover: PlayerId, which: Flipper, pickIndex = 0): void {
  const cands = oracleTargets(state, mover, which);
  const { line, flipped, chose, next } = playAndObserve(state, mover, which, pickIndex);
  void next;
  if (cands.length === 0) {
    expect(line).toBe("No legal target — it does nothing.");
    expect(flipped).toEqual([]);
    return;
  }
  if (chose) {
    expect(flipped).toHaveLength(1);
    expect(cands.map((c) => c.instanceId)).toContain(flipped[0]);
    return;
  }
  const want = which === "poirot" ? oracleHighest(state, mover, cands) : cands[0]!;
  expect(flipped).toEqual([want.instanceId]);
  expect(line).toBe(`Flips ${nameOf(want)}.`);
}

interface Foe {
  name: string;
  points: number;
  faceUp?: boolean;
  elusive?: boolean;
  friend?: number;
}

/** A: Hiawatha/Poirot in hand, B: a hand-built board. Boards are pushed directly so any combination can be set up. */
function scenario(which: Flipper, foes: Foe[], opts: { locationBuff?: number } = {}): MatchState {
  const mine = CARD[which];
  const filler = makeCard({ name: "A Filler", points: 1 });
  const foeCards = foes.map((f) =>
    makeCard({ name: f.name, points: f.points, keywords: { ...(f.elusive ? { elusive: true } : {}), ...(f.friend ? { friend: f.friend } : {}) } }),
  );
  const state = createMatch(orderedDeck([mine, filler]), orderedDeck([makeCard({ name: "B Spare", points: 1 }), ...foeCards]), { seed: 1, shuffle: false, leader: "A" });
  state.players.B.board = foes.map((f, i) => ({ instanceId: instanceId("B", foeCards[i]!), card: foeCards[i]!, faceIndex: 0, faceUp: f.faceUp ?? true, bonusPoints: 0 }));
  if (opts.locationBuff) {
    const loc = makeCard({
      name: "Buffing Room",
      type: "location",
      points: 0,
      abilities: [{ trigger: "continuous", effects: [{ effect: "buff", amount: opts.locationBuff, target: { side: "opponent" } }] }],
    });
    state.location = { instanceId: "L:buff", card: loc, faceIndex: 0, faceUp: true, bonusPoints: 0 };
  }
  return state;
}

describe("PT-36: the confirm bar matches the outcome for Hiawatha and Poirot", () => {
  for (const which of ["hiawatha", "poirot"] as const) {
    describe(which, () => {
      const cases: [string, Foe[], { locationBuff?: number }?][] = [
        ["one face-up 2-pointer", [{ name: "Two", points: 2 }]],
        ["one face-up 1-pointer", [{ name: "One", points: 1 }]],
        ["one face-up 5-pointer", [{ name: "Five", points: 5 }]],
        ["empty board", []],
        ["only a face-down card", [{ name: "Down", points: 2, faceUp: false }]],
        ["only an Elusive 2-pointer", [{ name: "Slippery", points: 2, elusive: true }]],
        ["an Elusive 2-pointer next to a plain 2-pointer", [{ name: "Slippery", points: 2, elusive: true }, { name: "Plain", points: 2 }]],
        ["an Elusive 5-pointer next to a plain 3-pointer", [{ name: "Slippery", points: 5, elusive: true }, { name: "Plain", points: 3 }]],
        ["a face-down 5-pointer next to a face-up 2-pointer", [{ name: "Down", points: 5, faceUp: false }, { name: "Up", points: 2 }]],
        ["a 2-pointer buffed to 3 by a Friend", [{ name: "Buddy", points: 2, friend: 1 }, { name: "Mate", points: 2, friend: 1 }], undefined],
        ["a 1-pointer buffed to 3 by a Location", [{ name: "Tiny", points: 1 }], { locationBuff: 2 }],
        ["a 2-pointer buffed to 3 by a Location", [{ name: "Two", points: 2 }], { locationBuff: 1 }],
        ["a 1-pointer buffed to 2 by a Location (still legal)", [{ name: "Tiny", points: 1 }], { locationBuff: 1 }],
        ["two 2-pointers (a real choice for Hiawatha)", [{ name: "Twin A", points: 2 }, { name: "Twin B", points: 2 }]],
        ["a 1-pointer and a 6-pointer", [{ name: "One", points: 1 }, { name: "Six", points: 6 }]],
        ["a tie for highest", [{ name: "Left", points: 4 }, { name: "Right", points: 4 }]],
      ];
      for (const [label, foes, o] of cases) {
        it(label, () => {
          const state = scenario(which, foes, o);
          expectBarMatchesOutcome(state, "A", which);
          if (foes.length > 1) expectBarMatchesOutcome(scenario(which, foes, o), "A", which, 1);
        });
      }
    });
  }

  it("an opposing card buffed above 2 is correctly out of Hiawatha's reach, and the bar says so", () => {
    const state = scenario("hiawatha", [{ name: "Two", points: 2 }], { locationBuff: 1 });
    const { line, flipped } = playAndObserve(state, "A", "hiawatha");
    expect(line).toBe("No legal target — it does nothing.");
    expect(flipped).toEqual([]);
  });
});

const FLIP_DECK: Deck = [...starterDeck.map((e) => ({ ...e })), { card: hiawatha, quantity: 2 }, { card: herculePoirot, quantity: 2 }];

describe("PT-36: whole games against every authored opponent deck", () => {
  it("every Hiawatha and Poirot play by the human side matches its bar line and the oracle", () => {
    let checked = 0;
    let noTarget = 0;
    for (const { deck: foeDeck } of KNOWN_DECKS) {
      for (let seed = 1; seed <= 4; seed++) {
        let state = createMatch(FLIP_DECK, foeDeck, { seed, shuffle: true });
        let rng = seed * 101;
        let aiSeed = seed;
        for (let guard = 0; state.status === "in-progress" && guard < 80; guard++) {
          const mover = currentPlayer(state);
          const hand = state.players[mover].hand;
          if (hand.length === 0) {
            state = playTurn(state, mover);
            continue;
          }
          const drawn = state.players[mover].deck[0];
          const flipperInHand = (["hiawatha", "poirot"] as const).find((w) => [...hand, ...(drawn ? [drawn] : [])].some((c) => c.card.id === CARD[w].id));
          if (mover === "A" && flipperInHand && hand.some((c) => c.card.id === CARD[flipperInHand].id)) {
            const cands = oracleTargets(state, "A", flipperInHand);
            if (cands.length === 0) noTarget++;
            expectBarMatchesOutcome(state, "A", flipperInHand, cands.length > 1 ? Math.min(1, cands.length - 1) : 0);
            checked++;
            const { next } = playAndObserve(state, "A", flipperInHand);
            state = next;
            continue;
          }
          if (mover === "A") {
            const step = stepRandom(rng);
            rng = step.seed;
            state = playTurn(state, "A", hand[Math.floor(step.value * hand.length)]!.instanceId);
          } else {
            const move = chooseAIMove(state, "B", FLIP_DECK, "seasoned", aiSeed);
            aiSeed = move.nextSeed;
            state = playTurn(state, "B", move.instanceId);
          }
        }
      }
    }
    expect(checked).toBeGreaterThan(50);
    expect(noTarget).toBeLessThan(checked);
  }, 120_000);
});
