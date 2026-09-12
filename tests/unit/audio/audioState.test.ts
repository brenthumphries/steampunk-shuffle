// localStorage persistence for the mute toggle (plan step 3.4).

import { beforeEach, describe, expect, it } from "vitest";

import { defaultAudioState, loadAudioState, saveAudioState } from "../../../src/audio/audioState.ts";

beforeEach(() => {
  localStorage.clear();
});

describe("loadAudioState", () => {
  it("defaults to unmuted when nothing is saved", () => {
    expect(loadAudioState()).toEqual({ muted: false });
    expect(defaultAudioState()).toEqual({ muted: false });
  });

  it("falls back to defaults on corrupt JSON rather than throwing", () => {
    localStorage.setItem("steampunk-shuffle:audio-muted", "{not json");
    expect(loadAudioState()).toEqual({ muted: false });
  });

  it("falls back to defaults when the shape doesn't match", () => {
    localStorage.setItem("steampunk-shuffle:audio-muted", JSON.stringify({ muted: "yes" }));
    expect(loadAudioState()).toEqual({ muted: false });
  });
});

describe("saveAudioState / loadAudioState round trip", () => {
  it("persists a muted toggle across a reload", () => {
    saveAudioState({ muted: true });
    expect(loadAudioState()).toEqual({ muted: true });
  });
});
