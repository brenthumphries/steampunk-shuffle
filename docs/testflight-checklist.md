# TestFlight checklist (plan steps 4.3 to 4.5)

For Brent to run on the Mac. Goal: a build showing "Ready to Submit" in App Store Connect by **Oct 20**, approved by Beta App Review, installed on your iPhone first, then on hers by Oct 29.

Menu names below were written from memory of Xcode 26 and App Store Connect. They were checked step by step against Apple's own pages on **2026-10-14**. Each correction is marked *(corrected 2026-10-14)* and names the Apple page it comes from. If a label on your screen still differs, the intent is the same; tell Claude what you see and it will adjust this file.

Confirmed unchanged on 2026-10-14: the New App route and its fields, Product, Archive and Window, Organizer, Distribute App, the status names **Missing Compliance** and **Ready to Submit**, the 90-day build life, and Xcode 26 or later to build an iOS app ([Upload builds](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds)). Not stated on any Apple page I could read, so left as written: the **Any iOS Device (arm64)** label, the **Upload Successful** message, the **Processing** label and its 10 to 30 minutes, that automatic signing registers the bundle id at step B3 (Apple says Xcode creates signing assets "when you upload or export your build"), the Xcode, Settings, Accounts path, and the US$99 fee. Apple's pages call the step **TestFlight App Review** (build statuses **Waiting for Review** and **In Beta Review**); "Beta App Review" in this file means the same step.

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
5. In the Scheme toolbar menu choose the **App** scheme and set the run destination to **Any iOS Device (arm64)**. A simulator destination also archives in Xcode 15 and later, but a device destination is the safe default. *(corrected 2026-10-14: Apple, [Distributing your app for beta testing and releases](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases).)*
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
2. On the **Select a method for distribution** sheet choose **TestFlight & App Store** (the recommended default: it updates the build number, signs automatically and uploads symbols), then click **Distribute**. Do **not** choose **TestFlight Internal Only**: it restricts the build to your team, so it could never go to an external tester. If you take the **Custom** route instead, choose **App Store Connect**, then **Upload**, keep **Upload your app's symbols** and **Manage version and build number** ticked, and select **Automatically manage signing**. *(corrected 2026-10-14: Apple, [Distributing your app for beta testing and releases](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases). Apple's older Xcode Help page, "Upload an app to App Store Connect", describes only the Custom route.)*
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
- **Privacy manifest (ITMS-91053, "missing API declaration").** Apple's [Feb 2024 notice](https://developer.apple.com/news/?id=3d8a9yyh): from May 1, 2024 you "need to include approved reasons for the listed APIs used by your app's code to upload a new or updated app". `@capacitor/preferences` uses `UserDefaults`, one of those APIs, and ships no manifest. The ready file is `ios/App/App/PrivacyInfo.xcprivacy` (reason `CA92.1`, confirmed against Apple's reason list on 2026-10-29); the click-by-click steps are in section H step 2 and `docs/privacy-manifest.md`. Check your email after each upload for ITMS-91053; if one arrives, do that step before the next upload.

**3. Which guidelines a wrapped web game trips, and does beta review apply them?** Yes: Apple says beta builds "should comply with the App Review Guidelines" (2.2) and the first external build is reviewed "to make sure it follows" them.

- **4.2 Minimum functionality** ("beyond a repackaged website"): the usual risk for a wrapped site. Low here: it is a complete offline game with its own engine, art, sound and save, and no website is shown. The native touches it already has, and what else could be added, are in `docs/app-store-readiness.md` section 5.
- **5.2 Intellectual property** ("only includes content that you created or that you have a license to use"): the real risk for this cast. Ratings for every named character are in `docs/app-store-readiness.md`. The two to know about are **Agatha Christie / Hercule Poirot** (a living rights holder with registered marks) and four film and TV jokes used as card names (*Good News, Everybody!*, *Party Time. Excellent.*, *Abby Normal*, *Eye-gor*). Original stand-ins are listed there. If Apple rejects the beta on 5.2, that list is the fix; none of it touches the gift.
- **2.1 Completeness and 5.1.1(i) privacy:** every URL you enter must work, and a privacy policy link must also be *inside* the app. The app does not have that link yet. It matters for a public listing, and Apple's beta pages do not list it as a beta requirement (see `docs/app-privacy-answers.md`).

## E. TestFlight setup and Beta App Review

External testers (her) need the build to pass Beta App Review once. Internal testers (members of your own App Store Connect team) do not.

