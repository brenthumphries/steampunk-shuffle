# Status ledger — Steampunk Shuffle monthly content

Written only by the orchestrator (runbook §3). Mac copy of Project `plan/monthly/status.md` (the Project doc store isn't reachable from the orchestrator session; this folder is the working copy until S-6 puts it in the repo at `docs/plans/monthly/`).
States: todo · running · PR open · merged · shipped · verified live · blocked · won't do.
Last updated: 2026-10-31 (orchestrator kickoff)

## Next scheduled wake
- see "Wakes" at the bottom

## Open ★ questions for Brent
- ★1 Who made the 19 November images now in art/inbox (Oct 31 evening)? Treated as done pending the art agent's QA.

## Setup (runbook §4)
| # | Step | Who | State | Linear | Notes |
|---|---|---|---|---|---|
| S-1 | Orchestrator conversation | Brent | done | — | Oct 31 |
| S-2 | Claude in Chrome + Gemini sign-in | Brent | partly done | — | Chrome extension connected (macOS). Gemini sign-in to be confirmed by the art agent |
| S-3 | Chrome downloads → art/inbox | Brent | appears done | — | Gemini_Generated_Image_*.jpeg files landing in art/inbox Oct 31 |
| S-4 | GitHub push access | Brent approves | **blocked** | ATT-91 | Session has read-only clone; GH token invalid; no add_repo tool in this session |
| S-5 | ASC API key + signing secrets | Brent | todo | ATT-92 | |
| S-5b | testflight.yml workflow | Claude | todo (needs S-4, S-5) | ATT-89 | |
| S-6 | Plan into repo docs/plans/monthly + bops block | Claude | running (local commit; push waits on S-4) | ATT-90 | |
| S-7 | Linear issues | Claude | done | ATT-83…141 | Already present at kickoff; checked, no duplicates added |
| S-8 | Wake schedule | Claude | done | — | |
| S-9 | Dry run (art image + TestFlight run) | Claude | art: running; TestFlight: waits on S-5b | — | |
| S-10 | Standing approvals | Brent | todo | — | folders ✓ (~/projects connected), Chrome on gemini.google.com ?, GitHub repo ✗ |
| S-11 | Routing note in hq/routing.md | Claude, Brent OK | todo (asking) | — | |
| S-12/13 | Google Play | Brent | deferred | — | |
| S-14 | Release 1.1 decisions | — | done | — | |

## Monthly steps
| Month | Step | Agent · model · pts | State | PR | Linear | Due | Notes |
|---|---|---|---|---|---|---|---|
| Nov | N-ART art (21) | Art · Sonnet · 3 | running | — | ATT-83 | Nov 8 | 19/21 in inbox; missing tarot-the-magician, penny-for-the-guy |
| Nov | N-A Framework | Build · Sonnet · 5 | running | — | ATT-84 | Nov 4 | |
| Nov | N-B Coven and Scry | Build · Sonnet · 3 | todo | — | ATT-85 | Nov 6 | |
| Nov | N-C Fortune-teller's Booth | Build · Sonnet · 5 | todo | — | ATT-86 | Nov 8 | |
| Nov | N-D November content | Content · Haiku · 3 | todo | — | ATT-87 | Nov 10 | |
| Nov | N-SHIP playtest + ship | Playtest/Release · 2 | todo | — | ATT-88 | Nov 12 | |
| Dec | D-ART art (16) | Art · Sonnet · 3 | todo | — | ATT-95 | Nov 20 | opens Nov 16 |
| Dec | D-A Advent Cabinet and snowfall | Build · Sonnet · 3 | todo | — | ATT-96 | Nov 20 | |
| Dec | D-B December content | Content · Haiku · 3 | todo | — | ATT-97 | Nov 24 | |
| Dec | D-SHIP | 2 | todo | — | ATT-98 | Nov 27 | |
| 1.1 | X-B1 Install page | Build · Haiku · 2 | todo | — | ATT-99 | Nov 28 | |
| 1.1 | X-A1 Ledger Shelf | Build · Sonnet · 5 | todo | — | ATT-100 | Dec 3 | |
| 1.1 | X-A2 Send/receive ledger | Build · Sonnet · 3 | todo | — | ATT-101 | Dec 8 | |
| 1.1 | X-T part 1 upgrade playtest | Playtest · Sonnet · 2 | todo | — | ATT-102 | Dec 12 | |
| 1.1 | X-B2 / X-B3 / X-T part 2 / X-A3 | — | deferred | — | — | — | Android only when Brent says |
| Jan | J-ART art (17) | Art · 3 | todo | — | ATT-103 | Dec 12 | opens Dec 5 |
| Jan | J-A Moon phases | Build · Sonnet · 3 | todo | — | ATT-104 | Dec 10 | |
| Jan | J-B Sleeves + prize fallback | Build · Sonnet · 3 | todo | — | ATT-105 | Dec 14 | |
| Jan | J-C January content | Content · Haiku · 3 | todo | — | ATT-106 | Dec 17 | |
| Jan | R-1.1 Release 1.1 + Jan ship | Release · Haiku · 2 | todo | — | ATT-107 | Dec 21 | |
| Feb | F-ART | Art · 3 | todo | — | ATT-108 | Jan 15 | |
| Feb | F-A Devoted + letter placeholders | Build · Sonnet · 3 | todo | — | ATT-109 | Jan 15 | |
| Feb | F-B February content | Content · Haiku · 3 | todo | — | ATT-110 | Jan 21 | |
| Feb | F-SHIP | 2 | todo | — | ATT-111 | Jan 25 | |
| Mar | M-ART | Art · 3 | todo | — | ATT-112 | Feb 13 | |
| Mar | M-A Mystery mode and Mischief | Build · Sonnet · 5 | todo | — | ATT-113 | Feb 15 | |
| Mar | M-B March content | Content · Haiku · 3 | todo | — | ATT-114 | Feb 20 | |
| Mar | M-SHIP | 2 | todo | — | ATT-115 | Feb 24 | |
| Apr | A-ART | Art · 3 | todo | — | ATT-116 | Mar 15 | |
| Apr | A-A House Rules of the Night | Build · Sonnet · 5 | todo | — | ATT-117 | Mar 16 | |
| Apr | A-B April content | Content · Haiku · 3 | todo | — | ATT-118 | Mar 21 | |
| Apr | A-SHIP | 2 | todo | — | ATT-119 | Mar 25 | |
| May | Y-ART | Art · 3 | todo | — | ATT-120 | Apr 15 | |
| May | Y-A Steal | Build · Sonnet · 3 | todo | — | ATT-121 | Apr 14 | |
| May | Y-B The Window Box | Build · Sonnet · 3 | todo | — | ATT-122 | Apr 18 | |
| May | Y-C May content | Content · Haiku · 3 | todo | — | ATT-123 | Apr 22 | |
| May | Y-SHIP | 2 | todo | — | ATT-124 | Apr 25 | |
| Jun | Jn-ART | Art · 3 | todo | — | ATT-125 | May 15 | |
| Jun | Jn-A Fair Draft + Locations | Build · Sonnet · 5 | todo | — | ATT-126 | May 16 | |
| Jun | Jn-B June content | Content · Haiku · 3 | todo | — | ATT-127 | May 21 | |
| Jun | Jn-SHIP | 2 | todo | — | ATT-128 | May 25 | |
| Jul | Jl-ART | Art · 3 | todo | — | ATT-129 | Jun 15 | |
| Jul | Jl-A Cameo and Stereoscope | Build · Sonnet · 5 | todo | — | ATT-130 | Jun 16 | |
| Jul | Jl-B July content | Content · Haiku · 3 | todo | — | ATT-131 | Jun 20 | |
| Jul | Jl-SHIP | 2 | todo | — | ATT-132 | Jun 24 | |
| Aug | Au-ART | Art · 3 | todo | — | ATT-133 | Jul 15 | |
| Aug | Au-A The Gauntlet | Build · Sonnet · 5 | todo | — | ATT-134 | Jul 16 | |
| Aug | Au-B August content | Content · Haiku · 3 | todo | — | ATT-135 | Jul 21 | |
| Aug | Au-SHIP | 2 | todo | — | ATT-136 | Jul 25 | |
| Sep | S-ART | Art · 3 | todo | — | ATT-137 | Aug 15 | |
| Sep | S-A Night School | Build · Sonnet · 5 | todo | — | ATT-138 | Aug 15 | |
| Sep | S-B Year recap + Grand Reading | Build · Sonnet · 3 | todo | — | ATT-139 | Aug 18 | |
| Sep | S-C September content | Content · Haiku · 3 | todo | — | ATT-140 | Aug 22 | |
| Sep | S-SHIP | 2 | todo | — | ATT-141 | Aug 25 | |
| Letters | Valentine letter | Brent only | reminder Jan 2 | — | ATT-93 | Feb 10 | Claude never writes letter text |
| Letters | September letter | Brent only | reminder Aug 1 | — | ATT-94 | Sep 18 | |

## Art checklist — November (01-november.md §9)
| # | Asset id | State | QA note |
|---|---|---|---|
| 1 | background-the-taproom-cunning-folk | in inbox (+v1) | QA pending |
| 2 | portrait-mother-shipton | in inbox | QA pending |
| 3 | mother-shipton | in inbox | QA pending |
| 4 | portrait-john-dee | in inbox | QA pending |
| 5 | john-dee | in inbox | QA pending |
| 6 | portrait-mother-red-cap | in inbox | QA pending |
| 7 | mother-red-cap | in inbox | QA pending |
| 8 | portrait-pamela-colman-smith | in inbox | QA pending |
| 9 | pamela-colman-smith | in inbox (+v1, v2) | QA pending |
| 10 | hedge-witch | in inbox | QA pending |
| 11 | cunning-woman | in inbox (+v1) | QA pending |
| 12 | witch-bottle | in inbox | QA pending |
| 13 | almanack-scorpio | in inbox | QA pending |
| 14 | almanack-sagittarius | in inbox (+v1) | QA pending |
| 15 | stir-up-pudding | in inbox | QA pending |
| 16 | remember-remember | in inbox | QA pending |
| 17 | old-moores-almanack | in inbox (+v1) | QA pending |
| 18 | the-petrifying-well | in inbox | QA pending |
| 19 | tarot-the-fool | in inbox | QA pending |
| 20 | tarot-the-magician | missing | art agent |
| 21 | penny-for-the-guy | missing | art agent |

## Daily points
| Date | Dispatched | Points |
|---|---|---|
| 2026-10-31 | S-6 (2), N-A (5), N-ART finish (part of 3) | ~8 |

## Decisions log
- 2026-10-31 kickoff: N-A starts on a local branch based on the S-6 commit; pushes and PRs wait for S-4.

## Wakes
- (booked at end of kickoff turn)
