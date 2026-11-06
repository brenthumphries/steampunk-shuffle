import { expect, test } from "@playwright/test";

// Content packs (docs/plans/monthly/00-monthly-content-plan.md §4.1): the
// test-only pack (src/events/packs/testPack.ts, window Jan 10-12) joins the
// registry only on `?testpack=1` alongside the `&preview=1` dev-clock gate, and
// its banner slides across on the first hub visit inside the window.

const START = "/steampunk-shuffle/";
const BANNER = "Test pack banner: new this month.";

async function seedReturningPlayer(page: import("@playwright/test").Page): Promise<void> {
  await page.goto(START);
  await page.evaluate(() => {
    const L = (n: string): string => {
      let r = JSON.parse(localStorage.getItem("ws:ledgers") ?? "null");
      if (!r) {
        r = { activeId: "0e2e0000-0000-4000-8000-000000000001", ledgers: [{ id: "0e2e0000-0000-4000-8000-000000000001", name: "Sara", createdAt: "2026-11-06T00:00:00.000Z", lastPlayedAt: "2026-11-06T00:00:00.000Z", summary: { title: "Newcomer", wins: 0, collectionCount: 0 } }] };
        localStorage.setItem("ws:ledgers", JSON.stringify(r));
      }
      return `ws:${r.activeId}:${n}`;
    };
    localStorage.clear();
    localStorage.setItem(L("tutorial-state"), JSON.stringify({ completed: true, matchesPlayed: 5, shownHints: ["hub"] }));
    localStorage.setItem(L("player"), JSON.stringify({ name: "Sara", dedicationSeen: true }));
    localStorage.setItem(L("pub-state"), JSON.stringify({ checks: 0, totalWins: 0, opponents: {}, collection: [], lastDailyBonusDate: null, giftsClaimed: { "cunning-folk": { "2026": ["left-on-the-step", "cunning-woman", "almanack-seller"] } }, bannersSeen: { "cunning-folk": [2026] } }));
  });
}

test("the test pack's banner shows once on the first hub visit inside its window", async ({ page }) => {
  await seedReturningPlayer(page);
  await page.goto(`${START}?now=2026-01-10&preview=1&testpack=1`);
  await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
  await expect(page.locator(".beer-mat-text")).toHaveText(BANNER);

  // A reload the same day: the banner has been shown for 2026 and doesn't return.
  await page.goto(`${START}?now=2026-01-10&preview=1&testpack=1`);
  await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
  await expect(page.locator(".beer-mat")).toHaveCount(0);
});

test("without ?testpack=1 (or without preview=1) the test pack is not in the game", async ({ page }) => {
  await seedReturningPlayer(page);
  await page.goto(`${START}?now=2026-01-10&preview=1`);
  await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
  await expect(page.locator(".beer-mat")).toHaveCount(0);

  await page.goto(`${START}?now=2026-01-10&testpack=1`);
  await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
  await expect(page.locator(".beer-mat")).toHaveCount(0);
});
