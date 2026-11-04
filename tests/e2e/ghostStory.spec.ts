import { expect, test, type Page } from "@playwright/test";

// A Ghost Story for Christmas on the real December pack (docs/plans/monthly/
// 02-december.md §5, §7): the Advent Cabinet and snow on Dec 3, door 25 on
// Christmas Day, and Mr Pockett in Tonight's Patrons. The dev clock is
// `?now=YYYY-MM-DD&preview=1`, never a fixed-time override.

const START = "/steampunk-shuffle/";
const URL_DEC_3 = `${START}?now=2026-12-03&preview=1`;
const URL_DEC_25 = `${START}?now=2026-12-25&preview=1`;

async function seedReturningPlayer(page: Page, totalWins = 3): Promise<void> {
  await page.goto(START);
  await page.evaluate((wins) => {
    localStorage.clear();
    localStorage.setItem("steampunk-shuffle:tutorial-state", JSON.stringify({ completed: true, matchesPlayed: 5, shownHints: ["hub"] }));
    localStorage.setItem("steampunk-shuffle:player", JSON.stringify({ name: "Sara", dedicationSeen: true }));
    localStorage.setItem(
      "steampunk-shuffle:pub-state",
      JSON.stringify({
        checks: 0,
        totalWins: wins,
        opponents: {},
        collection: [],
        lastDailyBonusDate: null,
        giftsClaimed: { "ghost-story": { "2026": ["salt-on-the-step", "almanack-seller"] } },
        bannersSeen: { "ghost-story": [2026] },
      }),
    );
  }, totalWins);
}

test("Dec 3: the cabinet and snow are up; doors 1-3 open, door 4 stays shut", async ({ page }) => {
  await seedReturningPlayer(page);
  await page.goto(URL_DEC_3);
  await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
  await expect(page.locator(".hub-snowflake").first()).toBeVisible();

  await page.locator(".hub-advent").click();
  await expect(page.getByRole("heading", { name: "The Advent Cabinet" })).toBeVisible();
  for (const door of [1, 2, 3]) await expect(page.locator(`.advent-door[data-door="${door}"]`)).toBeEnabled();
  await expect(page.locator('.advent-door[data-door="4"]')).toBeDisabled();
  await expect(page.locator('.advent-door[data-door="25"]')).toBeDisabled();
});

test("Dec 25: door 25 opens with the foil of Bramwell and its beer mat", async ({ page }) => {
  await seedReturningPlayer(page);
  await page.goto(URL_DEC_25);
  await page.locator(".hub-advent").click();
  await expect(page.locator('.advent-door[data-door="25"]')).toBeEnabled();
  await page.locator('.advent-door[data-door="25"]').click();
  // The foil is a card, so its unwrap comes first; the beer mat follows the Collect.
  await page.getByRole("button", { name: "Collect", exact: true }).click();
  await expect(page.locator(".beer-mat-text")).toContainText("They didn't wrap it.");
  await page.locator(".beer-mat-dismiss").click();
  await expect(page.locator('.advent-door[data-door="25"]')).toBeDisabled();
});

test("Dec 1 with 3 wins: Mr Pockett is in Tonight's Patrons", async ({ page }) => {
  await seedReturningPlayer(page);
  await page.goto(`${START}?now=2026-12-01&preview=1`);
  await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
  await expect(page.getByText("Mr Pockett, Toymaker", { exact: true })).toBeVisible();
});
