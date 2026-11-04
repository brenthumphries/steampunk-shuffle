// A Ghost Story for Christmas (December, docs/plans/monthly/02-december.md
// §2-§7): the pack's dates as the real registry sees them, the visitors and
// the tournament boss, the Advent Cabinet over the year wrap, the arrival
// gifts, the cards, and the public-edition gates.

import { beforeEach, describe, expect, it, vi } from "vitest";

import { GHOST_STORY } from "../../../src/events/packs/ghostStory.ts";
import { claimDoor, liveAdvent } from "../../../src/events/advent.ts";
import { grantArrivalGifts } from "../../../src/events/arrivals.ts";
import { activeEvents, eventLineOverride, eventSirCharlesLines, eventWeather, SEASONAL_EVENTS, visitorArrived } from "../../../src/events/seasonalEvents.ts";
import { OPPONENTS, OPPONENTS_BY_ID, tonightsPatrons } from "../../../src/pub/opponents.ts";
import { ACQUIRABLE_CARDS_BY_ID } from "../../../src/pub/acquirableCards.ts";
import { countInCollection, defaultPubState, type PubState } from "../../../src/pub/pubState.ts";
import { foilId } from "../../../src/pub/tinkersBench.ts";
import { TOURNAMENTS, TOURNAMENTS_BY_ID, FIRESIDE_CIRCLE_FIELD_IDS, isTournamentListed } from "../../../src/tournaments/tournaments.ts";
import { createBracket } from "../../../src/tournaments/bracket.ts";
import { EVENT_CARDS } from "../../../src/cards/data/eventCards.ts";
import { almanackCapricorn } from "../../../src/cards/data/almanack.ts";
import { saltAtTheThreshold } from "../../../src/cards/data/families/coven.ts";
import { theFiresideTale } from "../../../src/cards/data/ghostStory.ts";
import { validateCard } from "../../../src/cards/cardValidator.ts";
import { validateDeck } from "../../../src/cards/deckValidator.ts";
import { KNOWN_DECKS } from "../../../src/cards/data/decks/index.ts";
import { migratedLedger } from "../../../src/save/ledger.ts";

const day = (year: number, month: number, date: number) => new Date(year, month - 1, date);
const copies = (pub: PubState, id: string): number => countInCollection(pub.collection, id);
const fresh = (firstLaunch = "2026-11-20"): PubState => ({ ...defaultPubState(), ledger: migratedLedger(firstLaunch) });

beforeEach(() => {
  localStorage.clear();
  vi.unstubAllEnvs();
});

describe("the pack", () => {
  it("runs Dec 1-31 and is registered once", () => {
    expect(SEASONAL_EVENTS.filter((e) => e.id === "ghost-story")).toEqual([GHOST_STORY]);
    expect(GHOST_STORY.window).toEqual({ start: { month: 12, day: 1 }, end: { month: 12, day: 31 } });
    expect(GHOST_STORY.minWins).toBe(3);
    expect(activeEvents(day(2026, 11, 30)).map((e) => e.id)).not.toContain("ghost-story");
    expect(activeEvents(day(2026, 12, 1)).map((e) => e.id)).toContain("ghost-story");
    expect(activeEvents(day(2027, 1, 1)).map((e) => e.id)).not.toContain("ghost-story");
  });

  it("lists the Fireside Circle as its tournament and the snow weather and taproom art", () => {
    expect(GHOST_STORY.tournaments).toEqual(["fireside-circle"]);
    expect(GHOST_STORY.dressing.taproomArtId).toBe("background-the-taproom-ghost-story");
    expect(eventWeather(day(2026, 12, 1))).toBe("snow");
    expect(eventWeather(day(2026, 11, 30))).toBeUndefined();
  });

  it("keeps every pool id resolvable to an event card", () => {
    for (const id of GHOST_STORY.cardPool) expect(ACQUIRABLE_CARDS_BY_ID.has(id as string), String(id)).toBe(true);
  });

  it("keeps the pack's own gift, banner and line dates inside December", () => {
    for (const gift of GHOST_STORY.arrivalGifts ?? []) expect(gift.from?.month).toBe(12);
    for (const visitor of GHOST_STORY.visitors) expect(visitor.arrives.month).toBe(12);
  });
});

