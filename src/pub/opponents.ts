// Opponent registry for the pub hub (plan step 2.3, design.md §9). Combines
// each opponent's tier (sets both the AI dial from 1.3 and the Checks
// payout from §11.1), public deck (1.5), reward card (§9.1-9.3, given once
// on the first pickup win), and unlock threshold (§12.1's win-count table).
//
// Sir Charles isn't tiered in §9.1-9.3 and isn't in §11.1's Checks table
// (which names exactly "Regular / Seasoned / Legend") — he's the standing
// practice opponent from the tutorial, always available, and pays no
// Checks or reward card of his own. Modeled as `tier: "house"` rather than
// folded into "regular" so that distinction stays explicit at the call
// site instead of hiding in a Checks-lookup branch.

import type { Deck } from "../cards/cardTypes.ts";
import type { Difficulty } from "../ai/aiOpponent.ts";
import type { MatchState } from "../engine/matchEngine.ts";
import { eventLineOverride, eventSirCharlesLines, isVisitorInTown } from "../events/seasonalEvents.ts";
import {
  houseDeck,
  muddsDeck,
  nellsDeck,
  regsDeck,
  hollisDeck,
  bucketsDeck,
  lovelacesDeck,
  adlersDeck,
  dickensDeck,
  holmesDeck,
  moriartysDeck,
  christiesDeck,
  poirotsDeck,
  jekyllsDeck,
  shelleysDeck,
  griffinsDeck,
  pharaohsDeck,
  countsDeck,
  wolfsDeck,
  creaturesDeck,
  jacksDeck,
} from "../cards/data/decks/index.ts";

/**
 * "visitor" (seasonal-events-plan.md §2 rule 2): a seasonal-event opponent.
 * Plays the `seasoned` dial and pays Seasoned Checks, but isn't in the
 * year-round unlock ladder or the legends-in-town rotation — whether one is
 * in the pub is the event registry's call (src/events/seasonalEvents.ts).
 */
export type OpponentTier = "house" | "regular" | "seasoned" | "legend" | "visitor";

export interface Opponent {
  id: string;
  name: string;
  tier: OpponentTier;
  deck: Deck;
  /**
   * Fixed dial, or (for Dr Jekyll/Mr Hyde) a per-round override —
   * design.md §9.3: "Jekyll rounds play seasoned, Hyde rounds play
   * legend," flagged in 1.3/1.4's gotchas as this step's job. There's no
   * cheap "which face is currently up" signal to read here, so this keys
   * off `MatchState.round` instead: round 1 (he opens as Jekyll, per his
   * personality note in §9.3) plays seasoned, rounds 2+ (Hyde is already
   * on the board by then) play legend. A judgment call, not a locked spec.
   */
  difficulty: Difficulty | ((state: MatchState) => Difficulty);
  /** Reward card id, given once on the first pickup win (§9.1-9.3). Sir Charles has none, nor does a `tournamentOnly` opponent (their card is the tournament's prize). */
  rewardCardId: string | null;
  /**
   * Sits at the table only inside one specific tournament (Spring-Heeled Jack
   * in the All Hallows' Wake): never in Tonight's Patrons, and never drawn
   * into any other tournament's field even though his tier is `legend`.
   */
  tournamentOnly?: boolean;
  /** Combined pickup + tournament wins (§12.1) needed before this opponent appears in "tonight's patrons". */
  unlockWins: number;
  portraitArtId?: string;
  line: string;
  /**
   * Bar Bet's stakes (design.md §11.5): "3-4 cards, mostly uncommons, one
   * rare for Seasoned/Legends." Authored per opponent from their own
   * family's/deck's card pool where one exists; a couple of families have
   * no in-family rare in the labeled 60 (Foundry), so the "one rare" slot
   * borrows a thematically-buffing neutral Location instead
   * (src/cards/data/locations.ts). Reuse of the same rare across more
   * than one opponent's pool is deliberate, not an oversight — flavor
   * authoring, not a uniqueness guarantee. Empty for Sir Charles, who
   * doesn't participate in Bar Bet (see `canOfferBarBet`,
   * src/pub/barBet.ts).
   */
  betPool: readonly string[];
}

