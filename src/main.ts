import "./style.css";
import type { Card, Deck } from "./cards/cardTypes.ts";
import { ALL_CARDS } from "./cards/data/index.ts";
import { starterDeck } from "./cards/data/decks/starterDeck.ts";
import { mountMatchScreen } from "./ui/matchScreen.ts";
import { mountDeckBuilderScreen } from "./ui/deckBuilderScreen.ts";
import { mountPubHubScreen, type PendingReveal } from "./ui/pubHubScreen.ts";
import { mountTournamentsScreen } from "./ui/tournamentsScreen.ts";
import { mountBracketScreen, type BracketOutcome } from "./ui/bracketScreen.ts";
import { computeLegality, slotToDeck } from "./decks/deckSlots.ts";
import { loadDeckSlotsState } from "./decks/deckStorage.ts";
import { OPPONENTS, OPPONENTS_BY_ID, type Opponent } from "./pub/opponents.ts";
import { applyTournamentPayout, deductChecks, loadPubState, recordPickupResult, recordTournamentMatchResult, savePubState, type PubState } from "./pub/pubState.ts";
import type { Tournament } from "./tournaments/tournaments.ts";
import { advanceBracket, breakTournamentDraw, createBracket, type BracketRoundIndex, type TournamentBracket } from "./tournaments/bracket.ts";
import { resolvePrize } from "./tournaments/prizes.ts";
import { checkInvitationalTrigger, clearActiveBracket, loadTournamentState, saveTournamentState, startBracket, updateActiveBracket } from "./tournaments/tournamentState.ts";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("#app root element is missing from index.html");
}

const cardsById = new Map<string, Card>(ALL_CARDS.map((c) => [c.id, c]));

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

function showPubHub(pendingReveal?: PendingReveal): void {
  syncTournamentTrigger();
  teardownScreen?.();
  teardownScreen = undefined;
  app!.replaceChildren();
  teardownScreen = mountPubHubScreen(app!, {
    deckName: selectedDeckName,
    onBuildDeck: startDeckBuilder,
    onStartMatch: startMatch,
    onOpenTournaments: showTournaments,
    pendingReveal,
  });
}

function startMatch(opponent: Opponent): void {
  teardownScreen?.();
  teardownScreen = undefined;
  app!.replaceChildren();
  teardownScreen = mountMatchScreen(app!, {
    humanDeck: selectedDeck,
    aiDeck: opponent.deck,
    aiName: opponent.name,
    aiPortraitArtId: opponent.portraitArtId,
    difficulty: opponent.difficulty,
    onExit: (result) => {
      const outcome = result.winner === "draw" ? "draw" : result.winner === "A" ? "win" : "loss";
      const pub = loadPubState();
      const { next, rewardCardId } = recordPickupResult(pub, opponent.id, opponent.tier, opponent.rewardCardId, outcome, new Date());
      savePubState(next);
      showPubHub(rewardCardId ? { opponent, cardId: rewardCardId } : undefined);
    },
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

function showBracket(tournament: Tournament, bracket: TournamentBracket, payout?: BracketOutcome["payout"]): void {
  teardownScreen?.();
  teardownScreen = undefined;
  app!.replaceChildren();
  teardownScreen = mountBracketScreen(app!, {
    tournament,
    outcome: { bracket, payout },
    opponentsById: OPPONENTS_BY_ID,
    onPlayMatch: (opponent, matchIndex) => startBracketMatch(tournament, bracket, opponent, matchIndex),
    onLeave: showTournaments,
  });
}

function startBracketMatch(tournament: Tournament, bracket: TournamentBracket, opponent: Opponent, matchIndex: BracketRoundIndex): void {
  teardownScreen?.();
  teardownScreen = undefined;
  app!.replaceChildren();
  teardownScreen = mountMatchScreen(app!, {
    humanDeck: selectedDeck,
    aiDeck: opponent.deck,
    aiName: opponent.name,
    aiPortraitArtId: opponent.portraitArtId,
    difficulty: opponent.difficulty,
    onExit: (result) => {
      const outcome = result.winner === "draw" ? breakTournamentDraw(Date.now()) : result.winner === "A" ? "win" : "loss";

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
      showBracket(tournament, nextBracket, payout);
    },
  });
}

refreshSelectedDeck();
showPubHub();
