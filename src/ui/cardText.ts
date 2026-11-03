// Renders rules text for the match screen (card zoom, target-picker prompts)
// from the ability DSL (src/cards/cardTypes.ts) — cards carry structural
// abilities and flavor text, not authored rules prose, so this generates it
// generically from design.md §5's keyword/effect vocabulary.

import { EVERY_BOARD_CARD } from "../cards/data/almanack.ts";
import type { Ability, CardFace, Effect, Target, TargetFilter } from "../cards/cardTypes.ts";

const TRIGGER_LABEL: Record<Ability["trigger"], string | undefined> = {
  onPlay: "On Play",
  continuous: undefined,
  startOfRound: "Start of Round",
  endOfRound: "End of Round",
};

export function keywordChips(face: CardFace): string[] {
  const chips: string[] = [];
  const kw = face.keywords;
  if (kw?.persist) chips.push("Persist");
  if (kw?.elusive) chips.push("Elusive");
  if (kw?.return) chips.push("Return");
  if (kw?.friend !== undefined) chips.push(`Friend ${signed(kw.friend)}`);
  if (kw?.undying) chips.push("Undying");
  if (kw?.moonrise !== undefined) chips.push(`Moonrise +${kw.moonrise}`);
  // Scry is an effect, not a static keyword, but reads as one on the card (design.md §5.16).
  for (const ability of face.abilities ?? []) {
    for (const effect of ability.effects) if (effect.effect === "scry") chips.push(`Scry ${effect.amount}`);
  }
  return chips;
}

const KEYWORD_LABEL: Record<keyof NonNullable<CardFace["keywords"]>, string> = {
  persist: "Persist",
  elusive: "Elusive",
  return: "Return",
  friend: "Friend",
  undying: "Undying",
  moonrise: "Moonrise",
};

function describeSide(side: Target["side"]): string {
  if (side === "self") return "your";
  if (side === "opponent") return "an opposing";
  return "each";
}

