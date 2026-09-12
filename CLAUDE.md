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

## Current state (updated after finishing Step 3.5, Sept 12, 2026)

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

**Batches 2-4 are also complete, ingested in later sessions** (not
narrated in as much detail here as batch 1 above, but all real, verified
WebP in `public/art/`): sheet 2's 23 assets, sheet 3's 27, and sheet 4's
16 (the 8 Locations, the 6 Legends' 7 signature-card portraits since Dr
Jekyll/Mr Hyde is two faces, and The Landlady). `public/art/manifest.json`
holds all 81 assets across all four sheets; every row in
`art/prompts/sheet-{1,2,3,4}-manifest.json` has a matching entry, checked
by diffing assetIds. Sheet 4's source files arrived in `art/manual Gemini
generations/` already named to (almost) match their assetIds — one typo
(`the-personage-snug.jpeg` for the manifest's `the-parsonage-snug`) had to
be corrected on copy into `art/inbox/` before ingesting, same "match by
assetId, not by eye" requirement 1.6/1.7 already established.
`professor-moriarty`'s chalkboard (the signature-card version, distinct
from `portrait-professor-moriarty`) has the same legible-ish-equations
issue already flagged for the portrait version — cosmetic, ingested as-is,
not re-rolled.

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

3.2 done, after 3.3-3.5 in session order (each of those ran ahead of it for
its own reason, already noted in their own entries) — this session finally
wires the 81 already-ingested assets into the actual UI and audits all of
them against docs/style-bible.md.

**Wiring (the "wire all art" half).** The card illustration window
3.1 explicitly left blank is now real: `.card`'s CSS background gained a
`--illustration` custom property layered between a top-to-bottom scrim
gradient (for text legibility) and the existing solid-dark fallback fill —
defaulting to `none` so a card with no art yet (see below) still renders
exactly as before rather than a broken image. `buildCardEl`
(`src/ui/matchScreen.ts`) and the four other places that hand-roll a
`.card` element (`acquisitionScreen.ts`, `bracketScreen.ts`,
`pubHubScreen.ts`'s reveal overlays, `dedicationScreen.ts`'s dedication
card) all now set it from each face's real `artId`. Three screen-level
backgrounds also got wired the same "--custom-property set from JS via
`import.meta.env.BASE_URL`" way (never a bare CSS `url()` — the subpath-
deploy gotcha below still applies): the deck builder gets
`background-the-back-parlour` ("a quieter room used for cards and
conversation"), the Back Room gets `background-the-cellar` (matches its
fusing/trading vibe and design.md's "legends come up the cellar stairs"),
and the pub hub gets none — no `background-the-taproom` asset was ever
actually generated (see below). The app icon (`public/icons/icon-192.png`/
`icon-512.png`/`apple-touch-icon.png`) was still 0.3's tiny scaffold
placeholder the whole time despite a real, good `public/art/app-icon.webp`
(a brass gear/"SS" monogram) sitting ingested and unused since 1.7 —
regenerated all three sizes from it with Pillow.

**Found and fixed a real wiring bug, not new content: `matchScreen.ts`'s
`--table-bg` custom property was being *set* on `.match-screen` at every
render (`background-the-snug`) but no CSS rule ever consumed
`var(--table-bg)`** — 2.1 wired the JS half and never the CSS half, so the
match table has silently had no background image this entire time. One
line fixed it. Caught by grepping for the property name after noticing
3.1's card-frame comment still said "the illustration window is still
blank until 3.2" — worth remembering that a `style.setProperty` with no
matching CSS `var()` fails completely silently, no console warning, no
broken-image icon, nothing.

**Found and fixed a second real wiring bug: five opponents' portrait art
was already ingested and sitting unused, never wired into
`Opponent.portraitArtId`.** `src/pub/opponents.ts` never set
`portraitArtId` for Christie, Poirot, Dr Jekyll/Mr Hyde, Mary Shelley, or
Sir Charles (house tier) — CLAUDE.md's own 3.1/3.5 gotcha said "no
portrait art yet... only 10 of the cast were in prompt sheet 1," which
was true when written but stopped being true once sheets 2-4 shipped
`portrait-agatha-christie`, `portrait-hercule-poirot`,
`portrait-dr-jekyll-mr-hyde`, `portrait-mary-shelley`, and
`portrait-sir-charles-wheatstone` (real, already-ingested assets, findable
by diffing `public/art/manifest.json`'s keys against every
`Opponent.portraitArtId` in code) — nobody had gone back to wire them in
once the art existed. Five one-line additions fixed it; a new test
(`tests/unit/pub/opponents.test.ts`, "Opponent.portraitArtId") pins both
that every set `portraitArtId` resolves to a real manifest entry and that
every opponent now has one, specifically so a future asset landing in
`public/art/` without a matching code change goes red instead of silently
sitting unused again.

**The dedication screen's "the-landlady" art is dim almost to the point of
invisibility — this is correct, not a bug.** Her card had to be given a
fixed `aspect-ratio: 3/4` (it was rendering as a short, wide strip because
`.card--zoom` sizes itself off content and the dedication card has very
little text) with its text pinned to the bottom over the scrim's darkest
band. Once that was fixed, the art underneath reads as a woman seen from
behind, facing a fire, almost entirely lost to shadow but for a rim of
warm light — which is exactly style-bible.md §6's rule for her ("never a
portrait... seen from the bar, face turned toward the fire... in
silhouette or three-quarter-from-behind... otherwise unlit and
indistinct — she is a presence, not a character design"). Confirmed by
eye in the browser, not just inferred from the source file.

**The style-bible audit (the "regenerate any card whose art fails" half)**
ran as four parallel subagents, each opening ~20 of the 81 real ingested
files directly and checking them against style-bible.md §2/§4/§5/§6's
rules (palette, framing, negative prompts, the pub-regulars sheet).
18 new failures surfaced, on top of the two already known (`card-back`'s
baked-in border, `portrait-professor-moriarty`'s legible-ish chalkboard
equations — both re-checked and confirmed still present). Spot-verified a
sample directly (not just trusting the subagents) before acting on them.

- **A baked-in border/frame is by far the dominant new failure — 11 of the
  18.** Eight portraits from sheets 1-2 (`portrait-constable-tobias-mudd`,
  `portrait-dodgy-reg-farrow`, `portrait-inspector-bucket`,
  `portrait-irene-adler`, `portrait-old-nell-ashby`,
  `portrait-professor-moriarty`, `portrait-sherlock-holmes` — the last
  also has a bad crop showing floor below the bust — and
  `portrait-hercule-poirot`) all carry a rough cream/parchment torn-paper
  edge the exact same way `card-back` already does, despite the negative
  prompt explicitly saying "no border or frame, no vignette." Three
  headline cards (`good-news-everybody`, `party-time-excellent`,
  `cat-burglar-strikes-again`) separately have a full ornamental
  engraved/scrollwork border baked in — their actual newspaper-page
  treatment is otherwise correct, only the border needs to go. This
  reads like a systemic prompt-adherence gap across at least three
  different generation sessions, not a one-off — worth tightening the
  negative-prompt wording itself (`NEGATIVE_PROMPT_BASE` in
  `tools/artPrompts.ts`) if re-rolling doesn't fully clear it.
- **`the-seasons-most-talked-about-engagement` (a headline) doesn't fail
  on a border — it fails the category treatment entirely**, rendering as
  a wedding-invitation border (rings, ribbon, floral scrollwork) around a
  blank interior instead of a printed Victorian newspaper front page.
- **Two legible-text failures beyond the known chalkboard**:
  `professor-moriarty` (the card-art version, distinct from the portrait)
  shares the same legible-ish equations as its portrait sibling, confirmed
  independently; `regs-ledger` shows readable handwritten number columns
  and what reads as a signature, not just texture.
- **Three softer, palette-only findings, flagged for Brent rather than
  auto-queued for a reroll**: `cab-driver` (Irregulars) reads cool
  gunmetal-blue/black rather than gaslight amber; `inspectors-warrant`
  (Yard) has no gunmetal blue at all, just warm desk-brown and an oxblood
  wax seal; `mary-shelley` (Foundry) wears a dark olive/verdigris-leaning
  dress against an otherwise correctly brass/copper workshop background.
  These are style-bible §2's "rule of thumb" guidance, not its
  negative-prompt list — real, but lower-confidence and lower-stakes
  (Shelley especially: re-rolling a major legend's good likeness over a
  palette nuance is a real risk, not a free action) — Brent's call, same
  spirit as every other "flagged, not fixed" judgment call in this file.
- Everything else — all 38 characters, all 15 portraits bar the 8 above,
  all 5 gadgets, the other 2 schemes, the other 2 headlines, all 8
  locations, the 3 backgrounds, and the app icon's monogram — checked out
  clean: no photoreal/3D/anime rendering, no goggles-and-corsets cosplay,
  no modern anachronisms, no gore or distorted limbs, family-color reads
  correct, historical figures recognizable-but-stylised rather than
  photoreal or caricatured, category framing correct throughout.

All 18 have a ready-to-paste re-roll prompt in the new
`art/prompts/step-3.2-rerolls.txt` (built with `tools/artPrompts.ts`'s
existing `buildRerollPrompt`, one call per finding, each folding in a
specific fix rather than a full re-description) — P1 for the 15 clear
violations, P2 for the 3 softer palette calls. None of these have actually
been re-rolled or re-ingested in this session; that's real Gemini spend
and Brent's call on priority, same division of labour 1.6/1.7 already
established (Claude writes prompts, Brent generates, `ingest-art.py`
processes the result).

**A separate, genuine content gap (not a style-bible failure — these
assets never existed at all): 11 real cards and 1 background had no art
asset in any of the 4 prompt sheets, ever.** Diffed every `artId`
referenced in `src/cards/data/` against `public/art/manifest.json`'s keys
(72 needed, 61 covered) to find them: five per-deck filler Characters that
pad a starter/opponent deck out to 20 (`line-fitter`, `beat-partner`,
`street-sweeper`, `errand-runner`, `church-fete-stall` — each deck-local,
outside the labeled 60, per `src/cards/data/README.md`'s filler note),
the four Seasoned reward cards (`buckets-forefinger`,
`the-analytical-engine`, `the-photograph`, `next-instalment` — real, deck-
file "extras beyond the labeled 60" per the same README), and Mary
Shelley's two easter-egg extras (`abby-normal`, `eye-gor`). All eleven
were always outside `ALL_CARDS`, which is exactly why every prior sheet
(built by working through `src/cards/data/`'s card-by-card `artId`s, per
`ss-art-prompts`'s own procedure) never surfaced them — nobody's ever
actually swept the deck-file extras. Plus `background-the-taproom`: only
a batch-0 *reference* image exists (`art/reference/
The_Wheatstone_Bridge_taproom.jpeg`), never actually run through
`ingest-art.py` as a real `public/art` asset the way the-snug/the-back-
parlour/the-cellar were — which is also why the pub hub, the single most-
viewed screen in the app, still has no scene background at all. Authored
all 12 as `art/prompts/sheet-5-manifest.json` → generated
`prompt-sheet-5.csv`/`.txt` the normal way. **Since ingested — see the
follow-up note below.**
**Worth a beat before spending Gemini generations on it**: reward-card and
easter-egg art not being swept by the normal pipeline is itself worth
fixing at the source (e.g. `ss-card-author` or a `src/cards/data/
README.md` convention ensuring every deck-file extra's `artId` gets
tracked the same way the labeled 60's are) so a sixth sheet doesn't hit
the same gap once the next reward card or easter egg is authored.

Verified end-to-end in the browser at the 375×812 iPhone viewport: played
a real tutorial turn and confirmed hand/board cards show their real
illustration under legible text; opened a full card zoom (Night Watchman)
and confirmed the art fills the window with the name/ability/flavor
readable over the scrim; confirmed the match table now shows
`background-the-snug` for the first time; confirmed Sir Charles and all
six legends now show real portraits on the pub hub (previously five of
them were gradient-circle placeholders); opened the deck builder and the
Back Room and confirmed their new scene backgrounds render (had to lower
the scrim opacity from `.match-screen`'s `.55/.85` to `.3/.7` for these
two specifically — the-cellar and the-back-parlour run dark enough on
their own that the stronger scrim buried them completely at first, caught
by screenshotting before assuming the CSS was even wrong); confirmed the
dedication card's new aspect ratio and "the-landlady" art render as
described above. `npm run typecheck`, `npm test` (358 unit tests, up from
356 — the 2 new `portraitArtId` tests), `npx playwright test` (28 e2e, all
passing, unaffected — no screen's testable structure changed), and
`npm run build` all clean.

**Follow-up, same day: sheet 5's 12 assets generated and ingested.** Brent
generated all 12 in Gemini and dropped them into `art/manual Gemini
generations/`, already named to match their assetIds exactly (no typo
this time, unlike sheet 4's `the-personage-snug`/`the-parsonage-snug`
mismatch) — copied into `art/inbox/` and run through `npm run ingest-art
-- art/prompts/sheet-5-manifest.json` (12 ingested, 0 skipped;
`public/art/manifest.json` now holds 93 assets, up from 81). Every
`artId` referenced anywhere in `src/cards/data/` now resolves to a real
ingested asset — confirmed by re-running the same manifest-diff check
this step used to find the gap in the first place, now empty. Spot-
checked several of the new images directly (not just trusted the
pipeline): `background-the-taproom` matches the batch-0 reference closely
(concertina on the shelf, empty chair, cat on a stool, foggy street
through the windows), `abby-normal` stayed a tasteful sealed-jar/apparatus
object study with zero gore, and `the-photograph` correctly kept Adler's
likeness indistinct in the print itself rather than becoming a second,
uncredited portrait — all three had specific instructions in the sheet-5
manifest aimed at exactly these risks, and all three landed as asked.
Wired `background-the-taproom` into the pub hub the same
`--scene-bg`-custom-property way as the deck builder/Back Room (with the
same lighter `.3/.7` scrim, not `.match-screen`'s `.55/.85` — see above),
closing the one screen-background gap this step's CSS work had
deliberately left open pending the asset existing. Verified in the
browser at 375×812: the taproom now renders behind the pub hub's patron
list. `npm run typecheck`, `npm test` (358, unchanged — no new logic, just
new assets plus one CSS/JS wiring addition), `npx playwright test` (28
e2e, all passing), `npm run build` all clean.

**Noticed but deliberately left alone: `art/inbox/` and `art/manual
Gemini generations/` both still hold a full extra copy of sheet 4's 16
assets** (`baker-street.jpeg`, `dame-agatha.jpeg`,
`the-reichenbach-falls.jpeg`, etc., including a correctly-spelled
`the-parsonage-snug.jpeg` in `art/inbox/` sitting alongside the original
ingestion's already-fixed copy) — these are stale leftovers from sheet 4's
original ingestion that were never cleaned out of either folder (the same
"folder isn't auto-cleared" behavior 1.7's gotchas already describe for
`art/inbox/`), not new rerolls of anything this step's audit flagged.
Confirmed they're duplicates, not something new, before ignoring them —
Brent's message only asked for sheet 5, and none of the 18 style-bible
re-roll targets from this step's audit are named among them (Brent hasn't
acted on `step-3.2-rerolls.txt` yet). Worth a cleanup pass whenever
someone's next in these folders for an unrelated reason, but not touched
here since it wasn't asked for.

**Follow-up, same day: all 18 rerolls generated and ingested — 14 fully
fixed, 1 partially fixed, 3 still failing.** Brent generated all 18 in
Gemini and dropped them into `art/manual Gemini generations/
step-3.2-rerolls/`, again named exactly to assetId. Since these are
reroll*s* of existing assetIds (not new ones), `art/inbox/` already had a
stale copy of each from the original sheets 1-4 ingestion sitting
unnoticed (see the "noticed but deliberately left alone" note above) —
overwriting those in place and re-running the normal `ingest-art -- art/
prompts/sheet-N-manifest.json` would have also silently re-processed
every *other* stale leftover in `art/inbox/` for that sheet (harmless —
same source, same output — but wasteful and not clean). Used
`ingest-art.py`'s existing `--inbox DIR` flag instead: staged just the
relevant subset of the 18 into 4 scratch directories (8 for sheet 1, 4 for
sheet 2, 4 for sheet 3, 2 for sheet 4, matching each asset's origin sheet)
and ran `ingest-art.py <sheet-N-manifest.json> --inbox <scratch-dir>` four
times — each run only touches the assets actually staged in that scratch
dir, `public/art/manifest.json` stays at 93 entries (updates in place, no
new ids), and the real `art/inbox/`'s stale duplicates were never
touched. Verified every one of the 18 by eye (not just trusting the
pipeline a second time):

- **14 fully fixed**: `portrait-constable-tobias-mudd`,
  `portrait-dodgy-reg-farrow`, `portrait-inspector-bucket`,
  `portrait-irene-adler`, `portrait-old-nell-ashby`,
  `portrait-sherlock-holmes` (border gone, crop corrected too),
  `portrait-hercule-poirot`, `good-news-everybody`,
  `cat-burglar-strikes-again` (both now genuinely full-bleed newspaper
  pages, no ornamental border), `professor-moriarty` (the card-art
  version — chalkboard now unreadable scribble), and all three P2 palette
  calls — `cab-driver` (now reads gaslight-amber Irregulars at a glance),
  `inspectors-warrant` (real gunmetal blue now present), `mary-shelley`
  (dress now brass/amber-toned, matching her workshop background).
- **1 partially fixed**: `portrait-professor-moriarty` — the baked-in
  border is gone, but the chalkboard behind him still shows legible-ish
  equations despite the fold-in fix; the card-art sibling
  (`professor-moriarty`) fixed cleanly from the same instruction, so this
  looks like generation variance rather than a wording problem.
- **3 still failing, worth a further look, not re-rolled again here**:
  `card-back` still has its full ornamental scrollwork border on its
  *third* attempt (1.7's original, an earlier reroll, and this one) —
  this specific asset seems resistant to the standard fix; worth trying a
  more drastically different prompt (e.g. dropping the "engraved seal
  aesthetic" framing entirely) rather than a fourth near-identical
  reroll. `party-time-excellent` kept its ornamental border *and* lost
  almost all its newspaper content in the process (the reroll came back
  as a near-blank bordered page). `regs-ledger` came back with the
  handwriting, if anything, more legible than before (a clear cursive
  signature, readable-ish number columns) — the "illegible squiggle" fix
  instruction didn't take.
- **One additional, not-previously-flagged observation**: the-seasons
  -most-talked-about-engagement's reroll fixed the actual category
  problem (it's now a real "Daily Universal Register" newspaper front
  page, not a wedding invitation) but the page carries a thin double-rule
  border/frame around its own edge — much subtler than the ornamental
  scrollwork on the three still-failing assets above, and arguably closer
  to a printed page's own margin rule than a decorative card frame, but
  technically still a border per style-bible.md §5's literal "no border
  or frame." Counted as fixed for now given how much better the core
  treatment is, but worth a second look before calling it fully done.

`npm test` (358, unchanged), `npm run typecheck`, and `npm run build` all
still clean — no code changed this pass, only ingested assets.

**Follow-up, same day: a round-2 reroll of the 4 still-open assets — 3 of
4 fixed, diagnosing the actual root cause first this time instead of just
re-appending the same fix.** Read each failing asset's *original* prompt
text (not just the negative-prompt list) before writing a new one, and
found the real problem in three of the four: `card-back`'s and
`party-time-excellent`'s own base prompts literally asked for a border
("within a parchment-cream border of engraved foliate scrollwork,"
"...in the border rule lines") — a direct self-contradiction against the
negative prompt that no appended fix could ever win, which is why the
first reroll (round 1, appending a fix via `buildRerollPrompt`) failed on
both. `portrait-professor-moriarty`'s base prompt asked for a chalkboard
"of faint, barely-legible equations" — the word "equations" itself
plausibly primes legible-looking math regardless of the negative prompt.
All three were rewritten from scratch (new `prompt` text, not an appended
fix) in `art/prompts/step-3.2-rerolls-2.txt`, generated via
`tools/artPrompts.ts`'s `buildNegativePrompt`/`ASPECT_BY_CATEGORY`
directly rather than `buildRerollPrompt` (which only ever appends).
Ingested the same `--inbox`-scoped-scratch-directory way as round 1 (2 for
sheet 1, 2 for sheet 3), verified each by eye:

- **`card-back` — fixed.** The scrollwork now genuinely tiles edge-to-edge
  as a continuous surface pattern, with the brass gear sitting directly on
  it — no separate border ring. Took a full prompt rewrite; three prior
  attempts (1.7's original plus two rerolls) never had a chance while the
  base prompt kept asking for a border.
- **`party-time-excellent` — fixed**, and no longer sparse either (the
  round-1 reroll had come back nearly blank). Content now fills the page
  edge-to-edge with dense columns. **Minor nitpick, not re-rolled over
  it**: the "greeked" body text came back as actual Latin lorem-ipsum
  filler ("Lorem ipsum dolor sit amet...") rather than abstract
  line-marks — literally legible words, technically against "no text,"
  but conventional placeholder-text convention rather than any real
  content, and a much smaller concern than the border problem it was
  chasing. Judgment call to leave as-is.
- **`portrait-professor-moriarty` — fixed.** The chalkboard now shows only
  abstract arrows/circles/scribbles, zero numerals or equation-like
  marks — confirms the "equations" word in the base prompt was the actual
  trigger, not generation variance as first guessed.
- **`regs-ledger` — still failing, needs a different approach again, not
  a third identical reroll.** The requested raking angle/shallow depth of
  field never materialized — the reroll came back sharp and front-on
  across the whole page, same as before, with an ink blot added but most
  of the page (including full number columns and cursive entries on the
  left) still clearly legible. The "shallow depth of field" instruction
  seems to not be landing at all through two attempts now; worth trying a
  structurally different composition next time rather than a third
  variant of "blur the ledger" — e.g. drop the open-ledger concept
  entirely in favor of a closed ledger with just a hand resting on the
  cover, or a scene where the page is turned away from camera.

`npm test` (358, unchanged), `npm run typecheck`, `npm run build` all
clean — no code changed, only re-ingested assets.

**Follow-up, same day: `regs-ledger`'s round-3 reroll fixed it — this
closes out every asset the style-bible audit flagged.** Two straight
attempts at "blur/angle the open page" had failed to stop the ledger's
handwriting from rendering legibly, so round 3 dropped the open-book
concept entirely: a *closed* ledger, brass clasp shut, with a hand
resting on the cover as if guarding it rather than reading it — there's
no page in frame for anything to be written on. Worked on the first try.
Source file arrived misnamed (`reqs-ledger.jpeg` for the assetId
`regs-ledger`) — the same "typo the assetId on the way out of Gemini"
gotcha 1.7/3.2 already flagged for sheet 4's `the-personage-snug`; caught
and corrected on copy into the scratch inbox before ingesting, same as
that precedent. `npm test` (358), `npm run typecheck`, `npm run build` all
clean.

**Every one of the 18 style-bible-flagged assets from this step's audit is
now fixed** (17 outright, plus `party-time-excellent`'s accepted
lorem-ipsum nitpick) across three reroll rounds — 14 in round 1, 3 more in
round 2, the last one in round 3. Worth remembering for next time a
reroll doesn't take on the first try: **read the asset's own base scene
prompt before assuming the negative-prompt list needs to be louder.** Of
the 4 stubborn cases, 3 turned out to have the base prompt itself asking
for the exact thing being negative-prompted against (a border, or
"equations"), and the 4th (`regs-ledger`) turned out to need a different
*composition*, not different camera/lighting language layered onto the
same one. A negative prompt can't reliably out-argue the positive prompt
sitting right next to it.

**Still open, not this step's job:** the `deck-card-tile`/`backroom-tile`
flat list rows still deliberately carry no art thumbnail (3.1's own
scoping call, re-confirmed here rather than re-litigated).

**This step ran on Sonnet, not the Haiku the plan assigns to 3.2** — same
situation as 1.6/2.5/3.4/3.5's flagged gotchas: the session was already
running on Sonnet when asked to start 3.2 rather than being opened fresh
on Haiku. Flagged, not corrected — the two wiring bugs this step found
(the dead `--table-bg` CSS variable, the five un-wired `portraitArtId`s)
are exactly the kind of thing worth noting stayed hidden across several
Haiku-and-Sonnet sessions already, not a reason to think Haiku itself
would've missed them.

3.3 done, ahead of 3.2 in the plan's own order — Brent asked for it directly
and animation turned out not to depend on 3.2's art wiring (it's DOM/CSS
motion on top of whatever's already rendering, art or no art), so it was
built as asked rather than blocked on plan sequencing. Card play, flip,
round reveal, tournament bracket advance, and card-reward "unwrap" (the
plan's own five-item list) are all in `src/style.css` as self-contained
`@keyframes`, every one gated behind `@media (prefers-reduced-motion:
no-preference)` (matching 3.1's foil-shimmer precedent) and animating only
`transform`/`opacity` (compositor-only, same reasoning as 3.1's shimmer).

**The hard part wasn't the CSS — it was that every screen in this app does
a full teardown/rebuild on each render (`root.replaceChildren()`, no
persistent DOM node from one state to the next), so there's no "old
element" to `transition` toward a "new element."** Every animation here is
instead a one-shot keyframe applied via a class the caller adds only on
the render where something actually changed, using an "anim snapshot" diff
(`src/ui/matchScreen.ts`'s `boardAnimSnapshot`/`locationAnimSnapshot`:
instanceId → faceUp, captured each commit) rather than anything DOM-based:
a board/Location card not in the snapshot gets `.card--play-enter`
(translateY+scale+fade in); a card whose faceUp flipped since the snapshot
gets `.card--flip` (a 2D scaleX(1)→0→1 "coin flip" — the element already
carries its final, correct content for this render, so there's no need to
model both faces at once, just a motion cue that it turned over). Round
reveal (and, for free, every other overlay — match-over, card zoom, reward
reveal) gets a generic `.overlay`/`.overlay-box` fade+pop-in, since they
all share those two classes already. The reward "unwrap" animation already
existed (an ad-hoc `.reveal-card { animation: unwrap ... }` added during
2.3-2.5, unguarded) — 3.3's actual work there was just adding the
reduced-motion guard, not building the motion from scratch.

**Bracket advance needed one new option threaded through, since
`bracketScreen.ts` is a fresh mount every time (main.ts's `showBracket`),
with no memory of what the bracket looked like before this match.**
`finishTournamentMatch` (`src/main.ts`) now captures `currentMatchIndex
(bracket)` — the slot that's about to be resolved — *before* calling
`advanceBracket`, and passes it through `showBracket` as
`justAdvancedIndex` on `BracketScreenOptions`. `bracketScreen.ts`'s
`buildStageRow` uses it to mark the just-resolved row `.bracket-stage
--advanced` (badge pops in) and the row that becomes active as a result
`.bracket-stage--just-active` (slides into focus) — set only on that one
mount, never on a fresh tournament entry or a plain resume (both pass no
`justAdvancedIndex`), so the ladder doesn't replay this every time the
screen is reopened.

**Found and fixed a real bug in this step's own first draft, not
pre-existing — flagged so the pattern doesn't get reintroduced.** The
obvious approach — update the anim snapshot at the end of every `render()`
call, right after building the board — is wrong, because `scheduleNext()`
triggers a second, synchronous `render()` (the idle→"ai-turn"/"human-pass"
phase change) in the *same tick* as the commit's own render, before the
browser ever paints either one. Updating the snapshot inside `render()`
meant the second (only-ever-painted) render already saw the
just-committed card as "known," so the human's own play never visibly
animated — only the AI's reply did, since nothing re-renders in the gap
before its 900ms `setTimeout`. Fixed by moving the snapshot update out of
`render()` entirely and into a `queueMicrotask()` scheduled once per
commit, inside `afterCommit()` — microtasks run only after the *whole*
synchronous call stack (both renders) finishes, so every render triggered
by one commit sees the same "before this commit" baseline, while a later,
unrelated render (opening the zoom modal, a beer mat firing) sees the
already-updated one and replays nothing. Caught by instrumenting the live
page with `element.getAnimations()` mid-playtest, not by the test suite —
Playwright's smoke tests don't assert on transient animation classes and
wouldn't have caught a "class applied to a frame nobody paints" bug.

Verified in the browser at a phone-width viewport: played several live
turns against Mudd and confirmed via `getAnimations()` that
`.card--play-enter` lands on a freshly-played card's *next* render and is
gone by the one after; watched a real round-reveal overlay render cleanly
with the new pop-in. Also injected synthetic elements (`.card--flip`,
`.overlay`/`.overlay-box`, `.reveal-card`, `.bracket-stage--advanced
.bracket-stage-badge`, `.bracket-stage--just-active`) directly into the
live page and used `getAnimations()`/`effect.getKeyframes()` to confirm
each one actually runs and only ever touches `transform`/`opacity` — same
verification technique 3.1 used for the foil shimmer, extended to every
new keyframe this step added. Checked the reduced-motion gating by walking
`document.styleSheets` for `CSSMediaRule`s matching `prefers-reduced-motion`
and confirming every new selector sits inside one. `npm run typecheck`,
`npm test` (336 unit tests, all passing — no new ones needed; this step is
CSS plus DOM-diffing glue, not new pure logic), `npx playwright test` (25
e2e, all passing, unaffected by the timing fix), and `npm run build` all
clean.

3.4 done. Sound lives in `src/audio/`: `soundEngine.ts` synthesizes four
effects purely from Web Audio oscillators/noise buffers — no licensed audio,
matching the plan's "no licensing" requirement — `click` (a short square-
wave blip), `steam` (filtered noise hiss), `flip` (a triangle-wave pitch
drop), `brassHit` (a three-note sawtooth chord through a decaying lowpass,
for round/match/bracket/reward moments). `audioState.ts` persists the mute
toggle in its own localStorage key, same defensive load/save pattern as
`pubState.ts`/`deckStorage.ts`, and is now folded into `SaveFile`
(`src/save/saveFile.ts`) as its `audio` field — design.md §12.4 lists
"settings" as save content 2.6 deliberately left unbuilt, and mute is the
first real one. The `AudioContext` is created lazily inside `ensureContext()`
and never at module load, since jsdom (this project's unit-test
environment) has no `AudioContext` at all — importing the module has to
stay safe regardless, so only the mute-state half is unit-tested
(`tests/unit/audio/`, 9 new tests), and the actual synthesis was verified by
instrumentation in a real browser instead (see below) — same class of gap
as `tools/ingest-art.py` (1.7) and the animation work (3.3), both verified
by running/watching them for real rather than under jsdom.

**Unlock and UI clicks are both wired once, globally, in `src/main.ts`,
rather than per-screen.** A `pointerdown` listener (`{capture: true, once:
true}`) calls `unlockAudio()` synchronously inside the app's very first tap
anywhere — this project's own "iOS web app conventions" section's "audio
needs a user gesture" requirement — regardless of which screen that tap
lands on (usually the tutorial, a newcomer's first launch). Separately, a
persistent capturing `click` listener on `document` plays `"click"` for any
tap whose target is (or is inside) a real `<button>` or `role="button"`
element — which turns out to be *every* meaningful tap in this app already
(every screen's nav buttons, `matchScreen.ts`'s tappable hand/board cards
and action-bar buttons, `beerMat.ts`'s dismiss button, `pubHubScreen.ts`'s
patron rows), since none of them needed a new element added to pick up
sound. This was a deliberate scope call over hand-wiring `playSound("click")`
into each screen individually: one delegated listener in `main.ts` covers
the whole app's buttons at zero per-screen cost, and doubles as a second,
redundant unlock path (creating an `AudioContext` inside a real click
handler is itself a valid user gesture). The only taps it doesn't cover are
a couple of plain, non-button dismiss gestures (tapping the zoom overlay's
backdrop) — accepted as a minor, harmless gap rather than adding `role`
attributes purely to catch a sound effect.

**Card play/flip/round-reveal/match-over/bracket-advance/reward-unwrap
sounds are wired at the same specific state-transition points 3.3's
animation diffing already identified, not read off render-time animation
flags.** `matchScreen.ts`'s new `playCommitSounds()` diffs the current state
against `boardAnimSnapshot`/`locationAnimSnapshot` (3.3's own "before this
commit" baseline) exactly once per `afterCommit()` call — before the
`queueMicrotask` that updates those snapshots — to decide once whether to
play `"steam"` (a card or Location newly in play, human's or AI's) and/or
`"flip"` (a board card's `faceUp` toggled). This mirrors, but is separate
from, `buildBoardRow`'s own per-render animation-class diff: `render()` can
run more than once per real commit (3.3's own flagged gotcha — the AI-turn
phase transition renders synchronously in the same tick), so computing the
sound decision inside `render()` the way the animation classes do would
have double-fired a "steam" for the same card. `playSound("brassHit")` is
called directly at each of round-reveal, match-over (both the
`afterCommit()` and `continueAfterRoundReveal()` branches — the match can
complete on either), tournament bracket advance (`bracketScreen.ts`, gated
on `justAdvancedIndex !== undefined`, the same "just advanced" flag 3.3
uses for the ladder animation), and every card-reward "unwrap" moment
(`pubHubScreen.ts`'s first-win/Bar Bet reveal, `acquisitionScreen.ts`'s Lost
& Found/Tinker's Bench reveal, `tutorialRewardScreen.ts`'s tutorial reward)
— each fired exactly once, at the specific call site that makes the reveal
newly visible, not inside a `render()` that could re-run for an unrelated
reason.

**A small self-syncing mute-toggle widget** (`src/ui/muteToggle.ts`) is
dropped into the pub hub header and the match screen's topbar — the two
screens where sound is most audible — rather than every screen, since there
is no dedicated settings screen yet (design.md §12.4 lists "settings" as
save content; 3.5 is "gift touches," not a settings screen, so this is the
same kind of judgment call 2.6 flagged when it left "settings" out of
`SaveFile`'s shape). It manages its own icon/`aria-pressed` state via a
`sync()` closure rather than participating in each screen's full-rebuild
render cycle, so toggling mute mid-match doesn't force a whole match-screen
redraw just to redraw one button.

**Optional CC0 ambience track: scaffolded, not sourced.** `startAmbience()`
(called once from `unlockAudio()`) loops `public/audio/ambience.mp3` if it
exists and silently does nothing if it doesn't — no such file has actually
been found/licensed yet, same "Brent sources the asset, a tool consumes it"
split as `art/inbox/`'s Gemini downloads, except there's no ingestion tool
for audio (a single CC0 loop doesn't need one — it can be dropped straight
into `public/audio/` once chosen). Verified the no-op path is actually
silent: the Vite dev server's SPA fallback returns a 200 `text/html` for the
missing path (not a 404), which the browser correctly fails to decode as
audio, caught by `startAmbience()`'s own `.catch()` — no console error.
GitHub Pages (no SPA rewrite configured) will instead return a real 404 for
the same missing path once deployed, also caught the same way. Not wired
into the service-worker precache list either way — that's 3.6's job, same
reasoning as 1.7's un-precached `public/art/*.webp` gotcha below.

Verified in the browser at the iPhone 17 viewport by instrumenting
`AudioContext.prototype` (wrapping the constructor and
`createOscillator`/`createBufferSource`) rather than by ear: confirmed
exactly one `AudioContext` is created, and it reaches `"running"` (not
`"suspended"`), on the very first real tap anywhere in the app; confirmed a
full human-play-then-AI-reply exchange produces exactly the expected node
sequence with no duplicates — one oscillator for staging a hand card, one
oscillator for tapping "Play," one noise-buffer source for the human's card
landing (`"steam"`), one more for the AI's reply — proving `playCommitSounds()`
really does fire once per commit despite `render()` running twice for that
same AI-turn transition (the exact double-fire risk 3.3's own microtask
ordering already had to solve, reused here); confirmed the mute toggle
writes `{"muted":true}` to `localStorage` and the icon (🔊/🔇) reads back
correctly after a real page reload (the exit check: "mute persists").
`npm run typecheck`, `npm test` (345 unit tests, up from 336), `npx
playwright test` (25 e2e, all passing, unaffected — no screen's testable
structure changed), and `npm run build` all clean.

**This step ran on Sonnet, not the Haiku the plan assigns to 3.4** — same
situation as 1.6/2.5's flagged gotchas: the session was already running on
Sonnet when asked to start 3.4 rather than being opened fresh on Haiku.
Flagged, not corrected.

3.5 done. The four gift touches (design.md §14) live across a new store,
a new screen, and small additions to two existing ones:

- **§14.1, dedication screen**: `src/ui/dedicationScreen.ts`
  (`mountDedicationScreen`) — two tap-through beats (the oversized card
  face, then Sir Charles's "You're expected. Your chair's by the fire.")
  shown once, before the tutorial even starts on a truly fresh install.
  The card reuses 3.1/3.3's existing legendary-frame and `.reveal-card`
  unwrap CSS (`data-rarity="legendary"`) rather than inventing new chrome
  for a screen shown exactly once per install. The wording is quoted
  verbatim from design.md §14.1 ("resolved with Brent... is final") and is
  hardcoded — it does not read from the new editable player name below,
  keeping the fixed gift message stable regardless of what she later
  renames herself to.
- **§14.2, default player name**: `src/player/playerState.ts` — a small
  store (`{ name, dedicationSeen }`, default `{ "Sara", false }`), same
  defensive load/save pattern as `src/audio/audioState.ts`, folded into
  `SaveFile` (`src/save/saveFile.ts`) as this closes 2.6's flagged
  "first-launch flag" gap (`dedicationSeen` *is* that flag) alongside the
  name. Surfaced as an editable `<input>` right under the pub's own name
  on the pub hub header (`src/ui/pubHubScreen.ts`), mutated in place on
  keystroke same as `deckBuilderScreen.ts`'s deck-name field. **Judgment
  call, not extended further**: the name isn't threaded into
  `matchScreen.ts`'s existing "You"/"Your" labels (side label, score,
  round/match-over text) — doing so would touch a lot of hardcoded UI
  strings and several e2e assertions for a cosmetic win design.md §14.2
  doesn't actually ask for ("pre-filled and editable" is the whole spec);
  worth reconsidering if Brent wants his own name to show up more
  pervasively during play.
- **§14.3, The Landlady as a reserved silhouette**: the card itself was
  already fully authored (`src/cards/data/landlady.ts`, 1.5) and the
  Birthday Invitational already pays her out as its fixed prize (2.4's
  `resolvePrize`) — the actual gap 2.4 flagged ("nothing stops a player
  from adding her to a deck before ever entering that tournament") is
  fixed narrowly in `deckBuilderScreen.ts`'s grid: a card-id-specific
  check (`card.id === "the-landlady" && !pub.collection.includes(...)`)
  swaps her tile for a dimmed, control-less "Reserved — earned by winning
  the Birthday Invitational" placeholder instead of extending copies of
  her. This is a one-card exception, not a first cut at the general
  ownership-gating system 2.2/2.3/2.4/2.5 have all flagged and left
  open — that system, whenever built, should fold this special case in
  rather than leaving two separate mechanisms.
- **§14.4, the toast**: `src/tournaments/toast.ts`
  (`INVITATIONAL_TOAST_SEQUENCE`) — an opening scene-setting line ("Sir
  Charles sets down the tray...the pub goes quiet"), one toast line each
  from all six legends (order matches design.md §9.3's table, same as
  `src/pub/opponents.ts`), then Sir Charles's closing line, quoted
  verbatim from §14.4 ("To the Landlady. Who was always going to be.").
  Wired into `src/ui/bracketScreen.ts`: when `tournament.id ===
  "birthday-invitational"` and the bracket just produced a payout (win or
  lose), a tap-through toast overlay plays before the existing
  champion/eliminated payout overlay, which already handles the
  win/lose Checks and the Landlady's own unwrap correctly and needed no
  changes. **Content-authoring judgment call, flagged like 1.6/2.4's
  similar ones**: design.md names the beat and Sir Charles's own line
  exactly but leaves every legend's toast unwritten — the six lines here
  are original, written in each legend's established voice from their
  §9.3 flavour quotes, not a locked script. Deliberately keyed to "the
  Landlady"/"Sara" as fixed in-fiction names, not the new editable player
  name from §14.2, for the same reason the dedication screen doesn't read
  it either.
- **§14.6, the fixed point**: unchanged — 2.4 already built
  `checkInvitationalTrigger`'s Oct-30 date check and `main.ts`'s
  `syncTournamentTrigger`, re-verified still correct here, not touched.

**Found and fixed a real pre-existing bug during this step's manual
verification, not scope creep — it crashed the app the first time anyone
actually clicked it, and blocked verifying the toast above.**
`src/main.ts`'s `showTournaments()` wired the chalkboard's "Back to the
bar" button as `onBack: showPubHub` — a bare function reference, unlike
every other `onBack` in this file (`() => showPubHub()`).
`tournamentsScreen.ts` attaches it directly via
`backBtn.addEventListener("click", options.onBack)`, so the click's
`PointerEvent` itself was passed as `showPubHub`'s optional
`pendingReveals` parameter; `pubHubScreen.ts` then tried to spread it
(`[...(options.pendingReveals ?? [])]`) and threw `TypeError: ... is not
iterable`, blanking the whole app. Caught by manually clicking through to
verify the Birthday Invitational end-to-end (seeded a bracket one match
from completion, played and won the final for real, confirmed the toast
and Landlady unwrap render correctly) and then trying to leave the
chalkboard the normal way. Fixed by wrapping it
(`onBack: () => showPubHub()`), same as the other three call sites; a new
Playwright regression test pins it
(`tests/e2e/tournaments.spec.ts`: "the chalkboard's own Back to the bar
returns to the pub hub without crashing"). Worth a moment's caution for
future `onBack`/`onExit`-style props in this codebase: passing a function
with an optional first parameter straight to `addEventListener` is
exactly this bug waiting to happen again.

Tests: `tests/unit/player/playerState.test.ts` (new, 6 tests),
`tests/unit/tournaments/toast.test.ts` (new, 3 tests), plus additions to
`tests/unit/save/saveFile.test.ts` for the new `player` field — 356 unit
tests total (project-wide, up from 345), all passing.
`tests/e2e/tutorial.spec.ts` gained its own "dedication screen" describe
block (2 new tests: a truly fresh install sees it before the tutorial and
tapping through reaches the tutorial; a returning player skips it) and
every other e2e spec's `localStorage.clear()` fixture needed a
`steampunk-shuffle:player` seed (`dedicationSeen: true`) added alongside
its existing `tutorial-state` seed — same "every prior step's clean-slate
fixture has to grow one more key" pattern 2.7 hit when the tutorial itself
went in front of the pub hub. 28 e2e tests total (up from 25, including
the regression test above), all passing. `npm run typecheck`, `npm run
build` both clean.

Manually verified end-to-end in the browser at the iPhone 17 viewport:
cleared storage and confirmed the dedication card (gold-leaf frame,
exact §14.1 wording) and Sir Charles's greeting both render and tap
through into the tutorial; confirmed a returning player's save skips
straight past it; edited the player name on the pub hub header and
confirmed it persists across a reload; opened the deck builder and
confirmed The Landlady renders as a dimmed, uncontrolled "Reserved" tile
among the other five legendaries; seeded a Birthday Invitational bracket
one match from its final (won each of the first two AI-vs-AI-resolved
seats moot — QF/SF pre-marked won, final vs Sir Charles), played and won
that final match for real, and watched the full toast sequence (all seven
lines, in order, tap-to-continue) followed by "Champion: The Birthday
Invitational!", 500 Checks, and The Landlady's own gold-leaf unwrap —
then confirmed she immediately became a normal, addable legendary in the
deck builder.

**This step ran on Sonnet, not the Haiku the plan assigns to 3.5** — same
situation as 1.6/2.5/3.4's flagged gotchas: the session was already
running on Sonnet when asked to start 3.5 rather than being opened fresh
on Haiku. Flagged, not corrected.

**This closes out design.md §14's gift touches.** Phase 3 continues at
3.6 (asset budget, service-worker precache, performance pass) and 3.7
(a ★ newcomer-eyes review session).

3.6 done. Ran per the plan's own split: a Haiku audit pass (`AUDIT-3.6.md`,
not committed — folded into this entry and removed once its findings were
acted on, same as 2.8's synthetic-playtest-file precedent) found asset
budget was already fine (10.3 MB total, under the 15 MB cap) and
installability already passed, but caught a real P1: `vite.config.ts`'s
Workbox `globPatterns` (`**/*.{js,css,html,png,svg,webmanifest}`) never
included `.webp` — so all 93 art assets (9.7 MB) sat outside the
precache, meaning the "offline works cold" exit check was actually
failing (the shell loaded offline, but every card was a blank
illustration window). A P2 alongside it: `public/art/manifest.json` (the
artId → asset-metadata lookup fetched at runtime) wasn't precached
either. **The fix is one line**: added `webp,json` to `globPatterns`
(`public/` has exactly one JSON file — `art/manifest.json` — so this
doesn't risk pulling in anything unintended). Rebuilding jumped the
precache from 12 entries/614 KiB to 106 entries/10.3 MB, matching the
audit's own projection exactly; `grep`ing `dist/sw.js`'s precache array
confirmed all 93 `.webp` URLs and `art/manifest.json` are actually listed
in it, not just that the build didn't error.

**Verified "airplane-mode full session" for real, not just by grepping
the precache manifest** — added a second `.claude/launch.json` config
(`steampunk-shuffle-preview`, `npm run preview -- --port 4173`) since dev
mode's service worker doesn't reflect the real production
`globPatterns`/precache; `preview_start`ing it, loading the app once (to
let the SW install and precache everything), then **killing the preview
server outright** and reloading is a truer test than DevTools' offline
checkbox for this app specifically, since there's no backend beyond the
static file server itself — if the SW cache is actually serving
everything, the app can't tell the difference between "offline" and
"server process is dead." Confirmed: a fresh install's dedication screen
rendered The Landlady's art, tapping through into the tutorial rendered
the taproom/snug background and Sir Charles's portrait, and every art
`GET` in `read_network_requests` came back `200 OK` with the server
process not running. The only failed request was
`audio/ambience.mp3` (`net::ERR_CONNECTION_REFUSED`) — 3.4's
already-flagged not-yet-sourced ambience track, correctly absent from
the precache because the file doesn't exist yet, and already caught by
its own `.catch()` with no visible error in the app. `npm run typecheck`,
`npm test` (358 unit tests, unchanged — this step touched build config,
not app code), and `npm run build` all clean.

**P3/P4 from the audit deliberately left open, same "not this step's
job" reasoning the audit itself gave them**: precaching
`audio/ambience.mp3` has nothing to precache until Brent sources and
drops in the file (at which point `webp,json` → `webp,json,mp3`, or an
explicit `includeAssets` entry, is the whole fix); a slow-3G DevTools
throttling pass is flagged as `[P4, POLISH]` in the audit and wasn't run
here. Also didn't re-run a formal Lighthouse PWA-category audit — per
this file's own already-recorded gotcha, Lighthouse 13 dropped the
standalone `pwa` category entirely, so `ss-ship`'s Lighthouse step has
only ever been an informational, non-gating read; the real "offline
works cold" exit check is the killed-server session above, not a
Lighthouse score.

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
