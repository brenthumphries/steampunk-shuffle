// The back room (plan step 2.5, design.md §11.3/§11.4/§11.6): Lost &
// Found's daily free card, the Pawnbroker's rotating window, and the
// Tinker's Bench fuse. Same self-contained DOM-glue pattern as
// src/ui/deckBuilderScreen.ts — reads/writes PubState directly via
// src/pub/pubState.ts rather than round-tripping every action through
// src/main.ts, since none of these actions need to leave this screen.
// Bar Bet (§11.5) isn't here — it's a pre-match step, wired into
// src/ui/pubHubScreen.ts instead, since it needs an opponent in play.

import { keywordChips } from "./cardText.ts";
import { ACQUIRABLE_CARDS_BY_ID } from "../pub/acquirableCards.ts";
import { rollLostAndFound } from "../pub/lostAndFound.ts";
import { pawnbrokerWindow, canAfford, buyFromPawnbroker, type PawnbrokerSlot } from "../pub/pawnbroker.ts";
import { canFuse, fuseChoicesFor, fuse, TINKER_FEE_CHECKS, TINKERS_BENCH_UNLOCK_WINS, type FuseChoice } from "../pub/tinkersBench.ts";
import { claimLostAndFound, countInCollection, hasClaimedLostAndFoundToday, loadPubState, savePubState, type PubState } from "../pub/pubState.ts";
import { playSound } from "../audio/soundEngine.ts";

