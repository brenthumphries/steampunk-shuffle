---
title: "TestFlight and App Store Connect copy"
date: 2026-10-14
tags: [docs]
status: active
---

# TestFlight copy: paste-ready text for every field (ATT-26)

Written 2026-10-14. Screen routes are the ones in `docs/testflight-checklist.md` after its 2026-10-14 correction pass. Where this file and the sample text in checklist section E differ, this file wins.

## Read this first

- **Character limits.** Apple's help pages state no limit for any TestFlight field below (read 2026-10-14: [Provide test information](https://developer.apple.com/help/app-store-connect/test-a-beta-version/provide-test-information), [Invite external testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers), [Add internal testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/add-internal-testers)). The only Apple-stated limits I found are the app name (2 to 30 characters, [App information](https://developer.apple.com/help/app-store-connect/reference/app-information)) and review Notes (4000 bytes, [App Review information](https://developer.apple.com/help/app-store-connect/reference/app-review-information), written for the App Store review form; the TestFlight form is not stated). Every field is kept short, and each table says how long it is as written. App Store Connect shows a live counter on long fields; if one turns red, trim the last sentence.
- **What testers can see.** The Beta App Description and What to Test are shown to testers, and What to Test is shown to every group that has the build ([Add internal testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/add-internal-testers)). Both are written so she can read them before Oct 30: no mention of the birthday, the dedication, the Invitational or the Landlady. Only the Review notes mention that this is a gift build, and only Apple reads those. Checklist E1's sample description ends "A birthday gift."; drop that sentence if you use it.
- **Nothing here contains your email address or phone number.** This repo is public, and the privacy page deliberately leaves them off (`docs/logs/2026-10-13.md`). Three fields are yours to type; they are marked **TYPE**.

## Which fields are required

| Field | Internal testers only | External testers (her) |
|---|---|---|
| Beta App Description | Not required. Apple's internal-tester steps ask only for What to Test. | **Required.** Apple: "This field is required." |
| Feedback Email | Not stated. | Treat as required. Apple, if the dialog lacks details: "enter Feedback Email and Contact Information." |
| Marketing URL | Not stated. | Optional. Not on Apple's Test Information page; third-party docs list it as optional. |
| Privacy Policy URL | Not stated. | Not listed as a beta field on Apple's pages (third-party docs show it on the same screen). Fill it anyway: guideline 5.1.1(i), and the App Store requires it. |
| What to Test | Entered in the **Add Builds** dialog. Apple does not say it is required; fill it. | Same dialog, same text. Fill it. |
| Beta App Review contact (first name, last name, phone, email) | Not required. | **Required** for review. Phone must be international with a leading `+` and country code; Apple states that for the App Store review form, so use it here too. |
| Sign-in required | Not applicable. | Leave **off**: the game has no accounts. |
| Review notes | Not required. | Optional by Apple's pages, but fill it: it tells the reviewer how to reach the game fast. |
| Export compliance | Per build. Already answered by `Info.plist`. | Same. |

