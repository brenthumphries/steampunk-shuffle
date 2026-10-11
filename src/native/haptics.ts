// iOS has no navigator.vibrate (CLAUDE.md, iOS conventions), so haptics go
// through the Capacitor plugin and do nothing in a browser.

import { Capacitor } from "@capacitor/core";

export function hapticTap(): void {
  if (!Capacitor.isNativePlatform()) return;
  void import("@capacitor/haptics")
    .then(({ Haptics, ImpactStyle }) => Haptics.impact({ style: ImpactStyle.Light }))
    .catch(() => {});
}
