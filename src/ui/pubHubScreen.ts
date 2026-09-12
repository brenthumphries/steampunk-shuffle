// The pub hub (plan step 2.3, design.md §11.2): "tonight's patrons," the
// entry point into a pickup game, and the card-reward "unwrap" reveal.
// Same DOM-glue/full-rebuild pattern as the match screen and deck builder
// (src/ui/matchScreen.ts, src/ui/deckBuilderScreen.ts) — small trees, cheap
// to redo. Reads pub state (Checks, win/loss records) fresh on every mount;
// the caller (src/main.ts) is the one that applies a match result via
// src/pub/pubState.ts before remounting this screen.

import { abilityLines, keywordChips } from "./cardText.ts";
import { tonightsPatrons, type Opponent, type OpponentTier } from "../pub/opponents.ts";
import { loadPubState } from "../pub/pubState.ts";
import { titleForWins } from "../pub/progression.ts";
import { ACQUIRABLE_CARDS_BY_ID } from "../pub/acquirableCards.ts";
import { canOfferBarBet, stakeableCards } from "../pub/barBet.ts";
import { buildBeerMat } from "./beerMat.ts";
import { buildMuteToggle } from "./muteToggle.ts";
import { playSound } from "../audio/soundEngine.ts";

/** A card to show the "unwrap" overlay for — a first-win reward (§11.2) or a Bar Bet win (§11.5). Several can queue up from the same match. */
export interface PendingReveal {
  title: string;
  cardId: string;
}

export interface PubHubOptions {
  deckName: string;
  /** design.md §14.2: "Sara", pre-filled and editable. */
  playerName: string;
  onRenamePlayer: (name: string) => void;
  onBuildDeck: () => void;
  /** `stakedCardId` is non-null when the player chose to stake it in a Bar Bet (design.md §11.5) before this match. */
  onStartMatch: (opponent: Opponent, stakedCardId: string | null) => void;
  onOpenTournaments: () => void;
  onOpenBackRoom: () => void;
  onOpenSaveData: () => void;
  onOpenHouseRules: () => void;
  pendingReveals?: PendingReveal[];
  /** design.md §13.3's hub hint ("You've enough Checks for the Pawnbroker…"), shown once. */
  hint?: { text: string; onShown: () => void };
}

const CARDS_BY_ID = ACQUIRABLE_CARDS_BY_ID;

const TIER_LABEL: Record<OpponentTier, string> = {
  house: "The house",
  regular: "Regular",
  seasoned: "Seasoned",
  legend: "Legend",
};

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function artUrl(assetId: string): string {
  return `${import.meta.env.BASE_URL}art/${assetId}.webp`;
}

