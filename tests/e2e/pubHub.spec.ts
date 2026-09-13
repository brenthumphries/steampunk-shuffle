import { expect, test } from "@playwright/test";

// Plan step 2.3's exit check: "win a pickup game vs an opponent → receive
// their reward card → it appears in collection." Actually playing to a win
// isn't scripted here — matches are random-shuffled and AI-paced, same
// reasoning as tests/e2e/match.spec.ts — that flow (and the "unwrap" reveal)
// was manually verified in the browser instead. These smoke tests cover the
// hub's own structure: who's in tonight, the Checks badge, and starting a
// pickup game against a chosen patron.

test.describe("pub hub (plan step 2.3)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/steampunk-shuffle/");
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem("steampunk-shuffle:tutorial-state", JSON.stringify({ completed: true, matchesPlayed: 0, shownHints: [] }));
      localStorage.setItem("steampunk-shuffle:player", JSON.stringify({ name: "Sara", dedicationSeen: true }));
    });
    await page.reload();
  });

  test("shows Sir Charles and the four Regulars for a new player, with 0 Checks", async ({ page }) => {
    await expect(page.getByText("0", { exact: true })).toBeVisible();
    await expect(page.getByText("Checks")).toBeVisible();

    for (const name of ["Sir Charles", "Constable Tobias Mudd", "Old Nell Ashby", '"Dodgy" Reg Farrow', "Miss Prudence Hollis"]) {
      await expect(page.getByText(name, { exact: true })).toBeVisible();
    }
    await expect(page.getByText("Inspector Bucket")).toHaveCount(0);
  });

  test("tapping a patron starts a pickup match against them", async ({ page }) => {
    await page.getByRole("button", { name: "Play Constable Tobias Mudd" }).click();
    await expect(page.getByText("Round 1 of 3")).toBeVisible();
    await expect(page.locator(".side-name").first()).toHaveText("Constable Tobias Mudd");
  });

  test("Seasoned and Legend opponents appear once win thresholds are met", async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem("steampunk-shuffle:pub-state", JSON.stringify({ checks: 0, totalWins: 10, opponents: {}, collection: [], lastDailyBonusDate: null }));
    });
    await page.reload();

    await expect(page.getByText("Inspector Bucket")).toBeVisible();
    await expect(page.getByText("Ada Lovelace")).toBeVisible();

    const legendNames = ["Sherlock Holmes", "Professor Moriarty", "Agatha Christie", "Hercule Poirot", "Dr Jekyll / Mr Hyde", "Mary Shelley"];
    let shownCount = 0;
    for (const name of legendNames) {
      if (await page.getByText(name, { exact: true }).count()) shownCount++;
    }
    expect(shownCount).toBe(2);
  });

  // Bar Bet (plan step 2.5, design.md §11.5): unlocked at 3 wins, and only
  // offered once there's something in the collection to stake.
  test("PT-21: an eligible patron shows an opt-in Bar Bet chip naming what's on offer, not an automatic prompt", async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem(
        "steampunk-shuffle:pub-state",
        JSON.stringify({ checks: 0, totalWins: 3, opponents: {}, collection: ["charlotte"], lastDailyBonusDate: null, lastLostAndFoundDate: null, pawnedCards: [] }),
      );
    });
    await page.reload();

    // Tapping the row itself starts the match directly — no interposed prompt.
    const muddRow = page.locator(".patron-row").filter({ hasText: "Constable Tobias Mudd" });
    await expect(muddRow.getByRole("button", { name: "Bar bet" })).toBeVisible();

    await muddRow.getByRole("button", { name: "Bar bet" }).click();
    await expect(page.getByText("Stake a card against Constable Tobias Mudd?")).toBeVisible();
    // Names the opponent's actual stakes, not "one of theirs" unnamed (Mudd's betPool includes Telegraph Boy).
    await expect(page.getByText(/Telegraph Boy/)).toBeVisible();

    await page.getByRole("button", { name: "Play without staking" }).click();
    await expect(page.getByText("Round 1 of 3")).toBeVisible();
  });

  test("PT-21: tapping a patron row directly starts the match, without interposing a Bar Bet prompt", async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem(
        "steampunk-shuffle:pub-state",
        JSON.stringify({ checks: 0, totalWins: 3, opponents: {}, collection: ["charlotte"], lastDailyBonusDate: null, lastLostAndFoundDate: null, pawnedCards: [] }),
      );
    });
    await page.reload();

    await page.getByRole("button", { name: "Play Constable Tobias Mudd" }).click();
    await expect(page.getByText("Round 1 of 3")).toBeVisible();
  });
});
