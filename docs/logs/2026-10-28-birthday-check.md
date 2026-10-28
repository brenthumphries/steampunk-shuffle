---
title: "Birthday-eve check, Wed 28 Oct 2026 (ATT-30)"
date: 2026-10-28
tags: [log]
---

# Birthday-eve check (report only)

## Verdict: GO

The live web game is main, it works, and the birthday dates behave as the plan says. No tracked file was changed and no patch is needed.

The GO covers the **web version** and the game logic. It does **not** cover the TestFlight route. That depends on three things this session could not see (see "What this check could not prove").

## Checks

| # | Check | Result |
|---|---|---|
| 1 | Live equals main | MATCH |
| 2 | Tests on main | PASS (628 unit, 193 e2e, Chromium only) |
| 3 | Live smoke test, iPhone profile | PASS, all four steps |
| 4 | Birthday dates, test browser | PASS, 29, 30 and 31 Oct |
| 5 | Gift card QR decode | Web QR PASS. TestFlight QR in the repo is still the PLACEHOLDER |
| 6 | Patch | None needed |

### 1. Live equals main: MATCH

- Main is `f1cfb6c` (22 Oct, "ci: retry e2e failures twice…"). This session's branch sits on the same commit.
- Last green deploy: Actions run 65, "Deploy to GitHub Pages", on `f1cfb6c`, finished 22 Oct 03:52:43Z. The live `index.html` has `last-modified: Thu, 22 Oct 2026 03:52:37 GMT`.
- Runs 62, 63 and 64 (22 Oct) were red and so did not deploy. Run 65 added the e2e retry after Safari and Firefox flaked.
- I ran `npm ci && npm run build` on main here and compared it with the live site, using GET only:
  - `index.html`: identical. It points at `assets/index-CjwvZYr5.js` and `assets/index-0T4p-7fX.js`.
  - `sw.js`: identical, with the same 152 precache entries.
  - `manifest.webmanifest`: identical.
  - Both entry JS files fetched live are byte-identical to the local build (`cmp`).
- No push to main has landed since the 22 Oct deploy, so the freeze has held.

### 2. Tests on main

- `npm test`: 56 files, **628 passed**, 0 failed.
- Playwright on the image's Chromium at the iPhone 17 profile, from `playwright.chromium.config.ts`:

  | Project | Passed | Failed | Skipped |
  |---|---|---|---|
  | Chromium-Pages | 97 | 0 | 22 |
  | Chromium-Native | 96 | 0 | 23 |
  | **Total** | **193** | **0** | 45 |

- The skips are the specs' own:
  - `soakAll` is opt-in (`SOAK_ALL=1`): 42.
  - `houseRules` mouse-wheel skips on mobile: 2.
  - `smoke` skips on Native, which has no service worker: 1.
- `birthday.spec.ts`, `tutorial.spec.ts`, `privacy.spec.ts` and `intro.spec.ts` all pass.
- **Not run here:** Safari (WebKit), Firefox, Chrome and Edge. Playwright's browsers can't be downloaded in this sandbox. The only evidence for those four is CI run 65, which was green on `f1cfb6c`. CI retries failures twice, and Safari and Firefox each flaked on 22 Oct, so I can't tell from here whether run 65 passed first time.

### 3. Live smoke test: PASS

I used a temporary Playwright spec kept outside the repo, driving `https://brenthumphries.github.io/steampunk-shuffle/` in Chromium at the iPhone 17 profile (402x874). The service worker was allowed and the real date (28 Oct) was used.

| Step | Result | Screenshot |
|---|---|---|
| First load | Pass. The tutorial board ("Round 1 of 3", Sir Charles) is up in about 3.4 s. The service worker is active. | `s1-first-load-tutorial.png` |
| Tutorial start and finish | Pass. I played it through to a win, then the beer mat and Continue led to the hub. | `s2-tutorial-won.png`, `s3-hub-after-tutorial.png` |
| Pickup game | Pass. I played Constable Mudd from coin toss to the end (a loss with that autopilot seed, which is fine). | `s4-pickup-cointoss.png`, `s5-pickup-finished.png` |
| Reload with the network off | Pass. I reloaded once under the service worker, switched to offline and reloaded. The hub rendered and a full pickup game was played offline. | `s6-offline-reload-hub.png`, `s7-offline-pickup-finished.png` |

- Console: one 404, for `https://brenthumphries.github.io/favicon.ico`. That is Chromium asking at the domain root. The page declares only an apple-touch-icon, which returns 200. It is harmless on iOS.
- The launch intro film (`video/intro.mp4`, 4.95 MB, and its poster) is served 200 and is in the service worker precache, so it works offline.
- Playwright reports `navigator.webdriver`, which skips the intro. Automation therefore never played it. See the phone checks below.
- The screenshots are in the session scratchpad: `/tmp/claude-0/-home-user-steampunk-shuffle/022deabb-1147-5217-a7da-85dee560b919/scratchpad/live-e2e/shots/`. They are not committed, because the brief allows only the report as a new file. The scratchpad is lost when the container is reclaimed.

