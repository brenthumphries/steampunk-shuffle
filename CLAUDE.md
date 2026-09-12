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

## Current state (updated after finishing Step 2.4, Sept 11, 2026)

- Phase 0 (Foundations): 0.1–0.5 all done.
- Repo is public, Pages enabled (`build_type: workflow`, deploys from `main`).
- `docs/design.md` and `docs/style-bible.md` are approved. Three style-bible
  reference images are in `art/reference/` (kept separate from
  `art/inbox/`, which is where final card art lands for `ingest-art.py`,
  built in Step 1.7).
- App is an empty PWA shell: one placeholder screen, no game logic yet.
- `.claude/skills/ss-ship/` (Haiku) + `tools/ship.sh` (the deterministic
  part) exist and are verified working: typecheck, test, build,
  non-blocking Lighthouse read, commit, push, wait for `deploy.yml`, print
  the live URL. Say "ship it" / "run ss-ship" to invoke it. First real run
  (commit `422383b`) went green end-to-end in ~30s.
- Phase 1 (Engine): 1.1 done. Card schema lives in `src/cards/cardTypes.ts`
  (`Card`, `CardFace`, `Keywords`, `Ability`/`Effect` DSL, `Deck`), with
  `validateCard` (`src/cards/cardValidator.ts`) and `validateDeck`
  (`src/cards/deckValidator.ts`) doing structural + legality checks.
  Tests in `tests/unit/cards/` use the real §8.3 starter deck (20 cards, 37
  points) as the golden legal fixture, plus Dr Jekyll/Mr Hyde (two-faced
  Transform) and Sherlock Holmes/Robin Hood (reveal, reserved steal) for
  ability-DSL coverage. 45 tests, all passing.
- 1.2 done. Rules engine lives in `src/engine/` (`matchTypes.ts` for runtime
  state, `matchEngine.ts` for logic, `rng.ts` for a pure seeded PRNG). Pure
  TypeScript, no DOM, immutable-from-the-caller's-view (`playTurn()` clones
  via `structuredClone` and returns a new `MatchState`). Public surface:
  `createMatch`, `playTurn`, `currentPlayer`, `effectivePoints`,
  `boardScore`. Covers every `Rules text:` block in design.md §5-§6: On
  Play/Persist/Friend/Elusive/Location/Flip/Un-flip/Return/Draw
  N/Transform/Reveal(no-op)/steal(no-op), round scoring, leader alternation,
  and all four match-end branches (two-rounds / more-rounds-after-three /
  total-score-after-three / draw-after-three). `startOfRound`/`endOfRound`
  triggered abilities resolve generically too (needed for Mr Hyde's own
  end-of-round Flip) even though 1.1's schema comment only mentioned onPlay/
  continuous. Tests in `tests/unit/engine/`: 24 targeted tests (one full
  design.md §13.2 tutorial-round-1 replay against real starter/house cards,
  the rest keyword-by-keyword) plus a 10,000-random-game property test
  (~9s) asserting no throw, scores never negative, ≤3 rounds, no board card
  ever face-down once a round's cleanup has run. 70 tests total, all passing.
- 1.3 done. AI opponent lives in `src/ai/aiOpponent.ts`: a heuristic
  evaluator (`roundsWon` diff dominates, then board-score diff, then a small
  hand-potential term) plus a real minimax search (backward induction, not a
  forward playout) over turns sampled from a plausible opponent hand
  (design.md §6.5 — built from the opponent's public decklist minus what's
  visible, never the engine's true hidden hand/deck). `DIFFICULTY_DIALS`
  (`regular`/`seasoned`/`legend`) match design.md §9.4's table verbatim
  (lookahead 1/2/3 turns, hidden-hand samples 1/8/32, evaluator noise,
  "holds Flips"/"concedes a lost round" as score nudges, not overrides — see
  gotcha below). Public surface: `chooseAIMove` (returns a move plus the next
  AI-decision RNG seed — a separate stream from `state.rngSeed`) and
  `playAITurn` (chooses and applies in one call). Tests in
  `tests/unit/ai/aiOpponent.test.ts`: dial-table equality, move
  legality/determinism, a 15-game self-play sweep across difficulty pairings
  for broad ability coverage, and the win-rate exit check. 76 tests total
  (project-wide), all passing.
- 1.4 done. Balance simulator lives in `tools/sim.ts`, run via `npm run sim`
  (added `tsx` + `@types/node` as devDependencies; `tools/` is now in
  `tsconfig.json`'s `include` so it's typechecked too). AI-vs-AI self-play,
  reporting: per-card effective-vs-printed lift (design.md §7.4, flags avg
  effective > printed + 3), family average points vs design.md §4's curves,
  win rate vs random by AI difficulty (regression check on 1.3), and an
  AI-difficulty mirror win rate. Writes `docs/balance.md` and prints the same
  report to stdout; first real run: no card-lift outliers, family averages
  close to target where sampled, in ~40s (well under the 2-minute exit
  check). Pure helpers (`computeFamilyCurves`, `computeCardLift`) have a unit
  test in `tests/unit/tools/sim.test.ts`; the game-playing/report path is
  exercised by actually running the tool, same as `ship.sh`. 88 tests total
  (project-wide), all passing.

1.5 done. `.claude/skills/ss-card-author/` (Haiku) is built: authors a
card/batch/deck against `src/cards/cardTypes.ts`'s schema and adds it to
the content module. **The v1 card set is fully authored**: `src/cards/
data/` is the new canonical source for every real card — 5 family files
(9 cards each), `locations.ts` (8), `legends.ts` (6 signature cards),
`landlady.ts` (1); `src/cards/data/README.md` tracks the composition
tally. `index.ts` exports `ALL_CARDS` (60, matches design.md §8.1 exactly:
45 family + 8 location + 6 legend + 1 Landlady). The previously-locked
starter/house-deck card definitions moved here from the test fixtures,
which now re-export them (`tests/unit/cards/fixtures/starterDeck.ts`,
`tests/unit/engine/fixtures/houseDeck.ts`, `tests/unit/cards/fixtures/
legends.ts`) rather than duplicating — this resolves the `tools/` →
`tests/` backwards-dependency gotcha from 1.4.

**All 16 decks are authored** (`src/cards/data/decks/`, tracked in its own
README): the starter deck, the completed House deck, all four
Regular-tier opponents (Mudd, Nell Ashby, Reg Farrow, Prudence Hollis —
design.md §9.1), all four Seasoned (Bucket, Lovelace, Adler, Dickens —
§9.2, each carrying their reward card as a deck-local extra beyond the
labeled 60), and all six Legends (Holmes, Moriarty, Christie, Poirot,
Jekyll/Hyde, Shelley — §9.3, each running their own signature legendary
card at 1 copy plus, where design.md names one, their unique Location —
Moriarty's Reichenbach Falls, Christie's Overnight Express). Mary
Shelley's deck also picks up two of design.md §15's easter-egg extras
(Abby Normal, Eye-gor); the third, Put the Candle Back, needs an effect
kind the engine doesn't have and isn't authored (see the schema-gap
gotcha). `tools/sim.ts` reads `KNOWN_CARDS`/`KNOWN_DECKS` from `src/cards/
data/` directly and now reports **both** design.md §12.2's real
starter-vs-Regular win rate **and** §9.3's Legend-vs-starter win rate
(replacing the old interim AI-mirror-only proxy); a new `tests/unit/cards/
dataSet.test.ts` validates every card and all 16 decks. 162 tests total
(project-wide), all passing; `npm run sim`, `npm run typecheck`, and
`npm run build` all clean.

**Still open, not blocking:** design.md §15's "The Five D's" (Rookery) and
"We're Not Worthy" (Salon) easter eggs aren't authored — both need effect
kinds the engine doesn't have (see the schema-gap gotcha below).

1.6 done. `.claude/skills/ss-art-prompts/` (Haiku) is built: reads
`docs/style-bible.md` for palette/framing/negative-prompt rules and a card/
asset list, writes a paste-ready CSV prompt sheet, and can build a single
re-roll prompt with a specific fix folded in. Deterministic part lives in
`tools/artPrompts.ts` (palette-by-family and aspect-by-category lookups
straight from the style bible, negative-prompt assembly, order-sensitive
reference-image resolution per style-bible.md §7's consistency technique,
and daily-cap chunking at `GEMINI_DAILY_CAP` = 100, plan §1); the skill only
supplies the creative scene description per asset, same split as
`ss-card-author`'s flavour text. Unit tests in
`tests/unit/tools/artPrompts.test.ts` cover the pure helpers (negative-
prompt assembly, reference-chain resolution across an ordered sheet, CSV
escaping, chunking); 176 tests total (project-wide), all passing.
`npm run art-prompts -- <manifest.json> <sheetNumber>` runs it.

**Prompt sheet 1 is generated**: `art/prompts/sheet-1-manifest.json` (the
authored input) → `art/prompts/prompt-sheet-1.csv` (15 rows, one paste per
row into Gemini): the 4 Regular-tier opponent portraits (Mudd, Ashby,
Farrow, Hollis), the 4 Seasoned-tier (Bucket, Lovelace, Adler, Dickens),
the first 2 Legends in design.md §9.3's table order (Holmes, Moriarty),
the card back, 3 pub backgrounds (the snug, the back parlour, the cellar —
the taproom itself was already generated in batch 0), and the app icon.
Rows are ordered so each family's first portrait becomes that family's
in-sheet reference for later rows of the same family (Mudd → Bucket;
Farrow → Adler, Moriarty; Ashby → Bucket, Adler, Holmes; Hollis →
Dickens), verified by reading the generated CSV, not just by the unit
tests. Portrait art ids use a `portrait-` prefix (e.g.
`portrait-sherlock-holmes`) to avoid colliding with the card-art ids
`sherlock-holmes`/`professor-moriarty` already claimed in
`src/cards/data/legends.ts` for those legends' signature-card
illustrations — same asset-id namespace, two different images.
**Which 10 portraits** wasn't specified anywhere in the design docs, only
"10 portraits" in the plan table — the selection above (all 4 Regulars +
all 4 Seasoned + the first 2 Legends by table order) follows design.md
§12.1's unlock order (Regulars and Seasoned are what a newcomer sees
before any Legend) as the most defensible reading, but it's a judgment
call, not a locked spec. Worth confirming with Brent before spending the
Gemini generations, or revising if he'd rather prioritize differently.