describe("visitors and the tournament boss", () => {
  it("brings Mr Pockett on Dec 1, the Ghost of Christmas Present on Dec 12, and the Yet to Come on Dec 18", () => {
    expect(visitorArrived(GHOST_STORY, "mr-pockett", day(2026, 12, 1))).toBe(true);
    expect(visitorArrived(GHOST_STORY, "ghost-of-christmas-present", day(2026, 12, 11))).toBe(false);
    expect(visitorArrived(GHOST_STORY, "ghost-of-christmas-present", day(2026, 12, 12))).toBe(true);
    expect(visitorArrived(GHOST_STORY, "ghost-of-christmas-yet-to-come", day(2026, 12, 17))).toBe(false);
    expect(visitorArrived(GHOST_STORY, "ghost-of-christmas-yet-to-come", day(2026, 12, 18))).toBe(true);
  });

  it("puts the Present in Tonight's Patrons from Dec 12 to a 3-win player, and never the Yet to Come", () => {
    expect(tonightsPatrons(3, day(2026, 12, 11)).map((o) => o.id)).not.toContain("ghost-of-christmas-present");
    expect(tonightsPatrons(3, day(2026, 12, 12)).map((o) => o.id)).toContain("ghost-of-christmas-present");
    for (const date of [day(2026, 12, 18), day(2026, 12, 31)]) {
      expect(tonightsPatrons(40, date).map((o) => o.id)).not.toContain("ghost-of-christmas-yet-to-come");
    }
  });

  it("lists the Yet to Come as tournament-only legend on the legend dial", () => {
    const boss = OPPONENTS_BY_ID.get("ghost-of-christmas-yet-to-come")!;
    expect(boss.tier).toBe("legend");
    expect(boss.difficulty).toBe("legend");
    expect(boss.tournamentOnly).toBe(true);
    expect(boss.rewardCardId).toBeNull();
  });

  it("gives Mr Pockett the seasoned dial and the visitor tier, and the Present the same", () => {
    for (const id of ["mr-pockett", "ghost-of-christmas-present"]) {
      expect(OPPONENTS_BY_ID.get(id)!.tier, id).toBe("visitor");
      expect(OPPONENTS_BY_ID.get(id)!.difficulty, id).toBe("seasoned");
    }
  });
});

describe("the Fireside Circle", () => {
  const fireside = TOURNAMENTS_BY_ID.get("fireside-circle")!;

  it("opens Dec 18 to Dec 31 after 3 wins, and not on Dec 17", () => {
    expect(isTournamentListed(fireside, false, day(2026, 12, 17), false)).toBe(false);
    expect(isTournamentListed(fireside, false, day(2026, 12, 18), false)).toBe(true);
    expect(fireside.isUnlocked(2, false, day(2026, 12, 18))).toBe(false);
    expect(fireside.isUnlocked(3, false, day(2026, 12, 18))).toBe(true);
    expect(fireside.isUnlocked(3, false, day(2026, 12, 17))).toBe(false);
    expect(fireside.isUnlocked(3, false, day(2027, 1, 1))).toBe(false);
  });

  it("is a 13-check entry, 13-check consolation and 150-check prize that is the Yet to Come, with the Fireside Tale as the house Location", () => {
    expect(fireside.entryChecks).toBe(13);
    expect(fireside.consolationChecks).toBe(13);
    expect(fireside.prizeChecks).toBe(150);
    expect(fireside.prizeCard).toEqual({ kind: "fixed", cardId: "ghost-of-christmas-yet-to-come" });
    expect(fireside.houseLocationId).toBe("the-fireside-tale");
    expect(TOURNAMENTS.map((t) => t.id)).toContain("fireside-circle");
  });

  it("seats the four fixed opponents, and the other three from the Seasoned in the gift build", () => {
    const pool = fireside.eligiblePool(OPPONENTS);
    expect(pool).toHaveLength(7);
    expect(fireside.fixedSeats!(pool).map((o) => o.id).sort()).toEqual([...FIRESIDE_CIRCLE_FIELD_IDS].sort());
    const bracket = createBracket(fireside, pool, 20261218);
    expect(bracket.seatOpponentIds).toHaveLength(7);
    for (const id of FIRESIDE_CIRCLE_FIELD_IDS) expect(bracket.seatOpponentIds, id).toContain(id);
    const randomSeats = bracket.seatOpponentIds.filter((id) => !FIRESIDE_CIRCLE_FIELD_IDS.includes(id));
    expect(randomSeats.sort()).toEqual(["adler", "bucket", "lovelace"]);
  });
});

