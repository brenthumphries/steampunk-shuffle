# TestFlight checklist (plan steps 4.3 to 4.5)

For Brent to run on the Mac. Goal: a build showing "Ready to Submit" in App Store Connect by **Oct 20**, approved by Beta App Review, installed on your iPhone first, then on hers by Oct 29.

Menu names below are from memory of Xcode 26 and App Store Connect. If a label differs, the intent is the same; tell Claude what you see and it will adjust this file.

## Facts to have on hand

| Item | Value |
|---|---|
| App name in the store | Wheatstone (fallback: Wheatstone Bridge) |
| Home screen name | Wheatstone |
| Bundle id | `com.brenthumphries.steampunkshuffle` |
| SKU (App Store Connect only, never shown) | `steampunk-shuffle` |
| Version / build | 1.0 / 1 (the build number must go up on every upload) |
| Devices | iPhone only, portrait only, iOS 15 or later |
| Encryption | Already declared exempt in `Info.plist` (`ITSAppUsesNonExemptEncryption` = false) |
| Xcode project | `ios/App/App.xcodeproj`, scheme `App` |
| Cost | Apple Developer Program membership is required (US$99 a year) |

## Before you start

- [ ] Apple Developer Program membership is active for your Apple ID. If not, enrolling can take a day or two, so do it first.
- [ ] Confirm her iPhone runs **iOS 15.4 or later**. Settings, General, About, iOS Version. The Xcode target says 15.0, but the game needs 15.4: the rules engine calls `structuredClone` and the layout sizes the screen with `100dvh`, and Safari added both in 15.4 (checked 2026-10-13, ATT-26; a phone on 15.0 to 15.3 would not be able to play a card). If it is older, update iOS first; every iPhone that can run 15 can update to at least 15.8.
- [ ] Everything is shipped to `main`: `git status` is clean and the latest `ss-ship` run is green.
- [ ] Content freeze is called and `v1.0-rc1` is tagged (ATT-24). Only bug fixes from here.

## A. Build the native bundle

```bash
npm run cap:sync
```

This builds the native bundle and copies it into `ios/`. It must say `Sync finished` with no errors. Run it again after every code or art change before archiving, because the archive uses whatever is in `ios/App/App/public` at that moment.

## B. Archive in Xcode

1. Open the project:

   ```bash
   npx cap open ios
   ```

2. In the left sidebar select the **App** project, then the **App** target, then **Signing & Capabilities**.
3. Tick **Automatically manage signing** and pick your **Team**. Xcode registers the bundle id with your account for you. If it complains that the id is unavailable, someone else holds it; tell Claude and pick another (it would need to change in `capacitor.config.ts` and the Xcode project together).
4. Still on the App target, open **General** and confirm Display Name **Wheatstone**, Version **1.0**, Build **1**, and that only iPhone is listed under supported destinations.
5. In the top bar set the run destination to **Any iOS Device (arm64)**. Not a simulator.
6. Menu **Product, Archive**. Wait for the Organizer window to open on the new archive. A first archive can take a few minutes.
7. If the archive fails, copy the red error text to Claude. The common causes are listed under "If something goes wrong" below.

## C. Create the app record in App Store Connect

Do this before uploading, in a browser at appstoreconnect.apple.com.

1. **Apps, then the plus button, New App.**
2. Platforms: **iOS**. Name: **Wheatstone**. Primary language: **English (U.S.)**. Bundle ID: pick `com.brenthumphries.steampunkshuffle` from the list (it appears once Xcode has registered it in step B3). SKU: `steampunk-shuffle`. User access: Full Access.
3. If the name is rejected as taken, use **Wheatstone Bridge** and carry on. The home screen name stays "Wheatstone" regardless.
4. You do not need screenshots, a description, pricing, or a store listing for TestFlight. Skip all of that.

## D. Upload the build

1. In Xcode's Organizer, select the archive, then **Distribute App**.
2. Choose **App Store Connect**, then **Upload**. Accept the defaults (automatic signing, upload symbols on).
3. Wait for "Upload Successful".
4. In App Store Connect, open the app, then the **TestFlight** tab. The build appears as "Processing" and usually finishes in 10 to 30 minutes. You get an email when it is done.
5. If the build shows **Missing Compliance**, tell Claude before answering. The `Info.plist` key should already have answered it, so the question appearing means the key did not make it into the archive.

Target: build visible and processed by **Oct 20**.

## Before you press Submit

Checked against Apple's own pages on **2026-10-13**. Nothing below is legal advice, and Apple's pages show no "last updated" date, so check the links if something looks different on your screen. Apple's pages: [TestFlight overview](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/), [Invite external testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers), [Add internal testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/add-internal-testers), [Provide test information](https://developer.apple.com/help/app-store-connect/test-a-beta-version/provide-test-information), [Glossary](https://developer.apple.com/help/glossary/), [Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).

