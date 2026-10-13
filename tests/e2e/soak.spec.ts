import { expect, test } from "@playwright/test";
import { DAILY_BONUS_CHECKS, LOSE_CHECKS, WIN_CHECKS } from "../../src/pub/pubState";
import { readBracket, resumeFinishedTournamentMatch } from "./helpers/game";
import { collectReveals, dismissHubHint, expectNoErrors, leaveTable, noonOn, openWithSave, playMatchToEnd, readKey, readPub, START, watchErrors } from "./helpers/game";

// Pre-TestFlight soak (ATT-26): long, real-UI runs of the paths a player
// takes, on every Playwright project (the Native project is the iOS bundle).
// Every test watches for uncaught errors and failed requests, and the
// autopilot fails a match that stops changing. The clock is pinned to a
// date outside the Hallowe'en window so a run on any real day behaves the
// same; the birthday and seasonal dates live in birthday.spec.ts.

const QUIET_DAY = noonOn(2026, 11, 5);

test.describe.configure({ timeout: 300_000 });

// These specs test the game, not the PWA, and reload the page constantly. The
// Pages build's service worker (the existing specs cover it) then logs errors
// of its own when a navigation interrupts it: "sw.js load failed" in WebKit,
// "A ServiceWorker intercepted the request and encountered an unexpected error"
// and "Navigated away from page" in Firefox. The native bundle has none.
test.use({ serviceWorkers: "block" });


