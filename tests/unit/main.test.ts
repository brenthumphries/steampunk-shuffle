import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("app shell", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    localStorage.clear();
    // The launch intro film plays by default (src/ui/introScreen.ts); these tests are about what follows it.
    window.history.replaceState(null, "", "/?intro=0");
    vi.resetModules();
    // The dedication is held from Sep 1 to Oct 29 (dedicationShouldShow), so
    // pin "today" outside that window; only Date is faked, timers stay real.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 5, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("plays the launch intro first, and the game follows once it ends", async () => {
    window.history.replaceState(null, "", "/?intro=1");
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
    await import("../../src/main.ts");
    const app = document.querySelector("#app");
    const video = app?.querySelector("video");
    expect(video).not.toBeNull();
    expect(app?.textContent).not.toContain("Licensed to");
    video?.dispatchEvent(new Event("ended"));
    expect(app?.querySelector("video")).toBeNull();
    expect(app?.textContent).toContain("Licensed to");
  });

  it("a first launch during the hold (Oct 15) skips the dedication and lands in the tutorial", async () => {
    vi.setSystemTime(new Date(2026, 9, 15, 12));
    await import("../../src/main.ts");
    const app = document.querySelector("#app");
    expect(app?.textContent).not.toContain("Licensed to");
    expect(app?.textContent).toContain("Round 1 of 3");
  });

  it("a truly fresh install sees the dedication screen (design.md §14.1) before the tutorial", async () => {
    await import("../../src/main.ts");
    const app = document.querySelector("#app");
    expect(app?.textContent).toContain("Licensed to");
    expect(app?.textContent).toContain("Happy birthday");
    expect(app?.textContent).not.toContain("Round 1 of 3");
  });

  it("a fresh player lands in the tutorial (design.md §13) once the dedication screen is seen, not the pub hub", async () => {
    localStorage.setItem("steampunk-shuffle:player", JSON.stringify({ name: "Sara", dedicationSeen: true }));
    await import("../../src/main.ts");
    const app = document.querySelector("#app");
    expect(app?.textContent).toContain("Round 1 of 3");
    expect(app?.textContent).toContain("Sir Charles");
  });

  it("mounts the taproom (pub hub) into #app once the tutorial is done", async () => {
    localStorage.setItem("steampunk-shuffle:tutorial-state", JSON.stringify({ completed: true, matchesPlayed: 1, shownHints: [] }));
    localStorage.setItem("steampunk-shuffle:player", JSON.stringify({ name: "Sara", dedicationSeen: true }));
    await import("../../src/main.ts");
    const app = document.querySelector("#app");
    expect(app?.textContent).toContain("The Wheatstone Bridge");
  });
});
