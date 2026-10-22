import { expect, test } from "@playwright/test";

// The launch intro (src/ui/introScreen.ts). Automated browsers skip it by
// default so the other specs don't wait on a film; `?intro=1` forces it on.
// The mp4 request is held open rather than served: headless builds differ on
// H.264 support (a decode error would end the intro on its own, which is its
// own unit-tested path), and this spec is about the screen and the tap to skip.

test("the launch intro plays first and a tap skips to the game", async ({ page }) => {
  await page.route("**/video/intro.mp4", () => {});
  await page.goto("/steampunk-shuffle/");
  await page.evaluate(() => {
    localStorage.setItem("steampunk-shuffle:tutorial-state", JSON.stringify({ completed: true, matchesPlayed: 0, shownHints: [] }));
    localStorage.setItem("steampunk-shuffle:player", JSON.stringify({ name: "Sara", dedicationSeen: true }));
  });
  // "commit", not the default "load": WebKit and Firefox can hold the load event
  // open while a media request is pending, and the held-open mp4 here never answers.
  await page.goto("/steampunk-shuffle/?intro=1", { waitUntil: "commit" });
  const video = page.locator("video.intro-video");
  await expect(video).toHaveCount(1);
  expect((await page.locator(".intro-screen").boundingBox())?.width).toBeLessThanOrEqual(402);
  await page.locator(".intro-screen").click();
  await expect(video).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
});

test("without the flag, automation skips straight to the game", async ({ page }) => {
  await page.goto("/steampunk-shuffle/");
  await expect(page.locator("video.intro-video")).toHaveCount(0);
});
