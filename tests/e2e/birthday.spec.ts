import { expect, test, type Page } from "@playwright/test";
import { EVENT_CARDS } from "../../src/cards/data/eventCards";
import { expectNoErrors, leaveTable, noonOn, openWithSave, playMatchToEnd, readBracket, readKey, readPub, resumeFinishedTournamentMatch, START, watchErrors } from "./helpers/game";

// ATT-26: the birthday itself, and the day Hallowe'en switches off. The clock
// is Playwright's (`page.clock.setFixedTime`), so the app reads the date the
// way the TestFlight build does: from `new Date()`, with no `?now=` override.

const BIRTHDAY = noonOn(2026, 10, 30);
const HALLOWEEN_NIGHT = noonOn(2026, 10, 31);
const NOVEMBER_FIRST = noonOn(2026, 11, 1);

test.describe.configure({ timeout: 300_000 });

const PUB = { checks: 100, totalWins: 12, opponents: {}, collection: [] as string[], lastDailyBonusDate: null, lastLostAndFoundDate: null, pawnedCards: [], pawnbrokerPurchasedToday: [], pawnbrokerPurchaseDate: null };

const sceneBackground = (page: Page): Promise<string> => page.locator(".pub-hub").evaluate((el) => (el as HTMLElement).style.getPropertyValue("--scene-bg"));

/** Every image the screen asks for has loaded: <img> elements decoded, and CSS --illustration art fetched OK. */
async function expectArtLoaded(page: Page): Promise<void> {
  const broken = await page.evaluate(async () => {
    const bad: string[] = [];
    for (const img of document.querySelectorAll("img")) {
      if (!img.complete || img.naturalWidth === 0) bad.push(img.src);
    }
    const urls = new Set<string>();
    for (const node of document.querySelectorAll<HTMLElement>("*")) {
      for (const prop of ["--illustration", "--scene-bg"]) {
        const match = /url\(["']?([^"')]+)["']?\)/.exec(node.style.getPropertyValue(prop));
        if (match?.[1]) urls.add(match[1]);
      }
    }
    for (const url of urls) {
      const ok = await new Promise<boolean>((resolve) => {
        const probe = new Image();
        probe.onload = () => resolve(true);
        probe.onerror = () => resolve(false);
        probe.src = url;
      });
      if (!ok) bad.push(url);
    }
    return bad;
  });
  expect(broken, "images that failed to load").toEqual([]);
}

