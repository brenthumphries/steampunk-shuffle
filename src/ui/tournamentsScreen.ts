// The tournament list (plan step 2.4, design.md §10): the four named
// tournaments, whether each is unlocked, whether the current deck meets
// its entry rule, and the entry point into a bracket. Same DOM-glue/
// full-rebuild pattern as the other screens (src/ui/pubHubScreen.ts etc).

import type { Deck } from "../cards/cardTypes.ts";
import { today } from "../events/eventClock.ts";
import { ACQUIRABLE_CARDS_BY_ID } from "../pub/acquirableCards.ts";
import { resolveHouseLocation } from "../tournaments/houseLocation.ts";
import type { PrizeCard, Tournament, TournamentId } from "../tournaments/tournaments.ts";
import { isTournamentListed, TOURNAMENTS } from "../tournaments/tournaments.ts";

export interface TournamentsScreenOptions {
  totalWins: number;
  invitationalTriggered: boolean;
  checks: number;
  deckName: string;
  deck: Deck;
  /** The tournament with a bracket already in progress, if any (design.md §10: "can be left mid-way and resumed"). */
  activeBracketTournamentId: TournamentId | null;
  onEnter: (tournament: Tournament) => void;
  onResume: (tournament: Tournament) => void;
  onBack: () => void;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function prizeCardLabel(prizeCard: PrizeCard): string {
  if (prizeCard.kind === "randomRarity") return `a random ${prizeCard.rarity}`;
  return ACQUIRABLE_CARDS_BY_ID.get(prizeCard.cardId)?.faces[0].name ?? "a prize card";
}

/** Mounts the tournament list into `root` and returns a teardown function. */
export function mountTournamentsScreen(root: HTMLElement, options: TournamentsScreenOptions): () => void {
  function buildRow(tournament: Tournament): HTMLElement {
    const unlocked = tournament.isUnlocked(options.totalWins, options.invitationalTriggered, today());
    const isResumable = options.activeBracketTournamentId === tournament.id;
    const entryCheck = tournament.checkEntryDeck(options.deck);
    const canAffordEntry = options.checks >= tournament.entryChecks;

    const row = el("div", "tournament-row");
    row.appendChild(el("h3", "tournament-name", tournament.name));
    row.appendChild(el("p", "tournament-meta", `${tournament.whenLabel} · ${tournament.fieldLabel}`));
    row.appendChild(el("p", "tournament-meta", `Entry: ${tournament.entryRuleLabel}${tournament.entryChecks > 0 ? ` · ${tournament.entryChecks} Checks` : " · free"}`));
    row.appendChild(el("p", "tournament-prize", `Win: ${tournament.prizeChecks} Checks + ${prizeCardLabel(tournament.prizeCard)} · Consolation: ${tournament.consolationChecks} Checks`));
    const houseLocation = resolveHouseLocation(tournament);
    if (houseLocation) {
      row.appendChild(el("p", "tournament-meta", `House rule: ${houseLocation.faces[0].name} is in play at the start of every match.`));
    }

    // A bracket already in progress can be finished even after its window
    // closes, so "Resume" is checked before "Locked".
    if (isResumable) {
      const btn = el("button", "action-button", "Resume");
      btn.type = "button";
      btn.addEventListener("click", () => options.onResume(tournament));
      row.appendChild(btn);
      return row;
    }

    if (!unlocked) {
      row.appendChild(el("p", "tournament-locked", "Locked"));
      const btn = el("button", "action-button action-button--secondary", "Locked");
      btn.type = "button";
      btn.disabled = true;
      row.appendChild(btn);
      return row;
    }

    if (!entryCheck.valid) {
      row.appendChild(el("p", "tournament-blocked", entryCheck.reason ?? "Your current deck doesn't meet this tournament's entry rule."));
    } else if (!canAffordEntry) {
      row.appendChild(el("p", "tournament-blocked", `Need ${tournament.entryChecks} Checks to enter — you have ${options.checks}.`));
    }

    const btn = el("button", "action-button", tournament.entryChecks > 0 ? `Enter (${tournament.entryChecks} Checks)` : "Enter");
    btn.type = "button";
    btn.disabled = !entryCheck.valid || !canAffordEntry;
    btn.addEventListener("click", () => options.onEnter(tournament));
    row.appendChild(btn);
    return row;
  }

  function render(): void {
    root.replaceChildren();
    const screen = el("div", "tournaments-screen");

    const header = el("div", "tournaments-header");
    const backBtn = el("button", "taproom-button taproom-button--secondary", "Back to the bar");
    backBtn.type = "button";
    backBtn.addEventListener("click", options.onBack);
    header.appendChild(backBtn);
    header.appendChild(el("h1", "tournaments-title", "The Chalkboard"));
    screen.appendChild(header);

    // PT-18: nothing on this screen said what a tournament actually is.
    screen.appendChild(el("p", "tournaments-deck-line", "Three matches, single elimination, seven opponents drawn from the pool."));
    screen.appendChild(el("p", "tournaments-deck-line", `Entering with: ${options.deckName}`));

    const list = el("div", "tournament-list");
    for (const tournament of TOURNAMENTS) {
      // PT-5: the Birthday Invitational (name, date, prize) is meant to be a
      // surprise (design.md §14.6) — invisible entirely until its date
      // trigger fires, not just shown "Locked" with every detail printed.
      // A seasonal tournament is likewise only listed while its event is on
      // (or while a bracket of it is still in progress).
      if (!isTournamentListed(tournament, options.invitationalTriggered, today(), options.activeBracketTournamentId === tournament.id)) continue;
      list.appendChild(buildRow(tournament));
    }
    screen.appendChild(list);

    root.appendChild(screen);
  }

  render();

  return () => {
    root.replaceChildren();
  };
}
