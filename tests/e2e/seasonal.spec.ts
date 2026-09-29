import { expect, test, type Page } from "@playwright/test";

// Seasonal events (seasonal-events-plan.md §5): with the dev clock set by
// `?now=YYYY-MM-DD&preview=1` (the e2e server is a production build, where
// `?now=` is ignored without `preview=1`), the right visitors, hint and
// dressing appear or disappear around the Hallowe'en window (Oct 1 - Oct 31).

const START = "/steampunk-shuffle/";

async function openHubOn(page: Page, date: string, totalWins: number): Promise<void> {
  await page.goto(START);
  await page.evaluate((wins) => {
    localStorage.clear();
    localStorage.setItem("steampunk-shuffle:tutorial-state", JSON.stringify({ completed: true, matchesPlayed: 0, shownHints: [] }));
    localStorage.setItem("steampunk-shuffle:player", JSON.stringify({ name: "Sara", dedicationSeen: true }));
    localStorage.setItem("steampunk-shuffle:pub-state", JSON.stringify({ checks: 0, totalWins: wins, opponents: {}, collection: [], lastDailyBonusDate: null }));
  }, totalWins);
  await page.goto(`${START}?now=${date}&preview=1`);
  await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
}

async function sceneBackground(page: Page): Promise<string> {
  return page.locator(".pub-hub").evaluate((el) => (el as HTMLElement).style.getPropertyValue("--scene-bg"));
}

test.describe("seasonal events: Hallowe'en at the Bridge", () => {
  test("Sep 30: no visitors, and the everyday taproom", async ({ page }) => {
    await openHubOn(page, "2026-09-30", 10);
    await expect(page.getByText("Mr Griffin, the Unseen")).toHaveCount(0);
    await expect(page.getByText("The Clockwork Pharaoh")).toHaveCount(0);
    await expect(page.locator(".patron-notice")).toHaveCount(0);
    expect(await sceneBackground(page)).toContain("background-the-taproom.webp");
  });

  test("Oct 1 with 3+ wins: Wave 1's visitors are in, the taproom is redressed", async ({ page }) => {
    await openHubOn(page, "2026-10-01", 3);
    await expect(page.getByText("Mr Griffin, the Unseen", { exact: true })).toBeVisible();
    await expect(page.getByText("The Clockwork Pharaoh", { exact: true })).toBeVisible();
    await expect(page.locator(".patron-tier--visitor")).toHaveCount(2);
    await expect(page.locator(".patron-notice")).toHaveCount(0);
    await expect.poll(() => sceneBackground(page)).toContain("background-the-taproom-halloween.webp");
  });

  test("Oct 1 with fewer than 3 wins: Sir Charles hints instead of introducing anyone", async ({ page }) => {
    await openHubOn(page, "2026-10-01", 2);
    await expect(page.locator(".patron-notice")).toContainText("Odd folk on the cellar stairs");
    await expect(page.getByText("Mr Griffin, the Unseen")).toHaveCount(0);
  });

  test("Oct 31 still has them; Nov 1 they're gone and the pub is back to normal", async ({ page }) => {
    await openHubOn(page, "2026-10-31", 3);
    await expect(page.getByText("Mr Griffin, the Unseen", { exact: true })).toBeVisible();

    await openHubOn(page, "2026-11-01", 30);
    await expect(page.getByText("Mr Griffin, the Unseen")).toHaveCount(0);
    await expect(page.locator(".patron-notice")).toHaveCount(0);
    expect(await sceneBackground(page)).toContain("background-the-taproom.webp");
  });

  test("a visitor can be played: tapping Mr Griffin starts a match against him", async ({ page }) => {
    await openHubOn(page, "2026-10-01", 3);
    await page.getByRole("button", { name: "Play Mr Griffin, the Unseen" }).click();
    await expect(page.getByText("Round 1 of 3")).toBeVisible();
    await expect(page.locator(".side-name").first()).toHaveText("Mr Griffin, the Unseen");
  });

  test("the dev clock is ignored in a production build without preview=1", async ({ page }) => {
    test.skip(new Date().getMonth() === 9, "the real date is inside the Hallowe'en window, so this can't tell the override apart from real time");
    await page.goto(START);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem("steampunk-shuffle:tutorial-state", JSON.stringify({ completed: true, matchesPlayed: 0, shownHints: [] }));
      localStorage.setItem("steampunk-shuffle:player", JSON.stringify({ name: "Sara", dedicationSeen: true }));
      localStorage.setItem("steampunk-shuffle:pub-state", JSON.stringify({ checks: 0, totalWins: 3, opponents: {}, collection: [], lastDailyBonusDate: null }));
    });
    await page.goto(`${START}?now=2026-10-01`);
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
    await expect(page.getByText("Mr Griffin, the Unseen")).toHaveCount(0);
  });
});

