// Opponent unlock thresholds and the "legends in town" rotation (plan step
// 2.3, design.md §12.1/§12.3).

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  isOpponentInTown,
  legendsInTown,
  LEGEND_IDS,
  OPPONENTS,
  OPPONENTS_BY_ID,
  patronLine,
  SIR_CHARLES,
  tonightsPatrons,
} from "../../../src/pub/opponents.ts";
import { HALLOWEEN } from "../../../src/events/seasonalEvents.ts";
import { WIN_CHECKS } from "../../../src/pub/pubState.ts";
import { ACQUIRABLE_CARDS_BY_ID } from "../../../src/pub/acquirableCards.ts";

const A_DAY = new Date(2026, 8, 11);

describe("tonightsPatrons", () => {
  it("at 0 wins shows Sir Charles and all four Regulars, nothing else", () => {
    const names = tonightsPatrons(0, A_DAY).map((o) => o.id);
    expect(names).toEqual(expect.arrayContaining(["sir-charles", "mudd", "nell-ashby", "reg-farrow", "prudence-hollis"]));
    expect(names).toHaveLength(5);
  });

  it("at 3 wins adds Bucket only, not the other three Seasoned", () => {
    const names = tonightsPatrons(3, A_DAY).map((o) => o.id);
    expect(names).toContain("bucket");
    expect(names).not.toContain("lovelace");
    expect(names).not.toContain("adler");
    expect(names).not.toContain("dickens");
  });

  it("at 5 wins adds all four Seasoned", () => {
    const names = tonightsPatrons(5, A_DAY).map((o) => o.id);
    for (const id of ["bucket", "lovelace", "adler", "dickens"]) expect(names).toContain(id);
  });

  it("below 10 wins shows no Legends at all", () => {
    const names = tonightsPatrons(9, A_DAY).map((o) => o.id);
    for (const id of LEGEND_IDS) expect(names).not.toContain(id);
  });

  it("at 10+ wins shows exactly today's two Legends", () => {
    const names = tonightsPatrons(10, A_DAY).map((o) => o.id);
    const legendsShown = names.filter((id) => (LEGEND_IDS as string[]).includes(id));
    expect(legendsShown).toEqual([...legendsInTown(A_DAY)]);
    expect(legendsShown).toHaveLength(2);
  });
});

describe("legendsInTown", () => {
  it("is deterministic for a given date", () => {
    expect(legendsInTown(A_DAY)).toEqual(legendsInTown(new Date(2026, 8, 11, 23, 59)));
  });

  it("every legend appears at least once across any 3 consecutive days", () => {
    for (let start = 0; start < 10; start++) {
      const seen = new Set<string>();
      for (let offset = 0; offset < 3; offset++) {
        const date = new Date(2026, 0, 1 + start + offset);
        for (const id of legendsInTown(date)) seen.add(id);
      }
      expect([...seen].sort()).toEqual([...LEGEND_IDS].sort());
    }
  });
});

describe("isOpponentInTown", () => {
  it("gates a Legend on both the win threshold and the daily rotation", () => {
    const holmes = OPPONENTS_BY_ID.get("holmes")!;
    expect(isOpponentInTown(holmes, 10, A_DAY)).toBe(legendsInTown(A_DAY).includes("holmes"));
    expect(isOpponentInTown(holmes, 9, A_DAY)).toBe(false);
  });

  it("never gates Regulars or the house on the daily rotation", () => {
    const mudd = OPPONENTS_BY_ID.get("mudd")!;
    expect(isOpponentInTown(mudd, 0, A_DAY)).toBe(true);
  });
});

describe("OPPONENTS registry", () => {
  it("has a unique id for every opponent", () => {
    const ids = OPPONENTS.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every non-house opponent a reward card id, except a tournament-only one whose card is the tournament's prize", () => {
    for (const opponent of OPPONENTS) {
      if (opponent.tier === "house" || opponent.tournamentOnly) {
        expect(opponent.rewardCardId, opponent.id).toBeNull();
      } else {
        expect(opponent.rewardCardId, opponent.id).not.toBeNull();
      }
    }
  });
});