Source for "external only": Apple, "When you distribute your app to external testers, you need to enter additional TestFlight test information about your app for TestFlight App Review" ([Provide test information](https://developer.apple.com/help/app-store-connect/test-a-beta-version/provide-test-information)). The checklist also quotes Apple's glossary on this (read 2026-10-13): "If you invite internal testers only, additional testing information is not required."

## Where each field lives

Test Information: **Apps**, the app, **TestFlight** tab, sidebar **Additional**, **Test Information**, choose **English (U.S.)** (role: Account Holder, Admin or App Manager). What to Test: **Add Builds** dialog on a group. Everything else is on the same Test Information screen.

## 1. Test Information

### Beta App Description

Apple limit: none published. As written: 214 characters.

```text
An offline steampunk card game set in a Victorian London pub. Play a short tutorial against the barkeep, build a deck from the cards you win, and enter pub tournaments. No account and no internet connection needed.
```

### Feedback Email

Apple limit: none published. **TYPE** the address you want testers to reach you on. It is also the reply-to address on invitation emails ([Provide test information](https://developer.apple.com/help/app-store-connect/test-a-beta-version/provide-test-information)), so use one you can read before Oct 27.

### Marketing URL (optional)

Apple limit: none published. As written: 51 characters. This is the playable web version, the same one the checklist keeps as the fallback. Leave the field blank if you would rather not point her at it.

```text
https://brenthumphries.github.io/steampunk-shuffle/
```

### Privacy Policy URL

Apple limit: none published. As written: 63 characters.

```text
https://brenthumphries.github.io/steampunk-shuffle/privacy.html
```

**Check before you paste.** The page is `public/privacy.html`. PR #2 (ATT-34) shows as merged into `main` on 2026-10-13 (merge commit `becbe7e`, read from the PR page), and merging deploys GitHub Pages. I could not load the live page from here, so open the link in a browser first (guideline 2.1: URLs must work). If it 404s, leave this field blank rather than paste a dead link, and check the Pages run in GitHub Actions. ATT-34 is still In Review in Linear.

The same URL goes in **App Privacy** in App Store Connect; the answer there is **No, we do not collect data from this app**, with the proof in `docs/app-privacy-answers.md`.

### Other fields on the screen

- **Invitation Experience, App Information** checkbox: leave the default (ticked). It shows approved screenshots and the category, and there is no approved version yet, so nothing appears ([Provide test information](https://developer.apple.com/help/app-store-connect/test-a-beta-version/provide-test-information)).
- **License Agreement:** leave blank. Apple's pages do not mention it.

## 2. What to Test (this build)

Apple limit: none published. As written: 540 characters. Paste it in the **What to Test** dialog when you add the build to the internal group and again for the external group. Apple notes an optional localized version per language; skip it.

```text
First full build of the game. Please check:
- The guided tutorial against the barkeep plays through to the end.
- A few pickup games against the regulars at the bar. Cards, sounds and taps feel right on your phone.
- Build a deck, then play a game with it.
- Close the app in the middle of a match and reopen it. The match should pick up where you left it.
- Try it in airplane mode. Nothing should change.
- Save & data: export your save, then import it back.
Tell me about anything that crashes, freezes, looks cut off or is hard to read.
```

## 3. Beta App Review (TestFlight App Review) contact and notes

| Field | Enter |
|---|---|
| First name | Brent |
| Last name | Humphries |
| Phone | **TYPE**, in the form `+1` then ten digits, no spaces or brackets |
| Email | **TYPE** |
| Sign-in required | Off |

### Review notes

Apple limit: 4000 bytes for the App Review "Notes" field; the TestFlight field's limit is not stated. As written: 1002 characters, 1002 bytes, all plain ASCII so characters and bytes match.

```text
No account, sign-in, network connection, purchase or advertising is involved. The app is an offline card game and makes no network requests. The in-game currency (Checks) has no cash value and cannot be bought.

First launch: a short opening card may appear; tap Continue. A guided tutorial then plays against the barkeep (follow the on-screen hints; it takes a few minutes of taps). It pays 10 Checks and opens the pub. Some seasonal content appears only around Hallowe'en.

To reach a tournament quickly: The Tuesday Knockout is always open and costs 20 Checks. From the pub, tap Constable Tobias Mudd, tap Continue, tap Leave Game, then Leave anyway. That pays 7 Checks the first time each day and 2 Checks each time after, so three of these give 21 Checks in total. Or win one game against Mudd for 8 Checks plus the 5-Check daily bonus. Then tap The chalkboard, find The Tuesday Knockout, tap Enter (20 Checks), then tap Play Quarterfinal.

This is a personal gift build for a small private group.
```

How the quick route was worked out. The numbers come from the code and the e2e specs, not from a device. Tutorial reward: 10 Checks (`TUTORIAL_REWARD_CHECKS`). Leave Game pays as a loss, 2 Checks (`LOSE_CHECKS`), plus 5 (`DAILY_BONUS_CHECKS`) on the first pickup game of the day, so 7, then 2, then 2: 10 + 7 + 2 + 2 = 21, and the Tuesday Knockout costs 20 (`src/tournaments/tournaments.ts`). `tests/e2e/leaveGame.spec.ts` asserts the 7. A win against Mudd pays 8 plus the 5: 23. The button names (`Play Constable Tobias Mudd`, `Leave Game`, `Leave anyway`, `The chalkboard`, `Enter (20 Checks)`, `Play Quarterfinal`) are the ones the soak specs click. Sir Charles pays nothing in Checks, so he cannot be used for this. If the reviewer sits through the tutorial on a day when the daily bonus has already been used, they need one more Leave Game.

## 4. Export compliance

`ITSAppUsesNonExemptEncryption` is `false` in `ios/App/App/Info.plist` (read 2026-10-14). Apple: set `NO` "if your app, including any third-party libraries it links against, doesn't use encryption, or if it only uses forms of encryption that are exempt" ([Complying with Encryption Export Regulations](https://developer.apple.com/documentation/security/complying-with-encryption-export-regulations)). The app makes no network connections and has no encryption code of its own (`docs/app-privacy-answers.md`), so no encryption questions should appear and no document is needed.

If a build shows **Missing Compliance** anyway, the key did not reach the archive. Tell Claude before you answer. If you have to answer to unblock yourself: TestFlight, under **Builds** click **iOS**, click the build, **Manage** or **Provide Export Compliance Information** ([steps](https://developer.apple.com/help/app-store-connect/test-a-beta-version/provide-export-compliance-information-for-beta-builds)), and choose the outcome Apple's table gives for "encryption limited to that within the Apple operating system": no documentation required ([Export compliance documentation for encryption](https://developer.apple.com/help/app-store-connect/reference/export-compliance-documentation-for-encryption)). Answer no to anything about non-standard or proprietary algorithms, and do not upload a CCATS or a French declaration. Click **Save**.

Apple's pages do not print the exact wording of the questions or their Yes/No options; they are shown only inside App Store Connect. If the wording is ambiguous, stop and ask rather than guess. This is Apple's process and not legal advice. Apple also notes an app that uses exempt encryption might owe a year-end self-classification report ([BIS](https://www.bis.doc.gov/index.php/policy-guidance/encryption/4-reports-and-reviews/a-annual-self-classification)); that is for apps that use encryption, which this one does not.

## 5. Fields on the New App screen and the groups

Only needed if the app record or the groups do not exist yet. **Apps**, the add button (**+**), **New App**.

| Field | Enter | Apple limit |
|---|---|---|
| Platforms | iOS | n/a |
| Name | `Wheatstone` (10 characters); fallback `Wheatstone Bridge` (17 characters) | 2 to 30 characters |
| Primary language | English (U.S.) | n/a |
| Bundle ID | `com.brenthumphries.steampunkshuffle` | none stated; must match Xcode; cannot change after the first upload |
| SKU | `steampunk-shuffle` | letters, numbers, hyphens, periods, underscores; not starting with a hyphen, period or underscore; cannot change later |
| User Access | Full Access | n/a |
| Internal group name | `Me` | none stated |
| External group name | `Family` | none stated |

Role needed to create the record: Account Holder, App Manager or Admin, and the Account Holder must have signed the latest agreement in **Business** ([Add a new app](https://developer.apple.com/help/app-store-connect/create-an-app-record/add-a-new-app)).

## Things to know before you start

- **Linear says a build may already be in review.** The ATT-26 comment of 2026-10-12 says build 1.0 (1) is uploaded, processed and **Waiting for Review**, with sections E done, while the 2026-10-13 log and your brief treat the upload as Oct 20. If a build is already in review, do not withdraw or resubmit it. Use this file for re-entering a field or for the next build, which needs **Build** raised by one.
- **Her email.** Per ATT-26, keep her out of every group until Oct 27. The invitation email goes out on approval for any group she is in.
- **Xcode.** Apple's Upload builds page lists Xcode 26 or later for building an iOS app ([Upload builds](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds)). Check **Xcode, About Xcode** before archiving.

## Related

- `docs/testflight-checklist.md`, `docs/app-privacy-answers.md`, `docs/app-store-readiness.md`
- Linear ATT-26, ATT-34