export const SIR_CHARLES: Opponent = {
  id: "sir-charles",
  name: "Sir Charles",
  tier: "house",
  deck: houseDeck,
  difficulty: "regular",
  rewardCardId: null,
  unlockWins: 0,
  portraitArtId: "portrait-sir-charles-wheatstone",
  line: "Evening. Table's yours whenever you fancy it.",
  betPool: [],
};

export const OPPONENTS: Opponent[] = [
  SIR_CHARLES,
  // Seasonal visitors (seasonal-events-plan.md §3) sit right after the
  // house so a fresh arrival is at the top of Tonight's Patrons, not below
  // the legends. `unlockWins` mirrors the event's `minWins`, for reference
  // only: whether a visitor is in the pub is src/events/seasonalEvents.ts's
  // call (`isVisitorInTown`).
  {
    id: "mr-griffin",
    name: "Mr Griffin, the Unseen",
    tier: "visitor",
    deck: griffinsDeck,
    difficulty: "seasoned",
    rewardCardId: "mr-griffin",
    unlockWins: 3,
    portraitArtId: "portrait-mr-griffin",
    line: "Don't mind me. Nobody ever does.",
    betPool: ["turnip-lantern", "resurrection-man", "the-witching-hour"],
  },
  {
    id: "clockwork-pharaoh",
    name: "The Clockwork Pharaoh",
    tier: "visitor",
    deck: pharaohsDeck,
    difficulty: "seasoned",
    rewardCardId: "clockwork-pharaoh",
    unlockWins: 3,
    portraitArtId: "portrait-clockwork-pharaoh",
    line: "Three thousand years in a glass case. Deal.",
    betPool: ["turnip-lantern", "spirit-photograph", "the-witching-hour"],
  },
  {
    id: "carpathian-count",
    name: "The Carpathian Count",
    tier: "visitor",
    deck: countsDeck,
    difficulty: "seasoned",
    rewardCardId: "the-count",
    unlockWins: 3,
    portraitArtId: "portrait-carpathian-count",
    line: "Such a charming establishment. Do invite me in.",
    betPool: ["grave-robber", "resurrection-man", "the-witching-hour"],
  },
  {
    id: "hampstead-wolf",
    name: "The Hampstead Wolf",
    tier: "visitor",
    deck: wolfsDeck,
    difficulty: "seasoned",
    rewardCardId: "gentleman-of-the-heath",
    unlockWins: 3,
    portraitArtId: "portrait-hampstead-wolf",
    line: "Is it a full moon? I never check.",
    betPool: ["night-constable", "lamplighter-at-dusk", "turnip-lantern"],
  },
  {
    id: "galvanic-creature",
    name: "The Galvanic Creature",
    tier: "visitor",
    deck: creaturesDeck,
    difficulty: "seasoned",
    rewardCardId: "the-creature",
    unlockWins: 3,
    portraitArtId: "portrait-galvanic-creature",
    line: "She made me. She did not make me welcome.",
    betPool: ["galvanic-battery", "turnip-lantern", "the-witching-hour"],
  },
  {
    id: "spring-heeled-jack",
    name: "Spring-Heeled Jack",
    tier: "legend",
    deck: jacksDeck,
    difficulty: "legend",
    rewardCardId: null,
    tournamentOnly: true,
    unlockWins: 0,
    portraitArtId: "portrait-spring-heeled-jack",
    line: "You'll never catch me. Everybody's tried.",
    betPool: ["grave-robber", "resurrection-man", "the-witching-hour"],
  },
  {
    id: "mudd",
    name: "Constable Tobias Mudd",
    tier: "regular",
    deck: muddsDeck,
    difficulty: "regular",
    rewardCardId: "sergeant-pike",
    unlockWins: 0,
    portraitArtId: "portrait-constable-tobias-mudd",
    line: "I'm not on duty. Well. I'm a bit on duty.",
    betPool: ["charlotte", "telegraph-boy", "anonymous-tip"],
  },
  {
    id: "nell-ashby",
    name: "Old Nell Ashby",
    tier: "regular",
    deck: nellsDeck,
    difficulty: "regular",
    rewardCardId: "nells-basket",
    unlockWins: 0,
    portraitArtId: "portrait-old-nell-ashby",
    line: "Violets, guv? Or the other thing?",
    betPool: ["baker-street-irregular", "telegraph-boy", "anonymous-tip"],
  },
  {
    id: "reg-farrow",
    name: '"Dodgy" Reg Farrow',
    tier: "regular",
    deck: regsDeck,
    difficulty: "regular",
    rewardCardId: "regs-ledger",
    unlockWins: 0,
    portraitArtId: "portrait-dodgy-reg-farrow",
    line: "Everything on this table's legitimate. Mostly.",
    betPool: ["cracksman", "fences-runner", "skeleton-key"],
  },
  {
    id: "prudence-hollis",
    name: "Miss Prudence Hollis",
    tier: "regular",
    deck: hollisDeck,
    difficulty: "regular",
    rewardCardId: "miss-hollis-authoress",
    unlockWins: 0,
    portraitArtId: "portrait-miss-prudence-hollis",
    line: "I've already worked out how you did it. Sit down.",
    betPool: ["amateur-sleuth", "seance", "banshee"],
  },
  {
    id: "bucket",
    name: "Inspector Bucket",
    tier: "seasoned",
    deck: bucketsDeck,
    difficulty: "seasoned",
    rewardCardId: "buckets-forefinger",
    unlockWins: 3,
    portraitArtId: "portrait-inspector-bucket",
    line: "I'll just sit here, if I may, and think about you.",
    betPool: ["charlotte", "baker-street-irregular", "anonymous-tip", "hiawatha"],
  },
  {
    id: "lovelace",
    name: "Ada Lovelace",
    tier: "seasoned",
    deck: lovelacesDeck,
    difficulty: "seasoned",
    rewardCardId: "the-analytical-engine",
    unlockWins: 5,
    portraitArtId: "portrait-ada-lovelace",
    line: "Your deck has a loop in it. I can see it from here.",
    betPool: ["foreman-gudgeon", "difference-engine", "sabotage", "the-gasworks"],
  },
  {
    id: "adler",
    name: "Irene Adler",
    tier: "seasoned",
    deck: adlersDeck,
    difficulty: "seasoned",
    rewardCardId: "the-photograph",
    unlockWins: 5,
    portraitArtId: "portrait-irene-adler",
    line: "Good night, Mr Sherlock Holmes.",
    betPool: ["cracksman", "fences-runner", "telegraph-boy", "emily"],
  },
  {
    id: "dickens",
    name: "Charles Dickens",
    tier: "seasoned",
    deck: dickensDeck,
    difficulty: "seasoned",
    rewardCardId: "next-instalment",
    unlockWins: 5,
    portraitArtId: "portrait-charles-dickens",
    line: "You'll have to wait for the ending. Everyone does.",
    betPool: ["amateur-sleuth", "seance", "banshee", "the-hypnofrog"],
  },
  {
    id: "holmes",
    name: "Sherlock Holmes",
    tier: "legend",
    deck: holmesDeck,
    difficulty: "legend",
    rewardCardId: "sherlock-holmes",
    unlockWins: 10,
    portraitArtId: "portrait-sherlock-holmes",
    line: "You've been to the Foundry. It's on your cuff.",
    betPool: ["charlotte", "telegraph-boy", "anonymous-tip", "detective-sergeant-vale"],
  },
  {
    id: "moriarty",
    name: "Professor Moriarty",
    tier: "legend",
    deck: moriartysDeck,
    difficulty: "legend",
    rewardCardId: "professor-moriarty",
    unlockWins: 10,
    portraitArtId: "portrait-professor-moriarty",
    line: "You stand fire admirably.",
    betPool: ["cracksman", "fences-runner", "foreman-gudgeon", "cat-burglar-strikes-again"],
  },
  {
    id: "christie",
    name: "Agatha Christie",
    tier: "legend",
    deck: christiesDeck,
    difficulty: "legend",
    rewardCardId: "dame-agatha",
    unlockWins: 10,
    portraitArtId: "portrait-agatha-christie",
    line: "The obvious suspect is the deck you built.",
    betPool: ["amateur-sleuth", "seance", "banshee", "the-hypnofrog"],
  },
  {
    id: "poirot",
    name: "Hercule Poirot",
    tier: "legend",
    deck: poirotsDeck,
    difficulty: "legend",
    rewardCardId: "hercule-poirot",
    unlockWins: 10,
    portraitArtId: "portrait-hercule-poirot",
    line: "The little grey cells, mon ami, have already finished.",
    betPool: ["charlotte", "amateur-sleuth", "seance", "detective-sergeant-vale"],
  },
  {
    id: "jekyll-hyde",
    name: "Dr Jekyll / Mr Hyde",
    tier: "legend",
    deck: jekyllsDeck,
    difficulty: (state) => (state.round <= 1 ? "seasoned" : "legend"),
    rewardCardId: "dr-jekyll-mr-hyde",
    unlockWins: 10,
    portraitArtId: "portrait-dr-jekyll-mr-hyde",
    line: "I'm quite well. Round two, ask again.",
    betPool: ["banshee", "cracksman", "fences-runner", "emily"],
  },
  {
    id: "shelley",
    name: "Mary Shelley",
    tier: "legend",
    deck: shelleysDeck,
    difficulty: "legend",
    rewardCardId: "mary-shelley",
    unlockWins: 10,
    portraitArtId: "portrait-mary-shelley",
    line: "I wrote him at nineteen. What have you made?",
    betPool: ["foreman-gudgeon", "difference-engine", "sabotage", "the-gasworks"],
  },
];

