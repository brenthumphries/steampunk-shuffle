# Orchestration Runbook: one Opus conversation runs the year

**Status:** approved approach, 2026-10-31 (Brent: "all steps except Letters from B. are performed by Claude… a single conversation in Claude running Opus to manage everything"). This file defines how. The month files (`01-november.md` … `11-september.md`) define *what*.

---

## 1. The shape

- **One conversation drives everything.** A single Cowork conversation running **Opus**, attached to the `steampunk-shuffle` Project, is the **orchestrator**. Brent comes back to that one conversation to see status, answer the occasional question, or write a letter.
- **The orchestrator doesn't do the work itself.** It reads the plan, decides what's next, spins up **subagents** (the Agent tool, with a model chosen per hq/routing.md), checks their results with fresh eyes, merges, ships, and records state. Keeping its own context lean is a rule, not a nicety: it reads summaries and PR diffs, never whole code dumps.
- **It wakes itself up.** It schedules reminders into *this same conversation* with `send_later` (the Claude Code Remote tool), so the year advances without Brent prompting it. It never uses the in-session cron tools, which die with the session.
- **State lives outside the conversation.** The conversation will be compacted many times over a year, and the cloud container is reclaimed when idle. On every wake, the orchestrator rebuilds its picture from the durable records in §3, never from memory of earlier turns.
- **Brent's part:** the one-time setup in §4 (connections, credentials, approvals), **Letters from B.** (§9), and answering a ★ question when the orchestrator asks one. Nothing else.

## 2. The agents

