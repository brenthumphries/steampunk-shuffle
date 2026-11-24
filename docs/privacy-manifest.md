# Privacy manifest (ATT-66)

Checked on **2026-10-29** against Apple's own documentation. The file is `ios/App/App/PrivacyInfo.xcprivacy`. It does nothing until Brent adds it to the App target in Xcode (steps below). `project.pbxproj` stays a local hold and nothing here edits it.

## When it is needed

| Situation | Needed? |
|---|---|
| The **ATT-79 re-upload** (due Thu 7 Jan 2027, build 4 expires Thu 21 Jan) | **Recommended: do it in that upload.** Apple's rule: apps that "don't describe their use of required reason API in their privacy manifest file aren't accepted by App Store Connect" ([Describing use of required reason API](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api)). Build 4 was accepted without one, so Apple's enforcement on TestFlight uploads looks like an email warning (ITMS-91053), not a block; that is inferred, not stated by Apple. The Build number has to go up for the re-upload anyway, so this adds one file to a build you are making. |
| A **public or Unlisted App Store release** (ATT-32, if the answer is go) | **Yes.** It is item 1 of the work list in `docs/decisions/att-32-public-release.md`. App Review sees the same upload checks. |
| **Apple emails ITMS-91053** or App Store Connect shows it as an upload warning | **Yes, before the next upload.** |
| The web build (GitHub Pages) | No. The manifest is an iOS bundle file. |

## What the file says

