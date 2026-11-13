import { expect, test, type Page } from "@playwright/test";
import { noonOn, openWithSave, readKey, SEASONS_SEEN, START, writeKey } from "./helpers/game";

// Release 1.1, design.md §12.5: several ledgers on one device, and the
// migration that protects the one Sara already has (plan 14 §2.3).

const PUB = { checks: 100, totalWins: 12, opponents: {}, collection: ["hiawatha"], lastDailyBonusDate: null, ...SEASONS_SEEN };

async function playScriptedTutorialCard(page: Page): Promise<void> {
  await page.locator(".beer-mat-dismiss").click();
  await page.locator(".beer-mat-dismiss").click();
  const scriptedCard = page.locator(".hand-row .card--tappable");
  await expect(scriptedCard).toHaveCount(1, { timeout: 10_000 });
  await scriptedCard.click();
  await expect(page.locator(".side-score").last()).toHaveText("Your score: 3");
}

/** Stands in for finishing the tutorial, which is far too long to play here: marks it done and reloads into the hub. */
async function finishTutorial(page: Page, pub: Record<string, unknown>): Promise<void> {
  // "Start ledger" reloads the app; write only once the new ledger's tutorial is up.
  await expect(page.getByText("Round 1 of 3")).toBeVisible();
  await writeKey(page, "tutorial-state", { completed: true, matchesPlayed: 0, shownHints: [] });
  await writeKey(page, "pub-state", pub);
  await page.reload();
  await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
}

async function openShelf(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Ledgers" }).click();
  await expect(page.getByRole("heading", { name: "The Ledger Shelf" })).toBeVisible();
}

test.describe("the Ledger Shelf", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(noonOn(2026, 11, 10));
  });

  test("two ledgers, a tutorial step in each, switching back and forth without leaking", async ({ page }) => {
    // Sara's ledger: a fresh install past the dedication, into the tutorial.
    await openWithSave(page, {});
    await expect(page.getByText("Round 1 of 3")).toBeVisible();
    await playScriptedTutorialCard(page);
    await finishTutorial(page, { ...PUB, totalWins: 5, checks: 40 });
    await expect(page.locator(".pub-hub-subtitle")).toHaveText("Known at the Bar");

    // A second ledger begins at the tutorial.
    await openShelf(page);
    await expect(page.locator(".ledger-book")).toHaveCount(1);
    await page.getByRole("button", { name: "New ledger" }).click();
    await page.getByLabel("Name for the new ledger").fill("Mum");
    await page.getByRole("button", { name: "Start ledger" }).click();
    await expect(page.getByText("Round 1 of 3")).toBeVisible();
    await expect(page.getByText("Licensed to")).toHaveCount(0);
    await playScriptedTutorialCard(page);
    await finishTutorial(page, { ...PUB, totalWins: 0, checks: 7, collection: [] });
    await expect(page.locator(".pub-hub-subtitle")).toHaveText("Newcomer");
    expect((await readKey<{ checks: number }>(page, "pub-state"))!.checks).toBe(7);

    // Back to Sara: her own wins, checks and cards.
    await openShelf(page);
    await expect(page.locator(".ledger-book")).toHaveCount(2);
    await expect(page.locator(".ledger-book--active .ledger-book-name")).toHaveText("Mum");
    await page.locator(".ledger-book", { hasText: "Sara" }).getByRole("button", { name: "Switch" }).click();
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
    await expect(page.locator(".pub-hub-subtitle")).toHaveText("Known at the Bar");
    await expect(page.locator(".checks-badge-value")).toHaveText("40");

    // And to Mum again, then Sara once more.
    await openShelf(page);
    await expect(page.locator(".ledger-book", { hasText: "Mum" })).toContainText("0 wins");
    await expect(page.locator(".ledger-book", { hasText: "Sara" })).toContainText("5 wins");
    await page.locator(".ledger-book", { hasText: "Mum" }).getByRole("button", { name: "Switch" }).click();
    await expect(page.locator(".checks-badge-value")).toHaveText("7");
    await openShelf(page);
    await page.locator(".ledger-book", { hasText: "Sara" }).getByRole("button", { name: "Switch" }).click();
    await expect(page.locator(".checks-badge-value")).toHaveText("40");
  });

  test("a tutorial can be left for the shelf when there are two ledgers, and resumes when the ledger is reopened", async ({ page }) => {
    // One ledger only: no way out of the tutorial.
    await openWithSave(page, {});
    await expect(page.getByText("Round 1 of 3")).toBeVisible();
    await expect(page.getByRole("button", { name: "Ledger Shelf" })).toHaveCount(0);
    await finishTutorial(page, PUB);

    // A second ledger by mistake: leave its tutorial, go back to Sara.
    await openShelf(page);
    await page.getByRole("button", { name: "New ledger" }).click();
    await page.getByLabel("Name for the new ledger").fill("Mum");
    await page.getByRole("button", { name: "Start ledger" }).click();
    await expect(page.getByText("Round 1 of 3")).toBeVisible();
    await page.getByRole("button", { name: "Ledger Shelf" }).click();
    await page.getByRole("button", { name: "Go to the shelf" }).click();
    await expect(page.getByRole("heading", { name: "The Ledger Shelf" })).toBeVisible();
    expect((await readKey<{ completed: boolean }>(page, "tutorial-state"))?.completed ?? false).toBe(false);
    await page.locator(".ledger-book", { hasText: "Sara" }).getByRole("button", { name: "Switch" }).click();
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();

    // Back to Mum: her tutorial deals again.
    await openShelf(page);
    await page.locator(".ledger-book", { hasText: "Mum" }).getByRole("button", { name: "Switch" }).click();
    await expect(page.getByText("Round 1 of 3")).toBeVisible();

    // Cancel on the confirm keeps the tutorial; Back from the shelf returns to it.
    await page.getByRole("button", { name: "Ledger Shelf" }).click();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByText("Round 1 of 3")).toBeVisible();
    await page.getByRole("button", { name: "Ledger Shelf" }).click();
    await page.getByRole("button", { name: "Go to the shelf" }).click();
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByText("Round 1 of 3")).toBeVisible();
  });

  test("deleting a ledger needs its name typed and saves a backup file first", async ({ page }) => {
    await openWithSave(page, { tutorialDone: true, pub: PUB });
    await openShelf(page);
    await page.getByRole("button", { name: "New ledger" }).click();
    await page.getByLabel("Name for the new ledger").fill("Mum");
    await page.getByRole("button", { name: "Start ledger" }).click();
    await finishTutorial(page, { ...PUB, totalWins: 0 });

    await openShelf(page);
    const sara = page.locator(".ledger-book", { hasText: "Sara" });
    await sara.getByRole("button", { name: "Delete" }).click();
    const confirm = sara.getByRole("button", { name: "Back up and delete" });
    await expect(confirm).toBeDisabled();
    await sara.getByLabel("Type the ledger's name").fill("Sar");
    await expect(confirm).toBeDisabled();
    await sara.getByLabel("Type the ledger's name").fill("Sara");
    const download = page.waitForEvent("download");
    await confirm.click();
    expect((await download).suggestedFilename()).toMatch(/^sara-.*\.wheatstone$/);
    await expect(page.locator(".ledger-book")).toHaveCount(1);
    await expect(page.getByRole("button", { name: "New ledger" })).toBeEnabled();
  });

  test("the shelf holds four", async ({ page }) => {
    await openWithSave(page, { tutorialDone: true, pub: PUB });
    for (const name of ["Mum", "Dad", "Gran"]) {
      await openShelf(page);
      await page.getByRole("button", { name: "New ledger" }).click();
      await page.getByLabel("Name for the new ledger").fill(name);
      await page.getByRole("button", { name: "Start ledger" }).click();
      await finishTutorial(page, { ...PUB, totalWins: 1 });
    }
    await openShelf(page);
    await expect(page.locator(".ledger-book")).toHaveCount(4);
    await expect(page.getByRole("button", { name: "New ledger" })).toBeDisabled();
    await expect(page.getByText("The shelf is full")).toBeVisible();
  });
});

