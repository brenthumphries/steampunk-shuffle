import { existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { Card } from "../../../src/cards/cardTypes";
import { ACQUIRABLE_CARDS_BY_ID } from "../../../src/pub/acquirableCards";
import { OPPONENTS } from "../../../src/pub/opponents";
import { HALLOWEEN } from "../../../src/events/seasonalEvents";
import { TUTORIAL_HOUSE_DECK, TUTORIAL_PLAYER_DECK } from "../../../src/tutorial/tutorialScript";

// Pre-TestFlight content checks (ATT-26): every piece of art the game asks
// for is a file in public/art/, and the shipped assets stay inside the
// budget. The browser requests `${BASE_URL}art/<id>.webp` for each id.

const PUBLIC = resolve(__dirname, "../../../public");
const ART = join(PUBLIC, "art");

/** Ids that are known not to have a file yet, each with the PLAYTEST.md item that tracks it. When one gets art, this test fails until it is removed from here. */
const KNOWN_MISSING: Record<string, string> = {
  "desk-sergeant": "PT-37",
};

const hasArt = (id: string): boolean => existsSync(join(ART, `${id}.webp`));

function allCards(): Card[] {
  const cards = new Map<string, Card>();
  for (const card of ACQUIRABLE_CARDS_BY_ID.values()) cards.set(card.id, card);
  for (const opponent of OPPONENTS) for (const entry of opponent.deck) cards.set(entry.card.id, entry.card);
  for (const entry of [...TUTORIAL_PLAYER_DECK, ...TUTORIAL_HOUSE_DECK]) cards.set(entry.card.id, entry.card);
  return [...cards.values()];
}

describe("card art", () => {
  it("every face of every card the game can show has a file in public/art, apart from the tracked gaps", () => {
    const missing: string[] = [];
    for (const card of allCards()) {
      for (const face of card.faces) {
        if (!hasArt(face.artId) && !(face.artId in KNOWN_MISSING)) missing.push(`${card.id} (${face.artId})`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("the tracked gaps are still gaps (remove the entry when the art lands)", () => {
    for (const id of Object.keys(KNOWN_MISSING)) expect(hasArt(id), `${id} now has art; drop it from KNOWN_MISSING`).toBe(false);
    const referenced = new Set(allCards().flatMap((card) => card.faces.map((face) => face.artId)));
    for (const id of Object.keys(KNOWN_MISSING)) expect(referenced.has(id), `${id} is no longer used by any card`).toBe(true);
  });

  it("every seasonal-event card has art (no gaps are allowed for the Hallowe'en set)", () => {
    for (const id of HALLOWEEN.cardPool) {
      const card = ACQUIRABLE_CARDS_BY_ID.get(id);
      expect(card, `${id} resolves to a card`).toBeDefined();
      for (const face of card!.faces) expect(hasArt(face.artId), `${id}: ${face.artId}`).toBe(true);
    }
    for (const visitor of HALLOWEEN.visitors) {
      const opponent = OPPONENTS.find((o) => o.id === visitor.opponentId);
      expect(opponent, visitor.opponentId).toBeDefined();
      const reward = ACQUIRABLE_CARDS_BY_ID.get(opponent!.rewardCardId ?? "");
      expect(reward, `${visitor.opponentId} reward card`).toBeDefined();
      for (const face of reward!.faces) expect(hasArt(face.artId), `${reward!.id}: ${face.artId}`).toBe(true);
    }
  });
});

describe("opponent and scene art", () => {
  it("every opponent with a portraitArtId has that file", () => {
    const missing = OPPONENTS.filter((o) => o.portraitArtId && !hasArt(o.portraitArtId)).map((o) => `${o.id} (${o.portraitArtId})`);
    expect(missing).toEqual([]);
  });

  it("every backdrop and fixed image the screens name has a file", () => {
    const ids = ["card-back", "background-the-taproom", HALLOWEEN.dressing.taproomArtId!, "background-the-back-parlour", "background-the-snug", "the-landlady", "portrait-sir-charles-wheatstone"];
    for (const id of ids) expect(hasArt(id), id).toBe(true);
  });
});

describe("asset budget", () => {
  function sizeOf(dir: string): number {
    return readdirSync(dir, { withFileTypes: true }).reduce((sum, entry) => {
      const path = join(dir, entry.name);
      return sum + (entry.isDirectory() ? sizeOf(path) : statSync(path).size);
    }, 0);
  }

  it("everything under public/ stays within the 25 MB budget (steampunk-shuffle-plan.md step 3.6)", () => {
    const budget = 25 * 1024 * 1024;
    expect(sizeOf(PUBLIC)).toBeLessThan(budget);
  });
});