// The All Hallows' Wake (seasonal-events-plan.md §3.3): Oct 22 - Oct 31, 3+ wins.
test.describe("seasonal events: The All Hallows' Wake", () => {
  async function openChalkboardOn(page: Page, date: string, totalWins: number, checks: number): Promise<void> {
    await openHubOnWithChecks(page, date, totalWins, checks);
    await page.getByRole("button", { name: "The chalkboard" }).click();
    await expect(page.getByText("The Chalkboard")).toBeVisible();
  }

  async function openHubOnWithChecks(page: Page, date: string, totalWins: number, checks: number): Promise<void> {
    await page.goto(START);
    await page.evaluate(
      ({ wins, checks: c }) => {
        localStorage.clear();
        localStorage.setItem("steampunk-shuffle:tutorial-state", JSON.stringify({ completed: true, matchesPlayed: 0, shownHints: [] }));
        localStorage.setItem("steampunk-shuffle:player", JSON.stringify({ name: "Sara", dedicationSeen: true }));
        localStorage.setItem("steampunk-shuffle:pub-state", JSON.stringify({ checks: c, totalWins: wins, opponents: {}, collection: [], lastDailyBonusDate: null }));
      },
      { wins: totalWins, checks },
    );
    await page.goto(`${START}?now=${date}&preview=1`);
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
  }

  const wakeRow = (page: Page) => page.locator(".tournament-row").filter({ hasText: "The All Hallows' Wake" });

  test("Oct 21: listed but still locked", async ({ page }) => {
    await openChalkboardOn(page, "2026-10-21", 10, 100);
    await expect(wakeRow(page).getByRole("button", { name: "Locked" })).toBeVisible();
  });

  test("Sep 30 and Nov 1: not on the chalkboard at all", async ({ page }) => {
    await openChalkboardOn(page, "2026-09-30", 10, 100);
    await expect(wakeRow(page)).toHaveCount(0);
    await openChalkboardOn(page, "2026-11-01", 10, 100);
    await expect(wakeRow(page)).toHaveCount(0);
  });

  test("Oct 22 with 3+ wins: open, with its prize and house rule on the row", async ({ page }) => {
    await openChalkboardOn(page, "2026-10-22", 3, 100);
    const row = wakeRow(page);
    await expect(row.getByRole("button", { name: /Enter \(13 Checks\)/ })).toBeEnabled();
    await expect(row).toContainText("Spring-Heeled Jack");
    await expect(row).toContainText("150 Checks");
    await expect(row).toContainText("The Witching Hour is in play at the start of every match");
  });

  test("Oct 22 with fewer than 3 wins: still locked", async ({ page }) => {
    await openChalkboardOn(page, "2026-10-22", 2, 100);
    await expect(wakeRow(page).getByRole("button", { name: "Locked" })).toBeVisible();
  });

  test("entering seats a bracket, and the first match opens with The Witching Hour already in the shared slot", async ({ page }) => {
    test.setTimeout(120_000);
    await openChalkboardOn(page, "2026-10-22", 3, 100);
    await wakeRow(page).getByRole("button", { name: /Enter/ }).click();
    await expect(page.locator(".bracket-stage")).toHaveCount(3, { timeout: 90_000 });
    await page.getByRole("button", { name: /Play Quarterfinal/ }).click();
    await expect(page.getByText("Round 1 of 3")).toBeVisible();
    await expect(page.locator(".location-slot")).toContainText("The Witching Hour");
  });
});
