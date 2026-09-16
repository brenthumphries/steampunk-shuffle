# Playtest notes

Triaged by `ss-playtest` from Brent's phone notes (plan §3, Phase 2 daily
playtesting). New items only ever get added here — moving an entry to
*Resolved*, or editing its text, happens when someone actually fixes it.

PT-1 through PT-32 were filed by plan step 3.7's newcomer design review
(`docs/newcomer-review.md`, Sept 12, 2026), which also groups them into
Phase 4 fix batches A–E with model assignments. Severity there is read for
a gift with a fixed date: **P1** = ship-blocking for Oct 30 (the game isn't
what design.md says it is, or the gift moment is damaged), **P2** = a
newcomer will hit it and be confused or misled, **P3** = polish.

## P1 — Blocking

## P2 — Bug

## P3 — Balance / polish / idea

## Known / already flagged (not filed as new)

### All nine tutorial turns are forced (design.md §13.1 says six of nine)
- **Seen:** 2026-09-12 — matches CLAUDE.md's 2.7 judgment call; from a newcomer's chair forcing all nine is fine, not a problem.

### Opponent hand shown as "Hand: N", not a fanned stack
- **Seen:** 2026-09-12 — matches CLAUDE.md's 2.1 note; reads fine.

## Resolved

(moved here by whoever fixes an item — not touched by this skill)

### PT-32: Opponent decks are tuned by accident — printed points, not tier, decide who wins
- **Fixed:** 2026-09-12, plan step 4.0a-correction. The original 4.0a pass (committed alongside 3.7/4.0b, `b548302`) re-authored Nell Ashby, Lovelace, Adler, and Jekyll/Hyde toward the recommended tier bands (Regular 38–42 · Seasoned 44–48 · Legend 48–54) but was never actually re-verified with `npm run curve` before being committed, and PLAYTEST.md was never updated — re-running `curve` found most of it hadn't worked: Nell Ashby was still at 85% (target ~60%), Adler at 90% (target ~40-45%), and Reg Farrow/Hollis/Holmes/Christie/Jekyll/Shelley had never been touched at all. Re-pointed all 8 remaining decks (Nell Ashby, Reg Farrow, Miss Prudence Hollis, Irene Adler, Sherlock Holmes, Agatha Christie, Dr Jekyll/Mr Hyde, Mary Shelley) — see CLAUDE.md's "4.0a-correction" entry for the full breakdown, including the finding that raw printed points don't reliably predict win rate (Bucket/Dickens overperform their low points; several "fixed" decks still underperformed until given real ability synergy, not just points) and that the default 12-game legend-tier `curve` sample is too noisy to trust for fine-tuning — verified instead at 50 games/deck. Bucket, Dickens, Moriarty, and Poirot were left untouched (already within or close to target per the original 3.7 review). `npm run sim`: no card-lift outliers. Final sensible-column numbers: Regular 50-63% (target ~60%), Seasoned 33-60% (target ~40-45%, Bucket/Dickens unchanged from their already-accepted ~60%), Legend 18-30% at 50 games/deck (target ~30%).

### PT-3: The Parsonage Snug buffs every card on both sides, not Friend cards
- **Fixed:** 2026-09-12, plan step 4.0b (batch B). `TargetFilter.hasKeyword` added and honoured in `matchesFilter`; The Parsonage Snug, The Season's Most Talked-About Engagement, and The Landlady all now filter on `hasKeyword: "friend"`, matching their printed text. See CLAUDE.md's 4.0b entry.

### The Landlady buffs herself (+1 overstatement)
- **Fixed:** 2026-09-12, plan step 4.0b — fixed for free by PT-3's `hasKeyword` fix. The Landlady carries no Friend keyword herself, so the tighter filter already excludes her from her own buff; no separate `sourceInstanceId` exclusion was needed.

