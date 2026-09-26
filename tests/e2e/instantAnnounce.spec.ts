import { expect, test } from "@playwright/test";
import { ALL_CARDS } from "../../src/cards/data/index.ts";
import type { MatchState } from "../../src/engine/matchEngine.ts";

// Bugfix cluster E (note #6), extended by PT-34: a Scheme/Headline
// ("Instant") card resolves its On Play and discards in the same atomic
// playTurn() call, so a tester watching the AI play one couldn't read what
// it said before it was gone. matchScreen.ts holds on an "instant-announce"
// overlay naming the card for INSTANT_ANNOUNCE_MS, then — since even that
// fixed hold was still "a little too fast" per PT-34's playtest note —
// shows a "Continue" button the player must tap themselves rather than
// auto-advancing, so they can take as long as they need. This test forces
// a deterministic scenario (a resumed match whose only legal AI move is a
// Scheme) via the active-match save format, rather than hoping a real
// random-shuffled match happens to draw one.

const inspectorsWarrant = ALL_CARDS.find((c) => c.id === "inspectors-warrant")!;
const constableOnTheBeat = ALL_CARDS.find((c) => c.id === "constable-on-the-beat")!;

function buildForcedInstantMatchState(): MatchState {
  return {
    players: {
      A: {
        id: "A",
        deck: [],
        hand: [{ instanceId: "human-hand-1", card: constableOnTheBeat }],
        board: [{ instanceId: "human-board-1", card: constableOnTheBeat, faceIndex: 0, faceUp: true, bonusPoints: 0 }],
        discard: [],
      },
      B: {
        id: "B",
        deck: [],
        hand: [{ instanceId: "ai-hand-1", card: inspectorsWarrant }],
        board: [],
        discard: [],
      },
    },
    location: undefined,
    neutralDiscard: [],
    round: 1,
    // Leader plays on even turn indices — B leads, so it's forced to play
    // its one card (Inspector's Warrant) as the very first turn.
    leader: "B",
    turnsPlayedThisRound: 0,
    roundsWon: { A: 0, B: 0 },
    roundHistory: [],
    status: "in-progress",
    rngSeed: 1,
  };
}

test.describe("match screen: instant-card announce (bugfix cluster E)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/steampunk-shuffle/");
    const matchState = buildForcedInstantMatchState();
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

  test("note #6 / PT-34: the opponent's Scheme is announced, held legibly, and waits for the player to continue", async ({ page }) => {
    const overlay = page.locator(".overlay--instant-announce");
    await expect(overlay).toBeVisible({ timeout: 5000 });
    await expect(overlay.getByText("Inspector's Warrant")).toBeVisible();
    await expect(overlay.getByText(/Flip an opposing card/)).toBeVisible();

    // Held legibly for a real beat, not gone within a frame or two, and no
    // "Continue" button yet — the player can't rush past it before it's
    // had its minimum time on screen.
    await page.waitForTimeout(600);
    await expect(overlay).toBeVisible();
    const continueBtn = overlay.getByRole("button", { name: "Continue" });
    await expect(continueBtn).toHaveCount(0);

    // PT-34: once that minimum hold elapses, it waits indefinitely for an
    // explicit tap rather than auto-advancing — still visible well past
    // the old fixed-timer window.
    await expect(continueBtn).toBeVisible({ timeout: 3000 });
    await page.waitForTimeout(1000);
    await expect(overlay).toBeVisible();

    await continueBtn.click();
    await expect(overlay).toHaveCount(0);
    await expect(page.getByText("Your turn")).toBeVisible();

    // The effect actually resolved: Constable on the Beat (3 pts, ≤3) was
    // flipped face-down — the announce is a UI hold, not a change to what
    // the card actually did.
    const boardCard = page.locator(".board-row .card").first();
    await expect(boardCard).toHaveClass(/card--facedown/);
  });
});
