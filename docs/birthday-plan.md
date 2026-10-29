---
title: "Birthday plan: getting the game to her on Fri 30 Oct"
date: 2026-10-15
tags: [docs]
status: active
---

# Birthday plan: getting the game to her on Fri 30 Oct

Written Thu 15 Oct from the repo files and Linear only. Nothing was uploaded, submitted, invited, shipped or changed. Times are Central. Anything in no file or issue is marked unknown.

## Where things stand

**Done.** Freeze and tag v1.0-rc1 (ATT-24), iOS wrap (ATT-25), checklist (ATT-22), TestFlight text (`docs/testflight-copy.md`), privacy page merged. 578 unit tests passed on 14 Oct. No P1 in PLAYTEST.md.

**Waiting on Apple.** Review of build 1.0 (1), only if it was submitted. Apple states no review time; the checklist's 24 to 48 hours is typical.

**Waiting on Brent.** ATT-23, the invite route (due 7 Oct, Backlog). Three fields only he can type: feedback email, phone, contact email. The live privacy URL (ATT-34). ATT-26 (Todo) and ATT-27 (Backlog, no playthrough notes anywhere).

**Unknown.** (1) Build 1.0 (1) today: the checklist says processed; the 12 Oct ATT-26 comment says Waiting for Review and tags it v1.0-rc2; the 13 and 14 Oct logs treat the upload as 20 Oct. (2) Any Apple email, including ITMS-91053. (3) Whether that build has the PT-39 fix, which is on main since 13 Oct. (4) The latest Pages run and the live privacy URL. (5) Where the card is printed.

## 1. Timeline

| Date | Step | Owner | Issue |
|---|---|---|---|
| Thu 15 Oct | Read build 1.0 (1) status and any App Review message in App Store Connect. Search email and spam for Apple and "ITMS-91053". Tell Claude. | Brent | ATT-26 |
| Thu 15 Oct | Answer ATT-23. This plan assumes a public-link QR on the card and her email added only on the day. | Brent | ATT-23 |
| Fri 16 Oct | Open the live privacy page and game on your phone. Check the latest Pages run is green. | Brent | ATT-34 |
| Fri 16 to Mon 19 Oct | If processed, install from your internal group (no review needed). Play the tutorial and one tournament. Send notes. | Brent | ATT-27 |
| Mon 19 Oct | Make both card backs, TestFlight first and web first, in `docs/gift-card/`. | Claude | ATT-29 |
| Tue 20 Oct | Build uploaded, processed, submitted for external review. If an ITMS-91053 email exists, add `PrivacyInfo.xcprivacy` and raise Build first. | Brent | ATT-26 |
| Wed 21 to Fri 23 Oct | First external review. Do not withdraw or resubmit. | Apple | ATT-26 |
| Fri 23 Oct | Checkpoint: playthrough done, P1s sent. Not approved yet: treat web as likely and test the web route. | Brent | ATT-27 |
| Fri 23 to Mon 26 Oct | P1 fixes only (Claude Code), ss-ship, raise Build, upload. Mon 26 is the last fix build or resubmission. | Claude, Brent | ATT-28 |
| Sun 25 Oct | Card PDFs ready. Proof them. | Claude, Brent | ATT-29 |
| Tue 27 Oct, noon | Merge freeze. Last upload, from the commit Pages serves. Note the upload date on ATT-31. | Brent | ATT-28 |
| Wed 28 Oct | Rehearse the route on a phone that is not hers. Test web on yours. 6 pm: pick TestFlight or web. | Brent | ATT-30 |
| Thu 29 Oct | Print the chosen card. Confirm Pages loads. Check email and spam. No pushes to main. | Brent | ATT-29 |
| Fri 30 Oct | Handoff (section 5). | Brent | ATT-30 |
| Sat 31 Oct on | Post-launch notes and the re-upload reminder. | Claude | ATT-31 |

## 2. Risks

