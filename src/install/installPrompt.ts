// Install from the web (monthly plan 14 §3.1, step X-B1). The game is already
// an installable web app on the Pages build; this module decides when to offer
// it (Android Chrome only, once), runs the browser's own install prompt, and
// asks for persistent storage once the app runs installed.
//
// The native iOS bundle (`vite build --mode native`) never offers an install:
// the app is already installed there, and an install prompt must never show
// inside it. The check is build-time, so the native build drops this code path.

import { loadPlayerState, markInstallOfferSeen, markStorageRequested, savePlayerState } from "../player/playerState.ts";

export type InstallPlatform = "android" | "iphone" | "desktop";

export const NATIVE_BUILD = import.meta.env.MODE === "native";

export function detectInstallPlatform(userAgent: string): InstallPlatform {
  if (/android/i.test(userAgent)) return "android";
  if (/iphone|ipad|ipod/i.test(userAgent)) return "iphone";
  return "desktop";
}

export function isStandaloneDisplay(matchesStandaloneQuery: boolean, navigatorStandalone: boolean | undefined): boolean {
  return matchesStandaloneQuery || navigatorStandalone === true;
}

export interface InstallOfferInput {
  native: boolean;
  platform: InstallPlatform;
  standalone: boolean;
  promptAvailable: boolean;
  offerSeen: boolean;
}

/** The one-time beer mat: Android Chrome, not yet installed, the browser has offered its prompt, and the mat has not been shown before. */
export function shouldOfferInstall(input: InstallOfferInput): boolean {
  return !input.native && input.platform === "android" && !input.standalone && input.promptAvailable && !input.offerSeen;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | undefined;

/**
 * Keeps the browser's prompt for later, so the game (or the install page) can
 * show its own button instead of the browser's banner. `onAvailable` runs when
 * the prompt arrives, which can be after the page has already drawn.
 */
export function captureInstallPrompt(onAvailable?: () => void, target: Window = window): void {
  if (NATIVE_BUILD) return;
  target.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    onAvailable?.();
  });
}

export function installPromptAvailable(): boolean {
  return deferredPrompt !== undefined;
}

/** Shows the browser's install dialog. The prompt can be used once, so it is cleared either way. */
export async function runInstallPrompt(): Promise<"accepted" | "dismissed" | "unavailable"> {
  const event = deferredPrompt;
  if (!event) return "unavailable";
  deferredPrompt = undefined;
  try {
    await event.prompt();
    const { outcome } = await event.userChoice;
    return outcome;
  } catch {
    return "unavailable";
  }
}

export function isStandaloneNow(): boolean {
  const query = typeof window.matchMedia === "function" && window.matchMedia("(display-mode: standalone)").matches;
  return isStandaloneDisplay(query, (navigator as Navigator & { standalone?: boolean }).standalone);
}

/** Whether the hub should show the install beer mat right now. */
export function installOfferDue(): boolean {
  return shouldOfferInstall({
    native: NATIVE_BUILD,
    platform: detectInstallPlatform(navigator.userAgent),
    standalone: isStandaloneNow(),
    promptAvailable: installPromptAvailable(),
    offerSeen: loadPlayerState().installOfferSeen === true,
  });
}

export function markInstallOfferShown(): void {
  savePlayerState(markInstallOfferSeen(loadPlayerState()));
}

/**
 * Once, after the web app first runs installed: asks the browser to keep the
 * game's storage rather than clear it under pressure. The 30-day "Send this
 * ledger" reminder waits for ledger transfer (plan 14 §2.2, X-A2).
 */
export async function requestPersistentStorageOnce(): Promise<void> {
  if (NATIVE_BUILD || !isStandaloneNow()) return;
  const player = loadPlayerState();
  if (player.storageRequested === true) return;
  savePlayerState(markStorageRequested(player));
  try {
    await navigator.storage?.persist?.();
  } catch {
    // Denied or unsupported: the game still works, the browser may just clear it under pressure.
  }
}
