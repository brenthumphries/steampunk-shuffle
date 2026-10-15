// App Store screenshots (ATT-35, docs/store-listing.md): six shots of the iOS
// bundle at each iPhone size Apple requires, written to art/store-screenshots/.
//
//   npm run store-screenshots            # builds dist-native, serves it, shoots
//   npm run store-screenshots -- --no-build
//
// Every shot starts from a seeded save, a fixed clock and a fresh browser
// context with reduced motion on (so no animation is caught mid-frame), so a
// re-run gives the same picture. The seed is the public edition
// of the game, not Sara's: no dedication, a neutral player name, no Birthday
// Invitational, no Landlady, and none of the pub cats on screen. Before each
// shot the page is scanned for anything docs/app-store-readiness.md rates High
// for IP, and for the gift-edition touches; a hit fails the run rather than
// writing a picture with it in.
//
// The match is built with the real engine and AI (a seed search, as
// tests/e2e/helpers/game.ts does for `finishedMatch`), then resumed through
// the app's own save path, so the screen is the real one.

import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync, inflateSync, crc32 } from "node:zlib";
import { devices, webkit, type Browser, type Page } from "@playwright/test";
import { chooseAIMove } from "../src/ai/aiOpponent.ts";
import type { Deck } from "../src/cards/cardTypes.ts";
import { boardScore, createMatch, currentPlayer, playTurn, type MatchState } from "../src/engine/matchEngine.ts";
import { computeLegality, type DeckSlot } from "../src/decks/deckSlots.ts";
import { createEmptySlots } from "../src/decks/deckSlots.ts";
import { ACQUIRABLE_CARDS_BY_ID } from "../src/pub/acquirableCards.ts";
import { OPPONENTS_BY_ID } from "../src/pub/opponents.ts";
import type { BracketMatchSlot } from "../src/tournaments/bracket.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "art", "store-screenshots");
const PORT = 4175;
const ORIGIN = `http://localhost:${PORT}`;

/**
 * Apple's iPhone sizes (Screenshot specifications, checked 2026-10-14): one set
 * for "Dynamic Island (medium)", which is required, and one for "Dynamic Island
 * (large)", which stands in for the conditionally required large size. Each is
 * a real iPhone's point size at 3x, so the game lays out as it does on the
 * phone. The medium viewport is the 402x874 the e2e suite is tuned to.
 */
export const SIZES = [
  { dir: "iphone-6.3in-1206x2622", width: 1206, height: 2622, viewport: { width: 402, height: 874 } },
  { dir: "iphone-6.9in-1320x2868", width: 1320, height: 2868, viewport: { width: 440, height: 956 } },
] as const;
const SCALE = 3;

/**
 * A Tuesday in September: before the Hallowe'en window (no event dressing) and
 * before 30 October. The Invitational's trigger fires on 30 October or any later
 * day of the year, so a November date would put the Birthday Invitational and the
 * Landlady on the chalkboard.
 */
const SHOT_DATE = new Date(2026, 8, 22, 12, 0, 0);

/** Anything docs/app-store-readiness.md rates High, by name and by art id. A match fails the run. */
export const HIGH_RISK: RegExp[] = [
  /Christie/i, /Agatha/i, /Poirot/i, /mon ami/i, /little grey cells/i,
  /Good News, Every/i, /Wernstrom/i, /Party Time/i, /Abby Normal/i, /Eye-gor/i, /Walk this way/i, /pronounced Frankenstein/i,
  /dame-agatha/, /hercule-poirot/, /good-news-everybody/, /party-time-excellent/, /abby-normal/, /eye-gor/,
];

/** Gift-edition touches (docs/app-store-readiness.md section 7) and the real pub cats' names. A match fails the run. */
export const PERSONAL: RegExp[] = [
  /\bSara\b/, /Landlady/i, /Invitational/i, /birthday/i, /Licensed to/i, /the-landlady/,
  /Hiawatha/, /Banshee/, /Bramwell/, /\bCharlotte\b/, /\bEmily\b/,
];

const CAT_IDS = new Set(["hiawatha", "banshee", "bramwell", "charlotte", "emily"]);
const HIGH_RISK_IDS = new Set(["dame-agatha", "hercule-poirot", "good-news-everybody", "party-time-excellent", "abby-normal", "eye-gor"]);
const PLAYER_NAME = "Alex";

