# App Privacy answers for App Store Connect (ATT-34)

Checked against the source and both build modes on **2026-10-13**. Plain-language policy page: `public/privacy.html`, served at
`https://brenthumphries.github.io/steampunk-shuffle/privacy.html` once the PR that adds it is merged (merging deploys GitHub Pages).

**Answer: "Data Not Collected."** The grep and the runtime test below prove it, so this is not an assumption.

## What to enter, field by field

App Store Connect, the app, **App Privacy** (the left sidebar). Apple's own page for this screen: [Manage app privacy](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/), read 2026-10-13. Its roles line: answering the privacy questions needs Account Holder, Admin or App Manager.

| Field | Enter | Why |
|---|---|---|
| Privacy Policy URL | `https://brenthumphries.github.io/steampunk-shuffle/privacy.html` | Apple: "A privacy policy URL is required for all apps." The page only exists after this PR is merged and Pages has deployed, so open the URL in a browser before pasting it. |
| User Privacy Choices URL | leave blank | Apple: "optional." There are no choices to offer, since nothing is collected. |
| "Do you or your third-party partners collect data from this app?" | **No, we do not collect data from this app** | Apple: choosing "No" means "You don't need to answer any further questions." Apple's privacy-details page defines collect as "transmitting data off the device in a way that allows you and/or your third-party partners to access it", and says "Data that is processed only on device is not 'collected' and does not need to be disclosed." Everything this app stores stays on the device (below). |
| Data types (the long list), tracking questions | not shown | They only appear if you answer "Yes". If App Store Connect shows them anyway, every one is "not collected" (table below). |
| Publish | click Publish | You are asked to confirm the answers are accurate. They are as of the date above. Re-check before each release (see "When this stops being true"). |

When you answer "No", the listing shows **Data Not Collected**.

## Every data type, for the record

Apple's categories ([App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/), read 2026-10-13), and what the app does with each.

| Category | Collected? | What the app actually has |
|---|---|---|
| Contact Info (name, email, phone, address) | No | A player name the player types, stored on the device only (`steampunk-shuffle:player`). Never sent. No email or phone field exists. |
| Health & Fitness | No | None. No HealthKit, no motion APIs. |
| Financial Info | No | None. No purchases, no in-app purchase, no payment code. Checks are in-game and have no cash value. |
| Location | No | None. No geolocation API; `Info.plist` has no location usage text. |
| Sensitive Info | No | None. |
| Contacts | No | None. No contacts access. |
| User Content (photos, audio, gameplay content, ...) | No | Saved decks, cards and match progress are on the device only. Apple lists "saved games" under Gameplay Content, but only counts it as collected if it leaves the device. It does not. The "Save & data" export writes a file the player chooses where to put; the app never receives it. |
| Browsing / Search History | No | None. |
| Identifiers (user ID, device ID) | No | No account, no advertising ID, no device ID read. |
| Purchases | No | None. |
| Usage Data (product interaction, advertising) | No | No analytics, no ads. Win/loss counts are local game state. |
| Diagnostics (crash, performance) | No | No crash or performance SDK, and no code of the app's own that reports anything. |
| Other Data | No | None. |
| Tracking | No | No third-party SDKs, no advertising, nothing combined with other companies' data. |

## The evidence, so it can be re-run

### 1. Source: nothing that can reach the network

```bash
grep -rnE "\bfetch\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|navigator\.(share|sendBeacon|geolocation|mediaDevices|clipboard)|importScripts|new Worker|window\.open" src index.html
```

Result on 2026-10-13: no matches in app code, apart from `new Image()` and `new Audio()` calls whose URLs are the app's own files (`${import.meta.env.BASE_URL}art/...`, `audio/ambience.mp3`). Same sweep for `analytics|gtag|sentry|firebase|amplitude|mixpanel|segment|posthog|telemetry|googleapis|gstatic|cdnjs|unpkg|jsdelivr|@font-face`: nothing. The only `font-family` is the system stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`), so there are no web fonts. The only absolute URL in `src/` is the SVG namespace `http://www.w3.org/2000/svg`, which is an identifier and is never requested.

