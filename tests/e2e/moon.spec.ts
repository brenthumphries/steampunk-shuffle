import { expect, test } from "@playwright/test";

import { expectNoErrors, noonOn, openWithSave, SEASONS_SEEN, START, watchErrors } from "./helpers/game";

// The hub moon (design.md §5.17). Dates: 24 Nov 2026 is a full moon (14:53 UT), 9 Nov 2026 a new
// moon (07:02 UT), 20 Nov a waxing gibbous; see tests/unit/sky/moon.test.ts for their source.

const PUB = { checks: 0, totalWins: 0, opponents: {}, collection: [] as string[], lastDailyBonusDate: null, ...SEASONS_SEEN };

async function openHubOn(page: import("@playwright/test").Page, day: [number, number, number]): Promise<void> {
  await page.clock.setFixedTime(noonOn(...day));
  await openWithSave(page, { tutorialDone: true, pub: PUB });
  await page.waitForFunction(() => (document.querySelector("#app")?.childElementCount ?? 0) > 0);
  await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
}

test("the hub shows a glowing full moon on a full-moon night, and the beer mat apologises for the Hampstead gentleman", async ({ page }) => {
  const log = watchErrors(page);
  await openHubOn(page, [2026, 11, 24]);
  const moon = page.locator(".hub-moon");
  await expect(moon).toHaveAttribute("data-phase", "full");
  await expect(moon).toHaveClass(/hub-moon--full/);
  await moon.click();
  const mat = page.locator(".beer-mat-text");
  await expect(mat).toContainText("Full moon.");
  await expect(mat).toContainText("Full moon tonight. The Hampstead gentleman sends his apologies.");
  await page.getByRole("button", { name: "Dismiss" }).click();
  await expect(page.locator(".beer-mat")).toHaveCount(0);
  expectNoErrors(log);
});

test("the hub shows a dark moon at a new moon, with no apology on the mat", async ({ page }) => {
  await openHubOn(page, [2026, 11, 9]);
  const moon = page.locator(".hub-moon");
  await expect(moon).toHaveAttribute("data-phase", "new");
  await expect(moon).not.toHaveClass(/hub-moon--full/);
  await expect(moon.locator(".hub-moon-lit")).toHaveCount(0);
  await moon.click();
  await expect(page.locator(".beer-mat-text")).toContainText("New moon.");
  await expect(page.locator(".beer-mat-text")).not.toContainText("Hampstead");
});

test("a tap names the phase on a beer mat in Sir Charles's voice", async ({ page }) => {
  await openHubOn(page, [2026, 11, 20]);
  await page.locator(".hub-moon").click();
  await expect(page.locator(".beer-mat-text")).toHaveText("Waxing gibbous. Pixie says that's a good one.");
});

test("the dev clock (?now=&preview=1) drives the moon", async ({ page }) => {
  await openHubOn(page, [2026, 11, 20]);
  await page.goto(`${START}?now=2026-11-24&preview=1`);
  await page.waitForFunction(() => (document.querySelector("#app")?.childElementCount ?? 0) > 0);
  await expect(page.locator(".hub-moon")).toHaveAttribute("data-phase", "full");
});
