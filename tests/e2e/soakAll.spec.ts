import { expect, test } from "@playwright/test";
import { legendsInTown, OPPONENTS } from "../../src/pub/opponents";
import { expectNoErrors, leaveTable, noonOn, openWithSave, playMatchToEnd, readKey, readPub, START, watchErrors } from "./helpers/game";

// One real match, played by the autopilot through the real UI, against every
// opponent in the game: all 15 everyday opponents, the five Hallowe'en
// visitors, and Spring-Heeled Jack inside The All Hallows' Wake. Slow (about
// a minute each, more for the Legend dial), so it only runs on request:
//   SOAK_ALL=1 npx playwright test soakAll
// Fails on a stalled match, an uncaught error, or a failed request.

test.skip(!process.env.SOAK_ALL, "opt-in: set SOAK_ALL=1");
test.describe.configure({ timeout: 420_000 });

// These specs test the game, not the PWA, and reload the page constantly. The
// Pages build's service worker (the existing specs cover it) then logs errors
// of its own when a navigation interrupts it: "sw.js load failed" in WebKit,
// "A ServiceWorker intercepted the request and encountered an unexpected error"
// and "Navigated away from page" in Firefox. The native bundle has none.
test.use({ serviceWorkers: "block" });


const PUB = { checks: 100, totalWins: 40, opponents: {}, collection: [], lastDailyBonusDate: null, lastLostAndFoundDate: null, pawnedCards: [], pawnbrokerPurchasedToday: [], pawnbrokerPurchaseDate: null };

/** A November day on which `opponentId` (a Legend) is one of the two in town. */
function dayWithLegend(opponentId: string): Date {
  for (let day = 1; day <= 30; day += 1) {
    const date = noonOn(2026, 11, day);
    if (legendsInTown(date).includes(opponentId)) return date;
  }
  throw new Error(`no day in November has ${opponentId} in town`);
}

const EVERYDAY = OPPONENTS.filter((o) => !o.tournamentOnly && o.tier !== "visitor");
const VISITORS = OPPONENTS.filter((o) => o.tier === "visitor");

for (const opponent of EVERYDAY) {
  test(`plays out against ${opponent.name}`, async ({ page }) => {
    const log = watchErrors(page);
    await page.clock.setFixedTime(opponent.tier === "legend" ? dayWithLegend(opponent.id) : noonOn(2026, 11, 5));
    await openWithSave(page, { tutorialDone: true, pub: PUB });
    await page.getByRole("button", { name: `Play ${opponent.name}` }).click();
    await expect(page.locator(".overlay--coin-toss")).toBeVisible();
    const started = Date.now();
    const result = await playMatchToEnd(page, { seed: opponent.id.length * 31 });
    console.log(`${opponent.id}: ${result.outcome} in ${Math.round((Date.now() - started) / 1000)}s, ${result.taps} taps`);
    await leaveTable(page);
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
    expect(await readKey(page, "active-match")).toBeNull();
    expect((await readPub(page)).checks).toBeGreaterThanOrEqual(100);
    expectNoErrors(log);
  });
}

for (const opponent of VISITORS) {
  test(`plays out against the visitor ${opponent.name}`, async ({ page }) => {
    const log = watchErrors(page);
    await page.clock.setFixedTime(noonOn(2026, 10, 20));
    await openWithSave(page, { tutorialDone: true, pub: PUB });
    await page.getByRole("button", { name: `Play ${opponent.name}` }).click();
    await expect(page.locator(".overlay--coin-toss")).toBeVisible();
    const started = Date.now();
    const result = await playMatchToEnd(page, { seed: opponent.id.length * 17 });
    console.log(`${opponent.id}: ${result.outcome} in ${Math.round((Date.now() - started) / 1000)}s, ${result.taps} taps`);
    await leaveTable(page);
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
    expectNoErrors(log);
  });
}

test("plays out against Spring-Heeled Jack, seated in The All Hallows' Wake", async ({ page }) => {
  const log = watchErrors(page);
  await page.clock.setFixedTime(noonOn(2026, 10, 25));
  await openWithSave(page, { tutorialDone: true, pub: PUB });
  await page.getByRole("button", { name: "The chalkboard" }).click();
  await page.locator(".tournament-row").filter({ hasText: "The All Hallows' Wake" }).getByRole("button", { name: /Enter/ }).click();
  // Seat Jack in the quarterfinal: the bracket draws him at random otherwise.
  await page.evaluate(() => {
    const key = "steampunk-shuffle:tournament-state";
    const state = JSON.parse(localStorage.getItem(key)!);
    state.active.playerMatches[0].opponentId = "spring-heeled-jack";
    localStorage.setItem(key, JSON.stringify(state));
  });
  await page.reload();
  await page.getByRole("button", { name: "The chalkboard" }).click();
  await page.getByRole("button", { name: "Resume" }).click();
  await page.getByRole("button", { name: /Play Quarterfinal/ }).click();
  await expect(page.locator(".overlay--coin-toss")).toBeVisible();
  const result = await playMatchToEnd(page, { seed: 9 });
  console.log(`spring-heeled-jack: ${result.outcome}, ${result.taps} taps`);
  await leaveTable(page);
  await expect(page.locator(".bracket-screen")).toBeVisible();
  expectNoErrors(log);
  void START;
});

// Volume: SOAK_REPEAT=60 plays that many extra matches, cycling through the
// opponents with a different tap seed each time, to shake out card-specific
// target-picking and animation holds that one game per opponent can miss.
const REPEAT = Number(process.env.SOAK_REPEAT ?? 0);
for (let n = 0; n < REPEAT; n += 1) {
  const opponent = EVERYDAY[n % EVERYDAY.length]!;
  test(`repeat ${n + 1}/${REPEAT}: ${opponent.name}`, async ({ page }) => {
    const log = watchErrors(page);
    await page.clock.setFixedTime(opponent.tier === "legend" ? dayWithLegend(opponent.id) : noonOn(2026, 11, 5));
    await openWithSave(page, { tutorialDone: true, pub: PUB });
    await page.getByRole("button", { name: `Play ${opponent.name}` }).click();
    await expect(page.locator(".overlay--coin-toss")).toBeVisible();
    const result = await playMatchToEnd(page, { seed: 1000 + n * 13 });
    console.log(`repeat ${n + 1}: ${opponent.id} ${result.outcome}, ${result.taps} taps`);
    await leaveTable(page);
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
    expectNoErrors(log);
  });
}