test.describe("the move onto the shelf (plan 14 §2.3)", () => {
  test("an existing save is kept as ledger one, with the beer mat once and a cellar copy to restore", async ({ page }) => {
    await page.clock.setFixedTime(noonOn(2026, 12, 5));
    await openWithSave(page, { tutorialDone: true, pub: PUB, legacy: true }); // the pre-1.1 keys, which the app then migrates

    const mat = page.locator(".beer-mat-text");
    await expect(mat).toContainText("Sir Charles has moved your ledger onto a shelf");
    await expect(page.locator(".pub-hub-subtitle")).toHaveText("Seasoned");
    expect((await readKey<{ totalWins: number }>(page, "pub-state"))!.totalWins).toBe(12);

    // The originals are still where the old build left them.
    const originals = await page.evaluate(() => localStorage.getItem("steampunk-shuffle:pub-state"));
    expect(JSON.parse(originals!).totalWins).toBe(12);

    // Once only.
    await page.reload();
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
    await expect(page.locator(".beer-mat")).toHaveCount(0);

    // Play on, then restore the cellar copy.
    await writeKey(page, "pub-state", { ...PUB, totalWins: 40 });
    await page.reload();
    await expect(page.locator(".pub-hub-subtitle")).toHaveText("Legend of the Bridge");
    await page.getByRole("button", { name: "Save & data" }).click();
    await page.getByRole("button", { name: "Restore the cellar copy" }).click();
    await page.getByRole("button", { name: "Yes, restore it" }).click();
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
    await expect(page.locator(".pub-hub-subtitle")).toHaveText("Seasoned");
  });

  test("30 days on, the old keys are deleted and the cellar copy button is gone", async ({ page }) => {
    await page.clock.setFixedTime(noonOn(2026, 12, 5));
    await openWithSave(page, { tutorialDone: true, pub: PUB, legacy: true });
    await expect(page.locator(".beer-mat")).toHaveCount(1);
    await page.clock.setFixedTime(noonOn(2027, 1, 5));
    await page.goto(START);
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
    const left = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("steampunk-shuffle:") && k !== "steampunk-shuffle:audio-muted"));
    expect(left).toEqual([]);
    expect((await readKey<{ totalWins: number }>(page, "pub-state"))!.totalWins).toBe(12);
    await page.getByRole("button", { name: "Save & data" }).click();
    await expect(page.getByRole("button", { name: "Send this ledger" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Restore the cellar copy" })).toHaveCount(0);
  });
});
