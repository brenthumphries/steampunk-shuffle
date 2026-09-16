# The Wheatstone Bridge — Playtest Bug Fix Plan

**Source:** `Wheatstone Bridge Game Notes list.pdf` (13 numbered playtest notes, tester feedback in "where / what I tried / what I expected / what happened" form)
**Written:** September 16, 2026
**Handoff target:** Claude Code, Sonnet model, one session working bug-cluster by bug-cluster
**Scope:** The 12 real defects below. Two items in the source notes were feature requests, not bugs (auto-save-as-app, skip-tutorial-on-replay) — deliberately **excluded** from this plan; they're already covered by the Phase 4 Capacitor/TestFlight work and the Phase 2.7 tutorial work in `plan/steampunk-shuffle-plan.md`, so log them there instead of fixing them here.

## How to use this doc (for the Claude Code session)

1. Read `CLAUDE.md` and `docs/design.md` first — this plan assumes the card schema, family list, keyword vocabulary, and screen names defined there. File/component paths below are best guesses from the design doc's screen names, not verified against the actual repo — locate the real files with a search before editing.
2. Work top to bottom; clusters are ordered by priority (P1 before P2). Within a cluster, fix the root cause once rather than patching each symptom separately — several of these notes are the same underlying bug reported from different screens.
3. Every fix needs a test before it's marked done — see "Test" under each item. Prefer Vitest for logic/state and Playwright for anything that's purely a rendering/interaction bug (scroll position, animation timing, layout).
4. Two items (marked **⚠ DESIGN CHECK**) are really open questions about intended game behavior, not obviously bugs. Before writing a fix, check `docs/design.md` and the current card data for the documented answer. If the doc settles it, fix whichever side (code or data) is wrong and note the source in the commit. If the doc is silent or ambiguous, **do not guess** — leave the current behavior in place, add a `// TODO(design):` comment, and list it in your session summary for Brent to decide.
5. Update `PLAYTEST.md` (or create it, following the format the `ss-playtest` skill is meant to produce) marking each of these 12 notes as fixed/deferred, so this list doesn't get re-triaged later.

---

## Decisions already made (don't re-litigate these)

