// The tarot registry (content plan §5.3): all 22, values verbatim.

import { describe, expect, it } from "vitest";

import { TAROT, TAROT_BY_ID } from "../../../src/booth/tarot.ts";
import { romanNumeral } from "../../../src/ui/tarotCard.ts";

describe("TAROT", () => {
  it("holds all 22 Major Arcana, numbered 0-21, with unique ids equal to their art ids", () => {
    expect(TAROT).toHaveLength(22);
    expect(TAROT.map((a) => a.number).sort((x, y) => x - y)).toEqual(Array.from({ length: 22 }, (_, i) => i));
    expect(new Set(TAROT.map((a) => a.id)).size).toBe(22);
    for (const a of TAROT) {
      expect(a.id.startsWith("tarot-")).toBe(true);
      expect(a.artId).toBe(a.id);
      expect(a.line.length).toBeGreaterThan(0);
    }
  });

  it("unlocks the Fool and the Magician on Nov 13 and everything else on the 1st of its month", () => {
    for (const a of TAROT) {
      if (a.id === "tarot-the-fool" || a.id === "tarot-the-magician") expect(a.unlocks).toEqual({ month: 11, day: 13 });
      else expect(a.unlocks.day).toBe(1);
    }
  });

  it("matches the table for the November pair and a few others", () => {
    expect(TAROT_BY_ID.get("tarot-the-fool")!.omen).toEqual({ kind: "checksNow", amount: 10 });
    expect(TAROT_BY_ID.get("tarot-the-magician")!.omen).toEqual({ kind: "tinkerFree" });
    expect(TAROT_BY_ID.get("tarot-the-hermit")!.omen).toEqual({ kind: "pawnbrokerDiscount", percent: 25 });
    expect(TAROT_BY_ID.get("tarot-the-tower")!.omen).toEqual({ kind: "wildcard" });
    expect(TAROT_BY_ID.get("tarot-wheel-of-fortune")!.line).toBe("Round it goes.");
    expect(TAROT_BY_ID.get("tarot-the-fool")!.line).toBe("A step off a cliff, and a little dog who thinks it's a fine idea. Go on, then.");
  });
});

describe("romanNumeral", () => {
  it("writes 0 to 21", () => {
    expect([0, 1, 4, 9, 14, 19, 21].map(romanNumeral)).toEqual(["0", "I", "IV", "IX", "XIV", "XIX", "XXI"]);
  });
});
