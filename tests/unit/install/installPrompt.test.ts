// The install offer and install-page platform detection (monthly plan 14 §3.1).
// The pure rules are tested directly; the once-only and persist paths run
// against the real player-state key with a stubbed matchMedia and storage.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { detectInstallPlatform, isStandaloneDisplay, requestPersistentStorageOnce, shouldOfferInstall, type InstallOfferInput } from "../../../src/install/installPrompt.ts";
import { loadPlayerState, markInstallOfferSeen, savePlayerState } from "../../../src/player/playerState.ts";

const ANDROID_CHROME = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36";
const IPHONE_SAFARI = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const IPAD_SAFARI = "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const MAC_CHROME = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

const OFFER: InstallOfferInput = { native: false, platform: "android", standalone: false, promptAvailable: true, offerSeen: false };

describe("detectInstallPlatform", () => {
  it("recognises Android, iPhone and iPad, and treats everything else as a computer", () => {
    expect(detectInstallPlatform(ANDROID_CHROME)).toBe("android");
    expect(detectInstallPlatform(IPHONE_SAFARI)).toBe("iphone");
    expect(detectInstallPlatform(IPAD_SAFARI)).toBe("iphone");
    expect(detectInstallPlatform(MAC_CHROME)).toBe("desktop");
    expect(detectInstallPlatform("")).toBe("desktop");
  });
});

describe("isStandaloneDisplay", () => {
  it("is standalone on either the display-mode query or iOS's navigator.standalone", () => {
    expect(isStandaloneDisplay(true, undefined)).toBe(true);
    expect(isStandaloneDisplay(false, true)).toBe(true);
    expect(isStandaloneDisplay(false, false)).toBe(false);
    expect(isStandaloneDisplay(false, undefined)).toBe(false);
  });
});

describe("shouldOfferInstall", () => {
  it("offers on Android Chrome when the prompt is available, the app is not installed, and the mat was never shown", () => {
    expect(shouldOfferInstall(OFFER)).toBe(true);
  });

  it("never offers inside the native iOS bundle, whatever else is true", () => {
    expect(shouldOfferInstall({ ...OFFER, native: true })).toBe(false);
  });

  it("does not offer on iPhone, desktop, or without the browser's prompt", () => {
    expect(shouldOfferInstall({ ...OFFER, platform: "iphone" })).toBe(false);
    expect(shouldOfferInstall({ ...OFFER, platform: "desktop" })).toBe(false);
    expect(shouldOfferInstall({ ...OFFER, promptAvailable: false })).toBe(false);
  });

  it("does not offer once the app is already installed", () => {
    expect(shouldOfferInstall({ ...OFFER, standalone: true })).toBe(false);
  });

  it("is a one-time beer mat: never again once it has been shown", () => {
    expect(shouldOfferInstall({ ...OFFER, offerSeen: true })).toBe(false);
  });
});

describe("player-state fields for the install beer mat and storage request", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips the optional flags without disturbing the rest of the profile", () => {
    savePlayerState(markInstallOfferSeen({ name: "Sara", dedicationSeen: true }));
    expect(loadPlayerState()).toEqual({ name: "Sara", dedicationSeen: true, installOfferSeen: true });
  });

  it("leaves the flags out of a profile that never had them", () => {
    savePlayerState({ name: "Sara", dedicationSeen: false });
    expect(loadPlayerState()).toEqual({ name: "Sara", dedicationSeen: false });
  });
});

describe("requestPersistentStorageOnce", () => {
  let persist: ReturnType<typeof vi.fn>;
  let standalone: boolean;

  beforeEach(() => {
    localStorage.clear();
    standalone = true;
    persist = vi.fn(async () => true);
    vi.stubGlobal("navigator", { ...navigator, storage: { persist } });
    window.matchMedia = ((query: string) => ({ matches: standalone && query.includes("standalone") })) as unknown as typeof window.matchMedia;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete (window as { matchMedia?: unknown }).matchMedia;
  });

  it("asks the browser once, when the app runs installed, and records that it asked", async () => {
    await requestPersistentStorageOnce();
    await requestPersistentStorageOnce();
    expect(persist).toHaveBeenCalledTimes(1);
    expect(loadPlayerState().storageRequested).toBe(true);
  });

  it("does nothing in a browser tab", async () => {
    standalone = false;
    await requestPersistentStorageOnce();
    expect(persist).not.toHaveBeenCalled();
    expect(loadPlayerState().storageRequested).toBeUndefined();
  });
});
