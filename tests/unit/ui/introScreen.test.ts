import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { INTRO_STALL_MS, introShouldPlay, mountIntroScreen } from "../../../src/ui/introScreen.ts";

describe("introShouldPlay", () => {
  const normal = { search: "", webdriver: false, reducedMotion: false };

  it("plays on an ordinary launch", () => {
    expect(introShouldPlay(normal)).toBe(true);
  });

  it("skips under automation and reduced motion", () => {
    expect(introShouldPlay({ ...normal, webdriver: true })).toBe(false);
    expect(introShouldPlay({ ...normal, reducedMotion: true })).toBe(false);
  });

  it("?intro=0 always skips and ?intro=1 always plays", () => {
    expect(introShouldPlay({ ...normal, search: "?intro=0" })).toBe(false);
    expect(introShouldPlay({ search: "?intro=1", webdriver: true, reducedMotion: true })).toBe(true);
  });
});

describe("mountIntroScreen", () => {
  let root: HTMLElement;
  let play: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    root = document.createElement("div");
    document.body.replaceChildren(root);
    play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("plays the film inline and calls onDone once when it ends", () => {
    const onDone = vi.fn();
    mountIntroScreen(root, { onDone });
    const video = root.querySelector("video");
    expect(video?.getAttribute("src")).toContain("video/intro.mp4");
    expect(video?.playsInline).toBe(true);
    expect(play).toHaveBeenCalledTimes(1);
    video?.dispatchEvent(new Event("ended"));
    video?.dispatchEvent(new Event("ended"));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("tapping anywhere skips", () => {
    const onDone = vi.fn();
    mountIntroScreen(root, { onDone });
    root.querySelector<HTMLElement>(".intro-screen")?.click();
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("starts muted when the game's mute setting is on", async () => {
    localStorage.setItem("steampunk-shuffle:audio-muted", JSON.stringify({ muted: true }));
    vi.resetModules();
    const fresh = await import("../../../src/ui/introScreen.ts");
    fresh.mountIntroScreen(root, { onDone: () => {} });
    expect(root.querySelector("video")?.muted).toBe(true);
  });

  it("retries muted when the browser refuses sound, and keeps playing", async () => {
    play.mockRejectedValueOnce(new DOMException("blocked", "NotAllowedError")).mockResolvedValue(undefined);
    const onDone = vi.fn();
    mountIntroScreen(root, { onDone });
    await vi.advanceTimersByTimeAsync(0);
    expect(root.querySelector("video")?.muted).toBe(true);
    expect(play).toHaveBeenCalledTimes(2);
    expect(onDone).not.toHaveBeenCalled();
  });

  it("gives up and continues if even muted playback is refused", async () => {
    play.mockRejectedValue(new DOMException("blocked", "NotAllowedError"));
    const onDone = vi.fn();
    mountIntroScreen(root, { onDone });
    await vi.advanceTimersByTimeAsync(0);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("continues on a media error", () => {
    const onDone = vi.fn();
    mountIntroScreen(root, { onDone });
    root.querySelector("video")?.dispatchEvent(new Event("error"));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("continues if the video never starts", () => {
    const onDone = vi.fn();
    mountIntroScreen(root, { onDone });
    vi.advanceTimersByTime(INTRO_STALL_MS);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("does not hit the stall timeout once the video is playing", () => {
    const onDone = vi.fn();
    mountIntroScreen(root, { onDone });
    root.querySelector("video")?.dispatchEvent(new Event("playing"));
    vi.advanceTimersByTime(INTRO_STALL_MS * 2);
    expect(onDone).not.toHaveBeenCalled();
  });

  it("teardown clears the screen and never fires onDone", () => {
    const onDone = vi.fn();
    const teardown = mountIntroScreen(root, { onDone });
    teardown();
    vi.advanceTimersByTime(INTRO_STALL_MS * 2);
    expect(root.querySelector("video")).toBeNull();
    expect(onDone).not.toHaveBeenCalled();
  });
});
