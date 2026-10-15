// Unit tests for tools/store-screenshots.ts (ATT-35): the pieces that decide
// whether a store picture is acceptable, without launching a browser. The
// shots themselves are checked by running the tool (see docs/store-listing.md).

import { deflateSync, crc32 } from "node:zlib";
import { beforeEach, describe, expect, it } from "vitest";

import { loadDeckSlotsState } from "../../../src/decks/deckStorage.ts";
import { loadPlayerState } from "../../../src/player/playerState.ts";
import { loadTournamentState } from "../../../src/tournaments/tournamentState.ts";
import { OPPONENTS_BY_ID } from "../../../src/pub/opponents.ts";
import {
  bracketState,
  COMMON_SEED,
  DECK_LEGALITY,
  HIGH_RISK,
  humanDeck,
  midRoundMatch,
  PERSONAL,
  SHOTS,
  SIZES,
  stripAlpha,
} from "../../../tools/store-screenshots.ts";

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function chunk(type: string, data: Buffer): Buffer {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, "latin1");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, crc]);
}

/** An 8-bit RGBA PNG from filtered scanlines (each row already prefixed with its filter byte). */
function rgbaPng(width: number, height: number, scanlines: number[][]): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([SIGNATURE, chunk("IHDR", ihdr), chunk("IDAT", deflateSync(Buffer.from(scanlines.flat()))), chunk("IEND", Buffer.alloc(0))]);
}

describe("stripAlpha", () => {
  it("re-encodes an opaque RGBA PNG as RGB with the same pixels, across filter types", () => {
    // 2x3. Row 0 unfiltered, row 1 "sub", row 2 "up".
    const row0 = [0, 10, 20, 30, 255, 40, 50, 60, 255];
    const row1 = [1, 1, 2, 3, 255, 4, 5, 6, 0]; // sub: each byte adds the byte one pixel to its left
    const row2 = [2, 1, 1, 1, 0, 1, 1, 1, 0]; // up: each byte adds the row above
    const out = stripAlpha(rgbaPng(2, 3, [row0, row1, row2]));
    expect(out.width).toBe(2);
    expect(out.height).toBe(3);
    expect(out.png.subarray(0, 8).equals(SIGNATURE)).toBe(true);
    expect(out.png[8 + 8 + 9]).toBe(2); // IHDR colour type: RGB
    // The same pixels written unfiltered: sub gives (1,2,3,255),(5,7,9,255); up then adds 1 to each colour byte.
    const again = stripAlpha(rgbaPng(2, 3, [row0, [0, 1, 2, 3, 255, 5, 7, 9, 255], [0, 2, 3, 4, 255, 6, 8, 10, 255]]));
    expect(again.png.equals(out.png)).toBe(true);
  });

  it("refuses a PNG that is not fully opaque, since dropping alpha would change the picture", () => {
    expect(() => stripAlpha(rgbaPng(1, 1, [[0, 1, 2, 3, 128]]))).toThrow(/not opaque/);
  });

  it("refuses something that is not a PNG", () => {
    expect(() => stripAlpha(Buffer.from("not a png"))).toThrow(/not a PNG/);
  });
});

describe("sizes", () => {
  it("are sizes Apple lists for iPhone with Dynamic Island, at 3x a real point size", () => {
    expect(SIZES.map((s) => [s.width, s.height])).toEqual([
      [1206, 2622],
      [1320, 2868],
    ]);
    for (const s of SIZES) {
      expect(s.viewport.width * 3).toBe(s.width);
      expect(s.viewport.height * 3).toBe(s.height);
    }
  });

  it("has six shots in the order the listing describes", () => {
    expect(SHOTS.map((s) => s.file)).toEqual([
      "01-pub-hub.png",
      "02-match.png",
      "03-card-zoom.png",
      "04-deck-builder.png",
      "05-chalkboard.png",
      "06-tournament-bracket.png",
    ]);
    for (const shot of SHOTS) expect(shot.shows.length).toBeGreaterThan(20);
  });
});

describe("the seeded save", () => {
  beforeEach(() => localStorage.clear());

  it("is accepted by the app's own loaders", () => {
    for (const [key, value] of Object.entries({ ...COMMON_SEED, "steampunk-shuffle:tournament-state": bracketState() })) localStorage.setItem(key, JSON.stringify(value));
    expect(loadPlayerState()).toEqual({ name: "Alex", dedicationSeen: true });
    expect(loadDeckSlotsState().slots[0]?.name).toBe("Heavy Industry");
    expect(loadDeckSlotsState().selectedIndex).toBe(0);
    const bracket = loadTournamentState();
    expect(bracket.invitationalTriggered).toBe(false);
    expect(bracket.active?.playerMatches.map((m) => m.outcome)).toEqual(["won", "pending", "pending"]);
  });

  it("is the public edition: not Sara, no Invitational, no Landlady", () => {
    expect(JSON.stringify(COMMON_SEED)).not.toMatch(/Sara|Invitational|landlady/i);
  });

  it("uses a legal deck of 45 printed points or fewer with no pub cat in it", () => {
    expect(DECK_LEGALITY.valid).toBe(true);
    expect(DECK_LEGALITY.totalCards).toBe(20);
    expect(DECK_LEGALITY.totalPoints).toBeLessThanOrEqual(45);
    const ids = humanDeck.map((e) => e.card.id);
    for (const cat of ["hiawatha", "banshee", "bramwell", "charlotte", "emily"]) expect(ids).not.toContain(cat);
  });

  it("seats opponents with nothing High-risk in the bracket", () => {
    const high = ["christie", "poirot"];
    for (const id of [...bracketState().active.seatOpponentIds, ...bracketState().active.playerMatches.map((m) => m.opponentId)]) {
      expect(OPPONENTS_BY_ID.has(id)).toBe(true);
      expect(high).not.toContain(id);
    }
  });
});

describe("midRoundMatch", () => {
  it("is the player's turn in round 2, a round up, with nothing unwanted on either board", () => {
    const { state } = midRoundMatch();
    expect(state.round).toBe(2);
    expect(state.roundsWon).toEqual({ A: 1, B: 0 });
    expect(state.status).toBe("in-progress");
    const ids = [...state.players.A.board, ...state.players.B.board].map((bc) => bc.card.id);
    for (const unwanted of ["hiawatha", "banshee", "bramwell", "charlotte", "emily", "dame-agatha", "hercule-poirot", "good-news-everybody", "party-time-excellent", "abby-normal", "eye-gor"]) {
      expect(ids).not.toContain(unwanted);
    }
  });
});

describe("the content guards", () => {
  const caught = (patterns: RegExp[], text: string): boolean => patterns.some((p) => p.test(text));

  it("catch every High-risk name and art id in docs/app-store-readiness.md", () => {
    for (const text of ["Agatha Christie", "Dame Agatha", "Hercule Poirot", "mon ami", "Good News, Everybody!", "Party Time. Excellent.", "Abby Normal", "Eye-gor", "portrait-agatha-christie", "party-time-excellent"]) {
      expect(caught(HIGH_RISK, text), text).toBe(true);
    }
  });

  it("catch the gift-edition touches and the pub cats, and let ordinary text through", () => {
    for (const text of ["Licensed to Sara", "The Birthday Invitational", "The Landlady", "Hiawatha", "Charlotte"]) expect(caught(PERSONAL, text), text).toBe(true);
    for (const text of ["Sergeant Pike", "Old Nell Ashby", "Heavy Industry", "Charles Dickens", "Sir Charles"]) {
      expect(caught(HIGH_RISK, text), text).toBe(false);
      expect(caught(PERSONAL, text), text).toBe(false);
    }
  });
});
