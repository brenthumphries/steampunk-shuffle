# Card content module (plan step 1.5)

The canonical source for every real card in the game. `tools/sim.ts`, the
engine/AI/card test suites, and eventually the app all import from here —
see `index.ts`'s `ALL_CARDS`.

Authored and maintained by the `ss-card-author` skill
(`.claude/skills/ss-card-author/`). Read that skill before adding a card —
it covers the engine's effect/trigger vocabulary and what isn't buildable.

## Composition tally (design.md §8.1: 60 total)

| Slice | File | Count | Status |
|---|---|---|---|
| Yard | `families/yard.ts` | 9 | done |
| Irregulars | `families/irregulars.ts` | 9 | done |
| Rookery | `families/rookery.ts` | 9 | done |
| Foundry | `families/foundry.ts` | 9 | done |
| Salon | `families/salon.ts` | 9 | done |
| Locations | `locations.ts` | 8 (4 U / 4 R) | done |
| Legend signatures | `legends.ts` | 6 | done |
| The Landlady | `landlady.ts` | 1 | done |
| **Total** | | **60** | |

Rarity split across the 45 family cards lands at 19 Common / 16 Uncommon /
10 Rare against design.md §8.1's 20/15/10 target — close by design, not
gated by the validator (`validateCard`/`validateDeck` are purely
structural; they don't check rarity ratios).

Opponent reward cards for the four Regulars (Sergeant Pike, Nell's Basket,
Reg's Ledger, Miss Hollis, Authoress) are folded into their family's 9
slots. Seasoned reward cards (Bucket's Forefinger, The Analytical Engine,
The Photograph, Next Instalment) are authored too, but as extras living in
their opponent's own deck file rather than a labeled-60 slot — see
`decks/README.md`.

## Known engine-schema gaps (found while authoring v1)

Discovered writing cards against `docs/design.md`'s literal text; each is
called out inline as a comment on the affected card. Listed here so they
don't get silently rediscovered, and so a future engine patch has a ready
punch list:

1. ~~**`TargetFilter` can't check for a keyword**~~ — **fixed, plan step
   4.0b (batch B).** `TargetFilter.hasKeyword` (`src/cards/cardTypes.ts`)
   checks for a keyword's presence on a face, honoured in `matchesFilter`
   (`src/engine/matchEngine.ts`), which `continuousBuffMap` already calls.
   `The Parsonage Snug`, `The Season's Most Talked-About Engagement`, and
   `The Landlady` now all filter on `hasKeyword: "friend"`, matching their
   printed "each/every face-up Friend card" text exactly — and since The
   Landlady carries no Friend keyword herself, this also closed gap #5
   (she no longer buffs herself) for free, with no separate self-exclusion
   needed. `The Overnight Express` still doesn't say "has Persist" — its
   rework is tangled with gap #3 (no Location controller), not just the
   keyword gap, and wasn't touched here.
2. **`draw` has no `target`/`side`.** "Each player draws N" can't be
   written as one ability; it always resolves for the ability's
   controller only. Affects `Good News, Everybody!` (both the Irregulars
   headline and, per design.md §15, in spirit) and `Party Time.
   Excellent.` — both implemented self-only.
3. **A Location has no controller**, so `self`/`opponent`/`each` all
   resolve to *both players combined* for a Location ability
   (`sideToOwners` in `matchEngine.ts`). A Location cannot say "each
   player does X to their own board" distinct from "do X to a pool
   combined across both boards." Affects `The Reichenbach Falls`
   (Moriarty) and `The Overnight Express` (Christie) — both design.md
   §9.3 originals said "each player, their own"; both are reworded here to
   a combined-pool effect that's actually buildable. Overnight Express
   additionally needed a "Persist cards are discarded instead of staying"
   effect kind that doesn't exist at all (end-of-round Persist handling is
   hardcoded, not exposed to card text) — replaced with a Flip effect in
   the same spirit.
4. **No cross-effect target chaining.** Two effects in one ability each
   pick targets independently; you can't say "unflip a card, then buff
   *that* card." Affects `Mary Shelley` — dropped the printed "+2 this
   round" clause, kept the unflip.
5. ~~**No self-exclusion for continuous buffs.**~~ — **fixed for free by
   #1's `hasKeyword` fix (batch B)**: The Landlady carries no Friend
   keyword herself, so filtering her buff on `hasKeyword: "friend"`
   already excludes her without a dedicated `sourceInstanceId` exclusion
   in `continuousBuffMap`. That general exclusion still doesn't exist —
   only worth adding if a future continuous-buff card's filter would
   otherwise match its own card.
6. **No "grant a keyword until end of round" effect.** Blocks design.md
   §15's Dodgeball easter egg (Rookery Scheme *The Five D's*, "gains
   Elusive until end of round") entirely — not authored in v1.
7. **No conditional ("if opponent has X") effects at all.** Blocks
   design.md §15's *We're Not Worthy* (Salon: "if your opponent has a
   legendary face-up, Draw 2") — not authored in v1.

None of these block plan step 1.5's exit check (cards pass `validateCard`,
which is structural only) — they're gaps between the shipped 1.1/1.2
engine and design.md's more ambitious card text, worth a look next time
the engine gets touched.
