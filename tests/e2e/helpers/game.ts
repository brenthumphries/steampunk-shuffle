import { expect, type Page } from "@playwright/test";

// Shared plumbing for the soak specs (tests/e2e/soak.spec.ts,
// tests/e2e/birthday.spec.ts): an error watcher, save seeding, and an
// autopilot that plays a whole match through the real UI by tapping, so a
// stuck screen or a thrown error surfaces as a failed test rather than as
// something Brent finds on the TestFlight build.

export const START = "/steampunk-shuffle/";

/** A `Date` for `page.clock.setFixedTime`: local noon, so no timezone edge can move the calendar day. */
export function noonOn(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day, 12, 0, 0);
}

export interface ErrorLog {
  /** Uncaught exceptions and console.error output. */
  errors: string[];
  /** Same-origin responses with a 4xx/5xx status, as "status url". */
  failedRequests: string[];
}

/** Assets known to be missing, with the PLAYTEST.md item that tracks each. */
const KNOWN_MISSING = [/\/art\/desk-sergeant\.webp$/, /\/favicon\.ico$/];

/**
 * Firefox logs these itself, as `[JavaScript Error: "..."]` console lines, when
 * the page navigates while the Pages build's service worker or IndexedDB work
 * is in flight (the soaks reload constantly), and when a reload interrupts the
 * worker serving the ambience track. They are not thrown by the app, the native
 * bundle has no service worker, and the same runs are clean on Chromium. Only
 * these exact messages are ignored; uncaught exceptions still fail the test.
 */
