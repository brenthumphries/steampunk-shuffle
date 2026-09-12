import "./style.css";
import type { Card, Deck } from "./cards/cardTypes.ts";
import { ALL_CARDS } from "./cards/data/index.ts";
import { starterDeck } from "./cards/data/decks/starterDeck.ts";
import type { Difficulty } from "./ai/aiOpponent.ts";
import type { MatchResult, MatchState } from "./engine/matchEngine.ts";
import { mountMatchScreen, type HintOptions } from "./ui/matchScreen.ts";
import { mountDeckBuilderScreen } from "./ui/deckBuilderScreen.ts";
import { mountPubHubScreen, type PendingReveal } from "./ui/pubHubScreen.ts";
import { mountTournamentsScreen } from "./ui/tournamentsScreen.ts";
import { mountBracketScreen, type BracketOutcome } from "./ui/bracketScreen.ts";
import { mountAcquisitionScreen } from "./ui/acquisitionScreen.ts";
import { mountSaveScreen } from "./ui/saveScreen.ts";
import { mountHouseRulesScreen } from "./ui/houseRulesScreen.ts";
import { mountTutorialRewardScreen } from "./ui/tutorialRewardScreen.ts";
import { computeLegality, slotToDeck } from "./decks/deckSlots.ts";
import { loadDeckSlotsState } from "./decks/deckStorage.ts";
import { OPPONENTS, OPPONENTS_BY_ID, type Opponent } from "./pub/opponents.ts";
import { applyTournamentPayout, deductChecks, grantChecks, loadPubState, recordPickupResult, recordTournamentMatchResult, savePubState, type PubState } from "./pub/pubState.ts";
import { resolveBarBet } from "./pub/barBet.ts";
import { clearActiveMatch, loadActiveMatch, saveActiveMatch, type MatchContext } from "./save/activeMatch.ts";
import type { Tournament } from "./tournaments/tournaments.ts";
import { TOURNAMENTS_BY_ID } from "./tournaments/tournaments.ts";
import { advanceBracket, breakTournamentDraw, createBracket, currentMatchIndex, type BracketRoundIndex, type TournamentBracket } from "./tournaments/bracket.ts";
import { resolvePrize } from "./tournaments/prizes.ts";
import { checkInvitationalTrigger, clearActiveBracket, loadTournamentState, saveTournamentState, startBracket, updateActiveBracket } from "./tournaments/tournamentState.ts";
import { TUTORIAL_BEFORE_DEAL, TUTORIAL_HOUSE_DECK, TUTORIAL_MATCH_END_MAT, TUTORIAL_PLAYER_DECK, TUTORIAL_REWARD_CHECKS, TUTORIAL_ROUND_END_MATS, TUTORIAL_TURNS } from "./tutorial/tutorialScript.ts";
import { HINT_IDS, HINT_TEXT, hasShownHint, isWithinHintWindow, loadTutorialState, markHintShown, markTutorialCompleted, recordMatchPlayed, saveTutorialState, type HintId } from "./tutorial/tutorialState.ts";
import { playSound, unlockAudio } from "./audio/soundEngine.ts";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("#app root element is missing from index.html");
}

const cardsById = new Map<string, Card>(ALL_CARDS.map((c) => [c.id, c]));

// Sound (plan step 3.4). iOS needs audio unlocked by a real user gesture —
// `unlockAudio()` runs synchronously inside the very first tap anywhere in
// the app, whatever screen that tap happens to land on (the tutorial, most
// often, since it's a newcomer's first launch). A separate, persistent
// listener plays a UI click for every button-shaped tap app-wide — every
// screen's buttons and tappable cards already carry a real `<button>` or
// `role="button"` element (see src/ui/matchScreen.ts, src/ui/
// pubHubScreen.ts, etc.), so this one delegated listener covers them all
// without each screen having to call playSound("click") itself. Card-play/
// flip/round-reveal/bracket-advance/reward-unwrap sounds aren't plain
// clicks — those are wired at their specific state-transition points in
// each screen instead (matchScreen.ts, bracketScreen.ts, pubHubScreen.ts,
// acquisitionScreen.ts, tutorialRewardScreen.ts).
document.addEventListener("pointerdown", () => unlockAudio(), { capture: true, once: true });
document.addEventListener(
  "click",
  (event) => {
    if ((event.target as HTMLElement | null)?.closest("button, [role='button']")) playSound("click");
  },
  { capture: true },
);

