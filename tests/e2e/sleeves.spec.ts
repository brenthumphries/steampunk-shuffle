import { expect, test } from "@playwright/test";
import { QUIET_PRE_BIRTHDAY, expectNoErrors, openWithSave, readKey, watchErrors, writeKey } from "./helpers/game";
import { starterDeck } from "../../src/cards/data/decks/starterDeck";
import { createMatch } from "../../src/engine/matchEngine";
import { OPPONENTS_BY_ID } from "../../src/pub/opponents";

// Card sleeves (design.md §17.5), J-B: only the default sleeve exists until
// January's content lands, so these cover the picker with one choice, the
// default back in a match, and a pre-sleeve save loading as default-only.

test.describe("card sleeves", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(QUIET_PRE_BIRTHDAY);
    await openWithSave(page, { tutorialDone: true });
    await page.waitForFunction(() => (document.querySelector("#app")?.childElementCount ?? 0) > 0);
  });

  test("the deck builder's Sleeve picker offers The Bridge only, and the pick is saved per slot", async ({ page }) => {
    const errors = watchErrors(page);
    await page.getByRole("button", { name: "Build a deck" }).click();
    await page.locator(".deck-slot-row").first().locator(".deck-slot-info").click();

    const picker = page.getByLabel("Sleeve");
    await expect(picker).toBeVisible();
    await expect(picker.locator("option")).toHaveText(["The Bridge"]);
    await expect(picker).toHaveValue("sleeve-the-bridge");
    await expect(page.locator(".deck-sleeve-preview")).toBeVisible();

    await picker.selectOption("sleeve-the-bridge");
    const slots = await readKey<{ slots: { sleeveId?: string }[] }>(page, "deck-slots");
    expect(slots!.slots[0]!.sleeveId).toBe("sleeve-the-bridge");
    expect(slots!.slots[1]!.sleeveId).toBeUndefined();

    // A different slot has its own picker, on the default.
    await page.getByRole("button", { name: "Done" }).click();
    await page.locator(".deck-slot-row").nth(1).locator(".deck-slot-info").click();
    await expect(page.getByLabel("Sleeve")).toHaveValue("sleeve-the-bridge");
    expectNoErrors(errors);
  });

  test("a save from before sleeves (no sleeve fields) loads as default-only with the rest intact", async ({ page }) => {
    await openWithSave(page, { tutorialDone: true, pub: { checks: 77, totalWins: 1, opponents: {}, collection: [], lastDailyBonusDate: null, lastLostAndFoundDate: null, pawnedCards: [], pawnbrokerPurchasedToday: [], pawnbrokerPurchaseDate: null } });
    await page.waitForFunction(() => (document.querySelector("#app")?.childElementCount ?? 0) > 0);
    await expect(page.locator(".checks-badge-value")).toHaveText("77");
    await page.getByRole("button", { name: "Build a deck" }).click();
    await page.locator(".deck-slot-row").first().locator(".deck-slot-info").click();
    await expect(page.getByLabel("Sleeve").locator("option")).toHaveText(["The Bridge"]);
  });

  test("face-down cards in a match wear the default back for both sides", async ({ page }) => {
    const errors = watchErrors(page);
    const opponent = OPPONENTS_BY_ID.get("mudd")!;
    const matchState = createMatch(starterDeck, opponent.deck, { seed: 3 });
    const [mine, theirs] = [matchState.players.A.hand[0]!, matchState.players.B.hand[0]!];
    matchState.players.A.board.push({ instanceId: "mine", card: mine.card, faceIndex: 0, faceUp: false, bonusPoints: 0 });
    matchState.players.B.board.push({ instanceId: "theirs", card: theirs.card, faceIndex: 0, faceUp: false, bonusPoints: 0 });
    await writeKey(page, "active-match", {
      matchState,
      aiSeed: 1,
      humanDeck: starterDeck,
      humanDeckName: "The Village Constable",
      context: { kind: "pickup", opponentId: opponent.id, stakedCardId: null },
    });
    await page.reload();

    const mineBack = page.locator('.card--facedown[data-instance-id="mine"]');
    const theirsBack = page.locator('.card--facedown[data-instance-id="theirs"]');
    await expect(mineBack).toHaveAttribute("data-sleeve", "sleeve-the-bridge");
    await expect(theirsBack).toHaveAttribute("data-sleeve", "sleeve-the-bridge");
    await expect(mineBack.locator("img")).toHaveAttribute("src", /art\/card-back\.webp$/);
    await expect(theirsBack.locator("img")).toHaveAttribute("src", /art\/card-back\.webp$/);
    expectNoErrors(errors);
  });
});