const FIREFOX_NAVIGATION_NOISE = [
  /^\[JavaScript Error: "InvalidStateError: Navigated away from page"/,
  /^\[JavaScript Error: "InvalidStateError: An attempt was made to use an object that is not, or is no longer, usable"/,
  /^\[JavaScript Error: "Failed to load .*\/audio\/ambience\.mp3.\. A ServiceWorker intercepted the request and encountered an unexpected error/,
];

export function watchErrors(page: Page): ErrorLog {
  const log: ErrorLog = { errors: [], failedRequests: [] };
  page.on("pageerror", (error) => log.errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    // The browser logs its own line for every 4xx; failedRequests records those with the URL.
    if (/Failed to load resource/.test(message.text())) return;
    if (FIREFOX_NAVIGATION_NOISE.some((pattern) => pattern.test(message.text()))) return;
    log.errors.push(`console.error: ${message.text()}`);
  });
  page.on("response", (response) => {
    if (response.status() < 400) return;
    const url = response.url();
    if (!url.startsWith("http://localhost")) return;
    if (KNOWN_MISSING.some((pattern) => pattern.test(url))) return;
    log.failedRequests.push(`${response.status()} ${url}`);
  });
  return log;
}

export function expectNoErrors(log: ErrorLog): void {
  expect(log.errors, "uncaught errors or console.error output").toEqual([]);
  expect(log.failedRequests, "failed same-origin requests").toEqual([]);
}

export interface SeedOptions {
  tutorialDone?: boolean;
  dedicationSeen?: boolean;
  name?: string;
  pub?: Record<string, unknown>;
}

/** Opens the app, replaces the save with `seed`, and reloads into it. Pass `{}` for a brand-new install. */
export async function openWithSave(page: Page, seed: SeedOptions | null, url: string = START): Promise<void> {
  await page.goto(url);
  await page.evaluate((s) => {
    localStorage.clear();
    if (!s) return;
    if (s.tutorialDone) localStorage.setItem("steampunk-shuffle:tutorial-state", JSON.stringify({ completed: true, matchesPlayed: 0, shownHints: [] }));
    localStorage.setItem("steampunk-shuffle:player", JSON.stringify({ name: s.name ?? "Sara", dedicationSeen: s.dedicationSeen ?? true }));
    if (s.pub) localStorage.setItem("steampunk-shuffle:pub-state", JSON.stringify(s.pub));
  }, seed);
  await page.goto(url);
}

export async function readKey<T = unknown>(page: Page, key: string): Promise<T | null> {
  return page.evaluate((k) => {
    const raw = localStorage.getItem(`steampunk-shuffle:${k}`);
    return raw === null ? null : (JSON.parse(raw) as unknown);
  }, key) as Promise<T | null>;
}

export interface PubStateSnapshot {
  checks: number;
  totalWins: number;
  opponents: Record<string, { wins: number; losses: number; rewardClaimed: boolean }>;
  collection: string[];
}

export async function readPub(page: Page): Promise<PubStateSnapshot> {
  const pub = await readKey<PubStateSnapshot>(page, "pub-state");
  expect(pub, "pub-state should exist").not.toBeNull();
  return pub!;
}

/** mulberry32: a small seeded PRNG, so a failing soak run can be replayed with the same card choices. */
function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface MatchOutcome {
  outcome: "win" | "loss" | "draw" | "unfinished";
  title: string;
  /** The "+N Checks" line on the match-over overlay, if any. */
  reward: string | null;
  /** Taps the autopilot made, a rough measure of how long the match was. */
  taps: number;
}

interface Snapshot {
  matchOver: boolean;
  matchOverTitle: string;
  reward: string | null;
  buttons: string[];
  handTappable: number;
  targetCandidates: number;
  signature: string;
}

async function snapshot(page: Page): Promise<Snapshot> {
  return page.evaluate(() => {
    const visible = (node: Element): boolean => node instanceof HTMLElement && (node.offsetWidth > 0 || node.offsetHeight > 0);
    const buttons = [...document.querySelectorAll("button")].filter(visible).map((b) => (b.textContent ?? "").trim());
    const matchOver = document.querySelector(".overlay--match-over");
    const text = (selector: string): string => (document.querySelector(selector)?.textContent ?? "").trim();
    return {
      matchOver: !!matchOver,
      matchOverTitle: (matchOver?.querySelector(".overlay-title")?.textContent ?? "").trim(),
      reward: matchOver?.querySelector(".overlay-reward")?.textContent ?? null,
      buttons,
      handTappable: document.querySelectorAll(".hand-row .card--tappable").length,
      targetCandidates: document.querySelectorAll(".board-row .card--highlight.card--tappable:not(.card--selected)").length,
      signature: [
        text(".round-gauge-label"),
        text(".turn-dial-label"),
        [...document.querySelectorAll(".side-score")].map((n) => n.textContent).join("|"),
        document.querySelectorAll(".hand-row .card").length,
        document.querySelectorAll(".board-row .card").length,
        text(".action-prompt"),
        document.querySelector(".overlay") ? "overlay" : "",
      ].join("~"),
    };
  });
}

async function tap(page: Page, locator: ReturnType<Page["locator"]>): Promise<boolean> {
  try {
    await locator.click({ timeout: 2_500 });
    return true;
  } catch {
    // The screen rebuilds itself on every state change, so a card can detach mid-click; the loop re-reads and retries.
    return false;
  }
}

/**
 * Plays the match on screen to its end by tapping: coin toss, "Continue"
 * holds, a random playable card each turn, a target when the card needs one,
 * then "Play". Returns once the match-over overlay is up (without dismissing
 * it, so the caller can assert on it) and fails if the screen stops
 * changing for `stallMs`.
 */
export async function playMatchToEnd(page: Page, opts: { seed?: number; maxMs?: number; stallMs?: number; stopAfterTaps?: number; /** Reload the page after every Nth committing tap (Play or Continue). */ reloadEvery?: number } = {}): Promise<MatchOutcome> {
  const random = seededRandom(opts.seed ?? 1);
  const maxMs = opts.maxMs ?? 240_000;
  const stallMs = opts.stallMs ?? 30_000;
  const started = Date.now();
  let taps = 0;
  let commits = 0;
  let lastSignature = "";
  let lastChange = Date.now();

  for (;;) {
    if (Date.now() - started > maxMs) throw new Error(`match did not finish within ${maxMs}ms`);
    if (opts.stopAfterTaps !== undefined && taps >= opts.stopAfterTaps) {
      // Settle on a screen the player could leave from: no hold or staged card open.
      const settled = await snapshot(page);
      if (!settled.buttons.includes("Continue") && !settled.buttons.includes("Cancel") && settled.handTappable > 0) return { outcome: "unfinished", title: "", reward: null, taps };
    }
    const snap = await snapshot(page);
    if (snap.matchOver) {
      const outcome = /draw/i.test(snap.matchOverTitle) ? "draw" : /You took the table/.test(snap.matchOverTitle) ? "win" : "loss";
      return { outcome, title: snap.matchOverTitle, reward: snap.reward, taps };
    }

    if (snap.signature !== lastSignature) {
      lastSignature = snap.signature;
      lastChange = Date.now();
    } else if (Date.now() - lastChange > stallMs) {
      throw new Error(`match screen stalled for ${stallMs}ms (buttons: ${snap.buttons.join(", ") || "none"}; signature: ${snap.signature})`);
    }

    const has = (name: string): boolean => snap.buttons.includes(name);
    let acted = false;
    let committed = false;
    if (await page.locator(".beer-mat-dismiss").isVisible().catch(() => false)) {
      acted = await tap(page, page.locator(".beer-mat-dismiss"));
    } else if (has("Continue")) {
      acted = await tap(page, page.getByRole("button", { name: "Continue", exact: true }).first());
      committed = acted;
    } else if (has("Play")) {
      acted = await tap(page, page.getByRole("button", { name: "Play", exact: true }));
      committed = acted;
    } else if (has("Cancel")) {
      // Staging a card that wants a target.
      if (snap.targetCandidates > 0) {
        acted = await tap(page, page.locator(".board-row .card--highlight.card--tappable:not(.card--selected)").first());
      } else {
        acted = await tap(page, page.getByRole("button", { name: "Cancel", exact: true }));
      }
    } else if (snap.handTappable > 0) {
      const pick = Math.floor(random() * snap.handTappable);
      acted = await tap(page, page.locator(".hand-row .card--tappable").nth(pick));
    }
    if (acted) taps += 1;
    else await page.waitForTimeout(120);
    if (committed) commits += 1;
    if (committed && opts.reloadEvery && commits % opts.reloadEvery === 0) {
      // The app was killed and relaunched right after a committed move: the match must resume from its autosave.
      // (A staged card is deliberately not saved, so reloading on a card tap would only undo it.)
      await page.reload();
      lastChange = Date.now();
    }
  }
}

/** Dismisses the match-over overlay and returns to whatever screen follows. */
export async function leaveTable(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Leave the table" }).click();
}

/** Taps "Collect" on every pending card reveal at the pub hub, returning how many there were. */
export async function collectReveals(page: Page): Promise<number> {
  let count = 0;
  const collect = page.getByRole("button", { name: "Collect", exact: true });
  while (await collect.isVisible().catch(() => false)) {
    await collect.click();
    count += 1;
  }
  return count;
}

/** Dismisses the pub hub's one-off hub hint beer mat, if it is up. */
export async function dismissHubHint(page: Page): Promise<void> {
  const mat = page.locator(".beer-mat-dismiss");
  if (await mat.isVisible().catch(() => false)) await mat.click();
}

// ---------------------------------------------------------------------------
// Finished matches for the tournament soaks
// ---------------------------------------------------------------------------
// Real matches are random and AI-paced, so a tournament "to a win" or "to
// elimination" can't be scripted by tapping alone. These build a genuinely
// finished match with the real engine and AI in Node and seed it as the
// player's resumable match: the app resumes into the match-over overlay and
// the real UI does the rest (payout, bracket advance, the champion screen).

import { chooseAIMove } from "../../../src/ai/aiOpponent";
import type { Deck } from "../../../src/cards/cardTypes";
import { starterDeck } from "../../../src/cards/data/decks/starterDeck";
import { createMatch, currentPlayer, playTurn, type MatchState } from "../../../src/engine/matchEngine";
import { OPPONENTS_BY_ID } from "../../../src/pub/opponents";

export function finishedMatch(opponentId: string, winner: "A" | "B", humanDeck: Deck = starterDeck): MatchState {
  const opponent = OPPONENTS_BY_ID.get(opponentId);
  if (!opponent) throw new Error(`unknown opponent ${opponentId}`);
  for (let matchSeed = 1; matchSeed < 500; matchSeed += 1) {
    let state = createMatch(humanDeck, opponent.deck, { seed: matchSeed });
    let aiSeed = matchSeed * 7919;
    while (state.status === "in-progress") {
      const mover = currentPlayer(state);
      const move = chooseAIMove(state, mover, mover === "A" ? opponent.deck : humanDeck, "regular", aiSeed);
      aiSeed = move.nextSeed;
      state = playTurn(state, mover, move.instanceId);
    }
    if (state.result?.winner === winner) return state;
  }
  throw new Error(`no seed produced a ${winner} win against ${opponentId}`);
}

export interface BracketSnapshot {
  tournamentId: string;
  status: "in-progress" | "eliminated" | "champion";
  playerMatches: { opponentId: string; outcome: "pending" | "won" | "lost" }[];
}

export async function readBracket(page: Page): Promise<BracketSnapshot | null> {
  const state = await readKey<{ active: BracketSnapshot | null }>(page, "tournament-state");
  return state?.active ?? null;
}

/** Seeds a finished tournament match against the bracket's current opponent and reloads into its match-over overlay. */
export async function resumeFinishedTournamentMatch(page: Page, winner: "A" | "B"): Promise<string> {
  const bracket = await readBracket(page);
  if (!bracket) throw new Error("no active bracket");
  const slot = bracket.playerMatches.find((m) => m.outcome === "pending");
  if (!slot) throw new Error("bracket has no pending match");
  const matchState = finishedMatch(slot.opponentId, winner);
  await page.evaluate(
    ({ save }) => localStorage.setItem("steampunk-shuffle:active-match", JSON.stringify(save)),
    { save: { matchState, aiSeed: 1, humanDeck: starterDeck, humanDeckName: "The Village Constable", context: { kind: "tournament", tournamentId: bracket.tournamentId } } },
  );
  await page.reload();
  return slot.opponentId;
}
