import { expect, test } from "@playwright/test";

// The Fortune-teller's Booth (design.md §17.2). The Cunning Folk pack is authored in N-D,
// so the host is seeded directly into the save (hostsMet) with a first launch of Nov 1.

const START = "/steampunk-shuffle/";

async function seed(page: import("@playwright/test").Page, hostMet: boolean): Promise<void> {
  await page.goto(START);
  await page.evaluate((met) => {
    const L = (n: string): string => {
      let r = JSON.parse(localStorage.getItem("ws:ledgers") ?? "null");
      if (!r) {
        r = { activeId: "0e2e0000-0000-4000-8000-000000000001", ledgers: [{ id: "0e2e0000-0000-4000-8000-000000000001", name: "Sara", createdAt: "2026-11-06T00:00:00.000Z", lastPlayedAt: "2026-11-06T00:00:00.000Z", summary: { title: "Newcomer", wins: 0, collectionCount: 0 } }] };
        localStorage.setItem("ws:ledgers", JSON.stringify(r));
      }
      return `ws:${r.activeId}:${n}`;
    };
    localStorage.clear();
    localStorage.setItem(L("tutorial-state"), JSON.stringify({ completed: true, matchesPlayed: 5, shownHints: ["hub"] }));
    localStorage.setItem(L("player"), JSON.stringify({ name: "Sara", dedicationSeen: true }));
    localStorage.setItem(L("pub-state"),
      JSON.stringify({
        checks: 0,
        totalWins: 0,
        opponents: {},
        collection: [],
        lastDailyBonusDate: null,
        hostsMet: met ? ["pamela-colman-smith"] : [],
        ledger: { firstLaunch: "2026-11-01" },
        giftsClaimed: { "cunning-folk": { "2026": ["left-on-the-step", "cunning-woman", "almanack-seller"] } },
        bannersSeen: { "cunning-folk": [2026] },
      }),
    );
  }, hostMet);
}

test("before Pixie arrives the hub shows nothing of the booth", async ({ page }) => {
  await seed(page, false);
  await page.goto(`${START}?now=2026-11-12&preview=1`);
  await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
  await expect(page.getByText("Fortune-teller's Booth")).toHaveCount(0);
  await expect(page.locator(".omen-chip")).toHaveCount(0);
});

test("the booth draws one card a day, shows the omen on the hub, and fills the album", async ({ page }) => {
  await seed(page, true);
  await page.goto(`${START}?now=2026-11-14&preview=1`);
  await page.getByRole("button", { name: /Fortune-teller's Booth/ }).click();

  await page.getByRole("button", { name: "Draw back the curtain" }).click();
  await expect(page.locator(".booth-mat .booth-line")).toBeVisible();
  await expect(page.locator(".booth-omen")).toContainText("Omen:");
  const name = await page.locator(".booth-card-name").innerText();
  expect(["The Fool", "The Magician"]).toContain(name);

  // Back at the bar, today's omen is a chip.
  await page.getByRole("button", { name: "Back to the bar" }).click();
  await expect(page.locator(".omen-chip")).toContainText(name);

  // A second visit shows the same card and sends her away.
  await page.getByRole("button", { name: /Fortune-teller's Booth/ }).click();
  await expect(page.locator(".booth-card-name")).toHaveText(name);
  await expect(page.getByText("Come back tomorrow, love.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Draw back the curtain" })).toHaveCount(0);

  // The album: 22 slots, one drawn, one face-down, twenty locked.
  await page.getByRole("button", { name: "Tarot album" }).click();
  await expect(page.locator(".tarot-slot")).toHaveCount(22);
  await expect(page.locator('.tarot-slot[data-state="drawn"]')).toHaveCount(1);
  await expect(page.locator('.tarot-slot[data-state="undrawn"]')).toHaveCount(1);
  await expect(page.locator('.tarot-slot[data-state="locked"]')).toHaveCount(20);
  await page.locator('.tarot-slot[data-state="drawn"]').click();
  await expect(page.locator(".tarot-detail .booth-line")).toBeVisible();
});