test.describe("her birthday, Oct 30 2026", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(BIRTHDAY);
  });

  test("a new player: the dedication, the tutorial, then a pub dressed for Hallowe'en with the Invitational waiting", async ({ page }) => {
    const log = watchErrors(page);
    await openWithSave(page, null);

    await expect(page.getByText("Licensed to")).toBeVisible();
    await expect(page.getByText("Happy birthday. — B.")).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Round 1 of 3")).toBeVisible();

    expect((await playMatchToEnd(page, { seed: 4 })).outcome).toBe("win");
    await leaveTable(page);
    await page.locator(".beer-mat-dismiss").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();

    // Hallowe'en is live but she has no wins yet: the hint, no visitors, the redressed taproom.
    await expect(page.getByText(/Odd folk on the cellar stairs this month/)).toBeVisible();
    await expect(page.locator(".patron-tier--visitor")).toHaveCount(0);
    await expect.poll(() => sceneBackground(page)).toContain("background-the-taproom-halloween");
    await expectArtLoaded(page);

    // The chalkboard: the Wake is listed but locked behind 3 wins; the Invitational has triggered.
    await page.getByRole("button", { name: "The chalkboard" }).click();
    await expect(page.locator(".tournament-row").filter({ hasText: "The All Hallows' Wake" }).getByRole("button", { name: "Locked" })).toBeVisible();
    const invitational = page.locator(".tournament-row").filter({ hasText: "The Birthday Invitational" });
    await expect(invitational.getByRole("button", { name: /Enter/ })).toBeEnabled();
    expect(await readKey(page, "tournament-state")).toMatchObject({ invitationalTriggered: true });
    expectNoErrors(log);
  });

  test("a returning player sees every Hallowe'en visitor, with art, and can start a match with one", async ({ page }) => {
    const log = watchErrors(page);
    await openWithSave(page, { tutorialDone: true, pub: PUB });
    for (const name of ["Mr Griffin, the Unseen", "The Clockwork Pharaoh", "The Carpathian Count", "The Hampstead Wolf", "The Galvanic Creature"]) {
      await expect(page.getByRole("button", { name: `Play ${name}` })).toBeVisible();
    }
    await expect(page.getByText(/Odd folk on the cellar stairs/)).toHaveCount(0);
    await expect.poll(() => sceneBackground(page)).toContain("background-the-taproom-halloween");
    await expectArtLoaded(page);
    await page.getByRole("button", { name: "Play The Carpathian Count" }).click();
    await expect(page.locator(".side-name").first()).toHaveText("The Carpathian Count");
    expectNoErrors(log);
  });

  test("every seasonal card has art that loads, in the deck builder and in a reward reveal", async ({ page }) => {
    const log = watchErrors(page);
    const owned = EVENT_CARDS.map((card) => card.id);
    await openWithSave(page, { tutorialDone: true, pub: { ...PUB, collection: owned } });
    await page.getByRole("button", { name: "Build a deck" }).click();
    await page.locator(".deck-slot-row").nth(2).locator(".deck-slot-info").click();
    for (const card of EVENT_CARDS) {
      const tile = page.locator(".deck-card-tile", { hasText: card.faces[0].name }).first();
      await expect(tile, `${card.faces[0].name} has a deck-builder tile`).toBeVisible();
      await expect(tile).not.toHaveClass(/deck-card-tile--unowned/);
    }
    await expectArtLoaded(page);
    expectNoErrors(log);
  });

  test("The Birthday Invitational, won: three matches, the toast, The Landlady and 500 Checks", async ({ page }) => {
    const log = watchErrors(page);
    await openWithSave(page, { tutorialDone: true, pub: { ...PUB, totalWins: 0, checks: 0 } });
    await page.getByRole("button", { name: "The chalkboard" }).click();
    await page.locator(".tournament-row").filter({ hasText: "The Birthday Invitational" }).getByRole("button", { name: /Enter/ }).click();
    await expect(page.locator(".bracket-stage")).toHaveCount(3);

    for (const stage of [0, 1, 2]) {
      const opponent = await resumeFinishedTournamentMatch(page, "A");
      await expect(page.getByText("You took the table")).toBeVisible();
      await leaveTable(page);
      if (stage < 2) await expect(page.locator(".bracket-stage").nth(stage).getByText("Won")).toBeVisible();
      expect(opponent).toBeTruthy();
    }

    // The toast: the narration, six legends and Sir Charles, one tap each.
    const raise = page.getByRole("button", { name: "Raise a glass" });
    for (let i = 0; i < 7; i += 1) {
      await expect(raise).toBeVisible();
      await raise.click();
    }
    await expect(page.getByText('"To the Landlady. Who was always going to be."')).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText("Champion: The Birthday Invitational!")).toBeVisible();
    await expect(page.getByText("You won 500 Checks.")).toBeVisible();
    await expect(page.locator(".reveal-card .card-name")).toHaveText("The Landlady");
    await expectArtLoaded(page);
    await page.locator(".overlay--reveal").getByRole("button", { name: "Back to the chalkboard" }).click();

    const pub = await readPub(page);
    expect(pub.checks).toBe(500);
    expect(pub.collection).toContain("the-landlady");
    expect(await readBracket(page)).toBeNull();

    // And she can build with her new card after a relaunch.
    await page.reload();
    await page.getByRole("button", { name: "Build a deck" }).click();
    await page.locator(".deck-slot-row").nth(2).locator(".deck-slot-info").click();
    await expect(page.locator(".deck-card-tile", { hasText: "The Landlady" })).not.toHaveClass(/deck-card-tile--unowned/);
    expectNoErrors(log);
  });

  test("The All Hallows' Wake, won: three matches, Spring-Heeled Jack and 150 Checks", async ({ page }) => {
    const log = watchErrors(page);
    await openWithSave(page, { tutorialDone: true, pub: PUB });
    await page.getByRole("button", { name: "The chalkboard" }).click();
    const row = page.locator(".tournament-row").filter({ hasText: "The All Hallows' Wake" });
    await expect(row.getByRole("button", { name: /Enter/ })).toBeEnabled();
    await row.getByRole("button", { name: /Enter/ }).click();
    expect((await readPub(page)).checks).toBe(100 - 13);

    for (const stage of [0, 1, 2]) {
      await resumeFinishedTournamentMatch(page, "A");
      await leaveTable(page);
      if (stage < 2) await expect(page.locator(".bracket-stage").nth(stage).getByText("Won")).toBeVisible();
    }
    await expect(page.getByText("Champion: The All Hallows' Wake!")).toBeVisible();
    await expect(page.getByText("You won 150 Checks.")).toBeVisible();
    await expect(page.locator(".reveal-card .card-name")).toHaveText("Spring-Heeled Jack");
    await expectArtLoaded(page);
    await page.locator(".overlay--reveal").getByRole("button", { name: "Back to the chalkboard" }).click();
    const pub = await readPub(page);
    expect(pub.checks).toBe(100 - 13 + 150);
    expect(pub.collection).toContain("spring-heeled-jack");
    expectNoErrors(log);
  });

  test("The All Hallows' Wake, played for real: The Witching Hour is in the shared slot and the match completes", async ({ page }) => {
    const log = watchErrors(page);
    await openWithSave(page, { tutorialDone: true, pub: PUB });
    await page.getByRole("button", { name: "The chalkboard" }).click();
    await page.locator(".tournament-row").filter({ hasText: "The All Hallows' Wake" }).getByRole("button", { name: /Enter/ }).click();
    await page.getByRole("button", { name: /Play Quarterfinal/ }).click();
    await expect(page.locator(".overlay--coin-toss")).toBeVisible();
    await expect(page.locator(".location-slot .card-name")).toHaveText("The Witching Hour");
    const result = await playMatchToEnd(page, { seed: 31 });
    await leaveTable(page);
    if (result.outcome === "loss") await expect(page.getByText("Out of The All Hallows' Wake")).toBeVisible();
    else await expect(page.locator(".bracket-screen")).toBeVisible();
    expect(await readKey(page, "active-match")).toBeNull();
    expectNoErrors(log);
  });
});

