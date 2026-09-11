// Balance simulator (plan step 1.4; spec is design.md §16's downstream note
// for 1.4). AI-vs-AI self-play, reporting:
//   1. Per-card effective-vs-printed point lift (design.md §7.4)
//   2. Family average printed points vs design.md §4's curves
//   3. Win rate vs random play, by AI difficulty (regression check on 1.3)
//   4. AI-difficulty mirror win rates (sanity check on AI strength ordering)
//   5. Starter-vs-Regular-tier win rate (design.md §12.2)
//
// Run: `npm run sim`. Writes docs/balance.md and prints a summary to stdout.
//
// Card content note: reads the full v1 set and every authored deck from
// src/cards/data/ (plan step 1.5) — the canonical content module — rather
// than duplicating card definitions here.
//
// Opponent decks: design.md §16 also asks for "Legend-vs-starter win rate"
// (§9.3) — no Legend-tier deck is authored yet (src/cards/data/decks/
// README.md), so that one is still reported as not yet measurable.

import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import type { Card, Deck, Family } from "../src/cards/cardTypes.ts";
import { chooseAIMove, type Difficulty } from "../src/ai/aiOpponent.ts";
import {
  createMatch,
  currentPlayer,
  effectivePoints,
  playTurn,
  type MatchState,
  type PlayerId,
} from "../src/engine/matchEngine.ts";
import { stepRandom } from "../src/engine/rng.ts";

import { ALL_CARDS } from "../src/cards/data/index.ts";
import { KNOWN_DECKS as ALL_KNOWN_DECKS, starterDeck } from "../src/cards/data/decks/index.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Known content
// ---------------------------------------------------------------------------

/** Every real card in the v1 set, for the family-curve check (design.md §4). */
export const KNOWN_CARDS: Card[] = ALL_CARDS;

/** Every complete legal deck authored so far, for self-play. */
export const KNOWN_DECKS: { name: string; deck: Deck }[] = ALL_KNOWN_DECKS;

/** Regular-tier decks (design.md §9.1), for the starter-vs-Regular check (§12.2). */
const REGULAR_DECKS = KNOWN_DECKS.filter((d) => d.deck !== starterDeck && d.name !== "House (Sir Charles)");

// design.md §4: "average printed points across the family's Characters".
const FAMILY_TARGETS: Partial<Record<Family, number>> = {
  foundry: 3.8,
  yard: 3.0,
  salon: 2.4,
  rookery: 2.4,
  irregulars: 2.0,
};
// design.md §8.1: 6 Characters per family in the family's 9-card slice
// (the other 3 slots are Gadget/Scheme/Headline, non-Character). Legend
// signature cards (design.md §9.3) are also Characters affiliated with a
// family and get folded into this same average by computeFamilyCurves, so
// a family with a legend can legitimately sample above 6 (e.g. 7 or 8) —
// that's not "more than complete," just legends included.
const FULL_FAMILY_SIZE = 6;

// design.md §7.4: "flags any card whose *average* effective points exceed printed + 3."
const LIFT_OUTLIER_THRESHOLD = 3;

// ---------------------------------------------------------------------------
// 1. Family average points vs design.md §4 curves
// ---------------------------------------------------------------------------

export interface FamilyCurveRow {
  family: Family;
  avgPoints: number;
  target: number | undefined;
  delta: number | undefined;
  sampleSize: number;
}

export function computeFamilyCurves(cards: Card[]): FamilyCurveRow[] {
  const byFamily = new Map<Family, number[]>();
  for (const card of cards) {
    for (const face of card.faces) {
      if (face.type !== "character") continue;
      const list = byFamily.get(face.family) ?? [];
      list.push(face.points);
      byFamily.set(face.family, list);
    }
  }
  const rows: FamilyCurveRow[] = [];
  for (const [family, points] of byFamily) {
    const avg = points.reduce((a, b) => a + b, 0) / points.length;
    const target = FAMILY_TARGETS[family];
    rows.push({
      family,
      avgPoints: avg,
      target,
      delta: target === undefined ? undefined : avg - target,
      sampleSize: points.length,
    });
  }
  rows.sort((a, b) => a.family.localeCompare(b.family));
  return rows;
}