### PT-10: The Return hint chip fired with no Return card anywhere on the table
- **Fixed:** 2026-09-12, plan step 4.0b (batch B). `captureHintSnapshot`/`afterCommit` (`src/ui/matchScreen.ts`) now diff "on board, face-up, had Return before this turn" against "in hand after," per side, instead of checking either hand for any Return-keyword card at all.

### PT-25: Spent Schemes and Headlines stay on the table as 0-point cards
- **Fixed:** 2026-09-12, plan step 4.0b (batch B), after confirming the rules-change call with Brent (discard, per design.md §3's "then it's spent"). `resolvePlay` (`src/engine/matchEngine.ts`) now discards a Scheme/Headline right after its On Play effects resolve.

### PT-7: The match screen uses 475 of 874 px; hand cards are 58×78 px with 10.4 px text
- **Fixed:** 2026-09-12, plan step 4.0c (batch C). `#app { height: 100dvh; display: flex; flex-direction: column }`, `.match-screen { flex: 1; min-height: 0 }`; `.card--mini` grown to 5.4×7.3rem at 0.75rem (12px) text. Verified via `getBoundingClientRect()` in a real browser: `.match-screen` now fills the full 874px viewport height.

### PT-8: A 6+-card hand clips off the right edge with no scroll cue
- **Fixed:** 2026-09-12, plan step 4.0c (batch C). `.hand-row` wraps (`flex-wrap: wrap`) instead of scrolling horizontally, capped at two rows' height with `overflow-y: auto` as a fallback for a hand too large even for that. Verified live with a real 6-card round-2 hand.

### PT-9: The round-reveal overlay appears over the already-cleared next-round board
- **Fixed:** 2026-09-12, plan step 4.0c (batch C). `RoundResult` gained `finalBoard` (`src/engine/matchTypes.ts`/`matchEngine.ts`), a snapshot taken after endOfRound abilities resolve but before the cleanup sweep; the round-reveal overlay's backdrop (`buildBoardRow`/`buildSideLabel` in `matchScreen.ts`) renders that instead of the live board/score. Verified live in both the tutorial and a real match — the round's actual final board and score show correctly behind the overlay.

### PT-11: No coin toss — the match opens with the opponent's card already on the table
- **Fixed:** 2026-09-12, plan step 4.0c (batch C). A `coin-toss` phase shows "Heads."/"Tails.", who leads, and "Game on." before the first turn of any fresh (non-resumed, non-tutorial) match. Verified live.

### PT-12: Auto-targeted On Play never says what it will hit
- **Fixed:** 2026-09-12, plan step 4.0c (batch C). The confirm bar now names the auto-chosen target ("Flips Charlotte.") or says there isn't one ("No legal target — it does nothing."), and highlights the auto-target on the board. Found and fixed a real pre-existing bug along the way: `stagePlay`'s auto-selected target for a "highest/lowest points" filter with multiple candidates picked the first one in raw board order, not the actual highest/lowest — now uses the engine's own `defaultSelect`. Verified the "no legal target" case live (Séance with no face-down cards); the named-target case is covered by new unit tests (`humanTurn.test.ts`, `cardText.test.ts`) exercising the same code path.

### PT-13: Face-down cards show an anonymous card back
- **Fixed:** 2026-09-12, plan step 4.0c (batch C). A dimmed name + printed points label now sits over the card-back art (`buildCardEl`'s face-down branch). Verified visually in the browser.

### PT-14: Match-over overlay doesn't show the Checks earned
- **Fixed:** 2026-09-12, plan step 4.0c (batch C). `MatchScreenOptions.previewResult` — a pure, read-only preview the caller supplies — renders a "+N Checks (+ reward card)" line on the match-over overlay; `main.ts` computes it by calling `recordPickupResult` on a loaded-fresh `PubState` and discarding the returned state. Verified live: "+7 Checks" (loss + first-game-of-day bonus) shown correctly.

### PT-22: The deciding round shows two overlays back to back
- **Fixed:** 2026-09-12, plan step 4.0c (batch C). `afterCommit` now checks `state.status === "complete"` before choosing round-reveal vs. match-over, so a match-ending round goes straight to the one overlay that matters; that round's own score line moved into `buildMatchOverOverlay`. Verified live: a real match ending on round 2 showed one overlay with "Round 2: You 6 — 8 Constable Tobias Mudd" folded in.

### PT-27: Modified points aren't distinguished from printed
- **Fixed:** 2026-09-12, plan step 4.0c (batch C). A face-up board card's points badge gets `card-points--boosted` (green) or `card-points--reduced` (grey) when its effective points differ from printed. Verified visually: two Friend cards buffed by each other showed green "4"s.

### PT-30: Nothing tells the player who leads a round or why
- **Fixed:** 2026-09-12, plan step 4.0c (batch C). The round-reveal overlay now names the next round's leader ("Sir Charles leads round 2."); House Rules' round-rules sentence about ties/wins now also states the leader-swap rule, still six sentences. Verified live.

### PT-2: Tutorial mats explaining the player's own play are overwritten ~0.9s later
- **Fixed:** 2026-09-12, plan step 4.0c (batch C). In tutorial mode, `scheduleNext()` now waits while `mat !== null`, and `dismissMat()` resumes it once the mat is cleared. Found and fixed a regression this same change introduced: the round-ending turn's own mat was never explicitly dismissed once the round-reveal/match-over overlay took over, which would have stalled the next round forever under the new gate — `afterCommit` now clears `mat` itself (tutorial mode only) when transitioning into either overlay. Verified live end to end: a mat now survives past `AI_DELAY_MS` until dismissed, and the house's next turn correctly fires once it is.

### PT-4: After "Take the deck," the deck builder shows thirteen empty, illegal slots
- **Fixed:** 2026-09-12, plan step 4.0d (batch D). `seedStarterDeckIfMissing` (`src/decks/deckStorage.ts`) seeds slot 1 with the starter composition, named "The Village Constable" and selected, whenever no slot is already legal and slot 1 is itself still empty — called both right at tutorial completion (`main.ts`'s `finishTutorial`) and as a boot-time backfill for a save that completed the tutorial before this fix existed (`bootAfterDedication`). Verified live: a fresh install's slot 1 reads "The Village Constable · 20/20 cards · 37/60 pts · Legal · Selected" the first time the builder opens.

### PT-1: The deck builder is not gated by what the player owns
- **Fixed:** 2026-09-12, plan step 4.0d (batch D). New `src/decks/ownership.ts`: owned = the starter deck's fixed quantities + `PubState.collection` (a `foil:` entry counts toward its base card). The deck builder's grid now shows "Owned: N" and caps "+" at `Math.min(owned, maxCopies)`; an unowned card renders dimmed with no +/− controls but stays zoomable (a wishlist) — design.md §14.3's Landlady "Reserved" case (plan step 3.5) folds into this same path, keeping only her specific note text as a per-card override. Also resolved the flagged "should base-60 cards become Bar-Bet-stakeable" question (`src/pub/barBet.ts`'s header): no — design.md's own wording is "stake one card from your collection," and `collection` has always specifically meant "owned beyond the base 60," so the existing behavior was correct, not a symptom of the missing ownership system. Verified live: an unowned Foundry card (Difference Engine) showed dimmed/no controls but zoomed correctly; a starter card (Constable on the Beat) showed "Owned: 2" with +/− capped at 2/2.

### PT-16: Deck-builder tiles carry no ability text and no zoom
- **Fixed:** 2026-09-12, plan step 4.0d (batch D), alongside PT-1/PT-17. New shared `src/ui/cardZoom.ts` (`buildCardZoomEl`/`buildCardZoomOverlay`, extracted from `matchScreen.ts`'s own card zoom per CLAUDE.md's 3.1 flagged duplication — not rewired into `matchScreen.ts` itself, that wasn't this fix's job) gives every deck-card-tile ability text and an `(i)` zoom button showing the full card. Verified live and via a new e2e test.

### PT-17: Pawnbroker tiles show name and rarity only
- **Fixed:** 2026-09-12, plan step 4.0d (batch D), same shared `cardZoom.ts` as PT-16. Pawnbroker tiles now show points, type, keyword chips, ability text, and a zoom button. Verified live and via a new e2e test.

### PT-24: There's no collection view
- **Fixed:** 2026-09-12, plan step 4.0d (batch D) — fell out of PT-1 exactly as predicted: an "Owned only" checkbox in the deck builder's filter row hides any card with zero owned copies. Verified live: checking it (all families) narrowed the grid from 60 to the 14 starter-deck cards a fresh player actually owns, with zero unowned tiles remaining.

### PT-5: The Birthday Invitational is spoiled on the chalkboard and House Rules
- **Fixed:** 2026-09-12, plan step 4.0e (batch E). Went with "hide entirely," not an unlabeled "by invitation" slate — the plan's own exit check ("Invitational invisible day 1") reads as already having settled this in favour of surprise over §10/§13.4's literal table-listing. Both `tournamentsScreen.ts`'s tournament list and `houseRulesScreen.ts`'s tournament table now skip the row entirely (name, date, and prize included) until `invitationalTriggered`. Verified live and via e2e (`tests/e2e/tournaments.spec.ts`, `tests/e2e/houseRules.spec.ts`): the row is fully absent before the date trigger and appears once it fires.

### PT-15: Hub navigation buries the thing to do next under five pub-slang buttons
- **Fixed:** 2026-09-12, plan step 4.0e (batch E). `pubHubScreen.ts`'s render order changed: "Tonight's patrons" now comes right after the header, before any button row. "The chalkboard" and "The back room" are now two-line subtitled tiles ("Tournaments" / "Lost & Found, Pawnbroker, Tinker's Bench"). "Save & data" sank to a small underlined link beside House Rules instead of its own row. Verified live at 402×874.

### PT-6: "You've been given the The Village Constable deck"
- **Fixed:** 2026-09-12, plan step 4.0e (batch E). `tutorialRewardScreen.ts`'s wording changed from "given the ${deckName} deck" to "given ${deckName}, and N Checks" — the deck name already carries its own "The". Verified live: "You've been given The Village Constable, and 10 Checks."

### PT-31: Checks are never introduced in-fiction
- **Fixed:** 2026-09-12, plan step 4.0e (batch E). `tutorialScript.ts`'s `TUTORIAL_AFTER_MAT` (Sir Charles's closing beer mat) now opens with "Checks. The pub's coin. The back room takes them." before its existing line. Verified live at the end of a full tutorial playthrough.

### PT-29: Card types (Character/Gadget/Scheme/Location/Headline) are never defined
- **Fixed:** 2026-09-12, plan step 4.0e (batch E). `houseRulesScreen.ts` gained a "Card types" section, one line each from design.md §3's table, using the same list styling as Keywords. Verified live and via e2e.

### PT-28: The second dedication beat is a text box on black
- **Fixed:** 2026-09-12, plan step 4.0e (batch E). The greeting beat now shows `background-the-taproom` behind the overlay and `portrait-sir-charles-wheatstone` above his line, same `--scene-bg` JS-set convention the pub hub/deck builder/back room already use. Verified live.

### PT-26: A Regular's first-win reward is buyable at the Pawnbroker before beating them
- **Fixed:** 2026-09-12, plan step 4.0e (batch E). `pawnbroker.ts`'s random-rotation fill now skips any opponent's reward card while that opponent's `rewardClaimed` is still false (a pawned copy already in `pawnedCards` is unaffected — it was earned once already). Two new tests in `pawnbroker.test.ts` pin both the exclusion and that the card can reappear once claimed.

### PT-23: Chalkboard "Lose: 10 Checks" reads as a penalty
- **Fixed:** 2026-09-12, plan step 4.0e (batch E). `tournamentsScreen.ts`'s prize line now reads "Consolation: N Checks" instead of "Lose: N Checks". Verified live.

### PT-21: The Bar Bet prompt interposes on every patron tap
- **Fixed:** 2026-09-12, plan step 4.0e (batch E). Tapping a patron row now always starts the match directly; a new opt-in "Bar bet" chip on the row (shown only when eligible) opens the stake overlay instead, via `event.stopPropagation()` so it doesn't also trigger the row's own tap. The overlay now names the opponent's actual bet-pool cards ("you'll take one of theirs — Charlotte, Telegraph Boy or Anonymous Tip") instead of "one of theirs". Verified live and via e2e (`tests/e2e/pubHub.spec.ts`).

### PT-20: The tutorial reward screen is a bare text box
- **Fixed:** 2026-09-12, plan step 4.0e (batch E). `tutorialRewardScreen.ts` now shows the same unwrap treatment as every other card reveal: a card-back-illustrated deck card with the deck's name, and a brass "Checks" disc, both animating in. Verified live at the end of a full tutorial playthrough.

### PT-19: Reveal cards render as a wide, short strip with the art cropped
- **Fixed:** 2026-09-12, plan step 4.0e (batch E). `.reveal-card` (`src/style.css`) now gets `aspect-ratio: 3/4`, same fix 3.2 already gave `.dedication-card`. Verified live: a Lost & Found pull's art now fills a proper portrait frame instead of a cropped strip.

### PT-18: The chalkboard never says what a tournament is
- **Fixed:** 2026-09-12, plan step 4.0e (batch E). `tournamentsScreen.ts` now prints "Three matches, single elimination, seven opponents drawn from the pool." under the title. Verified live.

### Notes #1/#2 (`wheatstone-bridge-bugfix-plan.md` cluster A): Bar Bet stakes a card instantly, with no stats and no way to back out
- **Fixed:** 2026-09-15, `wheatstone-bridge-bugfix-plan.md` cluster A. Split select from confirm: `src/pub/barBetSelection.ts` (new, unit-tested) holds a pure preview-selection state; tapping a card in `pubHubScreen.ts`'s stake overlay now only selects it for preview (full card detail via the shared `buildCardZoomEl`, same component the deck builder/match screen use) — a distinct "Stake {name}" button is what actually commits, and "Choose a different card" clears the preview without staking anything. Verified via new unit tests (`tests/unit/pub/barBetSelection.test.ts`) and e2e tests (`tests/e2e/pubHub.spec.ts`: select→preview→confirm, and cancel-with-no-bet-placed).

### Notes #3/#4/#5/#10/#11 (cluster B): Deck builder gives no reliable visual signal for family, rarity, or "already in this deck"
- **Fixed:** 2026-09-15, cluster B. `.deck-card-tile` already had a family-colored border (since plan step 2.2) — the actual gaps were rarity having zero visual channel, the "in deck" ring being a barely-visible 1px box-shadow, and no legend tying the family dropdown's names to its colors. Added: rarity texture on deck-card-tile (rivets/groove/gold-tint+shimmer, mirroring the full `.card` component's rarity treatment at a smaller scale) via a new `data-rarity` attribute; a clear "✓ In this deck" badge (`.deck-card-badge`) alongside the existing ring; a family-color legend row under the filters (`src/ui/familyColors.ts`, new and unit-tested, is the one place the family→color mapping is exhaustively checked). Also changed `.card[data-rarity="legendary"]` (src/style.css) so gold-leaf blends with family color via `color-mix` instead of overriding it outright — family and rarity no longer collide on the same channel for legendary cards either, per the bugfix plan's "Decisions already made." **Note #10 (Charlotte's family) resolved as no bug**: her `family: "yard"` matches design.md §8.3's own table exactly, and she renders with Yard's correct blue-grey border — confirmed live and pinned in a new e2e test. Verified via new unit tests (`tests/unit/ui/familyColors.test.ts`) and e2e tests (`tests/e2e/deckBuilder.spec.ts`).

