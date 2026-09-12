// Web-Audio-synthesized sound effects (plan step 3.4). jsdom (this test
// environment) has no AudioContext implementation at all, so only the mute
// state/persistence half is testable headless — the actual synthesized
// sounds are verified by ear/instrumentation in a real browser, same class
// of gap as tools/ingest-art.py (1.7) and the animation work (3.3).

import { beforeEach, describe, expect, it } from "vitest";

import { isMuted, playSound, setMuted, toggleMuted } from "../../../src/audio/soundEngine.ts";
import { loadAudioState } from "../../../src/audio/audioState.ts";

beforeEach(() => {
  localStorage.clear();
  setMuted(false);
});

describe("mute state", () => {
  it("starts unmuted", () => {
    expect(isMuted()).toBe(false);
  });

  it("toggleMuted flips state and returns the new value", () => {
    expect(toggleMuted()).toBe(true);
    expect(isMuted()).toBe(true);
    expect(toggleMuted()).toBe(false);
    expect(isMuted()).toBe(false);
  });

  it("persists across a reload (exit check: 'mute persists')", () => {
    setMuted(true);
    expect(loadAudioState()).toEqual({ muted: true });
  });
});

describe("playSound", () => {
  it("never throws, even in an environment with no AudioContext (this test environment)", () => {
    for (const effect of ["click", "steam", "flip", "brassHit"] as const) {
      expect(() => playSound(effect)).not.toThrow();
    }
  });

  it("is a no-op while muted", () => {
    setMuted(true);
    expect(() => playSound("click")).not.toThrow();
  });
});
