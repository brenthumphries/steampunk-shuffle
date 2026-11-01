// The human Scry flow without a DOM: the draft model the overlay edits, and
// the dry-run that finds out which cards a play will Scry before it commits.

import { describe, expect, it } from "vitest";

import { createMatch, playTurn } from "../../../src/engine/matchEngine.ts";
import { draftToChoice, moveWithin, startDraft, toggleZone } from "../../../src/match/scryDraft.ts";
import { buildScryChooser, nextScryRequest } from "../../../src/match/scryPreview.ts";
import { keywordChips, abilityLines } from "../../../src/ui/cardText.ts";
import { instanceId, makeCard, orderedDeck } from "../engine/fixtures/helpers.ts";

describe("scry draft", () => {
  it("starts with everything on top in the given order", () => {
    expect(startDraft(["a", "b", "c"])).toEqual({ top: ["a", "b", "c"], bottom: [] });
  });

  it("toggling moves a card to the end of the other row and back", () => {
    let d = startDraft(["a", "b", "c"]);
    d = toggleZone(d, "b");
    expect(d).toEqual({ top: ["a", "c"], bottom: ["b"] });
    d = toggleZone(d, "a");
    expect(d).toEqual({ top: ["c"], bottom: ["b", "a"] });
    d = toggleZone(d, "b");
    expect(d).toEqual({ top: ["c", "b"], bottom: ["a"] });
    expect(toggleZone(d, "zzz")).toBe(d);
  });

  it("moveWithin reorders inside one row and stops at the ends", () => {
    let d = startDraft(["a", "b", "c"]);
    d = moveWithin(d, "c", -1);
    expect(d.top).toEqual(["a", "c", "b"]);
    d = moveWithin(d, "a", -1);
    expect(d.top).toEqual(["a", "c", "b"]);
    d = moveWithin(d, "b", 1);
    expect(d.top).toEqual(["a", "c", "b"]);
    d = toggleZone(d, "c");
    d = toggleZone(d, "a");
    d = moveWithin(d, "a", -1);
    expect(d.bottom).toEqual(["a", "c"]);
  });

  it("draftToChoice copies the rows", () => {
    const d = startDraft(["a", "b"]);
    const choice = draftToChoice(d);
    expect(choice).toEqual(d);
    expect(choice.top).not.toBe(d.top);
  });
});

describe("nextScryRequest and buildScryChooser", () => {
  const filler = Array.from({ length: 12 }, (_, i) => makeCard({ name: `Filler ${i}`, points: 1 }));
  const twice = makeCard({
    name: "Double Seer",
    points: 1,
    abilities: [{ trigger: "onPlay", effects: [{ effect: "scry", amount: 2 }, { effect: "scry", amount: 1 }] }],
  });
  const state = createMatch(orderedDeck([twice, ...filler]), orderedDeck(filler), { shuffle: false, leader: "A", seed: 5 });
  const play = instanceId("A", twice);

  it("finds nothing to ask for a card without Scry", () => {
    expect(nextScryRequest(state, "A", instanceId("A", filler[0]!), [])).toBeUndefined();
  });

  it("asks each Scry in turn, then reports nothing left, and the final play matches what was shown", () => {
    const first = nextScryRequest(state, "A", play, [])!;
    expect(first.amount).toBe(2);
    const a1 = { top: [first.cards[1]!.instanceId], bottom: [first.cards[0]!.instanceId] };
    const second = nextScryRequest(state, "A", play, [a1])!;
    expect(second.amount).toBe(1);
    expect(second.cards[0]!.instanceId).toBe(first.cards[1]!.instanceId);
    const a2 = { top: [], bottom: [second.cards[0]!.instanceId] };
    expect(nextScryRequest(state, "A", play, [a1, a2])).toBeUndefined();

    const end = playTurn(state, "A", play, { chooseScry: buildScryChooser([a1, a2]) });
    const ids = end.players.A.deck.map((c) => c.instanceId);
    expect(ids[ids.length - 1]).toBe(first.cards[1]!.instanceId);
    expect(ids[ids.length - 2]).toBe(first.cards[0]!.instanceId);
  });
});

describe("Scry card text", () => {
  const card = makeCard({ name: "Hedge Witch", family: "coven", points: 2, abilities: [{ trigger: "onPlay", effects: [{ effect: "scry", amount: 2 }] }] });
  it("shows a Scry chip and an ability line", () => {
    expect(keywordChips(card.faces[0])).toContain("Scry 2");
    expect(abilityLines(card.faces[0])).toEqual(["On Play: Scry 2."]);
  });
});
