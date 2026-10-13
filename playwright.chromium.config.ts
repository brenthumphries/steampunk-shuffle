import { devices, defineConfig } from "@playwright/test";
import base from "./playwright.config.ts";

// For sandboxes that can't download Playwright's WebKit and Firefox builds:
// the same Pages and Native projects, run on the Chromium that ships with the
// image at the iPhone 17 profile. Not a substitute for the Safari run in CI.
//   npx playwright test -c playwright.chromium.config.ts
const executablePath = process.env.PW_CHROMIUM_PATH ?? "/opt/pw-browsers/chromium";
const viewport = { width: 402, height: 874 };
const chromium = { ...devices["iPhone 17"], defaultBrowserType: "chromium" as const, viewport, launchOptions: { executablePath } };

export default defineConfig({
  ...base,
  projects: [
    { name: "Chromium-Pages", use: chromium },
    { name: "Chromium-Native", use: { ...chromium, baseURL: "http://localhost:4174" } },
  ],
});
