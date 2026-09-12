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

### PT-32: Opponent decks are tuned by accident — printed points, not tier, decide who wins
- **Seen:** 2026-09-12 (x1) — `npm run curve`, 40/30/12 games per opponent
- **Note:** Starter deck "played sensibly" (`seasoned` dial) wins 100% vs Nell Ashby (28 pts), 93% vs Irene Adler (28, Seasoned), 67% vs Dr Jekyll / Mr Hyde (35, a Legend), and 10% vs Ada Lovelace (58, Seasoned). Mudd (42 pts) is the only deck that lands on design.md §9.1's target. Full table in `docs/newcomer-review.md`.
- **Repro:** `npm run curve -- regular seasoned`, `-- seasoned seasoned`, `-- legend seasoned`.
- **Fix:** re-point every non-Mudd deck to a tier band (Regular 38–42 · Seasoned 44–48 · Legend 48–54), Lovelace *down*; re-run `curve` after each; exit when the sensible column is within ±10 of design.md's target for every opponent. Batch A. Bands need Brent's nod first.
- **Likely location:** `src/cards/data/decks/*.ts` (via `ss-card-author`)

### PT-5: The Birthday Invitational is spoiled on the chalkboard and House Rules
- **Seen:** 2026-09-12 (x1)
- **Note:** Fourth slate on the chalkboard reads "The Birthday Invitational · Unlocks October 30 · All six Legends + Sir Charles · Win: 500 Checks + The Landlady" from the very first visit; House Rules' tournament table repeats it. design.md §14.6 wants it to be a surprise ("the dedication mentions nothing about it"); §10/§13.4 say to list the table. Contradiction — for a gift, surprise should win. **Brent's call.**
- **Repro:** fresh install → finish tutorial → The chalkboard.
- **Likely location:** `src/ui/tournamentsScreen.ts`, `src/ui/houseRulesScreen.ts` (hide until `invitationalTriggered`, or show an unlabeled "by invitation" slate)

### PT-4: After "Take the deck," the deck builder shows thirteen empty, illegal slots
- **Seen:** 2026-09-12 (x1)
- **Note:** Tutorial ends "Take the deck. It was always going to be yours." Hub says "Deck: The Village Constable". *Build a deck* → Deck 1…13, all "0/20 cards · Not legal", no Village Constable listed. The hub's deck name is a fallback the builder never shows. (2.2 flagged "13 slots start genuinely empty" as a judgment call; the tutorial's fiction now makes it wrong.)
- **Repro:** fresh install → tutorial → Build a deck.
- **Fix:** seed slot 1 with the starter composition, named "The Village Constable", selected, when the tutorial completes (and for existing saves with no legal slot). Batch D.
- **Likely location:** `src/decks/deckStorage.ts` default state, `src/main.ts` tutorial-completion path


### PT-2: Tutorial mats explaining the player's own play are overwritten ~0.9s later
- **Seen:** 2026-09-12 (x1), every one of the player's nine turns
- **Note:** After tapping the scripted card, its mat ("A Flip. Turn a card of mine face-down. It's worth nothing now…" ~45 words) shows, then `AI_DELAY_MS` later the house plays and its mat ("Nine. Sorry.") replaces it. The three most important lessons — Flip, Friend, "Big cards are big" — are the ones cut off. Not a §13.1 "blocking a legal move" concern: the house's turn isn't the player's move.
- **Repro:** fresh install → tutorial → play Constable on the Beat → watch the mat.
- **Fix:** in tutorial mode, `scheduleNext()` waits while `mat !== null` (the same way it already waits on `introQueue`) and `dismissMat()` calls `scheduleNext()`; or auto-advance after a reading-time delay (~words × 250 ms). Batch C.
- **Likely location:** `src/ui/matchScreen.ts` `scheduleNext` / `dismissMat` / `handleHandTap`

### PT-1: The deck builder is not gated by what the player owns
- **Seen:** 2026-09-12 (x1)
- **Note:** Every one of the 60 cards has a live "+" from the first minute; a newcomer can build a 60-point Foundry deck before match two (and the curve table shows a 58-point deck beats the starter 90%+). Checks, Lost & Found, the Pawnbroker, Bar Bets and first-win rewards buy nothing that isn't already free, so design.md §11's economy and §12.2's "I need better cards" moment never happen. Flagged as unbuilt since 2.2/2.3/2.4/2.5/2.6; from a newcomer's chair it's the largest gap between design.md and the app.
- **Repro:** fresh install → tutorial → Build a deck → Deck 1 → tap "+" on Difference Engine.
- **Fix:** owned = starter composition + `PubState.collection` (with `foil:` entries); tiles show "owned n"; "+" capped at owned copies; unowned tiles dimmed but zoomable (a wishlist); fold in 3.5's Landlady "Reserved" special case; decide whether base-60 cards become Bar-Bet-stakeable (`src/pub/barBet.ts` header). Batch D.
- **Likely location:** `src/decks/deckSlots.ts`, `src/ui/deckBuilderScreen.ts`, `src/pub/pubState.ts`

