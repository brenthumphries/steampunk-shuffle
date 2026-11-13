import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { dismissHubHint, noonOn, openWithSave, playMatchToEnd, readKey, SEASONS_SEEN, START } from "./helpers/game";

// Release 1.1 (plan 14 §2.2): send a ledger as a .wheatstone file and receive it
// on a "fresh install", through the real screens. On the web with no file
// sharing the send is a download, which is what Playwright can observe.

const PUB = { checks: 61, totalWins: 12, opponents: {}, collection: ["hiawatha"], lastDailyBonusDate: null, ...SEASONS_SEEN };
const buffer = (text: string) => ({ name: "sent.wheatstone", mimeType: "application/json", buffer: Buffer.from(text) });

async function openSaveScreen(page: Page): Promise<void> {
  for (let i = 0; i < 4; i += 1) await dismissHubHint(page); // a fresh ledger queues a few beer mats
  await page.getByRole("button", { name: "Save & data" }).click();
  await expect(page.getByRole("button", { name: "Send this ledger" })).toBeVisible();
}

async function sendLedger(page: Page): Promise<{ name: string; text: string }> {
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Send this ledger" }).click();
  const file = await download;
  return { name: file.suggestedFilename(), text: readFileSync((await file.path())!, "utf8") };
}

test.describe("ledger files", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(noonOn(2026, 11, 10));
  });

  test("send, then receive on a fresh install: the same ledger comes back", async ({ page }) => {
    await openWithSave(page, { tutorialDone: true, pub: PUB });
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
    await openSaveScreen(page);
    const sent = await sendLedger(page);
    expect(sent.name).toBe("sara-2026-11-10.wheatstone");
    const sentPub = await readKey<unknown>(page, "pub-state");

    // A different phone: its own ledger (another id), none of Sara's.
    await page.evaluate(() => {
      localStorage.clear();
      const id = "0e2e0000-0000-4000-8000-000000000002";
      const now = "2026-11-06T00:00:00.000Z";
      localStorage.setItem("ws:ledgers", JSON.stringify({ activeId: id, ledgers: [{ id, name: "Mum", createdAt: now, lastPlayedAt: now, summary: { title: "Newcomer", wins: 0, collectionCount: 0 } }] }));
      localStorage.setItem(`ws:${id}:tutorial-state`, JSON.stringify({ completed: true, matchesPlayed: 0, shownHints: [] }));
      localStorage.setItem(`ws:${id}:player`, JSON.stringify({ name: "Mum", dedicationSeen: true }));
    });
    await page.goto(START);
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
    await dismissHubHint(page);
    await openSaveScreen(page);
    await page.locator(".save-screen-file-input").setInputFiles(buffer(sent.text));
    await expect(page.getByRole("heading", { name: "Receive a ledger" })).toBeVisible();
    await page.getByRole("button", { name: "Add to the shelf" }).click();
    await page.getByRole("button", { name: "The Ledger Shelf" }).click();
    await expect(page.locator(".ledger-book")).toHaveCount(2);
    await page.locator(".ledger-book", { hasText: "Sara" }).getByRole("button", { name: "Switch" }).click();
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
    expect(await readKey<unknown>(page, "pub-state")).toEqual(sentPub);
    await expect(page.locator(".checks-badge-value")).toHaveText("61");
  });

  test("the same ledger again: both summaries, Keep both makes a second copy", async ({ page }) => {
    await openWithSave(page, { tutorialDone: true, pub: PUB });
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
    await openSaveScreen(page);
    const sent = await sendLedger(page);
    await page.locator(".save-screen-file-input").setInputFiles(buffer(sent.text));
    await expect(page.getByText("already on the shelf")).toBeVisible();
    await expect(page.locator(".ledger-book")).toHaveCount(2);
    await expect(page.getByRole("button", { name: "Replace (backup first)" })).toBeVisible();
    await page.getByRole("button", { name: "Keep both" }).click();
    await expect(page.getByText("Sara (2) is on the shelf.")).toBeVisible();
    await page.getByRole("button", { name: "The Ledger Shelf" }).click();
    await expect(page.locator(".ledger-book")).toHaveCount(2);
  });

  test("a damaged file is refused and nothing changes", async ({ page }) => {
    await openWithSave(page, { tutorialDone: true, pub: PUB });
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
    await openSaveScreen(page);
    const sent = await sendLedger(page);
    expect(sent.text).toContain('totalWins\\":12');
    await page.locator(".save-screen-file-input").setInputFiles(buffer(sent.text.replace('totalWins\\":12', 'totalWins\\":99')));
    await expect(page.getByText(/damaged/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Add to the shelf" })).toHaveCount(0);
  });

  test("a file opened from outside the app lands on the receive screen", async ({ page }) => {
    await openWithSave(page, { tutorialDone: true, pub: PUB });
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
    await openSaveScreen(page);
    const sent = await sendLedger(page);
    await page.evaluate((text) => window.wheatstoneReceiveLedger?.(text), sent.text);
    await expect(page.getByRole("heading", { name: "Receive a ledger" })).toBeVisible();
    await expect(page.getByText("already on the shelf")).toBeVisible();
  });

  test("a file arriving mid-match: Back returns to the same match", async ({ page }) => {
    await openWithSave(page, { tutorialDone: true, pub: PUB });
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
    await openSaveScreen(page);
    const sent = await sendLedger(page);
    await page.getByRole("button", { name: "Back to the taproom" }).click();
    await page.getByRole("button", { name: /Play Constable Tobias Mudd/ }).click();
    await playMatchToEnd(page, { seed: 3, stopAfterTaps: 4 });
    const before = await readKey(page, "active-match");
    expect(before).not.toBeNull();
    await page.evaluate((text) => window.wheatstoneReceiveLedger?.(text), sent.text);
    await expect(page.getByRole("heading", { name: "Receive a ledger" })).toBeVisible();
    await page.getByRole("button", { name: "Back" }).first().click();
    await expect(page.getByText(/Round [123] of 3/)).toBeVisible();
    expect(await readKey(page, "active-match")).toEqual(before);
  });
});
