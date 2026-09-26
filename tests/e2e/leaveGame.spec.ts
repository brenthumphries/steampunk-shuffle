import { expect, test, type Page } from "@playwright/test";

// PT-33: a player had no way to exit a match in progress except finishing
// it. Adds a "Leave Game" button while a match is in progress — omitted
// entirely for the tutorial — that always confirms first (with wording
// naming the specific consequence for that match's kind) before actually
// ending the match as a loss: the same payout as a real loss for a pickup
// game, elimination from the bracket for a tournament match.

/**
 * These are real (random-shuffled, AI-timed) matches, so whoever leads
 * could open with an Instant/on-play card and hit a PT-34 "Continue" hold
 * before this test gets to click "Leave Game" — same risk match.spec.ts
 * guards against. Dismiss any such hold first rather than assuming the
 * opening move never needs one.
 */
async function clickLeaveGame(page: Page): Promise<void> {
  await expect
    .poll(async () => {
      const continueBtn = page.getByRole("button", { name: "Continue" });
      if (await continueBtn.isVisible().catch(() => false)) await continueBtn.click().catch(() => undefined);
      return page.getByRole("button", { name: "Leave Game" }).isVisible().catch(() => false);
    })
    .toBe(true);
  await page.getByRole("button", { name: "Leave Game" }).click();
}

test.describe("Leave Game (PT-33)", () => {
  test("the tutorial's match never offers a Leave Game button", async ({ page }) => {
    await page.goto("/steampunk-shuffle/");
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem("steampunk-shuffle:player", JSON.stringify({ name: "Sara", dedicationSeen: true }));
    });
    await page.reload();
    await expect(page.getByText("Round 1 of 3")).toBeVisible();
    await expect(page.getByRole("button", { name: "Leave Game" })).toHaveCount(0);
  });

  test.describe("pickup match", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/steampunk-shuffle/");
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem("steampunk-shuffle:tutorial-state", JSON.stringify({ completed: true, matchesPlayed: 0, shownHints: [] }));
        localStorage.setItem("steampunk-shuffle:player", JSON.stringify({ name: "Sara", dedicationSeen: true }));
      });
      await page.reload();
      await page.getByRole("button", { name: "Play Constable Tobias Mudd" }).click();
      await page.locator(".overlay--coin-toss button", { hasText: "Continue" }).click();
      await expect(page.getByText("Round 1 of 3")).toBeVisible();
    });

    test("Cancel returns to the match with no effect", async ({ page }) => {
      await clickLeaveGame(page);
      await expect(page.getByText("Leave the game?")).toBeVisible();
      await expect(page.getByText("Leaving now pays out the same as a loss.")).toBeVisible();

      await page.getByRole("button", { name: "Cancel" }).click();
      await expect(page.getByText("Leave the game?")).toHaveCount(0);
      await expect(page.getByText("Round 1 of 3")).toBeVisible();
      await expect(page.locator(".board-row")).toHaveCount(2); // still mid-match, nothing reset
    });

    test("Leave anyway ends the match immediately and pays out the same as a loss", async ({ page }) => {
      await clickLeaveGame(page);
      await page.getByRole("button", { name: "Leave anyway" }).click();

      // Routed straight back to the pub hub — no match-over overlay for a
      // match that was left, not finished.
      await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();

      const pubState = await page.evaluate(() => JSON.parse(localStorage.getItem("steampunk-shuffle:pub-state") ?? "{}"));
      expect(pubState.opponents.mudd.losses).toBe(1);
      expect(pubState.opponents.mudd.wins ?? 0).toBe(0);
      expect(pubState.totalWins).toBe(0);
      // LOSE_CHECKS (2) + the first-game-of-day bonus (5) — same payout a
      // real loss would pay (src/pub/pubState.ts's recordPickupResult).
      expect(pubState.checks).toBe(7);

      // Leaving the table also clears the resumable match save — reloading
      // lands back on the pub hub, not back into the match that was left.
      await page.reload();
      await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
    });
  });

  test.describe("tournament match", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/steampunk-shuffle/");
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem("steampunk-shuffle:tutorial-state", JSON.stringify({ completed: true, matchesPlayed: 0, shownHints: [] }));
        localStorage.setItem("steampunk-shuffle:player", JSON.stringify({ name: "Sara", dedicationSeen: true }));
        localStorage.setItem("steampunk-shuffle:pub-state", JSON.stringify({ checks: 100, totalWins: 0, opponents: {}, collection: [], lastDailyBonusDate: null }));
      });
      await page.reload();
      await page.getByRole("button", { name: "The chalkboard" }).click();
      await page.locator(".tournament-row").filter({ hasText: "The Tuesday Knockout" }).getByRole("button", { name: /Enter/ }).click();
      await page.getByRole("button", { name: /Play Quarterfinal/ }).click();
      await expect(page.getByText("Round 1 of 3")).toBeVisible();
    });

    test("the confirm dialog names elimination, not a plain loss", async ({ page }) => {
      await clickLeaveGame(page);
      await expect(page.getByText("Leaving now counts as a loss and eliminates you from this tournament.")).toBeVisible();
      await page.getByRole("button", { name: "Cancel" }).click();
      await expect(page.getByText("Round 1 of 3")).toBeVisible();
    });

    test("Leave anyway eliminates the player from the bracket", async ({ page }) => {
      await clickLeaveGame(page);
      await page.getByRole("button", { name: "Leave anyway" }).click();

      await expect(page.getByText("Out of The Tuesday Knockout")).toBeVisible();
      await expect(page.getByText(/Consolation: \d+ Checks\./)).toBeVisible();

      const tournamentState = await page.evaluate(() => JSON.parse(localStorage.getItem("steampunk-shuffle:tournament-state") ?? "{}"));
      expect(tournamentState.active).toBeNull();
    });
  });
});
