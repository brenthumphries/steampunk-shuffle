// The back room (plan step 2.5, design.md §11.3/§11.4/§11.6): Lost &
// Found's daily free card, the Pawnbroker's rotating window, and the
// Tinker's Bench fuse. Same self-contained DOM-glue pattern as
// src/ui/deckBuilderScreen.ts — reads/writes PubState directly via
// src/pub/pubState.ts rather than round-tripping every action through
// src/main.ts, since none of these actions need to leave this screen.
// Bar Bet (§11.5) isn't here — it's a pre-match step, wired into
// src/ui/pubHubScreen.ts instead, since it needs an opponent in play.

import { abilityLines, keywordChips } from "./cardText.ts";
import { buildCardZoomOverlay } from "./cardZoom.ts";
import { ACQUIRABLE_CARDS_BY_ID } from "../pub/acquirableCards.ts";
import { rollLostAndFound, rollLostAndFoundExtra } from "../pub/lostAndFound.ts";
import { pawnbrokerWindow, canAfford, buyFromPawnbroker, type PawnbrokerSlot } from "../pub/pawnbroker.ts";
import { canFuse, fuseChoicesFor, fuse, TINKER_FEE_CHECKS, TINKERS_BENCH_UNLOCK_WINS, type FuseChoice } from "../pub/tinkersBench.ts";
import { claimLostAndFound, countInCollection, hasClaimedLostAndFoundToday, loadPubState, savePubState, type PubState } from "../pub/pubState.ts";
import { playSound } from "../audio/soundEngine.ts";
import { spendToken, tokenCount } from "../events/advent.ts";
import { lostAndFoundExtraAvailable, lostAndFoundUpgradeActive, markOneShotUsed, spendFreeFuse, tinkerFee } from "../booth/omens.ts";
import { today } from "../events/eventClock.ts";

