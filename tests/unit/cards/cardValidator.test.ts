import { describe, expect, it } from "vitest";

import { validateCard } from "../../../src/cards/cardValidator.ts";
import type { Card } from "../../../src/cards/cardTypes.ts";
import {
  constableOnTheBeat,
  inspectorsWarrant,
  parlourGuest,
  policeWhistle,
  starterDeckCards,
} from "./fixtures/starterDeck.ts";
import { drJekyllMrHyde, robinOfLocksley, sherlockHolmes } from "./fixtures/legends.ts";

describe("validateCard — legal fixtures", () => {
  it.each(starterDeckCards)("accepts $faces.0.name (starter deck)", (card) => {
    expect(validateCard(card)).toEqual({ valid: true, errors: [] });
  });

  it("accepts a two-faced Transform card (Dr Jekyll / Mr Hyde)", () => {
    expect(validateCard(drJekyllMrHyde)).toEqual({ valid: true, errors: [] });
  });

  it("accepts a multi-effect On Play ability with reveal (Sherlock Holmes)", () => {
    expect(validateCard(sherlockHolmes)).toEqual({ valid: true, errors: [] });
  });

  it("accepts the reserved steal effect (Robin of Locksley)", () => {
    expect(validateCard(robinOfLocksley)).toEqual({ valid: true, errors: [] });
  });
});

describe("validateCard — illegal fixtures", () => {
  it("rejects a non-object", () => {
    expect(validateCard(null).valid).toBe(false);
    expect(validateCard("a card").valid).toBe(false);
    expect(validateCard(42).valid).toBe(false);
  });

  it("rejects a missing id", () => {
    const card = { ...structuredClone(constableOnTheBeat), id: "" };
    expect(validateCard(card).valid).toBe(false);
  });

  it("rejects an unknown rarity", () => {
    const card = { ...structuredClone(constableOnTheBeat), rarity: "mythic" };
    const result = validateCard(card);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.startsWith("rarity"))).toBe(true);
  });

  it("rejects zero faces", () => {
    const card = { ...structuredClone(constableOnTheBeat), faces: [] };
    expect(validateCard(card).valid).toBe(false);
  });

  it("rejects more than two faces", () => {
    const base = structuredClone(drJekyllMrHyde);
    const card = { ...base, faces: [...base.faces, base.faces[0]] };
    expect(validateCard(card).valid).toBe(false);
  });

  it("rejects an unknown card type", () => {
    const base = structuredClone(constableOnTheBeat);
    const card = { ...base, faces: [{ ...base.faces[0], type: "vehicle" }] };
    expect(validateCard(card).valid).toBe(false);
  });

  it("rejects a Character over the printed-point ceiling", () => {
    const card: Card = structuredClone(constableOnTheBeat);
    card.faces[0].points = 7;
    expect(validateCard(card).valid).toBe(false);
  });

  it("rejects a common Character below the printed-point floor", () => {
    const card: Card = structuredClone(constableOnTheBeat);
    card.faces[0].points = 0;
    expect(validateCard(card).valid).toBe(false);
  });

  it("rejects a legendary Character below the legendary point floor (2)", () => {
    // Legendary Characters print 2-6 (design.md §7.4), a point tighter than
    // the ordinary Character floor of 1 that a common/uncommon/rare uses.
    const card: Card = structuredClone(drJekyllMrHyde);
    card.faces[0].points = 1;
    expect(validateCard(card).valid).toBe(false);
  });

  it("rejects a Gadget over its printed-point ceiling", () => {
    const card: Card = structuredClone(policeWhistle);
    card.faces[0].points = 3;
    expect(validateCard(card).valid).toBe(false);
  });

  it("rejects a Scheme with nonzero points", () => {
    const card: Card = structuredClone(inspectorsWarrant);
    card.faces[0].points = 1;
    expect(validateCard(card).valid).toBe(false);
  });

  it("rejects a Friend keyword with a non-positive amount", () => {
    const card: Card = structuredClone(parlourGuest);
    card.faces[0].keywords = { friend: 0 };
    expect(validateCard(card).valid).toBe(false);
  });

  it("rejects an ability with no effects", () => {
    const card: Card = structuredClone(policeWhistle);
    card.faces[0].abilities = [{ trigger: "onPlay", effects: [] }];
    expect(validateCard(card).valid).toBe(false);
  });

  it("rejects an ability with an unknown trigger", () => {
    const base = structuredClone(policeWhistle);
    const card = {
      ...base,
      faces: [
        {
          ...base.faces[0],
          abilities: [{ trigger: "whenever", effects: [{ effect: "draw", amount: 1 }] }],
        },
      ],
    };
    expect(validateCard(card).valid).toBe(false);
  });

  it("rejects an effect with an unknown kind", () => {
    const base = structuredClone(policeWhistle);
    const card = {
      ...base,
      faces: [
        {
          ...base.faces[0],
          abilities: [{ trigger: "onPlay", effects: [{ effect: "teleport" }] }],
        },
      ],
    };
    expect(validateCard(card).valid).toBe(false);
  });

  it("rejects a draw effect with a non-positive amount", () => {
    const card: Card = structuredClone(policeWhistle);
    card.faces[0].abilities = [{ trigger: "onPlay", effects: [{ effect: "draw", amount: 0 }] }];
    expect(validateCard(card).valid).toBe(false);
  });

  it("rejects a target with an invalid side", () => {
    const base = structuredClone(inspectorsWarrant);
    const card = {
      ...base,
      faces: [
        {
          ...base.faces[0],
          abilities: [
            { trigger: "onPlay", effects: [{ effect: "flip", target: { side: "everyone" } }] },
          ],
        },
      ],
    };
    expect(validateCard(card).valid).toBe(false);
  });

  it("rejects a non-boolean tutorialLocked", () => {
    const card = { ...structuredClone(constableOnTheBeat), tutorialLocked: "yes" };
    expect(validateCard(card).valid).toBe(false);
  });

  it("rejects a missing flavor", () => {
    const card: Card = structuredClone(constableOnTheBeat);
    // @ts-expect-error deliberately breaking the fixture
    delete card.faces[0].flavor;
    expect(validateCard(card).valid).toBe(false);
  });
});
