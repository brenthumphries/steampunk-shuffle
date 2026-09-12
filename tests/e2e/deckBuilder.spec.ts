import { expect, test } from "@playwright/test";

// Plan step 2.2's exit check: "Can build, save, rename, and select a legal
// deck; illegal decks blocked with a reason." Each test clears localStorage
// first so the 13 slots start empty regardless of run order.

test.describe("deck builder (plan step 2.2)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/steampunk-shuffle/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("an empty slot shows as not legal, with a reason, and can't be selected", async ({ page }) => {
    await page.getByRole("button", { name: "Build a deck" }).click();
    await expect(page.getByText("Your decks")).toBeVisible();

    const firstRow = page.locator(".deck-slot-row").first();
    await expect(firstRow.getByText("Not legal")).toBeVisible();
    await expect(firstRow.getByRole("button", { name: "Select" })).toBeDisabled();

    await firstRow.locator(".deck-slot-info").click();
    await expect(page.getByText(/must have exactly 20/)).toBeVisible();
  });

  test("starting from the Village Constable makes the deck legal, and it can be renamed, saved, and selected for play", async ({ page }) => {
    await page.getByRole("button", { name: "Build a deck" }).click();
    await page.locator(".deck-slot-row").first().locator(".deck-slot-info").click();

    await page.getByRole("button", { name: "Start from the Village Constable" }).click();
    await expect(page.getByText("20/20 cards · 37/60 points")).toBeVisible();

    const nameInput = page.getByLabel("Deck name");
    await nameInput.fill("Brent's Deck");

    await page.getByRole("button", { name: "Done" }).click();
    const firstRow = page.locator(".deck-slot-row").first();
    await expect(firstRow.getByText("Brent's Deck")).toBeVisible();
    await expect(firstRow.getByText("Legal")).toBeVisible();

    await firstRow.getByRole("button", { name: "Select" }).click();
    await expect(firstRow.getByRole("button", { name: "Selected" })).toBeVisible();

    await page.getByRole("button", { name: "Back to the taproom" }).click();
    await expect(page.getByText("Deck: Brent's Deck")).toBeVisible();

    // The renamed, saved, selected deck persists across a reload.
    await page.reload();
    await expect(page.getByText("Deck: Brent's Deck")).toBeVisible();
  });

  test("filters narrow the card grid by family and type", async ({ page }) => {
    await page.getByRole("button", { name: "Build a deck" }).click();
    await page.locator(".deck-slot-row").first().locator(".deck-slot-info").click();

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
    await page.locator(".deck-slot-row").first().locator(".deck-slot-info").click();

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
});
