// The Ledger and save version 2 (docs/plans/monthly/00-monthly-content-plan.md §4.3).

import { beforeEach, describe, expect, it } from "vitest";

import {
  CAT_CARD_IDS,
  defaultLedger,
  migratedLedger,
  parseLedger,
  recordBoothDraw,
  recordCardAcquired,
  recordCardPlay,
  recordChecksEarned,
  recordOpponentResult,
  recordTournamentWon,
  registerLaunch,
} from "../../../src/save/ledger.ts";
import { applySaveFile, buildSaveFile, migrateSaveFile, SAVE_FILE_VERSION, type SaveFile } from "../../../src/save/saveFile.ts";
import { defaultPubState, loadPubState, savePubState } from "../../../src/pub/pubState.ts";

beforeEach(() => localStorage.clear());

describe("ledger increments", () => {
  it("counts card plays, and the five pub cats separately", () => {
    let l = defaultLedger();
    l = recordCardPlay(l, "constable");
    l = recordCardPlay(l, "constable");
    l = recordCardPlay(l, "hiawatha");
    expect(l.cardPlays).toEqual({ constable: 2, hiawatha: 1 });
    expect(l.catsPlayed).toEqual({ hiawatha: 1 });
    expect(CAT_CARD_IDS).toEqual(["hiawatha", "banshee", "bramwell", "charlotte", "emily"]);
  });

  it("tallies wins, losses and draws per opponent", () => {
    let l = defaultLedger();
    for (const o of ["win", "win", "loss", "draw"] as const) l = recordOpponentResult(l, "mudd", o);
    l = recordOpponentResult(l, "nell", "loss");
    expect(l.opponents).toEqual({ mudd: { wins: 2, losses: 1, draws: 1 }, nell: { wins: 0, losses: 1, draws: 0 } });
  });

  it("adds Checks earned, ignoring zero", () => {
    const l = recordChecksEarned(recordChecksEarned(defaultLedger(), 15), 0);
    expect(l.checksEarned).toBe(15);
  });

  it("records only the first legendary and its date", () => {
    let l = recordCardAcquired(defaultLedger(), "sergeant-pike", "uncommon", "2026-11-01");
    expect(l.firstLegendary).toBeNull();
    l = recordCardAcquired(l, "sherlock-holmes", "legendary", "2026-11-02");
    l = recordCardAcquired(l, "mary-shelley", "legendary", "2026-11-09");
    expect(l.firstLegendary).toEqual({ id: "sherlock-holmes", date: "2026-11-02" });
  });

  it("records tournaments won, Booth draws, and registers the first launch once", () => {
    let l = recordTournamentWon(defaultLedger(), "peelers-cup", "2026-11-20");
    l = recordBoothDraw(l, "tarot-the-fool", "2026-11-13");
    expect(l.tournamentsWon).toEqual([{ id: "peelers-cup", date: "2026-11-20" }]);
    expect(l.boothDraws).toEqual([{ arcanaId: "tarot-the-fool", date: "2026-11-13" }]);
    l = registerLaunch(l, "2026-11-01");
    l = registerLaunch(l, "2026-11-09");
    expect(l.firstLaunch).toBe("2026-11-01");
  });
});

