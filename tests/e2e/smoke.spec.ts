import { expect, test } from "@playwright/test";

test("taproom placeholder loads", async ({ page }) => {
  await page.goto("/steampunk-shuffle/");
  // A brand-new player sees the dedication screen (design.md §14.1) then
  // lands in the tutorial (§13), not the pub hub — seed both done so this
  // stays a smoke test of the taproom.
  await page.evaluate(() => {
    const L = (n: string): string => {
      let r = JSON.parse(localStorage.getItem("ws:ledgers") ?? "null");
      if (!r) {
        r = { activeId: "0e2e0000-0000-4000-8000-000000000001", ledgers: [{ id: "0e2e0000-0000-4000-8000-000000000001", name: "Sara", createdAt: "2026-11-06T00:00:00.000Z", lastPlayedAt: "2026-11-06T00:00:00.000Z", summary: { title: "Newcomer", wins: 0, collectionCount: 0 } }] };
        localStorage.setItem("ws:ledgers", JSON.stringify(r));
      }
      return `ws:${r.activeId}:${n}`;
    };
    localStorage.setItem(L("tutorial-state"), JSON.stringify({ completed: true, matchesPlayed: 0, shownHints: [] }));
    localStorage.setItem(L("player"), JSON.stringify({ name: "Sara", dedicationSeen: true }));
  });
  await page.reload();
  await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
});

test("manifest is linked and installable metadata is present", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("Native"), "the native bundle ships no manifest or service worker (CLAUDE.md, iOS wrap)");
  await page.goto("/steampunk-shuffle/");
  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(manifestHref).toBeTruthy();
});