let selectedDeck: Deck = starterDeck;
let selectedDeckName = "The Village Constable";
let teardownScreen: (() => void) | undefined;

// Picks up whatever legal deck the player last selected in the deck
// builder (plan step 2.2); falls back to the tutorial-locked starter deck
// (design.md §8.3) if nothing legal has been chosen yet.
function refreshSelectedDeck(): void {
  const stored = loadDeckSlotsState();
  if (stored.selectedIndex === null) return;
  const slot = stored.slots[stored.selectedIndex];
  if (!slot) return;
  const legality = computeLegality(slot, cardsById);
  if (!legality.valid) return;
  selectedDeck = slotToDeck(slot, cardsById);
  selectedDeckName = slot.name;
}

/**
 * Re-checks the Birthday Invitational's Oct-30 date trigger (design.md
 * §14.6) against "now" every time a screen that could reveal it is shown,
 * rather than only once at boot — same reasoning as
 * src/pub/opponents.ts's `legendsInTown` recomputing from `new Date()` on
 * every pub-hub render: a session left open across midnight into Oct 30
 * should still pick it up.
 */
function syncTournamentTrigger(): void {
  const state = loadTournamentState();
  const next = checkInvitationalTrigger(state, new Date());
  if (next !== state) saveTournamentState(next);
}

function showPubHub(pendingReveals?: PendingReveal[]): void {
  syncTournamentTrigger();
  teardownScreen?.();
  teardownScreen = undefined;
  app!.replaceChildren();

  const tutorial = loadTutorialState();
  const hint =
    tutorial.matchesPlayed >= 4 && !hasShownHint(tutorial, "hub")
      ? {
          text: HINT_TEXT.hub,
          onShown: () => saveTutorialState(markHintShown(loadTutorialState(), "hub")),
        }
      : undefined;

  teardownScreen = mountPubHubScreen(app!, {
    deckName: selectedDeckName,
    onBuildDeck: startDeckBuilder,
    onStartMatch: startMatch,
    onOpenTournaments: showTournaments,
    onOpenBackRoom: showBackRoom,
    onOpenSaveData: showSaveScreen,
    onOpenHouseRules: showHouseRules,
    pendingReveals,
    hint,
  });
}

function showBackRoom(): void {
  teardownScreen?.();
  teardownScreen = undefined;
  app!.replaceChildren();
  teardownScreen = mountAcquisitionScreen(app!, { onBack: () => showPubHub() });
}

function showSaveScreen(): void {
  teardownScreen?.();
  teardownScreen = undefined;
  app!.replaceChildren();
  teardownScreen = mountSaveScreen(app!, { onBack: () => showPubHub() });
}

function showHouseRules(): void {
  teardownScreen?.();
  teardownScreen = undefined;
  app!.replaceChildren();
  teardownScreen = mountHouseRulesScreen(app!, { onBack: () => showPubHub() });
}

/**
 * design.md §13.3's hint chips, active for the player's 2nd-4th match
 * (`isWithinHintWindow`) and only ones never shown before. Tutorial matches
 * don't get this — `startTutorial` mounts the match screen with `tutorial`
 * instead of `hints`.
 */
function buildHintOptions(): HintOptions | undefined {
  const tutorial = loadTutorialState();
  if (!isWithinHintWindow(tutorial.matchesPlayed)) return undefined;
  const active = new Set<HintId>(HINT_IDS.filter((id) => id !== "hub" && !hasShownHint(tutorial, id)));
  if (active.size === 0) return undefined;
  return {
    active,
    text: HINT_TEXT,
    onShown: (hint) => saveTutorialState(markHintShown(loadTutorialState(), hint)),
  };
}

