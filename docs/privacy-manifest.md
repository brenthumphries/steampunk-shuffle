# Privacy manifest (ITMS-91053 fallback, ATT-26)

Checked on **2026-10-19**. The file is `ios/App/App/PrivacyInfo.xcprivacy`. **Merge this only if Apple sends ITMS-91053 (email or upload warning); otherwise keep it parked.** Merging to `main` deploys Pages, and the merge freeze starts Tue 27 Oct, noon.

The Xcode project (`project.pbxproj`) is a standing local hold and this branch does not touch it. The file sitting in the folder does nothing until it is added to the App target in Xcode (steps below); this project does not use Xcode's auto-synced folders.

## What the file says

| Key | Value | Why |
|---|---|---|
| `NSPrivacyTracking` | `false` | No tracking: no SDK, ad, identifier or analytics (`docs/app-privacy-answers.md`). |
| `NSPrivacyTrackingDomains` | empty | The app contacts no server (`tests/e2e/privacy.spec.ts`). |
| `NSPrivacyCollectedDataTypes` | empty | Matches the App Store answer "Data Not Collected". |
| `NSPrivacyAccessedAPITypes` | `NSPrivacyAccessedAPICategoryUserDefaults` with reason `CA92.1` | `@capacitor/preferences` stores the save mirror in `UserDefaults.standard` (details below). |

## Required-reason API audit

Method: grep of the Swift sources of the app (`ios/App/App/*.swift`), Capacitor core (`@capacitor/ios` 8.5.3) and each plugin in `package.json`, for every API in Apple's five categories, plus a search for any manifest each package ships. Also compared with the binaries Xcode built in DerivedData on this Mac (Release archive).

| Apple category | Used in the shipped binary? | Evidence |
|---|---|---|
| User defaults | **Yes**, by `@capacitor/preferences` only | `Preferences.swift:19` returns `UserDefaults.standard`; `PreferencesPlugin.swift:89-114` reads and removes keys through it. It stores the app's own keys under the prefix `CapacitorStorage.`. Nothing in the app's own Swift, Capacitor core, haptics, splash-screen or status-bar touches `UserDefaults`. Capacitor core's `KeyValueStore` is file-based, not `UserDefaults`. |
| File timestamp | No | The only file calls are `fileExists(atPath:)` and `.fileSizeKey` (`WebViewAssetHandler.swift:72`). No creation or modification date, `stat`, or `getattrlist`. Apple's list is about timestamps and file metadata; a bare existence check and the size key are not timestamps. **Unconfirmed edge:** Apple's file-timestamp reasons say "timestamps, size, or other metadata", so if Apple ever flags file size, the code would be `C617.1` (files inside the app container). Not added, because adding an unused declaration is not what the manifest is for. |
| System boot time | No | No `systemUptime`, `mach_absolute_time` or `sysctl` in any of the sources. |
| Disk space | No | No `volumeAvailableCapacity`, `statfs` or file-system attribute calls. |
| Active keyboard | No | No `activeInputModes`. |

Limit of this audit: it covers source, not the compiled plugins' system-library calls (Foundation or WebKit internals are Apple's own code and are not the app's declaration). A scan of compiled binaries was not run.

### Do the packages already ship a manifest?

| Package | Own `PrivacyInfo.xcprivacy`? |
|---|---|
| `@capacitor/ios` 8.5.3 (Capacitor.framework, Cordova.framework) | Yes, **both empty** (no accessed APIs, no collected data, `NSPrivacyTracking` false). Checked in the Xcode-built frameworks in DerivedData, debug and release. |
| `@capacitor/preferences` 8.0.1 | **No** (none in the package; its `Package.swift` declares no resources). This is why the app needs its own entry. |
| `@capacitor/haptics` 8.0.2, `@capacitor/splash-screen` 8.0.2, `@capacitor/status-bar` 8.0.4 | No, and none needs one (they use none of the listed APIs). |

## Reason code, with sources and confidence

| Code | Meaning (Apple) | Confidence |
|---|---|---|
| `CA92.1` | User defaults: "to read and write information that is only accessible to the app itself" (no reading other apps' or the system's data, no writing data other apps can read). | **High, one gap.** Apple's [NSPrivacyAccessedAPITypeReasons](https://developer.apple.com/documentation/bundleresources/app-privacy-configuration/nsprivacyaccessedapitypes/nsprivacyaccessedapitypereasons) page (read 2026-10-19 through Apple's page data) lists four user-defaults reasons: `CA92.1`, `1C8F.1`, `C56D.1`, `AC6B.1`. Their descriptions come in the same order as the codes (app itself, App Group, third-party SDK wrapper, MDM), so the first is `CA92.1`. The page data separates codes from descriptions, so that pairing is by order, not by a printed label. Independent confirmation: [Capacitor's privacy manifest page](https://capacitorjs.com/docs/ios/privacy-manifest) and the [Preferences docs](https://capacitorjs.com/docs/apis/preferences) name `NSPrivacyAccessedAPICategoryUserDefaults` with `CA92.1` as the recommended reason for this plugin. |
| `C56D.1` (not used) | SDK wrapper reason; "may only be declared by third-party SDKs". The app is not an SDK. | n/a |
| `1C8F.1` (not used) | App Group only. The app has no App Group. | n/a |

The risk table's "CA92.1 is unconfirmed" can be updated to: confirmed against Apple's reason list by order, and against Capacitor's docs. Residual doubt is Apple's own acceptance, which only an upload proves. Apple's overview: [Describing use of required reason API](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api) (the page itself is script-rendered, so the code list above came from its linked reasons page). Apple's [Feb 2024 notice](https://developer.apple.com/news/?id=3d8a9yyh) sets the rule that uploads need approved reasons.

## When to use it

Use it only if **Apple sends ITMS-91053** ("Missing API declaration") by email, or App Store Connect shows it as an upload warning (docs/birthday-plan.md, risk table: last safe date Mon 26 Oct). Build 1.0 (1) processed without it; do nothing if no email comes. If you add it, the approved build stays in the group and you upload one new build.

## Steps for Brent (Xcode)

1. In the `steampunk-shuffle` checkout, bring the file in: `git fetch` and `git checkout origin/ios/privacy-manifest -- ios/App/App/PrivacyInfo.xcprivacy` (or merge the PR, if you are happy to deploy Pages).
2. Open `ios/App/App.xcodeproj` in Xcode.
3. In the Project navigator, right-click the **App** folder (the yellow one that holds `Info.plist`), choose **Add Files to "App"...**, and select `PrivacyInfo.xcprivacy`. Untick **Copy items if needed** if the file is already in that folder; tick **Add to targets: App**.
4. Click the file, open the File inspector (right panel), and under **Target Membership** confirm **App** is ticked. (Xcode also shows the file as a table of "App Privacy" keys; that is normal.)
5. Select the **App** target, **General**, and raise **Build** by one (Version stays). This edits `project.pbxproj`, which is a standing local hold: do not commit it.
6. Product, **Archive**, then upload as before. Expect the ITMS-91053 warning to be gone from the next email. To check before uploading: in the Organizer, right-click the archive, **Generate Privacy Report**; it should list `UserDefaults` / `CA92.1`.
7. Tell Claude, so the repo records the final state.

## Lint

```bash
plutil -lint ios/App/App/PrivacyInfo.xcprivacy
```
