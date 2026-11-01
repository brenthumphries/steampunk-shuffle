// Omens: each kind applied once in its own code path, expiring at midnight.

import { describe, expect, it } from "vitest";

import { fuse, TINKER_FEE_CHECKS } from "../../../src/pub/tinkersBench.ts";
import { createMatch } from "../../../src/engine/matchEngine.ts";
import { starterDeck } from "../../../src/cards/data/decks/starterDeck.ts";
import { rollLostAndFound, rollLostAndFoundExtra } from "../../../src/pub/lostAndFound.ts";
import { PAWNBROKER_PRICES, pawnbrokerWindow } from "../../../src/pub/pawnbroker.ts";
import { resolveBarBet } from "../../../src/pub/barBet.ts";
import { OPPONENTS } from "../../../src/pub/opponents.ts";
import { defaultPubState, type PubState } from "../../../src/pub/pubState.ts";
import { defaultLedger } from "../../../src/save/ledger.ts";
import {
  applyWinOmen,
  barBetInsuranceAvailable,
  describeOmen,
  lostAndFoundExtraAvailable,
  lostAndFoundUpgradeActive,
  markOneShotUsed,
  OPENING_HAND_OMEN_BONUS,
  openingHandExtra,
  omenChipText,
  oneShotUsed,
  pawnbrokerPrice,
  resolveOmen,
  tinkerFee,
  todaysOmen,
  winOmenBonus,
} from "../../../src/booth/omens.ts";
import { TAROT, TAROT_BY_ID } from "../../../src/booth/tarot.ts";

const DAY = new Date(2026, 10, 14, 12, 0, 0);
const NEXT_DAY = new Date(2026, 10, 15, 0, 0, 1);
const LATE = new Date(2026, 10, 14, 23, 59, 59);

/** A save that drew `arcanaId` on DAY. */
function pubWith(arcanaId: string): PubState {
  const p = defaultPubState();
  return { ...p, collection: ["charlotte"], ledger: { ...defaultLedger(), firstLaunch: "2026-11-01", boothDraws: [{ arcanaId, date: "2026-11-14" }] } };
}

describe("todaysOmen", () => {
  it("is null before a draw, the drawn arcana's omen all day, and gone at midnight", () => {
    expect(todaysOmen(defaultPubState(), DAY)).toBeNull();
    const pub = pubWith("tarot-the-emperor");
    expect(todaysOmen(pub, DAY)!.omen).toEqual({ kind: "checksPerWin", amount: 3 });
    expect(todaysOmen(pub, LATE)).not.toBeNull();
    expect(todaysOmen(pub, NEXT_DAY)).toBeNull();
  });

  it("describes every omen kind", () => {
    for (const a of TAROT) expect(describeOmen(a.omen).length).toBeGreaterThan(0);
    expect(omenChipText(todaysOmen(pubWith("tarot-the-fool"), DAY)!)).toContain("The Fool");
  });
});

describe("wildcard", () => {
  it("resolves to a concrete omen from the other arcana, stable for a date", () => {
    const tower = TAROT_BY_ID.get("tarot-the-tower")!;
    const a = resolveOmen(tower.omen, DAY);
    expect(a.kind).not.toBe("wildcard");
    expect(resolveOmen(tower.omen, LATE)).toEqual(a);
    expect(TAROT.some((x) => JSON.stringify(x.omen) === JSON.stringify(a))).toBe(true);
    const kinds = new Set(Array.from({ length: 60 }, (_, i) => resolveOmen(tower.omen, new Date(2026, 10, 1 + i)).kind));
    expect(kinds.size).toBeGreaterThan(1);
  });
});

describe("checksPerWin and firstWinBonus", () => {
  it("checksPerWin pays on every win", () => {
    let pub = pubWith("tarot-the-emperor");
    for (let i = 0; i < 3; i++) {
      const r = applyWinOmen(pub, DAY);
      expect(r.bonus).toBe(3);
      pub = r.next;
    }
    expect(pub.checks).toBe(9);
    expect(pub.ledger.checksEarned).toBe(9);
  });

  it("firstWinBonus pays on the first win only, and again the next day", () => {
    const pub = pubWith("tarot-strength");
    expect(winOmenBonus(pub, DAY)).toBe(15);
    const r1 = applyWinOmen(pub, DAY);
    expect(r1.bonus).toBe(15);
    expect(applyWinOmen(r1.next, DAY).bonus).toBe(0);
    expect(oneShotUsed(r1.next, DAY, "firstWinBonus")).toBe(true);
    expect(oneShotUsed(r1.next, NEXT_DAY, "firstWinBonus")).toBe(false);
  });

  it("pays nothing with no omen, or after midnight", () => {
    expect(applyWinOmen(defaultPubState(), DAY).bonus).toBe(0);
    expect(winOmenBonus(pubWith("tarot-the-emperor"), NEXT_DAY)).toBe(0);
  });
});