- **Bar Bet staking (#2):** add an explicit confirm step. Selecting a card previews it; a separate action ("Stake This Card" or similar) commits the bet. Selecting no longer stakes automatically.
- **Family/rarity visuals (#4, #5, #10, #11):** full fix, not a stopgap. Card frames get family-coded colors (matching the family drop-down), and rarity gets its own distinct treatment layered on top — per `docs/design.md`'s original frame plan (brass/copper/gunmetal/gold-leaf by rarity), legendary cards keep their sparkle effect, recolored to match family rather than being family-neutral.
- **Content questions (Charlotte's family, Inspector's Warrant flip count):** resolve by checking `docs/design.md` and current card data, per the DESIGN CHECK process above — don't ask Brent unless the doc is genuinely silent.

---

## Cluster A — Bar Bet screen (P1)

**Notes:** #1, #2

**Symptom:** The Bar Bet Stakes window lets the tester choose an option but shows no card stats to bet on, and selecting a card stakes it immediately with no way to confirm or back out.

**Root cause hypothesis:** the stakes modal/list renders card names or thumbnails only, not the full stat card component used elsewhere (match screen, deck builder); the selection handler both selects *and* commits in one action.

**Fix:**
- Reuse the same card-detail/stats component used on the match screen or deck builder inside the Bar Bet Stakes window, so every card shown is fully inspectable before staking.
- Split "select" from "stake": selecting highlights/previews a card; a distinct confirm action (button or second tap on an already-selected card) commits the stake. Add a clear cancel/deselect path.
- Make sure the staked outcome (win/lose the card) is unambiguous in the post-bet UI — the tester's note implies they weren't sure a bet had even been placed.

**Test:**
- Unit: staking state machine — `select → preview state`, `confirm → staked state`, `select different card → previous selection cleared`, `no stake committed until confirm fires`.
- Component/Playwright: card stats are visible and readable in the stakes window before any selection; confirming stakes exactly the selected card; canceling returns to the pre-selection state with no bet placed.

---

## Cluster B — Deck Builder: family & rarity visuals (P1)

**Notes:** #3, #4, #5, #10, #11

**Symptom:** Four related complaints, all pointing at one gap: there's no reliable visual way to tell (a) which cards are already in the deck being edited, and (b) which family a card belongs to. Card borders currently encode **rarity**, not family, so the family drop-down menu has no visual relationship to the cards it filters, and testers are inferring family from border color incorrectly (e.g. guessing Charlotte is Yard family from a border that's actually signaling rarity).

**Root cause hypothesis:** the card frame component has a single `borderColor`/`frameVariant` prop driven off `card.rarity`, with no family-driven styling at all; the deck-in-progress state isn't reflected in the card tile's rendered state, only in an underlying array the UI doesn't surface.

**Fix — deck membership (#3):**
- Card tiles in the builder read current deck membership and render a distinct state for "in this deck" (border treatment, checkmark badge, dimmed vs. active — whatever matches the existing visual language) vs. "not in this deck."
- This must update live as cards are added/removed, not just on screen load.

**Fix — family/rarity visuals (#4, #5, #10, #11):**
- Add a family → color mapping (five families per `docs/design.md`) and apply it to: the card frame border/accent, and a small swatch or icon next to each family name in the drop-down menu, so the two are visually tied together.
- Move rarity to its own visual channel that doesn't collide with family color — e.g. frame *material/texture* (brass/copper/gunmetal/gold-leaf) stays rarity-driven per the design doc, while frame *color* becomes family-driven. Legendary's sparkle effect stays, recolored per family instead of being uniform.
- Card #10 (Charlotte) and any other cards whose current border color doesn't match their `family` field in card data are a **⚠ DESIGN CHECK**: once the new family-color mapping is live, check Charlotte's actual `family` value in the card data against `docs/design.md`'s family list and fix whichever is wrong (the data field, or a stray old rarity-only style override on that card).
- Card #11 ("what does the green border mean") should resolve automatically once family colors are documented and consistently applied — confirm there's a legend/key (tooltip, help screen, or the House Rules screen from Cluster D) that spells out the color→family mapping, since color alone isn't accessible to colorblind players.

**Test:**
- Unit: family→color mapping function covers all five families with no fallback/undefined case; rarity texture and family color are independent props on the card component (changing one doesn't affect the other).
- Unit: deck-membership selector returns correct in/out state for a given deck + card id, and updates when the deck array changes.
- Component/Playwright: family drop-down swatches visually match the color used on cards of that family (snapshot or computed-style assertion, not just presence); a card already in the open deck renders visibly differently from one that isn't.

---

## Cluster C — Deck Builder: scroll position on selection (P2)

**Note:** #12

**Symptom:** Picking a card to add jumps the screen back to the top; tester has to re-scroll every time.

**Root cause hypothesis:** the card grid remounts or the selection handler triggers a full re-render/re-key of the list (or a `scrollTo(0,0)` side effect), resetting scroll position.

**Fix:** preserve scroll position across the add/select action — likely means keying list items stably (not by array index) and avoiding any scroll-reset call in the add-card handler. If the grid is virtualized, confirm the virtualization library isn't resetting its own internal scroll offset on data change.

**Test:**
- Playwright: scroll the deck builder grid partway down, add a card, assert scroll offset is unchanged (within a small tolerance) after the add completes.

---

## Cluster D — House Rules screen: scroll broken on laptop (P1)

**Note:** #7

**Symptom:** Scrolling works on phone (touch) but not on laptop (presumably mouse wheel / trackpad).

**Root cause hypothesis:** the scrollable container likely has touch event handlers (`touchmove`) but no wheel event handling, or has `overflow` set in a way that only the phone's native scroll picks up (e.g. a fixed-height container with `overflow: hidden` instead of `overflow-y: auto`, or a custom touch-only scroll implementation that never delegates to native scrolling on non-touch input).

**Fix:** make the House Rules content a normal natively-scrollable container (`overflow-y: auto` + defined max-height, or no custom scroll handling at all) so it works identically across mouse wheel, trackpad, and touch without device-specific code paths. If there's a reason for custom scroll handling elsewhere in the app (e.g. to avoid iOS rubber-banding per the design doc's iOS web quirks notes), scope that custom handling narrowly and make sure it still falls back to native wheel scrolling.

**Test:**
- Playwright: run with both `hasTouch: true` and a plain desktop viewport (no touch); in both, simulate a wheel/scroll event and assert the container's `scrollTop` changes and reaches the bottom content.

---

## Cluster E — Match screen: Instant card animation too fast (P1)

**Note:** #6

**Symptom:** When an opponent plays an Instant-type card, the play animation is fast enough that the tester can't read what happened before the card disappears.

**Fix (bug, in scope):** slow down or add a hold/pause phase to the Instant-card play animation so its effect text and art are legible before it resolves and clears — a brief "announce" beat (e.g. ~1–1.5s pause on the revealed card before the resolve animation plays) is a reasonable default; tune against actual animation timing in the codebase.

**⚠ DESIGN CHECK (not in scope to change without confirming):** the tester also said they'd *prefer the card stay on the table* rather than disappear at all. That's a rules-behavior question, not a timing bug — check `docs/design.md`'s Instant/On-Play keyword definition. If Instant cards are documented as resolve-then-discard (consistent with Nokturna's On Play keyword per §8 of the build plan), leave that behavior alone and fix only the legibility/timing issue above. If the design doc is ambiguous about whether Instants persist visually after resolving, flag it rather than changing core resolution logic.

**Test:**
- Unit: animation/timing controller exposes a minimum legible-duration constant for Instant resolution; assert the resolve event doesn't fire before that duration elapses.
- Playwright: play an Instant card in a scripted match, assert the card's text/art is present in the DOM (or a screenshot) for at least the minimum duration before removal.

---

## Cluster F — Match screen: hand replenishment expectation (P2)

**Note:** #9

**Symptom:** Tester expected new cards to enter their hand after playing a card; hand stayed fixed to the initial deal.

**⚠ DESIGN CHECK:** per `docs/design.md` / the Nokturna rules base (§8 of the build plan), hands are dealt once and only grow via specific draw-effect cards (e.g. an Almanac-style card) — there's no per-turn redraw. If that's confirmed as intended, **this is not a code bug** — the fix is a communication gap, not a logic change:
- Add a brief in-game hint (tutorial step, or a House Rules line) making explicit that hands don't refill each turn and that only certain cards draw more cards, so new players don't expect a redraw.
- If a draw-effect card exists in the current card set, make sure at least one is reachable early enough that a tester playing a normal game would encounter the mechanic.

If `docs/design.md` actually specifies some form of per-round replenishment that isn't implemented, treat this as a real logic bug instead and implement it per the doc.

**Test:**
- If treated as a doc/hint fix: no code test needed beyond confirming the hint text renders on the relevant screen (Playwright presence check).
- If treated as a logic bug: unit test asserting hand size and draw timing match the documented rule exactly.

---

## Cluster G — Inspector's Warrant flip count (P2)

**Note:** #13

**Symptom:** Tester read the on-selection instructions as implying "one or more" opposing cards worth ≤3 would flip; only one flipped.

**⚠ DESIGN CHECK:** check the card's definition in card data and `docs/design.md`'s Flip keyword description (the build plan's §8 reference notes an example — "Death" flips *every* card worth 3 or less on play — which is a different card but shows the keyword can mean "all qualifying cards," not just one). Two possible fixes depending on what's actually intended for Inspector's Warrant specifically:
- If Inspector's Warrant is meant to flip only one qualifying card: fix the on-select instruction copy so it reads "pick one card worth three or less to flip" instead of implying multiple.
- If it's meant to flip all qualifying opposing cards (consistent with the Death example): fix the resolution logic to flip every opposing card worth ≤3, not just the first selected.

**Test:**
- Unit: Inspector's Warrant resolution against a fixture board with multiple opposing cards worth ≤3 — assert the flip count matches whichever behavior is confirmed correct (either exactly one, selected by the player, or all qualifying cards).
- Unit: instruction/help text shown on card selection matches the actual resolution behavior (a simple string/data-driven assertion, so a future copy change can't silently drift from logic again).

---

## Suggested working order

1. Cluster D (House Rules scroll) — isolated, fast, unblocks nothing else but is a pure accessibility bug worth clearing first.
2. Cluster A (Bar Bet) — isolated screen, clear fix.
3. Cluster B (family/rarity visuals) — biggest cluster, touches shared card-frame component used elsewhere; do this before Cluster C so the "in deck" state work in C.
4. Cluster C (scroll position) — small, same screen as B.
5. Cluster E (Instant animation) — isolated to match screen.
6. Cluster F and G (design-check items) — do these last since they may turn out to be doc/copy fixes rather than logic changes once `docs/design.md` is checked.

## Open items for Brent (only if Claude Code can't resolve them from design.md)

- Charlotte's correct family (note #10)
- Inspector's Warrant: one card or all qualifying cards (note #13)
- Whether Instant cards should ever remain visible on the table post-resolution (note #6) — timing fix ships regardless; this is only about the "stay on table" preference
- Whether any per-round hand replenishment was ever intended beyond draw-effect cards (note #9)
