---
title: "Decision packet: public App Store release (ATT-32)"
date: 2026-10-29
tags: [docs, decision]
status: draft
---

# Decision packet: public App Store release (ATT-32)

Prepared 2026-10-29 for Brent. **This prepares the decision and does not make it.** Nothing was submitted, requested, signed, uploaded or changed in App Store Connect or in the game. It replaces the 20 Oct comment on ATT-32 where the two disagree (section 6 says where).

**Read first.** Every Apple fact below carries a link to the Apple page it was read from on 2026-10-29. Where a page could not be read, or does not say, the line is marked **unconfirmed**. None of Apple's pages shows a last-updated date. Not legal advice.

**Sizes.** XS under 1 hour, S 1 to 3 hours, M half a day to a day, L two days or more. They are Claude's estimates, not Apple's.

## 1. The decision, in one paragraph

Her TestFlight build 4 (uploaded 23 Oct) stops opening on **Thu 21 Jan 2027** (`CLAUDE.md`, "Post-launch"). Three ways forward:

| Option | What it is | Ends the 90-day chore? |
|---|---|---|
| **A. Stay on TestFlight** | Re-upload a new build before 21 Jan, and every 90 days after. | No |
| **B. Unlisted on the App Store** | Same app, no search or charts, reachable only by link. Full App Review. | Yes |
| **C. Public** | A real store listing. Full App Review, and the gift-edition work. | Yes |

## 2. What a public release adds beyond TestFlight