export interface AcquisitionScreenOptions {
  onBack: () => void;
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

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1);
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
  let zoomedCardId: string | null = null;
  let pendingExtraId: string | null = null;
  let torn = false;

  function persist(next: PubState): void {
    pub = next;
    savePubState(pub);
  }

  function claimToday(): void {
    const now = today();
    const upgrade = lostAndFoundUpgradeActive(pub, now);
    // An Advent Cabinet token makes this pull at least uncommon, and is spent by it.
    const useToken = tokenCount(pub, "lostAndFoundUncommon") > 0;
    const card = rollLostAndFound(pub.collection, now, { upgrade, atLeastUncommon: useToken });
    const claimed = claimLostAndFound(pub, card.id, now);
    persist(useToken ? spendToken(claimed, "lostAndFoundUncommon") : claimed);
    revealCardId = card.id;
    // The Booth's lostAndFoundExtra omen: a second card in the same box, once.
    if (lostAndFoundExtraAvailable(pub, now)) takeExtra(card.id);
    playSound("brassHit");
    render();
  }

  /** The omen's second card. `firstCardId` keeps it from duplicating the day's first card. */
  function takeExtra(firstCardId: string): void {
    const now = today();
    const extra = rollLostAndFoundExtra(pub.collection, now, firstCardId, { upgrade: lostAndFoundUpgradeActive(pub, now) });
    persist(markOneShotUsed({ ...pub, collection: [...pub.collection, extra.id] }, now, "lostAndFoundExtra"));
    pendingExtraId = extra.id;
  }

  /** The first card was claimed before the omen was drawn: the extra is still there. */
  function claimExtraOnly(): void {
    const now = today();
    const base = rollLostAndFound(pub.collection, now, { upgrade: lostAndFoundUpgradeActive(pub, now) });
    takeExtra(base.id);
    revealCardId = pendingExtraId;
    pendingExtraId = null;
    playSound("brassHit");
    render();
  }

  function buy(slot: PawnbrokerSlot): void {
    if (!canAfford(pub, slot.price)) return;
    persist(buyFromPawnbroker(pub, slot.card.id, slot.price, today()));
    render();
  }

  function doFuse(cardId: string, choice: FuseChoice): void {
    const now = today();
    const fee = tinkerFee(pub, now, TINKER_FEE_CHECKS);
    const { next, resultCardId } = fuse(pub, cardId, choice, Date.now(), fee);
    // The Booth's tinkerFree omen, or an Advent Cabinet token, waives one fusing's fee (the omen first).
    persist(fee < TINKER_FEE_CHECKS ? spendFreeFuse(next, now) : next);
    fuseSelection = null;
    revealCardId = resultCardId;
    playSound("brassHit");
    render();
  }

  function buildLostAndFoundSection(): HTMLElement {
    const section = el("section", "backroom-section");
    section.appendChild(el("h2", "backroom-section-title", "Lost & Found"));
    const claimedToday = hasClaimedLostAndFoundToday(pub, today());
    section.appendChild(el("p", "backroom-section-note", claimedToday ? "“Nobody's claimed it. I've asked.” Come back tomorrow." : "There's something in the box behind the bar. Free."));
    const btn = el("button", "action-button", claimedToday ? "Claimed today" : "Take it");
    btn.type = "button";
    btn.disabled = claimedToday;
    btn.addEventListener("click", claimToday);
    section.appendChild(btn);
    if (claimedToday && lostAndFoundExtraAvailable(pub, today())) {
      const extraBtn = el("button", "action-button", "A second thing in the box");
      extraBtn.type = "button";
      extraBtn.addEventListener("click", claimExtraOnly);
      section.appendChild(extraBtn);
    }
    return section;
  }

  function buildPawnbrokerSection(): HTMLElement {
    const section = el("section", "backroom-section");
    section.appendChild(el("h2", "backroom-section-title", "The Pawnbroker"));
    const grid = el("div", "backroom-grid");
    for (const slot of pawnbrokerWindow(pub, today())) {
      const face = slot.card.faces[0];
      const tile = el("div", "backroom-tile");
      tile.dataset.family = face.family;
      tile.appendChild(el("span", "backroom-tile-points", String(face.points)));
      tile.appendChild(el("span", "backroom-tile-name", face.name));
      tile.appendChild(el("span", "backroom-tile-meta", `${capitalize(face.type)} · ${slot.card.rarity}${slot.isPawned ? " · pawned" : ""}`));
      const chips = keywordChips(face);
      if (chips.length > 0) tile.appendChild(el("span", "backroom-tile-chips", chips.join(" · ")));
      for (const line of abilityLines(face)) tile.appendChild(el("p", "backroom-tile-ability", line));
      const zoomBtn = el("button", "backroom-tile-zoom-btn", "i");
      zoomBtn.type = "button";
      zoomBtn.setAttribute("aria-label", `Show full card: ${face.name}`);
      zoomBtn.addEventListener("click", () => {
        zoomedCardId = slot.card.id;
        render();
      });
      tile.appendChild(zoomBtn);
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
          choiceBtn.disabled = pub.checks < tinkerFee(pub, today(), TINKER_FEE_CHECKS);
          choiceBtn.addEventListener("click", () => doFuse(cardId, choice));
          tile.appendChild(choiceBtn);
        }
      } else {
        const fee = tinkerFee(pub, today(), TINKER_FEE_CHECKS);
        const btn = el("button", "action-button", fee === 0 ? "Fuse (free today)" : `Fuse (${fee} Checks)`);
        btn.type = "button";
        btn.disabled = pub.checks < fee;
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
      cardEl.style.setProperty("--illustration", `url(${artUrl(face.artId)})`);
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
      revealCardId = pendingExtraId;
      pendingExtraId = null;
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
    screen.style.setProperty("--scene-bg", `url(${artUrl("background-the-cellar")})`);

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
    if (zoomedCardId) {
      const card = ACQUIRABLE_CARDS_BY_ID.get(zoomedCardId);
      if (card) {
        root.appendChild(
          buildCardZoomOverlay(card, 0, () => {
            zoomedCardId = null;
            render();
          }),
        );
      }
    }
  }

  render();

  return () => {
    torn = true;
    root.replaceChildren();
  };
}
