import { beforeEach, describe, expect, it } from "vitest";

describe("app shell", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it("mounts the taproom placeholder into #app", async () => {
    await import("../../src/main.ts");
    const app = document.querySelector("#app");
    expect(app?.textContent).toContain("The Wheatstone Bridge");
  });
});