test.describe("soak", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(QUIET_DAY);
  });

  test("a new player: dedication, the whole tutorial, the reward, and the pub hub", async ({ page }) => {
    const log = watchErrors(page);
    await openWithSave(page, null);

    await expect(page.getByText("Licensed to")).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("You're expected. Your chair's by the fire.")).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Round 1 of 3")).toBeVisible();

    const result = await playMatchToEnd(page, { seed: 7 });
    // The tutorial is scripted so the house always loses to the player's forced line.
    expect(result.outcome).toBe("win");
    await leaveTable(page);

    await expect(page.getByText("Table's yours")).toBeVisible();
    await expect(page.getByText(/You've been given The Village Constable, and 10 Checks\./)).toBeVisible();
    await page.locator(".beer-mat-dismiss").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();

    const pub = await readPub(page);
    expect(pub.checks).toBe(10);
    expect(pub.totalWins).toBe(0);
    expect(await readKey<{ completed: boolean }>(page, "tutorial-state")).toMatchObject({ completed: true });
    const slots = await readKey<{ selectedIndex: number | null; slots: { name: string }[] }>(page, "deck-slots");
    expect(slots?.selectedIndex).toBe(0);
    expect(slots?.slots[0]?.name).toBe("The Village Constable");
    await expect(page.getByText("Deck: The Village Constable")).toBeVisible();

    // A relaunch lands on the hub, not the tutorial or the dedication.
    await page.reload();
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
    expectNoErrors(log);
  });

  test("five pickup games across the tiers pay out and are recorded exactly", async ({ page }) => {
    const log = watchErrors(page);
    await openWithSave(page, {
      tutorialDone: true,
      pub: { checks: 100, totalWins: 40, opponents: {}, collection: [], lastDailyBonusDate: null, lastLostAndFoundDate: null, pawnedCards: [], pawnbrokerPurchasedToday: [], pawnbrokerPurchaseDate: null },
    });
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();

    // The house, two Regulars, a Seasoned and a Legend (today's Legends are fixed by the pinned date).
    const tiers = ["house", "regular", "seasoned", "legend", "regular"] as const;
    const seen: string[] = [];
    let dailyBonusPaid = false;
    for (const [index, tier] of tiers.entries()) {
      await dismissHubHint(page);
      const before = await readPub(page);
      const row = page.locator(".patron-row").filter({ has: page.locator(`.patron-tier--${tier}`) }).nth(tier === "regular" && index === 4 ? 1 : 0);
      const name = (await row.locator(".patron-name").textContent()) ?? tier;
      seen.push(`${tier}: ${name}`);
      await row.click();
      await expect(page.locator(".overlay--coin-toss")).toBeVisible();

      const result = await playMatchToEnd(page, { seed: 100 + index });
      await leaveTable(page);
      await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
      const after = await readPub(page);
      expect(await readKey(page, "active-match")).toBeNull();

      if (result.outcome === "draw") {
        // design.md §6.3: a draw pays nothing and counts as neither a win nor a loss, daily bonus included.
        expect(after).toEqual(before);
        continue;
      }

      const won = result.outcome === "win";
      const tierChecks = tier === "house" ? 0 : won ? WIN_CHECKS[tier] : LOSE_CHECKS;
      const bonus = dailyBonusPaid ? 0 : DAILY_BONUS_CHECKS;
      dailyBonusPaid = true;
      expect(after.checks - before.checks, `${name}: Checks for a ${result.outcome}`).toBe(tierChecks + bonus);
      expect(after.totalWins - before.totalWins).toBe(tier !== "house" && won ? 1 : 0);
      const id = Object.keys(after.opponents).find((key) => JSON.stringify(after.opponents[key]) !== JSON.stringify(before.opponents[key]));
      expect(id, `${name}: a record was written`).toBeDefined();
      const record = after.opponents[id!]!;
      expect(record.wins + record.losses).toBe((before.opponents[id!]?.wins ?? 0) + (before.opponents[id!]?.losses ?? 0) + 1);

      const revealed = await collectReveals(page);
      expect(revealed).toBe(won && tier !== "house" && !before.opponents[id!]?.rewardClaimed ? 1 : 0);
    }
    console.log(`soak pickups: ${seen.join(" | ")}`);
    expect((await readKey<{ matchesPlayed: number }>(page, "tutorial-state"))?.matchesPlayed).toBeGreaterThanOrEqual(5);
    expectNoErrors(log);
  });

  test("deck builder edits flow through to the next match and survive a reload", async ({ page }) => {
    const log = watchErrors(page);
    await openWithSave(page, {
      tutorialDone: true,
      pub: { checks: 50, totalWins: 0, opponents: {}, collection: ["sergeant-pike", "nells-basket"], lastDailyBonusDate: null, lastLostAndFoundDate: null, pawnedCards: [], pawnbrokerPurchasedToday: [], pawnbrokerPurchaseDate: null },
    });
    await page.getByRole("button", { name: "Build a deck" }).click();
    const slot = page.locator(".deck-slot-row").nth(2);
    await slot.locator(".deck-slot-info").click();
    await page.getByRole("button", { name: "Start from the Village Constable" }).click();
    await expect(page.getByText("20/20 cards · 37/60 points")).toBeVisible();

    // Swap two Constables on the Beat for the owned extras.
    await page.getByRole("button", { name: "Remove one Constable on the Beat" }).click();
    await page.getByRole("button", { name: "Remove one Constable on the Beat" }).click();
    await expect(page.getByText(/18\/20 cards/)).toBeVisible();
    await page.getByRole("button", { name: "Add one Sergeant Pike" }).click();
    await page.getByRole("button", { name: "Add one Nell's Basket" }).click();
    await expect(page.getByText(/20\/20 cards/)).toBeVisible();

    await page.getByLabel("Deck name").fill("Soak Test Deck");
    await page.getByRole("button", { name: "Done" }).click();
    const row = page.locator(".deck-slot-row").nth(2);
    await expect(row.getByText("Soak Test Deck")).toBeVisible();
    if (await row.getByText("Not legal").isVisible()) {
      // Over 60 points is allowed to build but not to select (CLAUDE.md, deck-builder gotcha).
      await expect(row.getByRole("button", { name: "Select" })).toBeDisabled();
      await row.locator(".deck-slot-info").click();
      await page.getByRole("button", { name: "Remove one Sergeant Pike" }).click();
      await page.getByRole("button", { name: "Add one Constable on the Beat" }).click();
      await page.getByRole("button", { name: "Done" }).click();
    }
    await expect(row.getByText("Legal")).toBeVisible();
    await row.getByRole("button", { name: "Select" }).click();
    await page.getByRole("button", { name: "Back to the taproom" }).click();
    await expect(page.getByText("Deck: Soak Test Deck")).toBeVisible();

    // The edited deck is the one dealt: the match save names it and holds exactly 20 cards.
    await page.getByRole("button", { name: "Play Constable Tobias Mudd" }).click();
    await page.locator(".overlay--coin-toss button", { hasText: "Continue" }).click();
    const save = await readKey<{ humanDeckName: string; humanDeck: { quantity: number }[] }>(page, "active-match");
    expect(save?.humanDeckName).toBe("Soak Test Deck");
    expect(save?.humanDeck.reduce((sum, entry) => sum + entry.quantity, 0)).toBe(20);

    // Reloading mid-match resumes it with the same deck, then the deck choice survives leaving it.
    await playMatchToEnd(page, { seed: 3, stopAfterTaps: 2 });
    await page.reload();
    await expect(page.getByText("Round 1 of 3")).toBeVisible();
    await page.getByRole("button", { name: "Leave Game" }).click();
    await page.getByRole("button", { name: "Leave anyway" }).click();
    await expect(page.getByText("Deck: Soak Test Deck")).toBeVisible();
    await page.reload();
    await expect(page.getByText("Deck: Soak Test Deck")).toBeVisible();
    expectNoErrors(log);
  });

  test("Leave Game partway through a pickup match pays a loss and clears the resume save", async ({ page }) => {
    const log = watchErrors(page);
    await openWithSave(page, { tutorialDone: true });
    await page.getByRole("button", { name: "Play Old Nell Ashby" }).click();
    await page.locator(".overlay--coin-toss button", { hasText: "Continue" }).click();
    await playMatchToEnd(page, { seed: 11, stopAfterTaps: 6 });

    await page.getByRole("button", { name: "Leave Game" }).click();
    await page.getByRole("button", { name: "Leave anyway" }).click();
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();

    const pub = await readPub(page);
    expect(pub.opponents["nell-ashby"]).toMatchObject({ wins: 0, losses: 1 });
    expect(pub.checks).toBe(LOSE_CHECKS + DAILY_BONUS_CHECKS);
    expect(await readKey(page, "active-match")).toBeNull();
    await page.reload();
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
    expect((await readPub(page)).checks).toBe(LOSE_CHECKS + DAILY_BONUS_CHECKS);
    expectNoErrors(log);
  });

  test("progress survives a reload after a finished match (the browser's localStorage fallback behind the save mirror)", async ({ page }) => {
    const log = watchErrors(page);
    await openWithSave(page, { tutorialDone: true });
    await page.getByRole("button", { name: /Play .*Reg Farrow/ }).click();
    const result = await playMatchToEnd(page, { seed: 21 });
    await leaveTable(page);
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
    const before = await readPub(page);

    await page.reload();
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
    expect(await readPub(page)).toEqual(before);
    if (result.outcome !== "draw") {
      await expect(page.locator(".patron-row").filter({ hasText: "Reg Farrow" }).locator(".patron-record")).toBeVisible();
    }
    expectNoErrors(log);
  });

  async function enterKnockout(page: import("@playwright/test").Page, checks = 200): Promise<void> {
    await openWithSave(page, {
      tutorialDone: true,
      pub: { checks, totalWins: 0, opponents: {}, collection: [], lastDailyBonusDate: null, lastLostAndFoundDate: null, pawnedCards: [], pawnbrokerPurchasedToday: [], pawnbrokerPurchaseDate: null },
    });
    await page.getByRole("button", { name: "The chalkboard" }).click();
    await page.locator(".tournament-row").filter({ hasText: "The Tuesday Knockout" }).getByRole("button", { name: /Enter/ }).click();
    await expect(page.locator(".bracket-stage")).toHaveCount(3);
  }

  test("a tournament won start to finish: three matches, the champion screen, the prize", async ({ page }) => {
    const log = watchErrors(page);
    await enterKnockout(page);
    expect((await readPub(page)).checks).toBe(200 - 20);

    for (const stage of [0, 1, 2]) {
      await resumeFinishedTournamentMatch(page, "A");
      await expect(page.getByText("You took the table")).toBeVisible();
      await leaveTable(page);
      if (stage < 2) {
        await expect(page.locator(".bracket-stage").nth(stage).getByText("Won")).toBeVisible();
        await expect(page.locator(".bracket-stage").nth(stage + 1).getByRole("button", { name: "Play" })).toBeVisible();
        await page.reload(); // the bracket survives a relaunch between matches
        await expect(page.locator(".bracket-stage")).toHaveCount(0); // a relaunch lands on the hub, not the ladder
        await page.getByRole("button", { name: "The chalkboard" }).click();
        await page.getByRole("button", { name: "Resume" }).click();
        await expect(page.locator(".bracket-stage").nth(stage).getByText("Won")).toBeVisible();
      }
    }

    await expect(page.getByText("Champion: The Tuesday Knockout!")).toBeVisible();
    await expect(page.getByText("You won 60 Checks.")).toBeVisible();
    await expect(page.getByText("Added to your collection.")).toBeVisible();
    await page.locator(".overlay--reveal").getByRole("button", { name: "Back to the chalkboard" }).click();

    const pub = await readPub(page);
    expect(pub.checks).toBe(200 - 20 + 60);
    expect(pub.totalWins).toBe(3);
    expect(pub.collection.length).toBeGreaterThanOrEqual(1); // the uncommon prize (plus any first-win rewards)
    expect(await readBracket(page)).toBeNull();
    expect(await readKey(page, "active-match")).toBeNull();
    await expect(page.locator(".tournament-row").filter({ hasText: "The Tuesday Knockout" }).getByRole("button", { name: /Enter/ })).toBeEnabled();
    expectNoErrors(log);
  });

  test("a tournament lost in the semifinal: eliminated, consolation paid, and enterable again", async ({ page }) => {
    const log = watchErrors(page);
    await enterKnockout(page);

    await resumeFinishedTournamentMatch(page, "A");
    await leaveTable(page);
    await expect(page.locator(".bracket-stage").first().getByText("Won")).toBeVisible();

    await resumeFinishedTournamentMatch(page, "B");
    await expect(page.getByText(/took the table/)).toBeVisible();
    await leaveTable(page);
    await expect(page.getByText("Out of The Tuesday Knockout")).toBeVisible();
    await expect(page.getByText("Consolation: 10 Checks.")).toBeVisible();
    await page.locator(".overlay--reveal").getByRole("button", { name: "Back to the chalkboard" }).click();

    const pub = await readPub(page);
    expect(pub.checks).toBe(200 - 20 + 10);
    expect(pub.totalWins).toBe(1);
    expect(await readBracket(page)).toBeNull();
    await page.reload();
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
    await page.getByRole("button", { name: "The chalkboard" }).click();
    await expect(page.locator(".tournament-row").filter({ hasText: "The Tuesday Knockout" }).getByRole("button", { name: /Enter/ })).toBeEnabled();
    expectNoErrors(log);
  });

  test("a tournament match played for real with the autopilot lands on the right bracket outcome", async ({ page }) => {
    const log = watchErrors(page);
    await enterKnockout(page);
    await page.getByRole("button", { name: /Play Quarterfinal/ }).click();
    await page.locator(".overlay--coin-toss button", { hasText: "Continue" }).click();
    const result = await playMatchToEnd(page, { seed: 5 });
    await leaveTable(page);

    if (result.outcome === "win") {
      await expect(page.locator(".bracket-stage").first().getByText("Won")).toBeVisible();
      expect((await readBracket(page))?.playerMatches[0]?.outcome).toBe("won");
    } else if (result.outcome === "loss") {
      await expect(page.getByText("Out of The Tuesday Knockout")).toBeVisible();
    } else {
      // design.md §10: the sovereign breaks a drawn tournament match, so one side still advances.
      await expect(page.locator(".bracket-stage, .overlay--reveal").first()).toBeVisible();
    }
    expect(await readKey(page, "active-match")).toBeNull();
    expectNoErrors(log);
  });

  const BASE_PUB = { checks: 0, totalWins: 0, opponents: {}, collection: [] as string[], lastDailyBonusDate: null, lastLostAndFoundDate: null, pawnedCards: [] as string[], pawnbrokerPurchasedToday: [] as string[], pawnbrokerPurchaseDate: null };

  test("the back room across two days: Lost & Found, the Pawnbroker, and the Tinker's Bench", async ({ page }) => {
    const log = watchErrors(page);
    await openWithSave(page, { tutorialDone: true, pub: { ...BASE_PUB, checks: 300, totalWins: 3, collection: ["telegraph-boy", "telegraph-boy"] } });
    await page.getByRole("button", { name: "The back room" }).click();

    // Lost & Found: once a day, and the claim survives a reload.
    await page.getByRole("button", { name: "Take it" }).click();
    await page.getByRole("button", { name: "Collect" }).click();
    await expect(page.getByRole("button", { name: "Claimed today" })).toBeDisabled();
    expect((await readPub(page)).collection).toHaveLength(3);
    await page.reload();
    await page.getByRole("button", { name: "The back room" }).click();
    await expect(page.getByRole("button", { name: "Claimed today" })).toBeDisabled();

    // Pawnbroker: a purchase takes its price, adds the card, and removes that slot for the day.
    const buttons = page.getByRole("button", { name: /Take my Checks/ });
    await expect(buttons).toHaveCount(3);
    const label = (await buttons.first().textContent()) ?? "";
    const price = Number(/(\d+)\s*$/.exec(label)?.[1]);
    expect([15, 35, 90]).toContain(price);
    await buttons.first().click();
    const afterBuy = await readPub(page);
    expect(afterBuy.checks).toBe(300 - price);
    expect(afterBuy.collection).toHaveLength(4);
    await page.reload();
    await page.getByRole("button", { name: "The back room" }).click();
    await expect(page.getByRole("button", { name: /Take my Checks/ })).toHaveCount(3); // refilled from the rotation, not a faucet of the same card
    expect(new Set(await page.locator(".backroom-section").filter({ hasText: "The Pawnbroker" }).locator(".backroom-tile-name").allTextContents()).size).toBe(3);

    // Tinker's Bench: two Telegraph Boys and 10 Checks become a foil, which still counts as the card in the deck builder.
    const tile = page.locator(".backroom-tile").filter({ hasText: "Telegraph Boy" }).filter({ hasText: "copies" });
    await tile.getByRole("button", { name: /Fuse/ }).click();
    await tile.getByRole("button", { name: "Make it a foil" }).click();
    await expect(page.getByText("A foil!")).toBeVisible();
    await page.getByRole("button", { name: "Collect" }).click();
    const afterFuse = await readPub(page);
    expect(afterFuse.checks).toBe(300 - price - 10);
    expect(afterFuse.collection.filter((id) => id === "telegraph-boy")).toHaveLength(0);
    expect(afterFuse.collection).toContain("foil:telegraph-boy");

    // The next day: Lost & Found is open again and the Pawnbroker has turned over.
    await page.clock.setFixedTime(noonOn(2026, 11, 6));
    await page.reload();
    await page.getByRole("button", { name: "The back room" }).click();
    await expect(page.getByRole("button", { name: "Take it" })).toBeEnabled();
    expectNoErrors(log);
  });

  test("a Bar Bet: stake a card, play the match, and the card moves exactly as the result says", async ({ page }) => {
    const log = watchErrors(page);
    await openWithSave(page, { tutorialDone: true, pub: { ...BASE_PUB, checks: 20, totalWins: 5, collection: ["telegraph-boy"] } });
    const mudd = page.locator(".patron-row").filter({ hasText: "Constable Tobias Mudd" });
    await mudd.getByRole("button", { name: /Stake a card in a bar bet/ }).click();
    await expect(page.getByText("Stake a card against Constable Tobias Mudd?")).toBeVisible();
    await page.locator(".stake-card-option", { hasText: "Telegraph Boy" }).click();
    await expect(page.locator(".overlay--reveal .card-name", { hasText: "Telegraph Boy" })).toBeVisible();
    await page.getByRole("button", { name: "Stake Telegraph Boy" }).click();
    await expect(page.locator(".overlay--coin-toss")).toBeVisible();
    expect((await readKey<{ context: { stakedCardId: string } }>(page, "active-match"))?.context.stakedCardId).toBe("telegraph-boy");

    // A reload mid-match keeps the stake on the match.
    await page.reload();
    await expect(page.getByText("Round 1 of 3")).toBeVisible();
    expect((await readKey<{ context: { stakedCardId: string } }>(page, "active-match"))?.context.stakedCardId).toBe("telegraph-boy");
    const result = await playMatchToEnd(page, { seed: 8 });
    await leaveTable(page);
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();

    const pub = await readPub(page);
    const betPool = ["charlotte", "telegraph-boy", "anonymous-tip"];
    if (result.outcome === "win") {
      await expect(page.getByText("Won the bet against Constable Tobias Mudd!")).toBeVisible();
      expect(pub.collection.some((id) => betPool.includes(id))).toBe(true);
      // The stake stays, and a win adds the bet-pool card plus Mudd's first-win reward.
      expect(pub.collection).toContain("telegraph-boy");
      expect(pub.collection).toContain("sergeant-pike");
      expect(pub.collection).toHaveLength(3);
    } else if (result.outcome === "loss") {
      expect(pub.collection).not.toContain("telegraph-boy");
      expect((await readKey<{ pawnedCards: string[] }>(page, "pub-state"))?.pawnedCards).toEqual(["telegraph-boy"]);
      // Nothing is lost for good: the Pawnbroker offers it back first, marked pawned.
      await page.getByRole("button", { name: "The back room" }).click();
      await expect(page.locator(".backroom-tile").first()).toContainText("Telegraph Boy");
      await expect(page.locator(".backroom-tile").first()).toContainText("pawned");
    } else {
      expect(pub.collection).toContain("telegraph-boy"); // a drawn match leaves the stake with the player
    }
    expectNoErrors(log);
  });

  for (const [index, reloadEvery] of [3, 2, 1].entries()) {
    test(`a pickup match survives being relaunched after every ${reloadEvery === 1 ? "" : reloadEvery + " "}move${reloadEvery === 1 ? "" : "s"}`, async ({ page }) => {
      const log = watchErrors(page);
      await openWithSave(page, { tutorialDone: true });
      await page.getByRole("button", { name: /Play Miss Prudence Hollis/ }).click();
      await expect(page.locator(".overlay--coin-toss")).toBeVisible();
      const result = await playMatchToEnd(page, { seed: 40 + index, reloadEvery });
      await leaveTable(page);
      await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
      const pub = await readPub(page);
      if (result.outcome === "draw") expect(pub.checks).toBe(0);
      else expect(pub.opponents["prudence-hollis"]?.wins! + pub.opponents["prudence-hollis"]!.losses).toBe(1);
      expect(await readKey(page, "active-match")).toBeNull();
      expectNoErrors(log);
    });
  }

  test("a tournament match survives being relaunched after every other move, and the bracket still resolves", async ({ page }) => {
    const log = watchErrors(page);
    await enterKnockout(page);
    await page.getByRole("button", { name: /Play Quarterfinal/ }).click();
    await expect(page.locator(".overlay--coin-toss")).toBeVisible();
    const result = await playMatchToEnd(page, { seed: 66, reloadEvery: 2 });
    await leaveTable(page);
    if (result.outcome === "loss") await expect(page.getByText("Out of The Tuesday Knockout")).toBeVisible();
    else await expect(page.locator(".bracket-stage").first()).toBeVisible();
    expect(await readKey(page, "active-match")).toBeNull();
    expectNoErrors(log);
  });
});
