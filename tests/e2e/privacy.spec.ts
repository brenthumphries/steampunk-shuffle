import { expect, test } from "@playwright/test";
import { dismissHubHint, leaveTable, noonOn, openWithSave, playMatchToEnd, START } from "./helpers/game";

// The App Privacy answer is "Data Not Collected" (docs/app-privacy-answers.md,
// public/privacy.html). This is the runtime half of the proof behind it, run
// on the Pages build and the native bundle: through the screens a player
// uses, the app makes no request to anything but its own origin, uses no
// WebSocket, sets no cookie, and keeps nothing on the device except the keys
// the privacy page lists. If this ever fails, the privacy page and the App
// Privacy answers are wrong until someone looks at why.

// Device-wide keys, then the per-ledger shape `ws:<uuid>:<name>` (release 1.1,
// design.md §12.5). A fresh install makes no pre-1.1 `steampunk-shuffle:*`
// per-game key at all; those exist only on a device that held an old save, for 30 days
// (public/privacy.html), and the migration test in ledgers.spec.ts covers that path.
const DOCUMENTED_GLOBAL_KEYS = ["steampunk-shuffle:audio-muted", "ws:ledgers", "ws:backup:v1"];
const LEDGER_STORES = ["active-match", "deck-slots", "player", "pub-state", "tournament-state", "tutorial-state"];
const LEDGER_KEY = new RegExp(`^ws:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}:(${LEDGER_STORES.join("|")})$`);
const isDocumentedKey = (key: string): boolean => DOCUMENTED_GLOBAL_KEYS.includes(key) || LEDGER_KEY.test(key);

test.describe.configure({ timeout: 240_000 });

test("a session through every screen sends nothing off the device and stores only the documented keys", async ({ page, context, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const requests: string[] = [];
  const sockets: string[] = [];
  context.on("request", (request) => requests.push(`${request.method()} ${request.url()}`));
  page.on("websocket", (socket) => sockets.push(socket.url()));

  await page.clock.setFixedTime(noonOn(2026, 10, 30)); // her birthday: the dedication, the Invitational and the Hallowe'en layer are all live
  await openWithSave(page, null);

  // Dedication, then the whole tutorial and its reward.
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await playMatchToEnd(page, { seed: 7 });
  await leaveTable(page);
  await page.locator(".beer-mat-dismiss").click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();

  // The hub's other screens.
  await page.getByRole("button", { name: "Save & data" }).click();
  await expect(page.getByRole("button", { name: "Send this ledger" })).toBeVisible();
  await page.getByRole("button", { name: "Back to the taproom" }).click();
  await page.getByRole("button", { name: "House Rules" }).click();
  await page.getByRole("button", { name: /Back to the (bar|taproom)/ }).click();
  await page.getByRole("button", { name: "Build a deck" }).click();
  await page.getByRole("button", { name: "Back to the taproom" }).click();
  await page.getByRole("button", { name: "The back room" }).click();
  await page.getByRole("button", { name: "Take it" }).click();
  await page.getByRole("button", { name: "Collect" }).click();
  await page.getByRole("button", { name: "Back to the bar" }).click();
  await page.getByRole("button", { name: "The chalkboard" }).click();
  await page.locator(".tournament-row").filter({ hasText: "The Birthday Invitational" }).getByRole("button", { name: /Enter/ }).click();
  await expect(page.locator(".bracket-stage")).toHaveCount(3);
  await page.getByRole("button", { name: "Back to the chalkboard" }).click();
  await page.getByRole("button", { name: "Back to the bar" }).click();

  // A pickup match with the mute toggle used, then a reload to read everything back.
  await page.getByRole("button", { name: /Play Constable Tobias Mudd/ }).click();
  await playMatchToEnd(page, { seed: 3, stopAfterTaps: 6 });
  await page.reload();
  // Six autopilot taps can end round 1; the point is that the match resumed after the reload.
  await expect(page.getByText(/Round [12] of 3/)).toBeVisible();

  const offDevice = requests.filter((entry) => !entry.split(" ")[1]!.startsWith(origin) && !entry.split(" ")[1]!.startsWith("data:") && !entry.split(" ")[1]!.startsWith("blob:"));
  expect(offDevice, "requests to any other origin").toEqual([]);
  expect(requests.filter((entry) => !entry.startsWith("GET ")), "anything but GET (nothing is ever posted)").toEqual([]);
  expect(requests.length, "the session really did load the app").toBeGreaterThan(20);
  expect(sockets, "WebSocket connections").toEqual([]);

  const stored = await page.evaluate(() => ({
    cookie: document.cookie,
    keys: Object.keys(localStorage).sort(),
    session: Object.keys(sessionStorage),
  }));
  expect(stored.cookie, "cookies").toBe("");
  expect(stored.session, "sessionStorage keys").toEqual([]);
  expect(stored.keys.filter((key) => !isDocumentedKey(key)), "localStorage keys the privacy page does not list").toEqual([]);
  expect(stored.keys.some((key) => key.endsWith(":pub-state") && LEDGER_KEY.test(key)), "the game does save its progress").toBe(true);
  expect(stored.keys, "and keeps its ledger registry").toContain("ws:ledgers");
  void START;
});

test("the privacy page is served, readable, and loads nothing from anywhere else", async ({ page, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));

  const response = await page.goto(`${START}privacy.html`);
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Privacy/);
  await expect(page.getByRole("heading", { name: "Privacy", exact: true })).toBeVisible();
  await expect(page.getByText("this game collects nothing about you")).toBeVisible();

  expect(await page.locator("script").count(), "no scripts on the page").toBe(0);
  expect(requests.filter((url) => !url.startsWith(origin)), "requests to other origins").toEqual([]);
  // Readable on a phone: no sideways scroll at 402px wide.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  // The two outbound links are plain links, and the way back to the game works.
  const links = await page.locator("a[href^='http']").evaluateAll((nodes) => nodes.map((node) => (node as HTMLAnchorElement).href));
  expect(links.sort()).toEqual(["https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement", "https://github.com/brenthumphries/steampunk-shuffle/issues"]);
  await page.getByRole("link", { name: "Back to the game" }).click();
  await expect(page.locator("#app")).toBeAttached();
});

