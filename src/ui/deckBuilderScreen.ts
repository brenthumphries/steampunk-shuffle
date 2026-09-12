// The deck builder (plan step 2.2, design.md §7.2): collection grid with
// family/type filters, a live legality meter, and 13 saved deck slots.
// DOM glue only, same "rebuild the tree on every state change" approach as
// the match screen (src/ui/matchScreen.ts) — these are small trees, so a
// full rebuild is cheap. The one exception is the deck-name text input,
// which is mutated in place on every keystroke instead of triggering a
// rebuild, so the player doesn't lose cursor position/focus while typing.
//
// There's no card-ownership/collection system yet (that's plan steps 2.3's
// reward flow and 2.5's acquisition paths) — every one of the 60 v1 cards
// is available to every deck here, with one named exception: The Landlady
// (design.md §14.3, plan step 3.5), reserved until the Birthday
// Invitational is won. Restricting the rest of the grid to "owned" cards
// is a later step's job, not this one's.

import { CARD_TYPES, FAMILIES, type Card, type CardType, type Deck, type Family } from "../cards/cardTypes.ts";
import { ALL_CARDS } from "../cards/data/index.ts";
import { starterDeck } from "../cards/data/decks/starterDeck.ts";
import { keywordChips } from "./cardText.ts";
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

type View = { kind: "list" } | { kind: "editor"; slotIndex: number; family: Family | "all"; type: CardType | "all" };

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
        view = { kind: "editor", slotIndex: index, family: "all", type: "all" };
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

  function renderEditor(slotIndex: number, family: Family | "all", type: CardType | "all"): HTMLElement {
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
      view = { kind: "editor", slotIndex, family: familySelect.value as Family | "all", type };
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
      view = { kind: "editor", slotIndex, family, type: typeSelect.value as CardType | "all" };
      render();
    });
    filters.appendChild(typeSelect);
    screen.appendChild(filters);

    const pub = loadPubState();
    const grid = el("div", "deck-grid");
    const deckFull = legality.totalCards >= 20;
    for (const card of ALL_CARDS) {
      const face = card.faces[0];
      if (family !== "all" && face.family !== family) continue;
      if (type !== "all" && face.type !== type) continue;

      // design.md §14.3: The Landlady is "the last card in the collection...
      // earned by winning the Birthday Invitational. Until then it shows in
      // the collection as a silhouette with 'reserved'." There's still no
      // general ownership system gating this grid (see this file's own
      // header comment) — this is a narrow, card-specific exception for the
      // one card design.md calls out by name, not a first cut at that
      // system.
      if (card.id === "the-landlady" && !pub.collection.includes("the-landlady")) {
        const reserved = el("div", "deck-card-tile deck-card-tile--reserved");
        reserved.appendChild(el("span", "deck-card-points", "?"));
        reserved.appendChild(el("span", "deck-card-name", "The Landlady"));
        reserved.appendChild(el("span", "deck-card-meta", "Reserved — earned by winning the Birthday Invitational"));
        grid.appendChild(reserved);
        continue;
      }

      const qty = quantityInSlot(slot, card.id);
      const maxCopies = card.rarity === "legendary" ? 1 : 2;

      const tile = el("div", "deck-card-tile");
      tile.dataset.family = face.family;
      if (qty > 0) tile.classList.add("deck-card-tile--included");

      tile.appendChild(el("span", "deck-card-points", String(face.points)));
      tile.appendChild(el("span", "deck-card-name", face.name));
      tile.appendChild(el("span", "deck-card-meta", `${TYPE_LABEL[face.type]} · ${card.rarity}`));
      const chips = keywordChips(face);
      if (chips.length > 0) tile.appendChild(el("span", "deck-card-chips", chips.join(" · ")));

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

  function render(): void {
    if (torn) return;
    root.replaceChildren();
    root.appendChild(view.kind === "list" ? renderSlotList() : renderEditor(view.slotIndex, view.family, view.type));
  }

  render();

  return () => {
    torn = true;
    root.replaceChildren();
  };
}
