import { expect, test } from "@playwright/test";

// House Rules (plan step 2.7, design.md §13.4) had no e2e coverage of its
// own before plan step 4.0e — this file starts one, covering PT-29's new
// card-types section and PT-5's Birthday Invitational visibility rule
// (shared with tests/e2e/tournaments.spec.ts's own coverage of the same
// hide-until-triggered behavior on the chalkboard).

test.describe("House Rules (plan step 2.7 / 4.0e)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/steampunk-shuffle/");
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem("steampunk-shuffle:tutorial-state", JSON.stringify({ completed: true, matchesPlayed: 1, shownHints: [] }));
      localStorage.setItem("steampunk-shuffle:player", JSON.stringify({ name: "Sara", dedicationSeen: true }));
    });
    await page.reload();
  });

  test("opens from the pub hub, shows card types, and hides the Birthday Invitational before its date trigger", async ({ page }) => {
    await page.getByRole("button", { name: "House Rules" }).click();
    await expect(page.getByRole("heading", { name: "House Rules" })).toBeVisible();

    // PT-29: card types are now defined, one line each. Scoped to the
    // section right after the "Card types" heading, since "Location" is
    // also a keyword name a few sections down.
    await expect(page.getByText("Card types")).toBeVisible();
    const typesSection = page.locator(".house-rules-keywords").first();
    for (const type of ["Character", "Gadget", "Scheme", "Location", "Headline"]) {
      await expect(typesSection.locator(".house-rules-keyword-name", { hasText: type })).toBeVisible();
    }

    // PT-5: not printed on this page's tournament table before the trigger either.
    await expect(page.getByText("The Birthday Invitational")).toHaveCount(0);

    await page.getByRole("button", { name: "Back to the bar" }).click();
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
  });

  test("PT-5: the Birthday Invitational appears in the tournament table once the date trigger fires", async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem("steampunk-shuffle:tournament-state", JSON.stringify({ invitationalTriggered: true, active: null }));
    });
    await page.reload();

    await page.getByRole("button", { name: "House Rules" }).click();
    await expect(page.getByText("The Birthday Invitational")).toBeVisible();
  });
});
