# November: The Cunning Folk

**Window:** Nov 1 – Nov 30 · **Arrivals:** Nov 13 (★ compressed for year 1, see overview §8) · **Tournament:** Nov 20 – 30
**Event id:** `cunning-folk` · **Art sheet:** `sheet-9` · **minWins:** 3
**This month builds the framework:** prompts N-A, N-B and N-C must land before N-D.

## 1. The idea

A month after her birthday, word has got round the cellar stairs that the Bridge has a Landlady at last, and that she's a Scorpio. England's cunning folk come up to read her stars: a Yorkshire prophetess, the Queen's own astrologer, and Camden's wise woman (who brings a black cat that looks *exactly* like Hiawatha). A young London artist called Pamela, who paints tarot cards, takes over the curtained corner of the snug and never leaves. She reads cards; she doesn't play them.

In-jokes: the Landlady's sign; Hiawatha mistaken for a witch's cat; Stir-up Sunday as pedestrian kitchen witchcraft (stir east to west and make a wish); Sir Charles grumbling that a prophetess predicted rain in London in November.

## 2. Visitors, Booth host and boss

| Arrives | Who | Tier · family · deck | Signature card (legendary) | Line |
|---|---|---|---|---|
| Nov 13 | **Mother Shipton** (`mother-shipton`): Yorkshire prophetess of Knaresborough, folklore (b. 1488; prophecies printed 1641) | visitor · Coven · Coven + Irregulars | *Mother Shipton*: 3 pts. Persist. On Play: Scry 3. *"Foretold carriages without horses and ships of iron. Was right about the weather, too."* | "I saw you coming. I see most things coming. Sit." |
| Nov 13 | **Dr John Dee** (`john-dee`): Elizabeth I's astrologer and mathematician, 1527–1609; his obsidian scrying mirror is in the British Museum | visitor · Coven · Coven + Foundry | *Dr John Dee*: 4 pts. On Play: Reveal your opponent's hand, then Scry 2. *"Chose the Queen's coronation day by the stars. It went rather well."* | "The stars said Tuesday. It's Thursday. Someone has been at my mirror." |
| Nov 13 (stays for good) | **Pamela Colman Smith, "Pixie"** (`pamela-colman-smith`): born in Pimlico, 1878; drew the Rider-Waite-Smith tarot (1909) | **Booth host** (not an opponent; never plays a match) | *Pamela Colman Smith* (Salon character): 2 pts. Friend +1. On Play: Draw 1, then Scry 2. *"Painted seventy-eight cards for a few pounds and no royalties. Reads for free."* **Given on her first reading**, with the line: *"I painted one of me. Vanity. Keep it."* | "Sit down, love. I'll read for you." |
| Nov 20–30, tournament only | **Mother Red Cap** (`mother-red-cap`): Camden's wise woman, London folklore; the Mother Red Cap pub in Camden is named after her | legend (tournament-only) · Coven · Coven + Rookery | *Mother Red Cap*: 3 pts. Elusive. On Play: an opposing face-up card gets -2. Then Flip an opposing card worth 1 or less. *"Half the pubs in north London are named after her. She drinks in none of them."* | "Your cat? No, dear, he's mine. …He isn't? He has the look." |

Pixie opens **the Fortune-teller's Booth** on arrival (overview §5.3) and stays year-round as its host (settled: Booth-only, overview §10.2). She is never in Tonight's Patrons, a tournament field or the Gauntlet.

## 3. Event cards (the Almanack Night set)

| Card id | Name | Family · type · rarity | Pts | Text | Flavour |
|---|---|---|---|---|---|
| `stir-up-pudding` | Stir-up Pudding | neutral · gadget · C | 1 | On Play: Draw 1. | *Stir it east to west, make a wish, and don't tell Sir Charles. He'll want to know the method.* |
| `remember-remember` | REMEMBER, REMEMBER | neutral · headline · U | 0 | On Play: Flip each face-up card worth 1 or less. | *Fireworks over the river. Everything small jumps.* |
| `old-moores-almanack` | Old Moore's Almanack | neutral · gadget · U | 1 | Persist. On Play: Scry 2. | *Predicts the weather, the harvest and the deaths of kings. Has been right about the weather twice.* |
| `the-petrifying-well` | The Petrifying Well | neutral · location · R | 0 | Each face-up Gadget gets +1. | *Hang a hat in the water at Knaresborough and in a few months you have a stone hat. Sir Charles has three.* |
| `penny-for-the-guy` · **from 2027** | Penny for the Guy | Irregulars · character · U | 1 | Elusive. Return. | *A straw man in a borrowed coat, a handcart, and three boys who'd like a penny for him. They'll be back next year.* |

