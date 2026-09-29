// The All Hallows' Wake (seasonal-events-plan.md §3.3, §5): a seasonal
// tournament that opens Oct 22 - Oct 31 with 3+ wins, seats the five
// visitors + Spring-Heeled Jack + one Seasoned, starts every match with The
// Witching Hour in the shared slot, and pays Spring-Heeled Jack + 150 Checks.

import { beforeEach, describe, expect, it } from "vitest";

import { ALL_CARDS } from "../../../src/cards/data/index.ts";
import { createMatch } from "../../../src/engine/matchEngine.ts";
import { starterDeck } from "../../../src/cards/data/decks/starterDeck.ts";
import { HALLOWEEN } from "../../../src/events/seasonalEvents.ts";
import { ACQUIRABLE_CARDS_BY_ID } from "../../../src/pub/acquirableCards.ts";
import { OPPONENTS, OPPONENTS_BY_ID, tonightsPatrons } from "../../../src/pub/opponents.ts";
import { applyTournamentPayout, defaultPubState, recordTournamentMatchResult } from "../../../src/pub/pubState.ts";
import { advanceBracket, createBracket, currentMatchIndex } from "../../../src/tournaments/bracket.ts";
import { resolveHouseLocation } from "../../../src/tournaments/houseLocation.ts";
import { resolvePrize } from "../../../src/tournaments/prizes.ts";
import { isTournamentListed, TOURNAMENTS, TOURNAMENTS_BY_ID } from "../../../src/tournaments/tournaments.ts";
import { loadTournamentState, saveTournamentState, startBracket, defaultTournamentState } from "../../../src/tournaments/tournamentState.ts";

const wake = TOURNAMENTS_BY_ID.get("all-hallows-wake")!;
const day = (month: number, date: number) => new Date(2026, month - 1, date);

const VISITOR_IDS = ["mr-griffin", "clockwork-pharaoh", "carpathian-count", "hampstead-wolf", "galvanic-creature"];
const FIXED_IDS = [...VISITOR_IDS, "spring-heeled-jack"];

beforeEach(() => {
  localStorage.clear();
});

describe("registry", () => {
  it("is registered inside the Hallowe'en event", () => {
    expect(wake).toBeDefined();
    expect(wake.eventId).toBe(HALLOWEEN.id);
    expect(HALLOWEEN.tournaments).toContain(wake.id);
  });

  it("has the economy the plan sets: 13 to enter, 13 consolation, 150 Checks + Spring-Heeled Jack", () => {
    expect(wake.entryChecks).toBe(13);
    expect(wake.consolationChecks).toBe(13);
    expect(wake.prizeChecks).toBe(150);
    expect(wake.prizeCard).toEqual({ kind: "fixed", cardId: "spring-heeled-jack" });
    expect(ACQUIRABLE_CARDS_BY_ID.get("spring-heeled-jack")?.rarity).toBe("legendary");
  });

  it("accepts any legal deck", () => {
    expect(wake.checkEntryDeck(starterDeck).valid).toBe(true);
  });
});

describe("unlock window (Oct 22 - Oct 31, 3+ wins)", () => {
  it("is locked before Oct 22, open Oct 22 through Oct 31, locked again from Nov 1", () => {
    expect(wake.isUnlocked(10, false, day(9, 30))).toBe(false);
    expect(wake.isUnlocked(10, false, day(10, 1))).toBe(false);
    expect(wake.isUnlocked(10, false, day(10, 15))).toBe(false);
    expect(wake.isUnlocked(10, false, day(10, 21))).toBe(false);
    expect(wake.isUnlocked(10, false, day(10, 22))).toBe(true);
    expect(wake.isUnlocked(10, false, day(10, 31))).toBe(true);
    expect(wake.isUnlocked(10, false, day(11, 1))).toBe(false);
  });

  it("needs 3 wins even inside the window", () => {
    expect(wake.isUnlocked(2, false, day(10, 25))).toBe(false);
    expect(wake.isUnlocked(3, false, day(10, 25))).toBe(true);
  });

  it("recurs every year", () => {
    expect(wake.isUnlocked(3, false, new Date(2027, 9, 25))).toBe(true);
  });
});

