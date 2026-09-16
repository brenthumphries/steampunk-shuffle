// The deck builder (plan step 2.2, design.md §7.2): collection grid with
// family/type filters, a live legality meter, and 13 saved deck slots.
// DOM glue only, same "rebuild the tree on every state change" approach as
// the match screen (src/ui/matchScreen.ts) — these are small trees, so a
// full rebuild is cheap. The one exception is the deck-name text input,
// which is mutated in place on every keystroke instead of triggering a
// rebuild, so the player doesn't lose cursor position/focus while typing.
//
// Ownership gating (plan step 4.0d, PT-1): the grid is still every one of
// the 60 v1 cards (expanding it to include collection-only extras like the
// Seasoned reward cards is a separate, not-yet-done step), but a card's
// owned copies (src/decks/ownership.ts) now cap how many of it can be
// added — an unowned card renders dimmed, with no +/− controls, but stays
// zoomable (a wishlist). The Landlady's design.md §14.3 "Reserved" case
// (plan step 3.5) is folded into this same unowned-tile path now, keeping
// only her specific flavor text as a per-card override.

import { CARD_TYPES, FAMILIES, type Card, type CardType, type Deck, type Family } from "../cards/cardTypes.ts";
import { ALL_CARDS } from "../cards/data/index.ts";
import { starterDeck } from "../cards/data/decks/starterDeck.ts";
import { abilityLines, keywordChips } from "./cardText.ts";
import { buildCardZoomOverlay } from "./cardZoom.ts";
import { ownedCopies } from "../decks/ownership.ts";
import { ALL_FAMILY_COLORS } from "./familyColors.ts";
import {
  addCopy,
  computeLegality,
  createEmptySlot,
  loadDeckInto,
  quantityInSlot,
  removeCopy,
  renameSlot,
  slotToDeck,
  type DeckSlot,
} from "../decks/deckSlots.ts";
import { loadDeckSlotsState, saveDeckSlotsState, type DeckSlotsState } from "../decks/deckStorage.ts";
import { loadPubState } from "../pub/pubState.ts";
import { titleForWins } from "../pub/progression.ts";

export interface DeckBuilderOptions {
  onExit: () => void;
  /** Called when the player selects a legal deck slot to play with. */
  onSelectDeck?: (deck: Deck, deckName: string) => void;
}

type View = { kind: "list" } | { kind: "editor"; slotIndex: number; family: Family | "all"; type: CardType | "all"; ownedOnly: boolean };

const FAMILY_LABEL: Record<Family, string> = {
  yard: "The Yard",
  irregulars: "The Irregulars",
  rookery: "The Rookery",
  foundry: "The Foundry",
  salon: "The Salon",
  neutral: "Neutral",
};