**1. Does Beta App Review apply to how she gets the invite?** ATT-23 has no answer yet, so here are both.

- **She is an internal tester: no review.** Apple's glossary: "If you invite internal testers only, additional testing information is not required." But an internal tester has to be a user on *your* App Store Connect team (Admin, App Manager, Developer or Marketing role, up to 100). That means giving her access to your developer account, which you probably don't want. So plan on her being external.
- **She is an external tester, by email or by public link: yes, review applies.** Apple: "If you invite any external testers, the first build is submitted to TestFlight App Review. Later builds for the same version may not require full review." Your first build has to be approved before anyone outside your team can test it, and builds are sent for review automatically when they are added to an external group. Only one build per version can be in review at a time, and Apple allows six submissions in 24 hours. Apple's pages give no review time; "24 to 48 hours" below is a typical figure, not a promise.
- **To keep the surprise:** Apple says "When you invite testers, they will receive an invitation email", so **don't put her email in any group until the day you want it sent** (on or after Oct 27). A public link needs no email address from you and joiners show as anonymous, but Apple's page does not say whether anything is emailed when someone joins, so try it with your own phone first, and note that "anyone can share this link". If you add her to a group that is already approved, untick **Automatically notify testers** and use **Notify Testers** yourself when you are ready.

**2. What has to be filled in.**