describe("Lost & Found omens", () => {
  it("lostAndFoundUpgrade is active only on its day", () => {
    const pub = pubWith("tarot-the-lovers");
    expect(lostAndFoundUpgradeActive(pub, DAY)).toBe(true);
    expect(lostAndFoundUpgradeActive(pub, NEXT_DAY)).toBe(false);
  });

  it("an upgraded roll is never a lower rarity than the plain one", () => {
    const order = ["common", "uncommon", "rare"];
    for (let day = 1; day <= 40; day++) {
      const date = new Date(2026, 10, day);
      const plain = rollLostAndFound([], date);
      const up = rollLostAndFound([], date, { upgrade: true });
      expect(order.indexOf(up.rarity)).toBeGreaterThanOrEqual(order.indexOf(plain.rarity));
      expect(up.rarity).not.toBe("common");
    }
  });

  it("lostAndFoundExtra is offered once, and the extra is a different card", () => {
    const pub = pubWith("tarot-the-star");
    expect(lostAndFoundExtraAvailable(pub, DAY)).toBe(true);
    const used = markOneShotUsed(pub, DAY, "lostAndFoundExtra");
    expect(lostAndFoundExtraAvailable(used, DAY)).toBe(false);
    expect(lostAndFoundExtraAvailable(pub, NEXT_DAY)).toBe(false);
    const first = rollLostAndFound([], DAY);
    expect(rollLostAndFoundExtra([], DAY, first.id).id).not.toBe(first.id);
  });
});

describe("pawnbrokerDiscount", () => {
  it("takes 25% off each price, rounded to whole Checks, only on its day", () => {
    const pub = pubWith("tarot-the-hermit");
    expect(pawnbrokerPrice(pub, DAY, PAWNBROKER_PRICES.common)).toBe(11);
    expect(pawnbrokerPrice(pub, DAY, PAWNBROKER_PRICES.uncommon)).toBe(26);
    expect(pawnbrokerPrice(pub, DAY, PAWNBROKER_PRICES.rare)).toBe(68);
    expect(pawnbrokerPrice(pub, NEXT_DAY, PAWNBROKER_PRICES.rare)).toBe(90);
    for (const slot of pawnbrokerWindow(pub, DAY)) {
      expect(Number.isInteger(slot.price)).toBe(true);
      expect(slot.price).toBeLessThan(PAWNBROKER_PRICES[slot.card.rarity as "common" | "uncommon" | "rare"]);
    }
    for (const slot of pawnbrokerWindow(pub, NEXT_DAY)) expect(slot.price).toBe(PAWNBROKER_PRICES[slot.card.rarity as "common" | "uncommon" | "rare"]);
  });
});

describe("tinkerFree", () => {
  it("waives the fee for the first fusing only", () => {
    const pub = pubWith("tarot-the-magician");
    expect(tinkerFee(pub, DAY, TINKER_FEE_CHECKS)).toBe(0);
    expect(tinkerFee(markOneShotUsed(pub, DAY, "tinkerFree"), DAY, TINKER_FEE_CHECKS)).toBe(TINKER_FEE_CHECKS);
    expect(tinkerFee(pub, NEXT_DAY, TINKER_FEE_CHECKS)).toBe(TINKER_FEE_CHECKS);
  });

  it("fuse takes the waived fee into account", () => {
    const base: PubState = { ...defaultPubState(), checks: 5, collection: ["charlotte", "charlotte"] };
    expect(fuse(base, "charlotte", "foil", 1, 0).next.checks).toBe(5);
    expect(fuse({ ...base, checks: 20 }, "charlotte", "foil", 1).next.checks).toBe(20 - TINKER_FEE_CHECKS);
  });
});

describe("openingHandPlusOne", () => {
  it("gives one extra card to the first match of the day only", () => {
    const pub = pubWith("tarot-the-high-priestess");
    expect(openingHandExtra(pub, DAY)).toBe(OPENING_HAND_OMEN_BONUS);
    expect(openingHandExtra(markOneShotUsed(pub, DAY, "openingHandPlusOne"), DAY)).toBe(0);
    expect(openingHandExtra(pub, NEXT_DAY)).toBe(0);
  });

  it("createMatch deals the player 5 and the opponent 4 when asked", () => {
    const m = createMatch(starterDeck, starterDeck, { seed: 7, extraOpeningCards: { A: OPENING_HAND_OMEN_BONUS } });
    expect(m.players.A.hand).toHaveLength(5);
    expect(m.players.B.hand).toHaveLength(4);
    const plain = createMatch(starterDeck, starterDeck, { seed: 7 });
    expect(plain.players.A.hand).toHaveLength(4);
  });
});

describe("barBetInsurance", () => {
  const opponent = OPPONENTS.find((o) => o.betPool.length > 0)!;

  it("is available only until used, and only on its day", () => {
    const pub = pubWith("tarot-the-devil");
    expect(barBetInsuranceAvailable(pub, DAY)).toBe(true);
    expect(barBetInsuranceAvailable(markOneShotUsed(pub, DAY, "barBetInsurance"), DAY)).toBe(false);
    expect(barBetInsuranceAvailable(pub, NEXT_DAY)).toBe(false);
  });

  it("an insured loss keeps the stake in the collection; an uninsured one pawns it", () => {
    const pub = pubWith("tarot-the-devil");
    const insured = resolveBarBet(pub, "charlotte", opponent, "loss", 1, true).next;
    expect(insured.collection).toContain("charlotte");
    expect(insured.pawnedCards).toEqual([]);
    const plain = resolveBarBet(pub, "charlotte", opponent, "loss", 1).next;
    expect(plain.collection).not.toContain("charlotte");
    expect(plain.pawnedCards).toEqual(["charlotte"]);
  });
});