/**
 * Mounts the match screen and wires it to autosave (plan step 2.6, design.md
 * §12.4: "current match state" persists so killing the app mid-match can
 * resume it) — `context` identifies what to resume into
 * (`tryResumeActiveMatch` below), `resume` optionally replays a saved
 * mid-match state instead of dealing a fresh one, and `onFinish` gets the
 * final result once the active-match save has already been cleared.
 */
function mountMatch(params: {
  humanDeck: Deck;
  humanDeckName: string;
  aiDeck: Deck;
  aiName: string;
  aiPortraitArtId?: string;
  difficulty: Difficulty | ((state: MatchState) => Difficulty);
  context: MatchContext;
  resume?: { state: MatchState; aiSeed: number };
  hints?: HintOptions;
  onFinish: (result: MatchResult) => void;
}): void {
  teardownScreen?.();
  teardownScreen = undefined;
  app!.replaceChildren();
  teardownScreen = mountMatchScreen(app!, {
    humanDeck: params.humanDeck,
    aiDeck: params.aiDeck,
    aiName: params.aiName,
    aiPortraitArtId: params.aiPortraitArtId,
    difficulty: params.difficulty,
    initialState: params.resume,
    hints: params.hints,
    onStateChange: (state, aiSeed) => {
      saveActiveMatch({ matchState: state, aiSeed, humanDeck: params.humanDeck, humanDeckName: params.humanDeckName, context: params.context });
    },
    onExit: (result) => {
      clearActiveMatch();
      params.onFinish(result);
    },
  });
}

function finishPickupMatch(opponent: Opponent, stakedCardId: string | null, result: MatchResult): void {
  saveTutorialState(recordMatchPlayed(loadTutorialState())); // design.md §13.3's "matches 2-4" window

  const outcome = result.winner === "draw" ? "draw" : result.winner === "A" ? "win" : "loss";
  let pub = loadPubState();
  const { next, rewardCardId } = recordPickupResult(pub, opponent.id, opponent.tier, opponent.rewardCardId, outcome, new Date());
  pub = next;

  const reveals: PendingReveal[] = [];
  if (rewardCardId) reveals.push({ title: `First win against ${opponent.name}!`, cardId: rewardCardId });

  if (stakedCardId) {
    const { next: afterBet, wonCardId } = resolveBarBet(pub, stakedCardId, opponent, outcome, Date.now());
    pub = afterBet;
    if (wonCardId) reveals.push({ title: `Won the bet against ${opponent.name}!`, cardId: wonCardId });
  }

  savePubState(pub);
  showPubHub(reveals.length > 0 ? reveals : undefined);
}

function startMatch(opponent: Opponent, stakedCardId: string | null): void {
  mountMatch({
    humanDeck: selectedDeck,
    humanDeckName: selectedDeckName,
    aiDeck: opponent.deck,
    aiName: opponent.name,
    aiPortraitArtId: opponent.portraitArtId,
    difficulty: opponent.difficulty,
    context: { kind: "pickup", opponentId: opponent.id, stakedCardId },
    hints: buildHintOptions(),
    onFinish: (result) => finishPickupMatch(opponent, stakedCardId, result),
  });
}

/** The tutorial's forced-script match (plan step 2.7, design.md §13). */
function startTutorial(): void {
  teardownScreen?.();
  teardownScreen = undefined;
  app!.replaceChildren();
  teardownScreen = mountMatchScreen(app!, {
    humanDeck: TUTORIAL_PLAYER_DECK,
    aiDeck: TUTORIAL_HOUSE_DECK,
    aiName: "Sir Charles",
    difficulty: "regular",
    tutorial: {
      beforeDeal: TUTORIAL_BEFORE_DEAL,
      turns: TUTORIAL_TURNS,
      roundEndMats: TUTORIAL_ROUND_END_MATS,
      matchEndMat: TUTORIAL_MATCH_END_MAT,
    },
    onExit: finishTutorial,
  });
}

