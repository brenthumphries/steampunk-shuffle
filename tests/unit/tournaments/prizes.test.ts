// Tournament prize resolution (plan step 2.4, design.md §10).

import { describe, expect, it } from "vitest";

import { ALL_CARDS } from "../../../src/cards/data/index.ts";
import { defaultPubState, type PubState } from "../../../src/pub/pubState.ts";
import { TOURNAMENTS_BY_ID } from "../../../src/tournaments/tournaments.ts";
import { resolvePrize } from "../../../src/tournaments/prizes.ts";

const knockout = TOURNAMENTS_BY_ID.get("tuesday-knockout")!;
const peelers = TOURNAMENTS_BY_ID.get("peelers-cup")!;
const reichenbach = TOURNAMENTS_BY_ID.get("reichenbach-open")!;
const invitational = TOURNAMENTS_BY_ID.get("birthday-invitational")!;

const LEGENDARY_SIGNATURE_IDS = ["sherlock-holmes", "professor-moriarty", "dame-agatha", "hercule-poirot", "dr-jekyll-mr-hyde", "mary-shelley"];

describe("resolvePrize", () => {
  it("The Tuesday Knockout pays a random uncommon", () => {
    const prize = resolvePrize(knockout, ALL_CARDS, defaultPubState(), 1);
    expect(prize.checks).toBe(knockout.prizeChecks);
    const card = ALL_CARDS.find((c) => c.id === prize.cardId);
    expect(card?.rarity).toBe("uncommon");
  });

  it("The Peelers' Cup pays a random rare", () => {
    const prize = resolvePrize(peelers, ALL_CARDS, defaultPubState(), 2);
    const card = ALL_CARDS.find((c) => c.id === prize.cardId);
    expect(card?.rarity).toBe("rare");
  });

  it("The Reichenbach Open pays a random legendary the player doesn't own, excluding The Landlady", () => {
    const prize = resolvePrize(reichenbach, ALL_CARDS, defaultPubState(), 3);
    expect(prize.cardId).not.toBe("the-landlady");
    const card = ALL_CARDS.find((c) => c.id === prize.cardId);
    expect(card?.rarity).toBe("legendary");
  });

  it("pays 300 Checks instead of a card once every legendary is already owned", () => {
    const ownsAll: PubState = { ...defaultPubState(), collection: LEGENDARY_SIGNATURE_IDS };
    const prize = resolvePrize(reichenbach, ALL_CARDS, ownsAll, 4);
    expect(prize.cardId).toBeNull();
    expect(prize.checks).toBe(reichenbach.ownAllBonusChecks);
  });

  it("The Birthday Invitational always pays the fixed Landlady card", () => {
    const prize = resolvePrize(invitational, ALL_CARDS, defaultPubState(), 5);
    expect(prize.cardId).toBe("the-landlady");
    expect(prize.checks).toBe(invitational.prizeChecks);
  });
});