function capitalised(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/** Words that sit before the noun: "highest-point", "Gadget", "Friend". */
function filterAdjectives(filter: TargetFilter | undefined): string {
  if (!filter) return "";
  const bits: string[] = [];
  if (filter.highestPoints) bits.push("highest-point");
  if (filter.lowestPoints) bits.push("lowest-point");
  if (filter.family) bits.push(capitalised(filter.family));
  if (filter.cardType) bits.push(capitalised(filter.cardType));
  if (filter.hasKeyword) bits.push(KEYWORD_LABEL[filter.hasKeyword]);
  return bits.join(" ");
}

function worthClause(filter: TargetFilter | undefined): string {
  if (filter?.maxPoints !== undefined) return ` worth ${filter.maxPoints} or less`;
  if (filter?.minPoints !== undefined) return ` worth ${filter.minPoints} or more`;
  return "";
}

/** A count at or above a whole pair of boards is "every card", not a number to print (almanack.ts). */
function isEveryCard(count: number | undefined): boolean {
  return count !== undefined && count >= EVERY_BOARD_CARD;
}

function signed(amount: number): string {
  return amount < 0 ? `-${-amount}` : `+${amount}`;
}

function describeCount(count: number | undefined): string {
  if (!count || count <= 1) return "card";
  return `${count} cards`;
}

function describeTarget(target: Target, state?: "face-up" | "face-down"): string {
  const adjectives = [state, filterAdjectives(target.filter)].filter(Boolean).join(" ");
  const adj = adjectives ? `${adjectives} ` : "";
  const worth = worthClause(target.filter);
  if (isEveryCard(target.count)) {
    if (target.side === "self") return `each of your ${adj}cards${worth}`;
    return `each ${target.side === "opponent" ? "opposing " : ""}${adj}card${worth}`;
  }
  const count = target.count && target.count > 1 ? `${target.count} cards` : "card";
  return `${describeSide(target.side)} ${adj}${count}${worth}`;
}

function describeEffect(effect: Effect): string {
  switch (effect.effect) {
    case "flip":
      return `Flip ${describeTarget(effect.target, isEveryCard(effect.target.count) ? "face-up" : undefined)}.`;
    case "unflip": {
      // "Up to N": `Target.count` is a ceiling (the engine takes as many as
      // exist), which the generic "your 2 cards" phrasing would misstate.
      const count = effect.target.count ?? 1;
      if (isEveryCard(count)) return `Turn ${describeTarget(effect.target, "face-down")} face-up.`;
      if (count > 1 && effect.target.side === "self") return `Turn up to ${count} of your face-down${filterAdjectives(effect.target.filter) ? ` ${filterAdjectives(effect.target.filter)}` : ""} cards face-up.`;
      return `Turn ${describeTarget(effect.target)} face-up.`;
    }
    case "return":
      return `Return ${describeTarget(effect.target)} to hand.`;
    case "buff":
      return `Give ${describeTarget(effect.target, "face-up")} ${signed(effect.amount)}.`;
    case "draw":
      return `Draw ${effect.amount}.`;
    case "discardRandom":
      return `${describeSide(effect.target.side)} player discards ${effect.amount} at random.`;
    case "discardLocation":
      return "Discard the active Location.";
    case "reveal":
      return effect.target.side === "opponent" ? "Reveal your opponent's hand." : `Reveal ${describeTarget(effect.target)}'s hand.`;
    case "steal":
      return `Steal ${describeTarget(effect.target)}.`;
    case "scry":
      return `Scry ${effect.amount}.`;
  }
}

/** One line per ability, e.g. "On Play: Flip an opposing card worth 3 or less." Continuous abilities omit the label. */
export function abilityLines(face: CardFace): string[] {
  return (face.abilities ?? []).map((ability) => {
    const body = ability.effects.map(describeEffect).join(" ");
    const label = TRIGGER_LABEL[ability.trigger];
    return label ? `${label}: ${body}` : body;
  });
}

/**
 * A short one-line label for a target-picker prompt, e.g. "Choose one card
 * to Flip". Bugfix cluster G (note #13): every targeted onPlay effect in
 * the actual card set resolves exactly one target (Effect.target.count
 * defaults to 1 — src/engine/matchEngine.ts's selectTargets — and the one
 * card that ever sets count > 1, The Reichenbach Falls, is an endOfRound
 * trigger that never goes through this staging prompt at all), but a card
 * like Inspector's Warrant ("Flip an opposing card worth 3 or less") reads
 * ambiguously in isolation — nothing about the printed text itself rules
 * out "every qualifying card." Spelling out "one" here, at the point the
 * player is actually choosing, removes that ambiguity without rewording
 * the printed card text quoted verbatim from docs/design.md.
 */
export function effectPromptLabel(effect: Effect): string {
  // A card that can take several targets says "up to N" instead of "one".
  const count = "target" in effect ? (effect.target.count ?? 1) : 1;
  const cards = count > 1 ? `up to ${count} cards` : "one card";
  switch (effect.effect) {
    case "flip":
      return `Choose ${cards} to Flip`;
    case "unflip":
      return `Choose ${cards} to turn face-up`;
    case "return":
      return `Choose ${cards} to Return`;
    case "buff":
      return `Choose ${cards} to boost`;
    default:
      return "Choose a target";
  }
}

function joinNames(names: readonly string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0]!;
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/**
 * What a targeted onPlay effect the player doesn't get to choose (a single
 * legal target, or a "highest/lowest points" filter the card text already
 * names) will actually do — for the play-confirmation bar (PT-12), which
 * otherwise commits a card like Inspector's Warrant with no indication of
 * what it hits, or silently does nothing against an empty board.
 */
export function describeAutoTarget(effect: Effect, targetNames: readonly string[]): string {
  if (targetNames.length === 0) return "No legal target — it does nothing.";
  const names = joinNames(targetNames);
  switch (effect.effect) {
    case "flip":
      return `Flips ${names}.`;
    case "unflip":
      return `Turns ${names} face-up.`;
    case "return":
      return `Returns ${names} to hand.`;
    case "buff":
      return `Gives ${names} ${signed(effect.amount)}.`;
    default:
      return `Targets ${names}.`;
  }
}
