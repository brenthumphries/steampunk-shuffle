import { expect, test } from "@playwright/test";

// Plan step 2.5's exit check: "each path yields cards." Lost & Found's
// claim and the Pawnbroker's rotating window don't need a played match to
// exercise (they're seeded straight from a fresh save's state), so those
// two are covered end-to-end here. Bar Bet and Tinker's Bench both need a
// collection that only exists after real matches/fusions — those were
// manually verified in the browser instead, same reasoning as
// tests/e2e/pubHub.spec.ts's reward-reveal flow.

test.describe("the back room (plan step 2.5)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/steampunk-shuffle/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("Lost & Found can be claimed once, then shows claimed", async ({ page }) => {
    await page.getByRole("button", { name: "The back room" }).click();
    await expect(page.getByText("The Back Room")).toBeVisible();

    const claimBtn = page.getByRole("button", { name: "Take it" });
    await expect(claimBtn).toBeEnabled();
    await claimBtn.click();

    await expect(page.getByText("New card!")).toBeVisible();
    await page.getByRole("button", { name: "Collect" }).click();

    await expect(page.getByRole("button", { name: "Claimed today" })).toBeDisabled();
  });

  test("the Pawnbroker shows three priced cards", async ({ page }) => {
    await page.getByRole("button", { name: "The back room" }).click();
    await expect(page.getByText("The Pawnbroker")).toBeVisible();
    await expect(page.getByRole("button", { name: /Take my Checks/ })).toHaveCount(3);
  });

  test("Tinker's Bench is locked before 3 wins", async ({ page }) => {
    await page.getByRole("button", { name: "The back room" }).click();
    await expect(page.getByText("Unlocks at 3 wins.")).toBeVisible();
  });

  test("back button returns to the pub hub", async ({ page }) => {
    await page.getByRole("button", { name: "The back room" }).click();
    await page.getByRole("button", { name: "Back to the bar" }).click();
    await expect(page.getByText("Tonight's patrons")).toBeVisible();
  });
});
