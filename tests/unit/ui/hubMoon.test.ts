import { describe, expect, it } from "vitest";

import { moonPhase } from "../../../src/sky/moon.ts";
import { FULL_MOON_LINE, moonMatText, PHASE_LINES, PHASE_TITLES } from "../../../src/sky/moonLines.ts";
import { MOON_PHASE_NAMES } from "../../../src/sky/moon.ts";
import { buildHubMoon } from "../../../src/ui/hubMoon.ts";

describe("hub moon", () => {
  it("draws each of the eight states, with a glow class only on the full moon", () => {
    for (const name of MOON_PHASE_NAMES) {
      const btn = buildHubMoon(name, () => {});
      expect(btn.dataset.phase).toBe(name);
      expect(btn.querySelector("svg")).not.toBeNull();
      expect(btn.classList.contains("hub-moon--full")).toBe(name === "full");
      expect(btn.querySelector(".hub-moon-lit") !== null).toBe(name !== "new");
    }
  });

  it("calls back on tap", () => {
    let taps = 0;
    buildHubMoon("full", () => taps++).click();
    expect(taps).toBe(1);
  });

  it("has a title and a line for every phase", () => {
    for (const name of MOON_PHASE_NAMES) {
      expect(PHASE_TITLES[name].length).toBeGreaterThan(0);
      expect(PHASE_LINES[name].length).toBeGreaterThan(0);
    }
  });

  it("shows the phase for a few dates (the dev clock's noon-of-day dates)", () => {
    const at = (m: number, d: number) => moonPhase(new Date(2026, m - 1, d, 12)).name;
    expect(at(11, 24)).toBe("full");
    expect(at(11, 9)).toBe("new");
    expect(at(11, 20)).toBe("waxing-gibbous"); // 79% lit, PyEphem
    expect(at(12, 2)).toBe("last-quarter");
    expect(at(12, 5)).toBe("waning-crescent"); // 12% lit, PyEphem
  });

  it("names the phase on the beer mat, and adds the apology only on full-moon nights", () => {
    expect(moonMatText(new Date(2026, 10, 20, 12))).toBe("Waxing gibbous. Pixie says that's a good one.");
    expect(moonMatText(new Date(2026, 10, 9, 12))).not.toContain(FULL_MOON_LINE);
    const full = moonMatText(new Date(2026, 10, 24, 12));
    expect(full.startsWith("Full moon.")).toBe(true);
    expect(full.endsWith(FULL_MOON_LINE)).toBe(true);
  });
});
