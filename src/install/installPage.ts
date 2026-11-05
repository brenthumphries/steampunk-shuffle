// The static install page at /install/ (monthly plan 14 §3.1). Shows the one
// set of steps that matches this phone, and an Install button when the browser
// has offered its prompt. Nothing here reaches the network.

import { captureInstallPrompt, detectInstallPlatform, installPromptAvailable, isStandaloneNow, runInstallPrompt } from "./installPrompt.ts";

const installButton = document.getElementById("install-button") as HTMLButtonElement;
const status = document.getElementById("install-status") as HTMLParagraphElement;

function showSection(name: string): void {
  for (const section of document.querySelectorAll<HTMLElement>("[data-platform]")) {
    section.hidden = section.dataset.platform !== name;
  }
}

function refreshButton(): void {
  installButton.hidden = !installPromptAvailable();
}

const platform = detectInstallPlatform(navigator.userAgent);
if (isStandaloneNow()) showSection("installed");
else if (platform === "android") showSection("android");
else if (platform === "iphone") showSection("iphone");
else showSection("desktop");

captureInstallPrompt(refreshButton);
refreshButton();

window.addEventListener("appinstalled", () => {
  installButton.hidden = true;
  status.textContent = "Added. Look for Wheatstone on your home screen.";
});

installButton.addEventListener("click", () => {
  void runInstallPrompt().then((outcome) => {
    if (outcome === "accepted") status.textContent = "Added. Look for Wheatstone on your home screen.";
    else if (outcome === "dismissed") status.textContent = "No problem. Chrome's menu has Install app whenever you want it.";
    if (outcome === "unavailable") refreshButton();
    else installButton.hidden = true;
  });
});
