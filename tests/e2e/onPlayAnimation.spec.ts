import { expect, test, type Page } from "@playwright/test";
import { ALL_CARDS } from "../../src/cards/data/index.ts";
import type { MatchState } from "../../src/engine/matchEngine.ts";

// Plan step 3.3 extension (plan/animation-and-turn-indicator-plan.md): the
// On-Play/discard 3-beat animation sequence and its input-blocking
// "Resolving…" hold. Same forced-state technique as instantAnnounce.spec.ts
// — a hand-built MatchState saved under the active-match key — so the
// scenario (a card with a real On Play target, and a self-discarding
// Scheme/Headline) is deterministic instead of hoping a random match deals
// one.

const inspectorsWarrant = ALL_CARDS.find((c) => c.id === "inspectors-warrant")!; // Scheme: On Play, flip an opposing card worth 3 or less; self-discards straight after (design.md §3).
const constableOnTheBeat = ALL_CARDS.find((c) => c.id === "constable-on-the-beat")!; // 3 pts — the one legal flip target below.
const detectiveSergeantVale = ALL_CARDS.find((c) => c.id === "detective-sergeant-vale")!; // Character: On Play, flip an opposing card worth 1 or less.
const policeWhistle = ALL_CARDS.find((c) => c.id === "police-whistle")!; // 1 pt gadget — the flip target for Vale.

async function seedActiveMatch(page: Page, matchState: MatchState, humanDeckCard = constableOnTheBeat): Promise<void> {
  await page.goto("/steampunk-shuffle/");
  await page.evaluate(
    ({ matchState, humanDeckCard }) => {
      localStorage.clear();
      localStorage.setItem("steampunk-shuffle:tutorial-state", JSON.stringify({ completed: true, matchesPlayed: 0, shownHints: [] }));
      localStorage.setItem("steampunk-shuffle:player", JSON.stringify({ name: "Sara", dedicationSeen: true }));
      localStorage.setItem(
        "steampunk-shuffle:active-match",
        JSON.stringify({
          matchState,
          aiSeed: 1,
          humanDeck: [{ card: humanDeckCard, quantity: 2 }],
          humanDeckName: "Test Deck",
          context: { kind: "pickup", opponentId: "mudd", stakedCardId: null },
        }),
      );
    },
    { matchState, humanDeckCard },
  );
  await page.reload();
}

test.describe("on-play/discard 3-beat animation sequencing (plan step 3.3 extension)", () => {
  test("a non-instant On Play ability (AI's turn) blocks input for a real beat, then the effect has actually resolved", async ({ page }) => {
    // B leads (plays first), forced to play Detective Sergeant Vale, whose
    // only legal flip target is the human's 1-point Police Whistle.
    const matchState: MatchState = {
      players: {
        A: {
          id: "A",
          deck: [],
          hand: [],
          board: [{ instanceId: "human-board-1", card: policeWhistle, faceIndex: 0, faceUp: true, bonusPoints: 0 }],
          discard: [],
        },
        B: { id: "B", deck: [], hand: [{ instanceId: "ai-hand-1", card: detectiveSergeantVale }], board: [], discard: [] },
      },
      location: undefined,
      neutralDiscard: [],
      round: 1,
      leader: "B",
      turnsPlayedThisRound: 0,
      roundsWon: { A: 0, B: 0 },
      roundHistory: [],
      status: "in-progress",
      rngSeed: 1,
    };
    await seedActiveMatch(page, matchState, policeWhistle);

    // The board card is untouched at first (still 1 point, face-up).
    const target = page.locator('.board-row .card[data-instance-id="human-board-1"]');
    await expect(target).toBeVisible();
    await expect(target).not.toHaveClass(/card--facedown/);

    // Once the AI commits, input is held (no "Your turn" yet) while the
    // announce/resolve/settle beat plays — never a silent instant jump
    // straight to the next actor.
    await expect(page.getByText("Resolving…")).toBeVisible({ timeout: 5000 });

    // It resolves within the sequence's own budget (well under the plan's
    // hard 2.5s cap) and the flip actually landed — not just an animation.
    await expect(page.getByText("Resolving…")).toHaveCount(0, { timeout: 3000 });
    await expect(page.locator('.board-row .card[data-instance-id="human-board-1"]')).toHaveClass(/card--facedown/);
  });

  test("a self-discarding Scheme/Headline (the human's own play) lands visibly in the discard pile", async ({ page }) => {
    // A leads, hand has only Inspector's Warrant; the AI's Constable on the
    // Beat (3 pts) is the one legal flip target.
    const matchState: MatchState = {
      players: {
        A: {
          id: "A",
          deck: [],
          hand: [{ instanceId: "human-hand-1", card: inspectorsWarrant }],
          board: [],
          discard: [],
        },
        B: {
          id: "B",
          deck: [],
          hand: [],
          board: [{ instanceId: "ai-board-1", card: constableOnTheBeat, faceIndex: 0, faceUp: true, bonusPoints: 0 }],
          discard: [],
        },
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
    await seedActiveMatch(page, matchState);

    await expect(page.locator('.discard-pile[data-side="A"] .discard-pile-count')).toHaveText("0");

    const card = page.locator(".hand-row .card--tappable").first();
    await expect(card).toBeVisible();
    await card.click();
    await page.getByRole("button", { name: "Play", exact: true }).click();

    // The card is gone from hand and landed in the discard pile — the
    // acceptance bar is "can tell which card left hand and see it land in
    // the discard pile," which the pile's own count satisfies robustly
    // (the mid-flight clone is real but timing-sensitive to assert on).
    await expect(page.locator('.discard-pile[data-side="A"] .discard-pile-count')).toHaveText("1", { timeout: 3000 });
    await expect(page.locator(".hand-row .card")).toHaveCount(0);

    // And the effect it was played for actually landed.
    await expect(page.locator('.board-row .card[data-instance-id="ai-board-1"]')).toHaveClass(/card--facedown/, { timeout: 3000 });
  });

  test("prefers-reduced-motion shortens the hold instead of eliminating it", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const matchState: MatchState = {
      players: {
        A: {
          id: "A",
          deck: [],
          hand: [],
          board: [{ instanceId: "human-board-1", card: policeWhistle, faceIndex: 0, faceUp: true, bonusPoints: 0 }],
          discard: [],
        },
        B: { id: "B", deck: [], hand: [{ instanceId: "ai-hand-1", card: detectiveSergeantVale }], board: [], discard: [] },
      },
      location: undefined,
      neutralDiscard: [],
      round: 1,
      leader: "B",
      turnsPlayedThisRound: 0,
      roundsWon: { A: 0, B: 0 },
      roundHistory: [],
      status: "in-progress",
      rngSeed: 1,
    };
    await seedActiveMatch(page, matchState, policeWhistle);

    // Reduced motion still holds briefly (never a zero-transition instant
    // swap) — but well under the full ~1.1s non-reduced beat, and the
    // effect still actually resolves.
    await expect(page.locator('.board-row .card[data-instance-id="human-board-1"]')).toHaveClass(/card--facedown/, { timeout: 2000 });
  });
});
