import { expect, test } from "@playwright/test";
import type { Card } from "../../src/cards/cardTypes.ts";
import type { MatchState } from "../../src/engine/matchEngine.ts";
import { QUIET_PRE_BIRTHDAY } from "./helpers/game";

// Scry (design.md §5.16): playing a card that Scrys opens the overlay with the
// top cards, tapping sends one to the bottom row, and Done commits the play.
// The Coven cards are N-D's, so a test-only Character stands in, seeded into
// a resumed match the same way unflipTarget.spec.ts seeds its board.

const seer: Card = {
  id: "test-seer",
  rarity: "common",
  faces: [
    {
      name: "Test Seer",
      type: "character",
      family: "coven",
      points: 1,
      abilities: [{ trigger: "onPlay", effects: [{ effect: "scry", amount: 3 }] }],
      flavor: "A fixture, not a person.",
      artId: "test-seer",
    },
  ],
};

function named(name: string, points: number): Card {
  return { id: `test-${name.toLowerCase()}`, rarity: "common", faces: [{ name, type: "character", family: "neutral", points, flavor: "Fixture.", artId: "test" }] };
}

const alpha = named("Alpha", 1);
const bravo = named("Bravo", 2);
const charlie = named("Charlie", 3);
const delta = named("Delta", 4);

function buildMatchState(): MatchState {
  return {
    players: {
      A: {
        id: "A",
        deck: [
          { instanceId: "d-1", card: delta },
          { instanceId: "d-2", card: alpha },
          { instanceId: "d-3", card: bravo },
          { instanceId: "d-4", card: charlie },
        ],
        hand: [{ instanceId: "h-1", card: seer }],
        board: [],
        discard: [],
      },
      B: { id: "B", deck: [], hand: [], board: [], discard: [] },
    },
    location: undefined,
    neutralDiscard: [],
    round: 1,
    leader: "A",
    turnsPlayedThisRound: 0,
    roundsWon: { A: 0, B: 0 },
    roundHistory: [],
    status: "in-progress",
    rngSeed: 1,
  };
}

test("Scry: the overlay shows the top cards, a tap sends one to the bottom, Done commits the play", async ({ page }) => {
  await page.clock.setFixedTime(QUIET_PRE_BIRTHDAY);
  await page.goto("/steampunk-shuffle/");
  const matchState = buildMatchState();
  await page.evaluate(
    ({ matchState }) => {
      const L = (n: string): string => {
        let r = JSON.parse(localStorage.getItem("ws:ledgers") ?? "null");
        if (!r) {
          r = { activeId: "0e2e0000-0000-4000-8000-000000000001", ledgers: [{ id: "0e2e0000-0000-4000-8000-000000000001", name: "Sara", createdAt: "2026-11-06T00:00:00.000Z", lastPlayedAt: "2026-11-06T00:00:00.000Z", summary: { title: "Newcomer", wins: 0, collectionCount: 0 } }] };
          localStorage.setItem("ws:ledgers", JSON.stringify(r));
        }
        return `ws:${r.activeId}:${n}`;
      };
      localStorage.clear();
      localStorage.setItem(L("tutorial-state"), JSON.stringify({ completed: true, matchesPlayed: 0, shownHints: [] }));
      localStorage.setItem(L("player"), JSON.stringify({ name: "Sara", dedicationSeen: true }));
      localStorage.setItem(L("active-match"),
        JSON.stringify({
          matchState,
          aiSeed: 1,
          humanDeck: [{ card: matchState.players.A.hand[0].card, quantity: 2 }],
          humanDeckName: "Test Deck",
          context: { kind: "pickup", opponentId: "mudd", stakedCardId: null },
        }),
      );
    },
    { matchState },
  );
  await page.reload();

  await page.locator(".hand-row .card--tappable").first().click();
  await page.getByRole("button", { name: "Play", exact: true }).click();

  // The turn-start draw takes Delta; the top three of what is left are Alpha, Bravo, Charlie.
  const overlay = page.locator(".overlay--scry");
  await expect(overlay).toBeVisible();
  await expect(overlay.getByRole("heading", { name: "Scry 3" })).toBeVisible();
  await expect(overlay.locator(".scry-row--top .scry-card-name")).toHaveText(["Alpha", "Bravo", "Charlie"]);
  await expect(overlay.locator(".scry-row--bottom .scry-card")).toHaveCount(0);

  await overlay.locator(".scry-row--top .scry-card", { hasText: "Alpha" }).click();
  await expect(overlay.locator(".scry-row--top .scry-card-name")).toHaveText(["Bravo", "Charlie"]);
  await expect(overlay.locator(".scry-row--bottom .scry-card-name")).toHaveText(["Alpha"]);

  await overlay.getByRole("button", { name: "Move Charlie earlier" }).click();
  await expect(overlay.locator(".scry-row--top .scry-card-name")).toHaveText(["Charlie", "Bravo"]);

  await overlay.getByRole("button", { name: "Done" }).click();
  await expect(overlay).toHaveCount(0);
  await expect(page.locator(".board-row .card").first()).toBeVisible();
});
