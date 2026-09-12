// A small self-updating mute button (plan step 3.4), dropped into the pub
// hub header and the match screen's topbar. Deliberately not part of either
// screen's own DOM-glue/full-rebuild pattern — it manages its own icon/
// aria-state in place via `sync()` so toggling mute mid-match doesn't need
// to trigger a full match-screen rebuild just to redraw one button.

import { isMuted, toggleMuted } from "../audio/soundEngine.ts";

export function buildMuteToggle(): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "mute-toggle";

  function sync(): void {
    const muted = isMuted();
    btn.textContent = muted ? "🔇" : "🔊";
    btn.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
    btn.setAttribute("aria-pressed", String(muted));
  }

  btn.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMuted();
    sync();
  });

  sync();
  return btn;
}
