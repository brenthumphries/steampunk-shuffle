import { describe, expect, it } from "vitest";
import { buildMatchHud, type MatchHudState } from "../../../src/ui/matchHud.ts";

function state(partial: Partial<MatchHudState> = {}): MatchHudState {
  return {
    round: 1,
    turnInRound: 1,
    activeSide: "human",
    humanName: "You",
    aiName: "Mudd",
    roundJustAdvanced: false,
    turnJustChanged: false,
    ...partial,
  };
}

describe("buildMatchHud", () => {
  it("labels the round and turn the same way the old plain topbar text did", () => {
    const hud = buildMatchHud(state({ round: 2, turnInRound: 3 }));
    expect(hud.querySelector(".round-gauge-label")?.textContent).toBe("Round 2 of 3");
    expect(hud.querySelector(".turn-dial-label")?.textContent).toBe("Turn 3 of 3");
  });

  it("clamps round/turn display so a match-ending final round/turn never reads as off-by-one", () => {
    const hud = buildMatchHud(state({ round: 5, turnInRound: 9 }));
    expect(hud.querySelector(".round-gauge-label")?.textContent).toBe("Round 3 of 3");
    expect(hud.querySelector(".turn-dial-label")?.textContent).toBe("Turn 3 of 3");
  });

  it("fills exactly `round` segments and `turnInRound` ticks", () => {
    const hud = buildMatchHud(state({ round: 2, turnInRound: 2 }));
    const segments = hud.querySelectorAll(".round-gauge-segment");
    expect(segments).toHaveLength(3);
    const filledSegments = [...segments].filter((s) => s.getAttribute("stroke") === "var(--gold-leaf)");
    expect(filledSegments).toHaveLength(2);

    const ticks = hud.querySelectorAll(".turn-dial-tick");
    expect(ticks).toHaveLength(3);
    expect(hud.querySelectorAll(".turn-dial-tick--filled")).toHaveLength(2);
  });

  it("lamps are readable by position alone — opponent always first (left), you always second (right)", () => {
    const hud = buildMatchHud(state());
    const lamps = hud.querySelectorAll(".turn-lamp");
    expect(lamps[0]?.classList.contains("turn-lamp--ai")).toBe(true);
    expect(lamps[1]?.classList.contains("turn-lamp--human")).toBe(true);
  });

  it("lights exactly the active side's lamp, never both or neither", () => {
    const aiTurn = buildMatchHud(state({ activeSide: "ai" }));
    expect(aiTurn.querySelector(".turn-lamp--ai")?.getAttribute("data-lit")).toBe("true");
    expect(aiTurn.querySelector(".turn-lamp--human")?.getAttribute("data-lit")).toBe("false");

    const humanTurn = buildMatchHud(state({ activeSide: "human" }));
    expect(humanTurn.querySelector(".turn-lamp--ai")?.getAttribute("data-lit")).toBe("false");
    expect(humanTurn.querySelector(".turn-lamp--human")?.getAttribute("data-lit")).toBe("true");
  });

  it("plays the handoff animation only on the render where the turn actually changed", () => {
    const unchanged = buildMatchHud(state({ activeSide: "human", turnJustChanged: false }));
    expect(unchanged.querySelector(".turn-lamp--lighting, .turn-lamp--dimming")).toBeNull();

    const changed = buildMatchHud(state({ activeSide: "human", turnJustChanged: true }));
    expect(changed.querySelector(".turn-lamp--human")?.classList.contains("turn-lamp--lighting")).toBe(true);
    expect(changed.querySelector(".turn-lamp--ai")?.classList.contains("turn-lamp--dimming")).toBe(true);
  });

  it("marks the current segment for the click beat only when the round just advanced", () => {
    const same = buildMatchHud(state({ round: 2, roundJustAdvanced: false }));
    expect(same.querySelector(".round-gauge-segment--advanced")).toBeNull();

    const advanced = buildMatchHud(state({ round: 2, roundJustAdvanced: true }));
    expect(advanced.querySelector(".round-gauge-segment--advanced")).not.toBeNull();
  });
});