1.7 done. `tools/ingest-art.py` is built (Python + Pillow, the only
non-npm tool in the project — the plan calls for Python here specifically
because Pillow's WebP path is more solid than a dependency-free Node
option). Drop a Gemini download into `art/inbox/<assetId>.<png|jpg|jpeg|
webp>` (assetId matching a row in one of `art/prompts/sheet-<N>-manifest.
json` — the same manifest that generated the prompt sheet, so category/
aspect can't drift between prompting and ingesting), then
`npm run ingest-art -- art/prompts/sheet-1-manifest.json`. It center-crops
to the asset's category aspect (docs/style-bible.md §4, read from the
manifest row, not re-guessed), resizes to a 2x retina target, and writes
WebP to `public/art/<assetId>.webp` plus a merged `public/art/
manifest.json` (assetId → category/family/dimensions/source/ingestedAt,
accumulated across every batch ever run, not overwritten per-run). It also
regenerates `art/ingest-preview.html` — deliberately in `art/`, not
`public/`, so this debug grid of every ingested asset never ships to the
live Pages site. First run needs `pip3 install -r tools/requirements.txt`
(Pillow; not otherwise part of this repo's toolchain). Verified end-to-end
with synthetic placeholder images run through the real `npm run ingest-art`
path and the preview page confirmed rendering correctly over a local HTTP
server (see gotcha below on why not a real Playwright/Vitest test) — output
crop math checked in both directions (source wider and taller than target)
plus the RGBA-flatten path for a PNG with an alpha channel.

**Since then, batch 1 is complete — all 15 of sheet 1's assets are
actually ingested** (not just tool-tested), all in `public/art/` as real
WebP: the 10 portraits (`portrait-constable-tobias-mudd`,
`portrait-old-nell-ashby`, `portrait-dodgy-reg-farrow`,
`portrait-miss-prudence-hollis`, `portrait-ada-lovelace`,
`portrait-inspector-bucket`, `portrait-irene-adler`,
`portrait-charles-dickens`, `portrait-sherlock-holmes`,
`portrait-professor-moriarty`), the 3 backgrounds (`background-the-snug`,
`background-the-back-parlour`, `background-the-cellar`), `card-back`, and
`app-icon`. Each was spot-checked by opening the file directly (not just
the preview grid, whose `loading="lazy"` images don't all render in a
headless/automated browser — a false alarm the first time, not a real
bug).

Sourcing, for whoever needs to repeat this pattern on a later sheet: the
first 7 (3 rerolls of Mudd, 2 of Nell Ashby, 4 of Reg Farrow, 2 of an
unplaceable man later confirmed by Brent as Holmes, 1 each of the three
backgrounds) came from Brent's `art/manual Gemini generations/` folder —
14 untracked downloads with generic `Gemini_Generated_Image_*.jpeg` names,
not assetIds, matched by eye against sheet 1's prompt descriptions, most
recent reroll of each moved+renamed into `art/inbox/`. The remaining
rerolls sat untouched in `art/manual Gemini generations/` for a while
during this session, then disappeared — Brent's own cleanup outside this
conversation, not this session's doing; the folder is now empty. Everything
else (Hollis, Lovelace, Bucket, Adler, Dickens, Moriarty, card-back ×2,
app-icon) came as fresh Gemini generations Brent pasted straight into
chat — the actual file lands in `~/Downloads/Gemini_Generated_Image_*.jpeg`
when that happens; `find ~/Downloads -newer <any-recent-repo-file>` is how
each one was located, repeated once per asset. `ingest-art.py` itself was
verified beforehand against synthetic placeholder images in a scratch
directory (crop math both directions, RGBA-flatten path), before the
first real run.

`ss-art-prompts` also grew a plain-text sibling to its CSV output this
session — `rowsToText`/`prompt-sheet-<N>.txt` (`tools/artPrompts.ts`), one
self-contained copy/paste block per asset with references,
prompt+negative+aspect, and notes each clearly separated. Brent asked for
it to make manual pasting into Gemini easier; it's now written
automatically alongside every sheet's CSV, and sheet 1's regenerated copy
already reflects it.

**Two quality issues flagged for Brent, not fixed here — his call, not
mine:**
- **`card-back` has a full ornate scrollwork border baked into the
  illustration**, but the manifest's own note for this asset says the SVG
  frame (a later Phase-3.1 step) supplies the border and this art should
  be self-contained/frame-shape-free. As ingested, laying 3.1's SVG frame
  over this would double the border. A re-roll (already ingested over the
  first attempt) improved the gearwork detail but kept the same baked-in
  border — the underlying prompt likely needs the "no border/no
  ornamental frame" negative pushed harder, not just another generation.
  Either fix the prompt and re-roll again, or decide the card back keeps
  its own border and 3.1 skips wrapping this particular asset.
- **`portrait-professor-moriarty`'s chalkboard came out with legible-ish
  equations** despite the manifest's "no legible mathematics" negative
  prompt — purely cosmetic, ingested as-is, flagged in case a re-roll is
  wanted later.

2.1 done. The match screen lives in `src/ui/matchScreen.ts`
(`mountMatchScreen(root, opts)`, DOM glue only — full rebuild on every
state change, small trees so this is cheap) driving the real engine
(`createMatch`/`playTurn`) and AI opponent (`playAITurn`) directly, no
mock data. Turn-staging logic is pulled out into `src/match/humanTurn.ts`
(`stagePlay`/`toggleTarget`/`isReadyToConfirm`, pure, unit-tested without
jsdom) so design.md §6.4's "take a card back before it commits" is real:
tapping a hand card stages it (nothing is sent to the engine yet); a
"Play"/"Cancel" bar appears; Cancel just discards the staged pick.
Engine-facing pieces added alongside it: `previewOnPlayTargets` and
`defaultSelect` are now exported from `matchEngine.ts` (previously
private) so the UI can ask "what would this card's On Play need a target
for, and what are the legal candidates" *before* calling `playTurn`
(`playTurn` resolves On Play synchronously and atomically, so the target
has to be known going in) — `src/match/targetChooser.ts` turns the
player's picks into the `TargetChooser` callback `playTurn` expects,
falling back to `defaultSelect` for any step the UI didn't prompt on. The
AI's turn is driven the same way `ss-ship`/`sim.ts` treat everything
else — real calls, not stubs — via `playAITurn` on a short `setTimeout`
for pacing; a forced pass (empty hand, design.md §6.2.2 — "no voluntary
pass") is likewise automatic. `src/ui/cardText.ts` generates rules text
(keyword chips, "On Play: Flip an opposing card worth 3 or less.") from
the `Ability`/`Effect` DSL for the card-zoom modal, since cards carry
structural abilities, not authored prose. Round-end and match-end are
overlays (`.overlay--round-reveal`, `.overlay--match-over`) that pause on
a "Continue" tap before the (already-computed) next round renders
underneath. Card frames are flat CSS keyed off `data-family` (family
colors from style-bible.md §2) with no illustration — 3.1 hasn't been
built, so there's nothing to hang art on yet; `card-back.webp` and
`background-the-snug.webp` (from 1.7's ingested batch) are the only art
actually used. There's no pub hub yet (2.3), so `src/main.ts`'s taproom
placeholder grew one temporary "Play a quick match" button that starts a
real starter-deck-vs-Mudd match at `regular` difficulty directly — 2.3
replaces this with the real "tonight's patrons" flow, at which point this
button (and the deck/opponent choice being hardcoded here) goes away.
Tests: `tests/unit/engine/targetPreview.test.ts`,
`tests/unit/match/{humanTurn,targetChooser}.test.ts`,
`tests/unit/ui/cardText.test.ts` (14 new pure-logic tests) plus
`tests/e2e/match.spec.ts` (3 Playwright smoke tests at the 402×874
viewport: stage-then-cancel leaves the hand untouched, stage-then-play
commits and the match keeps moving, card zoom opens and closes). 194
tests total (project-wide), all passing; `npm run typecheck`, `npm run
build`, and `npm run test:e2e` all clean. Manually verified end-to-end in
the browser at the iPhone 17 viewport, playing real (non-scripted, random-
shuffled) turns against Mudd through a full round: staging/cancel,
auto-confirm for a single-legal-target card (Séance, Inspector's
Warrant), a genuinely-automatic AI-triggered Flip (Scotland Yard Announces
Arrests hit my own board with no prompt, correctly, since it's the AI's
effect, not mine), Persist carrying a card across the round boundary,
playing a Location and watching its continuous buff apply, and the round-
reveal overlay. Added `.claude/launch.json` (Steampunk Shuffle didn't have
one yet) so `preview_start` can run `npm run dev` for browser-based
manual verification in future sessions.

2.2 done. The deck builder lives in `src/ui/deckBuilderScreen.ts`
(`mountDeckBuilderScreen(root, opts)`, same DOM-glue/full-rebuild pattern
as the match screen) over two pure logic modules: `src/decks/deckSlots.ts`
(add/remove a copy respecting design.md §7.2's caps — 2 copies of a
card, 1 of a legendary, 20 cards total — rename, load-another-deck's-
composition, and `computeLegality`, which runs a slot through the same
`validateDeck` the engine and `sim.ts` already use so the builder's "why"
never drifts from deck legality elsewhere) and `src/decks/deckStorage.ts`
(localStorage read/write of the 13 slots plus which one is selected,
defensive against missing/corrupt/wrong-shape data). A slot stores card
ids + quantities, not full `Card` objects, and `slotToDeck` drops any id
that's gone missing rather than throwing. The screen has two views: a
slot list (name, live `cards/points` count, a Legal/Not legal badge, a
Select button disabled unless legal) and a per-slot editor (an editable
name field, the legality meter with `validateDeck`'s actual error
strings when illegal, family/type filter dropdowns, and a two-column
card grid over all 60 v1 cards with +/− controls per card that disable
at the copy cap or at 20 cards). The name `<input>` is mutated in place
on `input` rather than triggering a full rebuild, specifically so typing
doesn't lose cursor position/focus — every other interaction (filters,
+/−, select) does a full rebuild, same "small trees, cheap to redo"
tradeoff 2.1 made. Wired into `src/main.ts`: the taproom shows the
currently-selected deck's name and grew a "Build a deck" button; "Play a
quick match" now plays with whatever legal deck was last selected
(falling back to the starter deck), still against the hardcoded Mudd —
2.3's pub hub still owns real opponent selection. Tests:
`tests/unit/decks/{deckSlots,deckStorage}.test.ts` (17 new pure-logic/
storage tests) plus `tests/e2e/deckBuilder.spec.ts` (4 Playwright smoke
tests at the 402×874 viewport: an empty slot reports why it's illegal
and can't be selected, building/renaming/saving/selecting a legal deck
persists across a reload, family/type filters narrow the grid, +/−
respects the copy cap). 211 unit tests total (project-wide, up from
194), 9 e2e tests total, all passing; `npm run typecheck`, `npm run
build`, and `npm run test:e2e` all clean. Manually verified end-to-end
in the browser at the iPhone 17 viewport: opened the builder, added and
removed copies watching the legality meter update live, used "Start from
the Village Constable" to reach a legal 20/20 · 37/60 deck, renamed it,
confirmed the slot list showed it Legal, selected it, and confirmed the
taproom picked up the new name (including after a reload).

2.3 done. The pub hub lives in `src/ui/pubHubScreen.ts`
(`mountPubHubScreen(root, opts)`, same DOM-glue/full-rebuild pattern as
2.1/2.2) over two pure data/logic modules: `src/pub/opponents.ts` (the
`OPPONENTS` registry — id, tier, deck, AI difficulty, reward card id,
unlock-win threshold, portrait art id, line — for Sir Charles plus all 14
real opponents from design.md §9.1-§9.3, plus `tonightsPatrons`/
`isOpponentInTown`/`legendsInTown` for §11.2/§12.1/§12.3's unlock and
daily-rotation rules) and `src/pub/pubState.ts` (Checks balance,
per-opponent win/loss + reward-claimed record, and the reward-card
collection, with `recordPickupResult` as the one function that turns a
match result into a Checks/reward delta per design.md §11.1-§11.2). It
replaces `main.ts`'s temporary "Play a quick match" button and hardcoded
Mudd opponent entirely — `main.ts` now owns only screen transitions
(pub hub ↔ match ↔ deck builder) and applies `recordPickupResult` +
`savePubState` right after a match, in the `onExit` callback, before
remounting the hub (with a `pendingReveal` prop when a reward was earned).
`matchScreen.ts`'s `onExit` now passes the final `MatchResult` instead of
firing with no arguments, and its `difficulty` option accepts either a
fixed `Difficulty` or `(state: MatchState) => Difficulty` — needed for Dr
Jekyll/Mr Hyde's per-round AI dial override (design.md §9.3: "Jekyll
rounds play seasoned, Hyde rounds play legend"), flagged back in 1.3/1.4's
gotchas as this step's job. `src/pub/opponents.ts` keys that off
`state.round` (round 1 → seasoned, rounds 2+ → legend) since there's no
cheap "which face is up" signal to read from the match screen — a
judgment call, not a locked spec, but it closes that loose end. Its own
localStorage key (`steampunk-shuffle:pub-state`), same reasoning as
2.2's deck-slot storage: 2.6 owns the real unified save (collection with
foil flags, unlock flags, etc., design.md §12.4) and can fold this key in
once it exists. Tests: `tests/unit/pub/{opponents,pubState}.test.ts` (23
new pure-logic tests) plus `tests/e2e/pubHub.spec.ts` (3 Playwright smoke
tests at the 402×874 viewport: fresh-player patron list + 0 Checks,
tapping a patron starts a match against them, Seasoned/Legend opponents
appear once win thresholds are seeded in). 234 unit tests total
(project-wide, up from 211), 12 e2e tests total, all passing; `npm run
typecheck`, `npm run build`, and `npm run test:e2e` all clean. Manually
verified end-to-end in the browser at the iPhone 17 viewport: played a
full pickup match against Mudd to a loss (2 Checks + the 5 daily bonus,
no reward, his record read "0–1") and then a second full match to a win
(8 Checks, no second daily bonus same day, the "unwrap" reveal overlay
showed Sergeant Pike with his flavour text, "Added to your collection,"
and his patron row updated to "1–1 · Reward claimed").

**Found and fixed a pre-existing bug in `matchScreen.ts` (from 2.1), not
scope creep — it directly blocked 2.3's own reward/Checks flow.** When the
round that just ended also completed the match (winning the deciding
round), `afterCommit()` only ever checks for round-vs-match completion
once, before the round-reveal overlay appears; `continueAfterRoundReveal()`
then unconditionally called `scheduleNext()`, which silently no-ops once
`state.status !== "in-progress"` — so tapping "Continue" left a dead board
with no match-over overlay and no "Leave the table" button, ever. Hit this
on the very first manual playtest (won 2-1, round 3 double-counted as
both a round win and the match win). Fixed by re-checking
`state.status === "complete"` inside `continueAfterRoundReveal()` and
routing to the `match-over` phase there too, rather than assuming
`afterCommit()`'s one check covers both moments. Re-verified the full
"win 2-1 on the final round" path afterward and it now reaches "Leave the
table" correctly.

2.4 done. Tournaments live in `src/tournaments/`: `tournaments.ts` (the
`TOURNAMENTS` registry — the 4 named tournaments from design.md §10's
table, each an entry-Checks cost, consolation/prize Checks, a prize-card
descriptor, an `isUnlocked(totalWins, invitationalTriggered)` predicate,
an `eligiblePool(opponents)` filter, and a `checkEntryDeck(deck)` rule —
pauper ≤45 printed points for the Peelers' Cup, ≥12 cards from one family
for the Reichenbach Open, "any legal deck" for the other two), `bracket.ts`
(the 8-seat single-elimination bracket itself), `tournamentState.ts` (its
own localStorage key, same reasoning as `pubState.ts`/`deckStorage.ts` —
persists the active bracket, so a tournament survives a reload, plus the
Birthday Invitational's `invitationalTriggered` flag), and `prizes.ts`
(resolves a won tournament's actual prize card — a random uncommon/rare
for Knockout/Peelers', a random legendary the player doesn't already own
excluding The Landlady for Reichenbach with its "or 300 Checks if you own
them all" fallback, and the fixed Landlady card for the Invitational).
Two new UI screens follow the existing DOM-glue/full-rebuild pattern:
`src/ui/tournamentsScreen.ts` (the tournament list — locked/unlocked,
entry-rule pass/fail with a reason, Enter vs Resume) and
`src/ui/bracketScreen.ts` (a 3-stage ladder — Quarterfinal/Semifinal/Final
— rather than a literal 8-seat tree diagram; see gotcha below). `src/pub/
pubState.ts` grew three pure additions: `recordTournamentMatchResult`
(same shape as `recordPickupResult` but pays no per-match Checks and no
daily bonus — §11.1 lists "Tournament consolation/prize" as its own row,
separate from the pickup win/loss rows — while still updating the
opponent's record, first-win reward, and `totalWins`), `deductChecks`
(entry fee), and `applyTournamentPayout` (consolation/prize Checks + an
optional card). `src/main.ts` wires it all: a "The chalkboard" button on
the pub hub, `enterTournament`/`showBracket`/`startBracketMatch`
orchestrating entry → bracket → match → payout → back to the bracket,
and `syncTournamentTrigger()` re-checking the Oct-30 date against `new
Date()` every time the chalkboard (or the pub hub) is shown, the same
"recompute fresh on every render" idiom `opponents.ts`'s `legendsInTown`
already uses.

**The bracket's non-player half is resolved instantly at creation, not
played out interactively.** An 8-seat single-elimination bracket has the
player at seat 0 playing exactly 3 matches (QF/SF/Final); the other 6
opponents' matches (seats 2v3, 4v5, 6v7, and the AI-only semifinal among
those winners) don't depend on anything the player does, so `createBracket`
resolves all of them up front via the same headless AI-vs-AI self-play
`tools/sim.ts` already uses for balance runs (`simulateAIMatch` in
`bracket.ts`) — draws are broken with a seeded coin-flip
(`breakTournamentDraw`, design.md §6.3's "the sovereign is tossed," since
"tournaments cannot end in a draw"). This means the bracket's entire
opponent lineup (QF/SF/Final) is known and displayable the instant a
tournament is entered — the ladder in `bracketScreen.ts` isn't a "fog of
war" bracket that reveals opponents round by round. `weightedDraw`
(exported from `bracket.ts`) does the Peelers' Cup's "Yard opponents
favoured" seeding: Mudd and Bucket are hardcoded as the two Yard-affiliated
Regular/Seasoned opponents (`YARD_AFFILIATED_IDS` in `tournaments.ts`,
read from `src/cards/data/decks/README.md`'s per-opponent family table,
since `Opponent` itself carries no family field) and get 5x the pick
weight of the other six candidates in that 8-opponent pool.

**Manual playtest caught a real bug in `currentMatchIndex` before it ever
shipped — flagged here so the pattern doesn't get reintroduced.** The
first version found "the next pending match" purely by scanning
`playerMatches` for an `"pending"` outcome, which is wrong once the
bracket is `"eliminated"`: the rounds the player never reached are still
sitting at `"pending"` (never touched), so a player knocked out in the
quarterfinal would see the bracket screen still offering "Play Semifinal."
Fixed by checking `bracket.status !== "in-progress"` first and returning
`-1` immediately in that case — a unit test now pins this
(`tests/unit/tournaments/bracket.test.ts`). Caught by the "no-op once
already decided" test failing during this session, not by an actual bug
report — worth remembering that a `find`-style helper over match slots
needs the terminal `status` checked first, not inferred from slot state.

**The bracket ladder shows 3 rows (Quarterfinal/Semifinal/Final), not a
literal 8-seat tree** — design.md §10 says "brackets are shown as a
chalkboard by the bar," which could mean a full tree of all 8 names. Since
the non-player half is resolved instantly (see above) and never
interactively played, a 3-row ladder covers everything mechanically
relevant (the player's own path) and was the pragmatic scope call for this
step; a full visual tree of all 8 seats is left for a later polish pass
(3.x) if Brent wants the chalkboard flavor to go further.

**Whether a tournament-round win/loss should update `PubState.totalWins`,
the per-opponent record, and first-win rewards was a judgment call, not
spelled out card-by-card in design.md.** §12.1's unlock table says "by
pickup + tournament wins combined," which reads most naturally as *every*
match win counting, not just winning the whole bracket — so
`recordTournamentMatchResult` treats each of the 3 bracket matches exactly
like a pickup win/loss for record-keeping purposes, just with the Checks
math swapped out for §10's entry/consolation/prize numbers instead of
§11.1's per-tier win/loss amounts. Worth confirming with Brent, especially
before 2.6's real save system encodes this shape more permanently — same
vein as 1.6/1.7/2.3's flagged judgment calls.

**The deck used to enter a tournament isn't locked in for the whole
bracket** — `startBracketMatch` reads `selectedDeck` (the app's one
current-deck global, same as pickup games) fresh for each of the 3
matches, so switching decks in the builder mid-tournament would change
what the player plays with round to round. Design.md doesn't say either
way; the deck builder isn't reachable from inside the tournament flow in
this app, so it's a low-probability edge case, not fixed here. If it ever
matters, the fix is snapshotting the entering deck onto `TournamentBracket`
itself rather than reading the global.

**Entry-rule checks (`Tournament.checkEntryDeck`) only run once, at entry
time** — same reasoning as the deck-not-locked-in gotcha above: if a
future ownership/collection system (flagged repeatedly since 2.2) ever
lets an already-entered deck become illegal mid-bracket, nothing re-checks
it before a later round.

**`portrait-professor-moriarty` and similar opponent portraits sometimes
render as blank/placeholder in this session's automated browser
screenshots taken immediately after a DOM rebuild, even though the network
tab shows the image already loaded 200 OK** — confirmed transient (a
second screenshot a moment later shows the portrait correctly) during
manual verification of the bracket ladder. Same "false alarm, not a real
bug" class as 1.7's `loading="lazy"` note in `art/ingest-preview.html` —
don't chase this as a regression if it recurs in a future automated
verification pass.

**The Landlady (`the-landlady`) is still unrestricted in the deck
builder even though design.md §14.3 says she's "earned by winning the
Birthday Invitational" and should show as a reserved silhouette until
then** — this is the same "no card-ownership/collection system gating the
deck builder" gap 2.2/2.3 already flagged, not something 2.4 introduces,
but 2.4 is the first step where it's actually possible to *earn* her, which
makes the gap more visible. `resolvePrize`'s "random legendary" pools
explicitly exclude her id so she's never handed out as anything but the
Invitational's own fixed prize — but nothing stops a player from adding her
to a deck before ever entering that tournament. Whoever builds the real
ownership system (still flagged as 2.5's natural point of entry) should
double check this card specifically.

2.5 done. The four other acquisition paths (design.md §11.3-§11.6) live in
`src/pub/`: `acquirableCards.ts` (a new `ACQUIRABLE_CARDS` pool — `ALL_CARDS`
plus the four Seasoned reward cards, which are real cards but live as
deck-file extras outside the labeled 60 per `src/cards/data/README.md`, so
Lost & Found/Pawnbroker can actually hand them out), `lostAndFound.ts` (one
free card per real-world day, 70/25/5 common/uncommon/rare, weighted away
from cards already at 2+ copies — seeded off `opponents.ts`'s
`localDayIndex`, salted so it doesn't roll in lockstep with the Pawnbroker
or "legends in town"), `pawnbroker.ts` (a 3-card daily-rotating window,
common/uncommon/rare priced at 15/35/90, pawned Bar Bet losses shown first
at their rarity price), `barBet.ts` (stake one card, win a card from the
opponent's new `Opponent.betPool`, lose and it's pawned), and
`tinkersBench.ts` (fuse two copies of a card plus 10 Checks into a foil —
a `"foil:<cardId>"`-prefixed collection entry, since `collection` is a
flat `string[]` — or a random card one rarity up; rares can only foil,
legendaries can't fuse at all). `PubState` (`src/pub/pubState.ts`) grew
`lastLostAndFoundDate`, `pawnedCards`, `pawnbrokerPurchasedToday`/
`pawnbrokerPurchaseDate`, and a set of small collection/pawned-list
helpers (`addCopyToCollection`, `removeOneFromCollection`,
`countInCollection`, etc.) that the new modules share instead of each
hand-rolling array splicing. Every real opponent (not Sir Charles) got a
`betPool: readonly string[]` — 3-4 cards, mostly uncommon, one rare for
Seasoned/Legends, authored from their own family/deck where one exists,
falling back to a family-buffing neutral Location (`the-gasworks`,
`the-bow-street-office`, etc.) where a family has no in-family rare in the
labeled 60 (Foundry has none). UI: a new `src/ui/acquisitionScreen.ts`
("The Back Room," reachable from a new pub-hub button) hosts Lost & Found,
the Pawnbroker, and the Tinker's Bench — same self-contained
read/write-PubState-directly pattern as `deckBuilderScreen.ts`. Bar Bet
instead lives inside `src/ui/pubHubScreen.ts` itself, since it needs an
opponent in play: tapping an eligible patron (unlocked, non-house, has a
bet pool, player has something stakeable) now shows a "stake a card?"
overlay before `onStartMatch` fires; `PendingReveal` was generalized from
"the opponent's first-win reward" to `{ title, cardId }` so the same
unwrap overlay can show a Bar Bet win too, and `main.ts`'s `startMatch`
now threads a `stakedCardId` through to `resolveBarBet` in the match's
`onExit`, queuing up to two reveals (a first win and a bet win can both
land on the same match). Tests: `tests/unit/pub/{lostAndFound,pawnbroker,
barBet,tinkersBench}.test.ts` (new) plus additions to `pubState.test.ts`
and `opponents.test.ts` (the latter checks every bet pool references real
non-legendary cards and that Seasoned/Legend pools carry exactly one
rare) — 79 new unit tests, 313 total (project-wide), all passing;
`tests/e2e/backRoom.spec.ts` (new, 4 Playwright smoke tests) plus a
5th test added to `pubHub.spec.ts` for the Bar Bet stake prompt — 21 e2e
tests total, all passing. `npm run typecheck` and `npm run build` both
clean.

**Manual playtest caught two real bugs, both fixed here, not scope
creep — one directly broke the new "back room" button, the other was a
Checks-economy hole in the new Pawnbroker.**
- Adding a third button ("The back room") to the pub hub's deck-row
  button group overflowed the row off the right edge of the 402px iPhone
  viewport with no scroll affordance — the row and its button container
  had no `flex-wrap`, so three buttons plus the deck-name label never fit.
  Added `flex-wrap: wrap` to both `.pub-hub-deck-row` and
  `.pub-hub-deck-row-buttons` in `src/style.css`; verified in the browser
  at 402×874 that all three buttons now wrap onto their own line legibly.
- The Pawnbroker's random daily-rotation slots had no purchase tracking:
  buying a rotation card only deducted Checks and added it to the
  collection, so the exact same 35-Check uncommon could be bought again
  immediately, and again, for as many Checks as the player had — an
  unlimited Checks-to-cards faucet. Caught by manually buying from the
  window twice in a row in the browser. Fixed by adding
  `pawnbrokerPurchasedToday`/`pawnbrokerPurchaseDate` to `PubState`:
  `buyFromPawnbroker` now records the purchased id for today, and
  `pawnbrokerWindow` skips already-bought ids when filling the random
  rotation — the window still always shows 3 cards (a different one
  backfills from further down the same day's PRNG stream), but that exact
  card can't be bought twice until tomorrow. Pawned-card purchases were
  never affected (buying one already removes it from `pawnedCards`, so it
  was never repeatable). A unit test in `pawnbroker.test.ts` pins this.

**Whether Bar Bet can stake a base-60 card, or only a `collection` extra,
was a judgment call — flagged in-file (`src/pub/barBet.ts`'s header
comment), not resolved.** Design.md §11.5 says "stake one card from your
collection... not one that would make any saved deck illegal," which only
makes sense if ownership is tracked per-card including the base 60 — but
that ownership-gating system is the same one 2.2/2.3/2.4 have all flagged
as still not built (the deck builder's grid is still every one of the 60
v1 cards, unrestricted). Building that system was out of scope for a
Haiku-tier "data + small UI" step, so `stakeableCards` only offers
`collection` extras (reward cards, Lost & Found/Pawnbroker/Bar Bet wins,
Tinker's Bench results) — cards the deck builder can't even reference yet
— which makes the "would make a saved deck illegal" check trivially true
today and a one-line no-op in `resolveBarBet`. Whoever eventually builds
real ownership-gating (still flagged as 2.5/2.6's natural point of entry,
now punted again) should decide whether base-60 cards become stakeable
too at that point.

**`ACQUIRABLE_CARDS`'s Seasoned-reward inclusion surfaced a pre-existing
display bug, fixed in passing.** `pubHubScreen.ts`'s reward-name lookup
(`First win: <name>`) was built from `ALL_CARDS` alone, which never
included the four Seasoned reward cards (`bucketsForefinger`,
`theAnalyticalEngine`, `thePhotograph`, `nextInstalment`) — so Bucket,
Lovelace, Adler, and Dickens's patron rows would have shown the raw card
id instead of its name. Not something 2.3 could have caught without this
step's new `ACQUIRABLE_CARDS_BY_ID` pool existing; swapped
`pubHubScreen.ts`'s lookup map to that pool instead, which fixes the
display for those four opponents at zero extra cost since the pool
already existed for Lost & Found/Pawnbroker.

**Which cards are "acquirable" (eligible for Lost & Found/Pawnbroker) was
a judgment call, in the same vein as 1.6's "which 10 portraits."**
Design.md never lists the pool explicitly. Chose `ALL_CARDS` (the labeled
60) plus the four Seasoned reward cards — real, named cards that would
otherwise only ever be reachable by beating that one opponent — but left
out Mary Shelley's two easter-egg extras (`abbyNormal`, `eyeGor`), since
those are pure flavor filler rather than a named reward and design.md
never calls them acquirable this way. Revisit if that split feels wrong
once real playtesting starts.

**Bet-pool authoring reuses the same rare card across more than one
opponent's pool** (e.g. `the-gasworks` for both Lovelace and Shelley,
`detective-sergeant-vale` for both Holmes and Poirot) — deliberate, not
an oversight. Some families (Foundry) have zero in-family rares among the
labeled 60, so the "one rare for Seasoned/Legends" slot borrows a
family-buffing neutral Location instead; there simply isn't enough rare
variety per family to give every opponent a unique one without reaching
outside their own family/theme, which felt like a worse trade for a
first pass. Flavor authoring, not a promise that no two opponents' bet
pools ever overlap.

**This step ran on Sonnet, not the Haiku the plan assigns to 2.5** — same
situation as 1.6's flagged gotcha: the session was already running on
Sonnet when asked to start 2.5 rather than being opened fresh on Haiku,
and a running session can't downgrade its own model mid-conversation.
Flagged, not corrected; doesn't compound since this is one-off acquisition
logic, not a skill meant to run repeatedly. If a future session opens
specifically to build a plan step, open it on the model the plan lists
first, per this file's model-discipline rule.

2.6 done. Opponent-tier unlocks by wins were already substantially in
place (`totalWins`/`isOpponentInTown`, `Tournament.isUnlocked`, Bar Bet/
Tinker's Bench win gates) — this step's actual new work was the titles
half of design.md §12.1 (`src/pub/progression.ts`'s `titleForWins`, a pure
lookup over the six-row table, shown on the deck-slot screen per the
design doc's own wording via `deckBuilderScreen.ts`'s header, and also on
the pub hub's header for visibility) and the save system (design.md §12.4).

**Mid-match resume is the real substance of this step** —
`src/save/activeMatch.ts` (its own localStorage key,
`steampunk-shuffle:active-match`, same defensive load/save pattern as the
other three stores) persists the engine's `MatchState` plus the AI RNG
seed, the human deck actually being played, and a `MatchContext`
(`{kind:"pickup", opponentId, stakedCardId}` or
`{kind:"tournament", tournamentId}`). `matchScreen.ts` grew two options:
`initialState` (resume into a saved `MatchState`/seed instead of dealing a
fresh one — `phase` is initialized to `match-over` rather than `idle` if
the resumed match had already finished) and `onStateChange`, fired once on
mount and again inside `afterCommit` after every committed turn (human
play, AI turn, or a forced pass) — the single point every state mutation
already funneled through. `src/main.ts`'s `mountMatch` wraps
`mountMatchScreen` to call `saveActiveMatch` on every `onStateChange` and
`clearActiveMatch` right before `onExit`'s result-handling runs; `startMatch`/
`startBracketMatch` were refactored to go through it, and their `onExit`
bodies pulled out into standalone `finishPickupMatch`/`finishTournamentMatch`
functions so `tryResumeActiveMatch` (called at boot, before `showPubHub()`)
can reuse the exact same result-handling for a resumed match. A resumed
tournament match re-derives its opponent and match index fresh from the
tournament's own persisted bracket (`currentMatchIndex`, already existing
from 2.4) rather than trusting a second stored copy, so the two can never
drift apart — if the bracket and the saved match ever disagree (e.g. a
bracket that's since finished by some other path), it just discards the
stale match save and falls through to the pub hub instead of resuming into
something wrong. **Two small, deliberate simplifications**: a staged-but-
unconfirmed card pick (the Play/Cancel bar showing) isn't itself persisted
— only a *committed* turn triggers `onStateChange` — so killing the app
mid-stage loses just that uncommitted pick, not the match; and killing the
app while the round-reveal overlay is up resumes straight into the next
turn rather than replaying that overlay, since the engine state itself has
no notion of "paused for a reveal," only the transient UI `phase` does.

**Export/import (`src/save/saveFile.ts`, `src/ui/saveScreen.ts`,
design.md's "single JSON blob") deliberately did not merge the game's
four localStorage keys into one.** `pubState.ts`/`deckStorage.ts`/
`tournamentState.ts` each already have their own defensive load/save and
their own passing tests, and — found while checking this — several e2e
smoke tests seed state by writing `steampunk-shuffle:pub-state` or
`steampunk-shuffle:tournament-state` directly
(`tests/e2e/pubHub.spec.ts`, `tests/e2e/tournaments.spec.ts`), so an actual
key merge would have broken working, deliberately-chosen test seams for a
mostly-cosmetic win. Instead `buildSaveFile()` gathers all four stores
(the fourth being the new active-match one) into one versioned object for
export, and `applySaveFile()` validates the top-level shape and writes all
four back on import — satisfying "single JSON blob" without touching the
stores' internal storage. `saveScreen.ts` (reachable via a new "Save &
data" button on the pub hub) tries `navigator.share` with a `File` first
and falls through to a plain `<a download>` blob when the Share API (or
file-sharing support in it) isn't there — manually verified in-browser:
this dev environment doesn't support share-with-files, so Export
correctly fell through to a download, named
`steampunk-shuffle-save-<date>.json`.

Manually verified end-to-end in the browser at the iPhone 17 viewport: played
a real turn against Mudd, reloaded mid-match, and it resumed into the exact
same board state — including the AI's reply, which the resume flow correctly
re-scheduled and played out after reload rather than replaying or losing.
Also confirmed the deck-builder header now reads a real title ("Known at the
Bar" at 6 seeded wins) and the pub hub shows "Newcomer" for a fresh player.
Playwright's own mid-tournament-reload smoke test
(`tests/e2e/tournaments.spec.ts`) previously asserted that reloading
mid-match *dropped* the live match back to the pub hub (the pre-2.6 gap this
step exists to close) — updated to assert the opposite (reload resumes
straight into the match) now that it's real, and a new smoke test in
`tests/e2e/match.spec.ts` covers the same resume behavior for a plain pickup
game. 22 e2e tests total (up from 21), all passing. 327 unit tests total
(project-wide, up from 313 — 14 new: `progression.test.ts`,
`save/activeMatch.test.ts`, `save/saveFile.test.ts`), all passing; `npm run
typecheck` and `npm run build` both clean.

**Still open, carried forward — not this step's job:** whether the deck
builder's card grid should be restricted to owned copies now that a real
collection exists (flagged repeatedly since 2.2/2.3/2.4/2.5, not resolved
here — this step touched save/progression, not ownership gating). Design.md
§12.4 also lists "tutorial/hint progress," "settings," and "first-launch
flag" as save contents — none of those are real systems yet (2.7, 3.4, and
3.5 respectively), so they're deliberately not in `SaveFile`'s shape; whichever
of those steps builds the underlying feature should add its own field to
`SaveFile`/`buildSaveFile`/`applySaveFile` rather than this step guessing at
a shape nothing consumes yet.

2.7 done. The tutorial (design.md §13) lives in `src/tutorial/`:
`tutorialScript.ts` (the forced player/house decks — real starter/House
cards, reordered so `createMatch`'s `{shuffle: false}` deals design.md
§13.2's exact hands and draws; the player's deck is trimmed to just the 12
cards the script ever draws rather than a full 20, since `createMatch`
doesn't require a legal deck and the other 8 would only ever sit unseen —
and the 18-turn script itself, the "before the deal"/round-end/match-end
beer-mat text, and the 10-Checks reward amount) and `tutorialState.ts`
(its own localStorage key, same pattern as `pubState.ts`/`deckStorage.ts`:
`completed`, `matchesPlayed`, and which of design.md §13.3's hint chips
have ever been shown — folded into `SaveFile` this step, closing 2.6's
flagged gap). `src/ui/matchScreen.ts` grew an optional `tutorial` mode
(forced turns for *both* sides — the house's scripted plays go through
`playTurn` directly instead of `playAITurn`, and the human's hand is
restricted so only the one scripted card is tappable and tapping it
commits immediately, skipping the normal stage/confirm bar entirely) and
an optional `hints` mode (design.md §13.3's four in-match chips: Location,
Elusive, Return, Headline) — both share a new non-blocking "beer mat"
banner component (`src/ui/beerMat.ts`, fixed-position, tap-to-dismiss,
never a full-screen overlay, since design.md §13.1 requires narration to
never block a legal move). Two small new screens:
`src/ui/tutorialRewardScreen.ts` (the reward reveal — the starter deck
"formally" plus 10 Checks — and Sir Charles's closing beer mat) and
`src/ui/houseRulesScreen.ts` (design.md §13.4's reference page; every
number on it — deck-legality caps, per-tier Checks, the tournament table —
is read live from the same constants/registries the rest of the app
enforces, not retyped, so it can't drift). `src/main.ts` now checks
`tutorialState.completed` before anything else at boot: an incomplete
tutorial always wins over both the pub hub and a resumable active match.
The pub hub grew a "House Rules" button and design.md §13.3's fifth
("hub") hint, shown once a player's 4th match is done. Tests:
`tests/unit/tutorial/{tutorialScript,tutorialState}.test.ts` (10 new —
`tutorialScript.test.ts` replays all 18 forced turns through the real
engine end to end and pins the exact `9-6 / 7-15 / 7-6` score line from
design.md §13.2, extending 1.2's round-1-only replay test to the whole
match) plus additions to `save/saveFile.test.ts`; 336 unit tests total
(project-wide, up from 327), all passing. `tests/e2e/tutorial.spec.ts`
(new, 3 Playwright smoke tests: a fresh player lands in the tutorial, only
the scripted card is tappable once the intro mats are dismissed, playing
it commits and shows the right beer mat) plus **every existing e2e spec
needed a `tutorial-state` seed added to its `localStorage.clear()`
`beforeEach`** (`smoke`, `match`, `pubHub`, `deckBuilder`, `tournaments`,
`backRoom` — a fresh player now lands in the tutorial, not the pub hub,
which is exactly the behavior 2.7 exists to add, but it meant every prior
step's "start from a clean slate" fixture had to be updated to mean
"clean slate, tutorial already done" instead). 25 e2e tests total (up
from 22), all passing; `npm run typecheck` and `npm run build` both
clean. Manually verified end-to-end in the browser at the iPhone 17
viewport: cleared storage, landed in the tutorial against Sir Charles,
dismissed both intro beer mats, watched Sir Charles auto-play Apprentice
Fitter with his own beer mat sliding in, confirmed only Constable on the
Beat was tappable and highlighted with "Play this one: Constable on the
Beat." showing, tapped it, and watched it commit instantly (no
Play/Cancel bar) with the score updating to 3 and his next beer mat
("Three beats two…") appearing — exactly design.md §13.2's script. Also
opened the House Rules page directly and confirmed every section renders
(house rules, six-sentence summary, all 11 keywords, deck-legality line,
all 4 tournaments, Checks table) with real numbers pulled from
`cardTypes.ts`/`pubState.ts`/`tournaments.ts`.

**Design decision, not spelled out in design.md, made here — worth
confirming with Brent:** §13.1 says the player is "prompted... for six of
nine turns and free for three," but §13.2's own script names a specific
card for *all nine* of the player's turns, with no indication of which
three would have been "free," and the beer-mat lines quote exact
cumulative scores that would be wrong if the player played something
else. Rather than guess which three turns don't matter (and invent
narration for whatever a free choice might produce, which design.md
doesn't provide), this implementation forces all nine — "so his narration
lands every time" (§13.1's own stated reason) reads as the load-bearing
requirement, and forcing every turn is the only way to guarantee it
without adding content. Same vein as 1.6/2.4's flagged judgment calls; if
Brent wants three genuinely free turns, the cut points are already
labeled `side`/`cardId` in `src/tutorial/tutorialScript.ts`'s
`TUTORIAL_TURNS` and the fix is deciding which three and what the
alternate mat text should say when the player deviates.

**Two of design.md §13.3's four in-match hint chips are approximate, not
exact, detections — flagged in `matchScreen.ts`'s `afterCommit`, not
fixed here.** "The first Return card leaves the table" is detected as "a
Return-keyword card is sitting in either hand right after a round ends,"
which is really only correct if that card just *arrived* there via
end-of-round cleanup — a Return card drawn normally into hand (never
played) would false-positive the same way. "The first time the player
tries to Flip an Elusive card" is detected as any tap on a face-up,
non-candidate, Elusive card while a Flip step is staged, regardless of
which side it's on or whether it would've matched the effect's other
filters anyway. Both are flavor-only (no gameplay consequence, just which
turn a one-time tip appears on) and were judged not worth the extra
engine-side plumbing a fully precise version would need; the other two
(Location, Headline) are exact, diffed directly off `MatchState` before
and after each commit.

**design.md §13.3's "matches 2-4" window is read as "any of the player's
2nd through 4th matches," not "match 2 specifically gets the Location
hint, match 3 specifically gets Return+Headline."** A single played match
might never trigger a given condition on the exact match design.md
names for it (no Location card might come up in match 2 at all), and
there's no content for "the hint just never lands" — so
`isWithinHintWindow` just keeps every not-yet-shown hint eligible across
all three matches, and whichever condition actually happens first, in
whichever of those matches, is when it fires. Same vein as the "matches
2-4" ambiguity being a judgment call, not a locked spec.

2.8 done. `.claude/skills/ss-playtest/` (Haiku) is built: takes Brent's
raw texted playtest notes (freeform, often several observations run
together in one message) as the skill's `args`, splits them into discrete
items, and appends a triaged backlog to `PLAYTEST.md` at the repo root —
no `tools/` script backing this one, since splitting freeform text and
judging severity is the generative half of plan §2 rule 3's split, not the
scriptable half. Severity uses the same **P1/P2/P3** language plan step
4.5 already names for its "no P1 bugs" TestFlight gate (P1 blocking, P2
bug, P3 balance/polish/idea). Before filing anything new it checks two
things: whether the same issue is already open in `PLAYTEST.md` (if so, it
bumps that entry's "Seen" date/count instead of duplicating it), and
whether it matches a behavior `CLAUDE.md` or `docs/design.md` already
documents as intentional or a known judgment call (if so, it's filed under
a separate "Known / already flagged" section instead of a severity bucket,
so an already-understood behavior doesn't get re-discovered as a new bug).
The skill only ever appends — it never marks anything Resolved, deletes,
or rewords an existing entry; that's left for whoever actually fixes an
item. No unit tests (there's no pure logic to test — this is a Haiku
judgment pass over free text, same class of thing as `ss-card-author`'s
flavour-writing half), so it was verified with two dry runs against
synthetic notes in a scratch `PLAYTEST.md` (real repro-writing,
correctly recognizing a repeat report and bumping its count instead of
duplicating it, correctly guessing code locations for a couple of items
and correctly declining to guess where the note didn't support one,
correctly routing an ambiguous "AI folded despite a lead" note to "ask
Brent" rather than assuming either "bug" or "balance" given design.md
§6.2.2's "no voluntary pass" rule, and correctly recognizing a
round-reveal-overlay input question as already-documented intentional
behavior from this file's own 2.1 notes) — the synthetic file was deleted
afterward rather than committed, since it isn't real playtest data.
`npm run typecheck` and `npm run build` both clean (this step touched no
app code).

**This closes out Phase 2.** Phase 3 (art, animation, sound, gift touches)
starts at 3.1: card frames in SVG/CSS per family and rarity, so cards have
a real frame to hang illustrations in ahead of 3.2's art wiring.

**Note for whoever runs `ss-playtest` for real:** it only exists to
*triage* — filing a P1 there doesn't fix anything by itself. Read the
newly filed items and act on them (or hand them to a session that will)
the same as any other backlog.

3.1 done. The real card frame (design.md §4's family colours, §7.3's
rarity treatments — plain / rivets / engraved / gold-leaf + shimmer)
replaces 2.1's flat single-colour border, entirely in `src/style.css`'s
`.card` rules — no new TS module, since this is CSS/design work with no
pure logic to unit-test (same class as 2.5's back-room CSS fixes). The
family accent colour is still the one flat `--family-*` custom property
2.1 already set per `data-family`; the frame derives a lighter and darker
gradient stop from it at paint time with `color-mix()` rather than
hand-picking new hex pairs per family, so there's only ever one colour
value to maintain per family. The gradient border itself uses the
two-background-layers trick (`linear-gradient(fill) padding-box,
linear-gradient(family colours) border-box` with a transparent
`border-color`) instead of `border-image`, because `border-image` ignores
`border-radius` and would leave the frame's corners square. Rarity adds
on top of that base frame: uncommon gets four corner rivets (a
`::before` of small radial-gradient dots, sized in `em` so they scale
with the `.card--mini`/`.card--zoom` font-size difference 2.1 already
established, no separate size logic needed); rare gets a triple inset
`box-shadow` groove; legendary overrides the gradient to a fixed
gold-leaf colour pair regardless of family (so the Landlady and any
family's signature legend both read as legendary first, family second)
plus an animated foil-shimmer sweep. `.card--highlight`/`--selected`
used to set `box-shadow` directly, which would have clobbered rare's
groove or legendary's glow outright (box-shadow doesn't merge across
rules); both now write into a `--state-shadow` custom property that's
combined with rarity's `--frame-shadow` in one `box-shadow` declaration
on `.card` itself, with `0 0 #0000` as the non-`none` no-op default
(`box-shadow: none` can't sit in a comma list with real shadows).

**Wiring: `data-rarity` was added next to the `data-family` that already
existed at all four places a `.card` element gets built** —
`matchScreen.ts`'s shared `buildCardEl` (hand, board, zoom modal) plus
the three independently hand-rolled "reveal card" builders in
`acquisitionScreen.ts`, `bracketScreen.ts`, and `pubHubScreen.ts` (Lost &
Found/Pawnbroker/Tinker's Bench pulls, tournament prizes, first-win/Bar
Bet reveals). Those three already duplicated `.card` construction from
`matchScreen.ts` before this step; extracting a shared builder was judged
a bigger refactor than a frame step needs and wasn't done here — worth
doing whenever one of them needs a fourth near-identical copy.
**Deliberately left untouched:** `deck-card-tile`
(`deckBuilderScreen.ts`) and `backroom-tile` (`acquisitionScreen.ts`) —
both are flat list/grid rows reporting a card's stats, never styled as a
physical card, so "card frame" per design.md §7.3 doesn't apply to them.

**There's still no illustration window cut into the frame** — with no
real art wired in yet (3.2's job), there's nothing to hang inside one, so
the text content (points/name/ability) keeps rendering straight over the
card's flat fill layer exactly as 2.1 left it. The two-background-layers
technique already isolates that fill from the border gradient, so 3.2 can
swap the fill layer for a `background-image` (or composite an `<img>`
into the content area) without touching any of this step's border/rarity
CSS.

Verified in the browser at a phone-width viewport: played a real hand
against Mudd and confirmed the live family/rarity mix reads correctly
(an uncommon Salon card showing verdigris-green rivets, an Irregulars cat
in gaslight amber, a Yard gadget in gunmetal blue) at both the in-hand
mini size and the zoomed full-card modal. Rare and legendary aren't
reachable in a quick pickup game, so those two (plus a legendary-on-a-
neutral-family case, for the Landlady) were checked by injecting
synthetic `.card` elements with those `data-rarity` values directly into
the live page — confirmed the engraved groove and gold-leaf override
render as designed, and used the Web Animations API
(`element.getAnimations()`) to confirm the foil shimmer runs as a single
`running` animation on `transform` only, not `background-position` —
`background-position` would repaint every frame; `transform` stays
compositor-only, which is what the exit check's 60fps requirement is
actually about. `npm run typecheck`, `npm test` (336 unit tests, all
passing — no new ones needed, see above), `npx playwright test` (25 e2e,
all passing), and `npm run build` all clean.

**The `@media (prefers-reduced-motion: no-preference)` guard on the foil
shimmer is technically 3.3's territory** (design.md's animation step is
where "reduced-motion respected" is the named exit check), not 3.1's —
added here anyway since it cost one extra rule and left unguarded would
be exactly the kind of thing 3.3 would otherwise have to hunt down
retroactively.

**Gotchas:**
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
  restricted to owned copies.
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
  doesn't "own" yet.
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
- The `deploy.yml` workflow gates on `npm run typecheck` and `npm test`
  (Vitest) but does **not** run Playwright in CI — e2e is local-only for now
  to keep the pipeline fast. Revisit once the game has enough surface area
  that e2e coverage matters.
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