describe("save version 2 migration", () => {
  it("is version 2", () => {
    expect(SAVE_FILE_VERSION).toBe(2);
    expect(buildSaveFile().version).toBe(2);
  });

  it("a pub-state saved before the ledger loads with a zeroed ledger whose first launch is the migration day", () => {
    localStorage.setItem(
      "steampunk-shuffle:pub-state",
      JSON.stringify({ checks: 40, totalWins: 6, opponents: {}, collection: ["sergeant-pike"], lastDailyBonusDate: null, lastLostAndFoundDate: null, pawnedCards: [], pawnbrokerPurchasedToday: [], pawnbrokerPurchaseDate: null }),
    );
    const pub = loadPubState();
    expect(pub.checks).toBe(40);
    expect(pub.collection).toEqual(["sergeant-pike"]);
    expect(pub.ledger).toEqual({ ...defaultLedger(), firstLaunch: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) });
    expect(pub.hostsMet).toEqual([]);
    expect(pub.giftsClaimed).toEqual({});
    expect(pub.bannersSeen).toEqual({});
  });

  it("keeps an existing ledger intact across a save/load round trip", () => {
    const state = defaultPubState();
    state.ledger = { ...recordCardPlay(migratedLedger("2026-11-01"), "hiawatha"), checksEarned: 99 };
    state.hostsMet = ["pamela"];
    state.giftsClaimed = { november: { "2026": ["a"] } };
    state.bannersSeen = { november: [2026] };
    savePubState(state);
    expect(loadPubState()).toEqual(state);
  });

  it("migrateSaveFile upgrades a version-1 file and leaves a version-2 file alone", () => {
    const v1 = { ...buildSaveFile(), version: 1 } as SaveFile;
    delete (v1.pub as Partial<typeof v1.pub>).ledger;
    const up = migrateSaveFile(v1, "2026-11-05");
    expect(up.version).toBe(2);
    expect(up.pub.ledger).toEqual(migratedLedger("2026-11-05"));
    expect(up.pub.hostsMet).toEqual([]);
    const v2 = buildSaveFile();
    expect(migrateSaveFile(v2, "2030-01-01")).toBe(v2);
  });

  it("importing a version-1 file lands a ledger in the stored pub-state", () => {
    const v1 = { ...buildSaveFile(), version: 1 } as SaveFile;
    delete (v1.pub as Partial<typeof v1.pub>).ledger;
    expect(applySaveFile(JSON.parse(JSON.stringify(v1))).ok).toBe(true);
    expect(loadPubState().ledger.firstLaunch).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("parseLedger tolerates garbage: whatever parses is kept, the rest zeroes", () => {
    expect(parseLedger(null, "2026-11-01")).toEqual(migratedLedger("2026-11-01"));
    const l = parseLedger({ firstLaunch: "2026-10-01", cardPlays: "nope", checksEarned: 7, opponents: { a: { wins: 1, losses: 0, draws: 0 }, b: 3 }, tournamentsWon: [{ id: "x", date: "d" }, 5] }, "2026-11-01");
    expect(l.firstLaunch).toBe("2026-10-01");
    expect(l.cardPlays).toEqual({});
    expect(l.checksEarned).toBe(7);
    expect(l.opponents).toEqual({ a: { wins: 1, losses: 0, draws: 0 } });
    expect(l.tournamentsWon).toEqual([{ id: "x", date: "d" }]);
  });
});

describe("match-end and reward hooks", () => {
  it("a pickup result adds the tally, the Checks and a legendary first-win reward", async () => {
    const { ledgerAfterPickup } = await import("../../../src/save/ledger.ts");
    let l = ledgerAfterPickup(defaultLedger(), { opponentId: "holmes", outcome: "win", checksEarned: 35, reward: { id: "sherlock-holmes", rarity: "legendary" }, dateKey: "2026-11-02" });
    expect(l.opponents.holmes).toEqual({ wins: 1, losses: 0, draws: 0 });
    expect(l.checksEarned).toBe(35);
    expect(l.firstLegendary).toEqual({ id: "sherlock-holmes", date: "2026-11-02" });
    l = ledgerAfterPickup(l, { opponentId: "holmes", outcome: "draw", checksEarned: 0, reward: null, dateKey: "2026-11-03" });
    expect(l.opponents.holmes).toEqual({ wins: 1, losses: 0, draws: 1 });
  });

  it("a tournament counts each match, then the payout and the win at the end", async () => {
    const { ledgerAfterTournamentMatch, ledgerAfterTournamentEnd } = await import("../../../src/save/ledger.ts");
    let l = ledgerAfterTournamentMatch(defaultLedger(), "mudd", "loss");
    expect(l.opponents.mudd?.losses).toBe(1);
    l = ledgerAfterTournamentEnd(l, { tournamentId: "peelers-cup", champion: false, checks: 10, dateKey: "2026-11-04" });
    expect(l.tournamentsWon).toEqual([]);
    expect(l.checksEarned).toBe(10);
    l = ledgerAfterTournamentEnd(l, { tournamentId: "peelers-cup", champion: true, checks: 60, prize: { id: "hiawatha", rarity: "legendary" }, dateKey: "2026-11-09" });
    expect(l.tournamentsWon).toEqual([{ id: "peelers-cup", date: "2026-11-09" }]);
    expect(l.checksEarned).toBe(70);
    expect(l.firstLegendary?.id).toBe("hiawatha");
  });
});
