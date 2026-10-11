// Capacitor-only startup (plan step 4.2). Every function is a no-op in a
// browser, and the plugins are imported lazily so they never run there.

import { Capacitor } from "@capacitor/core";
import { hydrateStorage, mirrorWrites } from "./storageMirror.ts";

export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/** Must finish before anything reads localStorage (see src/boot.ts). */
export async function initNative(): Promise<void> {
  if (!isNative()) return;
  try {
    const { Preferences } = await import("@capacitor/preferences");
    await hydrateStorage(Preferences);
    mirrorWrites(Preferences);
  } catch {
    // The app still runs on plain localStorage; it just loses the backup.
  }
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
  } catch {
    // Cosmetic only.
  }
}