describe("listing (isTournamentListed)", () => {
  it("lists it only while Hallowe'en is live", () => {
    expect(isTournamentListed(wake, false, day(9, 30), false)).toBe(false);
    expect(isTournamentListed(wake, false, day(10, 1), false)).toBe(true);
    expect(isTournamentListed(wake, false, day(10, 31), false)).toBe(true);
    expect(isTournamentListed(wake, false, day(11, 1), false)).toBe(false);
  });

  it("keeps listing it after the window closes if a bracket of it is still in progress, so it can be resumed", () => {
    expect(isTournamentListed(wake, false, day(11, 1), true)).toBe(true);
  });

  it("leaves the year-round tournaments and the Invitational's surprise unchanged", () => {
    const knockout = TOURNAMENTS_BY_ID.get("tuesday-knockout")!;
    const invitational = TOURNAMENTS_BY_ID.get("birthday-invitational")!;
    expect(isTournamentListed(knockout, false, day(6, 1), false)).toBe(true);
    expect(isTournamentListed(invitational, false, day(10, 15), false)).toBe(false);
    expect(isTournamentListed(invitational, true, day(10, 30), false)).toBe(true);
  });

  it("lists every tournament in some month of the year", () => {
    for (const tournament of TOURNAMENTS) {
      const listedSomewhere = Array.from({ length: 12 }, (_, m) => isTournamentListed(tournament, true, new Date(2026, m, 15), false)).some(Boolean);
      expect(listedSomewhere, tournament.id).toBe(true);
    }
  });
});

describe("field", () => {
  it("draws from the five visitors, Spring-Heeled Jack and the four Seasoned opponents (10)", () => {
    const pool = wake.eligiblePool(OPPONENTS);
    expect(pool).toHaveLength(10);
    for (const id of FIXED_IDS) expect(pool.some((o) => o.id === id), id).toBe(true);
    expect(pool.filter((o) => o.tier === "seasoned")).toHaveLength(4);
  });

  it("always seats the five visitors and Spring-Heeled Jack", () => {
    const fixed = wake.fixedSeats!(wake.eligiblePool(OPPONENTS));
    expect(fixed.map((o) => o.id).sort()).toEqual([...FIXED_IDS].sort());
  });

  it("keeps Spring-Heeled Jack out of every other tournament and out of Tonight's Patrons", () => {
    for (const tournament of TOURNAMENTS) {
      if (tournament.id === "all-hallows-wake") continue;
      expect(tournament.eligiblePool(OPPONENTS).some((o) => o.id === "spring-heeled-jack"), tournament.id).toBe(false);
    }
    for (const wins of [0, 3, 10, 40]) {
      for (const date of [day(10, 15), day(10, 25), day(3, 3)]) {
        expect(tonightsPatrons(wins, date).some((o) => o.id === "spring-heeled-jack")).toBe(false);
      }
    }
  });

  it("leaves the other tournaments' field sizes as they were", () => {
    expect(TOURNAMENTS_BY_ID.get("tuesday-knockout")!.eligiblePool(OPPONENTS)).toHaveLength(8);
    expect(TOURNAMENTS_BY_ID.get("reichenbach-open")!.eligiblePool(OPPONENTS)).toHaveLength(10);
    expect(TOURNAMENTS_BY_ID.get("birthday-invitational")!.eligiblePool(OPPONENTS)).toHaveLength(7);
  });

  it("makes Spring-Heeled Jack a legend-dial, tournament-only opponent with no separate first-win reward", () => {
    const jack = OPPONENTS_BY_ID.get("spring-heeled-jack")!;
    expect(jack.tier).toBe("legend");
    expect(jack.difficulty).toBe("legend");
    expect(jack.tournamentOnly).toBe(true);
    expect(jack.rewardCardId).toBeNull();
  });

  it("seats all six fixed opponents plus exactly one Seasoned in a generated bracket, and shuffles who the player meets first", { timeout: 240_000 }, () => {
    const pool = wake.eligiblePool(OPPONENTS);
    const firstOpponents = new Set<string>();
    for (const seed of [11, 202, 3003]) {
      const bracket = createBracket(wake, pool, seed);
      expect(bracket.tournamentId).toBe("all-hallows-wake");
      expect(bracket.seatOpponentIds).toHaveLength(7);
      expect(new Set(bracket.seatOpponentIds).size).toBe(7);
      for (const id of FIXED_IDS) expect(bracket.seatOpponentIds, `seed ${seed}`).toContain(id);
      const extras = bracket.seatOpponentIds.filter((id) => !FIXED_IDS.includes(id));
      expect(extras).toHaveLength(1);
      expect(OPPONENTS_BY_ID.get(extras[0]!)?.tier).toBe("seasoned");
      firstOpponents.add(bracket.playerMatches[0]!.opponentId);
    }
    expect(firstOpponents.size).toBeGreaterThan(1);
  });
});