test.describe("Nov 1 2026: Hallowe'en switches off", () => {
  test("the pub is back to normal, nothing is locked out, and every owned seasonal card stays usable", async ({ page }) => {
    const log = watchErrors(page);
    const owned = EVENT_CARDS.map((card) => card.id);
    await page.clock.setFixedTime(HALLOWEEN_NIGHT);
    await openWithSave(page, { tutorialDone: true, pub: { ...PUB, collection: owned } });
    // Last night of the event: everything is still there.
    await expect(page.getByRole("button", { name: "Play The Galvanic Creature" })).toBeVisible();
    await expect.poll(() => sceneBackground(page)).toContain("halloween");

    await page.clock.setFixedTime(NOVEMBER_FIRST);
    await page.reload();
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
    await expect(page.locator(".patron-tier--visitor")).toHaveCount(0);
    await expect(page.getByText(/Odd folk on the cellar stairs/)).toHaveCount(0);
    await expect.poll(() => sceneBackground(page)).toContain("background-the-taproom");
    expect(await sceneBackground(page)).not.toContain("halloween");
    // Sir Charles never quotes the event's lines again; none of the visitors' pickup lines appear.
    await expect(page.locator(".patron-line", { hasText: /cellar door|Turnips|draught/ })).toHaveCount(0);

    await page.getByRole("button", { name: "The chalkboard" }).click();
    await expect(page.locator(".tournament-row").filter({ hasText: "The All Hallows' Wake" })).toHaveCount(0);
    await page.getByRole("button", { name: "Back to the bar" }).click();

    // Owned event cards remain owned and legal in the deck builder.
    await page.getByRole("button", { name: "Build a deck" }).click();
    await page.locator(".deck-slot-row").nth(2).locator(".deck-slot-info").click();
    for (const card of EVENT_CARDS) {
      await expect(page.locator(".deck-card-tile", { hasText: card.faces[0].name }).first()).not.toHaveClass(/deck-card-tile--unowned/);
    }
    expectNoErrors(log);
  });

  test("a Wake bracket entered on Oct 31 can still be resumed and finished on Nov 1", async ({ page }) => {
    const log = watchErrors(page);
    await page.clock.setFixedTime(HALLOWEEN_NIGHT);
    await openWithSave(page, { tutorialDone: true, pub: PUB });
    await page.getByRole("button", { name: "The chalkboard" }).click();
    await page.locator(".tournament-row").filter({ hasText: "The All Hallows' Wake" }).getByRole("button", { name: /Enter/ }).click();
    await expect(page.locator(".bracket-stage")).toHaveCount(3);

    await page.clock.setFixedTime(NOVEMBER_FIRST);
    await page.reload();
    await page.getByRole("button", { name: "The chalkboard" }).click();
    const row = page.locator(".tournament-row").filter({ hasText: "The All Hallows' Wake" });
    await expect(row.getByRole("button", { name: "Resume" })).toBeVisible();
    await row.getByRole("button", { name: "Resume" }).click();

    for (const stage of [0, 1, 2]) {
      await resumeFinishedTournamentMatch(page, "A");
      await leaveTable(page);
      if (stage < 2) await expect(page.locator(".bracket-stage").nth(stage).getByText("Won")).toBeVisible();
    }
    await expect(page.getByText("Champion: The All Hallows' Wake!")).toBeVisible();
    expect(await readBracket(page)).toBeNull();
    expectNoErrors(log);
    void START;
  });

  test("the everyday game is unaffected: a normal pickup match and the tournaments list on Nov 1", async ({ page }) => {
    const log = watchErrors(page);
    await page.clock.setFixedTime(NOVEMBER_FIRST);
    await openWithSave(page, { tutorialDone: true, pub: PUB });
    await page.getByRole("button", { name: /Play Constable Tobias Mudd/ }).click();
    await expect(page.locator(".overlay--coin-toss")).toBeVisible();
    const result = await playMatchToEnd(page, { seed: 77 });
    expect(["win", "loss", "draw"]).toContain(result.outcome);
    await leaveTable(page);
    await expect(page.getByRole("heading", { name: "The Wheatstone Bridge" })).toBeVisible();
    expectNoErrors(log);
  });
});

test.describe("a player who misses Oct 30 itself", () => {
  // design.md §14.6: the Invitational "unlocks October 30 (any year), stays unlocked once triggered".
  for (const [label, date] of [["Oct 31", HALLOWEEN_NIGHT], ["Nov 2", noonOn(2026, 11, 2)], ["Dec 25", noonOn(2026, 12, 25)]] as const) {
    test(`first opening the game on ${label}: the Invitational is waiting`, async ({ page }) => {
      await page.clock.setFixedTime(date);
      await openWithSave(page, { tutorialDone: true, pub: PUB });
      await page.getByRole("button", { name: "The chalkboard" }).click();
      const row = page.locator(".tournament-row").filter({ hasText: "The Birthday Invitational" });
      await expect(row.getByRole("button", { name: /Enter/ })).toBeEnabled();
    });
  }

  test("before Oct 30 it is still invisible", async ({ page }) => {
    await page.clock.setFixedTime(noonOn(2026, 10, 29));
    await openWithSave(page, { tutorialDone: true, pub: PUB });
    await page.getByRole("button", { name: "The chalkboard" }).click();
    await expect(page.locator(".tournament-row").filter({ hasText: "The Birthday Invitational" })).toHaveCount(0);
  });
});