### 4. Birthday dates, test browser only

I set Playwright's clock (`page.clock.setFixedTime`, the same way `birthday.spec.ts` does). I used no `?now=` or `preview=1`. The service worker was blocked, and each date started from a clean local save.

| Date | Result | Screenshots |
|---|---|---|
| Thu 29 Oct | Nothing early. A fresh launch goes straight to the tutorial with no dedication. The chalkboard lists Tuesday Knockout, Peelers' Cup, Reichenbach and the All Hallows' Wake, with no Birthday row. `invitationalTriggered` is not set. | `d29a`, `d29b`, `d29c` |
| Fri 30 Oct | A fresh launch shows the dedication: "The Wheatstone Bridge, Licensed to Sara, in every century, the best is yet to come, Happy birthday. — B." Continue leads to the tutorial. With a tutorial-done save, the chalkboard shows "The Birthday Invitational: Unlocks October 30 · All six Legends + Sir Charles · Entry free · Win 500 Checks + The Landlady" with an enabled Enter button. | `d30a` to `d30d` |
| Sat 31 Oct | The dedication still shows on a first launch. The Invitational is still there and enabled, which is what the PT-39 fix and the plan intend. Hallowe'en is still live (visitors, Wake). | `d31a` to `d31c` |

- The dedication name is "Sara" in these runs. The helper seeds that name, and a fresh launch showed it too. Brent should confirm it's the right name when he checks the game on his own phone.
- On the 29th the pub already shows the Hallowe'en visitors and the Wake, because the event runs 22 to 31 Oct. That is by design.
- The e2e suite covers the same dates (`birthday.spec.ts`, run in check 2).

### 5. Gift card

I decoded the PNGs in `docs/gift-card/png/` and 300 dpi rasters of every PDF in `docs/gift-card/pdf/`, with zxing-cpp 12 files in all. The files date from 19 Oct, and nothing in the repo has changed them since.

| File | Decoded |
|---|---|
| `back-web.png`, `back-web.pdf` | `https://brenthumphries.github.io/steampunk-shuffle/` |
| `sheet-back-web.png`, `sheet-back-web.pdf` | `https://brenthumphries.github.io/steampunk-shuffle/` |
| `back-testflight.png`, `back-testflight.pdf` | **`PLACEHOLDER - TestFlight public link not created yet. Do not print.`** and the web URL |
| `sheet-back-testflight.png`, `sheet-back-testflight.pdf` | The same two strings |
| `front-proposal.*`, `sheet-front-proposal.*` | No QR (none expected) |

- The web QR reaches the live URL: GET returns **200** (check 1).
- **TestFlight QR in the repo: still the placeholder.** No `testflight.apple.com/join/…` link appears in any repo file except the README and `make.py`, which carry only the template text.
- Linear ATT-29 (28 Oct) records a different state on Brent's Mac. He re-ran `make.py` with a real public link, `https://testflight.apple.com/join/D34P5the`, and scanned the new QR on his iPhone. It opened correctly. Those regenerated files are not in the repo, so I could not decode them. I could not fetch the link either: `testflight.apple.com` is blocked by this environment's network policy. Whether the link is live, and what the printed card holds, are for Brent.
- The decode results in the repo are stale: they say placeholder.

### 6. Patch

None. Nothing failed, so there is nothing to weigh against the freeze. The plan's last revert time is Thu 29 Oct, 6 pm.

## What this check could not prove

- Anything on a real iPhone, and the TestFlight build and its public link.
- The Safari, Firefox, Chrome and Edge runs. Only CI run 65 vouches for them.
- The regenerated TestFlight card. The files are on Brent's Mac and were never in the repo.

## Brent's three checks on his own phone

1. **The TestFlight public link and the printed card.** Scan the printed (or on-screen) TestFlight QR with the camera. Confirm it opens `join/D34P5the`, shows Wheatstone as installable, and that the tester limit is set. His 28 Oct phone scan covered the on-screen file, so the printed copy is what still needs proving.
2. **The launch intro and the first minutes, on the TestFlight build and on the web version.** The 10-second intro film plays on every launch and has only ever run in a real browser with automation skipped. Check that it plays with sound after a tap and that a tap skips it. Then check the dedication ("Licensed to…", right name) and the tutorial start. On web, Add to Home Screen should read "Wheatstone".
3. **The web fallback, offline.** Open the web URL in Safari, add it to the Home Screen, play one pickup game in airplane mode, and confirm the date is set to automatic. Do not use `?now=…&preview=1` on any phone she will use.
