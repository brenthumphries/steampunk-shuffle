import { expect, test } from "@playwright/test";
import { ALL_CARDS } from "../../src/cards/data/index.ts";
import type { MatchState } from "../../src/engine/matchEngine.ts";

// PT-35: Séance's targets are the player's own face-down cards, and a
// face-down card used to be built without its tap handler or highlight, so
// with two or more to choose from the player could neither pick one nor
// reach the Play button.

const seance = ALL_CARDS.find((c) => c.id === "seance")!;
const constable = ALL_CARDS.find((c) => c.id === "constable-on-the-beat")!;

function buildMatchState(): MatchState {
  return {
    players: {
      A: {
        id: "A",
        deck: [],
        hand: [{ instanceId: "human-hand-1", card: seance }],
        board: [
          { instanceId: "human-board-1", card: constable, faceIndex: 0, faceUp: false, bonusPoints: 0 },
          { instanceId: "human-board-2", card: constable, faceIndex: 0, faceUp: false, bonusPoints: 0 },
        ],
        discard: [],
      },
      B: { id: "B", deck: [], hand: [], board: [], discard: [] },
    },
    location: undefined,
    neutralDiscard: [],
    round: 1,
    leader: "A",
    turnsPlayedThisRound: 0,
    roundsWon: { A: 0, B: 0 },
    roundHistory: [],
    status: "in-progress",
    rngSeed: 1,
  };
}

test.describe("match screen: choosing a face-down card to turn face-up (PT-35)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/steampunk-shuffle/");
    const matchState = buildMatchState();
    await page.evaluate(
      ({ matchState }) => {
        localStorage.clear();
        localStorage.setItem("steampunk-shuffle:tutorial-state", JSON.stringify({ completed: true, matchesPlayed: 0, shownHints: [] }));
        localStorage.setItem("steampunk-shuffle:player", JSON.stringify({ name: "Sara", dedicationSeen: true }));
        localStorage.setItem(
          "steampunk-shuffle:active-match",
          JSON.stringify({
            matchState,
            aiSeed: 1,
            humanDeck: [{ card: matchState.players.A.hand[0].card, quantity: 2 }],
            humanDeckName: "Test Deck",
            context: { kind: "pickup", opponentId: "mudd", stakedCardId: null },
          }),
        );
      },
      { matchState },
    );
    await page.reload();
  });

  test("Séance: tapping a face-down card selects it, Play appears, and it turns face-up", async ({ page }) => {
    await page.locator(".hand-row .card--tappable").first().click();
    await expect(page.getByText(/Choose one card to turn face-up/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Play", exact: true })).toHaveCount(0);

    const own = page.locator(".board-row .card--facedown.card--highlight");
    await expect(own).toHaveCount(2);
    await own.nth(1).click();
    await expect(page.locator(".board-row .card--selected")).toHaveCount(1);

    await page.getByRole("button", { name: "Play", exact: true }).click();
    await expect(page.locator(".board-row .card--facedown")).toHaveCount(1);
  });
});
