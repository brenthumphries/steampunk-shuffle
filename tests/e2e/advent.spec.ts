import { expect, test, type Page } from "@playwright/test";

// The Advent Cabinet and snowfall (design.md §17.3). There is no December pack
// in this step, so the test-only pack (src/events/packs/testPack.ts: Jan 10-12,
// three doors opening Jan 10, 11 and 12, weather "snow") stands in for it,
// joined by `?testpack=1` with the dev-clock gate. On Jan 11 doors 1 and 2 are
// openable and door 3 is shut: the same shape as "Dec 3 opens 1-3, door 4 shut".

const START = "/steampunk-shuffle/";
const URL_JAN_11 = `${START}?now=2027-01-11&preview=1&testpack=1`;

async function seedReturningPlayer(page: Page): Promise<void> {
  await page.goto(START);
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("steampunk-shuffle:tutorial-state", JSON.stringify({ completed: true, matchesPlayed: 5, shownHints: ["hub"] }));
    localStorage.setItem("steampunk-shuffle:player", JSON.stringify({ name: "Sara", dedicationSeen: true }));
    localStorage.setItem(
      "steampunk-shuffle:pub-state",
      JSON.stringify({
        checks: 0,
        totalWins: 0,
        opponents: {},
        collection: [],
        lastDailyBonusDate: null,
        giftsClaimed: { "test-pack": { "2027": ["welcome", "later"] } },
        bannersSeen: { "test-pack": [2027] },
      }),
    );
  });
}

test("the hub shows the cabinet; opening doors 1 and 2 pays out once, door 3 stays shut", async ({ page }) => {
  await seedReturningPlayer(page);
  await page.goto(URL_JAN_11);
  await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
  await expect(page.locator(".checks-badge-value")).toHaveText("0");

  await page.locator(".hub-advent").click();
  await expect(page.getByRole("heading", { name: "The Advent Cabinet" })).toBeVisible();
  await expect(page.locator('.advent-door[data-door="1"]')).toBeEnabled();
  await expect(page.locator('.advent-door[data-door="2"]')).toBeEnabled();
  await expect(page.locator('.advent-door[data-door="3"]')).toBeDisabled();

  await page.locator('.advent-door[data-door="1"]').click();
  await expect(page.locator(".beer-mat-text")).toHaveText("10 Checks");
  await page.locator(".beer-mat-dismiss").click();
  await page.locator('.advent-door[data-door="2"]').click();
  await expect(page.locator(".beer-mat-text")).toContainText("Test pack door two.");
  await page.locator(".beer-mat-dismiss").click();

  await expect(page.locator('.advent-door[data-door="1"]')).toBeDisabled();
  await expect(page.locator('.advent-door[data-door="1"] .advent-door-reward')).toHaveText("10 Checks");
  await expect(page.locator('.advent-door[data-door="3"]')).toBeDisabled();

  // Persisted: back at the bar, 25 Checks, and a reload keeps the doors open.
  await page.getByRole("button", { name: "Back to the bar" }).click();
  await expect(page.locator(".checks-badge-value")).toHaveText("25");
  await page.goto(URL_JAN_11);
  await page.locator(".hub-advent").click();
  await expect(page.locator('.advent-door[data-door="2"]')).toBeDisabled();
  await expect(page.locator(".advent-door--openable")).toHaveCount(0);
});

test("snow falls over the window strip without catching taps; Reduce Motion shows frost instead", async ({ page }) => {
  await seedReturningPlayer(page);
  await page.goto(URL_JAN_11);
  await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
  await expect(page.locator(".hub-snow")).toHaveCSS("pointer-events", "none");
  await expect(page.locator(".hub-snowflake").first()).toBeVisible();
  await expect(page.locator(".hub-frost")).toBeHidden();

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".hub-snowflake").first()).toBeHidden();
  await expect(page.locator(".hub-frost")).toBeVisible();
});

test("without the test pack there is no cabinet and no snow", async ({ page }) => {
  await seedReturningPlayer(page);
  await page.goto(`${START}?now=2027-01-11&preview=1`);
  await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
  await expect(page.locator(".hub-advent")).toHaveCount(0);
  await expect(page.locator(".hub-snow")).toHaveCount(0);
});
