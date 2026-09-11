import { expect, test } from "@playwright/test";

// Plan step 2.1's exit check: "full match playable on your phone" at the
// 402×874 iPhone 17 viewport (playwright.config.ts's only project). These
// smoke tests don't play a whole match (real games are random-shuffled and
// AI-paced) — they check the mechanics design.md §6.4 calls out: staging a
// card before it commits, undoing it, committing it, and the card-zoom
// overlay.

test.describe("match screen (plan step 2.1)", () => {
  test("staging a card shows Play/Cancel before it commits, and Cancel takes it back (design.md §6.4)", async ({ page }) => {
    await page.goto("/steampunk-shuffle/");
    await page.getByRole("button", { name: "Play a quick match" }).click();
    await expect(page.getByText("Round 1 of 3")).toBeVisible();

    // Whoever leads is decided by a coin toss (design.md §6.1) — wait out
    // the AI's opening move if it went first.
    const firstCard = page.locator(".hand-row .card--tappable").first();
    await expect(firstCard).toBeVisible({ timeout: 10_000 });

    const handLabelBefore = await page.locator(".hand-label").textContent();
    await firstCard.click();
    await expect(page.getByRole("button", { name: "Play", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();

    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("button", { name: "Play", exact: true })).toHaveCount(0);
    await expect(page.locator(".hand-label")).toHaveText(handLabelBefore ?? "");
  });

  test("playing a card commits it to the board and the match keeps moving", async ({ page }) => {
    await page.goto("/steampunk-shuffle/");
    await page.getByRole("button", { name: "Play a quick match" }).click();

    const firstCard = page.locator(".hand-row .card--tappable").first();
    await expect(firstCard).toBeVisible({ timeout: 10_000 });
    await firstCard.click();
    await page.getByRole("button", { name: "Play", exact: true }).click();

    await expect(page.locator(".board-row .card").first()).toBeVisible();
    // The AI replies (or the round ends) within a few seconds either way.
    await expect(page.getByText(/Your turn|took the round|Round tied/)).toBeVisible({ timeout: 10_000 });
  });

  test("card zoom opens a full-card detail overlay and closes on tap-away", async ({ page }) => {
    await page.goto("/steampunk-shuffle/");
    await page.getByRole("button", { name: "Play a quick match" }).click();

    const zoomBtn = page.locator(".hand-row .card-zoom-btn").first();
    await expect(zoomBtn).toBeVisible({ timeout: 10_000 });
    await zoomBtn.click();

    const overlay = page.locator(".overlay--zoom");
    await expect(overlay).toBeVisible();
    await expect(overlay.locator(".card-flavor")).toBeVisible();

    await overlay.click({ position: { x: 5, y: 5 } });
    await expect(overlay).toHaveCount(0);
  });
});
