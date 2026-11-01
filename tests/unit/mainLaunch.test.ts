// What a launch does with the content-pack framework (content plan §4.1):
// registers the first launch, meets hosts, hands over gifts, and slides the
// banner across, each once. Drives the real main.ts with the test-only pack
// (?testpack=1) on the dev clock (?now=).

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function pub(): any {
  return JSON.parse(localStorage.getItem("steampunk-shuffle:pub-state") ?? "null");
}

async function launch(now: string): Promise<HTMLElement> {
  document.body.innerHTML = '<div id="app"></div>';
  window.history.replaceState(null, "", `/?intro=0&testpack=1&now=${now}`);
  vi.resetModules();
  await import("../../src/main.ts");
  return document.querySelector<HTMLElement>("#app")!;
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("steampunk-shuffle:tutorial-state", JSON.stringify({ completed: true, matchesPlayed: 5, shownHints: ["hub"] }));
  localStorage.setItem("steampunk-shuffle:player", JSON.stringify({ name: "Sara", dedicationSeen: true }));
});

afterEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("launch tasks (test-only pack, Jan 10-12, host and welcome gift Jan 11)", () => {
  it("registers the first launch on a fresh install, once", async () => {
    await launch("2027-01-05");
    expect(pub().ledger.firstLaunch).toBe("2027-01-05");
    await launch("2027-02-01");
    expect(pub().ledger.firstLaunch).toBe("2027-01-05");
  });

  it("shows the banner on the first hub visit in the window, and not again that year", async () => {
    // 2026, so the fromYear-2027 gift's own beer mat isn't ahead of the banner in the queue.
    let app = await launch("2026-01-10");
    expect(app.querySelector(".beer-mat-text")?.textContent).toBe("Test pack banner: new this month.");
    expect(pub().bannersSeen["test-pack"]).toEqual([2026]);
    app = await launch("2026-01-11");
    expect(app.textContent).not.toContain("Test pack banner");
  });

  it("hands over the gift on the arrival day with its line, meets the host, and never repeats on relaunch", async () => {
    let app = await launch("2027-01-11");
    const mats = [app.querySelector(".beer-mat-text")?.textContent];
    expect(mats[0]).toContain("Someone left this on the step.");
    expect(pub().collection.filter((id: string) => id === "test-card-a")).toHaveLength(2);
    expect(pub().collection).toContain("test-card-b"); // the fromYear-2027 gift is due in 2027
    expect(pub().hostsMet).toEqual(["test-host"]);

    app = await launch("2027-01-12");
    expect(pub().collection.filter((id: string) => id === "test-card-a")).toHaveLength(2);
    expect(app.textContent).not.toContain("Someone left this on the step.");
    expect(pub().giftsClaimed["test-pack"]["2027"].sort()).toEqual(["later", "welcome"]);
  });

  it("keeps the host after the window closes", async () => {
    await launch("2027-01-11");
    await launch("2027-06-01");
    expect(pub().hostsMet).toEqual(["test-host"]);
  });

  it("migrates a save with no ledger to a first launch of the migration day", async () => {
    localStorage.setItem(
      "steampunk-shuffle:pub-state",
      JSON.stringify({ checks: 40, totalWins: 6, opponents: {}, collection: [], lastDailyBonusDate: null, lastLostAndFoundDate: null, pawnedCards: [], pawnbrokerPurchasedToday: [], pawnbrokerPurchaseDate: null }),
    );
    await launch("2027-03-03");
    expect(pub().ledger.firstLaunch).toBe("2027-03-03");
    expect(pub().checks).toBe(40);
  });
});