/** design.md §13.2's "After": the reward reveal (starter deck + Checks), then the pub hub opens for the first time. */
function finishTutorial(): void {
  savePubState(grantChecks(loadPubState(), TUTORIAL_REWARD_CHECKS));
  saveTutorialState(markTutorialCompleted(loadTutorialState()));

  teardownScreen?.();
  teardownScreen = undefined;
  app!.replaceChildren();
  teardownScreen = mountTutorialRewardScreen(app!, {
    deckName: selectedDeckName,
    onContinue: () => showPubHub(),
  });
}

function startDeckBuilder(): void {
  teardownScreen?.();
  teardownScreen = undefined;
  app!.replaceChildren();
  teardownScreen = mountDeckBuilderScreen(app!, {
    onExit: () => {
      refreshSelectedDeck();
      showPubHub();
    },
    onSelectDeck: (deck, name) => {
      selectedDeck = deck;
      selectedDeckName = name;
    },
  });
}

function showTournaments(): void {
  syncTournamentTrigger();
  const pub = loadPubState();
  const tournamentState = loadTournamentState();
  teardownScreen?.();
  teardownScreen = undefined;
  app!.replaceChildren();
  teardownScreen = mountTournamentsScreen(app!, {
    totalWins: pub.totalWins,
    invitationalTriggered: tournamentState.invitationalTriggered,
    checks: pub.checks,
    deckName: selectedDeckName,
    deck: selectedDeck,
    activeBracketTournamentId: tournamentState.active?.tournamentId ?? null,
    onEnter: (tournament) => enterTournament(tournament),
    onResume: (tournament) => showBracket(tournament, tournamentState.active!),
    onBack: showPubHub,
  });
}

function enterTournament(tournament: Tournament): void {
  const pool = tournament.eligiblePool(OPPONENTS);
  const bracket = createBracket(tournament, pool, Date.now());
  let pub = loadPubState();
  pub = deductChecks(pub, tournament.entryChecks);
  savePubState(pub);
  const tournamentState = startBracket(loadTournamentState(), bracket);
  saveTournamentState(tournamentState);
  showBracket(tournament, bracket);
}

function showBracket(tournament: Tournament, bracket: TournamentBracket, payout?: BracketOutcome["payout"], justAdvancedIndex?: BracketRoundIndex): void {
  teardownScreen?.();
  teardownScreen = undefined;
  app!.replaceChildren();
  teardownScreen = mountBracketScreen(app!, {
    tournament,
    outcome: { bracket, payout },
    opponentsById: OPPONENTS_BY_ID,
    onPlayMatch: (opponent, matchIndex) => startBracketMatch(tournament, bracket, opponent, matchIndex),
    onLeave: showTournaments,
    justAdvancedIndex,
  });
}

function finishTournamentMatch(tournament: Tournament, bracket: TournamentBracket, opponent: Opponent, result: MatchResult): void {
  const outcome = result.winner === "draw" ? breakTournamentDraw(Date.now()) : result.winner === "A" ? "win" : "loss";
  const advancedIndex = currentMatchIndex(bracket); // the match slot this result just resolved, before advanceBracket moves the bracket past it

  let pub: PubState = loadPubState();
  pub = recordTournamentMatchResult(pub, opponent.id, opponent.tier, opponent.rewardCardId, outcome);

  const nextBracket = advanceBracket(bracket, outcome);
  let tournamentState = loadTournamentState();
  let payout: BracketOutcome["payout"];

  if (nextBracket.status === "eliminated") {
    pub = applyTournamentPayout(pub, tournament.consolationChecks, null);
    payout = { checks: tournament.consolationChecks, cardId: null, card: null };
    tournamentState = clearActiveBracket(tournamentState);
  } else if (nextBracket.status === "champion") {
    const prize = resolvePrize(tournament, ALL_CARDS, pub, Date.now());
    pub = applyTournamentPayout(pub, prize.checks, prize.cardId);
    payout = { checks: prize.checks, cardId: prize.cardId, card: prize.cardId ? (cardsById.get(prize.cardId) ?? null) : null };
    tournamentState = clearActiveBracket(tournamentState);
  } else {
    tournamentState = updateActiveBracket(tournamentState, nextBracket);
  }

  savePubState(pub);
  saveTournamentState(tournamentState);
  showBracket(tournament, nextBracket, payout, advancedIndex === -1 ? undefined : advancedIndex);
}

