// The tournament bracket screen (plan step 2.4, design.md §10): a
// three-stage ladder (Quarterfinal/Semifinal/Final) — the whole mechanical
// bracket, since the non-player half is already resolved the instant the
// bracket is created (src/tournaments/bracket.ts) and never changes. Same
// DOM-glue/full-rebuild pattern as the other screens.

import type { Card } from "../cards/cardTypes.ts";
import { abilityLines, keywordChips } from "./cardText.ts";
import { currentMatchIndex, ROUND_NAMES, type BracketRoundIndex, type TournamentBracket } from "../tournaments/bracket.ts";
import type { Tournament } from "../tournaments/tournaments.ts";
import type { Opponent } from "../pub/opponents.ts";
import { playSound } from "../audio/soundEngine.ts";
import { INVITATIONAL_TOAST_SEQUENCE } from "../tournaments/toast.ts";

export interface BracketOutcome {
  bracket: TournamentBracket;
  /** Non-null exactly when this render should show the champion/eliminated payout overlay. */
  payout?: { checks: number; cardId: string | null; card: Card | null };
}

export interface BracketScreenOptions {
  tournament: Tournament;
  outcome: BracketOutcome;
  opponentsById: ReadonlyMap<string, Opponent>;
  onPlayMatch: (opponent: Opponent, matchIndex: BracketRoundIndex) => void;
  onLeave: () => void;
  /**
   * The match index that was just resolved to produce `outcome.bracket`
   * (plan step 3.3's "tournament bracket advance") — set only right after
   * a bracket match, never on a fresh entry or a plain resume, so the
   * ladder only animates the stage that actually just changed.
   */
  justAdvancedIndex?: BracketRoundIndex;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function artUrl(assetId: string): string {
  return `${import.meta.env.BASE_URL}art/${assetId}.webp`;
}

/** Mounts the bracket screen into `root` and returns a teardown function. */
export function mountBracketScreen(root: HTMLElement, options: BracketScreenOptions): () => void {
  const { tournament, outcome, opponentsById } = options;
  const bracket = outcome.bracket;
  const activeIndex = currentMatchIndex(bracket);
  // design.md §14.4's toast, shown once the Birthday Invitational ends
  // (win or lose) and before its normal champion/eliminated payout overlay.
  let toastStep = 0;
  function showingToast(): boolean {
    return tournament.id === "birthday-invitational" && !!outcome.payout && toastStep < INVITATIONAL_TOAST_SEQUENCE.length;
  }

  function buildStageRow(index: BracketRoundIndex): HTMLElement {
    const slot = bracket.playerMatches[index];
    const opponent = opponentsById.get(slot.opponentId);
    const row = el("div", "bracket-stage");
    if (index === activeIndex) row.classList.add("bracket-stage--active");
    if (index === options.justAdvancedIndex) row.classList.add("bracket-stage--advanced");
    if (index === activeIndex && options.justAdvancedIndex !== undefined && index === options.justAdvancedIndex + 1) {
      row.classList.add("bracket-stage--just-active");
    }

    row.appendChild(el("span", "bracket-stage-name", ROUND_NAMES[index]));

    const vs = el("div", "bracket-stage-vs");
    if (opponent?.portraitArtId) {
      const img = document.createElement("img");
      img.src = artUrl(opponent.portraitArtId);
      img.alt = "";
      img.className = "bracket-opponent-portrait";
      vs.appendChild(img);
    } else {
      vs.appendChild(el("div", "bracket-opponent-portrait bracket-opponent-portrait--placeholder"));
    }
    vs.appendChild(el("span", "bracket-opponent-name", opponent?.name ?? slot.opponentId));
    row.appendChild(vs);

    if (slot.outcome === "won") {
      row.appendChild(el("span", "bracket-stage-badge bracket-stage-badge--won", "Won"));
    } else if (slot.outcome === "lost") {
      row.appendChild(el("span", "bracket-stage-badge bracket-stage-badge--lost", "Lost"));
    } else if (index === activeIndex && opponent) {
      const btn = el("button", "action-button", "Play");
      btn.type = "button";
      btn.setAttribute("aria-label", `Play ${ROUND_NAMES[index]} against ${opponent.name}`);
      btn.addEventListener("click", () => options.onPlayMatch(opponent, index));
      row.appendChild(btn);
    } else {
      row.appendChild(el("span", "bracket-stage-badge", "Not yet reached"));
    }

    return row;
  }

  function buildToastOverlay(): HTMLElement {
    const { speaker, line } = INVITATIONAL_TOAST_SEQUENCE[toastStep]!;
    const overlay = el("div", "overlay overlay--reveal");
    const box = el("div", "overlay-box toast-box");
    box.appendChild(el("p", "toast-line", speaker ? `"${line}"` : line));
    if (speaker) box.appendChild(el("p", "dedication-sign", `— ${speaker}`));

    const isLast = toastStep === INVITATIONAL_TOAST_SEQUENCE.length - 1;
    const btn = el("button", "action-button", isLast ? "Continue" : "Raise a glass");
    btn.type = "button";
    btn.addEventListener("click", () => {
      toastStep++;
      render();
    });
    box.appendChild(btn);

    overlay.appendChild(box);
    return overlay;
  }

  function buildPayoutOverlay(): HTMLElement {
    const won = bracket.status === "champion";
    const overlay = el("div", "overlay overlay--reveal");
    const box = el("div", "overlay-box reveal-box");
    box.appendChild(el("h2", "overlay-title", won ? `Champion: ${tournament.name}!` : `Out of ${tournament.name}`));
    box.appendChild(el("p", "overlay-score", won ? `You won ${outcome.payout!.checks} Checks.` : `Consolation: ${outcome.payout!.checks} Checks.`));

    const card = outcome.payout?.card;
    if (card) {
      const face = card.faces[0];
      const cardEl = el("div", "card card--zoom reveal-card");
      cardEl.dataset.family = face.family;
      cardEl.dataset.rarity = card.rarity;
      cardEl.style.setProperty("--illustration", `url(${artUrl(face.artId)})`);
      cardEl.appendChild(el("span", "card-points", String(face.points)));
      cardEl.appendChild(el("span", "card-name", face.name));
      const chips = keywordChips(face);
      if (chips.length > 0) {
        const chipRow = el("div", "card-chip-row");
        for (const chip of chips) chipRow.appendChild(el("span", "card-chip", chip));
        cardEl.appendChild(chipRow);
      }
      for (const line of abilityLines(face)) cardEl.appendChild(el("p", "card-ability", line));
      if (face.flavor) cardEl.appendChild(el("p", "card-flavor", `"${face.flavor}"`));
      box.appendChild(cardEl);
      box.appendChild(el("p", "overlay-score", "Added to your collection."));
    }

    const btn = el("button", "action-button", "Back to the chalkboard");
    btn.type = "button";
    btn.addEventListener("click", options.onLeave);
    box.appendChild(btn);

    overlay.appendChild(box);
    return overlay;
  }

  function render(): void {
    root.replaceChildren();
    const screen = el("div", "bracket-screen");

    const header = el("div", "tournaments-header");
    const backBtn = el("button", "taproom-button taproom-button--secondary", "Back to the chalkboard");
    backBtn.type = "button";
    backBtn.addEventListener("click", options.onLeave);
    header.appendChild(backBtn);
    header.appendChild(el("h1", "tournaments-title", tournament.name));
    screen.appendChild(header);

    const ladder = el("div", "bracket-ladder");
    ladder.appendChild(buildStageRow(0));
    ladder.appendChild(buildStageRow(1));
    ladder.appendChild(buildStageRow(2));
    screen.appendChild(ladder);

    root.appendChild(screen);
    if (showingToast()) {
      root.appendChild(buildToastOverlay());
    } else if (outcome.payout) {
      root.appendChild(buildPayoutOverlay());
    }
  }

  render();
  // Same "just advanced" flag 3.3 uses to animate the ladder row — set only
  // right after a bracket match, never on a fresh entry or a plain resume.
  if (options.justAdvancedIndex !== undefined) playSound("brassHit");

  return () => {
    root.replaceChildren();
  };
}
