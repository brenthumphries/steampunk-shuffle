# Newcomer design review (plan step 3.7)

**Date:** September 12, 2026 · **Model:** Opus 5, one session · **Build reviewed:** `fd76e67` (3.6 done)
**Output:** the Phase 4 fix list at the bottom, mirrored item-for-item into
`PLAYTEST.md` (`PT-1`…`PT-32`) so plan step 4.5's "no P1 bugs" gate and
`ss-playtest` read one backlog.

## Method

1. **Played it cold.** Cleared storage and went through the whole
   first-30-minutes path in the browser at the 402×874 iPhone viewport:
   dedication → tutorial (all 18 turns) → pub hub → a real pickup match
   against Mudd (lost 1–2) → House Rules → the chalkboard → the back room
   (took the Lost & Found card) → the deck builder → the Bar Bet prompt (at a
   seeded 3 wins). Everything below marked *seen* was observed, not inferred
   from code.
2. **Measured the difficulty curve properly.** `docs/balance.md`'s
   starter-vs-Regular row is 15 games with the starter on the `regular`
   dial (a fumbling newcomer). Added `tools/curve.ts` (`npm run curve`):
   the starter deck vs every opponent on its own tier's dial, with the
   starter on either `regular` (newcomer) or `seasoned` (design.md §12.2's
   "played sensibly"), 40/30/12 games per opponent by tier. Deterministic
   seeds, so a re-tuning session can re-run the same table.
3. **Read design.md §5–§14 against what the app actually does.**

## What works

Worth saying first, because the fix list below is long and the game
underneath it is good:

- **The tutorial script lands.** Sir Charles's voice is exactly right, one
  idea per turn is the right dose, and after one match a newcomer genuinely
  knows points, rounds, Persist, Flip, Friend and un-flip. The forced-turn
  UI ("Play this one: …", only that card tappable) is unambiguous.
- **The stage-then-Play/Cancel flow** is the right amount of friction for a
  phone — no accidental plays, one extra tap.
- **The art carries the mood.** The snug behind the table, the portraits on
  the hub, the illustration under the card text — it reads as a place.
- **Mudd is calibrated.** Starter wins 40–55% against him depending on skill,
  which is precisely design.md §9.1's "Regulars lose ~40% to the starter
  played sensibly." He is the reference point every other deck should be
  tuned against.
- The round structure, the Checks display, the hint-chip idea, the House
  Rules page opening with the five house rules — all fine.

## Difficulty curve (`npm run curve`)

Starter deck win rate. "newcomer" = starter on the `regular` dial, "sensible"
= starter on `seasoned`. Opponent on its own tier's dial. Target column is
design.md §9.1–§9.3 / §12.2 restated as the *starter's* win rate.

| Tier | Opponent | Deck pts | newcomer | sensible | Target | Verdict |
|---|---|---|---|---|---|---|
| Regular | Constable Tobias Mudd | 42 | 40% | 55% | ~60% | ✅ reference |
| Regular | Old Nell Ashby | 28 | **98%** | **100%** | ~60% | ❌ free win (79/80 games) |
| Regular | "Dodgy" Reg Farrow | 32 | 73% | 90% | ~60% | ⚠️ easy |
| Regular | Miss Prudence Hollis | 32 | 50% | 83% | ~60% | ⚠️ easy once you know Friend |
| Seasoned | Inspector Bucket | 32 | 40% | 57% | ~40–45% | ✅ |
| Seasoned | Ada Lovelace | 58 | **3%** | **10%** | ~40–45% | ❌ a wall (4 wins in 70) |
| Seasoned | Irene Adler | 28 | 77% | 93% | ~40–45% | ❌ easier than a Regular |
| Seasoned | Charles Dickens | 32 | 37% | 63% | ~40–45% | ✅ |
| Legend | Sherlock Holmes | 38 | 42% | 58% | ~30% | ⚠️ coin flip |
| Legend | Professor Moriarty | 44 | 25% | 33% | ~30% | ✅ |
| Legend | Agatha Christie | 33 | 33% | 58% | ~30% | ⚠️ |
| Legend | Hercule Poirot | 40 | 25% | 42% | ~30% | ✅ |
| Legend | Dr Jekyll / Mr Hyde | 35 | **67%** | **67%** | ~30% | ❌ starter beats a Legend 2:1 |
| Legend | Mary Shelley | 52 | 33% | 50% | ~30% | ⚠️ |

