// Card schema (design.md §3-§5, §16). Structural types only — the rules
// engine (plan step 1.2) owns how effects actually resolve.

export const FAMILIES = [
  "yard",
  "irregulars",
  "rookery",
  "foundry",
  "salon",
  "neutral",
] as const;
export type Family = (typeof FAMILIES)[number];

export const CARD_TYPES = [
  "character",
  "gadget",
  "scheme",
  "location",
  "headline",
] as const;
export type CardType = (typeof CARD_TYPES)[number];

export const RARITIES = ["common", "uncommon", "rare", "legendary"] as const;
export type Rarity = (typeof RARITIES)[number];

// Printed-point ranges per design.md §7.4. Legendary Characters get a wider
// range than other Characters.
export const POINT_RANGES: Record<CardType, readonly [number, number]> = {
  character: [1, 6],
  gadget: [0, 2],
  scheme: [0, 0],
  location: [0, 0],
  headline: [0, 0],
};
export const LEGENDARY_CHARACTER_POINT_RANGE = [2, 6] as const;

// Keywords are static properties of a face (design.md §5.3-§5.8). "On Play",
// "Flip", "Draw N", "Reveal" and "Transform" are triggered/continuous
// behavior instead, modeled as abilities below.
export interface Keywords {
  persist?: boolean;
  elusive?: boolean;
  return?: boolean;
  /** Friend +N (design.md §5.4). Absent if the face has no Friend keyword. */
  friend?: number;
}

export const TRIGGERS = [
  "onPlay",
  "continuous",
  "startOfRound",
  "endOfRound",
] as const;
export type Trigger = (typeof TRIGGERS)[number];

export type Side = "self" | "opponent" | "each";

export interface TargetFilter {
  maxPoints?: number;
  minPoints?: number;
  family?: Family;
  cardType?: CardType;
  /** Selects the single card with the most effective points on the target side. */
  highestPoints?: boolean;
  /** Selects the single card with the least effective points on the target side. */
  lowestPoints?: boolean;
  excludeElusive?: boolean;
}

export interface Target {
  side: Side;
  filter?: TargetFilter;
  /** How many cards this effect touches. Defaults to 1. */
  count?: number;
}

// Effect kinds needed to model every v1 card in design.md §8-§9 and §15.
// `steal` is reserved for the stretch legend Robin Hood (§9.3) and is not
// resolved by the engine in v1 (design.md §16).
export type Effect =
  | { effect: "flip"; target: Target }
  | { effect: "unflip"; target: Target }
  | { effect: "return"; target: Target }
  | { effect: "draw"; amount: number }
  | { effect: "discardRandom"; target: Target; amount: number }
  | { effect: "reveal"; target: Target }
  | { effect: "discardLocation" }
  | { effect: "buff"; target: Target; amount: number }
  | { effect: "steal"; target: Target };

export interface Ability {
  trigger: Trigger;
  effects: Effect[];
}

export interface CardFace {
  name: string;
  type: CardType;
  family: Family;
  /** Printed points, per POINT_RANGES / LEGENDARY_CHARACTER_POINT_RANGE. */
  points: number;
  keywords?: Keywords;
  abilities?: Ability[];
  flavor: string;
  artId: string;
}

export interface Card {
  id: string;
  rarity: Rarity;
  /**
   * Front face first. Only faces[0]'s points count for deck-building
   * (design.md §5.10, §16). A second face is a Transform card
   * (design.md §5.10) — v1 has exactly one (Dr Jekyll / Mr Hyde).
   */
  faces: [CardFace] | [CardFace, CardFace];
  /** Locked stats for a tutorial-scripted card (design.md §8.3, §16). */
  tutorialLocked?: boolean;
}

// Deck legality (design.md §7.2). A deck is a list of distinct cards with a
// quantity each, not 20 repeated card objects.
export interface DeckEntry {
  card: Card;
  quantity: number;
}

export type Deck = DeckEntry[];

export const DECK_SIZE = 20;
export const MAX_COPIES = 2;
export const MAX_LEGENDARY_COPIES = 1;
export const MAX_DECK_POINTS = 60;
