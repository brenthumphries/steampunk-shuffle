import { expect, test, type Locator, type Page } from "@playwright/test";

// Plan step 2.1's exit check: "full match playable on your phone" at the
// 402×874 iPhone 17 viewport (playwright.config.ts's only project). These
// smoke tests don't play a whole match (real games are random-shuffled and
// AI-paced) — they check the mechanics design.md §6.4 calls out: staging a
// card before it commits, undoing it, committing it, and the card-zoom
// overlay.

/** A fresh (non-resumed) match opens on a one-beat coin-toss overlay (PT-11) that blocks the hand until dismissed. */
async function dismissCoinToss(page: Page): Promise<void> {
  await page.locator(".overlay--coin-toss button", { hasText: "Continue" }).click();
}

/**
 * PT-34: a real (random-shuffled) match can hit an on-play/discard or
 * instant-announce hold at any point — either side's play might have an
 * ability, affect a target, or cause a discard — and each one now waits on
 * a "Continue" tap instead of a timer. A test that just wants the match to
 * keep moving polls until `isVisible` is true, tapping away any "Continue"
 * it finds along the way rather than assuming none will appear.
 */
async function waitVisibleDismissingContinues(page: Page, isVisible: () => Promise<boolean>, timeoutMs = 10_000): Promise<void> {
  await expect
    .poll(
      async () => {
        const continueBtn = page.getByRole("button", { name: "Continue" });
        if (await continueBtn.isVisible().catch(() => false)) await continueBtn.click().catch(() => undefined);
        return isVisible().catch(() => false);
      },
      { timeout: timeoutMs },
    )
    .toBe(true);
}

/**
 * A self-discarding Scheme/Headline (design.md's "Instant" cards — Inspector's
 * Warrant, Séance in the starter deck) resolves and discards atomically, so it
 * never occupies `.board-row`; a Location (The Parsonage Snug) mounts in the
 * separate location slot instead. A test that plays "the first tappable card"
 * and then expects to find it in `.board-row .card` excludes these three by
 * name — pre-existing gap (this pattern predates PT-33/PT-34), not something
 * either fix introduced, but worth closing now that it's understood.
 */
const OFF_BOARD_CARD_NAMES = /Inspector's Warrant|Séance|The Parsonage Snug/;
function boardBoundTappableCard(page: Page): Locator {
  return page.locator(".hand-row .card--tappable").filter({ hasNotText: OFF_BOARD_CARD_NAMES }).first();
}