| Risk | Early signal | Fallback | Last safe date | Action that starts it |
|---|---|---|---|---|
| TestFlight review is slow, rejects, or asks a question | Waiting for Review past 48 hours; Rejected; an Apple message with a question (check email and spam daily). | Answer or fix, raise Build, resubmit. Guideline 5.2 stand-ins: `docs/app-store-readiness.md` section 4. No approved build at the cutoff: web. | Resubmit Mon 26 Oct. Switch to web Wed 28 Oct, 6 pm. | TestFlight, General, App Review: paste Apple's text to Claude Code. |
| ITMS-91053 privacy-manifest warning blocks a later upload | An Apple email naming ITMS-91053 (unknown if one came), or an upload warning. No `PrivacyInfo.xcprivacy` under `ios/` (checked 15 Oct). | Add `ios/App/App/PrivacyInfo.xcprivacy` from the checklist (reason code CA92.1 confirmed against Apple's reason list on 29 Oct; file ready, see `docs/privacy-manifest.md`), raise Build, upload, tell Claude. The approved build stays in the group. | Mon 26 Oct. | Search email and spam for ITMS-91053 today. |
| His playthrough (ATT-27) finds a ship-blocking bug after 23 Oct | A P1 in PLAYTEST.md (none today); a crash, a stuck tutorial, a save lost after force-quit, no sound after the first tap. | Before Mon 26: fix and new build. After: no new build. iOS-only bug: hand her web. Bug in both: merge by Tue 27 noon, or give her the game as it stands, sit with her, fix after. | Mon 26 Oct for a build. Tue 27 Oct, noon, for a merge. | Send notes with ss-playtest. Claude Code fixes P1 only. |
| The invite email does not arrive or lands in spam | No email within 10 minutes at the Wed 28 rehearsal, or it is in spam. She is emailed as soon as she is in an approved group, so keep her out until the day. | The public-link QR on the card needs no email. Then open the link in Safari on her phone. Then the web QR. | Thu 29 Oct to change the card. 10 minutes into the handoff. | When approved, create a public link (Open to Anyone) and give Claude the URL for the QR. |
| The public link or the TestFlight app misbehaves on her phone | Link full or unavailable; TestFlight asks for an update; Install greyed; the app will not open. | Web QR: Safari, Share, Add to Home Screen. The two versions keep separate saves. | 10 minutes into the handoff. Wed 28 Oct, 6 pm, to print web first. | Scan the second QR on the card. |
| The build expires or is replaced at the wrong moment | A newer build Processing while she installs. Expiry is 90 days after upload (25 Jan 2027 for a 27 Oct upload), so it cannot hit the gift; a late build can. | Keep the first approved build in the group. Add no build to the group after Wed 28 Oct, 6 pm. Hand her the build you rehearsed. | Tue 27 Oct, noon, for the last upload. | Calendar: no uploads after Tue 27 noon. Put the upload date on ATT-31. |
| The Pages web version breaks, or a merge lands untested near the date | Pages run red; page old or blank; any push to main after Tue 27 noon. Docs-only pushes deploy too (`deploy.yml` has no path filter) and the auto-updating service worker swaps her copy. | Re-run the last green deploy in GitHub Actions (suggested, not tried), or Claude Code reverts to the last green commit. TestFlight stays the gift if healthy. | Merge Tue 27 Oct, noon. Revert Thu 29 Oct, 6 pm. | Wed 28: open the live game on your phone, play a pickup game in airplane mode. Wrong: ask Claude Code to revert. |
| The Hallowe'en layer misbehaves on 30 Oct | Her phone's date is not automatic; no Invitational on the chalkboard; no dedication. The date is the phone's calendar day (`src/events/eventClock.ts`). `tests/e2e/birthday.spec.ts` covers 30 Oct; no real iPhone has run it. | Set date to automatic, relaunch. If a touch is missing, play on: the dedication shows on her first launch on or after 30 Oct. Never use `?now=...&preview=1` on her phone: it sets the Invitational flag for good. | Wed 28 Oct. | On your phone open the web game with `?now=2026-10-30&preview=1`, check chalkboard and dedication, clear site data. |
| The invite route is undecided, so the card cannot be finished | ATT-23 still Backlog on Sat 17 Oct. | Claude makes both card backs. The choice waits until Wed 28. | Sun 25 Oct for the PDFs. Thu 29 Oct to print. | Comment the route on ATT-23 (about 3 minutes). |

## 3. Decision dates

**Last day TestFlight can still be the gift: Wed 28 Oct, 6 pm.** An approved build is in the external group and the route has worked on a phone that is not hers. A rejection after Mon 26 cannot be fixed in time (one more review is about 48 hours), and Thursday must stay free to print the web card.

**Last day to merge to main: Tue 27 Oct, noon.** Merges deploy Pages, docs-only ones too, and the final build must come from the commit Pages serves. The afternoon covers CI in four browsers and a live check on your iPhone. After that, use branches: a branch push runs nothing and a pull request does not deploy.

## 4. If the web version becomes the gift

Card back only (the front stays). Drop the three TestFlight steps and the TestFlight QR. Keep one QR to `https://brenthumphries.github.io/steampunk-shuffle/` under "Open this in Safari". Steps: 1. Scan the code and open the link in Safari. 2. Tap Share, Add to Home Screen, Add. 3. Open Wheatstone from your Home Screen. Remove any mention of an invite email or TestFlight (ATT-29).

To tell her:

1. "Happy birthday. This is a card game made for you, set in a pub, and it is ready to play."
2. "It opens from a web page, so it needs one extra step to put on your phone. The card has three steps and I will do them with you."
3. "The first game is a guided one, so you do not need to know any card games."

If TestFlight comes through later, her web save does not move by itself. Save & data has export and import, but export on iOS is unverified (13 Oct log). Keep one version going.

## 5. Day-of checklist, Fri 30 Oct

Have open, in this order: (1) your phone, with the web page loaded (proves Pages is up), then TestFlight; (2) your laptop on App Store Connect, TestFlight, the external group, Testers, her Apple ID email at hand (not in the repo); (3) the printed card; (4) her phone on Wi-Fi with its date set to automatic.

Handoff:

1. Give her the card and your three lines (change line 2 to match).
2. She scans the QR, installs TestFlight, taps Install on Wheatstone.
3. She opens it: dedication, then the tutorial. You stay for the first match.

If something fails, give TestFlight 10 minutes in total, then go to web:

- QR or link dead: add her Apple ID email to the group and press Notify Testers while she installs TestFlight. The email can be slow or land in spam.
- It will not install, will not open, or the screen looks wrong: scan the web QR and Add to Home Screen, about two minutes. Note what she saw and tell Claude later.
- Nothing installs: play the web page in Safari.
- Afterwards: record it on ATT-30 and set the ATT-31 date.

If web is the gift, steps 2 and 3 become section 4's steps.
