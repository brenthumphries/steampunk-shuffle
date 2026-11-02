import { expect, test, type Page } from "@playwright/test";

// The Cunning Folk (November, docs/plans/monthly/01-november.md §6): with the
// dev clock (`?now=YYYY-MM-DD&preview=1`, a production build ignores it
// without preview=1), the visitors arrive on Nov 13, Pixie is never in
// Tonight's Patrons, Mother Red Cap stays tournament-only, and the Almanack
// Stakes sit on the chalkboard from Nov 20.

const START = "/steampunk-shuffle/";

async function openHubOn(page: Page, date: string, totalWins: number, checks = 100): Promise<void> {
  await page.goto(START);
  await page.evaluate(
    ({ wins, checks: c }) => {
      localStorage.clear();
      localStorage.setItem("steampunk-shuffle:tutorial-state", JSON.stringify({ completed: true, matchesPlayed: 0, shownHints: [] }));
      localStorage.setItem("steampunk-shuffle:player", JSON.stringify({ name: "Sara", dedicationSeen: true }));
      localStorage.setItem("steampunk-shuffle:pub-state", JSON.stringify({ checks: c, totalWins: wins, opponents: {}, collection: [], lastDailyBonusDate: null, giftsClaimed: { "cunning-folk": { "2026": ["left-on-the-step", "cunning-woman", "almanack-seller"] } }, bannersSeen: { "cunning-folk": [2026] } }));
    },
    { wins: totalWins, checks },
  );
  await page.goto(`${START}?now=${date}&preview=1`);
  await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
}

test.describe("the Cunning Folk: November", () => {
  test("Nov 12: no November visitors in the pub yet", async ({ page }) => {
    await openHubOn(page, "2026-11-12", 3);
    await expect(page.getByText("Mother Shipton", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Dr John Dee", { exact: true })).toHaveCount(0);
  });

  test("Nov 13 with 3+ wins: Shipton and Dee are in, and Pixie is not in Tonight's Patrons", async ({ page }) => {
    await openHubOn(page, "2026-11-13", 3);
    await expect(page.getByText("Mother Shipton", { exact: true })).toBeVisible();
    await expect(page.getByText("Dr John Dee", { exact: true })).toBeVisible();
    await expect(page.getByText("Pamela Colman Smith", { exact: true })).toHaveCount(0);
  });

  test("Dec 1: the visitors have gone", async ({ page }) => {
    await openHubOn(page, "2026-12-01", 30);
    await expect(page.getByText("Mother Shipton", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Mother Red Cap", { exact: true })).toHaveCount(0);
  });

  test("Nov 20 with 3+ wins: the Almanack Stakes are on the chalkboard, and the starter deck is refused for lack of Coven cards", async ({ page }) => {
    await openHubOn(page, "2026-11-20", 3);
    await page.getByRole("button", { name: "The chalkboard" }).click();
    await expect(page.getByText("The Chalkboard")).toBeVisible();
    const row = page.locator(".tournament-row").filter({ hasText: "The Almanack Stakes" });
    await expect(row.getByRole("button", { name: /Enter \(13 Checks\)/ })).toBeDisabled();
    await expect(row).toContainText("The Almanack Stakes needs at least 2 Coven cards in the deck.");
    await expect(row).toContainText("Mother Red Cap");
    await expect(row).toContainText("The Petrifying Well");
  });

  test("Nov 19: the Almanack Stakes are still locked", async ({ page }) => {
    await openHubOn(page, "2026-11-19", 3);
    await page.getByRole("button", { name: "The chalkboard" }).click();
    const row = page.locator(".tournament-row").filter({ hasText: "The Almanack Stakes" });
    await expect(row.getByRole("button", { name: "Locked" })).toBeVisible();
  });
});