## P2 — Bug

### PT-17: Pawnbroker tiles show name and rarity only
- **Seen:** 2026-09-12 (x1)
- **Note:** "Cracksman · uncommon · Take my Checks — 35": no points, type, ability or art before spending two days of Checks on it.
- **Repro:** The back room → The Pawnbroker.
- **Likely location:** `src/ui/acquisitionScreen.ts` (`backroom-tile`) — same shared card-tile builder as PT-16

### PT-16: Deck-builder tiles carry no ability text and no zoom
- **Seen:** 2026-09-12 (x1)
- **Note:** "Anonymous Tip · Scheme · uncommon" is all a tile says; keywords appear but On Play text doesn't, and there's no `(i)` like the match screen has. A newcomer can't choose between two Schemes.
- **Repro:** Build a deck → any slot.
- **Fix:** extract the `.card` element builder `matchScreen.ts`/`acquisitionScreen.ts`/`bracketScreen.ts`/`pubHubScreen.ts` each hand-roll (3.1 already wanted this) and give tiles the zoom.
- **Likely location:** `src/ui/deckBuilderScreen.ts` (`deck-card-tile`), `src/ui/cardText.ts`

### PT-15: Hub navigation buries the thing to do next under five pub-slang buttons
- **Seen:** 2026-09-12 (x1)
- **Note:** "Build a deck / The chalkboard / The back room / Save & data / House Rules" sit above Tonight's patrons; "chalkboard" and "back room" mean nothing to a newcomer, "Save & data" is in the top row of a gift, House Rules orphans onto a third row.
- **Repro:** pub hub.
- **Fix:** subtitle each ("The chalkboard · tournaments", "The back room · Lost & Found, Pawnbroker, Tinker's Bench"), put patrons first, sink Save & data under House Rules.
- **Likely location:** `src/ui/pubHubScreen.ts`, `src/style.css` `.pub-hub-deck-row`

### PT-14: Match-over overlay doesn't show the Checks earned
- **Seen:** 2026-09-12 (x1)
- **Note:** "Constable Tobias Mudd took the table" → Leave the table → the hub quietly reads 17 Checks. The +2 loss / +5 first-game-today (and +8/+15/+30 win, and the reward card) should land on the overlay where the result is.
- **Repro:** finish any pickup match.
- **Likely location:** `src/ui/matchScreen.ts` match-over overlay; `recordPickupResult` delta from `src/pub/pubState.ts` (main.ts computes it after `onExit` — would need to be previewed before, or shown on the hub as a toast)

### PT-13: Face-down cards show an anonymous card back
- **Seen:** 2026-09-12 (x1)
- **Note:** Both players saw the card face-up before it was flipped, so hiding the name hides nothing. Produced a real "I flipped Charlotte and she's still there at 3" moment — Mudd played his second Charlotte beside the flipped one. Séance's "turn one of your face-down cards face-up" needs the names too.
- **Repro:** any Flip.
- **Fix:** dimmed name + printed points label over the card back.
- **Likely location:** `src/ui/matchScreen.ts` `buildCardEl` (face-down branch), `src/style.css`

### PT-12: Auto-targeted On Play never says what it will hit
- **Seen:** 2026-09-12 (x1)
- **Note:** "Play Inspector's Warrant?" with a single legal target commits without naming it; with zero legal targets it plays as a 0-point nothing with no warning.
- **Repro:** stage Inspector's Warrant against a board with one card ≤3.
- **Fix:** "Play Inspector's Warrant? Flips Charlotte." / "…no legal target — it does nothing." on the confirm bar; highlight the auto-chosen target.
- **Likely location:** `src/ui/matchScreen.ts` action bar, `src/match/humanTurn.ts` `isReadyToConfirm`

### PT-11: No coin toss — the match opens with the opponent's card already on the table
- **Seen:** 2026-09-12 (x1)
- **Note:** design.md §6.1 "Sir Charles's sovereign is tossed… (animated coin)"; House Rules promises "A coin toss decides who leads round 1"; §15 has "Game on." for the result screen. In the app nothing is shown; a newcomer wonders why Mudd went first.
- **Repro:** start any pickup match.
- **Fix:** a one-beat overlay before turn 1 ("Heads. Mudd leads." / "Tails. You lead." + "Game on."), plus the same for round 2/3 leader changes (see PT-30).
- **Likely location:** `src/ui/matchScreen.ts` (a `coin-toss` phase before the first `scheduleNext`)

