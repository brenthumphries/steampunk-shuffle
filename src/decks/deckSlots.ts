// Deck-slot data model and pure editing logic for the deck builder (plan
// step 2.2, design.md §7.2: "The player's 13 deck slots may hold illegal
// decks; illegal decks cannot be selected for play and the builder says
// why."). A slot stores card ids + quantities rather than full Card
// objects, so a saved slot stays loadable even if card data changes later;
// `slotToDeck` resolves ids against the live card set and drops any id
// that's gone missing rather than throwing.

import { DECK_SIZE, MAX_COPIES, MAX_LEGENDARY_COPIES, type Card, type Deck } from "../cards/cardTypes.ts";
import { validateDeck } from "../cards/deckValidator.ts";

export const DECK_SLOT_COUNT = 13;

export interface DeckSlotEntry {
  cardId: string;
  quantity: number;
}

export interface DeckSlot {
  name: string;
  entries: DeckSlotEntry[];
}

export function createEmptySlot(index: number): DeckSlot {
  return { name: `Deck ${index + 1}`, entries: [] };
}

export function createEmptySlots(): DeckSlot[] {
  return Array.from({ length: DECK_SLOT_COUNT }, (_, i) => createEmptySlot(i));
}

export function slotTotalCards(slot: DeckSlot): number {
  return slot.entries.reduce((sum, e) => sum + e.quantity, 0);
}

export function quantityInSlot(slot: DeckSlot, cardId: string): number {
  return slot.entries.find((e) => e.cardId === cardId)?.quantity ?? 0;
}

function maxCopiesFor(card: Card): number {
  return card.rarity === "legendary" ? MAX_LEGENDARY_COPIES : MAX_COPIES;
}

/**
 * Adds one copy of `card`, capped at its max-copies rule (design.md §7.2)
 * and the 20-card deck size — there's never a legal reason to exceed
 * either, so the builder just refuses rather than letting the player build
 * an over-full deck and then explaining why. Total *points* has no such
 * cap here: going over 60 while still assembling a deck is a normal
 * mid-build state, reported by `computeLegality` instead.
 */
export function addCopy(slot: DeckSlot, card: Card): DeckSlot {
  const current = quantityInSlot(slot, card.id);
  if (current >= maxCopiesFor(card) || slotTotalCards(slot) >= DECK_SIZE) return slot;
  const entries = slot.entries.some((e) => e.cardId === card.id)
    ? slot.entries.map((e) => (e.cardId === card.id ? { ...e, quantity: e.quantity + 1 } : e))
    : [...slot.entries, { cardId: card.id, quantity: 1 }];
  return { ...slot, entries };
}

export function removeCopy(slot: DeckSlot, cardId: string): DeckSlot {
  const current = quantityInSlot(slot, cardId);
  if (current <= 0) return slot;
  const entries =
    current === 1 ? slot.entries.filter((e) => e.cardId !== cardId) : slot.entries.map((e) => (e.cardId === cardId ? { ...e, quantity: e.quantity - 1 } : e));
  return { ...slot, entries };
}

export function renameSlot(slot: DeckSlot, name: string): DeckSlot {
  return { ...slot, name };
}

/** Overwrites a slot's contents with another deck's composition (used for "start from the starter deck"). */
export function loadDeckInto(slot: DeckSlot, deck: Deck): DeckSlot {
  return { ...slot, entries: deck.map((e) => ({ cardId: e.card.id, quantity: e.quantity })) };
}

/** Resolves a slot's card ids against the live card set, dropping any id that no longer exists. */
export function slotToDeck(slot: DeckSlot, cardsById: ReadonlyMap<string, Card>): Deck {
  const deck: Deck = [];
  for (const entry of slot.entries) {
    const card = cardsById.get(entry.cardId);
    if (card) deck.push({ card, quantity: entry.quantity });
  }
  return deck;
}

export interface SlotLegality {
  totalCards: number;
  totalPoints: number;
  valid: boolean;
  errors: string[];
}

/** Runs a slot through the same `validateDeck` (design.md §7.2) the engine and tools use, so the builder's "why" always matches deck legality elsewhere in the project. */
export function computeLegality(slot: DeckSlot, cardsById: ReadonlyMap<string, Card>): SlotLegality {
  const deck = slotToDeck(slot, cardsById);
  const totalPoints = deck.reduce((sum, e) => sum + e.card.faces[0].points * e.quantity, 0);
  const result = validateDeck(deck);
  return { totalCards: slotTotalCards(slot), totalPoints, valid: result.valid, errors: result.errors };
}