test("sending and receiving a ledger touches no network and adds no storage key", async ({ page, context, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const requests: string[] = [];
  context.on("request", (request) => requests.push(`${request.method()} ${request.url()}`));
  await page.clock.setFixedTime(noonOn(2026, 11, 10));
  await openWithSave(page, { tutorialDone: true });
  await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
  for (let i = 0; i < 4; i += 1) await dismissHubHint(page);
  await page.getByRole("button", { name: "Save & data" }).click();
  const keysBefore = await page.evaluate(() => Object.keys(localStorage).sort());
  requests.length = 0;

  // With the Web Share API present (as on a phone) the file goes to the share sheet; the test records what was handed over.
  await page.evaluate(() => {
    const w = window as unknown as { __shared: string[] };
    w.__shared = [];
    Object.assign(navigator, {
      canShare: () => true,
      share: async (data: { files: File[] }) => void w.__shared.push(...data.files.map((f) => f.name)),
    });
  });
  await page.getByRole("button", { name: "Send this ledger" }).click();
  await expect(page.getByText("Shared.")).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __shared: string[] }).__shared)).toEqual(["sara-2026-11-10.wheatstone"]);

  // Receiving it back reads the picked file and nothing more.
  await page.evaluate(async () => {
    const text = JSON.stringify({ hello: "not a ledger" });
    window.wheatstoneReceiveLedger?.(text);
  });
  await expect(page.getByRole("heading", { name: "Receive a ledger" })).toBeVisible();

  expect(requests.filter((entry) => !entry.split(" ")[1]!.startsWith(origin) && !entry.split(" ")[1]!.startsWith("data:") && !entry.split(" ")[1]!.startsWith("blob:")), "requests to any other origin").toEqual([]);
  expect(requests.filter((entry) => !entry.startsWith("GET ")), "anything but GET").toEqual([]);
  expect(await page.evaluate(() => Object.keys(localStorage).sort().filter((k) => !k.startsWith("ws:") && !k.startsWith("steampunk-shuffle:")))).toEqual([]);
  expect((await page.evaluate(() => Object.keys(localStorage).sort())).length).toBe(keysBefore.length);
});
