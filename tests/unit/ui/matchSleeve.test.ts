// The match screen's card backs (design.md §17.5): the player's face-down cards
// wear their deck's sleeve, the opponent's always wear the default, and a
// sleeve whose image is missing falls back to the default art.

import { afterEach, describe, expect, it } from "vitest";

import { starterDeck } from "../../../src/cards/data/decks/starterDeck.ts";
import { DEFAULT_SLEEVE, type Sleeve } from "../../../src/cosmetics/sleeves.ts";
import { createMatch } from "../../../src/engine/matchEngine.ts";
import { mountMatchScreen } from "../../../src/ui/matchScreen.ts";

const NIGHT: Sleeve = { id: "sleeve-night", name: "Night", artId: "sleeve-night", source: { kind: "event", eventId: "x" } };

let teardown: (() => void) | undefined;
afterEach(() => teardown?.());

function mountWithFaceDownCards(humanSleeve?: Sleeve): HTMLElement {
  const root = document.createElement("div");
  document.body.appendChild(root);
  const state = createMatch(starterDeck, starterDeck, { seed: 3 });
  const [mine, theirs] = [state.players.A.hand[0]!, state.players.B.hand[0]!];
  state.players.A.board.push({ instanceId: "mine", card: mine.card, faceIndex: 0, faceUp: false, bonusPoints: 0 });
  state.players.B.board.push({ instanceId: "theirs", card: theirs.card, faceIndex: 0, faceUp: false, bonusPoints: 0 });
  teardown = mountMatchScreen(root, {
    humanDeck: starterDeck,
    humanSleeve,
    aiDeck: starterDeck,
    aiName: "Test",
    difficulty: "regular",
    initialState: { state, aiSeed: 1 },
    onExit: () => {},
  });
  return root;
}

const backOf = (root: HTMLElement, instanceId: string) => root.querySelector<HTMLElement>(`.card--facedown[data-instance-id="${instanceId}"]`)!;

describe("card backs in a match", () => {
  it("the default sleeve is today's card back", () => {
    const root = mountWithFaceDownCards();
    const mine = backOf(root, "mine");
    expect(mine.dataset.sleeve).toBe(DEFAULT_SLEEVE.id);
    expect(mine.querySelector("img")!.getAttribute("src")).toMatch(/art\/card-back\.webp$/);
  });

  it("the player's face-down cards wear their sleeve; the opponent's wear the default", () => {
    const root = mountWithFaceDownCards(NIGHT);
    expect(backOf(root, "mine").dataset.sleeve).toBe("sleeve-night");
    expect(backOf(root, "mine").querySelector("img")!.getAttribute("src")).toMatch(/art\/sleeve-night\.webp$/);
    expect(backOf(root, "theirs").dataset.sleeve).toBe(DEFAULT_SLEEVE.id);
    expect(backOf(root, "theirs").querySelector("img")!.getAttribute("src")).toMatch(/art\/card-back\.webp$/);
  });

  it("a sleeve image that fails to load falls back to the default art", () => {
    const root = mountWithFaceDownCards(NIGHT);
    const img = backOf(root, "mine").querySelector("img")!;
    img.dispatchEvent(new Event("error"));
    expect(img.getAttribute("src")).toMatch(/art\/card-back\.webp$/);
  });
});