const TYPE_LABEL: Record<CardType, string> = {
  character: "Character",
  gadget: "Gadget",
  scheme: "Scheme",
  location: "Location",
  headline: "Headline",
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

export function mountDeckBuilderScreen(root: HTMLElement, options: DeckBuilderOptions): () => void {
  const cardsById = new Map<string, Card>(ALL_CARDS.map((c) => [c.id, c]));
  let stored: DeckSlotsState = loadDeckSlotsState();
  let view: View = { kind: "list" };
  let zoomed: Card | null = null;
  let torn = false;

  function persist(): void {
    saveDeckSlotsState(stored);
  }

  function updateSlot(index: number, updater: (slot: DeckSlot) => DeckSlot): void {
    stored = { ...stored, slots: stored.slots.map((s, i) => (i === index ? updater(s) : s)) };
    persist();
  }

  // -------------------------------------------------------------------
  // Slot list
  // -------------------------------------------------------------------

  function renderSlotList(): HTMLElement {
    const screen = el("div", "deck-builder");
    screen.style.setProperty("--scene-bg", `url(${artUrl("background-the-back-parlour")})`);

    const header = el("div", "deck-builder-header");
    const backBtn = el("button", "action-button action-button--secondary", "Back to the taproom");
    backBtn.type = "button";
    backBtn.addEventListener("click", () => options.onExit());
    header.appendChild(backBtn);
    header.appendChild(el("h1", "deck-builder-title", "Your decks"));
    header.appendChild(el("span", "deck-builder-subtitle", titleForWins(loadPubState().totalWins)));
    screen.appendChild(header);

    const list = el("div", "deck-slot-list");
    stored.slots.forEach((slot, index) => {
      const legality = computeLegality(slot, cardsById);
      const row = el("div", "deck-slot-row");
      if (index === stored.selectedIndex) row.classList.add("deck-slot-row--selected");

      const info = el("div", "deck-slot-info");
      info.appendChild(el("span", "deck-slot-name", slot.name));
      info.appendChild(el("span", "deck-slot-meta", `${legality.totalCards}/20 cards · ${legality.totalPoints}/60 pts`));
      info.addEventListener("click", () => {
        view = { kind: "editor", slotIndex: index, family: "all", type: "all", ownedOnly: false };
        render();
      });
      info.classList.add("deck-slot-info--tappable");
      row.appendChild(info);

      const badge = el("span", `deck-slot-badge ${legality.valid ? "deck-slot-badge--legal" : "deck-slot-badge--illegal"}`, legality.valid ? "Legal" : "Not legal");
      row.appendChild(badge);

      const selectBtn = el("button", "action-button", index === stored.selectedIndex ? "Selected" : "Select");
      selectBtn.type = "button";
      selectBtn.disabled = !legality.valid;
      selectBtn.addEventListener("click", () => {
        stored = { ...stored, selectedIndex: index };
        persist();
        options.onSelectDeck?.(slotToDeck(slot, cardsById), slot.name);
        render();
      });
      row.appendChild(selectBtn);

      list.appendChild(row);
    });
    screen.appendChild(list);

    return screen;
  }

  // -------------------------------------------------------------------
  // Slot editor
  // -------------------------------------------------------------------

  function renderEditor(slotIndex: number, family: Family | "all", type: CardType | "all", ownedOnly: boolean): HTMLElement {
    const slot = stored.slots[slotIndex] ?? createEmptySlot(slotIndex);
    const legality = computeLegality(slot, cardsById);

    const screen = el("div", "deck-builder");
    screen.style.setProperty("--scene-bg", `url(${artUrl("background-the-back-parlour")})`);

    const header = el("div", "deck-builder-header");
    const doneBtn = el("button", "action-button action-button--secondary", "Done");
    doneBtn.type = "button";
    doneBtn.addEventListener("click", () => {
      view = { kind: "list" };
      render();
    });
    header.appendChild(doneBtn);
    const nameInput = el("input", "deck-name-input") as HTMLInputElement;
    nameInput.type = "text";
    nameInput.value = slot.name;
    nameInput.setAttribute("aria-label", "Deck name");
    nameInput.maxLength = 40;
    nameInput.addEventListener("input", () => {
      // Mutate in place rather than calling render(), so the input keeps
      // focus/cursor position while the player is still typing.
      updateSlot(slotIndex, (s) => renameSlot(s, nameInput.value));
    });
    header.appendChild(nameInput);
    screen.appendChild(header);

    const meter = el("div", `legality-panel ${legality.valid ? "legality-panel--good" : "legality-panel--bad"}`);
    meter.appendChild(el("p", "legality-summary", `${legality.totalCards}/20 cards · ${legality.totalPoints}/60 points`));
    if (!legality.valid) {
      const reasons = el("ul", "legality-reasons");
      for (const reason of legality.errors) reasons.appendChild(el("li", undefined, reason));
      meter.appendChild(reasons);
    }
    screen.appendChild(meter);

    const utilityRow = el("div", "deck-utility-row");
    const starterBtn = el("button", "action-button action-button--secondary", "Start from the Village Constable");
    starterBtn.type = "button";
    starterBtn.addEventListener("click", () => {
      updateSlot(slotIndex, (s) => loadDeckInto(s, starterDeck));
      render();
    });
    utilityRow.appendChild(starterBtn);
    screen.appendChild(utilityRow);

    const filters = el("div", "deck-filters");
    const familySelect = el("select", "deck-filter-select");
    const allFamiliesOpt = el("option", undefined, "All families");
    allFamiliesOpt.value = "all";
    familySelect.appendChild(allFamiliesOpt);
    for (const f of FAMILIES) {
      const opt = el("option", undefined, FAMILY_LABEL[f]);
      opt.value = f;
      familySelect.appendChild(opt);
    }
    familySelect.value = family;
    familySelect.addEventListener("change", () => {
      view = { kind: "editor", slotIndex, family: familySelect.value as Family | "all", type, ownedOnly };
      render();
    });
    filters.appendChild(familySelect);

    const typeSelect = el("select", "deck-filter-select");
    const allTypesOpt = el("option", undefined, "All types");
    allTypesOpt.value = "all";
    typeSelect.appendChild(allTypesOpt);
    for (const t of CARD_TYPES) {
      const opt = el("option", undefined, TYPE_LABEL[t]);
      opt.value = t;
      typeSelect.appendChild(opt);
    }
    typeSelect.value = type;
    typeSelect.addEventListener("change", () => {
      view = { kind: "editor", slotIndex, family, type: typeSelect.value as CardType | "all", ownedOnly };
      render();
    });
    filters.appendChild(typeSelect);

    // PT-24: "there's no collection view" — falls out of PT-1's owned
    // counts for free once the grid can filter down to just what's owned.
    const ownedOnlyLabel = el("label", "deck-filter-owned-only");
    const ownedOnlyCheckbox = el("input") as HTMLInputElement;
    ownedOnlyCheckbox.type = "checkbox";
    ownedOnlyCheckbox.checked = ownedOnly;
    ownedOnlyCheckbox.addEventListener("change", () => {
      view = { kind: "editor", slotIndex, family, type, ownedOnly: ownedOnlyCheckbox.checked };
      render();
    });
    ownedOnlyLabel.appendChild(ownedOnlyCheckbox);
    ownedOnlyLabel.appendChild(document.createTextNode("Owned only"));
    filters.appendChild(ownedOnlyLabel);
    screen.appendChild(filters);

    // Bugfix cluster B (note #11): ties the family dropdown's names to the
    // colors the cards below actually use — color alone isn't accessible
    // to colorblind players, and nothing previously spelled out what each
    // border color meant.
    const legend = el("div", "family-legend");
    for (const { family, color } of ALL_FAMILY_COLORS) {
      const item = el("span", "family-legend-item");
      const swatch = el("span", "family-legend-swatch");
      swatch.style.backgroundColor = color;
      item.appendChild(swatch);
      item.appendChild(document.createTextNode(FAMILY_LABEL[family]));
      legend.appendChild(item);
    }
    screen.appendChild(legend);

    const pub = loadPubState();
    const grid = el("div", "deck-grid");
    const deckFull = legality.totalCards >= 20;
    for (const card of ALL_CARDS) {
      const face = card.faces[0];
      if (family !== "all" && face.family !== family) continue;
      if (type !== "all" && face.type !== type) continue;

      const owned = ownedCopies(card.id, pub.collection);
      if (ownedOnly && owned === 0) continue;

      const tile = el("div", "deck-card-tile");
      tile.dataset.family = face.family;
      tile.dataset.rarity = card.rarity;
      tile.appendChild(el("span", "deck-card-points", String(face.points)));
      tile.appendChild(el("span", "deck-card-name", face.name));
      tile.appendChild(el("span", "deck-card-meta", `${TYPE_LABEL[face.type]} · ${card.rarity}`));
      const chips = keywordChips(face);
      if (chips.length > 0) tile.appendChild(el("span", "deck-card-chips", chips.join(" · ")));
      for (const line of abilityLines(face)) tile.appendChild(el("p", "deck-card-ability", line));

      const zoomBtn = el("button", "deck-card-zoom-btn", "i");
      zoomBtn.type = "button";
      zoomBtn.setAttribute("aria-label", `Show full card: ${face.name}`);
      zoomBtn.addEventListener("click", () => {
        zoomed = card;
        render();
      });
      tile.appendChild(zoomBtn);

      if (owned === 0) {
        // PT-1 (unowned tiles dimmed but zoomable — a wishlist) folds in
        // design.md §14.3's Landlady "Reserved" case (plan step 3.5) as
        // just this one card's own note text, rather than a separate
        // code path.
        tile.classList.add("deck-card-tile--unowned");
        tile.appendChild(
          el(
            "span",
            "deck-card-unowned-note",
            card.id === "the-landlady" ? "Reserved — earned by winning the Birthday Invitational" : "Not yet owned",
          ),
        );
        grid.appendChild(tile);
        continue;
      }

      const qty = quantityInSlot(slot, card.id);
      const maxCopies = Math.min(owned, card.rarity === "legendary" ? 1 : 2);
      if (qty > 0) {
        // Bugfix cluster B (note #3): a checkmark badge is the primary
        // "already in this deck" signal now — the amber ring
        // (`--included-shadow`, src/style.css) alone was too subtle.
        tile.classList.add("deck-card-tile--included");
        tile.appendChild(el("span", "deck-card-badge", "✓ In this deck"));
      }
      tile.appendChild(el("span", "deck-card-owned", `Owned: ${owned}`));

      const controls = el("div", "deck-card-controls");
      const minusBtn = el("button", "deck-card-btn", "−");
      minusBtn.type = "button";
      minusBtn.disabled = qty === 0;
      minusBtn.setAttribute("aria-label", `Remove one ${face.name}`);
      minusBtn.addEventListener("click", () => {
        updateSlot(slotIndex, (s) => removeCopy(s, card.id));
        render();
      });
      controls.appendChild(minusBtn);
      controls.appendChild(el("span", "deck-card-qty", `${qty}/${maxCopies}`));
      const plusBtn = el("button", "deck-card-btn", "+");
      plusBtn.type = "button";
      plusBtn.disabled = qty >= maxCopies || deckFull;
      plusBtn.setAttribute("aria-label", `Add one ${face.name}`);
      plusBtn.addEventListener("click", () => {
        updateSlot(slotIndex, (s) => addCopy(s, card));
        render();
      });
      controls.appendChild(plusBtn);
      tile.appendChild(controls);

      grid.appendChild(tile);
    }
    screen.appendChild(grid);

    return screen;
  }

  /**
   * Bugfix cluster C (note #12): every state change here does a full
   * teardown/rebuild (`root.replaceChildren()`) rather than an in-place
   * DOM update — the new `.deck-builder` element is a brand-new node, so
   * its scroll position starts back at 0 even though nothing about the
   * *grid* itself needed to remount. Capturing the outgoing screen's
   * `scrollTop` and reapplying it to the incoming one keeps the add/select
   * action from jumping the view back to the top, without restructuring
   * this screen's whole render-on-every-change approach (same pattern the
   * match/pub-hub screens rely on too).
   */
  function render(): void {
    if (torn) return;
    const previousScreen = root.querySelector<HTMLElement>(".deck-builder");
    const scrollTop = previousScreen?.scrollTop ?? 0;
    root.replaceChildren();
    const screen = view.kind === "list" ? renderSlotList() : renderEditor(view.slotIndex, view.family, view.type, view.ownedOnly);
    root.appendChild(screen);
    screen.scrollTop = scrollTop;
    if (zoomed) {
      root.appendChild(
        buildCardZoomOverlay(zoomed, 0, () => {
          zoomed = null;
          render();
        }),
      );
    }
  }

  render();

  return () => {
    torn = true;
    root.replaceChildren();
  };
}