function joinWithOr(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} or ${names[names.length - 1]}`;
}

/** PT-15: a hub-navigation button that names both what it's called at the bar and what it actually does. */
function buildActionTile(title: string, subtitle: string, onClick: () => void): HTMLElement {
  const btn = el("button", "hub-action-tile");
  btn.type = "button";
  btn.appendChild(el("span", "hub-action-title", title));
  btn.appendChild(el("span", "hub-action-subtitle", subtitle));
  btn.addEventListener("click", onClick);
  return btn;
}

/** Mounts the pub hub into `root` and returns a teardown function. */
export function mountPubHubScreen(root: HTMLElement, options: PubHubOptions): () => void {
  const pub = loadPubState();
  let revealQueue: PendingReveal[] = [...(options.pendingReveals ?? [])];
  let stakePrompt: Opponent | undefined;
  let hintDismissed = false;
  let torn = false;

  function dismissHint(): void {
    hintDismissed = true;
    options.hint?.onShown();
    render();
  }

  function dismissReveal(): void {
    revealQueue = revealQueue.slice(1);
    if (revealQueue[0]) playSound("brassHit");
    render();
  }

  /**
   * PT-21: tapping a patron always starts the match directly now — Bar Bet
   * no longer interposes on every tap once the player owns anything
   * stakeable. It's an opt-in "Bar bet" chip on the row instead (see
   * `openBarBet` below).
   */
  function handlePatronTap(opponent: Opponent): void {
    options.onStartMatch(opponent, null);
  }

  function openBarBet(opponent: Opponent, event: Event): void {
    event.stopPropagation();
    stakePrompt = opponent;
    render();
  }

  function buildPatronRow(opponent: Opponent): HTMLElement {
    const record = pub.opponents[opponent.id];
    const row = el("div", "patron-row");
    row.tabIndex = 0;
    row.setAttribute("role", "button");
    row.setAttribute("aria-label", `Play ${opponent.name}`);

    if (opponent.portraitArtId) {
      const img = document.createElement("img");
      img.src = artUrl(opponent.portraitArtId);
      img.alt = "";
      img.className = "patron-portrait";
      row.appendChild(img);
    } else {
      row.appendChild(el("div", "patron-portrait patron-portrait--placeholder"));
    }

    const info = el("div", "patron-info");
    info.appendChild(el("span", "patron-name", opponent.name));
    info.appendChild(el("span", "patron-line", `"${opponent.line}"`));

    const meta = el("div", "patron-meta");
    meta.appendChild(el("span", `patron-tier patron-tier--${opponent.tier}`, TIER_LABEL[opponent.tier]));
    if (record && (record.wins > 0 || record.losses > 0)) {
      meta.appendChild(el("span", "patron-record", `${record.wins}–${record.losses}`));
    }
    if (opponent.rewardCardId) {
      const claimed = record?.rewardClaimed ?? false;
      if (claimed) {
        meta.appendChild(el("span", "patron-reward patron-reward--claimed", "Reward claimed"));
      } else {
        const rewardName = CARDS_BY_ID.get(opponent.rewardCardId)?.faces[0].name ?? opponent.rewardCardId;
        meta.appendChild(el("span", "patron-reward", `First win: ${rewardName}`));
      }
    }
    info.appendChild(meta);
    row.appendChild(info);

    // PT-21: an opt-in chip, not an automatic prompt on every tap.
    if (canOfferBarBet(opponent, pub.totalWins) && stakeableCards(pub.collection).length > 0) {
      const barBetBtn = el("button", "patron-barbet-chip", "Bar bet");
      barBetBtn.type = "button";
      barBetBtn.setAttribute("aria-label", `Stake a card in a bar bet against ${opponent.name}`);
      barBetBtn.addEventListener("click", (event) => openBarBet(opponent, event));
      row.appendChild(barBetBtn);
    }

    row.addEventListener("click", () => handlePatronTap(opponent));
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handlePatronTap(opponent);
      }
    });
    return row;
  }

  function buildStakeOverlay(opponent: Opponent): HTMLElement {
    const overlay = el("div", "overlay overlay--reveal");
    const box = el("div", "overlay-box reveal-box");
    box.appendChild(el("h2", "overlay-title", `Stake a card against ${opponent.name}?`));
    // PT-21: name what's actually on offer, instead of "one of theirs."
    const betNames = opponent.betPool.map((id) => CARDS_BY_ID.get(id)?.faces[0].name ?? id);
    box.appendChild(el("p", "overlay-score", `Win it, and you'll take one of theirs — ${joinWithOr(betNames)}. Lose, and yours goes to the Pawnbroker's window.`));

    const list = el("div", "stake-card-list");
    for (const cardId of stakeableCards(pub.collection)) {
      const name = CARDS_BY_ID.get(cardId)?.faces[0].name ?? cardId;
      const btn = el("button", "action-button action-button--secondary", `Stake ${name}`);
      btn.type = "button";
      btn.addEventListener("click", () => options.onStartMatch(opponent, cardId));
      list.appendChild(btn);
    }
    box.appendChild(list);

    const skipBtn = el("button", "action-button", "Play without staking");
    skipBtn.type = "button";
    skipBtn.addEventListener("click", () => options.onStartMatch(opponent, null));
    box.appendChild(skipBtn);

    const cancelBtn = el("button", "action-button action-button--secondary", "Never mind");
    cancelBtn.type = "button";
    cancelBtn.addEventListener("click", () => {
      stakePrompt = undefined;
      render();
    });
    box.appendChild(cancelBtn);

    overlay.appendChild(box);
    return overlay;
  }

  function buildRevealOverlay(pending: PendingReveal): HTMLElement {
    const card = CARDS_BY_ID.get(pending.cardId);
    const face = card?.faces[0];
    const overlay = el("div", "overlay overlay--reveal");
    const box = el("div", "overlay-box reveal-box");
    box.appendChild(el("h2", "overlay-title", pending.title));

    const cardEl = el("div", "card card--zoom reveal-card");
    if (face) {
      cardEl.dataset.family = face.family;
      cardEl.dataset.rarity = card!.rarity;
      cardEl.style.setProperty("--illustration", `url(${artUrl(face.artId)})`);
      cardEl.appendChild(el("span", "card-points", String(face.points)));
      cardEl.appendChild(el("span", "card-name", face.name));
      const chips = keywordChips(face);
      if (chips.length > 0) {
        const row = el("div", "card-chip-row");
        for (const chip of chips) row.appendChild(el("span", "card-chip", chip));
        cardEl.appendChild(row);
      }
      for (const line of abilityLines(face)) cardEl.appendChild(el("p", "card-ability", line));
      if (face.flavor) cardEl.appendChild(el("p", "card-flavor", `"${face.flavor}"`));
    } else {
      cardEl.appendChild(el("span", "card-name", pending.cardId));
    }
    box.appendChild(cardEl);
    box.appendChild(el("p", "overlay-score", "Added to your collection."));

    const btn = el("button", "action-button", "Collect");
    btn.type = "button";
    btn.addEventListener("click", dismissReveal);
    box.appendChild(btn);

    overlay.appendChild(box);
    return overlay;
  }

  function render(): void {
    if (torn) return;
    root.replaceChildren();

    const screen = el("div", "pub-hub");
    screen.style.setProperty("--scene-bg", `url(${artUrl("background-the-taproom")})`);

    const header = el("div", "pub-hub-header");
    const titleWrap = el("div", "pub-hub-title-wrap");
    titleWrap.appendChild(el("h1", "pub-hub-title", "The Wheatstone Bridge"));

    const nameInput = el("input", "player-name-input") as HTMLInputElement;
    nameInput.type = "text";
    nameInput.value = options.playerName;
    nameInput.maxLength = 24;
    nameInput.setAttribute("aria-label", "Your name");
    nameInput.addEventListener("input", () => {
      // Mutate in place rather than calling render(), same reasoning as
      // deckBuilderScreen.ts's deck-name input — don't lose focus/cursor
      // position mid-edit.
      options.onRenamePlayer(nameInput.value);
    });
    titleWrap.appendChild(nameInput);
    titleWrap.appendChild(el("span", "pub-hub-subtitle", titleForWins(pub.totalWins)));
    header.appendChild(titleWrap);
    const headerActions = el("div", "pub-hub-header-actions");
    const checksBadge = el("div", "checks-badge");
    checksBadge.appendChild(el("span", "checks-badge-value", String(pub.checks)));
    checksBadge.appendChild(el("span", "checks-badge-label", "Checks"));
    headerActions.appendChild(checksBadge);
    headerActions.appendChild(buildMuteToggle());
    header.appendChild(headerActions);
    screen.appendChild(header);

    // PT-15: what to do next (play someone) comes before the pub-slang
    // button row, not buried under five of them.
    screen.appendChild(el("h2", "patron-section-title", "Tonight's patrons"));
    const list = el("div", "patron-list");
    for (const opponent of tonightsPatrons(pub.totalWins, new Date())) {
      list.appendChild(buildPatronRow(opponent));
    }
    screen.appendChild(list);

    const deckRow = el("div", "pub-hub-deck-row");
    deckRow.appendChild(el("span", "taproom-deck", `Deck: ${options.deckName}`));
    const deckBtn = el("button", "taproom-button taproom-button--secondary", "Build a deck");
    deckBtn.type = "button";
    deckBtn.addEventListener("click", options.onBuildDeck);
    deckRow.appendChild(deckBtn);
    screen.appendChild(deckRow);

    // PT-15: each button now names what it actually does, since "the
    // chalkboard" and "the back room" mean nothing to a newcomer yet.
    const actionTiles = el("div", "pub-hub-actions");
    actionTiles.appendChild(buildActionTile("The chalkboard", "Tournaments", options.onOpenTournaments));
    actionTiles.appendChild(buildActionTile("The back room", "Lost & Found, Pawnbroker, Tinker's Bench", options.onOpenBackRoom));
    screen.appendChild(actionTiles);

    // PT-15: House Rules stays a real button; "Save & data" sinks to a
    // smaller, lower-priority link beside it rather than its own row.
    const secondaryRow = el("div", "pub-hub-secondary-row");
    const houseRulesBtn = el("button", "taproom-button taproom-button--secondary", "House Rules");
    houseRulesBtn.type = "button";
    houseRulesBtn.addEventListener("click", options.onOpenHouseRules);
    secondaryRow.appendChild(houseRulesBtn);
    const saveDataBtn = el("button", "taproom-button taproom-button--tertiary", "Save & data");
    saveDataBtn.type = "button";
    saveDataBtn.addEventListener("click", options.onOpenSaveData);
    secondaryRow.appendChild(saveDataBtn);
    screen.appendChild(secondaryRow);

    root.appendChild(screen);
    if (revealQueue[0]) root.appendChild(buildRevealOverlay(revealQueue[0]));
    else if (stakePrompt) root.appendChild(buildStakeOverlay(stakePrompt));
    if (options.hint && !hintDismissed) root.appendChild(buildBeerMat(options.hint.text, dismissHint));
  }

  render();
  if (revealQueue[0]) playSound("brassHit");

  return () => {
    torn = true;
    root.replaceChildren();
  };
}
