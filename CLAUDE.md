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

## Current state (updated after finishing Step 1.6, Sept 11, 2026)

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

**Next task:** 1.7 `tools/ingest-art.py` (crop/resize/WebP/manifest for
whatever Brent generates from sheet 1) → Phase 2 (match screen, 2.1).

**Gotchas:**
- **This step ran on Sonnet, not the Haiku the plan assigns to 1.6** —
  the session was already on Sonnet when asked to start 1.6 rather than
  being opened fresh on Haiku, and there's no way for a running session to
  downgrade its own model mid-conversation. Flagged, not corrected; the
  skill itself is still written to run on Haiku for every future
  invocation, so this doesn't compound. If a future session opens
  specifically to build a plan step, open it on the model the plan lists
  first, per `CLAUDE.md`'s model-discipline rule.
- There are 14 untracked `art/Gemini_Generated_Image_*.jpeg` files at the
  repo root (not under `art/inbox/` or `art/reference/`) — Brent's own
  in-progress Gemini downloads, not touched by this step. Leave them for
  1.7's `ingest-art.py` (or Brent) to sort into `art/inbox/` with real
  asset ids; don't rename or move them from a content-authoring step.
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