### Note #12 (cluster C): Adding a card in the deck builder jumps the screen back to the top
- **Fixed:** 2026-09-15, cluster C. Every state change in `deckBuilderScreen.ts` does a full `root.replaceChildren()` rebuild, so the new `.deck-builder` element (the actual scroll container) always started at `scrollTop: 0`. `render()` now captures the outgoing screen's `scrollTop` and reapplies it to the incoming one. Verified via a new e2e test that scrolls partway down, clicks an enabled "+" by raw coordinates (so Playwright's own auto-scroll-into-view can't mask the bug), and asserts the scroll position barely moved.

### Note #7 (cluster D): House Rules scrolls on phone but not with a mouse wheel/trackpad
- **Fixed:** 2026-09-15, cluster D. `.house-rules-screen` was the one screen missing the `height: 100%; overflow-y: auto` every sibling screen (`.deck-builder`, `.pub-hub`, `.tournaments-screen`) already has — as a flex item of `#app` with no bound, it just overflowed unclipped. Verified via a new e2e test (shrunk viewport, wheel-scrolled, asserted it reaches the bottom content) run across all four Playwright browser projects (touch and non-touch).

### Note #6 (cluster E): The opponent's Instant (Scheme/Headline) card resolves and disappears too fast to read
- **Fixed:** 2026-09-15, cluster E. A Scheme/Headline resolves its On Play and discards in the same atomic `playTurn()` call (unchanged — design.md's On Play is instant, and the "stay on the table" preference was explicitly out of scope per the bugfix plan's own DESIGN CHECK). Added a UI-only hold instead: `afterCommit` (`src/ui/matchScreen.ts`) now detects when the card that just left the opponent's hand is a Scheme/Headline and shows a non-interactive "{opponent} plays…" overlay (full card detail) for `INSTANT_ANNOUNCE_MS` (1.3s) before moving on to the next turn/overlay. Scoped to the opponent's plays only — the human already sees their own card while staging/confirming it. Verified via a new e2e test (`tests/e2e/instantAnnounce.spec.ts`) that forces a deterministic scenario (a resumed match whose only legal AI move is Inspector's Warrant) and asserts the overlay stays up for a real beat and the effect actually resolved.

### Note #9 (cluster F): Hand doesn't refill after playing a card
- **Resolved as a communication gap, not a bug**, 2026-09-15, cluster F. design.md §6.1 ("if this isn't round 1, each player draws 3") is real and already correctly implemented (`startOfRound`, `src/engine/matchEngine.ts`) — hands *do* grow, just at round boundaries, not per turn, plus whatever a card's own Draw effect adds mid-round. Nothing in-game ever explained this. Added it to the House Rules page's round-structure sentence, still six sentences total (design.md §13.4). A draw-effect card (Police Whistle) is already in the starter deck at 2 copies, reachable in any normal game — no change needed there. Verified via a new e2e test.

### Note #13 (cluster G): Inspector's Warrant's "flip a card worth 3 or less" reads like it could flip more than one
- **Resolved as correct-as-implemented; copy clarified**, 2026-09-15, cluster G. design.md §8.3's printed text and its own tutorial narration ("Turn *a* card of mine face-down... Nicked" — singular) both confirm exactly one card flips; the engine already does this (`Effect.target.count` defaults to 1, and the only card that ever sets `count > 1` — The Reichenbach Falls — is an untargeted `endOfRound` trigger, never a human-staged pick). The printed card text itself is quoted verbatim from design.md and wasn't changed. What *was* genuinely ambiguous: the on-selection prompt just said "Choose a card to Flip" with no reminder there's only one. `effectPromptLabel` (`src/ui/cardText.ts`) now says "Choose one card to Flip" (and the equivalent for unflip/return/buff — every one of them also defaults to a single target). Verified via a new unit test pinning Inspector's Warrant's actual resolution against a board with two qualifying targets (exactly one flips, the higher-points one, per `defaultSelect`'s documented tiebreak) and an updated `cardText.test.ts` assertion.