Pool: the first four, plus the Coven trio and Sagittarius (from Nov 22). **Penny for the Guy** is the Bonfire Night card (settled, overview §10.6): it joins the pool and is gifted from **Nov 5, 2027** onward (`fromYear: 2027`), because the 2026 build lands after Bonfire Night. It's authored and tested now, so nothing needs building next year.

## 4. Threads

- **Coven:** Hedge Witch, Cunning Woman, Witch Bottle (overview §5.1). Flavour:
  - Hedge Witch: *"Knows which herb is for what, and which neighbour is for what, and won't tell you either."*
  - Cunning Woman: *"Finds lost rings, cures warts and settles feuds. Charges in eggs."*
  - Witch Bottle: *"Buried under the hearthstone, it keeps ill will out. Mostly."*
- **Almanack:** ♏ Scorpio (`almanack-scorpio`), ♐ Sagittarius (`almanack-sagittarius`, flavour *"An arrow loosed at the sky. It hasn't come down yet, and nobody minds."*).
- **Tarot:** 0 The Fool, I The Magician (overview §5.3).
- **Arrival gifts:**
  - On the first launch on or after Nov 1: `almanack-scorpio` ×1, `hedge-witch` ×2 and `witch-bottle` ×1, with the beer mat: *"Someone left these on the step. The note says: 'For the Landlady, belated. Born under the Scorpion: we can tell.'"*
  - From Nov 13: `cunning-woman` ×1: *"Pixie says the cunning woman left this for you. She didn't see anyone come in. Neither did I."*
  - From Nov 5, **2027 onward** (`fromYear: 2027`): `penny-for-the-guy` ×1: *"Remember, remember. Three boys and a straw Guy came by for a penny. I gave them a sovereign by mistake. They've decided that makes you one of the gang."*
  - From Nov 22: `almanack-sagittarius`: *"The almanack-seller's been. He left next month's page early. He always does."*

## 5. Tournament: The Almanack Stakes

