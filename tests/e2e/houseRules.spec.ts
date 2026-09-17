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
      localStorage.setItem("steampunk-shuffle:tutorial-state", JSON.stringify({ completed: true, matchesPlayed: 0, shownHints: [] }));
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

  // Bugfix cluster D (note #7): the page scrolled fine via touch but not via
  // mouse wheel/trackpad — `.house-rules-screen` was the one screen missing
  // the `height: 100%; overflow-y: auto` every sibling screen already has,
  // so it overflowed #app unclipped instead of being its own scroll
  // container. Mouse wheel is a desktop-only input device — mobile WebKit
  // (the Safari project) doesn't support `page.mouse.wheel()` at all, and
  // touch scrolling here was never the reported bug (note #7 itself says
  // it already worked on phone), so this only runs on the three desktop
  // projects. Shrink the viewport so the content genuinely overflows, then
  // scroll with repeated wheel events (Firefox's wheel delta units scroll
  // much less per call than Chromium's, so one large delta isn't enough to
  // reliably reach the bottom) and confirm it gets there.
  test("cluster D: content scrolls with the mouse wheel and reaches the bottom", async ({ page, isMobile }) => {
    test.skip(isMobile, "mouse wheel isn't a mobile input device; touch scrolling here was already working (note #7)");
    await page.setViewportSize({ width: 402, height: 400 });
    await page.getByRole("button", { name: "House Rules" }).click();

    const container = page.locator(".house-rules-screen");
    await expect(container).toBeVisible();
    const before = await container.evaluate((el) => el.scrollTop);

    await container.hover();
    // A wheel-triggered scroll can animate smoothly rather than jump
    // instantly, so `page.mouse.wheel()` returning doesn't mean the scroll
    // has settled yet — poll after each call rather than reading immediately.
    for (let i = 0; i < 10; i++) {
      const atBottom = await container.evaluate((el) => el.scrollTop + el.clientHeight >= el.scrollHeight - 1);
      if (atBottom) break;
      await page.mouse.wheel(0, 2000);
      await expect.poll(() => container.evaluate((el) => el.scrollTop)).toBeGreaterThan(before);
    }

    await expect(page.getByText("How Checks work")).toBeVisible();
    const atBottom = await container.evaluate((el) => el.scrollTop + el.clientHeight >= el.scrollHeight - 1);
    expect(atBottom).toBe(true);
  });

  // Bugfix cluster F (note #9): the per-turn draw rule (design.md §6.2 step
  // 2) was real and already implemented, just never explained anywhere
  // in-game. Originally this covered the older round-boundary "each side
  // draws 3 more cards" rule; both were replaced by a draw at the start of
  // every turn (see CLAUDE.md's draw-mechanic gotcha).
  test("cluster F: explains that hands grow by one card at the start of every turn", async ({ page }) => {
    await page.getByRole("button", { name: "House Rules" }).click();
    await expect(page.getByText(/at the start of every turn, before playing, you draw one card/)).toBeVisible();
  });
});