- **Test information:** the Beta App Description (required), a Feedback Email, and the beta app review information (Apple's glossary: "contact information, demo account credentials, and any notes specific for TestFlight App Review"). Apple: "your beta app description and beta app review information are required in order to share your beta with external testers." Sign-in is off (no accounts). The review notes text is in section E.
- **Privacy policy URL:** Apple's TestFlight pages do not list it as a beta field, but guideline 5.1.1(i) says all apps need one and 2.2 says beta builds "should comply with the App Review Guidelines". It costs nothing, so add it under **App Privacy**: `https://brenthumphries.github.io/steampunk-shuffle/privacy.html`. **That page exists only after the PR that adds it is merged and GitHub Pages has deployed**, so open the link in a browser before you paste it (guideline 2.1: URLs must work).
- **App Privacy answers:** Apple says these are "required to submit new apps and app updates to the App Store" and does not mention TestFlight. Fill them in anyway: **No, we do not collect data from this app**. Field by field, with the proof, in `docs/app-privacy-answers.md`.
- **Export compliance:** `ITSAppUsesNonExemptEncryption` is already `false` in `ios/App/App/Info.plist` (checked), which stops App Store Connect asking on every upload. The app makes no network connections and has no encryption code of its own, which is the reason for `false`. Apple's page on this is a script-only page that could not be read here, so read [Complying with encryption export regulations](https://developer.apple.com/documentation/security/complying-with-encryption-export-regulations) once and confirm you agree with the answer.
- **Check your email after each upload for "ITMS-91053" (missing API declaration).** Apple's [Feb 2024 notice](https://developer.apple.com/news/?id=3d8a9yyh): from May 1, 2024 you "need to include approved reasons for the listed APIs used by your app's code to upload a new or updated app". `@capacitor/preferences` uses `UserDefaults`, one of those APIs; the plugin ships no privacy manifest (checked in `node_modules`), Capacitor's own manifest is empty, and `ios/App/App/` has none. Build 1.0 (1) processed, so Apple accepted it, but a warning email may have come. If one did, before the next upload add a file `ios/App/App/PrivacyInfo.xcprivacy` in Xcode (File, New, File, App Privacy), tick the **App** target, and paste:

  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
  <plist version="1.0">
  <dict>
    <key>NSPrivacyTracking</key>
    <false/>
    <key>NSPrivacyTrackingDomains</key>
    <array/>
    <key>NSPrivacyCollectedDataTypes</key>
    <array/>
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
      <dict>
        <key>NSPrivacyAccessedAPIType</key>
        <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
        <key>NSPrivacyAccessedAPITypeReasons</key>
        <array>
          <string>CA92.1</string>
        </array>
      </dict>
    </array>
  </dict>
  </plist>
  ```

  `CA92.1` ("read and write only this app's own settings") is the code Capacitor's documentation uses for this plugin; that page could not be opened from here, so confirm the code in Apple's required-reason list inside Xcode's documentation. Raise **Build** by one and upload again. Then tell Claude, so the repo gets the same file.

**3. Which guidelines a wrapped web game trips, and does beta review apply them?** Yes: Apple says beta builds "should comply with the App Review Guidelines" (2.2) and the first external build is reviewed "to make sure it follows" them.

- **4.2 Minimum functionality** ("beyond a repackaged website"): the usual risk for a wrapped site. Low here: it is a complete offline game with its own engine, art, sound and save, and no website is shown. The native touches it already has, and what else could be added, are in `docs/app-store-readiness.md` section 5.
- **5.2 Intellectual property** ("only includes content that you created or that you have a license to use"): the real risk for this cast. Ratings for every named character are in `docs/app-store-readiness.md`. The two to know about are **Agatha Christie / Hercule Poirot** (a living rights holder with registered marks) and four film and TV jokes used as card names (*Good News, Everybody!*, *Party Time. Excellent.*, *Abby Normal*, *Eye-gor*). Original stand-ins are listed there. If Apple rejects the beta on 5.2, that list is the fix; none of it touches the gift.
- **2.1 Completeness and 5.1.1(i) privacy:** every URL you enter must work, and a privacy policy link must also be *inside* the app. The app does not have that link yet. It matters for a public listing, and Apple's beta pages do not list it as a beta requirement (see `docs/app-privacy-answers.md`).

## E. TestFlight setup and Beta App Review

External testers (her) need the build to pass Beta App Review once. Internal testers (members of your own App Store Connect team) do not.

1. TestFlight tab, left sidebar, **Test Information** (or the app's Test Information section). Fill in:
   - **Beta App Description:** "An offline steampunk card game set in a Victorian pub. A birthday gift."
   - **Feedback Email:** your email.
   - **Contact info:** your name, phone, and email for the reviewer.
   - **Sign-in required:** off. The game has no accounts.
   - **Review notes:** "No account, no network, no purchases, no ads, and no real-money play. The in-game currency (Checks) has no cash value. The first launch plays a guided tutorial against a barkeep. Content is gated by the device date."
2. Under **External Testing**, create a group (for example "Family").
3. Add the build to the group. Apple asks the export-compliance and content questions once; use "No" for third-party content and encryption beyond exempt.
4. Press **Submit for Review**. Typical wait is 24 to 48 hours. Later builds of the same version are usually approved much faster.

Target: submitted by **Oct 21**, approved by **Oct 23**.

## F. Plan step 4.5: your own phone first

1. Install **TestFlight** from the App Store on your iPhone, signed in with the Apple ID you used for App Store Connect.
2. Add yourself as an **internal tester** (App Store Connect, Users and Access, make sure your own account has TestFlight access). Internal builds install without waiting for Beta App Review.
3. Install Wheatstone from TestFlight and play: the whole tutorial, then one tournament.
4. Send playtest notes to Claude as usual (`ss-playtest`). The gate for her build is **no P1 bugs**.
5. Check that the home screen name and icon look right and that the splash screen shows.

## G. Invite her

Do this once the build is approved and your own playthrough is clean, no later than **Oct 27**.

1. TestFlight, your external group, **Add Testers**, enter her email address. Or use a **public link** if you would rather hand her a link or QR code than rely on email.
2. She installs the TestFlight app, accepts the invite, and installs Wheatstone.
3. Dry run: do the whole flow on a spare device or a family member's phone if you can, so you know exactly what she will see.
4. The dedication screen is held until Oct 30. If she opens the game before then she goes straight to the tutorial, and the dedication appears on her first launch on or after Oct 30 (design option b). If she plays it before Oct 30 and you want her to see it on the day, tell Claude: the held launch leaves the dedication unseen, so it still appears later.

Fallback if TestFlight fails for any reason: the PWA at https://brenthumphries.github.io/steampunk-shuffle/ with the QR code from plan step 5.2.

## H. Updating the build (plan 5.1)

1. Fix the bug, ship to `main`, run `npm run cap:sync`.
2. In Xcode raise **Build** by one (General tab) and keep Version at 1.0.
3. Archive, upload, wait for processing. Later builds of an approved version normally skip a full review.
4. **Final build by Oct 27.**

## After launch

TestFlight builds expire **90 days after upload**. A build uploaded Oct 20 stops opening on **Jan 18, 2027**. Upload a fresh build before then and keep the date in your calendar. Plan step 5.3 records this in `CLAUDE.md`.

## If something goes wrong

| Symptom | Likely cause and fix |
|---|---|
| "No account for team" or no Team in the dropdown | Add your Apple ID under Xcode, Settings, Accounts. Membership must be active. |
| Bundle id unavailable | Another account holds it. Pick a new one and change it in `capacitor.config.ts` and the Xcode project together. |
| Archive is greyed out | The destination is a simulator. Choose Any iOS Device (arm64). |
| Archive succeeds but the app shows no art on a device | `npm run cap:sync` was not run after the last change, or the native build was made in the wrong mode. Run it again and re-archive. |
| Upload rejected: icon problems | The 1024 icon must have no transparency. Ours has none (checked), so tell Claude the exact message. |
| Upload rejected: build number already used | Raise Build and archive again. |
| Build stuck on Processing for hours | Wait up to a day; then check the Apple System Status page and contact Apple Developer Support. |
| Beta App Review rejects it | Read the reviewer's message, paste it to Claude, fix, raise Build, re-upload. |