// ---------------------------------------------------------------------------
// The seeded save
// ---------------------------------------------------------------------------

// "Heavy Industry" (design.md section 4, Foundry + Yard): a legal 20-card deck of
// owned cards with no pub cat in it, kept to 45 printed points so the chalkboard's
// pauper-format Peelers' Cup (45 or fewer) is open to it as well. The starter's four cats are never in the
// deck, and the Foundry has no cat, so the deck builder can be filtered to a
// family whose tiles are all safe to show.
export const DECK_NAME = "Heavy Industry";
const DECK_CARDS: readonly [string, number][] = [
  ["constable-on-the-beat", 2], ["night-watchman", 2], ["sergeant-pike", 1], ["inspectors-warrant", 2], ["police-whistle", 2],
  ["apprentice-fitter", 2], ["boiler-hand", 2], ["riveter", 1], ["brass-cog", 2], ["steam-hammer", 2],
  ["sabotage", 1], ["the-concertina-works", 1],
];
/** Cards owned beyond the starter's fixed 14: the deck's Foundry half, and the reward cards for the four Regulars beaten. */
const COLLECTION = [
  "apprentice-fitter", "apprentice-fitter", "boiler-hand", "boiler-hand", "riveter", "brass-cog", "brass-cog", "steam-hammer", "steam-hammer",
  "foreman-gudgeon", "difference-engine", "sabotage", "the-concertina-works",
  "sergeant-pike", "nells-basket", "regs-ledger", "miss-hollis-authoress",
];
const OPPONENT_RECORDS = {
  mudd: { wins: 2, losses: 1, rewardClaimed: true },
  "nell-ashby": { wins: 1, losses: 0, rewardClaimed: true },
  "reg-farrow": { wins: 1, losses: 1, rewardClaimed: true },
  "prudence-hollis": { wins: 1, losses: 0, rewardClaimed: true },
};
/** Five wins: Regulars and Seasoned are in the pub and no Legend is, so no Legend's portrait, line or first-win card is on the hub. */
const PUB_STATE = {
  checks: 87,
  totalWins: 5,
  opponents: OPPONENT_RECORDS,
  collection: COLLECTION,
  lastDailyBonusDate: null,
  lastLostAndFoundDate: null,
  pawnedCards: [],
  pawnbrokerPurchasedToday: [],
  pawnbrokerPurchaseDate: null,
};

function cardById(id: string) {
  const card = ACQUIRABLE_CARDS_BY_ID.get(id);
  if (!card) throw new Error(`unknown card id ${id}`);
  return card;
}

export const humanDeck: Deck = DECK_CARDS.map(([id, quantity]) => ({ card: cardById(id), quantity }));
const deckSlot: DeckSlot = { name: DECK_NAME, entries: DECK_CARDS.map(([cardId, quantity]) => ({ cardId, quantity })) };

export const DECK_LEGALITY = computeLegality(deckSlot, ACQUIRABLE_CARDS_BY_ID);

function deckSlotsState() {
  if (!DECK_LEGALITY.valid) throw new Error(`the screenshot deck is not legal: ${DECK_LEGALITY.errors.join("; ")}`);
  const slots = createEmptySlots();
  slots[0] = deckSlot;
  return { slots, selectedIndex: 0 };
}

/** The Tuesday Knockout, one match won and the semifinal next. Opponents are Regulars and Seasoned with no High-risk art. */
export function bracketState() {
  const seats = ["reg-farrow", "prudence-hollis", "mudd", "lovelace", "adler", "dickens", "nell-ashby"];
  const playerMatches: [BracketMatchSlot, BracketMatchSlot, BracketMatchSlot] = [
    { opponentId: "reg-farrow", outcome: "won" },
    { opponentId: "lovelace", outcome: "pending" },
    { opponentId: "dickens", outcome: "pending" },
  ];
  return { invitationalTriggered: false, active: { tournamentId: "tuesday-knockout", seatOpponentIds: seats, playerMatches, status: "in-progress" } };
}

const ALL_HINTS_SHOWN = ["location", "elusive", "return", "headline", "hub"];
export const COMMON_SEED = {
  "steampunk-shuffle:tutorial-state": { completed: true, matchesPlayed: 5, shownHints: ALL_HINTS_SHOWN },
  "steampunk-shuffle:player": { name: PLAYER_NAME, dedicationSeen: true },
  "steampunk-shuffle:pub-state": PUB_STATE,
  "steampunk-shuffle:deck-slots": deckSlotsState(),
};