// ---------------------------------------------------------------------------
// 2. Per-card effective-vs-printed lift (design.md §7.4)
// ---------------------------------------------------------------------------

interface LiftObservation {
  cardId: string;
  cardName: string;
  faceIndex: number;
  printed: number;
  effective: number;
}

export interface CardLiftRow {
  cardId: string;
  cardName: string;
  faceIndex: number;
  printed: number;
  avgEffective: number;
  lift: number;
  samples: number;
  outlier: boolean;
}

export function computeCardLift(observations: LiftObservation[]): CardLiftRow[] {
  const byKey = new Map<string, LiftObservation[]>();
  for (const obs of observations) {
    const key = `${obs.cardId}#${obs.faceIndex}`;
    const list = byKey.get(key) ?? [];
    list.push(obs);
    byKey.set(key, list);
  }
  const rows: CardLiftRow[] = [];
  for (const list of byKey.values()) {
    const first = list[0]!;
    const avgEffective = list.reduce((a, b) => a + b.effective, 0) / list.length;
    const lift = avgEffective - first.printed;
    rows.push({
      cardId: first.cardId,
      cardName: first.cardName,
      faceIndex: first.faceIndex,
      printed: first.printed,
      avgEffective,
      lift,
      samples: list.length,
      outlier: lift > LIFT_OUTLIER_THRESHOLD,
    });
  }
  rows.sort((a, b) => b.lift - a.lift);
  return rows;
}

/** Samples effective points for every face-up board card, both sides, after a turn. */
function sampleBoardLift(state: MatchState, sink: LiftObservation[]): void {
  for (const owner of ["A", "B"] as PlayerId[]) {
    for (const bc of state.players[owner].board) {
      if (!bc.faceUp) continue;
      const face = bc.card.faces[bc.faceIndex]!;
      sink.push({
        cardId: bc.card.id,
        cardName: face.name,
        faceIndex: bc.faceIndex,
        printed: face.points,
        effective: effectivePoints(state, owner, bc),
      });
    }
  }
}

// ---------------------------------------------------------------------------
// 3 & 4. Self-play games
// ---------------------------------------------------------------------------

/** Uniform-random legal play — same policy as tests/unit/ai/aiOpponent.test.ts's randomTurn. */
function randomTurn(state: MatchState, playerId: PlayerId, seed: number): { state: MatchState; nextSeed: number } {
  const hand = state.players[playerId].hand;
  if (hand.length === 0) return { state: playTurn(state, playerId), nextSeed: seed };
  const step = stepRandom(seed);
  const idx = Math.floor(step.value * hand.length);
  return { state: playTurn(state, playerId, hand[idx]!.instanceId), nextSeed: step.seed };
}

function aiTurn(
  state: MatchState,
  playerId: PlayerId,
  opponentDeckList: typeof starterDeck,
  difficulty: Difficulty,
  seed: number,
): { state: MatchState; nextSeed: number } {
  const move = chooseAIMove(state, playerId, opponentDeckList, difficulty, seed);
  return { state: playTurn(state, playerId, move.instanceId), nextSeed: move.nextSeed };
}

const TURN_GUARD = 60;

/** Plays one AI-vs-random match on `deck` (both sides), sampling board lift after every turn. */
function playVsRandomGame(
  deck: typeof starterDeck,
  difficulty: Difficulty,
  matchSeed: number,
  aiSeed: number,
  liftSink: LiftObservation[],
): MatchState {
  let state = createMatch(deck, deck, { seed: matchSeed, shuffle: true });
  let randSeed = matchSeed * 7 + 13;
  let aiDecisionSeed = aiSeed;
  let guard = 0;
  while (state.status === "in-progress" && guard < TURN_GUARD) {
    guard++;
    const acting = currentPlayer(state);
    if (acting === "A") {
      const move = aiTurn(state, "A", deck, difficulty, aiDecisionSeed);
      state = move.state;
      aiDecisionSeed = move.nextSeed;
    } else {
      const move = randomTurn(state, "B", randSeed);
      state = move.state;
      randSeed = move.nextSeed;
    }
    sampleBoardLift(state, liftSink);
  }
  if (state.status !== "complete") throw new Error("match did not finish within the turn guard");
  return state;
}

