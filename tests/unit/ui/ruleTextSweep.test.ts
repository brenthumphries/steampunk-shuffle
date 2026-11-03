import { describe, expect, it } from "vitest";

import { ACQUIRABLE_CARDS_BY_ID } from "../../../src/pub/acquirableCards.ts";
import { abilityLines, keywordChips } from "../../../src/ui/cardText.ts";
import { EVERY_BOARD_CARD } from "../../../src/cards/data/almanack.ts";

function renderedText(id: string): string {
  const card = ACQUIRABLE_CARDS_BY_ID.get(id);
  if (!card) throw new Error(`unknown card ${id}`);
  return card.faces.flatMap((face) => [...keywordChips(face), ...abilityLines(face)]).join("\n");
}

describe("rendered rules text of every acquirable card", () => {
  for (const [id] of ACQUIRABLE_CARDS_BY_ID) {
    it(`${id} has no sign doubling or leaked sentinel numbers`, () => {
      const text = renderedText(id);
      expect(text).not.toContain("+-");
      expect(text).not.toContain("--");
      expect(text).not.toMatch(/\b(40|99|999)\b/);
      expect(text).not.toMatch(new RegExp(`\\b${EVERY_BOARD_CARD}\\b`));
      expect(text).not.toMatch(/\bNaN\b|undefined/);
    });
  }

  it("prints a negative buff as -N", () => {
    expect(renderedText("cunning-woman")).toContain("-1");
    expect(renderedText("cunning-woman")).not.toContain("+-");
  });

  it("matches the printed November text", () => {
    expect(renderedText("almanack-scorpio")).toBe("On Play: Turn each face-down card face-up.");
    expect(renderedText("remember-remember")).toBe("On Play: Flip each face-up card worth 1 or less.");
  });
});

describe("November card text matches 01-november.md", () => {
  it.each([
    ["cunning-woman", "On Play: Give an opposing face-up card -1."],
    ["mother-red-cap", "On Play: Give an opposing face-up card -2. Flip an opposing card worth 1 or less."],
    ["almanack-sagittarius", "On Play: Draw 1. Give your face-up highest-point card +1."],
    ["the-petrifying-well", "Give each face-up Gadget card +1."],
    ["john-dee", "On Play: Reveal your opponent's hand. Scry 2."],
  ])("%s", (id, expected) => {
    expect(renderedText(id).split("\n").filter((l) => !/^(Scry \d|Persist|Elusive|Friend)/.test(l)).join(" ")).toBe(expected);
  });
});