describe("the Advent Cabinet on the December pack", () => {
  it("is shut on Nov 30 and live from Dec 1 to Jan 6, not after", () => {
    expect(liveAdvent(day(2026, 11, 30))).toBeNull();
    expect(liveAdvent(day(2026, 12, 1))?.event.id).toBe("ghost-story");
    expect(liveAdvent(day(2027, 1, 6))?.event.id).toBe("ghost-story");
    expect(liveAdvent(day(2027, 1, 7))).toBeNull();
  });

  it("opens doors 1-3 on Dec 3 and keeps door 4 shut", () => {
    let pub = fresh();
    expect(claimDoor(pub, day(2026, 12, 3), 4)).toBeNull();
    for (const d of [1, 2, 3]) {
      const claim = claimDoor(pub, day(2026, 12, 3), d);
      expect(claim, `door ${d}`).not.toBeNull();
      pub = claim!.next;
    }
    expect(claimDoor(pub, day(2026, 12, 3), 3)).toBeNull();
  });

  it("opens door 24 on Dec 24 and not before", () => {
    expect(claimDoor(fresh(), day(2026, 12, 23), 24)).toBeNull();
    expect(claimDoor(fresh(), day(2026, 12, 24), 24)?.door.reward.checks).toBe(50);
  });

  it("opens door 25 (Christmas Day) with a foil of Bramwell, and still claims it on Dec 25 only", () => {
    expect(claimDoor(fresh(), day(2026, 12, 24), 25)).toBeNull();
    const claim = claimDoor(fresh(), day(2026, 12, 25), 25);
    expect(claim).not.toBeNull();
    // Bramwell is a starter-deck card the player already owns, so the door adds only the foil.
    expect(claim!.cardIds).toEqual([foilId("bramwell")]);
    expect(copies(claim!.next, foilId("bramwell"))).toBe(1);
    expect(claim!.door.line).toBe("Happy Christmas, Landlady. The cats got you something. It's a foil. They didn't wrap it.");
  });

  it("keeps a past door claimable into the New Year until Jan 6 (Twelfth Night)", () => {
    expect(claimDoor(fresh(), day(2027, 1, 3), 2)).not.toBeNull();
    expect(claimDoor(fresh(), day(2027, 1, 7), 2)).toBeNull();
  });

  it("has 25 doors with days 1 to 25, and 210 Checks across the check doors other than door 24", () => {
    const doors = GHOST_STORY.advent!.doors;
    expect(doors.map((d) => d.day)).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
    const checks = doors.filter((d) => d.day !== 24).reduce((sum, d) => sum + (d.reward.checks ?? 0), 0);
    expect(checks).toBe(210);
  });

  it("resolves every card id on the cabinet", () => {
    for (const door of GHOST_STORY.advent!.doors) {
      for (const id of [door.reward.cardId, door.reward.foilOf]) {
        if (id) expect(ACQUIRABLE_CARDS_BY_ID.has(id), id).toBe(true);
      }
    }
  });

  it("opens the Lost & Found and Tinker's Bench tokens on doors 14 and 19", () => {
    const doors = GHOST_STORY.advent!.doors;
    expect(doors.find((d) => d.day === 14)!.reward.token).toBe("lostAndFoundUncommon");
    expect(doors.find((d) => d.day === 19)!.reward.token).toBe("tinkerFree");
  });
});

describe("arrival gifts", () => {
  it("hands over the salt on Dec 1 once, and never again that year", () => {
    const first = grantArrivalGifts(fresh(), day(2026, 12, 1));
    expect(first.granted.map((g) => g.gift.id)).toContain("salt-on-the-step");
    expect(copies(first.next, "salt-at-the-threshold")).toBe(1);
    const again = grantArrivalGifts(first.next, day(2026, 12, 2));
    expect(copies(again.next, "salt-at-the-threshold")).toBe(1);
  });

  it("hands over Capricorn on Dec 22, not before", () => {
    expect(grantArrivalGifts(fresh(), day(2026, 12, 21)).granted.map((g) => g.gift.id)).not.toContain("almanack-seller");
    const on = grantArrivalGifts(fresh(), day(2026, 12, 22));
    expect(copies(on.next, "almanack-capricorn")).toBe(1);
    expect(copies(grantArrivalGifts(on.next, day(2026, 12, 23)).next, "almanack-capricorn")).toBe(1);
  });
});