test.describe("match screen (plan step 2.1)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/steampunk-shuffle/");
    // A brand-new player sees the dedication screen (design.md §14.1) then
    // lands in the tutorial (§13) instead of the pub hub — these tests
    // exercise the generic match screen, not either of those, so seed both
    // already done. `matchesPlayed: 0` deliberately avoids two separate
    // hint triggers that don't matter to these tests but can cover a
    // button they click: `isWithinHintWindow`'s 1-3 range (design.md
    // §13.3's in-match hint chips) and the pub hub's own "hub" hint at
    // matchesPlayed >= 4 (src/main.ts) — no e2e test here exercises either.
    // Was `matchesPlayed: 1` (inside the in-match window) and flaked
    // intermittently on exactly that; `10` first as a fix accidentally
    // landed in the >= 4 hub-hint range instead, breaking a different test.
    await page.evaluate(() => {
      localStorage.setItem("steampunk-shuffle:tutorial-state", JSON.stringify({ completed: true, matchesPlayed: 0, shownHints: [] }));
      localStorage.setItem("steampunk-shuffle:player", JSON.stringify({ name: "Sara", dedicationSeen: true }));
    });
    await page.reload();
  });

  test("staging a card shows Play/Cancel before it commits, and Cancel takes it back (design.md §6.4)", async ({ page }) => {
    await page.getByRole("button", { name: "Play Constable Tobias Mudd" }).click();
    await dismissCoinToss(page);
    await expect(page.getByText("Round 1 of 3")).toBeVisible();

    // Plan step 3.3 extension: the round/turn/whose-turn HUD — round and
    // turn both read "1" on a fresh match, and exactly one lamp is lit
    // (readable by light state + fixed position, never both/neither).
    await expect(page.locator(".round-gauge-label")).toHaveText("Round 1 of 3");
    await expect(page.locator(".turn-dial-label")).toHaveText("Turn 1 of 3");
    const litLamps = page.locator('.turn-lamp[data-lit="true"]');
    await expect(litLamps).toHaveCount(1);

    // Whoever leads is decided by a coin toss (design.md §6.1) — wait out
    // the AI's opening move if it went first, dismissing any "Continue"
    // hold (PT-34) its play might need.
    const firstCard = page.locator(".hand-row .card--tappable").first();
    await waitVisibleDismissingContinues(page, () => firstCard.isVisible());

    // It's the human's turn now (the hand is tappable) — the human lamp
    // must be the lit one, matching currentPlayer().
    await expect(page.locator('.turn-lamp--human[data-lit="true"]')).toHaveCount(1);
    await expect(page.locator('.turn-lamp--ai[data-lit="true"]')).toHaveCount(0);

    const handLabelBefore = await page.locator(".hand-label").textContent();
    await firstCard.click();
    await expect(page.getByRole("button", { name: "Play", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();

    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("button", { name: "Play", exact: true })).toHaveCount(0);
    await expect(page.locator(".hand-label")).toHaveText(handLabelBefore ?? "");
  });

  test("playing a card commits it to the board and the match keeps moving", async ({ page }) => {
    await page.getByRole("button", { name: "Play Constable Tobias Mudd" }).click();
    await dismissCoinToss(page);

    // Whoever leads might play an on-play-ability card first, holding on a
    // "Continue" (PT-34) before the human's own turn — dismiss any of those
    // rather than assuming the AI's opening move never needs one. Also
    // avoid a card that would never land on the board (see
    // boardBoundTappableCard) since this test asserts on `.board-row`.
    const firstCard = boardBoundTappableCard(page);
    await waitVisibleDismissingContinues(page, () => firstCard.isVisible());
    await firstCard.click();
    await page.getByRole("button", { name: "Play", exact: true }).click();

    await expect(page.locator(".board-row .card").first()).toBeVisible();
    // The AI replies (or the round ends) within a few seconds either way —
    // dismissing any "Continue" holds (PT-34) along the way.
    await waitVisibleDismissingContinues(page, () => page.getByText(/Your turn|took the round|Round tied/).isVisible());

    // Plan step 3.3 extension: once it's the human's turn again, the HUD's
    // whose-turn lamp and turn counter agree with the engine — never
    // off-by-one, including across the AI's reply in between.
    const roundText = await page.locator(".round-gauge-label").textContent();
    if (roundText === "Round 1 of 3") {
      await expect(page.locator('.turn-lamp--human[data-lit="true"]')).toHaveCount(1);
    }
  });

  test("card zoom opens a full-card detail overlay and closes on tap-away", async ({ page }) => {
    await page.getByRole("button", { name: "Play Constable Tobias Mudd" }).click();
    await dismissCoinToss(page);

    const zoomBtn = page.locator(".hand-row .card-zoom-btn").first();
    await expect(zoomBtn).toBeVisible({ timeout: 10_000 });
    await zoomBtn.click();

    const overlay = page.locator(".overlay--zoom");
    await expect(overlay).toBeVisible();
    await expect(overlay.locator(".card-flavor")).toBeVisible();

    await overlay.click({ position: { x: 5, y: 5 } });
    await expect(overlay).toHaveCount(0);
  });

  test("reloading mid-match resumes it instead of restarting (plan step 2.6, design.md §12.4)", async ({ page }) => {
    await page.getByRole("button", { name: "Play Constable Tobias Mudd" }).click();
    await dismissCoinToss(page);

    // Whoever leads might play an on-play-ability card first, holding on a
    // "Continue" (PT-34) before the human's own turn — dismiss any of those
    // rather than assuming the AI's opening move never needs one. Also
    // avoid a card that would never land on the board (see
    // boardBoundTappableCard) since this test asserts on `.board-row`
    // both before and after the reload.
    const firstCard = boardBoundTappableCard(page);
    await waitVisibleDismissingContinues(page, () => firstCard.isVisible());
    await firstCard.click();
    await page.getByRole("button", { name: "Play", exact: true }).click();
    await expect(page.locator(".board-row .card").first()).toBeVisible();

    await page.reload();

    await expect(page.getByText("Round 1 of 3")).toBeVisible();
    await expect(page.locator(".board-row .card").first()).toBeVisible();
  });
});
