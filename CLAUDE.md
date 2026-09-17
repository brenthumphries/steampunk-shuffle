# Steampunk Shuffle — Root Claude Instructions

## Project overview

Steampunk Shuffle is a steampunk deck-building card game — a Gwent-style
points game (rules base: Nokturna/Moonlight Peaks) dressed in Magic: The
Gathering's rarity and keyword vocabulary, set in *The Wheatstone Bridge*, a
public house in 1871 London. It is a birthday gift, due **October 30, 2026**.

Full context lives in [`steampunk-shuffle-plan.md`](steampunk-shuffle-plan.md)
(model assignments, timeline, risks) and [`docs/design.md`](docs/design.md)
(rules, cards, opponents, progression). Read both before starting new work;
this file is the fast-reference summary, not a replacement for either.

This file is the master Claude context for the entire project. Scoped
CLAUDE.md files in subdirectories extend — never contradict — these root
instructions.

---

## Claude's role on this project

Claude is the implementer; Brent is the product owner. He defines direction,
approves design decisions (★ items in the plan), and playtests on his phone.
Claude writes the code, authors card content, builds the tooling/skills
in §5 of the plan, and keeps `CLAUDE.md` current so the next session — often
on a cheaper model — doesn't have to re-derive context.

**Model discipline** (plan §2): start every step on the model the plan
assigns. Escalate one tier only after failing a step's exit check twice.
Nothing starts on Fable. Prefer a deterministic script over a generative
step whenever the task can be scripted.

---

## Current state

Read the last three entries in `docs/logs/` first; that is the handoff. Every
plan step from 0.1 through the 2026-09-15 playtest bug-fix pass is recorded
there, one entry per session (`2026-09-10.md` to `2026-09-15.md`, migrated
out of this file on 2026-09-16 to keep it small).

As of 2026-09-16: Phases 0-3 done; Phase 4 batches 4.0a-4.0e done with the
4.0a correction that closed PT-32; cross-browser CI matrix in `deploy.yml`;
the 12-note Wheatstone Bridge bug-fix pass landed (`4838d9b`), followed by
the full-art zoom fix (`b263dc7`). 386 unit tests at last count.

---

## Gotchas

Standing knowledge that outlives any one step. Where a bullet says "above",
the entry it means is now in `docs/logs/`.

- **Changing the draw mechanic to a 4-card opening hand + draw 1 per turn
  (no round-start batch draw) pulled the Starter-vs-Regular-tier win rate
  (design.md §12.2, target ~60%) under target for two of the four
  opponents — Mudd and Hollis specifically, not the whole tier. Fixed by
  re-pointing their decks; closed, not just flagged.** `docs/balance.md`'s
  own table runs `regular` AI on both sides, which `tools/sim.ts` itself
  calls "a fumbling newcomer" proxy, not design.md §12.2's actual wording
  ("beat Regulars about 60% of the time when played sensibly") —
  `tools/curve.ts` measures that directly, piloting the starter on the
  `seasoned` dial. Run at a large sample (`npm run curve -- regular
  seasoned 200`), the real picture was narrower than the regular/regular
  table suggested: Nell 63% and Farrow 59% were already fine; only Mudd
  (47%) and Hollis (43%) were genuinely under target. Every card in both
  decks was already at the 2-copy legal max except each deck's own
  deck-local cards, so the fix only ever touched `src/cards/data/decks/
  mudd.ts` and `prudenceHollis.ts` — never a shared canonical card, which
  would have repriced it everywhere including the player's own deck
  builder. Mudd: Sergeant Pike trimmed 2 copies → 1 (-4 pts, halves his
  Persist-carryover density), backfilled with a new deck-local filler,
  Desk Sergeant (1 pt, common, no art yet). Hollis: The Vicar's Wife
  trimmed 2 copies → 1 (-6 pts; her Friend+1 keyword was compounding with
  Reading Room's own continuous buff to every Salon Character on the
  board), backfilled with a second copy of Reading Room itself — inert
  padding, since only one Location is ever active at once (§5.6), so it
  adds zero points and zero synergy. First pass landed at 60%/58%
  (n=60); re-run at n=200 for confidence, all four Regular-tier opponents
  now sit at 58–63%, tightly centered on target, Nell and Farrow
  unchanged throughout (confirms the deck-local-only edits never touched
  them). `docs/balance.md`'s own regular/regular table moved the same
  direction: Mudd 38%→59%, Hollis 25%→47% (still below its own weaker-
  proxy baseline for the other two, as expected — Nell 46%, Farrow 49%,
  both unchanged). AI-vs-random win rates also rose from the draw-
  mechanic change itself (regular 68%→76%, seasoned 87%→93% — more draws
  gives the AI more chances to find a good line), while same-difficulty
  AI mirrors compressed toward a coin flip (legend-vs-legend 33%→17% —
  more draws narrows the edge that deeper search buys over itself); and
  the Legend-vs-starter band (design.md §9.3, target ~70%) held up fine
  on its own at a 40-game sample, 92.5–97.5%, comfortably over target —
  neither was touched by this fix.
