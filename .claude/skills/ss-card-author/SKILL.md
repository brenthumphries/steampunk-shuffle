---
name: ss-card-author
description: >-
  Author a Steampunk Shuffle card, batch of cards, or opponent deck: emits
  the card in the schema (src/cards/cardTypes.ts), checks the point budget
  against the family's curve (design.md §4), writes in-world flavour text,
  validates it, and adds it to the content module (src/cards/data/). Use
  when asked to add a card, author a family's card set, build an opponent
  deck, or work on plan step 1.5. Given a family and a role ("a 3-point
  Aeronaut with a draw effect") it produces a ready-to-add card.
model: haiku
---

# ss-card-author

Turns a card idea into a validated `Card` object in
[`src/cards/cardTypes.ts`](../../../src/cards/cardTypes.ts)'s schema, added
to the right file in [`src/cards/data/`](../../../src/cards/data/) — the
canonical content module for every real card and deck in the game (tools,
tests, and eventually the app all read from here; see
[`src/cards/data/README.md`](../../../src/cards/data/README.md)).

Runs on **Haiku** (plan §2 rule 3: deterministic-shaped work — filling a
known schema against known rules — doesn't need a bigger model). Escalate
to Sonnet only if the same card fails validation or a design-fit judgment
call twice.

## Before authoring anything

Read, in this order:
1. `docs/design.md` §3–§5 (card anatomy, keywords, rules text — the engine
   vocabulary you're allowed to use)
2. `docs/design.md` §4 (family playstyles, signature keywords, points
   curves) and §7 (rarity design rules, printed-point ranges)
3. `docs/design.md` §8–§9 (composition targets, locked tutorial cards,
   opponent rosters and reward/signature cards) if authoring for the v1 set
4. `src/cards/data/README.md` for the current tally (how many of each
   family/rarity exist, what's locked, what's already spoken for)
5. `docs/design.md` §2 and §15 for flavour-writing rules and the
   easter-egg register

## The engine vocabulary — don't design past it

The rules engine (plan step 1.2, already shipped) resolves a fixed,
tested set of triggers and effects. A card ability **must** be expressible
in this vocabulary or it will validate structurally but do the wrong thing
(or nothing) in play:

- **Triggers**: `onPlay`, `continuous`, `startOfRound`, `endOfRound`. There
  is no "whenever a card is played" trigger and no conditional
  ("if opponent has X") trigger — design.md §5.13 says as much.
- **Effects**: `flip`, `unflip`, `return`, `draw`, `discardRandom`,
  `reveal`, `discardLocation`, `buff`, `steal` (reserved, unresolved).
- **`draw` has no target/side** — it always draws for whoever's ability is
  resolving. **"Each player draws N" cannot be written as a single
  ability** in the current schema. If you want that effect, either scope
  it to the controller only (and say so in a comment) or flag it instead
  of quietly writing a card whose flavour text overpromises.
- **`TargetFilter` cannot check for a keyword** (no "has Friend", "has
  Persist", "is legendary"). "Each face-up Friend card gets +N" is not
  literally expressible — the existing precedent (`The Parsonage Snug`,
  `src/cards/data/families/salon.ts`) approximates it as "each face-up
  card on that side", which over-applies versus the card's own printed
  text. Follow that precedent for consistency rather than inventing a new
  workaround, and don't add a fourth variant of the same approximation
  without saying so.
- **A Location has no controller.** `sideToOwners` resolves `self`,
  `opponent`, and `each` identically to *both players* for a Location
  ability (see `matchEngine.ts`), so a Location cannot say "each player
  does X to their own board" distinctly from "do X to a pool combined
  across both boards." Write Location abilities in terms of the combined
  pool (`side: "each"`, `count: N`, `highestPoints`/`lowestPoints`), not
  "your side vs their side." A card played by a *player* (Character,
  Gadget, Scheme, Headline) **does** have a real controller, so `self` /
  `opponent` do work correctly there.
- **No cross-effect target chaining.** Two effects in one ability's array
  each pick their own targets independently — you cannot say "unflip a
  card, then give *that same card* +2." If a card's design needs that,
  drop the second clause rather than build something that only works by
  coincidence.
- **`Effect` has no "grant a keyword until end of round" kind.** ("gains
  Elusive until end of round" — not buildable.)

When a card idea in `docs/design.md` needs any of the above, don't bend
the engine schema to fit — that's out of scope for this skill (it would
mean reopening 1.1/1.2, already shipped and tested). Simplify the card,
note the simplification in a one-line code comment next to the card, and
add it to `src/cards/data/README.md`'s "Known engine-schema gaps" list so
it surfaces for a real fix later instead of getting silently rediscovered.

## Procedure

### Single card ("a 3-point Aeronaut with a draw effect")

1. **Pick the family and check the curve.** Look up the family's target
   average Character points (design.md §4) and how many of that family's
   9 v1 slots (`src/cards/data/README.md`) are already filled, by type
   (6 Character / 1 Gadget / 1 Scheme / 1 Headline) and rarity (aim near
   4 Common / 3 Uncommon / 2 Rare, but the validator doesn't enforce this
   — it's a target, not a gate).
2. **Pick rarity by what the card does**, not the other way around
   (design.md §7.3): vanilla or one keyword → Common; one keyword + one
   short ability → Uncommon; two keywords, or a targeted ability with a
   condition → Rare; a legend/Landlady signature → Legendary.
3. **Write the ability**, if any, only using the vocabulary above. Prefer
   the family's signature keywords (design.md §4's table) — a card can use
   another family's keyword, but most of a family's cards shouldn't.
4. **Write flavour** (design.md §2): one or two sentences, in-world, past
   tense for anything violent and already resolved, never explains the
   mechanic, cats are always right. Pull an easter egg from §15's register
   only if the slot doesn't already have one and it fits without forcing.
5. **Assign `id`/`artId`**: kebab-case of the name, matching across both
   fields, unique against every id in `src/cards/data/`.
6. **Add it** to the right family file in `src/cards/data/families/`,
   export it as a named `camelCase` const, and add that const to the
   file's exported array.
7. **Validate**: run `validateCard` (see "Checking your work" below) and
   fix every error before moving on.
8. **Update the tally** in `src/cards/data/README.md`.

### Batch mode (a whole family, or "finish family X")

Same as above, run card-by-card, but check the family's running point
total against its target *after every card*, not just at the end — it's
much cheaper to shave a point off card 4 than to redesign card 9 because
the family is already over.

### Deck mode ("build Constable Mudd's deck")

1. Find the opponent's row in design.md §9 for family/archetype, reward
   card, and personality.
2. Pull cards from `src/cards/data/` that fit the archetype — mostly from
   the named family/families, plus the opponent's own reward card if one
   exists (`src/cards/data/decks/README.md` tracks which reward cards are
   already written and which family slot, if any, they double as).
3. Fill to exactly 20 cards and check the point total, respecting ≤2
   copies of any card and ≤1 of any legendary (design.md §7.2). Add extra
   copies of cheap on-theme cards before reaching for a new card — a
   believable NPC deck reuses its family's staples.
4. Write the deck as a new file in `src/cards/data/decks/`, exporting a
   `Deck` (array of `{ card, quantity }`), and register it in
   `src/cards/data/decks/index.ts`.
5. Validate with `validateDeck`.

## Checking your work

There's no standalone CLI for this yet — validate by running the existing
test suite, which exercises every card/deck in the content module:

```bash
npm test -- tests/unit/cards
```

For a quick one-off check while iterating, a short inline script works
(swap in your card object):

```bash
npx tsx -e '
import { validateCard } from "./src/cards/cardTypes.ts";
' 
```

(In practice: import `validateCard`/`validateDeck` from
`src/cards/cardValidator.ts` / `src/cards/deckValidator.ts`, log
`.errors`, fix, repeat.)

After adding cards, **run the balance simulator** (`npm run sim`) — it
reads `src/cards/data` directly (see `tools/sim.ts`'s header comment) and
reports per-card effective-vs-printed lift and family curves. A fresh
card won't have lift data until it's actually played in a deck the
simulator runs, so a brand-new card with no deck yet will just show 0
samples — that's expected, not a failure.

## Guardrails

- Never touch a card listed as `tutorialLocked: true` — those stats are
  locked by design.md §8.3 and feed a scripted tutorial replay test
  (`tests/unit/engine/tutorialRound1.test.ts`). Everything else in the v1
  set may be retuned (design.md §16).
- Don't invent a new `Effect` kind or `Trigger` to make a card idea work —
  that's an engine change (plan phase 1.2), out of scope here. Simplify
  the card and flag the gap instead (see "The engine vocabulary" above).
- Keep the family's point curve and the overall 60-card composition
  (design.md §8.1) in view — check `src/cards/data/README.md`'s tally
  before adding a card, not after.
- Flavour text is never a joke at a real historical figure's expense
  beyond what design.md §2 explicitly sanctions (Wheatstone's shyness,
  Christie's missing days, Brunel's hat) — invent new characters for new
  jokes rather than making a real person the punchline.