describe("lines and Sir Charles", () => {
  it("has Sir Charles's Christmas lines from Dec 1", () => {
    expect(eventSirCharlesLines(day(2026, 12, 1))).toEqual(expect.arrayContaining(["Ghost stories on Christmas Eve. It's tradition. The ghosts insist."]));
  });

  it("has Dickens react to the Present only after it arrives", () => {
    expect(eventLineOverride("dickens", day(2026, 12, 11))).toBeNull();
    expect(eventLineOverride("dickens", day(2026, 12, 12))).toBe("I've read that story aloud a hundred times. He's never come to listen before.");
  });

  it("has Holmes react to the Yet to Come only from Dec 18", () => {
    expect(eventLineOverride("holmes", day(2026, 12, 17))).toBeNull();
    expect(eventLineOverride("holmes", day(2026, 12, 18))).toBe("The tall one in black hasn't said a word all evening. I find I like him.");
  });
});

describe("the cards", () => {
  it("gives the Fireside Tale two continuous buffs, one for Undying and one for Return", () => {
    const face = theFiresideTale.faces[0];
    expect(face.abilities?.map((a) => a.trigger)).toEqual(["continuous", "continuous"]);
    const keywords = face.abilities!.map((a) => (a.effects[0] as { target: { filter?: { hasKeyword?: string } } }).target.filter?.hasKeyword);
    expect(keywords).toEqual(["undying", "return"]);
  });

  it("puts Capricorn in the Almanack frame as a rare headline with its glyph", () => {
    expect(almanackCapricorn.faces[0].frame).toBe("almanack");
    expect(almanackCapricorn.faces[0].glyph).toBe("♑");
    expect(almanackCapricorn.faces[0].type).toBe("headline");
  });

  it("puts the salt in the Coven as an uncommon scheme with no points", () => {
    expect(saltAtTheThreshold.faces[0].family).toBe("coven");
    expect(saltAtTheThreshold.faces[0].type).toBe("scheme");
    expect(saltAtTheThreshold.faces[0].points).toBe(0);
  });

  it("passes validateCard for every December card", () => {
    const december = EVENT_CARDS.filter((c) => ["wassail-bowl", "yule-log", "a-whistle-on-the-shingle", "the-fireside-tale", "salt-at-the-threshold", "almanack-capricorn", "mr-pockett", "ghost-of-christmas-present", "ghost-of-christmas-yet-to-come"].includes(c.id));
    expect(december).toHaveLength(9);
    for (const card of december) expect(validateCard(card), card.id).toEqual({ valid: true, errors: [] });
  });

  it("builds three legal 20-card decks for the December opponents", () => {
    for (const name of ["Mr Pockett, Toymaker", "The Ghost of Christmas Present", "The Ghost of Christmas Yet to Come"]) {
      const entry = KNOWN_DECKS.find((d) => d.name === name);
      expect(entry, name).toBeDefined();
      expect(validateDeck(entry!.deck).valid, name).toBe(true);
    }
  });

  it("keeps each visitor's bet pool to real, non-legendary cards", () => {
    for (const id of ["mr-pockett", "ghost-of-christmas-present", "ghost-of-christmas-yet-to-come"]) {
      for (const card of OPPONENTS_BY_ID.get(id)!.betPool) expect(ACQUIRABLE_CARDS_BY_ID.get(card)?.rarity, card).not.toBe("legendary");
    }
  });
});

describe("the public edition", () => {
  it("has no Mr Pockett in Tonight's Patrons, the Pockett lines, or any tournament field", () => {
    vi.stubEnv("VITE_EDITION", "public");
    expect(tonightsPatrons(40, day(2026, 12, 1)).map((o) => o.id)).not.toContain("mr-pockett");
    expect(eventSirCharlesLines(day(2026, 12, 1))).not.toContain("Mr Pockett says the scratches on the door are 'a toy'. I've chosen to believe him.");
    expect(eventLineOverride("lovelace", day(2026, 12, 1))).toBeNull();
    for (const tournament of TOURNAMENTS) {
      expect(tournament.eligiblePool(OPPONENTS).some((o) => o.id === "mr-pockett"), tournament.id).toBe(false);
    }
  });

  it("does not offer the Fireside Circle, because its field is one short without Mr Pockett", () => {
    vi.stubEnv("VITE_EDITION", "public");
    const fireside = TOURNAMENTS_BY_ID.get("fireside-circle")!;
    expect(fireside.eligiblePool(OPPONENTS)).toHaveLength(6);
    expect(fireside.isUnlocked(40, false, day(2026, 12, 20))).toBe(false);
  });

  it("keeps Mr Pockett's own card and opponent giftOnly", () => {
    expect(OPPONENTS_BY_ID.get("mr-pockett")!.giftOnly).toBe(true);
    expect(ACQUIRABLE_CARDS_BY_ID.get("mr-pockett")!.giftOnly).toBe(true);
  });
});