- **`tests/unit/engine/property.test.ts`'s 10,000-random-games test failed
  on GitHub's shared CI runner during the 2.5 ship despite already having
  an explicit 30s timeout (vs. ~9s locally)** — same class of flakiness as
  `18412d8`'s bracket-simulation fix, just on a test that already had
  *some* headroom and still weren't enough that run. Bumped to 60s
  (commit `8c9c270`); unrelated to 2.5's own changes (this test lives in
  the engine, not the pub/acquisition code 2.5 touched) — it just happened
  to surface on that ship. If this test times out again even at 60s,
  don't keep doubling blindly — consider whether the runner is
  meaningfully slower now (the same CI run's annotations noted GitHub
  forcing Node 20 actions onto Node 24 runners) or whether the test
  itself has grown more expensive as more content/engine paths were added
  (same shape as the `npm run sim` runtime-growth gotcha below).
- **Sir Charles ("house" tier) pays no win/loss Checks and has no reward
  card of his own — design.md §11.1's earning table names exactly
  "Regular / Seasoned / Legend," with no "house" row, and he already gave
  the starter deck as the tutorial's reward.** A pickup game against him
  still pays the daily first-game-of-day bonus like any pickup game, and
  his wins don't add to `PubState.totalWins` (the counter that gates
  Bucket/Seasoned/Legends unlocking) — reasoned from the tutorial win
  against him not counting toward "0 wins: Newcomer" either, so his
  ongoing pickup wins shouldn't move that counter differently. Both are
  judgment calls, not locked spec, in the same vein as 1.6/1.7's flagged
  ones — worth confirming with Brent, especially before 2.6's real save
  system encodes this shape more permanently.
- **A draw pays nothing at all, including the daily bonus, and touches no
  win/loss record** — design.md §6.3 says a pickup-game draw "pays no
  reward and counts as neither win nor loss"; `recordPickupResult` treats
  it as a full no-op (returns the same `PubState` object, not a copy) for
  exactly that reason, rather than special-casing which parts of the
  payout to skip.
- **On a first win, the reward card is paid *in addition to* the normal
  win Checks, not instead of them** — design.md §11.1 lists "win vs
  tier" and "first win vs each opponent" as separate table rows (the
  second prefixed "+", like the daily-bonus row), read as additive. Worth
  double-checking with Brent if the numbers ever feel too generous once
  real playtesting starts.
- **"Legends in town" (design.md §12.3) uses three fixed pairs — (Holmes,
  Moriarty), (Christie, Poirot), (Jekyll/Hyde, Shelley) — cycling by the
  player's local calendar day**, which gives every legend exactly one day
  in three (stronger than design's "at least every third day," and easy
  to pin in a test). Which legends share a day was never specified
  anywhere — a judgment call, same vein as 1.6's "which 10 portraits."