### PT-9: The round-reveal overlay appears over the already-cleared next-round board
- **Seen:** 2026-09-12 (x1), every round
- **Note:** The final play of a round is on screen for well under a second before the overlay, and the board behind the overlay is the *next* round's (cleanup already run). "Fifteen. I did say sorry." lands on an empty table; the tutorial's winning Séance un-flip is barely visible.
- **Repro:** finish any round.
- **Fix:** keep a pre-cleanup snapshot of the board for the overlay's backdrop (or delay the overlay ~1.2 s with the final board shown and the score updated).
- **Likely location:** `src/ui/matchScreen.ts` `afterCommit` → `round-reveal` phase, `buildRoundRevealOverlay`

### PT-8: A 6+-card hand clips off the right edge with no scroll cue
- **Seen:** 2026-09-12 (x1)
- **Note:** Round 3 hands are routinely 7–8 cards; the row scrolls horizontally (`overflow-x: auto`) but iOS shows no scrollbar and the cut-off card is the only affordance. Two cards were fully hidden.
- **Repro:** reach round 3 with an unplayed draw.
- **Fix:** wrap to two rows at 6+ (there's 400 px of free height, see PT-7) or add edge fades.
- **Likely location:** `src/style.css` `.hand-row`

### PT-7: The match screen uses 475 of 874 px; hand cards are 58×78 px with 10.4 px text
- **Seen:** 2026-09-12 (x1)
- **Note:** `.match-screen { height: 100% }` inside `#app { min-height: 100dvh }` resolves to content height, so the bottom 45% of the phone is empty while hand-card names truncate ("Consta… on the Beat", "Inspect… Warrant", "Night Watch…").
- **Repro:** any match at 402×874.
- **Fix:** `#app { height: 100dvh; display: flex; flex-direction: column }`, `.match-screen { flex: 1; min-height: 0 }`, then grow `.card--mini` ~1.5× and bump its font to ≥12 px.
- **Likely location:** `src/style.css` `#app`, `.match-screen`, `.card--mini`

### PT-6: "You've been given the The Village Constable deck"
- **Seen:** 2026-09-12 (x1)
- **Note:** Double "the" on the tutorial reward screen — the one screen every player sees exactly once, at the gift moment.
- **Repro:** finish the tutorial.
- **Likely location:** `src/ui/tutorialRewardScreen.ts` (deck name already carries "The")

## P3 — Balance / polish / idea

### PT-31: Checks are never introduced in-fiction
- **Seen:** 2026-09-12 (x1)
- **Note:** First mention is the tutorial reward ("…and 10 Checks"), cold; House Rules explains later. One closing mat line would do: "Checks. The pub's coin. The back room takes them."
- **Likely location:** `src/tutorial/tutorialScript.ts` (`matchEndMat` / reward screen)

### PT-30: Nothing tells the player who leads a round or why
- **Seen:** 2026-09-12 (x1)
- **Note:** House Rules' six sentences omit design.md §6.2.4 ("whoever did not take the previous round leads"); in-match, the leader swap is silent. Pairs with PT-11.
- **Likely location:** `src/ui/houseRulesScreen.ts`, `src/ui/matchScreen.ts` round-reveal overlay ("Mudd leads round 2")

### PT-29: Card types (Character/Gadget/Scheme/Location/Headline) are never defined
- **Seen:** 2026-09-12 (x1)
- **Note:** Printed on every builder/Pawnbroker tile, absent from House Rules and the tutorial. One line each from design.md §3's table.
- **Likely location:** `src/ui/houseRulesScreen.ts`

### PT-28: The second dedication beat is a text box on black
- **Seen:** 2026-09-12 (x1)
- **Note:** "You're expected. Your chair's by the fire." — Sir Charles, before the player has any idea who that is. `portrait-sir-charles-wheatstone` and `background-the-taproom` exist; put a face and the room behind the line.
- **Likely location:** `src/ui/dedicationScreen.ts`

### PT-27: Modified points aren't distinguished from printed
- **Seen:** 2026-09-12 (x1)
- **Note:** Charlotte reads "3" under the Snug with no cue that 1 is a buff. Green-when-above / grey-when-below printed is the convention players know from MTG Arena and Gwent, and it makes Friend/Location effects visible without a tooltip.
- **Likely location:** `src/ui/matchScreen.ts` `buildCardEl` points badge, `src/style.css`

### PT-26: A Regular's first-win reward is buyable at the Pawnbroker before beating them
- **Seen:** 2026-09-12 (x1)
- **Note:** Nell's Basket in the window for 90 Checks on day one. Not wrong, but it makes the "First win: Nell's Basket" promise on her patron row a duplicate. Consider excluding unearned reward cards from the rotation.
- **Likely location:** `src/pub/pawnbroker.ts` pool, `src/pub/acquirableCards.ts`

### PT-24: There's no collection view
- **Seen:** 2026-09-12 (x1)
- **Note:** "Added to your collection." — the card then exists only as a "+"-able tile in a builder that already offers everything. Falls out of PT-1 once tiles show owned counts; an "owned" filter on the builder grid would cover it.
- **Likely location:** `src/ui/deckBuilderScreen.ts` filters

### PT-23: Chalkboard "Lose: 10 Checks" reads as a penalty
- **Seen:** 2026-09-12 (x1)
- **Note:** It's the consolation. "Knocked out: 10 Checks back" or "Consolation: 10 Checks".
- **Likely location:** `src/ui/tournamentsScreen.ts`

### PT-22: The deciding round shows two overlays back to back
- **Seen:** 2026-09-12 (x1)
- **Note:** "Round 3: You took the round" → Continue → "You took the table". One overlay for a match-ending round.
- **Likely location:** `src/ui/matchScreen.ts` `afterCommit` / `continueAfterRoundReveal`

### PT-21: The Bar Bet prompt interposes on every patron tap
- **Seen:** 2026-09-12 (x1, at seeded 3 wins)
- **Note:** Once the player owns any extra card, every tap on an eligible patron opens "Stake a card against…?" with three buttons — an extra modal per match for the rest of the game. Make it an opt-in "Bar bet" chip on the patron row, and show which cards the opponent stakes ("one of theirs" is unnamed).
- **Likely location:** `src/ui/pubHubScreen.ts` `buildStakeOverlay`

### PT-20: The tutorial reward screen is a bare text box
- **Seen:** 2026-09-12 (x1)
- **Note:** design.md §13.2 "the reward reveal gives the player the starter deck formally… and 10 Checks" — the same unwrap the first-win reveal has, with the card back / a fanned starter and a brass Checks disc, would make it a moment.
- **Likely location:** `src/ui/tutorialRewardScreen.ts`

### PT-19: Reveal cards render as a wide, short strip with the art cropped
- **Seen:** 2026-09-12 (x1), Lost & Found
- **Note:** `.card--zoom` sizes off content; the dedication card already got `aspect-ratio: 3/4` for this (3.2). Apply the same to `.reveal-card`.
- **Likely location:** `src/style.css` `.reveal-card`

### PT-18: The chalkboard never says what a tournament is
- **Seen:** 2026-09-12 (x1)
- **Note:** Nothing on it says "three matches, single elimination, seven opponents from the pool" (design.md §10). One line under the title.
- **Likely location:** `src/ui/tournamentsScreen.ts`

## Known / already flagged (not filed as new)

### All nine tutorial turns are forced (design.md §13.1 says six of nine)
- **Seen:** 2026-09-12 — matches CLAUDE.md's 2.7 judgment call; from a newcomer's chair forcing all nine is fine, not a problem.

### Opponent hand shown as "Hand: N", not a fanned stack
- **Seen:** 2026-09-12 — matches CLAUDE.md's 2.1 note; reads fine.

## Resolved

(moved here by whoever fixes an item — not touched by this skill)

### PT-3: The Parsonage Snug buffs every card on both sides, not Friend cards
- **Fixed:** 2026-09-12, plan step 4.0b (batch B). `TargetFilter.hasKeyword` added and honoured in `matchesFilter`; The Parsonage Snug, The Season's Most Talked-About Engagement, and The Landlady all now filter on `hasKeyword: "friend"`, matching their printed text. See CLAUDE.md's 4.0b entry.

### The Landlady buffs herself (+1 overstatement)
- **Fixed:** 2026-09-12, plan step 4.0b — fixed for free by PT-3's `hasKeyword` fix. The Landlady carries no Friend keyword herself, so the tighter filter already excludes her from her own buff; no separate `sourceInstanceId` exclusion was needed.

### PT-10: The Return hint chip fired with no Return card anywhere on the table
- **Fixed:** 2026-09-12, plan step 4.0b (batch B). `captureHintSnapshot`/`afterCommit` (`src/ui/matchScreen.ts`) now diff "on board, face-up, had Return before this turn" against "in hand after," per side, instead of checking either hand for any Return-keyword card at all.

### PT-25: Spent Schemes and Headlines stay on the table as 0-point cards
- **Fixed:** 2026-09-12, plan step 4.0b (batch B), after confirming the rules-change call with Brent (discard, per design.md §3's "then it's spent"). `resolvePlay` (`src/engine/matchEngine.ts`) now discards a Scheme/Headline right after its On Play effects resolve.
