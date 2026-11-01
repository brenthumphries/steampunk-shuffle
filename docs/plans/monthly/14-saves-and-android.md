# Release 1.1: Multiple Saves, Cross-Device Play, and Android

**Status:** approved by Brent, 2026-10-31, with his decisions in §4: TestFlight only, no automatic sync, Android deferred to a later target, 4 ledgers. The ★ marks in §1 to §3 record the options he weighed.
**Scope:** two features for the next store release, scheduled into the monthly orchestration (`12-orchestration-runbook.md`) so one Opus conversation runs everything.

---

## 1. Short answers

**Multiple saves and switching devices: feasible. Logins are only needed for one part of it.**
- Several separate games on one device, plus moving a game to another phone (iPhone, Android or the web) by sending a save file: **no logins.** This builds on the export/import the game already has (`src/save/saveFile.ts`, the Save & data screen).
- **Automatic** syncing, where you play on one phone and pick up on another without sending anything: **this needs an account.** It also changes the App Store privacy answer from "Data Not Collected" and brings Apple's and Google's account-deletion rules with it. It's specced below as an optional third phase (★ A3).

**Android for non-technical users: feasible, with one decision about cost.**
- **Free, available almost immediately:** the game already runs as an installable web app (PWA) from GitHub Pages. On an Android phone, Chrome offers "Install app", and it then opens from the home screen like any other app and works offline. A short install page and an in-game install button make that easy for anyone.
- **Google Play:** needs a Google Play developer account, which costs a **one-time US$25 fee** plus ID verification, and verifying access to an **Android device** through the Play Console app ([Google](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en)). That's new spending under the project's no-new-spending rule, so it's ★ Brent's call. Once the account exists, an **internal-testing** track lets you invite up to 100 people by email: the Android equivalent of TestFlight, with no store review of the gift-edition content. A **public** Play listing is a bigger step, see §3.4.
- **Not recommended:** the Amazon Appstore stopped serving Android phones on Aug 20, 2025 ([Amazon](https://developer.amazon.com/apps-and-games/blogs/2025/02/upcoming-changes-to-amazon-appstore-for-android-devices-and-coins-program)). Emailing an APK file is a poor fit for non-technical people, and from 2027 Android will make apps from unverified developers go through an extra install flow with a 24-hour wait ([Android Authority](https://www.androidauthority.com/android-sideloading-changes-timeline-3679204/)).

---

## 2. Feature A: multiple saves and cross-device play

### 2.1 What the player sees

- **The Ledger Shelf.** Each separate game is a **ledger**, the pub's word for a save. A new screen, opened from the title screen and from Settings, shows each ledger as a little leather-bound book: player name, title (Newcomer … Legend of the Bridge), wins, collection count, and last played. Up to **4 ledgers** per device.
- **Start a new ledger:** pick a name (default "Sara" for the first, blank after that), and it begins at the tutorial.
- **Switch:** tap another ledger. The pub reloads into that game. A match in progress is saved and resumes when you switch back.
- **Delete:** a ledger can be deleted only after typing its name, and it's exported to a backup file first.
- **Move a ledger to another device** (no login):
  - **Send this ledger:** the Share sheet sends one `.wheatstone` file (by AirDrop, Messages, email, Files or Google Drive) to any iPhone, Android phone or browser.
  - **Receive a ledger:** opening a `.wheatstone` file in the game (or picking it in Receive) offers **Add as a new ledger**, or **Replace "<name>"** when it's the same ledger coming back. The game knows because every ledger has a hidden id. It shows which copy is newer (*"This copy: last played 3 Dec, 41 wins. The one you're receiving: 5 Dec, 44 wins."*), and the replaced copy is backed up first.
  - **Same ledger, two devices:** if it's been played on both since it was last sent, the newer one wins only after the player confirms. Nothing is ever merged silently.
- **The current single save becomes ledger 1 automatically**, named from the existing player name. Her progress must survive this; see §2.3.

### 2.2 How it works (for the build agents)

- Today every system keeps its state in its own `localStorage` key (pub, decks, tournaments, active match, tutorial, audio, player, plus the monthly plan's ledger, gifts, garden, booth, gauntlet and so on), and the Capacitor Preferences mirror (`src/native/storageMirror.ts`) copies them on iOS.
- **Profile namespacing:** every per-game key becomes `ws:<ledgerId>:<key>`. Device-wide keys (mute, the intro film flag, Reduce Motion overrides, the ledger registry itself) stay global. One small `storageKey(name)` helper is the only place prefixes are built, and a lint-style unit test fails if any module calls `localStorage` with a raw per-game key.
- **The registry** is a global key `ws:ledgers` holding `{ id (uuid), name, createdAt, lastPlayedAt, summary }[]` and `activeId`.
- **The save file** moves to `SAVE_FILE_VERSION = 2`: it carries `ledgerId`, `ledgerName`, a `summary`, every namespaced key's value, and a SHA-256 checksum so a damaged file is refused politely. Version 1 files still import, as a new ledger.
- **File handling:** on iOS, register the `.wheatstone` document type (UTI) so tapping the file opens the game; on Android, an intent filter; on the web, a file picker plus the File Handling API where the browser supports it. Sending uses the Capacitor Share and Filesystem plugins on native and the Web Share API (with a download fallback) on the web.
- **Seasonal-event state is per ledger:** gifts, advent doors, the Booth, letters seen and so on. Letters from B. show in every ledger, since they're for the device's owner, not a save.
- **Nothing leaves the device** except files the player chooses to share, so the "Data Not Collected" answer and the privacy test stay true for A1 and A2.

### 2.3 Protecting her existing save (non-negotiable)

1. Before the migration runs, the game writes a full version-1 export of the current save to a backup key **and** keeps the original un-prefixed keys untouched for 30 days. Rollback is copying them back.
2. The migration is idempotent and tested against a fixture built from a real save: every key and value is identical after migrating, then exporting, then importing into a fresh install.
3. On the first launch after the update, a beer mat says: *"Sir Charles has moved your ledger onto a shelf. Nothing's changed. There's a copy in the cellar, should you want it."* The Save & data screen gets a "Restore the cellar copy" button for those 30 days.
4. The playtest agent runs the upgrade path on iOS (Capacitor build in CI) and on the web against a save made with the current release before anything ships.

### 2.4 Optional phase A3: automatic sync (★)

Only if Brent wants "pick up on the other phone without sending anything."

| Option | Works across | Login | Cost | Notes |
|---|---|---|---|---|
| **(a) Sign in with Apple and Google + Firebase (Auth and Firestore)** | iPhone, Android, web | Optional, per ledger ("Keep this ledger in the cloud") | Firebase's free tier covers a few players | Changes the App Store privacy label (gameplay data and an identifier become "collected", not tracking) and Play's Data safety form. Apple requires in-app account deletion ([Apple 5.1.1(v)](https://developer.apple.com/support/offering-account-deletion-in-your-app)); Google requires an account-deletion path too. Sign in with Apple satisfies Apple's login rule when Google sign-in is offered. Needs a privacy-policy update. |
| **(b) Each platform's own cloud** (iCloud key-value store on iPhone, Google Drive app data on Android) | Only within one platform | iCloud is automatic; Google needs a sign-in | Free | No server of your own, but an iPhone and an Android phone can't share a ledger. |
| **(c) No automatic sync** (A1 and A2 only) | Everything, by file | None | Free | **Recommended for Release 1.1.** Revisit after Sara has used ledger transfer for a while. |

If (a) is chosen: the game stays fully playable signed out; sync is last-writer-wins per ledger with the same "which copy?" prompt as §2.1 when both changed; an active match is never synced mid-turn; and account deletion removes the cloud copy and keeps local ledgers.

---

## 3. Feature B: Android

### 3.1 B1: install from the web (free, immediate)

- An **install page** on the existing GitHub Pages site (`/install/`) detects the phone and shows two big steps with pictures: Android ("Tap **Install app**" via the browser's install prompt, with a button that triggers it) and iPhone ("Share → **Add to Home Screen**", or the TestFlight link while that exists). It also has a QR code for the gift card or a text message.
- **In-game:** on Android Chrome, when the game isn't installed, a one-time beer mat offers *"Keep the Bridge on your home screen?"* using the `beforeinstallprompt` event.
- **Storage safety:** call `navigator.storage.persist()` once installed, and remind about "Send this ledger" as a backup every 30 days on the web build only.
- **Cost:** none. **Limit:** it's a web app. It updates itself when online and works offline, but it isn't in a store.

### 3.2 B2: a real Android app (Capacitor)

- Add `@capacitor/android` and **commit the `android/` project** (it's currently a gitignored local test wrapper). Set the app id to `com.brenthumphries.steampunkshuffle` and the name to "Wheatstone".
- **Android-specific work:**
  - The **hardware/gesture Back button:** back goes to the previous screen; in a match it opens the existing "Leave game?" confirm; on the hub it asks before closing.
  - Edge-to-edge and status-bar insets, splash screen, adaptive icon (from the existing icon art).
  - Screen sizes: test at 360×800, 393×873 and 412×915 as well as the iPhone's 402×874.
  - Storage: the Preferences mirror on Android; the launch intro film's playback; haptics.
  - `.wheatstone` file intent (§2.2).
- **CI:** a Linux GitHub Actions job (free) builds a signed **AAB** with the upload key from repo secrets, runs the unit tests, and uploads the AAB as a build artifact.
- **Testing:** Playwright runs the native bundle at Android viewports with an Android Chrome user agent in CI. No Android emulator runs in this cloud environment, so real-device checks come from internal testers (§3.3).

### 3.3 B3: Google Play internal testing (★ $25 and an Android device)

The Android TestFlight: a private Play listing for up to 100 invited testers, with **no 12-tester rule** (that rule only gates the public production listing).
- **Brent, once:** create the Google Play developer account (personal; the US$25 one-time fee; ID verification), verify device access with the Play Console app on an Android phone, create the app record, enable Play App Signing, create a service account with release-manager rights, and add its JSON key plus the upload keystore to the repo secrets.
- **Claude:** the release agent's workflow uploads each AAB to the **internal** track through the Play Developer API (fastlane `supply`) whenever iOS goes to TestFlight, so both platforms ship from one merge. Testers join from an opt-in link. Claude also writes the store-listing text, the screenshots (`tools/store-screenshots.ts` at Android sizes), the **Data safety** answers ("No data collected", true for A1 and A2) and the **content rating** questionnaire answers.
- ★ **Content rating watch-out:** the Bar Bet (staking a card on a game) may count as **simulated gambling** in the rating questionnaire, which can raise the age rating. The agent drafts the answers and flags that question for Brent.

### 3.4 B4: public Google Play listing (★ later, together with a public App Store listing)

- **Google's rule for new personal accounts:** at least **12 testers opted in to a closed test for 14 days in a row** before you can apply for production access ([Google](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)). Brent needs 12 real people with Android phones.
- **The same public-edition work as a public App Store listing:** a `VITE_EDITION=public` build without the gift touches or the `giftOnly` allusions, and the "High" IP items in `docs/app-store-readiness.md` §4 (the Christie and Poirot replacements and the film jokes) resolved.
- So B4 is **not** in Release 1.1 unless Brent says the next App Store release is also public (★ below).

---

## 4. Decisions (settled by Brent, Oct 31)

1. **The next App Store release stays on TestFlight** for family and friends. No public-edition work is needed for Release 1.1, and the gift touches stay in.
2. **No automatic sync for now** (option c). Release 1.1 ships A1 and A2: ledgers plus moving a ledger by file. A3 stays specced in §2.4 for later.
3. **Android is deferred.** Brent doesn't have an Android phone, so no Google Play account and no Android app build yet. Android stays a **later deployment target**: B2 to B4 (§3.2 to §3.4) and their prompts below are kept ready, but nothing Android-only is scheduled. The free web install page (B1) still ships, because it costs nothing, needs no device, and helps iPhone users too (Add to Home Screen).
4. **4 ledgers per device.**

## 5. Steps, agents and schedule

**Release 1.1 ships on Dec 21**, together with January's content, on TestFlight and Pages, so the profile refactor never collides with the compressed November build.

| # | Step | Agent · model · size | Needs | Target |
|---|---|---|---|---|
| X-0 | Set up the Linear issues (decisions are settled, §4) | Orchestrator | — | with November kickoff |
| X-B1 | Install page and in-game install prompt (web, free) | Build · Haiku · S = 2 | — | Nov 28 (ships with December's build) |
| X-A1 | Ledger Shelf and namespacing migration | Build · Sonnet · L = 5 | November merged | Nov 28 – Dec 3 |
| X-A2 | `.wheatstone` send and receive, version-2 save file, file handling (iOS and web; Android intent left as a hook) | Build · Sonnet · M = 3 | X-A1 | Dec 4 – 8 |
| X-T | Upgrade-path playtest (part 1 of the X-T prompt only) | Playtest · Sonnet · S = 2 | X-A2 | Dec 9 – 12 |
| R-1.1 | Ship: TestFlight + Pages | Release · Haiku | everything above, ship gate | **Dec 21** |

**Later, not scheduled (Android target):**

| # | Step | Starts when |
|---|---|---|
| X-B2 | Capacitor Android app and the AAB CI job | Brent says go on Android (it needs no Android phone to *build*, but there's no point until it can be distributed) |
| X-T part 2 | Android-viewport playtest | after X-B2 |
| X-B3 | Google Play internal track (setup S-12 and S-13: the US$25 account, Google's device check with an Android phone, the secrets) | Brent has an Android phone (or a family member's) for Google's device verification and approves the fee |
| X-B4 | Public Play listing | a public release is planned (12 testers for 14 days, the public-edition IP work) |
| X-A3 | Automatic cloud sync | Brent asks for it |

When Brent says "start Android", the orchestrator adds X-B2 and X-T part 2 into the next gap in the monthly schedule, and asks for S-12 and S-13 only when X-B3 is next.

These steps share the daily budget with the monthly content (about 8 points a day, 2 agents at once). The orchestrator puts them on days when the month's content work leaves room: late November after December's build, and early December before January's art finishes.

## 6. Agent prompts

Each prompt runs inside the runbook §11 wrapper ("me" means the orchestrator).

### X-A1 · The Ledger Shelf (Build agent · Sonnet · L = 5)

```
Read CLAUDE.md, the last three docs/logs entries, docs/design.md §12.4, src/save/saveFile.ts, src/native/storageMirror.ts, and docs/plans/monthly/14-saves-and-android.md §2.1-§2.3.

Build multiple save ledgers on one device.
1. src/save/ledgers.ts: the global registry key "ws:ledgers" ({ id uuid, name, createdAt, lastPlayedAt, summary: { title, wins, collectionCount } }[] plus activeId), with create, switch, rename, delete (delete requires the exported backup first, see 4) and a maximum of 4 (a constant).
2. Namespacing: add storageKey(name) returning `ws:${activeId}:${name}` for per-game keys, and route EVERY per-game localStorage read and write through it (pub, decks, tournaments, active match, tutorial, player, ledger stats, gifts, events, booth, garden, gauntlet, mystery and anything else that is per-game). Device-wide keys stay global: list them in one constant (audio/mute, intro flag, the registry, letters-seen). Add a unit test that scans src/ for localStorage calls with string literals and fails unless the key is in the global list or built with storageKey.
3. Migration (§2.3, non-negotiable): on first launch with no registry, copy (don't move) every existing per-game key into a new ledger named from the current player name, write a full version-1 export to "ws:backup:v1", record migratedAt, and leave the original keys for 30 days, after which a later launch deletes them. Idempotent. Add "Restore the cellar copy" to the Save & data screen for those 30 days. Show the beer mat from §2.3 once.
4. The Ledger Shelf screen (from the title screen and Settings): books for each ledger with the summary, last played and the active one marked; New, Switch, Rename and Delete (type the name to confirm; exports a backup file through the existing export path first). Switching saves the active match and reloads the app into the chosen ledger.
5. Native: storageMirror must mirror namespaced keys and the registry, and hydrate them on launch; test with the Preferences fake.
6. design.md §12.5 "Ledgers".

Tests: a fixture save captured from the current release migrates with every key and value identical; the migration is idempotent; switching isolates every system (wins, gifts, booth draws, decks); the max of 4; deleting requires the backup; restoring the cellar copy; the namespacing scan test; the native mirror. A Playwright test that creates two ledgers, plays a tutorial step in each, and switches back and forth.

Exit: npm run typecheck && npm test pass. Write /log. Push your branch and open a PR (wrapper W3). Don't merge.
```

### X-A2 · Send and receive a ledger (Build agent · Sonnet · M = 3)

```
Read CLAUDE.md, the last three docs/logs entries, docs/plans/monthly/14-saves-and-android.md §2.1-§2.2, and the X-A1 PR's design.md §12.5. X-A1 has merged.

1. Save file version 2 (src/save/saveFile.ts): { version: 2, ledgerId, ledgerName, summary, exportedAt, keys: Record<string, string>, sha256 }. Exports cover only the active ledger. Imports verify the checksum (refuse politely if damaged) and accept version 1 as a new ledger.
2. Send: "Send this ledger" writes <name>-<date>.wheatstone and opens the share sheet (Capacitor Share + Filesystem on native; Web Share API with a file, falling back to a download, on the web).
3. Receive: "Receive a ledger" (a file picker) plus opening a .wheatstone file from outside the app: register the document type on iOS (Info.plist UTI, the file extension, "Open in"), an intent filter on Android (added in X-B2; leave a TODO and a test hook if X-B2 hasn't merged yet), and the File Handling API in the web manifest where supported. Same ledgerId already on the device: show both summaries and dates and offer Replace (backup first) or Keep both. New id: add as a new ledger (respecting the max; if full, ask which to replace or cancel).
4. The privacy test (nothing leaves the device unless the player shares a file) must stay green; add a case for the share path.

Tests: round trip (export, import into a fresh install, identical keys); a damaged checksum is refused; version 1 import; replace vs keep both; the max-ledgers path; the share fallback on the web. A Playwright test that exports and imports.

Exit: npm run typecheck && npm test pass. Write /log. Push your branch and open a PR (wrapper W3). Don't merge.
```

### X-B1 · Install from the web (Build agent · Haiku · S = 2)

```
Read CLAUDE.md, the last three docs/logs entries, vite.config.ts (vite-plugin-pwa), and docs/plans/monthly/14-saves-and-android.md §3.1.

1. A static page at /install/ (built by Vite into the Pages site) in the game's parchment-and-brass style: it detects Android, iPhone or desktop and shows the matching two steps with simple SVG illustrations; on Android Chrome, an Install button that calls the deferred beforeinstallprompt; a QR code of the game URL, generated at build time (add a small dev dependency, or inline an SVG QR you generate in a build script). No external requests at runtime.
2. In-game: on Android Chrome when not installed (display-mode isn't standalone), a one-time beer mat with an Install button.
3. After install, call navigator.storage.persist() once. On the web build only, a gentle reminder to "Send this ledger" every 30 days (skip it if X-A2 hasn't merged; leave a TODO).
Tests: unit tests for platform detection and the once-only prompt; a Playwright test that loads /install/ at an Android viewport and user agent.

Exit: npm run typecheck && npm test pass. Write /log. Push your branch and open a PR (wrapper W3). Don't merge.
```

### X-B2 · The Android app (Build agent · Sonnet · L = 5) · **deferred: run only when Brent starts Android**

```
Read CLAUDE.md (including the iOS web app conventions and the Capacitor notes), the last three docs/logs entries, capacitor.config.ts, src/native/, and docs/plans/monthly/14-saves-and-android.md §3.2.

1. Add @capacitor/android (the same major version as @capacitor/ios), generate the android/ project, remove /android/ from .gitignore and commit it. App id com.brenthumphries.steampunkshuffle, name "Wheatstone", min and target SDK as Capacitor's current template sets them (record the values in the log).
2. Android behaviour: the hardware/gesture Back button through @capacitor/app's backButton listener (previous screen; in a match, open the existing Leave Game confirm; on the hub, ask before exiting); edge-to-edge insets and status bar; splash; an adaptive icon generated from the existing app icon source; the Preferences mirror; launch intro playback (muted autoplay fallback); haptics; the .wheatstone intent filter for X-A2.
3. Viewports: add Playwright projects for 360x800, 393x873 and 412x915 with an Android Chrome user agent running the native bundle (as the existing "Native" project does) and make the smoke suite pass on them; fix any layout breakage with CSS, without changing the iPhone 402x874 layout.
4. CI: a new job in .github/workflows (ubuntu, free) that builds the native bundle, runs `npx cap sync android`, and runs Gradle bundleRelease signed with secrets ANDROID_UPLOAD_KEYSTORE_B64, ANDROID_UPLOAD_KEYSTORE_PASSWORD, ANDROID_UPLOAD_KEY_ALIAS and ANDROID_UPLOAD_KEY_PASSWORD (skip signing with a clear notice when the secrets are absent), then uploads the AAB as an artifact. Bump versionCode from the run number. Don't add Play upload here (X-B3 does).
5. Document the Android build in SETUP.md and CLAUDE.md (a short "Android conventions" block, like the iOS one).

Tests: the unit test for back-button routing (pure function); the Playwright Android projects; CI producing an (unsigned if no secrets) AAB on the PR.

Exit: npm run typecheck && npm test pass and the CI Android job is green. Write /log. Push your branch and open a PR (wrapper W3). Don't merge.
```

### X-B3 · Google Play internal track (Release agent · Haiku · M = 3, plus Content agent · Haiku · S = 2) · **deferred**

```
Read CLAUDE.md, the last three docs/logs entries, docs/store-listing.md, docs/app-privacy-answers.md, and docs/plans/monthly/14-saves-and-android.md §3.3. X-B2 has merged and Brent has finished his Play Console setup (the orchestrator confirms the secrets exist: PLAY_SERVICE_ACCOUNT_JSON and the upload keystore).

Code: add a workflow_dispatch workflow (or a job in the TestFlight workflow, so one dispatch ships both) that builds the signed AAB and uploads it to the Play "internal" track with fastlane supply (package com.brenthumphries.steampunkshuffle), with release notes taken from the month's banner text. Dry-run it against the internal track once.

Docs (in docs/): play-listing.md (short and full description adapted from store-listing.md, at Play's length limits), play-data-safety.md ("No data collected", with the evidence from app-privacy-answers.md and the privacy test), and play-content-rating.md (draft IARC answers; flag the simulated-gambling question about the Bar Bet as ★ for Brent). Generate Play screenshots with tools/store-screenshots.ts at 1080x1920 and a 1024x500 feature graphic composed from existing art (no new Gemini art needed: crop and arrange the taproom background with the game's title lettering in the existing UI font).

Exit: workflow dry-run green; docs written. Write /log. Push your branch and open a PR (wrapper W3). Don't merge.
```

### X-T · Upgrade and Android playtest (Playtest agent · Sonnet · S = 2 for part 1; part 2 is deferred with Android)

```
Read docs/plans/monthly/14-saves-and-android.md §2.3 and §3.2. X-A1 and X-A2 have merged (X-B2 only when part 2 runs).

1. Upgrade path: build the last released commit (the tag the orchestrator gives you), seed a rich save in it (several decks, tournament progress, an active match, gifts claimed), then build current main over the same storage (web, and the Native project) and confirm the migration (§2.3): every value identical, the beer mat shown once, the cellar copy restorable. Repeat with a second ledger created, exported, deleted and re-imported.
2. (Deferred until X-B2 exists: skip this part in Release 1.1.) Android viewports: play the tutorial, one pickup match, the Ledger Shelf and send/receive at 360x800 and 412x915 with the Android user agent; take screenshots at each step and look at them for clipping, overlaps and unreadable text.
3. File findings in PLAYTEST.md in ss-playtest format (P1 blocks the ship).
Report: pass or fail per check, the screenshot list, and findings by priority.
```

## 7. What this changes elsewhere

- **Runbook:** §4 keeps setup S-12 and S-13 (Brent's Play account, an Android device, the Play secrets) marked deferred; §8 adds the Release 1.1 rows; the release agent's Android upload stays off until Android starts.
- **Privacy docs:** unchanged for A1, A2 and B1 to B3. A3 option (a) would require new App Privacy answers, Play Data safety answers and a privacy-policy update before it ships.
- **Every later month** inherits per-ledger state for free, because all monthly features read storage through `storageKey()`. Month prompts written before X-A1 merges (November and December) are corrected by X-A1's namespacing scan, which fails until any new raw key is routed.