| Agent | Model | Runs | Tools it needs | Typical task |
|---|---|---|---|---|
| **Orchestrator** | **Opus** (this conversation) | always | everything | Plan, dispatch, review, merge, ship, record, talk to Brent |
| **Art agent** | Sonnet | one at a time (there's one browser) | Claude in Chrome, Mac device tools, Read (to look at images) | Run a month's Gemini one-shot on gemini.google.com, QA each image, save it to the Mac art inbox |
| **Build agent** | Sonnet | ≤ 2 in parallel (counting the art agent) | Bash (cloud), git, gh REST | Run a month's feature prompt (N-A, D-A, J-A …) in a cloud clone and open a PR |
| **Content agent** | Haiku (Sonnet after two failed exit checks) | as above | Bash, git, gh, Mac device tools (to stage art) | Run a month's content prompt (N-D, D-B …), ingest art, open a PR |
| **Verify agent** | Sonnet, fresh context | after every PR | Bash, git, gh | Review the PR against its prompt and the month file (the `bops:verify` habit): tests, scope, ids, text matches the plan, nothing giftOnly untagged, no TODO letters leaking |
| **Playtest agent** | Sonnet | after content merges | Bash, Playwright (preinstalled Chromium), Read | Play the deployed preview at iPhone size on key dates with the dev clock, take and look at screenshots, file findings in PLAYTEST.md |
| **Fix agent** | Sonnet | on a P1 or red CI | Bash, git, gh | Fix one finding, with a test, and open a PR |
| **Release agent** | Haiku | after the ship gate | gh REST | Merge, watch the Pages deploy, trigger and watch the TestFlight workflow, confirm the build processed; once Android is started (deferred), also upload the Android AAB to the Google Play internal track (`14-saves-and-android.md` §3.3) |

**Routing rule** (hq/routing.md, unchanged): the cheapest model that can deliver. Escalate one tier only after two failed exit checks. The orchestrator itself is Opus by Brent's choice; subagents never are.

**Concurrency and budget** (hq/routing.md): at most **2** subagents in flight at once; about **8 points a day** of subagent work (S = 2, M = 3, L = 5 from the month files' prompt headers); waves of up to 5 points. A typical month is 11–16 points, so its build spreads over two to three working days, plus art days. Overflow rolls to the next day; the orchestrator schedules a wake for it.

## 3. Where state lives (the orchestrator's memory)

| Record | Where | Holds | Who writes it |
|---|---|---|---|
| **Status ledger** | Project doc `plan/monthly/status.md` | One row per month and step: state (todo, running, PR open, merged, shipped, verified live), PR link, Linear id, date, notes; the art checklist per image; open ★ questions; the next scheduled wake | Orchestrator only, after every change |
| **Queues** | Linear (bops): one issue per step, label `Claude`; Brent items labelled `Brent` | The same steps, sized, for Brent's daily view and `/daily` | Orchestrator |
| **Code and history** | GitHub `brenthumphries/steampunk-shuffle`, PRs into `main` | Everything shipped, plus `docs/logs/` entries from each agent | Agents (branches), orchestrator (merges) |
| **Plan** | Repo `docs/plans/monthly/` and Project `plan/monthly/` | These files; decisions | Orchestrator (keeps both in sync) |
| **Raw art** | Mac: `~/projects/steampunk-shuffle/art/inbox/` (gitignored, the original drop folder) | Gemini PNGs named `<asset id>.png`, before ingest | Art agent |
| **Scratch** | Cloud: `/home/claude/ss/<task-id>/` | Disposable clones | Agents (deleted after merge) |

**Rehydration rule:** every wake starts with: read `plan/monthly/status.md`, check Linear for the month's issues (closed means closed: never reopen a Done or Canceled item, per `~/projects/CLAUDE.md`), list open PRs, then act. If records disagree, the repo wins for code, Linear wins for what Brent has settled, and the status ledger is corrected.

## 4. One-time setup

| # | Step | Who | Notes |
|---|---|---|---|
| S-1 | Start the orchestrator conversation | **Brent** | A new Cowork conversation, model **Opus**, attached to the `steampunk-shuffle` Project, with `~/projects` connected. Paste the kickoff prompt from `13-orchestrator-kickoff.md`. A fresh conversation keeps the orchestrator's context lean; this planning conversation is already long. |
| S-2 | Gemini access | **Brent** | Install and connect **Claude in Chrome** in the Chrome profile where you're signed in to gemini.google.com with your Gemini Pro account, and allow `gemini.google.com` for the whole site. This uses the subscription you already pay for, so there's no new spending. *There is no Google Gemini image connector in the Claude connector directory today; the "Gemini" listing there is a crypto exchange, so don't connect it. A Gemini API key would also work, but it bills per image, which breaks the no-new-spending rule, so it's not the plan.* ★ Worth a glance: Google's terms for the Gemini app may limit automated use of the consumer app. If they do, the options are the API (paid per image) or running the one-shots yourself; the rest of the runbook doesn't change. |
| S-3 | Chrome downloads | **Brent** | In Chrome settings, set the download location to `~/projects/steampunk-shuffle/art/inbox` (or connect `~/Downloads` as a folder in the orchestrator conversation). Either way, the art agent can find and rename each image. |
| S-4 | GitHub push access | **Brent approves** | The orchestrator asks to attach `brenthumphries/steampunk-shuffle` with push access (`add_repo`). Agents clone over HTTPS, push branches and open PRs through the REST API (GraphQL isn't available to these sessions). |
| S-5 | TestFlight automation | **Brent** (credentials), Claude (workflow) | Brent creates an App Store Connect **API key** (Users and Access → Integrations → Team Keys, App Manager role) and adds repo secrets `ASC_KEY_ID`, `ASC_ISSUER_ID` and `ASC_KEY_P8`, plus signing (the distribution certificate and provisioning profile as base64 secrets, or a fastlane `match` repo). A build agent then writes `.github/workflows/testflight.yml`: a `macos` runner, `npm ci`, `npm run cap:sync`, a fastlane lane that bumps the build number, archives, and calls `upload_to_testflight`, triggered by `workflow_dispatch`. ★ Cost: macOS runner minutes are free on public repos; on a private repo they use included minutes at 10× the Linux rate. **Fallback** if you'd rather not: the release agent drives Xcode's Archive and Upload on your Mac with computer use. That needs the Mac awake and your approval each time. |
| S-6 | Plan into the repo | Claude | A build agent commits `docs/plans/monthly/` (all files), adds it to the bops `plan.also` list, and updates the repo CLAUDE.md bops block: commits arrive as PRs from Claude agents, the orchestrator merges, release runs through CI, `dispatch: orchestrator`. One PR, merged by the orchestrator. |
| S-7 | Linear | Claude | One issue per month step (label `Claude`, estimate from the prompt header, due date from §8), one per art batch, Brent issues for the letters (§9) and any setup step still open. It checks the closed list first. |
| S-8 | Wake schedule | Claude | Schedules the next wake (§8) with `send_later` into this conversation, and always keeps exactly one future wake booked. |
| S-9 | Dry run | Claude | The art agent makes November image 1 end to end (Gemini, QA, saved to the inbox) and stops. The release agent runs the TestFlight workflow once on current `main`. The orchestrator reports both to Brent before starting November for real. |
| S-10 | Standing approvals | **Brent** | Approve once, in the orchestrator conversation: the connected folders, Chrome on gemini.google.com, the GitHub repo, and computer use if you choose the S-5 fallback. Wakes that arrive while you're away can only do what's already approved; anything new waits for you and shows up as a question. |
| S-11 | Routing note | Claude, with Brent's OK | From the `~/projects` root, add a line to `hq/routing.md`: steampunk-shuffle is an orchestrated project, run by one Opus conversation dispatching Sonnet and Haiku subagents. That makes `/daily` and `/dispatch` leave it alone. |
| S-12 | Google Play account · **deferred** (Android is a later target; Brent has no Android phone yet) | **Brent** | Create a personal Google Play developer account (US$25 one-time fee, ID verification), verify device access with the Play Console app on an Android phone, create the app record, and enable Play App Signing. |
| S-13 | Play secrets · **deferred** with S-12 | **Brent** (credentials), Claude (wiring) | A service account with release-manager rights; add `PLAY_SERVICE_ACCOUNT_JSON` and the upload keystore secrets (`ANDROID_UPLOAD_KEYSTORE_B64`, `ANDROID_UPLOAD_KEYSTORE_PASSWORD`, `ANDROID_UPLOAD_KEY_ALIAS`, `ANDROID_UPLOAD_KEY_PASSWORD`). A build agent can generate the upload keystore in CI and give Brent the file to store safely, if he prefers. |
| S-14 | Release 1.1 decisions | done | Settled Oct 31 (`14-saves-and-android.md` §4): TestFlight only, no automatic sync, Android deferred, 4 ledgers. |

## 5. The monthly cycle

`T` is the 1st of the content month. The target dates in §8 put the build three to four weeks ahead.

1. **Open (T−30 or so).** Read the month file, refresh the month's Linear issues, update the ledger, and ask Brent any ★ question the month raises (one message, all at once).
2. **Art and features in parallel.** Start the art agent on the month's Gemini one-shot. It can take several days because of Gemini's daily limits; it resumes with "start at image N". At the same time, start the build agent on the month's first feature prompt. Feature prompts in a month run in order; prompts in different months can overlap only when the earlier month is already merged.
3. **Verify, then merge.** Every PR gets a verify agent. Merge only when CI is green, the verify agent passes, and the PR touches only what its prompt allows. Merging to `main` deploys to Pages; that's safe early, because every month's content is gated by date.
4. **Content.** When the month's features are merged and the art agent has finished at least the images the content needs (portraits and signature cards at minimum), start the content agent. It stages images from the Mac inbox into its clone and ingests them. Late images are ingested later by a small content-agent follow-up (S size).
5. **Playtest.** After the content merges, the playtest agent plays the deployed preview with `?now=…&preview=1` on every date in the month file's test list, at 402×874. It files findings in PLAYTEST.md (ss-playtest format) through a PR. **A P1 blocks the ship** and goes to a fix agent; P2 and P3 go to Linear for later.
6. **Ship.** At the ship gate (§6), the release agent confirms Pages is current, runs the TestFlight workflow, and confirms the build has processed. Sara's TestFlight app picks it up (automatic updates are on by default in TestFlight; the orchestrator mentions it if they're not).
7. **Go-live check (wake on T).** On the 1st, the playtest agent opens the live game **without** the dev clock and confirms the month's banner, gifts and visitors are really there. It does the same on the tournament or mode start date.
8. **Close (wake after the window ends).** Update the ledger, close Linear issues, delete scratch clones, append a one-paragraph month summary to `docs/logs/` (by PR) and to the ledger, and post Brent a three-line report in the conversation.

## 6. Gates

- **Merge gate:** `npm run typecheck && npm test` green in the agent's clone; CI green on the PR (all four browsers); the verify agent passes; the scope matches the prompt. Nothing is pushed straight to `main`; the orchestrator merges PRs through the REST API.
- **Ship gate:** the month's content merged; no open P1 in PLAYTEST.md; the playtest agent's date checks pass; balance numbers inside the month file's bands (or a ★ question raised with Brent). Ship by the target date in §8 even if some art is still missing: missing images fall back gracefully, and a follow-up build carries them.
- **Letters gate:** none. Letters ship as hidden `TODO(Brent)` placeholders, so they never block a release (§9).
- **Stop rule:** if a step fails twice at Sonnet, or anything would change Brent's accounts, money, or the shipped game outside the plan, the orchestrator stops that step, writes it up in the ledger, and asks Brent.

## 7. The art pipeline (Gemini, through Claude in Chrome)

**Procedure for one month** (the art agent):
1. Open a new tab at gemini.google.com and start a **fresh chat** with image generation available.
2. Attach the reference files listed in the month's Gemini section, from `~/projects/steampunk-shuffle/`. If Chrome's file upload can't reach a file, use Claude in Chrome's file upload with the path; if that fails, stop and report.
3. Paste the one-shot prompt exactly as written. For each image Gemini returns:
   - **Download** it, find the newest file in the download folder, and rename it to `art/inbox/<asset id>.png` on the Mac with `device_bash` (`mv -n`, never overwrite; if the name exists, the old file is the earlier attempt: rename it to `<asset id>.v1.png` first).
   - **QA it**: stage it to the cloud, look at it with Read, and check it against the image's own description and the house negatives. Check the subject, the aspect ratio, **no lettering, numbers or watermark text**, no extra limbs, the palette (one dominant colour), and, for card art, the same face and costume as the portrait before it. Also check the IP rules: no real-person likeness beyond the named historical figures, the Gentleman never face-on, no film or show look.
   - Pass: type **next**. Fail: type **redo: <the specific fix>**, up to **2 redos**. A third failure gets the best version kept, with a note in the ledger's art checklist; the orchestrator decides whether to try again in a fresh chat or accept it.
4. **Gemini's visible mark:** if images carry Gemini's corner sparkle (the Oct 22 intro film did), note it. `tools/ingest-art.py` centre-crops to each card window, which may remove it; the content agent confirms after ingest and reports any that survive.
5. **Daily limits:** when Gemini refuses or caps out, stop and record "next: image N" in the ledger. The orchestrator books a wake for tomorrow; the next run attaches the same references plus any portraits already made (for character consistency) and types **start at image N**.
6. Never sign out, change account settings, or use Gemini for anything but the month's list.

**Ordering:** portraits and signature-card art first (the content agent needs them), then event cards, then the Coven, Almanack, Tarot, sleeve and taproom images.

## 8. The year's schedule (wakes and targets)

Every row is a `send_later` wake into this conversation (Central time, 9:00 unless noted). The orchestrator books the next one each time it finishes a wake. If a wake finds nothing to do, it books the next and posts nothing.

| Wake | Purpose |
|---|---|
| **Setup:** as soon as Brent pastes the kickoff | S-4 to S-9; November starts immediately after the dry run |
| **Nov 1 → Nov 12** daily | November build (compressed: art, N-A, N-B, N-C, N-D, playtest, ship by **Nov 12**) |
| Nov 13 · Nov 20 · Nov 22 | Go-live checks: visitors and the Booth; the Stakes; the Sagittarius gift |
| **Nov 16** | December opens: art plus D-A; ship target **Nov 27** |
| Dec 1 · Dec 18 · Dec 25 | Go-live checks (cabinet, tournament, Christmas door) |
| **Nov 28** | Release 1.1 work starts in the gaps (`14-saves-and-android.md` §5): X-B1, then X-A1 |
| **Dec 5** | January opens; ship target **Dec 21** |
| **Dec 9 – 12** | Release 1.1 upgrade-path playtest (X-T part 1) |
| **Dec 21** | **Release 1.1 ships** with January's content: TestFlight and Pages |
| **Jan 2** | Ask Brent whether he wants to write the Valentine letter (his deadline: Feb 10 for a Feb 14 letter) |
| **Jan 9** | February opens; ship target **Jan 25** |
| **Feb 6** | March opens; ship target **Feb 24** |
| **Mar 8** | April opens; ship target **Mar 25** |
| **Apr 8** | May opens; ship target **Apr 25** |
| **May 8** | June opens; ship target **May 25** |
| **Jun 8** | July opens; ship target **Jun 24** |
| **Jul 8** | August opens; ship target **Jul 25** |
| **Aug 1** | Ask Brent about the September letter (his deadline: Sep 18 for Sep 22) |
| **Aug 8** | September opens; ship target **Aug 25** |
| The 1st of each month · each tournament or mode start | Go-live checks |
| The day after each window ends | Close-out (§5.8) |
| **Every Monday** | Weekly status line to Brent; prune stale scratch; check that TestFlight's newest build is under 90 days old |
| **Oct 1, 2027** | Year close: confirm Hallowe'en is live again; Night School, the Gauntlet and the window box are permanent; the Bonfire Night card is armed for Nov 5, 2027; write the year summary; ask Brent about 2028 (the March expansion) |

## 9. Letters from B. (Brent's only content task)

- **Claude never writes, drafts, suggests or edits letter text, and never picks a date.** The orchestrator only reminds and commits.
- Brent writes a letter in either way: (a) in the orchestrator conversation, starting with `LETTER:` followed by the date, title and text; or (b) as a Project doc under `letters/` that only he writes.
- The orchestrator sends that text, **verbatim**, to a content agent (Haiku). The agent puts it into `src/letters/letters.ts` exactly as given (escaping only what TypeScript needs), runs `LETTERS_STRICT=1 npm test`, and opens a PR. The orchestrator diffs the committed text against Brent's message character for character before merging, then ships it with the next build (or a quick release if the letter's date is close).
- Reminders: Jan 2 (Valentine's) and Aug 1 (September), plus any date Brent adds. If he doesn't write one, nothing shows. That's the design.

## 10. Talking to the orchestrator

Brent can type any of these in the conversation at any time:

| Say | It does |
|---|---|
| `status` | A short table: this month and next, each step's state, ship date, open ★ questions |
| `show art <month>` | An inline gallery of that month's finished images, with the art agent's notes |
| `redo art <asset id>: <note>` | Queues a fresh Gemini attempt for that image with the note |
| `pause` / `resume` | Stops dispatching new agents (running ones finish) / starts again |
| `ship now` | Runs the ship gate early and releases if it passes |
| `skip <step>` | Marks a step won't-do in the ledger and Linear (Canceled), with his reason |
| `LETTER: …` | §9 |
| anything else | Treated as product-owner direction: it's recorded in the ledger as a decision and applied to the plan files |

## 11. Subagent wrapper

The orchestrator wraps every month-file prompt in this, so the prompts themselves stay as written. In a month prompt, **"me" means the orchestrator.**

```
You are a <Build | Content | Verify | Playtest | Fix | Release> agent for Steampunk Shuffle, working for an orchestrator in a Cowork session. Task id: <task-id>.

W1 Workspace: mkdir -p /home/claude/ss && cd /home/claude/ss && git clone https://github.com/brenthumphries/steampunk-shuffle.git <task-id> && cd <task-id> && npm ci. Never work in the Mac checkout (it's only the art drop folder). Playwright: use the container's preinstalled Chromium (never run "playwright install"); if the repo's Playwright version can't find a browser, run unit tests locally, rely on CI for e2e, and say so in your report.
W2 Branch: git checkout -b claude/<eventId>-<step-id>. Base it on the branch the orchestrator names, otherwise main.
W3 Finish: commit with a clear message ending in the attribution lines the orchestrator gives you, push the branch, and open a PR into main with the REST API (gh api repos/brenthumphries/steampunk-shuffle/pulls -f title=… -f head=… -f base=main -f body=…). Never merge, never push to main, never force-push.
W4 Art (content agents): stage the images your manifest lists from the Mac folder ~/projects/steampunk-shuffle/art/inbox/ with device_stage_files, copy them into your clone's art/inbox/, then run the ingest command in your prompt. List any manifest rows with no image.
W5 Report (your final message): PR URL; what changed (files, in a few lines); test results (typecheck, unit count, any e2e); balance numbers if asked; anything you flagged or couldn't do; questions for Brent marked ★. Keep it under 300 words. The orchestrator reads only this.
W6 Rules: follow the repo CLAUDE.md and its Gotchas. Stay inside your prompt's scope. If the prompt and the code disagree, stop and report rather than guessing.

TASK:
<the month-file prompt, verbatim>
```

## 12. When things go wrong

| Problem | What the orchestrator does |
|---|---|
| A subagent fails its exit check twice | Reruns it one tier up (Haiku → Sonnet). Fails again at Sonnet: stops that step and asks Brent (§6 stop rule). |
| CI red after a merge | A fix agent at once; no further merges until green. |
| Gemini refuses a prompt, or a policy block | Rewords only that image's description (never the IP rules) and retries once in a fresh chat. Still blocked: records it, ships with the fallback art, and tells Brent. |
| Chrome or the Mac is offline | Art and the computer-use fallback wait; code work continues in the cloud. It books a wake for a few hours later and mentions it in the weekly status. |
| A month slips past its ship target | Ships what's merged (date gates make partial content safe), moves the rest to a follow-up build, and records it. It never moves a window's dates to make up time. |
| TestFlight upload fails | Retries once. Still failing: falls back to computer use (if Brent approved it) or tells Brent. The Pages build is always current regardless. |
| Brent says something is settled | It's settled: closed in Linear and the ledger, and never resurfaced (Brent's standing rule). |
