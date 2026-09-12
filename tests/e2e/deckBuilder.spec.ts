import { expect, test } from "@playwright/test";

// Plan step 2.2's exit check: "Can build, save, rename, and select a legal
// deck; illegal decks blocked with a reason." Each test clears localStorage
// first so the 13 slots start in their fresh-install state regardless of
// run order — which, since plan step 4.0d (PT-4), means slot 1 is already
// seeded with the starter deck, selected. Tests that want a genuinely
// empty slot to build in use slot 2 instead.

test.describe("deck builder (plan step 2.2)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/steampunk-shuffle/");
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem("steampunk-shuffle:tutorial-state", JSON.stringify({ completed: true, matchesPlayed: 1, shownHints: [] }));
      localStorage.setItem("steampunk-shuffle:player", JSON.stringify({ name: "Sara", dedicationSeen: true }));
    });
    await page.reload();
  });

  test("PT-4: slot 1 is pre-seeded as The Village Constable, legal, and selected", async ({ page }) => {
    await page.getByRole("button", { name: "Build a deck" }).click();
    await expect(page.getByText("Your decks")).toBeVisible();

    const firstRow = page.locator(".deck-slot-row").first();
    await expect(firstRow.getByText("The Village Constable")).toBeVisible();
    await expect(firstRow.getByText("Legal")).toBeVisible();
    await expect(firstRow.getByRole("button", { name: "Selected" })).toBeVisible();

    await page.getByRole("button", { name: "Back to the taproom" }).click();
    await expect(page.getByText("Deck: The Village Constable")).toBeVisible();
  });

  test("an empty slot shows as not legal, with a reason, and can't be selected", async ({ page }) => {
    await page.getByRole("button", { name: "Build a deck" }).click();
    await expect(page.getByText("Your decks")).toBeVisible();

    const emptyRow = page.locator(".deck-slot-row").nth(1);
    await expect(emptyRow.getByText("Not legal")).toBeVisible();
    await expect(emptyRow.getByRole("button", { name: "Select" })).toBeDisabled();

    await emptyRow.locator(".deck-slot-info").click();
    await expect(page.getByText(/must have exactly 20/)).toBeVisible();
  });

  test("starting from the Village Constable makes the deck legal, and it can be renamed, saved, and selected for play", async ({ page }) => {
    await page.getByRole("button", { name: "Build a deck" }).click();
    await page.locator(".deck-slot-row").nth(1).locator(".deck-slot-info").click();

    await page.getByRole("button", { name: "Start from the Village Constable" }).click();
    await expect(page.getByText("20/20 cards · 37/60 points")).toBeVisible();

    const nameInput = page.getByLabel("Deck name");
    await nameInput.fill("Brent's Deck");

    await page.getByRole("button", { name: "Done" }).click();
    const row = page.locator(".deck-slot-row").nth(1);
    await expect(row.getByText("Brent's Deck")).toBeVisible();
    await expect(row.getByText("Legal")).toBeVisible();

    await row.getByRole("button", { name: "Select" }).click();
    await expect(row.getByRole("button", { name: "Selected" })).toBeVisible();

    await page.getByRole("button", { name: "Back to the taproom" }).click();
    await expect(page.getByText("Deck: Brent's Deck")).toBeVisible();

    // The renamed, saved, selected deck persists across a reload.
    await page.reload();
    await expect(page.getByText("Deck: Brent's Deck")).toBeVisible();
  });

  test("filters narrow the card grid by family and type", async ({ page }) => {
    await page.getByRole("button", { name: "Build a deck" }).click();
    await page.locator(".deck-slot-row").nth(1).locator(".deck-slot-info").click();

    const gridCountFor = async () => page.locator(".deck-card-tile").count();
    const allCount = await gridCountFor();

    await page.getByRole("combobox").first().selectOption("yard");
    const yardCount = await gridCountFor();
    expect(yardCount).toBeGreaterThan(0);
    expect(yardCount).toBeLessThan(allCount);

    for (const tile of await page.locator(".deck-card-tile").all()) {
      await expect(tile).toHaveAttribute("data-family", "yard");
    }
  });

  test("+ and − buttons add and remove copies, capped at the max-copies rule", async ({ page }) => {
    await page.getByRole("button", { name: "Build a deck" }).click();
    await page.locator(".deck-slot-row").nth(1).locator(".deck-slot-info").click();

    // Constable on the Beat: owned via the starter deck (quantity 2), so
    // it's addable up to the card's own max-copies rule (design.md §7.2).
    const firstTile = page.locator(".deck-card-tile").first();
    const plus = firstTile.locator(".deck-card-btn", { hasText: "+" });
    const minus = firstTile.locator(".deck-card-btn", { hasText: "−" });

    await expect(firstTile.locator(".deck-card-qty")).toHaveText(/^0\//);
    await plus.click();
    await expect(firstTile.locator(".deck-card-qty")).toHaveText(/^1\//);
    await plus.click();
    await expect(firstTile.locator(".deck-card-qty")).toHaveText(/^2\/2$/);
    await expect(plus).toBeDisabled(); // at the max-copies cap (design.md §7.2)

    await minus.click();
    await expect(firstTile.locator(".deck-card-qty")).toHaveText(/^1\//);
  });

  test("PT-1: an unowned card is dimmed, has no +/- controls, but can still be zoomed", async ({ page }) => {
    await page.getByRole("button", { name: "Build a deck" }).click();
    await page.locator(".deck-slot-row").nth(1).locator(".deck-slot-info").click();

    // Difference Engine (Foundry) isn't in the starter deck and hasn't been earned.
    await page.getByRole("combobox").first().selectOption("foundry");
    const tile = page.locator(".deck-card-tile", { hasText: "Difference Engine" });
    await expect(tile).toHaveClass(/deck-card-tile--unowned/);
    await expect(tile.getByText("Not yet owned")).toBeVisible();
    await expect(tile.locator(".deck-card-btn")).toHaveCount(0);

    await tile.locator(".deck-card-zoom-btn").click();
    await expect(page.locator(".overlay--zoom").getByText("Difference Engine")).toBeVisible();
  });

  test("PT-24: the owned-only filter hides unowned cards", async ({ page }) => {
    await page.getByRole("button", { name: "Build a deck" }).click();
    await page.locator(".deck-slot-row").nth(1).locator(".deck-slot-info").click();
    await page.getByRole("combobox").first().selectOption("foundry");

    await expect(page.locator(".deck-card-tile", { hasText: "Difference Engine" })).toBeVisible();
    await page.getByLabel("Owned only").check();
    await expect(page.locator(".deck-card-tile", { hasText: "Difference Engine" })).toHaveCount(0);
  });
});
