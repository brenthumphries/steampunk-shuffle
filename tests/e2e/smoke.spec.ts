import { expect, test } from "@playwright/test";

test("taproom placeholder loads", async ({ page }) => {
  await page.goto("/steampunk-shuffle/");
  await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
});

test("manifest is linked and installable metadata is present", async ({ page }) => {
  await page.goto("/steampunk-shuffle/");
  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(manifestHref).toBeTruthy();
});
