// The launch intro (Brent, Oct 22): a 10-second film of the Wheatstone Bridge
// that plays on every launch, before the dedication or the pub. It is a plain
// <video>, tap anywhere to skip, and it must never trap the player: if the
// browser refuses to play it, errors, or stalls, `onDone` fires and the game
// carries on. Autoplay rules: the native iOS app allows sound (Capacitor sets
// mediaTypesRequiringUserActionForPlayback to none); Safari and the Home Screen
// PWA refuse unmuted autoplay, so a rejected play() retries muted.

import { isMuted } from "../audio/soundEngine.ts";

export const INTRO_STALL_MS = 8000;

export interface IntroScreenOptions {
  onDone: () => void;
}

export interface IntroEnvironment {
  /** `window.location.search`. `?intro=0` always skips, `?intro=1` always plays. */
  search: string;
  /** `navigator.webdriver`: automated browsers (Playwright) skip, so the specs don't wait ten seconds on every boot. */
  webdriver: boolean;
  reducedMotion: boolean;
}

export function introShouldPlay(env: IntroEnvironment): boolean {
  const flag = new URLSearchParams(env.search).get("intro");
  if (flag === "0") return false;
  if (flag === "1") return true;
  return !env.webdriver && !env.reducedMotion;
}

export function currentIntroEnvironment(): IntroEnvironment {
  return {
    search: window.location.search,
    webdriver: navigator.webdriver === true,
    reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
  };
}

function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`;
}

/** Mounts the intro into `root` and returns a teardown function. `onDone` fires at most once. */
export function mountIntroScreen(root: HTMLElement, options: IntroScreenOptions): () => void {
  let finished = false;
  let stallTimer: ReturnType<typeof setTimeout> | undefined;

  const screen = document.createElement("div");
  screen.className = "intro-screen";
  screen.setAttribute("role", "button");
  screen.setAttribute("aria-label", "Skip intro");

  const video = document.createElement("video");
  video.className = "intro-video";
  video.src = assetUrl("video/intro.mp4");
  video.poster = assetUrl("video/intro-poster.webp");
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.preload = "auto";
  video.muted = isMuted();
  video.disablePictureInPicture = true;
  screen.appendChild(video);

  const hint = document.createElement("p");
  hint.className = "intro-skip-hint";
  hint.textContent = "Tap to skip";
  screen.appendChild(hint);

  function finish(): void {
    if (finished) return;
    finished = true;
    if (stallTimer) clearTimeout(stallTimer);
    video.pause();
    options.onDone();
  }

  screen.addEventListener("click", finish);
  video.addEventListener("ended", finish);
  video.addEventListener("error", finish);
  video.addEventListener("playing", () => {
    if (stallTimer) clearTimeout(stallTimer);
  });

  // A video that never starts (slow storage, a codec the webview lacks) must not hold the game hostage.
  stallTimer = setTimeout(finish, INTRO_STALL_MS);

  function start(): void {
    const attempt = video.play();
    if (!attempt) return;
    attempt.catch(() => {
      if (finished) return;
      if (!video.muted) {
        video.muted = true;
        const retry = video.play();
        if (retry) retry.catch(finish);
      } else {
        finish();
      }
    });
  }

  root.replaceChildren(screen);
  start();

  return () => {
    finished = true;
    if (stallTimer) clearTimeout(stallTimer);
    video.pause();
    video.removeAttribute("src");
    video.load();
    root.replaceChildren();
  };
}