- **No expiry.** TestFlight: "Your build becomes unavailable for testers after 90 days" ([TestFlight overview](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/)). An App Store build has no such clock.
- **App Review instead of TestFlight review.** Apple reviews App Store submissions "to confirm they're safe, secure, and reliable" ([Submitting](https://developer.apple.com/app-store/submitting/)). Guideline 2.2 already holds beta builds to the same guidelines ([App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)), so the rules are not new; the stakes and the scrutiny are.
- **Things Apple requires before submitting**, per [Submitting](https://developer.apple.com/app-store/submitting/): the age rating questionnaire, the privacy details, and accessibility support indications. Also a working privacy policy link in the listing and inside the app (guideline 5.1.1(i), same Guidelines page).
- **A product page**: name, subtitle, description, keywords, screenshots, support URL. Drafted in `docs/store-listing.md` (ATT-35).
- **EU trader status** must be declared even if the app is not distributed in the EU ([Manage EU Digital Services Act trader requirements](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements/)). A declared trader's address, phone and email are published on the product page in the 27 EU territories. Apple says a hobbyist with "no intention of commercializing" an app "may not be considered a trader"; Apple "can't determine" it for you.
- **A wider audience for the IP risk.** Guideline 5.2.1 bars "protected third-party material such as trademarks, copyrighted works" without permission, and Apple acts on rights-holder complaints (`docs/app-store-readiness.md` section 1).
- **Unlisted specifics** ([Unlisted App Distribution](https://developer.apple.com/support/unlisted-app-distribution/)): the app must be on the App Store or "submitted to App Review", with a Review Notes line saying it is for unlisted distribution, and then you submit a request form. "Requests will be declined for unlisted distribution if your app hasn't been submitted to App Review, or if your app is in a beta or prerelease state." Unlisted apps "don't appear in any App Store categories, recommendations, charts, search results, or other listings", and "are available to anyone who has access to the link."

## 3. The work list

Owner: **C** = Claude, **B** = Brent. "Public only" items are not needed for Unlisted if the gift edition ships as it is (question 2 in section 8).

| # | Work | Size | Owner | Applies to | Notes |
|---|---|---|---|---|---|
| 1 | **Privacy manifest (ATT-66).** Merge [PR #7](https://github.com/brenthumphries/steampunk-shuffle/pull/7) (it replaced PR #4) (`ios/App/App/PrivacyInfo.xcprivacy`, `UserDefaults` with `CA92.1`), add it to the App target in Xcode per `docs/privacy-manifest.md`. | S | C prep done, B in Xcode | B, C | Apple: from 1 May 2024 "You'll need to include approved reasons for the listed APIs used by your app's code (including from third-party SDKs) to upload a new or updated app to App Store Connect" ([Upcoming requirements](https://developer.apple.com/news/upcoming-requirements/); original [news post, 29 Feb 2024](https://developer.apple.com/news/?id=3d8a9yyh)). Note the wording is **upload**, not submission, so it also applies to a TestFlight re-upload. Build 4 uploaded and processed without it; whether Apple sent a warning email is unknown (ATT-66). `CA92.1` is now confirmed against Apple's reason list (29 Oct ATT-66 comment, PR #7). The `birthday.spec.ts:163` race in `expectArtLoaded` (25 Oct ATT-66 comment) is still open; see item 2. |
| 2 | **Fix the `birthday.spec.ts:163` race** (poll or `img.decode()`), so CI is trustworthy for a release build. | XS | C | all | Test-only change; diagnosis is on ATT-66. |
| 3 | **In-app privacy-policy link** (guideline 5.1.1(i)). | S | C, B checks on device | B, C | Must not strand the player in a web view (`docs/app-privacy-answers.md`). Re-check the "Unrestricted web access" age-rating answer if it opens in-app. Needs a changed `privacy.spec.ts` allowance only if it makes a request; a link that opens Safari is not a request from the app. |
| 4 | **Replace the six High-risk names** (Dame Agatha, Hercule Poirot, Good News Everybody, Party Time. Excellent., Abby Normal, Eye-gor). | M code, S art | C code, B generates 6 images in Gemini | B, C | Stand-ins and flavour are in `docs/app-store-readiness.md` section 4. Name, flavour and art id only; points and keywords unchanged, so the sim does not move. Also change the Christie and Poirot opponent lines, the toast (`src/tournaments/toast.ts`) and House Rules text. Optional Medium items (Hypnofrog, Resurrection Man, "You stand fire admirably"): S. |
| 5 | **Gift-edition flag**: dedication, "Sara" default name, Birthday Invitational, toast, Landlady card, House Rule 5, dev clock. | L | C | C only (see question 2) | Eight places listed in `docs/app-store-readiness.md` section 7. Landlady is one of the labelled 60, so the set becomes 59 in `dataSet.test.ts`, the sim and the art manifest. Five e2e specs must run with the flag on. **A save that already holds the Landlady needs a tested path** if the card is hidden (unverified). |
| 6 | **Store listing fields only Brent can fill**: support URL (and a `public/support.html` if the address lives on the Pages site), copyright line, Content Rights, EU trader status, review contact, territories. | S | B, with C for the page | B, C | List in `docs/store-listing.md`, "Everything that needs Brent". **Content Rights** waits on Google's terms for the Gemini-generated art. |
| 7 | **Name check**: "Wheatstone" in USPTO and EUIPO classes 9 and 41; try the name in App Store Connect. | XS | B | B, C | Not done (`docs/app-store-readiness.md` section 6). Fallback "Wheatstone Bridge". |
| 8 | **Record licences**: `public/audio/ambience.mp3` source and licence; Gemini art terms. | XS | B | B, C | Logged as "CC0/licensed" with no source (`docs/logs/2026-09-12.md`). |
| 9 | **Screenshots** from `npm run store-screenshots`; decide whether the 21 MB folder is committed. | XS | C runs, B decides | B, C | They are taken from a seeded save with gift touches and High names kept out. After item 4, the shots can show more of the cast. |
| 10 | **Archive, upload, fill App Store Connect, submit** (ATT-36), then for Unlisted file the request form. | M | B | B, C | The App Store version page, App Privacy ("Data Not Collected", `docs/app-privacy-answers.md`), age rating (decided 14 Oct: 13+, and R 18+ in Australia), screenshots, review notes. |
| 11 | **Answer a rejection**, if one comes. | S to M per round | B + C | B, C | Paste Apple's message into a Claude session (ATT-36). |

**Totals, honestly:** Unlisted with the gift edition left as it is: about 2 to 3 working days of Claude time plus about 3 to 4 hours of Brent's, before Apple's wait. Public adds the gift-edition flag (item 5): roughly 2 more days of Claude time and a second round of testing.

## 4. Costs, as Apple publishes them

| Item | Apple's figure | Source | For this project |
|---|---|---|---|
| Developer Program | "99 USD per membership year" | [Apple Developer Program](https://developer.apple.com/programs/whats-included/); [enrollment help](https://developer.apple.com/help/account/membership/program-enrollment/) | Already paid, and TestFlight needs it too, so a release adds **$0**. It must stay active; the lapse rules were **unconfirmed** (the Renewal page was not read). |
| App price | Not a fee; free apps are allowed | | Free. No in-app purchases, which keeps guideline 3.1 out of scope (`docs/app-store-readiness.md` section 6). |
| Unlisted request | The page mentions no fee | [Unlisted App Distribution](https://developer.apple.com/support/unlisted-app-distribution/) | No fee stated. |
| App Review time | Not stated on the pages read ([Submitting](https://developer.apple.com/app-store/submitting/), [App Review](https://developer.apple.com/app-store/review/) loaded without body text) | | **Unconfirmed.** Budget days, not hours, and leave room for a rejection round. The TestFlight checklist's "24 to 48 hours" is for Beta App Review and also a typical figure, not a promise. |
| Trader declaration | No fee; contact details become public if you declare as a trader | [DSA trader help](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements/) | $0, but a privacy cost (address, phone, email on the product page). |
| Things Apple does not charge for but cost time | Review, the listing, updates | | Hours listed in section 3. Ongoing: a listing needs upkeep, and Apple's SDK floor keeps moving. |

Ongoing time if staying on TestFlight (option A): one re-upload about every 90 days, roughly 30 to 45 minutes for Brent (steps in `CLAUDE.md`, "Post-launch"). Next one is due by 7 Jan 2027.

## 5. Risks and fallbacks

| Risk | Signal | Fallback |
|---|---|---|
| **Approval does not arrive before 21 Jan.** | No decision by early Jan, or a rejection in review. | Re-upload to TestFlight by 7 Jan whatever else is going on. It is independent and takes under an hour. Never let a pending App Review be the only thing between her and an expired build. |
| **Unlisted request declined.** Apple's examples are limited-audience tools: "partner sales tools, employee resources, or research studies". A one-recipient gift is arguably a limited audience; the page does not promise approval. | The request form comes back declined. | Option A, or go Public. The earlier comment that "Apple grants Unlisted on request" is **not supported** by the page. |
| **Unlisted cannot easily become Public.** | Wanting a real listing later. | Apple: "Once your app is approved, the distribution method can't be changed" with one exception, "to change your publicly available app to an unlisted app" ([Set distribution methods](https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/set-distribution-methods)). Read plainly, Unlisted to Public is not offered in place, so it would likely need a new app record and a new bundle id, which would not carry her save. **Unconfirmed**; ask Apple Developer Support before choosing Unlisted if going Public later matters. |
| **Rejection under 5.2 (IP)** for the High names. | Reviewer message citing 5.2 or a rights-holder complaint. | Item 4's stand-ins. None touches the gift edition. |
| **Rejection under 4.2 ("beyond a repackaged website").** | Reviewer message citing 4.2. | Low risk: a full offline game with native touches (`docs/app-store-readiness.md` section 5). Add the native share sheet and extra haptics, reply with the notes. |
| **Rejection for a missing in-app privacy link.** | Citing 5.1.1(i). | Item 3 before submitting. |
| **Privacy manifest warning or rejection.** | An ITMS-91053 email or upload warning. | Item 1; the file is ready in PR #7. |
| **Unlisted link is shareable.** Apple: "Consider implementing a mechanism within your app to prevent unauthorized use." | The link goes beyond her. | There is no account system. The game collects nothing and costs nothing to run, so the exposure is a stranger playing a free offline game. Accept it, or keep the gift edition's personal touches out (question 2). |
| **Name collision.** | Name rejected at record creation, or a notice about WHEATSTONE. | Fallback "Wheatstone Bridge" (checklist). |
| **Apple's rules move.** Apple already says uploads from April 2027 need "the iOS & iPadOS 27 SDK or later, and target iOS 15 or later" ([Submitting](https://developer.apple.com/app-store/submitting/)). | A new notice in [Upcoming requirements](https://developer.apple.com/news/upcoming-requirements/). | Any release path needs a build with a newer Xcode after April 2027. This applies to option A too. |
| **Save continuity** (section 7). | Her progress is missing after the switch. | Rehearse on Brent's own phone first; export before switching. |

## 6. Where this changes the 20 Oct comment on ATT-32

- It said "Apple grants Unlisted on request". Apple's page says requests "will be declined" in listed cases and does not promise approval.
- It said no gift-edition flag is needed for Unlisted. That is still true for review, but Unlisted is not private: "anyone who has access to the link" can install it.
- It treated Unlisted as the way to end the chore with little work. The work list is nearly the same as Public minus item 5: items 1, 3, 4, 6, 7, 8 and 10 still apply, because App Review applies to both.

## 7. What stays the same for her save

**Confirmed from the repository:**

- Same bundle id `com.brenthumphries.steampunkshuffle` and same App Store Connect record (`docs/testflight-checklist.md`). A new App Store version would use the same record.
- The save is seven `localStorage` keys prefixed `steampunk-shuffle:` (`active-match`, `audio-muted`, `deck-slots`, `player`, `pub-state`, `tournament-state`, `tutorial-state`), mirrored into Capacitor Preferences so iOS clearing the web view's storage does not lose it (`src/native/storageMirror.ts`; `docs/app-privacy-answers.md`). A release changes none of them unless a code change in this packet does.
- The Pages web version keeps a **separate** save; it never moves by itself (`docs/birthday-plan.md` section 4).
- "Save & data" has export and import, but export on iOS is unverified (13 Oct log).

**Unconfirmed, and the one place a save could be lost:**

- Whether installing the App Store build over the TestFlight build keeps the app's data. Apple's pages read here do not say. Same bundle id and a same-bundle update normally keep it, but test it: install the TestFlight build on Brent's phone, play, then install the App Store build and look.
- If a public edition hides the **Landlady** and a save already holds it, the card id would be in her collection with no card behind it. This has not been tried. Hers should stay the gift edition (question 2).
- The gift edition's dedication is a Sep 1 to Oct 29 hold and shows once on a first launch on or after 30 Oct; by January she has seen it.

## 8. Recommendation and the questions

**Recommendation: no-go on Public. Re-upload to TestFlight by 7 Jan 2027, and treat Unlisted as an optional later project, started only after that re-upload is done.**

Why:

1. The re-upload is about 30 to 45 minutes and fully in Brent's hands. Unlisted is days of work and depends on Apple, and its approval is not promised.
2. The extra work for any App Store route is mostly not about her: manifest, privacy link, six renames, trader status, support URL. Those are worth doing only if the game is going to strangers or if Brent wants the chore gone for good.
3. Public additionally needs the gift-edition flag (about 2 days) and puts the six High names in front of the widest audience. Nothing blocks it, but nothing gains from it for her.
4. The 90-day clock is not urgent: first re-upload on 7 Jan, expiry 21 Jan.

Brent's three questions:

1. **Who is this for?** Only her (then option A, and Unlisted if you want the chore gone), or others should be able to find it (then Public, with the gift-edition flag)?
2. **If Unlisted or Public: should her copy stay the gift edition?** Dedication, "Sara", the Landlady, the Invitational. Recommended yes for Unlisted (the link is shareable but not discoverable). For Public the flag is needed for the store build, and then her copy and the store build would diverge, which is a second build to look after.
3. **If going ahead: will you replace the six High names, and what contact details may Apple show?** (Christie and Poirot are two of the six legends; the other four are film jokes the game can lose for free.) And for the EU: declare as a trader with a public address, phone and email, or declare as a hobbyist not a trader, which is Brent's own self-assessment under EU law, not Apple's call.

Decision date: **7 Jan 2027** at the latest, so a fallback re-upload is still possible before 21 Jan.

## Sources (all read 2026-10-29 unless marked)

- [Unlisted App Distribution](https://developer.apple.com/support/unlisted-app-distribution/)
- [Set distribution methods](https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/set-distribution-methods)
- [Upcoming requirements](https://developer.apple.com/news/upcoming-requirements/) (Xcode 26 since 28 Apr 2026; required reasons since 1 May 2024; age rating questions; trader status)
- [Privacy updates for App Store submissions, 29 Feb 2024](https://developer.apple.com/news/?id=3d8a9yyh)
- [Submitting](https://developer.apple.com/app-store/submitting/)
- [TestFlight overview](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/)
- [Apple Developer Program](https://developer.apple.com/programs/whats-included/) and [enrollment help](https://developer.apple.com/help/account/membership/program-enrollment/)
- [EU Digital Services Act trader requirements](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements/)
- [Set an app age rating](https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating)
- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), as read 2026-10-13 in `docs/app-store-readiness.md`
- Not readable on 2026-10-29, so unconfirmed: [Describing use of required reason API](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api) (page body would not load; the `CA92.1` text is second-hand), [App Review](https://developer.apple.com/app-store/review/) (no review-time figure found).
- Linear: ATT-26 (build 4 upload comment, 23 Oct), ATT-28, ATT-31, ATT-32 (20 Oct and 14 Oct comments), ATT-36, ATT-66 (25 Oct comments).
- Repository: `docs/app-store-readiness.md`, `docs/store-listing.md`, `docs/app-privacy-answers.md`, `docs/testflight-checklist.md`, `docs/birthday-plan.md`.