function startBracketMatch(tournament: Tournament, bracket: TournamentBracket, opponent: Opponent, matchIndex: BracketRoundIndex): void {
  void matchIndex; // resolved fresh from the persisted bracket on resume — see tryResumeActiveMatch
  mountMatch({
    humanDeck: selectedDeck,
    humanDeckName: selectedDeckName,
    aiDeck: opponent.deck,
    aiName: opponent.name,
    aiPortraitArtId: opponent.portraitArtId,
    difficulty: opponent.difficulty,
    context: { kind: "tournament", tournamentId: tournament.id },
    onFinish: (result) => finishTournamentMatch(tournament, bracket, opponent, result),
  });
}

/**
 * Resumes a match that was still in progress when the app last closed
 * (design.md §12.4's exit check: "kill the app mid-match → resume"). A
 * pickup match resolves its opponent from the id it saved; a tournament
 * match instead re-derives its opponent and match index from the
 * tournament's own persisted bracket (`currentMatchIndex`) rather than
 * trusting a possibly-stale copy, so if the two ever disagree (a bracket
 * that's since finished, say) this just discards the stale match save and
 * falls through to the pub hub instead of resuming into something wrong.
 */
function tryResumeActiveMatch(): boolean {
  const saved = loadActiveMatch();
  if (!saved) return false;

  if (saved.context.kind === "pickup") {
    const opponent = OPPONENTS_BY_ID.get(saved.context.opponentId);
    if (!opponent) {
      clearActiveMatch();
      return false;
    }
    const stakedCardId = saved.context.stakedCardId;
    mountMatch({
      humanDeck: saved.humanDeck,
      humanDeckName: saved.humanDeckName,
      aiDeck: opponent.deck,
      aiName: opponent.name,
      aiPortraitArtId: opponent.portraitArtId,
      difficulty: opponent.difficulty,
      context: saved.context,
      resume: { state: saved.matchState, aiSeed: saved.aiSeed },
      hints: buildHintOptions(),
      onFinish: (result) => finishPickupMatch(opponent, stakedCardId, result),
    });
    return true;
  }

  const tournament = TOURNAMENTS_BY_ID.get(saved.context.tournamentId);
  const bracket = loadTournamentState().active;
  if (!tournament || !bracket || bracket.tournamentId !== tournament.id) {
    clearActiveMatch();
    return false;
  }
  const idx = currentMatchIndex(bracket);
  const opponentId = idx === -1 ? undefined : bracket.playerMatches[idx]?.opponentId;
  const opponent = opponentId ? OPPONENTS_BY_ID.get(opponentId) : undefined;
  if (!opponent) {
    clearActiveMatch();
    return false;
  }
  mountMatch({
    humanDeck: saved.humanDeck,
    humanDeckName: saved.humanDeckName,
    aiDeck: opponent.deck,
    aiName: opponent.name,
    aiPortraitArtId: opponent.portraitArtId,
    difficulty: opponent.difficulty,
    context: saved.context,
    resume: { state: saved.matchState, aiSeed: saved.aiSeed },
    onFinish: (result) => finishTournamentMatch(tournament, bracket, opponent, result),
  });
  return true;
}

refreshSelectedDeck();
if (!loadTutorialState().completed) {
  // A newcomer's very first launch (design.md §13): the tutorial itself
  // isn't resumable mid-match (see startTutorial) — if the app was killed
  // partway through, it just deals a fresh one, which is fine since it's
  // the same deterministic script either way.
  startTutorial();
} else if (!tryResumeActiveMatch()) {
  showPubHub();
}