1. **Apps**, your app, **TestFlight** tab, then in the left sidebar under **Additional** click **Test Information**, choose a language, and fill in (this needs the Account Holder, Admin or App Manager role). *(corrected 2026-10-14: Apple, [Provide test information](https://developer.apple.com/help/app-store-connect/test-a-beta-version/provide-test-information).)*
   - **Beta App Description:** "An offline steampunk card game set in a Victorian pub. A birthday gift."
   - **Feedback Email:** your email.
   - **Contact info:** your name, phone, and email for the reviewer.
   - **Sign-in required:** off. The game has no accounts.
   - **Review notes:** "No account, no network, no purchases, no ads, and no real-money play. The in-game currency (Checks) has no cash value. The first launch plays a guided tutorial against a barkeep. Content is gated by the device date."
2. Create the groups. Apple requires an internal group before an external one: click the add button (**+**) next to **Internal Testing**, name it (for example "Me"), click **Create**; then click the add button (**+**) next to **External Testing**, name the group (for example "Family"), click **Create**. *(corrected 2026-10-14: Apple, [Add internal testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/add-internal-testers) and [Invite external testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers).)*
3. Select the external group, click **Add Builds**, choose the platform and version, select the build, click **Add**, and enter what testers should focus on in the **What to Test** dialog. Leave **Automatically notify testers** unticked while she is in any group; if it is unticked you press **Notify Testers** yourself after approval (see G). Export compliance is not asked at this step. If the build shows **Missing Compliance**, open TestFlight, click the platform under **Builds**, click the build, then **Manage** or **Provide Export Compliance Information**, and answer; the answers are in `docs/testflight-copy.md`. *(corrected 2026-10-14: Apple, [Invite external testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers) and [Provide export compliance information for beta builds](https://developer.apple.com/help/app-store-connect/test-a-beta-version/provide-export-compliance-information-for-beta-builds).)*
4. Press **Submit Review** (or **Start Testing**, whichever your build's status offers). *(corrected 2026-10-14: Apple, [Invite external testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers).)* Typical wait is 24 to 48 hours. Later builds of the same version are usually approved much faster.

Target: submitted by **Oct 21**, approved by **Oct 23**.

## F. Plan step 4.5: your own phone first

1. Install **TestFlight** from the App Store on your iPhone, signed in with the Apple ID you used for App Store Connect.
2. Add yourself as an **internal tester**: in the internal group from E2 click **Invite Testers**, tick your name, click **Add**; if you are not listed, check your role under Users and Access (Apple allows Account Holder, Admin, App Manager, Developer and Marketing). Then click **Add Builds**, choose the build, click **Next**, enter **What to Test** and click **Add**. Internal builds install without waiting for Beta App Review. *(corrected 2026-10-14: Apple, [Add internal testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/add-internal-testers).)*
3. Install Wheatstone from TestFlight and play: the whole tutorial, then one tournament.
4. Send playtest notes to Claude as usual (`ss-playtest`). The gate for her build is **no P1 bugs**.
5. Check that the home screen name and icon look right and that the splash screen shows.

## G. Invite her

Do this once the build is approved and your own playthrough is clean, no later than **Oct 27**.

1. TestFlight, under **External Testing** select your group, click the add button (**+**) next to **Testers**, choose **Email**, click **Next** and enter her address. Or click **Create Public Link** (choose **Open to Anyone**; **Set Limit** is optional) if you would rather hand her a link or QR code than rely on email. If **Automatically notify testers** was not ticked when the build was added, press **Notify Testers**: TestFlight, under **Builds** click the platform, choose the version, then under **Status** click **Notify Testers**. *(corrected 2026-10-14: Apple, [Invite external testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers).)*
2. She installs the TestFlight app, accepts the invite, and installs Wheatstone.
3. Dry run: do the whole flow on a spare device or a family member's phone if you can, so you know exactly what she will see.
4. The dedication screen is held until Oct 30. If she opens the game before then she goes straight to the tutorial, and the dedication appears on her first launch on or after Oct 30 (design option b). If she plays it before Oct 30 and you want her to see it on the day, tell Claude: the held launch leaves the dedication unseen, so it still appears later.

Fallback if TestFlight fails for any reason: the PWA at https://brenthumphries.github.io/steampunk-shuffle/ with the QR code from plan step 5.2.

## H. Updating the build (plan 5.1)

1. Fix the bug, ship to `main`, run `npm run cap:sync`.
2. **Once, in the first re-upload after the manifest is merged (the ATT-79 re-upload, due Thu 7 Jan 2027; also needed for any public release, ATT-32, and straight away if Apple emails ITMS-91053): add the privacy manifest to the App target.** Do steps 1 to 7 of `docs/privacy-manifest.md` (`git pull`, `npx cap open ios`, right-click the yellow **App** folder, **Add Files to "App"...**, tick the **App** target, check **Target Membership** and **Copy Bundle Resources**). Skip this step when `PrivacyInfo.xcprivacy` is already listed under **Copy Bundle Resources**.
3. In Xcode raise **Build** by one (General tab) and keep Version at 1.0.
4. Archive, upload, wait for processing. Later builds of an approved version normally skip a full review. After the first archive with the manifest, Control-click the archive in the Organizer and choose **Generate Privacy Report** to see `UserDefaults` / `CA92.1` listed.
5. **Final build by Oct 27.**

## After launch

TestFlight builds expire **90 days after upload**. A build uploaded Oct 20 stops opening on **Jan 18, 2027**. Upload a fresh build before then and keep the date in your calendar. Plan step 5.3 records this in `CLAUDE.md`.

## If something goes wrong

| Symptom | Likely cause and fix |
|---|---|
| "No account for team" or no Team in the dropdown | Add your Apple ID under Xcode, Settings, Accounts. Membership must be active. |
| Bundle id unavailable | Another account holds it. Pick a new one and change it in `capacitor.config.ts` and the Xcode project together. |
| Archive is greyed out | Not usually a simulator: Xcode 15 and later can archive with one selected. Choose Any iOS Device (arm64) anyway and tell Claude if it stays greyed out. *(corrected 2026-10-14: Apple, [Distributing your app for beta testing and releases](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases).)* |
| Archive succeeds but the app shows no art on a device | `npm run cap:sync` was not run after the last change, or the native build was made in the wrong mode. Run it again and re-archive. |
| Upload rejected: icon problems | The 1024 icon must have no transparency. Ours has none (checked), so tell Claude the exact message. |
| Upload rejected: build number already used | Raise Build and archive again. |
| Build stuck on Processing for hours | Wait up to a day; then check the Apple System Status page and contact Apple Developer Support. |
| Beta App Review rejects it | The build status shows **Rejected**. Read the reviewer's message (TestFlight, sidebar **General**, **App Review**), paste it to Claude, fix, raise Build, re-upload. *(corrected 2026-10-14: Apple, [Invite external testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers).)* |
