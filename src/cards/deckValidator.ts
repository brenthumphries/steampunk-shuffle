// Deck-legality checker (design.md §7.2): exactly 20 cards, at most 2
// copies of any card, at most 1 copy of any legendary, total printed
// points (front faces) at most 60. Illegal decks must say why.

import { DECK_SIZE, MAX_COPIES, MAX_DECK_POINTS, MAX_LEGENDARY_COPIES, type Deck } from "./cardTypes.ts";
import { validateCard, type ValidationResult } from "./cardValidator.ts";

export function validateDeck(deck: Deck): ValidationResult {
  const errors: string[] = [];

  let totalCards = 0;
  let totalPoints = 0;
  const seenIds = new Set<string>();

  for (const entry of deck) {
    const cardResult = validateCard(entry.card);
    if (!cardResult.valid) {
      errors.push(`"${entry.card.id}" is not a legal card: ${cardResult.errors.join("; ")}`);
      continue;
    }

    if (seenIds.has(entry.card.id)) {
      errors.push(`"${entry.card.id}" appears in more than one deck entry; combine into a single entry with a quantity.`);
      continue;
    }
    seenIds.add(entry.card.id);

    if (!Number.isInteger(entry.quantity) || entry.quantity < 1) {
      errors.push(`"${entry.card.id}": quantity must be a positive integer, got ${entry.quantity}`);
      continue;
    }

    const maxCopies = entry.card.rarity === "legendary" ? MAX_LEGENDARY_COPIES : MAX_COPIES;
    if (entry.quantity > maxCopies) {
      errors.push(
        `"${entry.card.id}" appears ${entry.quantity} times; ${
          entry.card.rarity === "legendary" ? "legendary cards allow at most 1 copy" : `at most ${MAX_COPIES} copies allowed`
        }.`,
      );
    }

    totalCards += entry.quantity;
    totalPoints += entry.card.faces[0].points * entry.quantity;
  }

  if (totalCards !== DECK_SIZE) {
    errors.push(`Deck has ${totalCards} cards; must have exactly ${DECK_SIZE}.`);
  }

  if (totalPoints > MAX_DECK_POINTS) {
    errors.push(`Total printed points is ${totalPoints}; must be at most ${MAX_DECK_POINTS}.`);
  }

  return { valid: errors.length === 0, errors };
}