/** Plays one AI-vs-AI mirror match on `deck` (both sides), sampling board lift after every turn. */
function playMirrorGame(
  deck: typeof starterDeck,
  difA: Difficulty,
  difB: Difficulty,
  matchSeed: number,
  seedA: number,
  seedB: number,
  liftSink: LiftObservation[],
): MatchState {
  let state = createMatch(deck, deck, { seed: matchSeed, shuffle: true });
  let sA = seedA;
  let sB = seedB;
  let guard = 0;
  while (state.status === "in-progress" && guard < TURN_GUARD) {
    guard++;
    const acting = currentPlayer(state);
    if (acting === "A") {
      const move = aiTurn(state, "A", deck, difA, sA);
      state = move.state;
      sA = move.nextSeed;
    } else {
      const move = aiTurn(state, "B", deck, difB, sB);
      state = move.state;
      sB = move.nextSeed;
    }
    sampleBoardLift(state, liftSink);
  }
  if (state.status !== "complete") throw new Error("match did not finish within the turn guard");
  return state;
}

export interface VsRandomResult {
  difficulty: Difficulty;
  games: number;
  winRate: number;
}

function runVsRandom(deck: typeof starterDeck, difficulty: Difficulty, games: number, liftSink: LiftObservation[]): VsRandomResult {
  let wins = 0;
  for (let g = 0; g < games; g++) {
    const matchSeed = 2_000_003 * (g + 1);
    const aiSeed = 3_000_017 * (g + 1);
    const result = playVsRandomGame(deck, difficulty, matchSeed, aiSeed, liftSink);
    if (result.result?.winner === "A") wins++;
  }
  return { difficulty, games, winRate: wins / games };
}

export interface MirrorResult {
  difA: Difficulty;
  difB: Difficulty;
  games: number;
  winRateA: number;
}

function runMirror(deck: typeof starterDeck, difA: Difficulty, difB: Difficulty, games: number, liftSink: LiftObservation[]): MirrorResult {
  let winsA = 0;
  for (let g = 0; g < games; g++) {
    const matchSeed = 5_000_011 * (g + 1);
    const seedA = 6_000_013 * (g + 1);
    const seedB = 7_000_017 * (g + 1);
    const result = playMirrorGame(deck, difA, difB, matchSeed, seedA, seedB, liftSink);
    if (result.result?.winner === "A") winsA++;
  }
  return { difA, difB, games, winRateA: winsA / games };
}

/** Plays one AI-vs-AI match with a *different* deck per side (design.md §12.2, §9.3). */
function playHeadToHeadGame(
  deckA: Deck,
  deckB: Deck,
  difA: Difficulty,
  difB: Difficulty,
  matchSeed: number,
  seedA: number,
  seedB: number,
  liftSink: LiftObservation[],
): MatchState {
  let state = createMatch(deckA, deckB, { seed: matchSeed, shuffle: true });
  let sA = seedA;
  let sB = seedB;
  let guard = 0;
  while (state.status === "in-progress" && guard < TURN_GUARD) {
    guard++;
    const acting = currentPlayer(state);
    if (acting === "A") {
      const move = aiTurn(state, "A", deckB, difA, sA);
      state = move.state;
      sA = move.nextSeed;
    } else {
      const move = aiTurn(state, "B", deckA, difB, sB);
      state = move.state;
      sB = move.nextSeed;
    }
    sampleBoardLift(state, liftSink);
  }
  if (state.status !== "complete") throw new Error("match did not finish within the turn guard");
  return state;
}

