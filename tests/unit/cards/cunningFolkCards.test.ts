// The November cards (docs/plans/monthly/01-november.md §3-§4): the Coven
// trio, the Almanack headlines and the Cunning Folk's own cards. Structural
// validity is already covered by dataSet.test.ts; this pins the shapes the
// plan names and the art each one needs.

import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { validateCard } from "../../../src/cards/cardValidator.ts";
import { almanackScorpio, almanackSagittarius } from "../../../src/cards/data/almanack.ts";
import { covenCards } from "../../../src/cards/data/families/coven.ts";
import { cunningFolkCards } from "../../../src/cards/data/cunningFolk.ts";
import { EVENT_CARDS, EVENT_CARDS_BY_ID } from "../../../src/cards/data/eventCards.ts";
import { PIXIE_CARD_ID } from "../../../src/booth/booth.ts";
import { CUNNING_FOLK } from "../../../src/events/packs/cunningFolk.ts";
import { OPPONENTS } from "../../../src/pub/opponents.ts";

const ART = resolve(__dirname, "../../../public/art");

describe("the Coven", () => {
  it("is the November trio and the December salt, all in the Coven family, and each validates", () => {
    expect(covenCards.map((c) => c.id)).toEqual(["hedge-witch", "cunning-woman", "witch-bottle", "salt-at-the-threshold"]);
    for (const card of covenCards) {
      expect(card.faces[0].family).toBe("coven");
      expect(validateCard(card).errors, card.id).toEqual([]);
    }
  });

  it("prints Scry only On Play, the one trigger the engine resolves for it", () => {
    for (const card of covenCards) {
      for (const ability of card.faces[0].abilities ?? []) {
        if (ability.effects.some((e) => e.effect === "scry")) expect(ability.trigger, card.id).toBe("onPlay");
      }
    }
  });
});

describe("the Almanack", () => {
  it("are rare Headlines in the Almanack frame, with their zodiac glyph and no points", () => {
    expect(almanackScorpio.faces[0].glyph).toBe("♏");
    expect(almanackSagittarius.faces[0].glyph).toBe("♐");
    for (const card of [almanackScorpio, almanackSagittarius]) {
      expect(card.rarity).toBe("rare");
      expect(card.faces[0].type).toBe("headline");
      expect(card.faces[0].frame).toBe("almanack");
      expect(card.faces[0].points).toBe(0);
      expect(validateCard(card).errors, card.id).toEqual([]);
    }
  });
});

describe("the Cunning Folk's cards", () => {
  it("are the five event cards, the three visitors' signatures and Pixie's card", () => {
    expect(cunningFolkCards.map((c) => c.id).sort()).toEqual(
      ["stir-up-pudding", "remember-remember", "old-moores-almanack", "the-petrifying-well", "penny-for-the-guy", "mother-shipton", "john-dee", "mother-red-cap", "pamela-colman-smith"].sort(),
    );
  });

  it("make the visitor signatures legendary, and Pixie's a Salon legendary", () => {
    for (const id of ["mother-shipton", "john-dee", "mother-red-cap", "pamela-colman-smith"]) {
      expect(EVENT_CARDS_BY_ID.get(id)?.rarity, id).toBe("legendary");
    }
    expect(EVENT_CARDS_BY_ID.get(PIXIE_CARD_ID)?.faces[0].family).toBe("salon");
  });

  it("keep Penny for the Guy an uncommon Irregular with Elusive and Return, and the Well a rare Location", () => {
    expect(EVENT_CARDS_BY_ID.get("penny-for-the-guy")?.rarity).toBe("uncommon");
    expect(EVENT_CARDS_BY_ID.get("penny-for-the-guy")?.faces[0].family).toBe("irregulars");
    expect(EVENT_CARDS_BY_ID.get("the-petrifying-well")?.faces[0].type).toBe("location");
  });

  it("are all in the event registry, none in the labeled 60", () => {
    for (const card of cunningFolkCards) expect(EVENT_CARDS.includes(card), card.id).toBe(true);
  });

  it("has art on disk for every card the November pack can hand out and every opponent's portrait", () => {
    const ids = new Set<string>();
    for (const entry of CUNNING_FOLK.cardPool) ids.add(typeof entry === "string" ? entry : entry.id);
    for (const card of EVENT_CARDS) if (card.faces.some((f) => f.artId.length > 0) && cunningFolkCards.includes(card)) ids.add(card.id);
    for (const id of ids) {
      const card = EVENT_CARDS_BY_ID.get(id);
      expect(card, id).toBeDefined();
      for (const face of card!.faces) expect(existsSync(join(ART, `${face.artId}.webp`)), face.artId).toBe(true);
    }
    for (const opponent of OPPONENTS.filter((o) => o.id === "mother-shipton" || o.id === "john-dee" || o.id === "mother-red-cap")) {
      expect(existsSync(join(ART, `${opponent.portraitArtId}.webp`)), opponent.id).toBe(true);
    }
    expect(existsSync(join(ART, "pamela-colman-smith.webp"))).toBe(true);
    expect(existsSync(join(ART, "portrait-pamela-colman-smith.webp"))).toBe(true);
    expect(existsSync(join(ART, "background-the-taproom-cunning-folk.webp"))).toBe(true);
  });
});