export const OPPONENTS_BY_ID = new Map<string, Opponent>(OPPONENTS.map((o) => [o.id, o]));

// Legends in town (§12.3): from 10 wins, two Legends are in the pub each
// real-world day, chosen deterministically from the date, with each of the
// six due "at least every third day." Three fixed pairs (design.md §9.3's
// table order, grouped adjacent) cycling with the local calendar day gives
// every legend exactly one day in three — stronger than "at least" every
// third day, and simple to pin in a test. Which legends share a day wasn't
// specified anywhere — a judgment call, in the same vein as 1.6's "which
// 10 portraits."
const LEGEND_PAIRS: readonly (readonly [string, string])[] = [
  ["holmes", "moriarty"],
  ["christie", "poirot"],
  ["jekyll-hyde", "shelley"],
];

export const LEGEND_IDS: readonly string[] = LEGEND_PAIRS.flat();

/** Days since the Unix epoch for `date`'s *local* calendar day (not UTC-shifted). */
export function localDayIndex(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

export function legendsInTown(date: Date): readonly [string, string] {
  return LEGEND_PAIRS[localDayIndex(date) % LEGEND_PAIRS.length]!;
}

export function isOpponentInTown(opponent: Opponent, totalWins: number, date: Date): boolean {
  if (opponent.tournamentOnly) return false;
  if (opponent.tier === "visitor") return isVisitorInTown(opponent.id, totalWins, date);
  if (totalWins < opponent.unlockWins) return false;
  if (opponent.tier !== "legend") return true;
  return legendsInTown(date).includes(opponent.id);
}

/** "Tonight's patrons" (design.md §11.2): all unlocked Regulars/Seasoned, today's two Legends, any arrived seasonal visitors, and Sir Charles (always). */
export function tonightsPatrons(totalWins: number, date: Date): Opponent[] {
  return OPPONENTS.filter((o) => isOpponentInTown(o, totalWins, date));
}

/**
 * The pickup line shown on an opponent's patron row today. Sir Charles
 * rotates through his own line plus any live event's lines, one per local
 * calendar day; an event can also replace another opponent's line outright
 * (Mary Shelley on meeting the Creature).
 */
export function patronLine(opponent: Opponent, date: Date): string {
  const override = eventLineOverride(opponent.id, date);
  if (override) return override;
  if (opponent.id !== SIR_CHARLES.id) return opponent.line;
  const pool = [opponent.line, ...eventSirCharlesLines(date)];
  return pool[localDayIndex(date) % pool.length]!;
}