(Legend rows are 12 games each, so ±15%; Jekyll's 16–7–1 over both runs and
Nell's 79/80 are well outside noise. Lovelace's per-round override in
`src/pub/opponents.ts` isn't applied here — she's on `seasoned` throughout —
so the real app is if anything harder.)

**The pattern is printed points, not tier.** Sort the table by deck points
and it *is* the difficulty ordering: 28-point decks (Nell, Adler) lose to the
37-point starter regardless of AI dial, 58 (Lovelace) crushes it, and the
tier labels don't track. v1's abilities as authored (one or two Flips per
game, a Draw here and there) are worth roughly 3–6 points over a match, so a
deck 9 points lighter than the starter can't make it up on tricks. That's
not a flaw in the *design* — §7.1's "abilities over vanilla" is about the
50–60-point endgame — but the "trickery" family decks were authored at 28–35
as if abilities carried more than they do.

**What "sensible" buys a player:** roughly +15 points of win rate across the
board (compare the two columns). That's a healthy skill gradient — the
game rewards learning — but it means every deck should be tuned against
the *sensible* column, not the newcomer one, or Regulars become pushovers
by match five.

**Recommended tier bands** (printed points, before per-deck ability
adjustments): Regular 38–42 · Seasoned 44–48 · Legend 48–54. Mudd (42,
Regular) is the proof this band works. Lovelace comes *down* to ~48;
Nell/Adler/Farrow/Hollis/Bucket/Dickens/Christie/Jekyll/Holmes go *up*.
`ss-card-author` + `npm run curve` per deck, exit check: sensible column
within ±10 of target for every opponent.

## First 30 minutes, as a newcomer

Timeline actually experienced: dedication (30s) → tutorial (~4 min) → hub →
Mudd (~4 min, lost) → wander the four other screens (~5 min). A real
newcomer then plays 3–5 more Regulars; at 3 wins Bucket, Bar Bet and the
Tinker's Bench appear; at 5 all Seasoned. Pacing-wise that's right. What
breaks it:

1. **The deck she's just been "given" isn't there.** "Take the deck. It was
   always going to be yours." → tap *Build a deck* → thirteen slots, every
   one "0/20 cards · Not legal," no Village Constable anywhere. The hub's
   "Deck: The Village Constable" is a fallback the builder doesn't show.
   (`PT-4`)
2. **The tutorial's teaching mats get overwritten before they can be read.**
   The player's own mat after each play ("A Flip. Turn a card of mine
   face-down… The warrant says 'three or less' — the cog's a one. Nicked.",
   ~45 words) is replaced ~0.9s later by the house's next-turn mat ("Nine.
   Sorry."). Seen on every one of the player's nine turns. The three most
   important lessons in the script — Flip, Friend, "big cards are big" —
   are the ones that get cut off. (`PT-2`)
3. **The final turn of every round is invisible.** The round-reveal overlay
   pops with the *next* round's already-cleared board behind it. "Fifteen. I
   did say sorry." lands on an empty table; the Séance un-flip that wins
   the tutorial is on screen for well under a second. (`PT-9`)