describe("Opponent.betPool (plan step 2.5, design.md §11.5)", () => {
  it("gives Sir Charles no bet pool", () => {
    expect(OPPONENTS_BY_ID.get("sir-charles")!.betPool).toEqual([]);
  });

  it("gives every real opponent 3-4 real, non-legendary bet-pool cards", () => {
    for (const opponent of OPPONENTS) {
      if (opponent.tier === "house") continue;
      expect(opponent.betPool.length).toBeGreaterThanOrEqual(3);
      expect(opponent.betPool.length).toBeLessThanOrEqual(4);
      for (const cardId of opponent.betPool) {
        const card = ACQUIRABLE_CARDS_BY_ID.get(cardId);
        expect(card, `${opponent.id}'s bet pool references unknown card "${cardId}"`).toBeDefined();
        expect(card!.rarity).not.toBe("legendary");
      }
    }
  });

  it("gives every Seasoned/Legend opponent exactly one rare in their bet pool", () => {
    for (const opponent of OPPONENTS) {
      if (opponent.tier !== "seasoned" && opponent.tier !== "legend") continue;
      const rares = opponent.betPool.filter((id) => ACQUIRABLE_CARDS_BY_ID.get(id)!.rarity === "rare");
      expect(rares, `${opponent.id}`).toHaveLength(1);
    }
  });
});

// Plan step 3.2: a real prompt-sheet asset can be ingested into
// public/art/ without ever being wired into Opponent.portraitArtId — that
// exact gap (5 legends' portraits sat ingested and unused) is what this
// pins against recurring.
describe("Opponent.portraitArtId (plan step 3.2)", () => {
  const manifest: Record<string, unknown> = JSON.parse(readFileSync(resolve(process.cwd(), "public/art/manifest.json"), "utf-8"));

  it("points every set portraitArtId at a real ingested asset", () => {
    for (const opponent of OPPONENTS) {
      if (opponent.portraitArtId === undefined) continue;
      expect(manifest, `${opponent.id}'s portraitArtId "${opponent.portraitArtId}" isn't in public/art/manifest.json`).toHaveProperty(opponent.portraitArtId);
    }
  });

  it("gives every visitor's reward card real ingested art, not a broken image", () => {
    for (const opponent of OPPONENTS.filter((o) => o.tier === "visitor")) {
      const artId = ACQUIRABLE_CARDS_BY_ID.get(opponent.rewardCardId!)!.faces[0].artId;
      expect(manifest, `${opponent.id}'s reward card art "${artId}" isn't in public/art/manifest.json`).toHaveProperty(artId);
    }
  });

  it("gives every opponent a portrait, now that all six legends and Sir Charles have one ingested", () => {
    for (const opponent of OPPONENTS) {
      expect(opponent.portraitArtId, opponent.id).toBeDefined();
    }
  });
});