| Field | Value |
|---|---|
| id | `almanack-stakes` |
| When | Nov 20 – 30 |
| Unlock | event live and 3+ wins |
| Field | Mother Shipton, John Dee, Mother Red Cap, + 4 random Seasoned |
| Entry rule | at least 2 Coven cards in the deck (she's gifted 3, so this is always reachable) |
| House Location | The Petrifying Well |
| Entry / prize / consolation | 13 Checks / *Mother Red Cap* + 150 Checks / 13 Checks |

## 6. Dressing and lines

- **Taproom variant** `background-the-taproom-cunning-folk`: November fog on the windows with a faint orange bonfire glow and one firework far off over the rooftops; a pudding basin and wooden spoon on the bar; almanacks hung on a string; bundles of dried rosemary and lavender hanging from the brass pipes; a small curtained booth with a fringed shawl in the snug corner; a candle in a jar; the cats in their usual places.
- **lockedHint:** *"Wise women on the cellar stairs this month. Win a few hands first, and I'll introduce you. They already know your name."*
- **Sir Charles lines:**
  - *"Mrs Shipton says it'll rain. It's November in London. I didn't need a prophetess."*
  - *"Remember, remember. I do. The cellar was open in 1605, and I've never got the smell out."*
  - *"Hiawatha has been on Mother Red Cap's lap all evening. I've decided not to know."*
- **Banner** (first launch in the window): *"The Cunning Folk are in. Pixie has hung a curtain in the snug and says she'll read for anyone."*
- **Line overrides:**
  - `lovelace`, when `john-dee` has arrived: *"Dr Dee's mathematics is excellent. His angels are another matter."*
  - `prudence-hollis`, when `mother-shipton` has arrived: *"Mrs Shipton has told me how my novel ends. I've had to start another."*
  - `mudd`, when `mother-red-cap` is in the Stakes (from Nov 20): *"There's a lady with a cat who says she's from Camden. Camden's not my beat. I've checked."*

## 7. Enhancements this month

- **N-A** Framework (overview §4): content packs, edition flag, arrival gifts (with `fromYear`), banner, the Ledger, Almanack frame, Heather palette, hosts.
- **N-B** The Coven family and the Scry keyword.
- **N-C** The Fortune-teller's Booth: tarot registry for all 22, omens, album.
- **N-D** November content.

---

## 8. Prompts

Before N-A: the orchestrator's setup step S-6 commits this folder to the repo at `docs/plans/monthly/` (runbook §4).

### N-A · Framework (Build agent · Sonnet · L = 5)

```
Read CLAUDE.md, the last three docs/logs entries, docs/design.md §11-§12 and §17, and docs/app-store-readiness.md §7 before touching code.

Step 0: confirm docs/plans/monthly/ exists in the repo (setup S-6 committed it). If it doesn't, stop and report. From here on, "the overview" means docs/plans/monthly/00-monthly-content-plan.md.

Build the framework in overview §4, plus the extra save fields the Booth will need. Don't author any November content yet (N-D does that); use one tiny test-only pack in the tests to exercise everything.

1. Content packs (§4.1): move HALLOWEEN, unchanged, to src/events/packs/halloween.ts. seasonalEvents.ts keeps the types, the registry and the predicates. Add the optional SeasonalEvent fields: hosts ({ id, arrives }), arrivalGifts ({ cardIds: {id, qty}[], from?: MonthDay, fromYear?: number, line }), almanackIds, tarotIds, covenCardIds, sleeveId, banner. Add a test that no two packs' windows overlap.
2. Hosts: a host is a non-playing character (not an Opponent). Once the player has launched on or after a host's arrival date (in any year since first launch), the host is permanent. Persist `hostsMet` in the save. Hosts never appear in Tonight's Patrons, tournaments or any opponent list, and are never removed when the window closes. Features ask `hostMet(id)` (the Booth uses it in N-C).
3. Arrival gifts: granted once per event per calendar year on the first launch on or after max(window start, gift.from) while the event is live, and only in years >= gift.fromYear when that is set. Likewise, a cardPool entry may be { id, fromYear } and joins the pool only from that year, shown as a beer mat with the gift's line. Persist `giftsClaimed: { [eventId]: { [year]: string[] } }`. Never grant twice; survive relaunch. A gift whose window has closed unclaimed is still granted on the next launch within 7 days of the window end (kindness rule: overview §2.6).
4. Banner: a one-time beer mat on the first hub visit inside the window, once per event per year.
5. Edition flag (§4.2): src/edition.ts reads import.meta.env.VITE_EDITION (default "gift"). Add an optional `giftOnly?: boolean` on Card, Opponent, LineOverride and Sir Charles line entries (wrap lines as { text, giftOnly? } and keep plain strings working). Registries filter giftOnly out when edition === "public". Add a Vitest that stubs the edition to "public" and asserts that nothing giftOnly is reachable from the card catalog, Tonight's Patrons, tournaments, Lost & Found, Pawnbroker or line pools.
6. The Ledger (§4.3): a `ledger` save section (firstLaunch date, per-card plays, per-opponent W/L/D, checksEarned, firstLegendary {id, date}, tournamentsWon[], catsPlayed, boothDraws[]). Bump the save version with a migration and a test; for an existing save, set firstLaunch to the migration date. Counts only, nothing networked; keep the no-network privacy test green. Increment it from the existing match-end and reward code paths.
7. Almanack frame (§4.4): a Headline card face may set `frame: "almanack"` (add it to CardFace as optional, validate that only headlines use it). The SVG frame looks like a printed almanack page: a brass orrery ring around the art window, a zodiac glyph slot (render the Unicode glyph from a new optional `glyph` field) and parchment ground. Rules are unchanged.
8. Coven palette: add the Heather colour token (dusky violet, around #6E5A7E; check its contrast against parchment text) and a Coven frame variant, but don't add "coven" to FAMILIES yet (N-B does that). Amend docs/style-bible.md §2 (Heather) and §4 (add the Tarot, Almanack and Sleeve rows from overview §6).
9. design.md: add §17.1 "Content packs, hosts, gifts and the edition flag", condensed from overview §4 and this prompt.

Tests: Vitest for pack registry/overlap, host permanence across years (and hosts absent from every opponent list), fromYear on gifts and pool entries (2026 vs 2027), gift once-per-year plus late-claim grace, banner once-per-year, edition filtering, ledger migration and increments. One Playwright smoke test with ?now=YYYY-MM-DD&preview=1 that a test-only pack's banner shows. Existing Hallowe'en tests must pass unchanged.

Exit: npm run typecheck && npm test pass. Write docs/logs/<today>.md with /log. Push your branch and open a PR (wrapper W3). Don't merge.
```

### N-B · The Coven and Scry (Build agent · Sonnet · M = 3)

```
Read CLAUDE.md, the last three docs/logs entries, docs/design.md §4-§5 and §16, and docs/plans/monthly/00-monthly-content-plan.md §5.1. N-A has landed.

Add the sixth family, the Coven, and the Scry keyword.

1. Schema: add "coven" to FAMILIES and wire the Heather frame variant from N-A. Add the effect { effect: "scry"; amount: number } to the Effect union; validateCard accepts it on any trigger whose controller has a deck (reject it on Locations, which have no controller).
2. Engine: Scry N looks at the top N cards of the controller's deck (fewer if the deck is short). The controller chooses any of them to put on the bottom, in an order they choose, and puts the rest back on top in an order they choose. Add a chooser callback the same way targeted effects prompt the human (see chooseTargets). The engine stays deterministic given the choices.
3. AI: a heuristic that keeps cards it can play well next turn on top (highest evaluator value for the current round, with Moonrise and Persist nudges) and bottoms the rest. Nudge, don't override (CLAUDE.md gotcha). It must be cheap enough that the legend dial's lookahead stays within the existing time budget.
4. UI: a Scry overlay with the N cards fanned, each tappable to toggle Top/Bottom, plus drag to reorder (or up/down buttons if drag is fiddly on a phone at 402x874), and a Done button. Keyword chip and reminder text exactly as in overview §5.1. House Rules page entry.
5. design.md: §4 gains a Coven row (playstyle "Foresight", signature keywords Scry and hexes, frame Heather, points curve 2.6, archetypes "Coven + Salon: The Reading Room" and "Coven + Foundry: Natural Philosophy"). Add §5.16 Scry, with rules text. §16's note on hexes: a hex is a one-shot negative buff and needs no new effect.
6. Don't author the Coven cards; N-D does.

Tests: engine unit tests for Scry with N larger than the deck, N = 0 cards left, all-to-bottom, all-to-top and reordering; a property test that the deck's multiset is unchanged by Scry; an AI test that Scry never crashes the legend dial; one Playwright test that opens the Scry overlay via a test-only card in a dev fixture.

Exit: npm run typecheck && npm test pass; npm run sim shows no AI win-rate regression. Write /log. Push your branch and open a PR (wrapper W3). Don't merge.
```

### N-C · The Fortune-teller's Booth (Build agent · Sonnet · L = 5)

```
Read CLAUDE.md, the last three docs/logs entries, docs/design.md §11 and §17, and docs/plans/monthly/00-monthly-content-plan.md §5.3. N-A has landed.

Build the Fortune-teller's Booth and the Tarot album.

1. Data: src/booth/tarot.ts holds all 22 Major Arcana now (id "tarot-the-fool" etc., name, number 0-21, artId equal to the id, omen, Pixie's line, and unlocks: the MonthDay of the 1st of its month in the table, except the Fool and the Magician, which unlock on Nov 13 when Pixie arrives). Take every value from the overview §5.3 table verbatim. Arcana for months not built yet work already, because the rule reads only their unlocks date.
2. Unlock rule: an arcana is unlocked once the calendar has passed its unlocks date at least once since ledger.firstLaunch. Compute this from dates; don't store it. Once unlocked, always unlocked.
3. Daily draw: once per local calendar day, seeded from the date plus a per-save salt so it's testable but not identical for every player. Draw only from unlocked arcana, avoiding yesterday's card when more than one is unlocked. Record it in ledger.boothDraws.
4. Omens: the closed set in overview §5.3. Implement each as a pure function the economy code asks ("what's today's omen?") at the right moment: checksNow pays once on the draw; firstWinBonus and checksPerWin on pickup or tournament wins; lostAndFoundUpgrade and lostAndFoundExtra in lostAndFound.ts; pawnbrokerDiscount in pawnbroker.ts (round prices to whole Checks); tinkerFree in tinkersBench.ts; openingHandPlusOne in the first createMatch of the day (draw 5 instead of 4, for the player only); barBetInsurance on the first lost Bar Bet of the day (the stake returns to the collection instead of the Pawnbroker, with a beer mat); wildcard resolves to one of the others, seeded by date. An omen lasts until local midnight. Show today's omen as a small chip on the hub.
5. Booth UI: the booth is reachable from the hub once the host Pixie has arrived (hostMet("pamela-colman-smith")); before that, the hub shows nothing. Pixie is a host, not an opponent: she has a portrait (art id "portrait-pamela-colman-smith") but no deck. On her first-ever reading, after the card flips, grant her signature card "pamela-colman-smith" once with the beer mat "I painted one of me. Vanity. Keep it." (the card itself is authored in N-D; skip the grant safely if the id doesn't resolve yet). Tap it: a curtain draws back, Pixie's portrait appears, a face-down tarot card flips (respect Reduce Motion), and her line and the omen appear on a beer mat. Already drawn today? Show today's card with "Come back tomorrow, love." Missing art falls back to a parchment card with the arcana number.
6. Tarot album: a page off the collection screen with 22 slots in order. Unlocked and drawn shows the art; unlocked and not yet drawn shows a face-down back; locked shows a silhouette. Tapping one shows its name, Pixie's line and the omen.
7. design.md: add §17.2 "The Fortune-teller's Booth".

Tests: unlock dates (the day before and the day of a pack start; a firstLaunch after a pack start); one draw per day; no immediate repeat; each omen kind applied once in the right code path and expiring at midnight; Bar Bet insurance only on the first loss; openingHandPlusOne only on the first match of the day. One Playwright test with ?now=2026-11-14&preview=1 that draws a card.

Exit: npm run typecheck && npm test pass. Write /log. Push your branch and open a PR (wrapper W3). Don't merge.
```

### N-D · November content (Content agent · Haiku · M = 3)

```
Read CLAUDE.md, the last three docs/logs entries, and docs/plans/monthly/01-november.md in full. N-A, N-B and N-C have landed.

Use the ss-card-author skill to author November exactly as specified in 01-november.md:
- §2: opponents mother-shipton and john-dee (tier "visitor"), mother-red-cap (tier "legend", tournament-only: exclude her from Tonight's Patrons the same way spring-heeled-jack is excluded). Their three legendary signature cards with the text and flavour shown, plus the card pamela-colman-smith (legendary Salon character, text as shown; Pixie is the pack's host, not an opponent: no Opponent entry, no deck, granted by the Booth on her first reading). 20-card decks per the deck column, registered in decks/index.ts; Bar Bet pools drawn from §3 and the Coven cards. Portrait art ids "portrait-<opponentId>".
- §3: the five event cards in src/cards/data/cunningFolk.ts. penny-for-the-guy enters the pack's cardPool as { id: "penny-for-the-guy", fromYear: 2027 }.
- §4: the Coven cards hedge-witch, cunning-woman and witch-bottle (family "coven") in src/cards/data/families/coven.ts; almanack-scorpio and almanack-sagittarius (neutral headlines, rare, frame "almanack", glyphs ♏ and ♐, texts from the overview §5.2 table) in src/cards/data/almanack.ts.
- The pack src/events/packs/cunningFolk.ts: window Nov 1-30, visitors arriving Nov 13, host pamela-colman-smith arriving Nov 13, minWins 3, cardPool (the §3 cards, the Coven trio and almanack-sagittarius), the four arrivalGifts from §4 (the Penny for the Guy gift has from Nov 5 and fromYear 2027), almanackIds, tarotIds ["tarot-the-fool","tarot-the-magician"], covenCardIds, banner, and every dressing value in §6 (taproomArtId "background-the-taproom-cunning-folk").
- §5: the tournament almanack-stakes in src/tournaments/tournaments.ts with its entry rule (count cards whose family is "coven"; the error reads "The Almanack Stakes needs at least 2 Coven cards in the deck."), house Location the-petrifying-well, and an explicit field constant. Register it in the pack.
Mark nothing giftOnly this month: none of it is a fan allusion.

If a card doesn't fit its family's points curve (Coven 2.6), flag it in the log with a suggested fix. Don't silently change a signature card's text.

Art manifest: create art/prompts/sheet-9-manifest.json in the shape of sheet-7-manifest.json, with a row for every image listed in 01-november.md §9 (asset ids and categories as listed there; each prompt field says "See docs/plans/monthly/01-november.md §9"). If any are in art/inbox, run python3 tools/ingest-art.py art/prompts/sheet-9-manifest.json.

Balance: npm run curve -- seasoned seasoned 200 for both visitors. Target: the starter deck wins 40-50%. Adjust deck-local cards only (never shared canonical cards, never signature text).

Tests: with ?now=2026-11-12 no visitors, no host and no booth; Nov 13 with 3+ wins shows Shipton and Dee in Tonight's Patrons (Pixie never appears there), and the booth is open; the first reading grants pamela-colman-smith once; Nov 19 has no Stakes; Nov 20 opens the Stakes and Mother Red Cap is in it but not in Tonight's Patrons; Nov 22 grants Sagittarius once; Dec 1 hides the visitors and the Stakes but keeps the booth. Penny for the Guy: with ?now=2026-11-14 it is neither gifted nor in the pool; with ?now=2027-11-04 it isn't gifted yet; with ?now=2027-11-05 it is gifted once and is in the pool. The arrival gifts land once. A deck with 1 Coven card can't enter the Stakes; one with 2 can. Every Stakes match starts with The Petrifying Well.

Exit: npm run typecheck && npm test pass. Write /log. Report back to the orchestrator; it merges, deploys and uploads the TestFlight build (runbook §5).
If you fail the exit check twice, stop and report; the orchestrator reruns this on Sonnet.
```

---

## 9. Gemini one-shot: November art (21 images)

> **Run by the art agent** (runbook `12-orchestration-runbook.md` §7) through Claude in Chrome on gemini.google.com, using Brent's own signed-in Gemini account. The numbered steps below are what the art agent does in the browser; "you" means the art agent. Reference files are read from the Mac repo (`~/projects/steampunk-shuffle/`), and every finished image lands in `~/projects/steampunk-shuffle/art/inbox/<asset id>.png`. Brent does nothing here.

1. Open a **fresh Gemini chat** (image generation on).
2. Attach these 5 files, in this order:
   1. `art/reference/The_Wheatstone_Bridge_taproom.jpeg`
   2. `public/art/portrait-agatha-christie.webp`
   3. `public/art/portrait-professor-moriarty.webp`
   4. `public/art/portrait-mary-shelley.webp`
   5. `art/reference/Hiawatha.jpeg`
3. Paste the code block and send. Save each image as `art/inbox/<asset id>.png`, then type **next**. To retry, type **redo: <what to fix>**.
4. Images 1–13 are needed by Nov 8. Image 21 (Penny for the Guy) isn't needed until autumn 2027, but it's cheapest to make it now. If you hit the daily cap, start a new chat, attach the same files plus any portraits already made, paste again and type **start at image N**.

```
You are the illustrator for a steampunk card game set in The Wheatstone Bridge, a public house in 1871 London whose cellar door opens onto any century. This month, England's cunning folk, wise women and astrologers visit the pub, and a tarot artist opens a booth in the snug. I need 21 images. Make them ONE AT A TIME, in the order below.

HOW WE WORK
- Each turn, generate exactly one image: the next one on the list. Start with image 1 now.
- After the image, write one line: "Image N of 21 — save as <asset id>.png". Put nothing else in the reply and don't ask questions. If something is ambiguous, pick the option that best fits the style rules and keep going.
- When I type "next", make the next image. When I type "redo: <note>", make the same image again with that fix. When I type "start at image N", jump to that image.
- Never put the asset id, a caption or any text inside the image itself.

ATTACHED REFERENCES
- Attachment 1 is the taproom of The Wheatstone Bridge. It is the style anchor for every image: match its painting style, brushwork, lighting and palette.
- Attachments 2-4 are existing portraits from the game. Use them ONLY as style references for rendering, finish, framing and light. Never copy their faces, clothing or identity.
- Attachment 5 is Hiawatha, the pub's real black cat. Use him ONLY where an image says so.
- Card art for a character must show the SAME character you drew in the portrait just before it, in this chat: same face, costume and colours.

HOUSE STYLE (applies to every image unless the image says otherwise)
Painterly digital illustration in a Victorian-engineering steampunk style: brass, steam, gaslight and iron, never goggles-and-corsets cosplay. Visible, controlled brushwork, like a colourised Victorian book plate. Confident inked contours on the major forms, softened by the paint underneath. Directional gaslight: a warm key light from one side, cool ambient fill, real cast shadows. A faint paper-grain texture over the whole image. Mechanical details should look like they could really be built. Each image reads as ONE dominant colour plus parchment cream and warm ink black, with other colours only as small accents. The palette is brass/copper, oxblood leather, verdigris, gaslight amber, gunmetal blue, heather (a dusky muted violet, used for the cunning folk and witches), parchment cream, warm ink black, and sparing sovereign gold. Paint to every edge: the game adds its own card border.

FRAMING BY TYPE
- Portrait (1:1): bust portrait, three-quarter turn, slightly tighter than bust-to-waist, soft blurred background.
- Card art (3:4): bust-to-waist (or as described), a moment of action, soft blurred background that never competes with the subject.
- Object or place card (3:4): the object or place is the subject; no people unless described.
- Headline (3:4): looks PRINTED, not painted: a Victorian newspaper woodcut or engraving, symmetrical, bold central motif, two inks on newsprint. No legible words.
- Almanack (3:4): looks PRINTED, not painted: a centred, symmetrical woodcut-engraving of a zodiac figure inside a brass orrery ring of concentric bands and small planets, on foxed parchment, in warm ink black with one sovereign-gold accent. No glyphs, numbers or lettering.
- Tarot (2:3): the classic 1909 Rider-Waite-Smith composition for that card, repainted in the house style with Victorian-engineering details, with a thin painted border inside the image. No numerals, no title, no lettering.
- Background (9:16): the full room, with calm, uncluttered space in the lower third for game interface.

NEGATIVE RULES (every image, plus any extras listed per image)
no text, no lettering, no numbers, no watermark, no signature, no logo, no photorealistic photography look, no 3D render look, no anime style, no cartoon style, no goggles-and-corsets cosplay clichés, no pointed black witch hats, no green-skinned witches, no broomstick flying, no modern clothing or objects, no gore, no graphic violence, no distorted or extra hands/limbs, no border or frame (except tarot), no white or cream margin, no vignette

THE 21 IMAGES

1 · background-the-taproom-cunning-folk · Background, 9:16
The SAME taproom as attachment 1, same layout, fireplace, brass piping and oxblood booths, dressed for a November evening in 1871: thick fog on the gunmetal-blue windows with a faint orange bonfire glow behind it and one small firework bursting far off over the rooftops; a big earthenware pudding basin with a wooden spoon standing in it on the bar; paper almanacks hung along a string above the bar; bundles of dried rosemary and lavender tied to the brass pipes; in the snug corner, a small booth curtained with a heather-violet fringed shawl and lit by one candle in a jar; a black cat asleep on a stool. The empty chair by the fire is still slightly apart from the others. No people.

2 · portrait-mother-shipton · Portrait, 1:1, style reference attachment 2
Mother Shipton, the Yorkshire prophetess of folklore: a very old, wiry countrywoman with a long, strong hooked nose and a wry, knowing half-smile, deep-set bright eyes, a plain dark hood and shawl over a homespun Tudor-era dress, a gnarled walking staff, a sprig of dried heather pinned at her breast. Behind her, softly blurred, the dripping limestone mouth of a cave where water falls over hats and gloves turned to stone. Heather dominant, parchment and ink, warm candle key light, cool cave-damp fill. Shrewd and amused rather than sinister.
Extra negatives: no warts, no hag caricature.

3 · mother-shipton · Card art, 3:4, style reference attachment 2
The same old prophetess as image 2, bust-to-waist, seated at a pub card table, one gnarled hand laid flat on top of a face-down deck as if she can already feel what's coming; three cards from the top of the deck float an inch above it, edge-on, glowing faintly heather-violet. Behind her, a fogged window with the ghost-image of a train and an iron ship, as if she's seeing them. Heather dominant, parchment and ink, warm gaslight.

4 · portrait-john-dee · Portrait, 1:1, style reference attachment 3
Dr John Dee, Elizabethan astrologer and mathematician: an elderly scholar with a long, pointed white beard, a black scholar's skullcap, a fur-trimmed black gown over a ruffled collar, sharp intelligent eyes. He holds up a polished black obsidian scrying mirror in a small brass frame, and in its surface faint points of starlight show. Behind him, softly blurred, a cluttered study with an armillary sphere and star charts. Heather and ink dominant, sovereign-gold accents on the brass, warm candle key light, cool fill.
Extra negatives: no wizard robes with stars on them, no pointed hat.

5 · john-dee · Card art, 3:4, style reference attachment 3
The same bearded astrologer as image 4, bust-to-waist, at a pub card table, gazing into his black scrying mirror; reflected in the mirror, instead of his face, is a small fan of the opponent's cards seen from the front, shimmering. A brass armillary sphere turns slowly on the table beside a pint. Heather and ink dominant, sovereign-gold accents, warm candle light.

6 · portrait-mother-red-cap · Portrait, 1:1, style reference attachment 4
Mother Red Cap, the wise woman of Camden in London folklore: a stout, handsome woman of about sixty with a weathered, cheerful, slightly dangerous face, a battered bright red woollen cap pulled over grey curls, a heavy heather-violet shawl, and a clay pipe. A sleek black cat sits on her shoulder, and the cat looks EXACTLY like attachment 5: same face, eyes, build and coat. Behind her, softly blurred, the lamplit doorway of an old coaching inn. Oxblood and heather, parchment and ink, the red cap as the one bright accent, warm gaslight from one side.
Extra negatives: no hag caricature, no warts.

7 · mother-red-cap · Card art, 3:4, style reference attachment 4
The same red-capped wise woman and the same black cat as image 6, bust-to-waist, leaning across a card table and blowing a long curl of heather-violet pipe smoke over the opponent's side; where the smoke touches an opposing card it greys and wilts like a pressed flower. The black cat watches the card, unimpressed. Oxblood dominant, heather smoke, parchment and ink, warm gaslight.

8 · portrait-pamela-colman-smith · Portrait, 1:1, style reference attachment 2
Pamela Colman Smith, the London tarot artist of the 1900s, as a young woman of about thirty: round face, dark hair pinned up loosely with a few strands escaping, large dark eyes, a warm conspiratorial smile, a paint-stained artist's smock over an Edwardian blouse, long beaded necklaces, a fringed heather-violet shawl. She holds a hand-painted tarot card face-down against her chin. Behind her, softly blurred, a curtained booth lit by a candle. Verdigris dominant with heather accents, parchment and ink, warm candle key light.

9 · pamela-colman-smith · Card art, 3:4, style reference attachment 2
The same young tarot artist as image 8, bust-to-waist, at a small round table draped in a fringed shawl inside her curtained booth, laying out three hand-painted tarot cards face-up in a row (the painted card faces are rich and colourful but show no letters or numbers); a paintbrush tucked behind her ear, a jar of brushes and a candle beside her. Verdigris dominant, heather and sovereign-gold accents, candlelight.

10 · hedge-witch · Card art, 3:4, style reference attachment 4
A Victorian village hedge witch in her thirties, practical and unglamorous: rolled sleeves, a work apron with pockets full of herbs, a straw garden hat, hair in a loose plait, a basket of foxgloves, nettles and rosemary on one arm. She is turning over the top card of a deck with one earth-smudged finger and smiling at what she sees. Behind her, a blurred cottage garden at dusk with a hedge. Heather dominant, parchment and ink, warm low sunset key light.

11 · cunning-woman · Card art, 3:4, style reference attachment 2
A Victorian cunning woman, the village fixer: a sturdy middle-aged woman in a plain dark dress, a white cap and a heather-violet shawl, sitting at a kitchen table with a basket of eggs (her fee), holding a small brass key on a thread that swings like a pendulum over a playing card that is greying slightly as she frowns at it. A dresser of jars and bottles behind. Heather dominant, parchment and ink, warm hearth key light.

12 · witch-bottle · Object card, 3:4, no style reference
An old stoneware bellarmine jug with a bearded face moulded on its neck, sealed with wax, half-buried beneath a lifted hearthstone; through a hairline crack you can glimpse bent pins, a sprig of rosemary and a curl of red thread inside. Hearth embers glow behind. Shallow depth of field, no people. Heather and ink dominant, warm ember glow, parchment highlights.

13 · almanack-scorpio · Almanack, 3:4
Scorpio: a large, elegant scorpion with its tail curled high, engraved in a woodcut style at the centre of a brass orrery ring of concentric bands and tiny planets, a few engraved stars scattered in the field. Warm ink on foxed parchment, the scorpion's sting picked out in sovereign gold.

14 · almanack-sagittarius · Almanack, 3:4
Sagittarius: a centaur archer drawing a bow aimed up and to the right at a single star, engraved in a woodcut style at the centre of a brass orrery ring of concentric bands and tiny planets. Warm ink on foxed parchment, the arrowhead and the star picked out in sovereign gold.

15 · stir-up-pudding · Object card, 3:4, no style reference
A big earthenware pudding basin on a floury kitchen table, a heavy wooden spoon standing upright in a dark, fruit-studded Christmas pudding mixture, a few silver sixpences and a tiny silver charm on the table beside it, a bowl of suet and a jar of currants. Several different hands' flour-prints on the table edge show that everyone has had a stir. Warm candlelight, parchment and ink, oxblood accents. No people.

16 · remember-remember · Headline, 3:4
A Victorian newspaper front-page woodcut: fireworks bursting in a symmetrical starburst over the dome of St Paul's and the river, a bonfire on the bank below with small silhouetted figures, and rockets streaking upward. Two inks, black and a single warm orange, on newsprint, with an ornamental masthead band at the top that contains no legible letters.
Extra negatives: no legible words, no effigy burning in close-up.

17 · old-moores-almanack · Object card, 3:4, no style reference
A battered, dog-eared Victorian almanack lying open on a pub bar beside a pint, its pages showing woodcut moon phases, a zodiac wheel and tiny weather pictures (no legible text); a pair of wire spectacles rests on it, and a brass pocket barometer sits beside it. Gaslight amber key light, parchment and ink dominant.
Extra negatives: no legible text on the pages.

18 · the-petrifying-well · Place card, 3:4, no style reference
The Petrifying Well at Knaresborough, Yorkshire: a rounded limestone overhang by a river, its face draped in a curtain of dripping mineral water, and hanging from strings in the falling water a row of ordinary objects (a top hat, a kettle, a teddy-bear-shaped toy, a lady's boot, a pair of gloves) in stages of being turned to grey-cream stone. Mossy greens, wet stone, verdigris dominant, cool daylight, parchment and ink. No people.

19 · tarot-the-fool · Tarot, 2:3
The Fool: a carefree young traveller in a bright patterned Victorian frock coat, a bundle on a stick over one shoulder and a white rose in his hand, stepping happily toward the edge of a cliff with his face turned up to the sun, a small white dog leaping at his heels. In this version his bundle is a carpet bag with brass clasps, and a tiny brass dirigible floats in the far sky. Gaslight amber and sky, parchment and ink, thin painted border.

20 · tarot-the-magician · Tarot, 2:3
The Magician: a young man in a white tunic and oxblood cloak stands at a workbench, one arm raised holding a wand to the sky and the other pointing to the ground, a figure-of-eight loop floating above his head. On the bench before him lie a cup, a sword, a pentacle coin and a wand, here rendered as brass instruments (a goblet, a brass rule, a brass check coin, a galvanic rod). Roses and lilies grow around the bench. Oxblood and brass, parchment and ink, thin painted border.

21 · penny-for-the-guy · Card art, 3:4, style reference attachment 3
Bonfire Night in 1871: three cheeky, scruffy London street boys in caps and patched jackets with a wooden handcart, on which sits a stuffed straw "Guy" in a battered old coat, a mask with a painted moustache and a floppy hat; one boy holds out a cap for pennies toward the viewer with a hopeful grin. Behind them, softly blurred, a foggy street with a distant bonfire glow and a rocket bursting over the rooftops. Gaslight amber dominant, parchment and ink, warm bonfire light.
Extra negatives: no fire on the Guy, no burning effigy.

Begin with image 1 now.
```