4. **Playing her own Location helped the opponent.** The Parsonage Snug is a
   starter-deck card (tutorial-locked, §8.3) whose printed text is "Each
   face-up Friend card gets +1" — the engine gives +1 to *every* face-up
   card on *both* sides (the known keyword-filter gap, `src/cards/data/
   README.md` #1). Seen: Mudd's Pike and Night Watchman went to 5 and 6 the
   turn I played it, and his Persisting cards kept the +1 into round 3. The
   card is a symmetric no-op at best and a self-own with Persist opponents
   at worst — and it's one of the 20 cards she starts with. (`PT-3`)
5. **Nothing in the deck builder is gated by what she owns.** Every one of
   the 60 cards has a live "+" from minute one. A curious newcomer builds a
   60-point Foundry pile before her second match and the Regulars fold
   (the curve table shows what a 58-point deck does). It also means
   Checks, Lost & Found, the Pawnbroker, Bar Bets and first-win rewards
   buy nothing she can't already add for free — the whole economy in
   §11 is decorative until this exists. Flagged since 2.2 as "not built
   yet"; from a newcomer's chair it's the single largest gap between the
   design and the app. (`PT-1`)
6. **The birthday surprise is printed on the chalkboard.** "The Birthday
   Invitational · Unlocks October 30 · Win: 500 Checks + The Landlady" is
   the fourth slate, visible from the first visit, and the House Rules page
   repeats it. design.md §14.6: "the dedication mentions nothing about it,
   so it's a surprise either way" — but §10/§13.4 say to list the
   tournament table. The two contradict; for a gift the surprise should
   win. (`PT-5`)

## Rules clarity — what a newcomer can't work out from the screen

- **Who leads and why.** No coin toss, no "Mudd leads" — the match opens
  with his card already on the table. House Rules promises "A coin toss
  decides who leads round 1." Round 2's leader swap is likewise silent.
  (`PT-11`, `PT-30`)
- **What an On Play will do before committing.** "Play Inspector's Warrant?"
  with one legal target auto-selects it but never says which. Should read
  "…Flips Charlotte." / "…no legal target, does nothing." (`PT-12`)
- **Which face-down card is which.** A flipped card is an anonymous card
  back. Both players saw it face-up, so hiding the name hides nothing —
  and it produced a real "I flipped Charlotte and she's still there at 3"
  moment (Mudd played his second copy next to the flipped one). Séance's
  "turn one of your face-down cards face-up" needs the names too. (`PT-13`)
- **Where modified points come from.** Charlotte reads "3" with no cue that
  1 of it is the Snug. A colour change for effective ≠ printed (green up,
  grey down) is the convention players know from MTG Arena/Gwent. (`PT-27`)
- **What a Scheme/Gadget/Headline is.** Types are printed on every tile and
  never defined anywhere, including House Rules. (`PT-29`)
- **Spent Schemes stay on the table as 0-point cards.** design.md §3:
  "One-shot: On Play, then it's spent." In play they sit on the board all
  round (visible clutter, "why is my Warrant worth 1 under the Snug?") and
  absorb "flip your own lowest-point card" effects — Cat Burglar / Abby
  Normal self-flips hit a spent Scheme first, which quietly deletes their
  drawback. Design question for Brent, not a bug. (`PT-25`)
- **What Checks are.** First mention is the tutorial reward ("…and 10
  Checks"), unexplained until House Rules. (`PT-31`)
- **Hint chips.** The Return chip fired in match 2 with no Return card
  anywhere on the table — Emily was *drawn* at the round break (the
  approximation 2.7 flagged). A hint that explains something the player
  can't see teaches the opposite of what it means. (`PT-10`)

## Match screen — phone ergonomics

- **The table uses 475 of 874 px.** `.match-screen { height: 100% }` inside
  `#app { min-height: 100dvh }` resolves to content height; the bottom
  45% of the phone is empty. (`PT-7`)
- **Hand cards are 58×78 px with 10.4 px text**, names truncate
  ("Consta… on the Beat", "Inspect… Warrant"), and a 6+-card hand — every
  round-3 hand — clips off the right edge with no scroll cue. All of that
  has 400 px of free height to grow into: bigger minis, wrap to two rows
  at 6+. (`PT-7`, `PT-8`)
- **No Checks on the match-over overlay.** "Mudd took the table" → leave →
  the hub quietly says 17. The +2 / +5-daily / +8-win should land on the
  overlay where the result is. (`PT-14`)
- **Two overlays for the deciding round** ("Round 3: You took the round" →
  Continue → "You took the table"). (`PT-22`)

## Hub, builder, back room

- **Five pub-slang buttons above the patrons**: "The chalkboard" and "The
  back room" mean nothing yet; "Save & data" sits in the top row of a
  gift; House Rules orphans onto a third row; the thing she should do
  next (tap a patron) is below all of it. Subtitle the rooms, sink Save &
  data, patrons first. (`PT-15`)
- **Deck-builder and Pawnbroker tiles carry no ability text and no zoom** —
  "Anonymous Tip · Scheme · uncommon" is all you get before spending 35
  Checks on it. The match screen's `(i)` zoom exists; the tiles need it
  (the shared card-element builder 3.1 already wanted). (`PT-16`, `PT-17`)
- **"Added to your collection" — where?** There's no collection view;
  the card surfaces only as a "+"-able tile in a builder that already
  offers every card. Falls out of `PT-1` once tiles show owned counts.
  (`PT-24`)
- **Reveal cards render as a wide strip** (Lost & Found, first-win) — the
  `.card--zoom` sizes-off-content issue the dedication card already had
  fixed. (`PT-19`)
- **"the The Village Constable deck"** on the tutorial reward screen; the
  screen itself is a bare text box where design.md wants an unwrap.
  (`PT-6`, `PT-20`)
- **Bar Bet prompts on every patron tap** once she owns a single extra
  card — an extra modal per match for the rest of the game. Make it an
  opt-in chip on the row. (`PT-21`)
- Chalkboard "Lose: 10 Checks" reads as a fine, not a consolation
  (`PT-23`), and nothing on it says a tournament is three matches,
  single elimination (`PT-18`). · Nell's Basket — a first-win reward — is in the Pawnbroker
  window for 90 Checks before she's beaten Nell. (`PT-26`) · Sir Charles's
  "You're expected" beat is a text box on black; his portrait exists.
  (`PT-28`)

## Phase 4 fix list

Severity uses `ss-playtest`'s scale, read for a gift with a fixed date:
**P1** = ship-blocking for October 30 (the game is not what design.md says
it is, or the gift moment is damaged) · **P2** = a newcomer will hit it and
be confused or misled · **P3** = polish. Batched by who should do them
(plan §2 model discipline); each batch is one session.

| Batch | Items | Model | Exit check |
|---|---|---|---|
| **A. Re-point the opponent decks** | PT-32 (all 13 non-Mudd decks to the tier bands above; Nell, Lovelace, Adler, Jekyll first) | Haiku via `ss-card-author`, `npm run curve` after each | Every opponent's *sensible* column within ±10 of target; `npm run sim` no card-lift outliers |
| **B. Engine** | PT-3 (`hasKeyword` in `TargetFilter` → Snug, Landlady, Engagement print-accurate), PT-10 (precise Return detection), PT-25 (discard Schemes/Headlines after On Play) | Sonnet | Unit tests per rules-text block; `tutorialScript.test.ts` still pins 9-6/7-15/7-6 |
| **C. Tutorial + match screen** | PT-2, PT-9, PT-7, PT-8, PT-11, PT-12, PT-13, PT-14, PT-22, PT-27, PT-30 | Sonnet | Replay tutorial cold: every mat readable, every round's final board seen; hand of 8 fully visible at 402×874 |
| **D. Ownership** | PT-1, PT-4, PT-16, PT-17, PT-24 (owned = starter composition + `collection`; `+` capped at owned copies; unowned tiles dimmed with zoom; seed slot 1 on tutorial completion) | Sonnet | Fresh install: builder shows "The Village Constable" selected; no unowned card addable; existing Landlady special case folded in |
| **E. Hub + gift touches** | PT-5, PT-6, PT-15, PT-18, PT-19, PT-20, PT-21, PT-23, PT-26, PT-28, PT-29, PT-31 | Haiku | Invitational invisible until triggered; a fresh player can name what each hub button opens |

## Decisions made

- **PT-5 (Batch E):** Hide the Invitational until Oct 30. The gift surprise takes precedence over §10's tournament table listing.
- **PT-25 (Batch B):** Discard Schemes/Headlines after On Play. Matches §3's "then it's spent" and fixes the self-flip loophole where spent cards absorb effects meant for other targets.
- **PT-32 (Batch A):** Adopt the recommended tier bands (Regular 38–42 · Seasoned 44–48 · Legend 48–54), including moving Lovelace *down* to ~48 points. Mudd (42, Regular) is the proof this band works.

Everything else is implementation.