| Key | Value | Why | Apple page |
|---|---|---|---|
| `NSPrivacyTracking` | `false` | No tracking: no SDK, ad, identifier or analytics (`docs/app-privacy-answers.md`). Apple: set `true` only if data is used "for tracking as defined under the App Tracking Transparency framework". | [NSPrivacyTracking](https://developer.apple.com/documentation/bundleresources/app-privacy-configuration/nsprivacytracking) |
| `NSPrivacyTrackingDomains` | empty array | The app contacts no server (`tests/e2e/privacy.spec.ts` fails on any cross-origin request). Apple: the list is only provided when `NSPrivacyTracking` is `true`. | [NSPrivacyTrackingDomains](https://developer.apple.com/documentation/bundleresources/app-privacy-configuration/nsprivacytrackingdomains) |
| `NSPrivacyCollectedDataTypes` | empty array | Matches the App Store answer "Data Not Collected". | [NSPrivacyCollectedDataTypes](https://developer.apple.com/documentation/bundleresources/app-privacy-configuration/nsprivacycollecteddatatypes) |
| `NSPrivacyAccessedAPITypes` | one entry: `NSPrivacyAccessedAPICategoryUserDefaults`, reason `CA92.1` | `@capacitor/preferences` stores the save mirror in `UserDefaults.standard`. | [NSPrivacyAccessedAPITypes](https://developer.apple.com/documentation/bundleresources/app-privacy-configuration/nsprivacyaccessedapitypes) |

The two keys inside that entry, `NSPrivacyAccessedAPIType` and `NSPrivacyAccessedAPITypeReasons`, are the ones Apple documents under [NSPrivacyAccessedAPITypes](https://developer.apple.com/documentation/bundleresources/app-privacy-configuration/nsprivacyaccessedapitypes).

## Required-reason API audit

Apple's list has five categories ([NSPrivacyAccessedAPIType](https://developer.apple.com/documentation/bundleresources/app-privacy-configuration/nsprivacyaccessedapitypes/nsprivacyaccessedapitype)). Method: grep of the Swift/Objective-C sources of the app (`ios/App/App/*.swift`), Capacitor 8.5.3 (`@capacitor/ios`) and every plugin in `package.json` for each API Apple names in each category; plus `strings`/`nm` on the prebuilt `Capacitor` and `Cordova` binaries the app actually links.

| Category | Used by the shipped binary? | Evidence | Reason code | Confidence |
|---|---|---|---|---|
| `NSPrivacyAccessedAPICategoryUserDefaults` | **Yes**, by `@capacitor/preferences` 8.0.1 | `Preferences.swift:18-19` returns `UserDefaults.standard`; `PreferencesPlugin.swift:89,93,112,114` read and remove keys through it. Only the app's own data (prefix `CapacitorStorage.`); no App Group, no MDM key. | **`CA92.1`** | **Confirmed.** Apple's [reason list](https://developer.apple.com/documentation/bundleresources/app-privacy-configuration/nsprivacyaccessedapitypes/nsprivacyaccessedapitypereasons) prints the code with its text: "to read and write information that is only accessible to the app itself". Also what the [Preferences README](https://github.com/ionic-team/capacitor-plugins/blob/main/preferences/README.md) recommends for this plugin. |
| `NSPrivacyAccessedAPICategoryFileTimestamp` | No | None of Apple's listed APIs (`creationDate`, `modificationDate`, `creationDateKey`, `contentModificationDateKey`, `stat`, `fstat`, `lstat`, `getattrlist` and relatives) appear. The only file metadata call is `resourceValues(forKeys: [.fileSizeKey])` (`Capacitor/WebViewAssetHandler.swift:72`), and `fileSizeKey` is not on Apple's list for this category. | none | **Judgment.** Apple's code `C617.1` text says "timestamps, size, or other metadata of files inside the app container", so if Apple ever flags the size key, `C617.1` would be the code. Not declared, because declaring an API the app does not use is not what the manifest is for. |
| `NSPrivacyAccessedAPICategorySystemBootTime` | No | No `systemUptime` or `mach_absolute_time` in any source or in the `Capacitor`/`Cordova` binaries. | none | Confirmed by search. |
| `NSPrivacyAccessedAPICategoryDiskSpace` | No | No `volumeAvailableCapacity*`, `volumeTotalCapacityKey`, `systemFreeSize`, `systemSize`, `statfs`, `statvfs`. | none | Confirmed by search. |
| `NSPrivacyAccessedAPICategoryActiveKeyboards` | No | No `activeInputModes`. | none | Confirmed by search. |

Reason codes not used, so nobody adds them by mistake: `C56D.1` ("may only be declared by third-party SDKs", the app is not one), `1C8F.1` (App Group only; the app has none), `AC6B.1` (MDM keys only).

Limit of the audit: it covers source and the two prebuilt Capacitor binaries. The three other plugins are compiled by Xcode from source and no built binary was available here, so they were checked by source grep only. Foundation and WebKit's own internal calls are Apple's code, not the app's declaration. The web layer (`localStorage`, IndexedDB) is WebKit's, not a required-reason API call by the app.

### Which packages already ship a manifest

| Package | Own `PrivacyInfo.xcprivacy`? |
|---|---|
| `@capacitor/ios` 8.5.3: `Capacitor.framework` and `Cordova.framework`, as downloaded from `capacitor-swift-pm` 8.5.3 (zip checksums match `Package.swift`) | **Yes, both empty**: no accessed APIs, no collected data, `NSPrivacyTracking` false. |
| `@capacitor/preferences` 8.0.1 | **No** (no manifest in the package; its `Package.swift` declares no resources). This is why the app needs its own entry. |
| `@capacitor/haptics` 8.0.2, `@capacitor/splash-screen` 8.0.2, `@capacitor/status-bar` 8.0.4 | No, and none needs one: they use none of the listed APIs. |

## How it was validated

`plutil` is not available in the cloud session, so Brent's `plutil -lint` below is the last check. What ran here:

1. Python `plistlib` parses the file.
2. A script checks the four top-level keys, their types, and that every category and reason code in the file is one Apple lists, with a bad key and a bad code both failing as they should.
3. `xmllint --dtdvalid` against the Apple Property List 1.0 DTD. That DTD could not be downloaded here (`apple.com` is not reachable), so it was written from the published definition; the same check also passes `Info.plist`.

## Steps for Brent (Xcode)

Menu names marked † are Apple-documented ([Privacy manifest files](https://developer.apple.com/documentation/bundleresources/privacy-manifest-files), [Adding a privacy manifest](https://developer.apple.com/documentation/bundleresources/adding-a-privacy-manifest-to-your-app-or-third-party-sdk)); the rest are from memory of Xcode 26 and not checked against Apple.

1. In the `steampunk-shuffle` checkout: `git pull` once the pull request is merged, so `ios/App/App/PrivacyInfo.xcprivacy` exists. Check it with:

   ```bash
   plutil -lint ios/App/App/PrivacyInfo.xcprivacy
   ```

   It must print `OK`.
2. Open the project:

   ```bash
   npx cap open ios
   ```

3. In the left sidebar click the **Project navigator** tab (the folder icon, first tab). Under the blue **App** project there is a yellow folder called **App** that holds `AppDelegate.swift` and `Info.plist`. `PrivacyInfo.xcprivacy` is not listed yet: this project uses classic Xcode groups, so a file that is only on disk is not part of the target.
4. Right-click that yellow **App** folder and choose **Add Files to "App"...**.
5. In the file sheet go to `steampunk-shuffle/ios/App/App/` and click `PrivacyInfo.xcprivacy`. Click **Options** at the bottom left if the options are hidden, then:
   - untick **Copy items if needed** (the file is already in that folder);
   - leave **Added folders** on **Create groups**;
   - under **Add to targets** tick **App** (and nothing else).

   Click **Add**.
6. Click `PrivacyInfo.xcprivacy` in the navigator. Open the **File inspector** (right sidebar, first tab, the page icon; or View, Inspectors, Show File Inspector). Under **Target Membership** the box next to **App** must be ticked. Xcode shows the file as a table of "App Privacy" keys; that is normal.
7. Double check: click the blue **App** project at the top of the navigator, select the **App** target, open **Build Phases**, expand **Copy Bundle Resources**, and confirm `PrivacyInfo.xcprivacy` is in the list. If it is not, click the **+** at the bottom of that list, pick the file and click **Add**.
8. Still on the **App** target, open **General** and raise **Build** by one (4 becomes 5 for the ATT-79 re-upload). **Version** stays 1.0. This changes `project.pbxproj`, which is a standing local hold: do not commit it.
9. Menu **Product, Archive**. When the Organizer opens on the new archive, Control-click it and choose **Generate Privacy Report**. The PDF should list `UserDefaults` with `CA92.1`. If Xcode says "The archive does not contain any PrivacyInfo.xcprivacy files" (reported in an [Apple Developer Forums thread](https://developer.apple.com/forums/thread/731541)), step 6 or 7 was missed. The report command is from Apple's WWDC23 session 10060, not from a documentation page, so confirm the label on your screen.
10. Upload as in section D of `docs/testflight-checklist.md` (**Distribute App**, **TestFlight & App Store**, **Distribute**). If Apple replies with an email naming an invalid privacy manifest file, Apple's page above says where to find it in the archive (Window, Organizer, Archives, Control-click the archive, **Show in Finder**, Control-click the archive, **Show Package Contents**).
11. Tell Claude when it is in, so the repo log records it.

If **Add Files** misbehaves, the documented route also works: **File, New, File from Template**, scroll to the **Resource** section, choose **App Privacy File**, click **Next**, tick the **App** target, click **Create**, then paste the contents of `ios/App/App/PrivacyInfo.xcprivacy` over it (right-click the file, **Open As**, **Source Code**).

## If this ever changes

Add a row to the audit when a plugin is added to `package.json`, and re-run the grep. Apple "continually reviews the list of required reason APIs" and updates the page, so re-read [Describing use of required reason API](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api) before a public release. `tests/e2e/privacy.spec.ts` guards the "no network, no tracking" claims this file makes; if a network call or SDK is ever added, change this file and `docs/app-privacy-answers.md` in the same commit.