export interface HeadToHeadResult {
  deckAName: string;
  deckBName: string;
  games: number;
  winRateA: number;
}

function runHeadToHead(
  deckAName: string,
  deckA: Deck,
  deckBName: string,
  deckB: Deck,
  difA: Difficulty,
  difB: Difficulty,
  games: number,
  liftSink: LiftObservation[],
): HeadToHeadResult {
  let winsA = 0;
  for (let g = 0; g < games; g++) {
    const matchSeed = 11_000_003 * (g + 1);
    const seedA = 12_000_017 * (g + 1);
    const seedB = 13_000_029 * (g + 1);
    const result = playHeadToHeadGame(deckA, deckB, difA, difB, matchSeed, seedA, seedB, liftSink);
    if (result.result?.winner === "A") winsA++;
  }
  return { deckAName, deckBName, games, winRateA: winsA / games };
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function pct(x: number): string {
  return `${(x * 100).toFixed(0)}%`;
}

function buildReport(opts: {
  elapsedMs: number;
  familyCurves: FamilyCurveRow[];
  cardLift: CardLiftRow[];
  vsRandom: VsRandomResult[];
  mirrors: MirrorResult[];
  headToHead: HeadToHeadResult[];
}): string {
  const { elapsedMs, familyCurves, cardLift, vsRandom, mirrors, headToHead } = opts;
  const outliers = cardLift.filter((r) => r.outlier);
  const lines: string[] = [];

  lines.push("# Balance report");
  lines.push("");
  lines.push(`Generated by \`tools/sim.ts\` (plan step 1.4) in ${(elapsedMs / 1000).toFixed(1)}s.`);
  lines.push(`Decks known: ${KNOWN_DECKS.map((d) => d.name).join(", ")}. Cards known: ${KNOWN_CARDS.length}.`);
  lines.push("");

  lines.push("## Per-card effective-vs-printed lift (design.md §7.4)");
  lines.push("");
  lines.push("Flags any card whose average effective points (across all self-play/vs-random samples where it was face-up) exceed printed + 3.");
  lines.push("");
  if (outliers.length === 0) {
    lines.push("**No outliers.**");
  } else {
    lines.push("**Outliers:**");
    lines.push("");
    lines.push("| Card | Printed | Avg effective | Lift | Samples |");
    lines.push("|---|---|---|---|---|");
    for (const row of outliers) {
      lines.push(`| ${row.cardName} | ${row.printed} | ${row.avgEffective.toFixed(2)} | +${row.lift.toFixed(2)} | ${row.samples} |`);
    }
  }
  lines.push("");
  lines.push("<details><summary>All cards</summary>");
  lines.push("");
  lines.push("| Card | Printed | Avg effective | Lift | Samples |");
  lines.push("|---|---|---|---|---|");
  for (const row of cardLift) {
    lines.push(`| ${row.cardName} | ${row.printed} | ${row.avgEffective.toFixed(2)} | ${row.lift >= 0 ? "+" : ""}${row.lift.toFixed(2)} | ${row.samples} |`);
  }
  lines.push("");
  lines.push("</details>");
  lines.push("");

  lines.push("## Family average points vs design.md §4 curves");
  lines.push("");
  lines.push(
    `Target is the average across a family's ${FULL_FAMILY_SIZE} v1 Characters, plus any legend signature ` +
      "cards affiliated with that family (design.md §9.3) — so a sample above 6 includes legends, not extra v1 cards.",
  );
  lines.push("");
  lines.push(`| Family | Avg points | Target | Delta | Sample (${FULL_FAMILY_SIZE}+ legends) |`);
  lines.push("|---|---|---|---|---|");
  for (const row of familyCurves) {
    const target = row.target === undefined ? "—" : row.target.toFixed(1);
    const delta = row.delta === undefined ? "—" : `${row.delta >= 0 ? "+" : ""}${row.delta.toFixed(2)}`;
    const flag = row.sampleSize < FULL_FAMILY_SIZE ? " (partial)" : "";
    lines.push(`| ${row.family} | ${row.avgPoints.toFixed(2)} | ${target} | ${delta} | ${row.sampleSize}${flag} |`);
  }
  lines.push("");

  lines.push("## Win rate vs random play, by AI difficulty (regression check on plan step 1.3)");
  lines.push("");
  lines.push("| Difficulty | Games | Win rate |");
  lines.push("|---|---|---|");
  for (const r of vsRandom) {
    lines.push(`| ${r.difficulty} | ${r.games} | ${pct(r.winRate)} |`);
  }
  lines.push("");

  lines.push("## AI-difficulty mirror win rates (sanity check on AI strength ordering)");
  lines.push("");
  lines.push("Both sides play the starter deck; only the AI difficulty differs.");
  lines.push("");
  lines.push("| A (difficulty) | B (difficulty) | Games | A win rate |");
  lines.push("|---|---|---|---|");
  for (const r of mirrors) {
    lines.push(`| ${r.difA} | ${r.difB} | ${r.games} | ${pct(r.winRateA)} |`);
  }
  lines.push("");

  lines.push("## Starter-vs-Regular-tier win rate (design.md §12.2, target ~60%)");
  lines.push("");
  lines.push(
    "The starter deck (`regular` AI) against each Regular-tier opponent deck (`regular` AI on both sides — " +
      "the AI dial, not the *deck's* tier, matters here per design.md §9.4). Target: the starter deck should win " +
      "about 60% of the time when played sensibly.",
  );
  lines.push("");
  lines.push("| Opponent | Games | Starter win rate |");
  lines.push("|---|---|---|");
  for (const r of headToHead) {
    lines.push(`| ${r.deckBName} | ${r.games} | ${pct(r.winRateA)} |`);
  }
  lines.push("");

  lines.push("## Not yet measurable");
  lines.push("");
  lines.push("- **Legend-vs-starter win rate** (design.md §9.3, target ~70%) — needs a Legend-tier opponent deck (design.md §9.3); none authored yet (`src/cards/data/decks/README.md`).");
  lines.push("");

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const start = Date.now();
  const liftSink: LiftObservation[] = [];
  const deck = starterDeck; // the only complete legal deck known today

  const vsRandom: VsRandomResult[] = [
    runVsRandom(deck, "regular", 25, liftSink),
    runVsRandom(deck, "seasoned", 15, liftSink),
    runVsRandom(deck, "legend", 8, liftSink),
  ];

  const mirrors: MirrorResult[] = [
    runMirror(deck, "regular", "regular", 20, liftSink),
    runMirror(deck, "seasoned", "seasoned", 15, liftSink),
    runMirror(deck, "legend", "legend", 6, liftSink),
    runMirror(deck, "regular", "legend", 6, liftSink),
  ];

  const headToHead: HeadToHeadResult[] = REGULAR_DECKS.map((opponent) =>
    runHeadToHead("Starter (Village Constable)", deck, opponent.name, opponent.deck, "regular", "regular", 20, liftSink),
  );

  const familyCurves = computeFamilyCurves(KNOWN_CARDS);
  const cardLift = computeCardLift(liftSink);
  const elapsedMs = Date.now() - start;

  const report = buildReport({ elapsedMs, familyCurves, cardLift, vsRandom, mirrors, headToHead });

  const outPath = path.join(__dirname, "..", "docs", "balance.md");
  writeFileSync(outPath, report + "\n");

  const outliers = cardLift.filter((r) => r.outlier);
  console.log(report);
  console.log("---");
  console.log(`Wrote ${path.relative(process.cwd(), outPath)} in ${(elapsedMs / 1000).toFixed(1)}s.`);
  console.log(outliers.length === 0 ? "No card-lift outliers." : `${outliers.length} card-lift outlier(s) — see report.`);
}

const isMain = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) main();
