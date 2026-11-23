// The sleeve unwrap on the pub hub (design.md §17.5): a pending reveal with a
// sleeveId shows the sleeve's back, not a card face, then clears on Collect.

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { DEFAULT_SLEEVE_ID } from "../../../src/cosmetics/sleeves.ts";
import { mountPubHubScreen } from "../../../src/ui/pubHubScreen.ts";

let teardown: (() => void) | undefined;
beforeEach(() => localStorage.clear());
afterEach(() => teardown?.());

describe("sleeve reveal", () => {
  it("unwraps the sleeve with its name and a Collect button, then the hub shows", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    teardown = mountPubHubScreen(root, {
      deckName: "The Village Constable",
      playerName: "Sara",
      onRenamePlayer: () => {},
      onBuildDeck: () => {},
      onStartMatch: () => {},
      onOpenTournaments: () => {},
      onOpenBackRoom: () => {},
      onOpenSaveData: () => {},
      onOpenHouseRules: () => {},
      pendingReveals: [{ title: "From the cellar", cardId: "", sleeveId: DEFAULT_SLEEVE_ID }],
    });
    const overlay = root.querySelector(".overlay--reveal-sleeve");
    expect(overlay).not.toBeNull();
    expect(overlay!.querySelector(".overlay-title")!.textContent).toBe("From the cellar");
    expect(overlay!.querySelector<HTMLElement>(".reveal-card--sleeve")!.dataset.sleeve).toBe(DEFAULT_SLEEVE_ID);
    expect(overlay!.querySelector(".overlay-score")!.textContent).toContain("The Bridge");
    overlay!.querySelector<HTMLButtonElement>("button.action-button")!.click();
    expect(root.querySelector(".overlay--reveal")).toBeNull();
  });
});