/**
 * A real match against Old Nell Ashby, paused in round 2 on the player's turn:
 * round 1 taken by the player, a few cards on each board, the score close.
 * The first seed where neither board holds a cat or a High-risk card.
 */
export function midRoundMatch(): { state: MatchState; seed: number } {
  const opponent = OPPONENTS_BY_ID.get("nell-ashby")!;
  const unwanted = (id: string): boolean => CAT_IDS.has(id) || HIGH_RISK_IDS.has(id);
  for (let seed = 1; seed < 5000; seed += 1) {
    let state = createMatch(humanDeck, opponent.deck, { seed });
    let aiSeed = seed * 7919;
    while (state.status === "in-progress") {
      const mover = currentPlayer(state);
      if (mover === "A" && state.round === 2 && state.turnsPlayedThisRound >= 3) {
        const boards = [...state.players.A.board, ...state.players.B.board];
        const clean = boards.every((bc) => !unwanted(bc.card.id)) && (!state.location || !unwanted(state.location.card.id));
        const close = Math.abs(boardScore(state, "A") - boardScore(state, "B")) <= 3;
        if (clean && close && state.roundsWon.A === 1 && state.roundsWon.B === 0 && state.players.A.hand.length >= 4 && state.players.B.hand.length <= 8 && state.players.B.board.length >= 2) return { state, seed };
        break;
      }
      const move = chooseAIMove(state, mover, mover === "A" ? opponent.deck : humanDeck, "regular", aiSeed);
      aiSeed = move.nextSeed;
      state = playTurn(state, mover, move.instanceId);
    }
  }
  throw new Error("no seed gave a clean mid-round match");
}

// ---------------------------------------------------------------------------
// Browser plumbing
// ---------------------------------------------------------------------------

function startServer(): ChildProcess {
  return spawn(process.execPath, ["--import", "tsx", "tools/serveNative.ts", String(PORT), "dist-native"], { cwd: ROOT, stdio: "ignore" });
}

async function waitForServer(): Promise<void> {
  for (let i = 0; i < 50; i += 1) {
    try {
      if ((await fetch(`${ORIGIN}/`)).ok) return;
    } catch {
      // not up yet
    }
    await new Promise((done) => setTimeout(done, 200));
  }
  throw new Error(`nothing is serving ${ORIGIN}`);
}

async function openSeeded(browser: Browser, size: (typeof SIZES)[number], seed: Record<string, unknown>): Promise<Page> {
  const context = await browser.newContext({ ...devices["iPhone 17"], viewport: size.viewport, deviceScaleFactor: SCALE, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.clock.setFixedTime(SHOT_DATE);
  await page.goto(`${ORIGIN}/`);
  await page.evaluate((entries) => {
    localStorage.clear();
    for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, JSON.stringify(value));
  }, seed);
  await page.goto(`${ORIGIN}/`);
  return page;
}

async function settle(page: Page, selector: string): Promise<void> {
  await page.waitForSelector(selector);
  await page.waitForFunction(() => [...document.images].every((img) => img.complete) && !document.querySelector(".beer-mat"));
  await page.evaluate(() => Promise.all([...document.images].map((img) => img.decode().catch(() => undefined))));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
}

/**
 * What is on screen: the text, attributes and inline styles (where a card's art
 * id lives) of every element that intersects the viewport. Cards scrolled out
 * of view are not in the picture, so they are not scanned.
 */
async function visibleMarkup(page: Page): Promise<string> {
  return page.evaluate(() => {
    const parts: string[] = [];
    for (const el of document.body.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0 || r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) continue;
      parts.push(el.cloneNode(false) instanceof Element ? (el.cloneNode(false) as Element).outerHTML : "");
      for (const node of el.childNodes) if (node.nodeType === Node.TEXT_NODE) parts.push(node.textContent ?? "");
    }
    return parts.join("\n");
  });
}

/** Fails the run if the picture would hold a High-risk name or image, a gift-edition touch or a pub cat. */
async function assertClean(page: Page, shot: string): Promise<void> {
  const markup = await visibleMarkup(page);
  for (const [label, patterns] of [["a High-risk name or art id (docs/app-store-readiness.md)", HIGH_RISK], ["a gift-edition touch or a pub cat", PERSONAL]] as const) {
    const hit = patterns.find((p) => p.test(markup));
    if (hit) throw new Error(`${shot}: the picture holds ${label}: ${hit}`);
  }
}

