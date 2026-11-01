# Status ledger — Steampunk Shuffle monthly content (repo mirror)

**Canonical copy: the Linear document "Steampunk Shuffle status ledger"** (project Steampunk Shuffle,
https://linear.app/attainabl/document/steampunk-shuffle-status-ledger-c5098754d404). This file is a mirror the Code
orchestrator refreshes in its first commit and at each month close; if the two disagree, Linear wins. Runbook §3.
States: todo · running · PR open · merged · shipped · verified live · blocked · won't do.
Linear note: there is no applicable "Brent" label (only a label group), so Brent items use "deep work".

**Mirrored:** 2026-11-01 from the Linear ledger last updated 2026-11-01 08:55 CT (art desk).

## Lanes (approved by Brent, Nov 1)

| Lane | Where | Owns | Can't reach |
| -- | -- | -- | -- |
| **Code orchestrator** | Claude Code session, Code tab, repo brenthumphries/steampunk-shuffle | Everything git/GitHub (S-5b, S-6, all build/content/fix/release agents, merges, ships), Linear for those issues, playtests in its own cloud browser, wakes for all that, the ledger's step rows | Claude in Chrome, Brent's Mac, the claude.ai Project docs |
| **Art desk** | Cowork conversation attached to the steampunk-shuffle Project, ~/projects connected | Gemini art through Claude in Chrome (all *-ART steps), QA, art/inbox on the Mac, the art checklists, image hand-off to the Code lane, reminders to Brent for Letters | git push |

Rules: each lane edits only its own rows; ★ questions go to Brent from whichever lane raises them.

## 0. Handoff

- Oct 31, first orchestrator: retired (GitHub never reached it).
- Oct 31, second orchestrator (Cowork): built S-6 (`e2bc1a8`, branch `claude/setup-s6-plan`) and N-A (`5df94d2`, branch `claude/cunning-folk-n-a`, based on S-6) but couldn't push. Backup bundle on the Mac: ~/projects/steampunk-shuffle-work/bundles/2026-10-31-n-a-and-s6.bundle.
- Older ledger copies: ~/projects/steampunk-shuffle-work/monthly-content/status.md and the Project doc plan/monthly/status.md. The Linear document is now canonical.
- Oct 31 late: Brent chose option 2 (Code-tab orchestrator) and pushed both branches from his Mac. Nov 1: two-lane split approved.

## 1. Setup (runbook §4)

| # | Step | Who | State | Linear | Notes |
| -- | -- | -- | -- | -- | -- |
| S-1 | Orchestrator conversation | Brent | done | | Code-tab session, Oct 31 |
| S-2 | Gemini via Claude in Chrome | Brent | done | | Model "4 Argon"; never generate on the Flash-Lite fallback. Upload via + → Upload files → file_upload with staged cloud paths. |
| S-3 | Chrome downloads → art/inbox | Brent | done | | Downloads are JPEG; convert to true PNG. |
| S-4 | GitHub push access | Brent | done (Code lane) | ATT-91 | Code session has admin/push. |
| S-5 | ASC API key + repo secrets | Brent | done | ATT-92 | |
| S-5b | testflight.yml + dry run | Claude (Code lane) | todo | ATT-89 | |
| S-6 | Plan into repo | Claude (Code lane) | PR open | ATT-90 | |
| S-7 | Linear issues | Claude | done | | 59 issues, ATT-83…141 |
| S-8 | Wake schedule | Claude | per lane | | |
| S-9 | Dry run | Claude | art proven; TestFlight after S-5b | | |
| S-10 | Standing approvals | Brent | done | | Folders + Chrome (art desk); GitHub (Code lane) |
| S-11 | Routing note in hq/routing.md | Claude | done | | |
| S-12/13 | Google Play | Brent | deferred | | |
| S-14 | Release 1.1 decisions | — | done | | |

## 2. Steps

Points: S=2, M=3, L=5. Due = target merged (SHIP rows = Pages + TestFlight).

### November · `cunning-folk` · Nov 1–30 · arrivals Nov 13 · Stakes Nov 20–30 · sheet-9 · 21 images

| Step | What | Agent · pts | State | Due | Linear | Notes |
| -- | -- | -- | -- | -- | -- | -- |
| N-ART | Gemini, 21 images | Art desk | running 18/21 | Nov 8 | ATT-83 | next: image 19 redo, then 20, 21 |
| N-A | Framework | Build · Sonnet · 5 | PR open, verify running | Nov 4 | ATT-84 | 687 unit tests, typecheck clean, Chromium e2e subset 44/44 (agent's own run). Host and pool-mat rules approved by Brent. |
| N-B | Coven + Scry | Build · Sonnet · 3 | todo | Nov 6 | ATT-85 | after N-A merges |
| N-C | Fortune-teller's Booth | Build · Sonnet · 5 | todo | Nov 8 | ATT-86 | after N-A |
| N-D | November content | Content · Haiku · 3 | todo | Nov 10 | ATT-87 | after N-A/B/C; needs branch art/november |
| N-SHIP | Playtest + ship | 2 | todo | **Nov 12** | ATT-88 | |

N-A follow-ups (not blockers): tools/artPrompts.ts and ingest-art.py don't know the Tarot/Almanack/Sleeve categories yet (N-D needs them); Almanack frame not applied on deck-builder tiles; ledger lives at `pub.ledger` in the export.

### December · `ghost-story` · Dec 1–31 · sheet-10 · 16 images

| Step | What | pts | State | Due | Linear | Notes |
| -- | -- | -- | -- | -- | -- | -- |
| D-ART | Gemini | — | todo | Nov 20 | ATT-95 | opens Nov 16 |
| D-A | Advent Cabinet + snowfall | Sonnet 3 | todo | Nov 20 | ATT-96 | |
| D-B | December content | Haiku 3 | todo | Nov 24 | ATT-97 | ★ optional foil-cat swap (Bramwell) |
| D-SHIP | Playtest + ship | 2 | todo | **Nov 27** | ATT-98 | |

### Release 1.1 (14 §5)

| Step | What | pts | State | Due | Linear |
| -- | -- | -- | -- | -- | -- |
| X-B1 | Install page + prompt | Haiku 2 | todo | Nov 28 | ATT-99 |
| X-A1 | Ledger Shelf + namespacing | Sonnet 5 | todo | Dec 3 | ATT-100 |
| X-A2 | Send/receive ledger | Sonnet 3 | todo | Dec 8 | ATT-101 |
| X-T | Upgrade playtest part 1 | Sonnet 2 | todo | Dec 12 | ATT-102 |
| R-1.1 | Ship with January | Haiku 2 | todo | **Dec 21** | ATT-107 |
| X-B2–B4, X-A3 | Android, Play, sync | — | deferred | | — |

### January to September (ATT-103…141; dates in the month files)

- January `aether-voyage`: J-ART Dec 12 (ATT-103) · J-A S3 Dec 10 (ATT-104) · J-B S3 Dec 14 (ATT-105) · J-C H3 Dec 17 (ATT-106) · ships with R-1.1 Dec 21
- February `wuthering-weather`: F-ART Jan 15 (ATT-108) · F-A S3 Jan 15 (ATT-109) · F-B H3 Jan 21 (ATT-110) · F-SHIP Jan 25 (ATT-111)
- March `mice-and-mischief`: M-ART Feb 13 (ATT-112) · M-A S5 Feb 15 (ATT-113) · M-B H3 Feb 20 (ATT-114) · M-SHIP Feb 24 (ATT-115)
- April `cellar-cabaret`: A-ART Mar 15 (ATT-116) · A-A S5 Mar 16 (ATT-117) · A-B H3 Mar 21 (ATT-118) · A-SHIP Mar 25 (ATT-119)
- May `maying`: Y-ART Apr 15 (ATT-120) · Y-A S3 Apr 14 (ATT-121) · Y-B S3 Apr 18 (ATT-122) · Y-C H3 Apr 22 (ATT-123) · Y-SHIP Apr 25 (ATT-124)
- June `midsummer-revel`: Jn-ART May 15 (ATT-125) · Jn-A S5 May 16 (ATT-126) · Jn-B H3 May 21 (ATT-127) · Jn-SHIP May 25 (ATT-128) · ★ optional: draft permanent later
- July `cliff-house`: Jl-ART Jun 15 (ATT-129) · Jl-A S5 Jun 16 (ATT-130) · Jl-B H3 Jun 20 (ATT-131) · Jl-SHIP Jun 24 (ATT-132)
- August `lammas-fair`: Au-ART Jul 15 (ATT-133) · Au-A S5 Jul 16 (ATT-134) · Au-B H3 Jul 21 (ATT-135) · Au-SHIP Jul 25 (ATT-136)
- September `michaelmas-term`: S-ART Aug 15 (ATT-137) · S-A S5 Aug 15 (ATT-138) · S-B S3 Aug 18 (ATT-139) · S-C H3 Aug 22 (ATT-140) · S-SHIP Aug 25 (ATT-141)

## 3. Art (art desk)

The per-image checklist lives in the Linear ledger §3 (art desk rows). As mirrored: November 18/21 passed; 19 (tarot-the-fool) failed, redo next; 20 and 21 todo.

Image hand-off (option B, approved Nov 1): Brent pushes each month's QA-passed raw PNGs to branch **art/<month>** (files at art/inbox/<id>.png). Content agents replace wrapper W4 with `git fetch origin art/<month> && git checkout origin/art/<month> -- art/inbox/`, keep those files out of the content commit (`git reset art/inbox`), then run the ingest command. Branch art/<month> is deleted after the content PR merges.

## 4. Letters from B. (Brent only; Claude never drafts)

| Letter | Brent's deadline | Reminder | Linear | State |
| -- | -- | -- | -- | -- |
| Valentine | Feb 10 | Jan 2 | ATT-93 | placeholder |
| Year report | Sep 18 | Aug 1 | ATT-94 | placeholder |

## 5. Open ★ questions

- none open

## 6. Decisions log

- 2026-10-31: kickoff. Settled decisions: 00 §10, 14 §4.
- 2026-10-31: art model = Gemini "4 Argon"; never generate on the Flash-Lite fallback.
- 2026-10-31: S-5 secrets added; S-11 routing line OK.
- 2026-10-31: Brent approved N-A's host rule (met on a launch on or after arrival; a first launch after the window closed meets her next year) and that a `{id, fromYear}` pool entry's beer mat comes from the matching arrival gift.
- 2026-10-31: orchestrator runs as a Claude Code session in the Code tab.
- 2026-11-01: two-lane split (Code orchestrator + Cowork art desk) and image hand-off option B approved.

## 7. Daily points

| Date | Dispatched | Points |
| -- | -- | -- |
| 2026-10-31 | S-6 (2), N-A (5), art dry-run | 7 |
| 2026-11-01 | N-A verify (Code lane) | — |
