import { describe, expect, it } from "vitest";

import { herculePoirot } from "../../../src/cards/data/legends.ts";
import { hiawatha } from "../../../src/cards/data/families/irregulars.ts";
import { seance } from "../../../src/cards/data/families/salon.ts";
import { createMatch, playTurn, type MatchState } from "../../../src/engine/matchEngine.ts";
import { isReadyToConfirm, stagePlay, toChooserSelections, toggleTarget } from "../../../src/match/humanTurn.ts";
import { buildTargetChooser } from "../../../src/match/targetChooser.ts";
import { instanceId, makeCard, orderedDeck } from "../engine/fixtures/helpers.ts";

// PT-35/PT-36 repro: the real cards, driven through the same stage → choose →
// playTurn path the match screen uses, so a card whose printed text promises a
// flip is proven to flip when no rule (Elusive, already face-down) stands in the way.

function opponentLeadsThenFiller(playerCard: ReturnType<typeof makeCard>, opponentCards: ReturnType<typeof makeCard>[]): MatchState {
  const filler = makeCard({ name: "A Filler", points: 1 });
  let state = createMatch(orderedDeck([filler, playerCard]), orderedDeck(opponentCards), { seed: 1, shuffle: false, leader: "B" });
  state = playTurn(state, "B", instanceId("B", opponentCards[0]!));
  state = playTurn(state, "A", instanceId("A", filler));
  return state;
}

function confirm(state: MatchState, play: ReturnType<typeof stagePlay>): MatchState {
  const chooser = play.steps.length > 0 ? buildTargetChooser(state, toChooserSelections(play)) : undefined;
  return playTurn(state, "A", play.instanceId, chooser ? { chooseTargets: chooser } : undefined);
}

describe("real-card human play (PT-35, PT-36)", () => {
  it("Hiawatha flips a 2-point opposing card", () => {
    const target = makeCard({ name: "Two Pointer", points: 2 });
    const other = makeCard({ name: "Other", points: 4 });
    let state = opponentLeadsThenFiller(hiawatha, [target, other]);
    state = playTurn(state, "B", instanceId("B", other));
    const play = stagePlay(state, "A", instanceId("A", hiawatha), hiawatha);
    expect(isReadyToConfirm(play)).toBe(true);
    state = confirm(state, play);
    const hit = state.players.B.board.find((bc) => bc.instanceId === instanceId("B", target));
    expect(hit?.faceUp).toBe(false);
    expect(state.players.B.board.find((bc) => bc.instanceId === instanceId("B", other))?.faceUp).toBe(true);
  });

  it("Hercule Poirot flips the opponent's highest-point card", () => {
    const low = makeCard({ name: "Low", points: 1 });
    const high = makeCard({ name: "High", points: 5 });
    let state = opponentLeadsThenFiller(herculePoirot, [low, high]);
    state = playTurn(state, "B", instanceId("B", high));
    const play = stagePlay(state, "A", instanceId("A", herculePoirot), herculePoirot);
    state = confirm(state, play);
    const board = state.players.B.board;
    expect(board.find((bc) => bc.instanceId === instanceId("B", high))?.faceUp).toBe(false);
    expect(board.find((bc) => bc.instanceId === instanceId("B", low))?.faceUp).toBe(true);
  });

  it("Séance with two face-down cards of its own offers both as choices and unflips the picked one", () => {
    const flipper = makeCard({
      name: "Flipper",
      points: 1,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "flip", target: { side: "opponent", filter: { maxPoints: 9 } } }] }],
    });
    const a = makeCard({ name: "Own A", points: 2 });
    const b = makeCard({ name: "Own B", points: 3 });
    const opp = makeCard({ name: "Opp", points: 1 });
    let state = createMatch(orderedDeck([a, b, seance]), orderedDeck([opp, flipper]), { seed: 1, shuffle: false, leader: "A" });
    state = playTurn(state, "A", instanceId("A", a));
    state = playTurn(state, "B", instanceId("B", opp));
    state = playTurn(state, "A", instanceId("A", b));
    state = playTurn(state, "B", instanceId("B", flipper));
    // the opposing Flipper can only hit one card per play, so flip the second by hand
    for (const bc of state.players.A.board) bc.faceUp = false;

    const play = stagePlay(state, "A", instanceId("A", seance), seance);
    expect(play.steps).toHaveLength(1);
    expect(play.steps[0]!.needsChoice).toBe(true);
    expect(play.steps[0]!.step.candidates.map((oc) => oc.bc.instanceId).sort()).toEqual(
      [instanceId("A", a), instanceId("A", b)].sort(),
    );
    const picked = toggleTarget(play, instanceId("A", b));
    expect(isReadyToConfirm(picked)).toBe(true);
    state = confirm(state, picked);
    const own = state.players.A.board;
    expect(own.find((bc) => bc.instanceId === instanceId("A", b))?.faceUp).toBe(true);
    expect(own.find((bc) => bc.instanceId === instanceId("A", a))?.faceUp).toBe(false);
  });
});