export interface AcquisitionScreenOptions {
  onBack: () => void;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function cardDisplayName(cardId: string): string {
  if (cardId.startsWith("foil:")) {
    const base = ACQUIRABLE_CARDS_BY_ID.get(cardId.slice(5));
    return `${base?.faces[0].name ?? cardId.slice(5)} (foil)`;
  }
  return ACQUIRABLE_CARDS_BY_ID.get(cardId)?.faces[0].name ?? cardId;
}

/** Mounts the back room into `root` and returns a teardown function. */
export function mountAcquisitionScreen(root: HTMLElement, options: AcquisitionScreenOptions): () => void {
  let pub: PubState = loadPubState();
  let revealCardId: string | null = null;
  let fuseSelection: string | null = null;
  let torn = false;

  function persist(next: PubState): void {
    pub = next;
    savePubState(pub);
  }

  function claimToday(): void {
    const now = new Date();
    const card = rollLostAndFound(pub.collection, now);
    persist(claimLostAndFound(pub, card.id, now));
    revealCardId = card.id;
    playSound("brassHit");
    render();
  }

  function buy(slot: PawnbrokerSlot): void {
    if (!canAfford(pub, slot.price)) return;
    persist(buyFromPawnbroker(pub, slot.card.id, slot.price, new Date()));
    render();
  }

  function doFuse(cardId: string, choice: FuseChoice): void {
    const { next, resultCardId } = fuse(pub, cardId, choice, Date.now());
    persist(next);
    fuseSelection = null;
    revealCardId = resultCardId;
    playSound("brassHit");
    render();
  }

  function buildLostAndFoundSection(): HTMLElement {
    const section = el("section", "backroom-section");
    section.appendChild(el("h2", "backroom-section-title", "Lost & Found"));
    const claimedToday = hasClaimedLostAndFoundToday(pub, new Date());
    section.appendChild(el("p", "backroom-section-note", claimedToday ? "“Nobody's claimed it. I've asked.” Come back tomorrow." : "There's something in the box behind the bar. Free."));
    const btn = el("button", "action-button", claimedToday ? "Claimed today" : "Take it");
    btn.type = "button";
    btn.disabled = claimedToday;
    btn.addEventListener("click", claimToday);
    section.appendChild(btn);
    return section;
  }

  function buildPawnbrokerSection(): HTMLElement {
    const section = el("section", "backroom-section");
    section.appendChild(el("h2", "backroom-section-title", "The Pawnbroker"));
    const grid = el("div", "backroom-grid");
    for (const slot of pawnbrokerWindow(pub, new Date())) {
      const face = slot.card.faces[0];
      const tile = el("div", "backroom-tile");
      tile.dataset.family = face.family;
      tile.appendChild(el("span", "backroom-tile-name", face.name));
      tile.appendChild(el("span", "backroom-tile-meta", `${slot.card.rarity}${slot.isPawned ? " · pawned" : ""}`));
      const btn = el("button", "action-button", `Take my Checks — ${slot.price}`);
      btn.type = "button";
      btn.disabled = !canAfford(pub, slot.price);
      btn.addEventListener("click", () => buy(slot));
      tile.appendChild(btn);
      grid.appendChild(tile);
    }
    section.appendChild(grid);
    return section;
  }

  function buildTinkersBenchSection(): HTMLElement {
    const section = el("section", "backroom-section");
    section.appendChild(el("h2", "backroom-section-title", "The Tinker's Bench"));

    if (pub.totalWins < TINKERS_BENCH_UNLOCK_WINS) {
      section.appendChild(el("p", "backroom-locked", `Unlocks at ${TINKERS_BENCH_UNLOCK_WINS} wins.`));
      return section;
    }

    const fusable = [...new Set(pub.collection)].filter((id) => canFuse(pub.collection, id));
    if (fusable.length === 0) {
      section.appendChild(el("p", "backroom-section-note", "Bring me two of the same card and 10 Checks."));
      return section;
    }

    const grid = el("div", "backroom-grid");
    for (const cardId of fusable) {
      const card = ACQUIRABLE_CARDS_BY_ID.get(cardId)!;
      const tile = el("div", "backroom-tile");
      tile.dataset.family = card.faces[0].family;
      tile.appendChild(el("span", "backroom-tile-name", card.faces[0].name));
      tile.appendChild(el("span", "backroom-tile-meta", `${countInCollection(pub.collection, cardId)} copies · ${card.rarity}`));

      if (fuseSelection === cardId) {
        for (const choice of fuseChoicesFor(cardId)) {
          const choiceBtn = el("button", "action-button action-button--secondary", choice === "foil" ? "Make it a foil" : "Upgrade a rarity");
          choiceBtn.type = "button";
          choiceBtn.disabled = pub.checks < TINKER_FEE_CHECKS;
          choiceBtn.addEventListener("click", () => doFuse(cardId, choice));
          tile.appendChild(choiceBtn);
        }
      } else {
        const btn = el("button", "action-button", `Fuse (${TINKER_FEE_CHECKS} Checks)`);
        btn.type = "button";
        btn.disabled = pub.checks < TINKER_FEE_CHECKS;
        btn.addEventListener("click", () => {
          fuseSelection = cardId;
          render();
        });
        tile.appendChild(btn);
      }
      grid.appendChild(tile);
    }
    section.appendChild(grid);
    return section;
  }

  function buildRevealOverlay(cardId: string): HTMLElement {
    const isFoil = cardId.startsWith("foil:");
    const card = ACQUIRABLE_CARDS_BY_ID.get(isFoil ? cardId.slice(5) : cardId);
    const overlay = el("div", "overlay overlay--reveal");
    const box = el("div", "overlay-box reveal-box");
    box.appendChild(el("h2", "overlay-title", isFoil ? "A foil!" : "New card!"));

    const cardEl = el("div", "card card--zoom reveal-card");
    if (card) {
      const face = card.faces[0];
      cardEl.dataset.family = face.family;
      cardEl.dataset.rarity = card.rarity;
      cardEl.appendChild(el("span", "card-points", String(face.points)));
      cardEl.appendChild(el("span", "card-name", cardDisplayName(cardId)));
      const chips = keywordChips(face);
      if (chips.length > 0) {
        const row = el("div", "card-chip-row");
        for (const chip of chips) row.appendChild(el("span", "card-chip", chip));
        cardEl.appendChild(row);
      }
      if (face.flavor) cardEl.appendChild(el("p", "card-flavor", `"${face.flavor}"`));
    } else {
      cardEl.appendChild(el("span", "card-name", cardId));
    }
    box.appendChild(cardEl);
    box.appendChild(el("p", "overlay-score", "Added to your collection."));

    const btn = el("button", "action-button", "Collect");
    btn.type = "button";
    btn.addEventListener("click", () => {
      revealCardId = null;
      render();
    });
    box.appendChild(btn);

    overlay.appendChild(box);
    return overlay;
  }

  function render(): void {
    if (torn) return;
    root.replaceChildren();

    const screen = el("div", "backroom-screen");

    const header = el("div", "pub-hub-header");
    const backBtn = el("button", "taproom-button taproom-button--secondary", "Back to the bar");
    backBtn.type = "button";
    backBtn.addEventListener("click", options.onBack);
    header.appendChild(backBtn);
    header.appendChild(el("h1", "backroom-title", "The Back Room"));
    const checksBadge = el("div", "checks-badge");
    checksBadge.appendChild(el("span", "checks-badge-value", String(pub.checks)));
    checksBadge.appendChild(el("span", "checks-badge-label", "Checks"));
    header.appendChild(checksBadge);
    screen.appendChild(header);

    screen.appendChild(buildLostAndFoundSection());
    screen.appendChild(buildPawnbrokerSection());
    screen.appendChild(buildTinkersBenchSection());

    root.appendChild(screen);
    if (revealCardId) root.appendChild(buildRevealOverlay(revealCardId));
  }

  render();

  return () => {
    torn = true;
    root.replaceChildren();
  };
}