// Seasonal visitors (seasonal-events-plan.md §2 rule 2, §5).
describe("seasonal visitors in Tonight's Patrons", () => {
  const SEP_30 = new Date(2026, 8, 30);
  const OCT_1 = new Date(2026, 9, 1);
  const OCT_31 = new Date(2026, 9, 31);
  const NOV_1 = new Date(2026, 10, 1);
  const visitorIds = () => OPPONENTS.filter((o) => o.tier === "visitor").map((o) => o.id);

  it("shows no visitor before the event, on Sep 30", () => {
    const names = tonightsPatrons(30, SEP_30).map((o) => o.id);
    for (const id of visitorIds()) expect(names).not.toContain(id);
  });

  it("shows Wave 1's two visitors on Oct 1 to a player with 3+ wins", () => {
    const names = tonightsPatrons(3, OCT_1).map((o) => o.id);
    expect(names).toContain("mr-griffin");
    expect(names).toContain("clockwork-pharaoh");
  });

  it("hides visitors below 3 wins even while the event is live", () => {
    const names = tonightsPatrons(2, OCT_1).map((o) => o.id);
    for (const id of visitorIds()) expect(names).not.toContain(id);
  });

  it("keeps them through Oct 31 and drops them on Nov 1", () => {
    expect(tonightsPatrons(3, OCT_31).map((o) => o.id)).toContain("mr-griffin");
    const after = tonightsPatrons(30, NOV_1).map((o) => o.id);
    for (const id of visitorIds()) expect(after).not.toContain(id);
  });

  it("does not disturb the year-round roster or the legends rotation", () => {
    const withEvent = tonightsPatrons(10, OCT_1).map((o) => o.id).filter((id) => !visitorIds().includes(id));
    const without = tonightsPatrons(10, SEP_30).map((o) => o.id);
    expect(withEvent).toHaveLength(without.length);
    expect(withEvent.filter((id) => (LEGEND_IDS as string[]).includes(id))).toHaveLength(2);
  });

  it("is exempt from the legends-in-town rotation and unlock ladder", () => {
    const griffin = OPPONENTS_BY_ID.get("mr-griffin")!;
    expect(griffin.tier).toBe("visitor");
    expect(LEGEND_IDS).not.toContain(griffin.id);
    expect(isOpponentInTown(griffin, 3, OCT_1)).toBe(true);
  });

  it("plays the seasoned dial and pays what a Seasoned opponent pays", () => {
    for (const opponent of OPPONENTS.filter((o) => o.tier === "visitor")) {
      expect(opponent.difficulty, opponent.id).toBe("seasoned");
    }
    expect(WIN_CHECKS.visitor).toBe(WIN_CHECKS.seasoned);
  });

  it("shows all five visitors from Oct 15, and only Wave 1's two before that", () => {
    const oct14 = tonightsPatrons(3, new Date(2026, 9, 14)).map((o) => o.id);
    expect(oct14).toEqual(expect.arrayContaining(["mr-griffin", "clockwork-pharaoh"]));
    for (const id of ["carpathian-count", "hampstead-wolf", "galvanic-creature"]) expect(oct14).not.toContain(id);
    const oct15 = tonightsPatrons(3, new Date(2026, 9, 15)).map((o) => o.id);
    for (const id of ["mr-griffin", "clockwork-pharaoh", "carpathian-count", "hampstead-wolf", "galvanic-creature"]) expect(oct15).toContain(id);
  });

  it("registers every visitor the event lists, and no opponent the event doesn't", () => {
    const listed = HALLOWEEN.visitors.map((v) => v.opponentId).filter((id) => OPPONENTS_BY_ID.has(id));
    expect(listed.sort()).toEqual(visitorIds().sort());
  });
});

describe("patronLine", () => {
  const SEP_30 = new Date(2026, 8, 30);
  const OCT = (day: number) => new Date(2026, 9, day);

  it("is an opponent's own line year-round and outside any event", () => {
    const mudd = OPPONENTS_BY_ID.get("mudd")!;
    expect(patronLine(mudd, SEP_30)).toBe(mudd.line);
    expect(patronLine(mudd, OCT(15))).toBe(mudd.line);
  });

  it("has Mary Shelley say 'Oh. You've met him.' once the Galvanic Creature has arrived, and only then", () => {
    const shelley = OPPONENTS_BY_ID.get("shelley")!;
    expect(patronLine(shelley, OCT(14))).toBe(shelley.line);
    expect(patronLine(shelley, OCT(15))).toBe("Oh. You've met him.");
    expect(patronLine(shelley, new Date(2026, 10, 1))).toBe(shelley.line);
  });

  it("is only Sir Charles's own line outside an event", () => {
    expect(patronLine(SIR_CHARLES, SEP_30)).toBe(SIR_CHARLES.line);
  });

  it("rotates Sir Charles through his own line plus the event's, one per day, while live", () => {
    const pool = new Set([SIR_CHARLES.line, ...HALLOWEEN.dressing.sirCharlesLines]);
    const seen = new Set<string>();
    for (let day = 1; day <= 31; day++) {
      const line = patronLine(SIR_CHARLES, OCT(day));
      expect(pool.has(line)).toBe(true);
      seen.add(line);
    }
    expect(seen.size).toBe(pool.size);
    expect(patronLine(SIR_CHARLES, OCT(9))).toBe(patronLine(SIR_CHARLES, new Date(2026, 9, 9, 23, 30)));
  });
});
