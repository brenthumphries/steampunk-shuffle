import { expect, test } from "@playwright/test";

// Plan step 2.7's exit check: "a newcomer tester finishes without reading
// anything external." Playing the whole forced 18-turn script end to end is
// covered deterministically by tests/unit/tutorial/tutorialScript.test.ts
// (the real engine, no timers) — these smoke tests instead cover the UI
// shell around it: a fresh player actually lands here, the intro beer mats
// gate the first move, only the scripted card is tappable, and the score
// updates exactly as the script says once it's played.

test.describe("dedication screen (plan step 3.5, design.md §14.1)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/steampunk-shuffle/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("a truly fresh install sees the dedication screen before the tutorial", async ({ page }) => {
    await expect(page.getByText("Licensed to")).toBeVisible();
    await expect(page.getByText("Happy birthday. — B.")).toBeVisible();
    await expect(page.getByText("Round 1 of 3")).toHaveCount(0);

    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("You're expected. Your chair's by the fire.")).toBeVisible();

    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Round 1 of 3")).toBeVisible();
  });

  test("a returning player (dedication already seen) skips straight to the tutorial", async ({ page }) => {
    await page.evaluate(() => localStorage.setItem("steampunk-shuffle:player", JSON.stringify({ name: "Sara", dedicationSeen: true })));
    await page.reload();
    await expect(page.getByText("Round 1 of 3")).toBeVisible();
    await expect(page.getByText("Licensed to")).toHaveCount(0);
  });
});

test.describe("tutorial (plan step 2.7, design.md §13)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/steampunk-shuffle/");
    await page.evaluate(() => {
      localStorage.clear();
      // The dedication screen (design.md §14.1, plan step 3.5) is covered by
      // its own describe block above — seed it already seen so these tests
      // still land straight in the tutorial.
      localStorage.setItem("steampunk-shuffle:player", JSON.stringify({ name: "Sara", dedicationSeen: true }));
    });
    await page.reload();
  });

  test("a fresh player is dealt straight into the tutorial against Sir Charles", async ({ page }) => {
    await expect(page.getByText("Round 1 of 3")).toBeVisible();
    await expect(page.locator(".side-name").first()).toHaveText("Sir Charles");
    await expect(page.locator(".beer-mat-text").first()).toContainText("Evening. I'm Wheatstone.");
  });

  test("dismissing both intro beer mats reveals only the scripted card as tappable", async ({ page }) => {
    await page.locator(".beer-mat-dismiss").click();
    await expect(page.locator(".beer-mat-text")).toContainText("Best of three rounds.");
    await page.locator(".beer-mat-dismiss").click();
    await expect(page.locator(".beer-mat")).toHaveCount(0);

    // Sir Charles opens (design.md §13.1: "the house always leads"); once
    // it's the player's turn, exactly one hand card is tappable.
    await expect(page.getByText("Play this one: Constable on the Beat.")).toBeVisible({ timeout: 10_000 });
    await expect(page.locator(".hand-row .card--tappable")).toHaveCount(1);
    await expect(page.locator(".hand-row .card--tappable .card-name")).toHaveText("Constable on the Beat");
  });

  test("playing the scripted card commits it and shows Sir Charles's beer mat", async ({ page }) => {
    await page.locator(".beer-mat-dismiss").click();
    await page.locator(".beer-mat-dismiss").click();

    const scriptedCard = page.locator(".hand-row .card--tappable");
    await expect(scriptedCard).toHaveCount(1, { timeout: 10_000 });
    await scriptedCard.click();
    await expect(page.locator(".board-row .card").first()).toBeVisible();
    await expect(page.locator(".beer-mat-text")).toContainText("Three beats two.");
    await expect(page.locator(".side-score").last()).toHaveText("Your score: 3");
  });
});
