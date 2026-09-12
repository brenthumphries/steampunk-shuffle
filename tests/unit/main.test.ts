import { beforeEach, describe, expect, it, vi } from "vitest";

describe("app shell", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    localStorage.clear();
    vi.resetModules();
  });

  it("a fresh player lands in the tutorial (design.md §13), not the pub hub", async () => {
    await import("../../src/main.ts");
    const app = document.querySelector("#app");
    expect(app?.textContent).toContain("Round 1 of 3");
    expect(app?.textContent).toContain("Sir Charles");
  });

  it("mounts the taproom (pub hub) into #app once the tutorial is done", async () => {
    localStorage.setItem("steampunk-shuffle:tutorial-state", JSON.stringify({ completed: true, matchesPlayed: 1, shownHints: [] }));
    await import("../../src/main.ts");
    const app = document.querySelector("#app");
    expect(app?.textContent).toContain("The Wheatstone Bridge");
  });
});
