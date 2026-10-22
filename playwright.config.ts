import { defineConfig, devices } from "@playwright/test";

// The game's one supported viewport, matching the iPhone 17 it's actually
// tuned for (CLAUDE.md's own testing convention: every screen gets at
// least one Playwright smoke test at 402x874). Every project below shares
// it rather than each browser's own default desktop size, so a
// cross-browser run isolates real engine differences instead of
// confounding them with desktop-responsive behavior nothing has designed
// or tested for yet.
const viewport = { width: 402, height: 874 };

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  // CI only: WebKit and Firefox each drop one test per run now and then (a WebKit
  // "internal error" on reload, a Firefox "Image corrupt or truncated" on a
  // navigation), a different test each time, which blocked the Pages deploy on
  // 22 Oct. A retried pass is reported as flaky, not hidden; a real bug fails all three.
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4173",
  },
  webServer: [
    {
      command: "npm run build && npm run preview -- --port 4173",
      url: "http://localhost:4173/steampunk-shuffle/",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    // The iOS bundle (CLAUDE.md, "iOS wrap"): same app, base "/", no service
    // worker. Built into its own folder so it never clobbers dist/, which is
    // what the Pages deploy and `cap sync` read.
    {
      command: "npx vite build --mode native --outDir dist-native --emptyOutDir && npx tsx tools/serveNative.ts 4174 dist-native",
      url: "http://localhost:4174/",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
  // Four named browsers, not four devices. Safari and Firefox are genuinely
  // their own engines (WebKit/Gecko) — Playwright bundles real builds of
  // both, so this is real cross-engine coverage even on Linux CI, which is
  // the whole point of using Playwright here rather than needing a Mac to
  // catch a WebKit-only bug. Chrome and Edge are both Chromium underneath,
  // so `devices["Desktop Chrome"/"Desktop Edge"]` alone would launch the
  // *same* bundled Chromium build for both, indistinguishably — `channel:
  // "chrome"/"msedge"` is what actually downloads and launches the real
  // branded binaries (`npx playwright install chrome msedge`, wired into
  // .github/workflows/deploy.yml's e2e job).
  projects: [
    {
      name: "Safari",
      use: { ...devices["iPhone 17"], viewport },
    },
    {
      name: "Chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome", viewport },
    },
    {
      name: "Firefox",
      use: { ...devices["Desktop Firefox"], viewport },
    },
    {
      name: "Edge",
      use: { ...devices["Desktop Edge"], channel: "msedge", viewport },
    },
    // The native bundle on WebKit, the engine closest to the iOS app's
    // WKWebView. The full suite runs against it; `tools/serveNative.ts`
    // redirects the specs' `/steampunk-shuffle/` entry URL to its root.
    {
      name: "Native",
      use: { ...devices["iPhone 17"], viewport, baseURL: "http://localhost:4174" },
    },
  ],
});