// ---------------------------------------------------------------------------
// PNG: Apple's screenshots must have no alpha channel, and Playwright writes RGBA
// ---------------------------------------------------------------------------

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function chunk(type: string, data: Buffer): Buffer {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, "latin1");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, crc]);
}

/** Re-encodes an 8-bit RGBA PNG as 8-bit RGB. Throws if any pixel is not fully opaque, since dropping alpha would then change the picture. */
export function stripAlpha(png: Buffer): { png: Buffer; width: number; height: number } {
  if (!png.subarray(0, 8).equals(PNG_SIGNATURE)) throw new Error("not a PNG");
  let width = 0;
  let height = 0;
  const idat: Buffer[] = [];
  for (let offset = 8; offset < png.length; ) {
    const length = png.readUInt32BE(offset);
    const type = png.toString("latin1", offset + 4, offset + 8);
    const data = png.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      if (data[8] !== 8 || data[9] !== 6 || data[12] !== 0) throw new Error(`expected 8-bit non-interlaced RGBA, got depth ${data[8]} type ${data[9]} interlace ${data[12]}`);
    } else if (type === "IDAT") idat.push(data);
    offset += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * 4;
  const rgb = Buffer.alloc(height * (1 + width * 3));
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)]!;
    const row = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let i = 0; i < stride; i += 1) {
      const a = i >= 4 ? row[i - 4]! : 0;
      const b = prev[i]!;
      const c = i >= 4 ? prev[i - 4]! : 0;
      let add = 0;
      if (filter === 1) add = a;
      else if (filter === 2) add = b;
      else if (filter === 3) add = (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        add = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      } else if (filter !== 0) throw new Error(`unknown PNG filter ${filter}`);
      row[i] = (row[i]! + add) & 0xff;
    }
    const out = y * (1 + width * 3);
    rgb[out] = 0;
    for (let x = 0; x < width; x += 1) {
      if (row[x * 4 + 3] !== 255) throw new Error(`pixel ${x},${y} is not opaque`);
      rgb[out + 1 + x * 3] = row[x * 4]!;
      rgb[out + 2 + x * 3] = row[x * 4 + 1]!;
      rgb[out + 3 + x * 3] = row[x * 4 + 2]!;
    }
    prev = row;
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const out = Buffer.concat([PNG_SIGNATURE, chunk("IHDR", ihdr), chunk("IDAT", deflateSync(rgb, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
  return { png: out, width, height };
}

// ---------------------------------------------------------------------------
// The shots
// ---------------------------------------------------------------------------

interface Shot {
  file: string;
  shows: string;
  take: (browser: Browser, size: (typeof SIZES)[number]) => Promise<Page>;
}

let midRound: { state: MatchState; seed: number } | undefined;
function matchSeed(): Record<string, unknown> {
  midRound ??= midRoundMatch();
  return {
    ...COMMON_SEED,
    "steampunk-shuffle:active-match": {
      matchState: midRound.state,
      aiSeed: 1,
      humanDeck,
      humanDeckName: DECK_NAME,
      context: { kind: "pickup", opponentId: "nell-ashby", stakedCardId: null },
    },
  };
}
/** The first of these on the board is the one zoomed: a Persist card shows a keyword and flavour text. */
const ZOOM_PREFERENCE = ["Sergeant Pike", "Steam Hammer", "Brass Cog", "Riveter"];

export const SHOTS: Shot[] = [
  {
    file: "01-pub-hub.png",
    shows: "The pub hub on a Tuesday evening: Tonight's patrons (Sir Charles, four Regulars, four Seasoned), 87 Checks, the selected deck and the hub's buttons.",
    take: async (browser, size) => {
      const page = await openSeeded(browser, size, COMMON_SEED);
      await settle(page, ".pub-hub");
      return page;
    },
  },
  {
    file: "02-match.png",
    shows: "Round 2 of a match against Old Nell Ashby, the player ahead one round to none, cards on both boards (Sergeant Pike and Steam Hammer on the player's side) and a hand of four to play.",
    take: async (browser, size) => {
      const page = await openSeeded(browser, size, matchSeed());
      await settle(page, ".hand-row .card");
      return page;
    },
  },
  {
    file: "03-card-zoom.png",
    shows: "The full-card zoom for a card on the player's board mid-match (Sergeant Pike when he is out): art, points, family, rarity, keyword, flavour text.",
    take: async (browser, size) => {
      const page = await openSeeded(browser, size, matchSeed());
      await settle(page, ".hand-row .card");
      const onScreen = await page.locator(".card-zoom-btn").evaluateAll((buttons) => buttons.map((b) => b.getAttribute("aria-label") ?? ""));
      const name = ZOOM_PREFERENCE.find((n) => onScreen.includes(`Show full card: ${n}`));
      if (!name) throw new Error(`none of ${ZOOM_PREFERENCE.join(", ")} is on screen`);
      await page.locator(`.card-zoom-btn[aria-label="Show full card: ${name}"]`).first().click();
      await settle(page, ".overlay--zoom");
      return page;
    },
  },
  {
    file: "04-deck-builder.png",
    shows: `The deck builder open on "${DECK_NAME}" (${DECK_LEGALITY.totalCards}/20 cards, ${DECK_LEGALITY.totalPoints}/60 points, legal), filtered to the Foundry and the cards the player owns.`,
    take: async (browser, size) => {
      const page = await openSeeded(browser, size, COMMON_SEED);
      await page.getByRole("button", { name: "Build a deck" }).click();
      await page.locator(".deck-slot-row").first().locator(".deck-slot-info").click();
      await page.getByRole("combobox").first().selectOption("foundry");
      await page.getByLabel("Owned only").check();
      await settle(page, ".deck-card-tile");
      return page;
    },
  },
  {
    file: "05-chalkboard.png",
    shows: "The chalkboard: the Tuesday Knockout and the Peelers' Cup open to enter, the Reichenbach Open locked, each with its entry rule, cost and prize. No Birthday Invitational.",
    take: async (browser, size) => {
      const page = await openSeeded(browser, size, COMMON_SEED);
      await page.getByRole("button", { name: "The chalkboard" }).click();
      await settle(page, ".tournament-row");
      return page;
    },
  },
  {
    file: "06-tournament-bracket.png",
    shows: "The Tuesday Knockout bracket: the quarterfinal won against Dodgy Reg Farrow, the semifinal against Ada Lovelace next, the final against Charles Dickens.",
    take: async (browser, size) => {
      const page = await openSeeded(browser, size, { ...COMMON_SEED, "steampunk-shuffle:tournament-state": bracketState() });
      await page.getByRole("button", { name: "The chalkboard" }).click();
      await page.locator(".tournament-row").filter({ hasText: "The Tuesday Knockout" }).getByRole("button", { name: "Resume" }).click();
      await settle(page, ".bracket-stage");
      return page;
    },
  },
];

async function main(): Promise<void> {
  if (!process.argv.includes("--no-build")) {
    execFileSync("npx", ["vite", "build", "--mode", "native", "--outDir", "dist-native", "--emptyOutDir"], { cwd: ROOT, stdio: "inherit" });
  }
  const server = startServer();
  const browser = await webkit.launch();
  try {
    await waitForServer();
    rmSync(OUT_DIR, { recursive: true, force: true });
    for (const size of SIZES) {
      mkdirSync(join(OUT_DIR, size.dir), { recursive: true });
      for (const shot of SHOTS) {
        const page = await shot.take(browser, size);
        await assertClean(page, `${size.dir}/${shot.file}`);
        const stripped = stripAlpha(await page.screenshot({ type: "png" }));
        if (stripped.width !== size.width || stripped.height !== size.height) throw new Error(`${shot.file}: ${stripped.width}x${stripped.height}, wanted ${size.width}x${size.height}`);
        writeFileSync(join(OUT_DIR, size.dir, shot.file), stripped.png);
        await page.context().close();
        console.log(`${size.dir}/${shot.file}  ${size.width}x${size.height}`);
      }
    }
    writeFileSync(join(OUT_DIR, "shots.json"), JSON.stringify({ date: SHOT_DATE.toISOString(), sizes: SIZES, shots: SHOTS.map((s) => ({ file: s.file, shows: s.shows })), matchSeed: midRound?.seed }, null, 2) + "\n");
  } finally {
    await browser.close();
    server.kill();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