describe("house Location", () => {
  it("resolves to The Witching Hour", () => {
    expect(wake.houseLocationId).toBe("the-witching-hour");
    expect(resolveHouseLocation(wake)?.id).toBe("the-witching-hour");
  });

  it("puts it in the shared slot at the start of every match in the tournament", () => {
    const houseLocation = resolveHouseLocation(wake);
    for (const opponent of OPPONENTS.filter((o) => wake.eligiblePool(OPPONENTS).includes(o))) {
      const state = createMatch(starterDeck, opponent.deck, { seed: 5, initialLocation: houseLocation });
      expect(state.location?.card.id, opponent.id).toBe("the-witching-hour");
    }
  });

  it("is absent from tournaments that don't name one", () => {
    expect(resolveHouseLocation(TOURNAMENTS_BY_ID.get("tuesday-knockout")!)).toBeUndefined();
  });

  it("resolves nothing for an id that isn't a Location", () => {
    expect(resolveHouseLocation({ ...wake, houseLocationId: "mr-griffin" })).toBeUndefined();
    expect(resolveHouseLocation({ ...wake, houseLocationId: "no-such-card" })).toBeUndefined();
  });
});

describe("prize and payout", () => {
  it("pays Spring-Heeled Jack and 150 Checks, and puts him in the collection", () => {
    const prize = resolvePrize(wake, ALL_CARDS, defaultPubState(), 1);
    expect(prize).toEqual({ checks: 150, cardId: "spring-heeled-jack" });
    const paid = applyTournamentPayout(defaultPubState(), prize.checks, prize.cardId);
    expect(paid.checks).toBe(150);
    expect(paid.collection).toEqual(["spring-heeled-jack"]);
  });

  it("pays the 13-Check consolation with no card", () => {
    const paid = applyTournamentPayout(defaultPubState(), wake.consolationChecks, null);
    expect(paid.checks).toBe(13);
    expect(paid.collection).toEqual([]);
  });

  it("pays no first-win reward for beating Spring-Heeled Jack in the bracket", () => {
    const jack = OPPONENTS_BY_ID.get("spring-heeled-jack")!;
    const after = recordTournamentMatchResult(defaultPubState(), jack.id, jack.tier, jack.rewardCardId, "win");
    expect(after.collection).toEqual([]);
    expect(after.totalWins).toBe(1);
  });

  it("still pays a first-win reward for beating a visitor in the bracket", () => {
    const griffin = OPPONENTS_BY_ID.get("mr-griffin")!;
    const after = recordTournamentMatchResult(defaultPubState(), griffin.id, griffin.tier, griffin.rewardCardId, "win");
    expect(after.collection).toEqual(["mr-griffin"]);
  });
});

describe("a bracket in progress when the window closes", () => {
  const bracket = {
    tournamentId: "all-hallows-wake" as const,
    seatOpponentIds: [...FIXED_IDS, "bucket"],
    playerMatches: [
      { opponentId: "mr-griffin", outcome: "pending" as const },
      { opponentId: "hampstead-wolf", outcome: "pending" as const },
      { opponentId: "spring-heeled-jack", outcome: "pending" as const },
    ] as [
      { opponentId: string; outcome: "pending" | "won" | "lost" },
      { opponentId: string; outcome: "pending" | "won" | "lost" },
      { opponentId: string; outcome: "pending" | "won" | "lost" },
    ],
    status: "in-progress" as const,
  };

  it("can't be entered on Nov 1, but the tournament is still listed so the bracket can be resumed", () => {
    expect(wake.isUnlocked(30, false, day(11, 1))).toBe(false);
    expect(isTournamentListed(wake, false, day(11, 1), true)).toBe(true);
  });

  it("finishes on Nov 1 exactly as it would have on Oct 31: advancing takes no date, and the prize is still paid", () => {
    let progressed = bracket as Parameters<typeof advanceBracket>[0];
    for (let i = 0; i < 3; i++) {
      expect(currentMatchIndex(progressed)).toBe(i);
      progressed = advanceBracket(progressed, "win");
    }
    expect(progressed.status).toBe("champion");
    expect(resolvePrize(wake, ALL_CARDS, defaultPubState(), 9).cardId).toBe("spring-heeled-jack");
  });

  it("survives being saved and reloaded across the window closing", () => {
    saveTournamentState(startBracket(defaultTournamentState(), bracket));
    expect(loadTournamentState().active?.tournamentId).toBe("all-hallows-wake");
  });
});
