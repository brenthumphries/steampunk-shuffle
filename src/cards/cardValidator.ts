// Structural validator for a single card (design.md §3-§5, §16).
// Accepts `unknown` because card data is authored as JSON (plan step 1.5)
// and should never be trusted at the type level.

import {
  CARD_TYPES,
  FAMILIES,
  LEGENDARY_CHARACTER_POINT_RANGE,
  POINT_RANGES,
  RARITIES,
  TRIGGERS,
  type Ability,
  type Card,
  type CardFace,
  type CardType,
  type Effect,
  type Keywords,
  type Rarity,
  type Target,
  type TargetFilter,
} from "./cardTypes.ts";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

function oneOf<T extends string>(values: readonly T[], value: unknown): value is T {
  return typeof value === "string" && (values as readonly string[]).includes(value);
}

function validateTargetFilter(filter: unknown, path: string, errors: string[]): void {
  if (filter === undefined) return;
  if (!isPlainObject(filter)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  const f = filter as Partial<TargetFilter>;
  if (f.maxPoints !== undefined && !isInteger(f.maxPoints)) {
    errors.push(`${path}.maxPoints: expected an integer`);
  }
  if (f.minPoints !== undefined && !isInteger(f.minPoints)) {
    errors.push(`${path}.minPoints: expected an integer`);
  }
  if (f.family !== undefined && !oneOf(FAMILIES, f.family)) {
    errors.push(`${path}.family: expected one of ${FAMILIES.join(", ")}`);
  }
  if (f.cardType !== undefined && !oneOf(CARD_TYPES, f.cardType)) {
    errors.push(`${path}.cardType: expected one of ${CARD_TYPES.join(", ")}`);
  }
  if (f.highestPoints !== undefined && typeof f.highestPoints !== "boolean") {
    errors.push(`${path}.highestPoints: expected a boolean`);
  }
  if (f.lowestPoints !== undefined && typeof f.lowestPoints !== "boolean") {
    errors.push(`${path}.lowestPoints: expected a boolean`);
  }
  if (f.excludeElusive !== undefined && typeof f.excludeElusive !== "boolean") {
    errors.push(`${path}.excludeElusive: expected a boolean`);
  }
}

function validateTarget(target: unknown, path: string, errors: string[]): void {
  if (!isPlainObject(target)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  const t = target as Partial<Target>;
  if (!oneOf(["self", "opponent", "each"], t.side)) {
    errors.push(`${path}.side: expected one of self, opponent, each`);
  }
  if (t.count !== undefined && (!isInteger(t.count) || t.count < 1)) {
    errors.push(`${path}.count: expected a positive integer`);
  }
  validateTargetFilter(t.filter, `${path}.filter`, errors);
}

const EFFECT_KINDS = [
  "flip",
  "unflip",
  "return",
  "draw",
  "discardRandom",
  "reveal",
  "discardLocation",
  "buff",
  "steal",
] as const;

function validateEffect(effect: unknown, path: string, errors: string[]): void {
  if (!isPlainObject(effect)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  const e = effect as Partial<Effect> & Record<string, unknown>;
  if (!oneOf(EFFECT_KINDS, e.effect)) {
    errors.push(`${path}.effect: expected one of ${EFFECT_KINDS.join(", ")}`);
    return;
  }
  switch (e.effect) {
    case "flip":
    case "unflip":
    case "return":
    case "reveal":
    case "steal":
      validateTarget(e.target, `${path}.target`, errors);
      break;
    case "draw":
      if (!isInteger(e.amount) || (e.amount as number) < 1) {
        errors.push(`${path}.amount: expected a positive integer`);
      }
      break;
    case "discardRandom":
      validateTarget(e.target, `${path}.target`, errors);
      if (!isInteger(e.amount) || (e.amount as number) < 1) {
        errors.push(`${path}.amount: expected a positive integer`);
      }
      break;
    case "buff":
      validateTarget(e.target, `${path}.target`, errors);
      if (!isInteger(e.amount)) {
        errors.push(`${path}.amount: expected an integer`);
      }
      break;
    case "discardLocation":
      break;
  }
}

function validateAbility(ability: unknown, path: string, errors: string[]): void {
  if (!isPlainObject(ability)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  const a = ability as Partial<Ability>;
  if (!oneOf(TRIGGERS, a.trigger)) {
    errors.push(`${path}.trigger: expected one of ${TRIGGERS.join(", ")}`);
  }
  if (!Array.isArray(a.effects) || a.effects.length === 0) {
    errors.push(`${path}.effects: expected a non-empty array`);
    return;
  }
  a.effects.forEach((effect, index) => {
    validateEffect(effect, `${path}.effects[${index}]`, errors);
  });
}

function validateKeywords(keywords: unknown, path: string, errors: string[]): void {
  if (keywords === undefined) return;
  if (!isPlainObject(keywords)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  const k = keywords as Partial<Keywords>;
  if (k.persist !== undefined && typeof k.persist !== "boolean") {
    errors.push(`${path}.persist: expected a boolean`);
  }
  if (k.elusive !== undefined && typeof k.elusive !== "boolean") {
    errors.push(`${path}.elusive: expected a boolean`);
  }
  if (k.return !== undefined && typeof k.return !== "boolean") {
    errors.push(`${path}.return: expected a boolean`);
  }
  if (k.friend !== undefined && (!isInteger(k.friend) || k.friend < 1)) {
    errors.push(`${path}.friend: expected a positive integer`);
  }
}

function pointRangeFor(type: CardType, rarity: Rarity): readonly [number, number] {
  if (type === "character" && rarity === "legendary") {
    return LEGENDARY_CHARACTER_POINT_RANGE;
  }
  return POINT_RANGES[type];
}

function validateFace(
  face: unknown,
  path: string,
  rarity: Rarity | undefined,
  errors: string[],
): void {
  if (!isPlainObject(face)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  const f = face as Partial<CardFace>;

  if (!isNonEmptyString(f.name)) {
    errors.push(`${path}.name: expected a non-empty string`);
  }
  if (!oneOf(CARD_TYPES, f.type)) {
    errors.push(`${path}.type: expected one of ${CARD_TYPES.join(", ")}`);
  }
  if (!oneOf(FAMILIES, f.family)) {
    errors.push(`${path}.family: expected one of ${FAMILIES.join(", ")}`);
  }
  if (!isNonEmptyString(f.flavor)) {
    errors.push(`${path}.flavor: expected a non-empty string`);
  }
  if (!isNonEmptyString(f.artId)) {
    errors.push(`${path}.artId: expected a non-empty string`);
  }

  if (!isInteger(f.points)) {
    errors.push(`${path}.points: expected an integer`);
  } else if (f.type !== undefined && oneOf(CARD_TYPES, f.type) && rarity !== undefined) {
    const [min, max] = pointRangeFor(f.type, rarity);
    if (f.points < min || f.points > max) {
      errors.push(`${path}.points: expected between ${min} and ${max} for a ${rarity} ${f.type}, got ${f.points}`);
    }
  }

  validateKeywords(f.keywords, `${path}.keywords`, errors);

  if (f.abilities !== undefined) {
    if (!Array.isArray(f.abilities)) {
      errors.push(`${path}.abilities: expected an array`);
    } else {
      f.abilities.forEach((ability, index) => {
        validateAbility(ability, `${path}.abilities[${index}]`, errors);
      });
    }
  }
}

/** Validates one card against the schema in design.md §3-§5, §16. */
export function validateCard(card: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isPlainObject(card)) {
    return { valid: false, errors: ["card: expected an object"] };
  }
  const c = card as Partial<Card>;

  if (!isNonEmptyString(c.id)) {
    errors.push("id: expected a non-empty string");
  }

  const rarity = oneOf(RARITIES, c.rarity) ? c.rarity : undefined;
  if (!oneOf(RARITIES, c.rarity)) {
    errors.push(`rarity: expected one of ${RARITIES.join(", ")}`);
  }

  if (!Array.isArray(c.faces) || c.faces.length < 1 || c.faces.length > 2) {
    errors.push("faces: expected an array of 1 or 2 faces");
  } else {
    c.faces.forEach((face, index) => {
      validateFace(face, `faces[${index}]`, rarity, errors);
    });
  }

  if (c.tutorialLocked !== undefined && typeof c.tutorialLocked !== "boolean") {
    errors.push("tutorialLocked: expected a boolean");
  }

  return { valid: errors.length === 0, errors };
}
