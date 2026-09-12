// The pub hub (plan step 2.3, design.md §11.2): "tonight's patrons," the
// entry point into a pickup game, and the card-reward "unwrap" reveal.
// Same DOM-glue/full-rebuild pattern as the match screen and deck builder
// (src/ui/matchScreen.ts, src/ui/deckBuilderScreen.ts) — small trees, cheap
// to redo. Reads pub state (Checks, win/loss records) fresh on every mount;
// the caller (src/main.ts) is the one that applies a match result via
// src/pub/pubState.ts before remounting this screen.

import type { Card } from "../cards/cardTypes.ts";
import { ALL_CARDS } from "../cards/data/index.ts";
import { abilityLines, keywordChips } from "./cardText.ts";
import { tonightsPatrons, type Opponent, type OpponentTier } from "../pub/opponents.ts";
import { loadPubState } from "../pub/pubState.ts";

export interface PendingReveal {
  opponent: Opponent;
  cardId: string;
}

export interface PubHubOptions {
  deckName: string;
  onBuildDeck: () => void;
  onStartMatch: (opponent: Opponent) => void;
  onOpenTournaments: () => void;
  /** A reward card to show the "unwrap" overlay for, right when the hub opens (e.g. just won a first match). */
  pendingReveal?: PendingReveal;
}

const CARDS_BY_ID = new Map<string, Card>(ALL_CARDS.map((c) => [c.id, c]));

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

/** Mounts the pub hub into `root` and returns a teardown function. */
export function mountPubHubScreen(root: HTMLElement, options: PubHubOptions): () => void {
  const pub = loadPubState();
  let reveal: PendingReveal | undefined = options.pendingReveal;
  let torn = false;

  function dismissReveal(): void {
    reveal = undefined;
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

    row.addEventListener("click", () => options.onStartMatch(opponent));
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        options.onStartMatch(opponent);
      }
    });
    return row;
  }

  function buildRevealOverlay(pending: PendingReveal): HTMLElement {
    const card = CARDS_BY_ID.get(pending.cardId);
    const face = card?.faces[0];
    const overlay = el("div", "overlay overlay--reveal");
    const box = el("div", "overlay-box reveal-box");
    box.appendChild(el("h2", "overlay-title", `First win against ${pending.opponent.name}!`));

    const cardEl = el("div", "card card--zoom reveal-card");
    if (face) {
      cardEl.dataset.family = face.family;
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

    const header = el("div", "pub-hub-header");
    header.appendChild(el("h1", "pub-hub-title", "The Wheatstone Bridge"));
    const checksBadge = el("div", "checks-badge");
    checksBadge.appendChild(el("span", "checks-badge-value", String(pub.checks)));
    checksBadge.appendChild(el("span", "checks-badge-label", "Checks"));
    header.appendChild(checksBadge);
    screen.appendChild(header);

    const deckRow = el("div", "pub-hub-deck-row");
    deckRow.appendChild(el("span", "taproom-deck", `Deck: ${options.deckName}`));
    const deckRowButtons = el("div", "pub-hub-deck-row-buttons");
    const deckBtn = el("button", "taproom-button taproom-button--secondary", "Build a deck");
    deckBtn.type = "button";
    deckBtn.addEventListener("click", options.onBuildDeck);
    deckRowButtons.appendChild(deckBtn);
    const tournamentsBtn = el("button", "taproom-button taproom-button--secondary", "The chalkboard");
    tournamentsBtn.type = "button";
    tournamentsBtn.addEventListener("click", options.onOpenTournaments);
    deckRowButtons.appendChild(tournamentsBtn);
    deckRow.appendChild(deckRowButtons);
    screen.appendChild(deckRow);

    screen.appendChild(el("h2", "patron-section-title", "Tonight's patrons"));
    const list = el("div", "patron-list");
    for (const opponent of tonightsPatrons(pub.totalWins, new Date())) {
      list.appendChild(buildPatronRow(opponent));
    }
    screen.appendChild(list);

    root.appendChild(screen);
    if (reveal) root.appendChild(buildRevealOverlay(reveal));
  }

  render();

  return () => {
    torn = true;
    root.replaceChildren();
  };
}
