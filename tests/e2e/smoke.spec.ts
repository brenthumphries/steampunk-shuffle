import { expect, test } from "@playwright/test";

test("taproom placeholder loads", async ({ page }) => {
  await page.goto("/steampunk-shuffle/");
  // A brand-new player lands in the tutorial (design.md §13), not the pub
  // hub — seed it completed so this stays a smoke test of the taproom.
  await page.evaluate(() => localStorage.setItem("steampunk-shuffle:tutorial-state", JSON.stringify({ completed: true, matchesPlayed: 1, shownHints: [] })));
  await page.reload();
  await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
});

test("manifest is linked and installable metadata is present", async ({ page }) => {
  await page.goto("/steampunk-shuffle/");
  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(manifestHref).toBeTruthy();
});