- **There's still no card-ownership/collection system gating the deck
  builder** (2.2's flagged gotcha) — 2.3 introduces the first real piece
  of one (`PubState.collection`, reward-card ids earned beyond the base
  60), but `deckBuilderScreen.ts`'s grid is still every one of the 60 v1
  cards, unrestricted. Whoever does 2.5's acquisition paths (Lost &
  Found/Pawnbroker/Tinker's Bench/Bar Bet also feed the same collection)
  is the natural point to decide whether the builder grid finally gets
  restricted to owned copies. **Resolved, plan step 4.0d** —
  `src/decks/ownership.ts` + the deck builder's owned-gating; see that
  entry.
- Christie, Poirot, Dr Jekyll/Mr Hyde, Mary Shelley, and Sir Charles have
  no portrait art yet (only 10 of the cast were in prompt sheet 1, per
  1.6's judgment call) — `pubHubScreen.ts` renders a plain gradient circle
  placeholder for a patron with no `portraitArtId`, same optional-art
  handling `matchScreen.ts` already had for the AI side-portrait.
- **There's no card-ownership/collection system yet, so 2.2's deck-
  builder grid is every one of the 60 v1 cards, unrestricted** — design.md
  never says the builder should filter to "owned" cards, and the actual
  acquisition paths (2.3's pickup-game rewards, 2.5's Lost & Found/
  Pawnbroker/Tinker's Bench/Bar Bet) don't exist yet to have anything to
  filter by. This is a judgment call, not a locked spec, in the same vein
  as 1.6/1.7's flagged judgment calls: once 2.3/2.5 introduce a real
  collection, whoever does that work needs to decide whether the deck
  builder grid gets restricted to owned copies (likely) and, if so,
  reconcile it against decks already saved here with cards the player
  doesn't "own" yet. **Resolved, plan step 4.0d** (a saved deck's own
  entries aren't retroactively re-validated against ownership, though —
  see that entry's own flagged follow-up).
- **The 13 slots start genuinely empty, not pre-seeded with the starter
  deck** — design.md's §7.2 doesn't say either way. "Start from the
  Village Constable" (a utility button in the editor, not in the plan's
  own wording) exists so reaching a legal deck doesn't require memorizing
  design.md §8.3's decklist by hand, and doubles as the fixture the e2e
  smoke test uses to reach a legal state without scripting 20 individual
  taps.
- **Deck-slot persistence is its own localStorage key
  (`steampunk-shuffle:deck-slots`), not part of a larger save file** — 2.6
  owns the real autosave system (design.md §395: collection, Checks, win/
  loss, unlock flags, etc., as one exportable blob). Whoever builds 2.6
  should fold this key's data into that blob (or migrate it) rather than
  leaving two separate persistence mechanisms; `loadDeckSlotsState`/
  `saveDeckSlotsState` in `src/decks/deckStorage.ts` are the only two
  functions that would need to change.
- **Copy limits (2 per card, 1 per legendary) and the 20-card cap are
  enforced at add-time by silently refusing** (the + button disables) —
  **but the 60-point cap is not**, so a deck can legitimately sit at 20/20
  cards and, say, 63/60 points, reported as illegal with `validateDeck`'s
  own reason text. This asymmetry is deliberate: there's never a legal
  reason to have a 3rd copy of a card, so refusing it costs nothing, but
  points are a running total across many different cards — refusing an
  add because it *would* tip the deck over budget would block perfectly
  reasonable edits (add an expensive card now, cut a cheap one to
  compensate later) for no benefit, and would have to guess at the
  player's next move to do it. If this ever feels wrong in play, the
  building block for a stricter version is already the same
  `computeLegality` the meter reads.
- **`previewOnPlayTargets`'s "does this need a human choice" rule treats
  a `highestPoints`/`lowestPoints` filter as always automatic, even when
  it's the human's own card being played** — the card text already says
  "the highest-point card," so there's nothing to choose, and matching
  the engine's own `defaultSelect` tiebreak (rather than opening it up as
  a free pick) keeps the human and the AI resolving those cards
  identically. No v1 card currently gives a human-played card more than
  one step that actually needs a real choice (checked by grepping every
  `effect: "flip"/"unflip"/"return"/"buff"` in `src/cards/data/`,
  documented in `src/match/humanTurn.ts`'s `currentStep` comment) — if a
  future card does, `toggleTarget`'s "amend the last completed step"
  fallback is there but untested against a real multi-choice card.
- **The dev-mode service worker (`devOptions: { enabled: true }` in
  `vite.config.ts`, from Phase 0) reloads the page once, out of the blue,
  the first time it takes control of a tab** — hit this mid-match during
  manual browser verification (looked exactly like a bug: the screen
  silently reset to the taproom placeholder). It's a generic Workbox/
  vite-plugin-pwa dev behavior, not anything 2.1 introduced or can fix;
  future manual testing sessions should expect one unprompted reload
  early in a tab's life and not chase it as a regression.
- The match screen's `setTimeout` handle is typed via the bare ambient
  `setTimeout` (`ReturnType<typeof setTimeout>`), not `window.setTimeout`
  — with both the `"dom"` lib and `@types/node` in `tsconfig.json`'s
  `types`, only the bare global's return type resolves without a TS2322
  error. It's still the real browser timer at runtime; see the comment at
  `mountMatchScreen`'s `timer` declaration.
- Opponent hand is shown as a card-back count (`Hand: N`), not a visual
  fanned stack — a deliberate v1 simplification, not an oversight; revisit
  if it reads as too plain once real art is wired in (3.1/3.2).
- **The 2x-retina pixel dimensions (`BASE_SIZE_BY_RATIO` in `tools/
  ingest-art.py`) are a judgment call, not a locked spec — same situation
  1.6 flagged for "which 10 portraits."** No card-window CSS size exists
  anywhere yet (Phase 3.1's SVG frame, which will actually mount these
  illustrations, isn't built). Chose 600×800 for 3:4 card art, 640×640 for
  1:1 portraits/icons, and 804×1430 for 9:16 backgrounds (that last one's
  1x base, 402px, matches the Playwright iPhone-17 viewport width so a
  background fills the phone screen edge to edge). Cheap to change later —
  it's a resize step re-run on the same source files, not a re-generation.
- **`ASPECT_BY_CATEGORY` is duplicated by hand between `tools/ingest-art.py`
  and `tools/artPrompts.ts`'s `ASPECT_BY_CATEGORY`** — a Python script can't
  import the TS module. If style-bible.md §4's framing table ever changes,
  both need editing; `ingest-art.py` throws immediately on an unrecognized
  category rather than silently mis-cropping, which is the main guard
  against the two drifting unnoticed.
- **No automated test for `ingest-art.py`** — this repo's "every new module
  gets a Vitest unit test" convention is TS/Vitest-specific, and this is
  the first Python file in the project (no pytest or other Python test
  runner set up, and `deploy.yml` doesn't gate on Python at all). Rather
  than stand up Python test infra for one script, verified it by actually
  running it (synthetic images through the real code path, output
  inspected with Pillow, preview page screenshotted over a local HTTP
  server) — same "run the tool for real" verification `ship.sh` and
  `sim.ts` already rely on. Worth reconsidering if more Python tooling
  gets added later.
- `public/art/` (processed WebP + `manifest.json`) is genuinely deployed —
  it's under Vite's `public/`, copied verbatim to the Pages build. Note for
  whoever does 3.6 (asset budget <15 MB, service-worker precache):
  `vite.config.ts`'s workbox `globPatterns` doesn't include `webp` yet, so
  none of this is precached for offline until that's added — deliberately
  left alone here since 3.6 owns the offline/perf pass, not 1.7.
- **This step ran on Sonnet, not the Haiku the plan assigns to 1.6** —
  the session was already on Sonnet when asked to start 1.6 rather than
  being opened fresh on Haiku, and there's no way for a running session to
  downgrade its own model mid-conversation. Flagged, not corrected; the
  skill itself is still written to run on Haiku for every future
  invocation, so this doesn't compound. If a future session opens
  specifically to build a plan step, open it on the model the plan lists
  first, per `CLAUDE.md`'s model-discipline rule.
- **`npm run sim`'s runtime grew past 1.4's original "<2 min" exit check
  once 1.5 added 6 Legend-tier decks** — a first pass at the full
  16-deck report (all 4 Regular decks + all 6 Legend decks, at the
  original game counts) took 212s. `legend` AI's 3-turn lookahead over 32
  hidden-hand samples (design.md §9.4) is by far the most expensive path;
  the Legend-vs-starter games were trimmed from 15 to 8 per legend
  (matching the `vsRandom` legend row's existing precedent), bringing the
  full run to 130.9s — still a hair over 2 minutes, accepted rather than
  trimmed further. If it creeps up again as more content is added, trim
  game counts before reaching for a bigger model to run it on — this is
  meant to stay a Haiku one-liner.
- **`docs/balance.md`'s first real numbers show wide, worth-a-look
  variance, not a red flag yet — this is simulated AI-vs-AI play, not a
  human "played sensibly," so treat it as a first signal, not a verdict.**
  Starter-vs-Regular (design.md §12.2, target ~60%) ranges from 40%
  (Mudd, Hollis) to 100% (Nell Ashby) — Nell's deck likely needs more
  bite once real playtesting starts. Legend-vs-starter (§9.3, target
  ~70%) ranges from 50% (Dr Jekyll / Mr Hyde) to 100% (Mary Shelley); the
  Jekyll/Hyde number is likely depressed because design.md §9.3's
  "Jekyll rounds play `seasoned`, Hyde rounds play `legend`" per-round AI
  dial override (flagged back in 1.3's gotchas as "a card/opponent-data
  decision for whichever step actually authors Jekyll/Hyde") still isn't
  wired up anywhere — `tools/sim.ts`'s head-to-head runner uses one fixed
  difficulty for the whole match. That wiring belongs with whatever step
  actually drives opponent AI turns in a real match (Phase 2, likely
  2.3), not the balance simulator.
- **1.5 surfaced real gaps between design.md's card text and the shipped
  1.1/1.2 engine — flagged for Brent, not a blocker, but worth a look next
  time the engine gets touched.** Full list with the specific cards
  affected is in `src/cards/data/README.md`'s "Known engine-schema gaps"
  section. Short version: `TargetFilter` can't check for a keyword (so
  "each face-up Friend card" cards are approximated, inconsistently
  loosely, as "each face-up card" or "each face-up Character"); `draw` has
  no `target`/`side` (so "each player draws N" headlines only draw for
  whoever played them); a Location has no controller, so it can't say
  "each player, their own side" distinctly from "a pool combined across
  both boards" (Moriarty's and Christie's signature Locations were both
  reworded to fit); there's no cross-effect target chaining (Mary
  Shelley's card dropped its "+2" clause); continuous buffs have no
  self-exclusion (The Landlady buffs herself by +1 too); and there's no
  "grant a keyword temporarily" or "conditional" effect at all (blocks two
  of design.md §15's easter eggs entirely). None of this fails
  `validateCard` (purely structural), which is why it wasn't caught until
  content-authoring actually tried to use the printed rules text.
- `src/cards/data/decks/*.ts` each add one plain "filler" Character (Line
  Fitter, Beat Partner, Street Sweeper, Errand Runner, Church Fete Stall)
  to reach a legal 20-card deck — a family's 9 unique v1 cards cap out at
  18 copies (2 each), two short. These fillers are deck-local and not part
  of the labeled 60-card set (`src/cards/data/README.md`).
- **1.3's exit check doesn't hold at face value — flagged for Brent, not a
  blocker.** The plan says legend should beat random play >95% of the time;
  measured on the starter deck mirrored against itself, even a version of
  this AI that cheats (reads the opponent's *true* hand, no sampling) and
  searches deeper than any real dial uses tops out around 85-90%, not 95%+.
  This specific matchup (best-of-three, identical 20-card deck on both
  sides) has enough draw-order and leader-coin-toss variance that search
  depth stops helping past a point. `aiOpponent.test.ts`'s win-rate test is
  calibrated to what's actually achievable (legend ≥85%, regular 50-85%,
  strict `regular < seasoned < legend` ordering) rather than the plan's
  literal number — the file header explains why. Worth another look once 1.5
  lands real opponent decks (design.md's actual matchups, not a mirror).
- `chooseAIMove`/`playAITurn` take the opponent's decklist as a parameter
  precisely so the AI can't peek at `state.players[opponent].hand` — the
  engine's `MatchState` holds it in full (design.md §6.5 says hidden info is
  a UI/AI concern, not engine state), so this boundary is convention, not
  type-enforced. Don't add a code path that reads the true opponent hand for
  AI decisions even where it'd be convenient (e.g. a "cheat mode" debug
  flag) without being deliberate about it — it defeats the sampling this
  module exists to do.
- The AI's "holds Flips" / "concedes a lost round" behavior dials (§9.4's
  last two rows) are implemented as small score *nudges* on top of the
  search result, not hard overrides. An earlier version overrode the score
  outright and it made `legend` measurably worse than `regular` against
  random play — the override heuristics (`roundIsUnwinnable`,
  `cardPotentialValue`) can't see synergy the real search already found
  (e.g. an unplayed Friend card still boosting one already on the board), so
  they were discarding better moves. If tuning these further, nudge; don't
  override.
- Design.md flags "Jekyll's per-round dial override" (Jekyll rounds play
  `seasoned`, Hyde rounds play `legend`) as 1.3's job. `chooseAIMove` takes
  `difficulty` per call rather than owning any persistent state, so a future
  caller can already pick a different difficulty string per round with no
  change here — nothing content-specific needed to be added in 1.3 itself.
  That per-opponent wiring is a card/opponent-data decision for whichever
  step actually authors Jekyll/Hyde (1.5 or later).
- The engine assumes decks are already legal (deck-builder's job later, or
  `validateDeck` for tests/tools) — it never calls `validateDeck` itself, to
  keep the two modules decoupled.
- `createMatch`'s `{ shuffle: false }` option deals a deck in its given
  array order instead of shuffling — this is the mechanism 2.7's tutorial
  forced hands are meant to use (design.md §16: "a deck-order override, not
  special cards"), not a special "forced hand" feature of its own.
- A targeted effect (flip/unflip/return/buff) never targets its own source
  card, even if the filter would otherwise match it (see Mr Hyde: "Flip one
  of your own *other* cards"). This exclusion isn't written down anywhere in
  the schema — it's a matchEngine.ts convention (`sourceInstanceId`), so a
  future effect kind that genuinely wants to target itself would need an
  explicit escape hatch.
- Continuous buffs (Locations, e.g.) are recomputed live on every
  `effectivePoints()` call rather than baked into a card when it enters
  play, so a buff disappears the instant its source leaves — but that means
  a continuous ability's own filter is matched against *pre-buff* points,
  not full effective points (documented in `matchesFilter`'s call site),
  to avoid a circular dependency. No v1 card's continuous ability filters
  by points, so this hasn't mattered yet — revisit if 1.5 ever authors one
  that does.
- The ability DSL (`Effect` in `src/cards/cardTypes.ts`) is structural only
  — it validates shape (trigger/effect kinds, target sides, filters), not
  game semantics. 1.2 owns actually resolving these effects. `steal` is
  accepted by the schema but reserved/unresolved in v1 (Robin Hood is a
  stretch legend, design.md §9.3).
- `Card.rarity` lives on the card, not per-face, but `points`/`family`/
  `keywords`/`abilities` are per-face — needed for Dr Jekyll/Mr Hyde, whose
  two faces have different families and only the front face's points count
  toward deck legality (design.md §5.10, §16).
- The site is served at `https://brenthumphries.github.io/steampunk-shuffle/`
  — a subpath, not a domain root. `vite.config.ts` sets `base` accordingly;
  any new hard-coded asset path needs the same treatment (prefer relative
  paths or `%BASE_URL%`/`import.meta.env.BASE_URL`, never a bare `/`).
- **`deploy.yml` gates on cross-browser e2e too, as of the browser-
  compatibility pass below** — `npm run typecheck`/`npm test` in the
  `build` job, plus a parallel `e2e` job matrixed across
  `playwright.config.ts`'s four projects (Safari/Chrome/Firefox/Edge).
  `deploy` needs both. This reverses the earlier "e2e is local-only to
  keep the pipeline fast" call — the game now has enough surface area
  (and enough browsers to actually differ on) that the tradeoff flipped.
- `npm run build` runs `tsc --noEmit` before `vite build`; a type error fails
  the build even though Vite itself would happily transpile past it.
- Lighthouse 13 dropped the standalone `pwa` category (real installability
  scoring now needs a separate plugin). `tools/ship.sh` reports
  performance/best-practices/accessibility/seo as an informational read
  only — no threshold gates a ship. Real PWA/perf budgets are plan step 3.6;
  don't add a hard gate to `ss-ship` without checking with Brent first.
- `ss-ship` never pushes on its own initiative — it's invoked, not
  autonomous. It also never force-pushes and refuses to commit if a staged
  file name looks like a secret (`.env`, `.pem`, `credentials`, `secrets.*`).

---

## Repo structure

```
steampunk-shuffle/
├── .github/workflows/   # CI: typecheck, test, build, deploy to Pages
├── docs/                # design.md, style-bible.md
├── art/
│   ├── reference/        # style-bible reference images (batch 0)
│   ├── prompts/          # ss-art-prompts manifests + generated CSV prompt sheets (Step 1.6)
│   └── inbox/            # final card art drops here for tools/ingest-art.py (Step 1.7)
├── public/              # PWA icons, static files served as-is
├── src/                 # App source (TypeScript)
│   └── cards/data/       # Canonical v1 card set + decks (plan step 1.5)
├── .claude/skills/       # ss-ship, ss-card-author, ss-art-prompts, ...
├── tests/
│   ├── unit/            # Vitest
│   └── e2e/             # Playwright
├── tools/               # Scripts (sim.ts, artPrompts.ts, ingest-art.py — added as later steps need them)
├── steampunk-shuffle-plan.md   # The build plan: phases, model assignments, exit checks
└── README.md
```

---

## Technology stack

| Layer            | Tool / Language              |
|------------------|-------------------------------|
| Language         | TypeScript                    |
| Build            | Vite                          |
| PWA              | vite-plugin-pwa (Workbox)     |
| Unit tests       | Vitest (jsdom environment)    |
| E2e tests        | Playwright (iPhone 17 viewport) |
| Native wrapper   | Capacitor (iOS), added in Phase 4 |
| Hosting          | GitHub Pages (Actions-built)  |
| Delivery (gift)  | TestFlight, added in Phase 4  |

---

## Coding conventions

- **Strict TypeScript.** `strict` and `noUncheckedIndexedAccess` are on in
  `tsconfig.json`. Don't relax them to make a type error disappear.
- **No DOM in the rules engine.** Phase 1's rules engine and AI opponent are
  pure TypeScript with no `document`/`window` access, so they stay testable
  headless and portable if the UI layer ever changes.
- **Comments**: default to none. Add one only for a non-obvious constraint
  (an iOS quirk, a rules edge case from `docs/design.md`, a workaround).
- **Tests**: every new module gets a Vitest unit test; every new screen gets
  at least one Playwright smoke test at the 402×874 iPhone 17 viewport.
- **No magic numbers** for game balance — deck limits, point caps, etc. come
  from `docs/design.md` and should be named constants, not inlined literals.

---

## iOS web app conventions (plan §7 — don't relearn these)

- Audio needs a user gesture on iOS; never assume autoplay works.
- Use `env(safe-area-inset-*)` for anything near a screen edge; `100dvh` over
  `100vh`. `src/style.css` already does this for the app shell.
- `navigator.vibrate` doesn't exist on iOS; haptics come from the Capacitor
  `Haptics` plugin once the native wrap exists (Phase 4), not the Web
  Vibration API.
- Disable double-tap-to-zoom and rubber-band scroll (`overscroll-behavior`,
  `user-select: none`) — already set globally in `src/style.css`.

---

## Naming conventions

| Thing              | Convention              | Example                     |
|--------------------|--------------------------|------------------------------|
| Source files       | camelCase.ts             | ruleEngine.ts                |
| Components/classes | PascalCase               | class MatchScreen            |
| Test files          | mirrors source, `.test.ts` / `.spec.ts` | ruleEngine.test.ts (unit), smoke.spec.ts (e2e) |
| Card/data files     | kebab-case.json          | opponent-decks.json          |
| Docs                | kebab-case.md            | style-bible.md               |
| Git branches        | type/short-description   | feat/rules-engine            |
| Git commits         | Conventional Commits     | feat: add scoring resolver   |

---

## Git workflow

- **Main branch**: `main` should always build and pass tests — CI enforces
  typecheck + Vitest + build on every push and PR.
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`,
  `test:`).
- **Deploys**: automatic on push to `main` via `.github/workflows/deploy.yml`.
  No manual Pages step. `ss-ship` (Step 0.5) wraps the local side of this
  (typecheck, test, build, commit, push) into one command.

---

## What to do when uncertain

- **Ambiguous requirement**: check `docs/design.md` first — most game
  questions are answered there. If still unclear, stop and ask Brent rather
  than guessing at rules or content.
- **A design decision, not an implementation one**: don't decide it — flag it
  for one of the ★ sessions in the plan (currently 0.2 done, 3.7 pending).
- **Something seems off from the plan**: say so and suggest an alternative;
  Brent makes the call, especially anything that touches the Oct 30 date.

---

## brent-ops

Process conventions read by the brent-ops plugin (`/next`, `/route`, `/daily`,
`/log`, `/verify`, `/weekly`). Reviews are off: this repo takes commits only
from Brent, straight to `main`, so there is no review cycle, no `week.json`,
and no dispatch. The running log is `docs/logs/`, one entry per session.

```yaml
brent-ops:
  project: steampunk-shuffle
  logs:
    dir: docs/logs
    file: YYYY-MM-DD.md
    template: docs/logs/README.md#Template
    sections: [What I worked on, What got done, Decisions made, Open questions / blockers, Next session, Related]
  reviews:
    mode: "off"
  plan:
    file: steampunk-shuffle-plan.md
    ids: "<phase>.<step>[letter] from the plan (1.3, 4.0b); playtest items PT-n in PLAYTEST.md"
    sizes: none
    also: [PLAYTEST.md, wheatstone-bridge-bugfix-plan.md]
  commit:
    tool: ss-ship (tools/ship.sh); Brent runs it
    branch: main
    git_over_mount: never
  dispatch: none
  routing:
    rubric: steampunk-shuffle-plan.md#2. Model ladder
  verify:
    tests: "npm run typecheck && npm test; Playwright e2e runs in CI"
```