### 2. Both builds: what the compiled output contains

```bash
npm run build                                         # Pages bundle -> dist/
npx vite build --mode native --outDir dist-native     # iOS bundle (same as `npm run build:native` but into its own folder)
grep -rhoE "https?://[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+" dist dist-native --include=*.js --include=*.html --include=*.css --include=*.json
grep -rlF "fetch(" dist dist-native --include=*.js
```

| Build | Absolute URLs found | `fetch(` found in |
|---|---|---|
| Pages (`dist/`) | `http://www.w3.org/2000/svg` (namespace); `https://bit.ly/wb-precache` (text inside a Workbox warning message, in `workbox-*.js`, printed to the console only if precaching is misconfigured; never requested) | Vite's module-preload helper (fetches the app's own chunks), Capacitor core's `CapacitorHttp` web code (never called by the app and not enabled in `capacitor.config.ts`), Workbox's own-origin handling |
| Native (`dist-native/`) | `http://www.w3.org/2000/svg` only | the first two of those; no service worker exists in this build |

Nothing in either build uses `XMLHttpRequest`, `sendBeacon`, `WebSocket` or `EventSource`.

### 3. The iOS project

- `ios/App/App/Info.plist` has no `NSLocation...`, `NSCamera...`, `NSMicrophone...`, `NSPhotoLibrary...`, `NSContacts...`, `NSUserTracking...` or other usage-description keys, and no App Transport Security exceptions.
- `capacitor.config.ts` sets no `server.url`, no `allowNavigation`, and does not enable `CapacitorHttp` or `CapacitorCookies`.
- Native dependencies (`ios/App/CapApp-SPM/Package.swift`): Capacitor itself and four plugins: `@capacitor/haptics`, `@capacitor/preferences`, `@capacitor/splash-screen`, `@capacitor/status-bar`. None of them contacts a server. Preferences stores a mirror of the save in the app's own `UserDefaults`.
- `ITSAppUsesNonExemptEncryption` is `false` in `Info.plist`.

### 4. Runtime: a test that fails if any of this changes

`tests/e2e/privacy.spec.ts` plays through the dedication, the whole tutorial, the hub, Save & data, House Rules, the deck builder, the back room, the chalkboard and part of a pickup match, on both the Pages build and the native bundle. It fails if any request goes to another origin, if anything but a `GET` is made, if a WebSocket opens, if a cookie is set, or if `localStorage` holds a key other than the seven the privacy page lists:

`steampunk-shuffle:` + `active-match`, `audio-muted`, `deck-slots`, `player`, `pub-state`, `tournament-state`, `tutorial-state`.

It ran on Chromium (WebKit could not be installed in the session that wrote it; CI runs it on WebKit and Firefox too).

## When this stops being true

Re-open this document before any release that adds: a network call, an analytics or crash SDK, sign-in, in-app purchase, a notification or location permission, a leaderboard, cloud save, or any Capacitor plugin that is not in the list above. The test in section 4 should fail first. The answers, the policy page and `privacy.html`'s "If this ever changes" paragraph all have to change together, before the build is uploaded.

## Two related items that are not App Privacy questions

- **A link to the policy inside the app.** Apple's guideline 5.1.1(i) says "All apps must include a link to their privacy policy in the App Store Connect metadata field and within the app in an easily accessible manner." The app has no such link yet. It is a small code change (for example, a link on the Save & data screen), and it needs checking on a device because a link that opens inside the iOS web view can leave the player stranded. Not done in this PR. It matters for a public App Store release (ATT-32); Apple's TestFlight pages do not list it as a beta requirement (see the "Before you press Submit" block in `docs/testflight-checklist.md`).
- **Apple's privacy manifest.** Separate from the App Privacy answers: Apple requires apps that use certain "required reason" APIs to declare why in a `PrivacyInfo.xcprivacy` file. `@capacitor/preferences` uses `UserDefaults`, which is one of those APIs, and the app target has no manifest of its own. Details and what to check are in the checklist block.
