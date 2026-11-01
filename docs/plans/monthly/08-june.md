# June: A Midsummer Night's Revel

**Window:** Jun 1 – Jun 30 · **Arrivals:** William Shakespeare Jun 1 · Robin Goodfellow Jun 10 · **The Midsummer Fair Draft:** Jun 1 – 30 · **Titania's match** opens Jun 20 (midsummer)
**Event id:** `midsummer-revel` · **Art sheet:** `sheet-16` · **minWins:** 3

## 1. The idea

The longest days of the year. **William Shakespeare** (the second of design.md's stretch legends) comes up from Southwark with *The Globe*, a Location where everyone counts as a friend. Robin Goodfellow, the shape-shifting Puck of English folklore, swaps cards when nobody's looking. A fair sets up in the yard with a **drafting table**, the most *Magic: The Gathering* thing the Bridge has done: open packs, pick a card, pass the rest, and build a deck from what comes round. Go undefeated, and on Midsummer Eve **Titania, Queen of the Fairies,** will play you herself.

Witchy notes: St John's wort hung over the door on Midsummer Eve, a fairy ring of mushrooms by the fire (Charlotte asleep in it), the solstice. The Sun and the World tarot cards: the World's dancer in her wreath is a midsummer card.

**Enhancements:** **The Midsummer Fair Draft** (a booster-draft mode) and Locations that grant Friend (The Globe, reusing April's `grantsFriend`).

## 2. Visitors and the Queen

| Arrives | Who | Tier · family · deck | Signature card (legendary) | Line |
|---|---|---|---|---|
| Jun 1 | **William Shakespeare** (`shakespeare`), 1564–1616 | visitor · Salon · Salon + Irregulars, built round The Globe | *Will Shakespeare*: 3 pts. Friend +2. On Play: Draw 1. *"Born in Stratford, worked in Southwark, and borrowed every plot he ever liked. Sir Charles respects it."* | "All the world's a stage, and this one has a cellar. Deal." |
| Jun 10 | **Robin Goodfellow** (`robin-goodfellow`), the Puck of English folklore and the *Dream* | visitor · Irregulars · Irregulars + Rookery | *Robin Goodfellow*: 1 pt. Elusive. Return. On Play: Flip an opposing card worth 2 or less, then turn one of your face-down cards face-up. *"Lord, what fools these mortals be!"* | "I'll put a girdle round the earth in forty minutes. Or I'll play you. Your choice." |
| from Jun 20, after a 3–0 draft run | **Titania, Queen of the Fairies** (`titania`) | legend (draft-only) · Salon · Salon + Coven | *Titania*: 4 pts. Elusive. Friend +2. On Play: Flip each opposing face-up card worth 1 or less. *"Quarrels with her king, rules the summer, and once fell in love with a weaver wearing a donkey's head. She doesn't discuss it."* | "You drafted well, mortal. Now play as well as you picked." |

## 3. Event cards

| Card id | Name | Family · type · rarity | Pts | Text | Flavour |
|---|---|---|---|---|---|
| `the-globe` | The Globe | neutral · location · R | 0 | Every face-up Character counts as having Friend. | *Wooden O, thatched roof, standing room a penny. Burned down once during* Henry VIII*. The cannon was a bit much.* |
| `bottom-translated` | Bottom, Translated | Salon · character · C | 3 | Friend +1. | *"Bless thee, Bottom! Bless thee! Thou art translated."* |
| `st-johns-wort` | St John's Wort | neutral · gadget · C | 1 | Persist. | *Hung over the door on Midsummer Eve to keep the fairies out. The cats are indifferent.* |
| `love-in-idleness` | Love-in-Idleness | neutral · scheme · U | 0 | On Play: take control of an opposing Friend card worth 2 or less. | *A drop on sleeping eyelids, and they'll dote on the next live thing they see.* |

## 4. Threads

- **Coven:** Besom (`besom`): *"For sweeping the floor. And, on certain nights, the doorstep."* Arrival gift from Jun 1.
- **Almanack:** ♋ Cancer (`almanack-cancer`): *"Carries her house about, and won't come out of it without good reason."* Arrival gift from Jun 21.
- **Tarot:** XIX The Sun, XXI The World.
- **Sleeve:** `sleeve-midsummer`, a fairy ring of mushrooms, moths and stars.
- **Gift lines:** Jun 1: *"Pixie left a broom by the door with a ribbon on it. I asked if it was for sweeping. She said 'among other things'."* Jun 21: *"Midsummer. The almanack-seller was up at four to see the sun rise. He brought you the crab."*

## 5. Enhancement: The Midsummer Fair Draft

A booster draft against seven AI drafters at a trestle table in the yard.

- **Entry:** 20 Checks. One run at a time; a run can be left and resumed (saved).
- **Packs:** 3 packs of 8 cards from the **draft pool**: every family card (the five originals and the Coven), every event card she could ever have earned so far (the packs to date, plus Hallowe'en), and the Almanack Headlines. **No legendaries, no tutorial-locked cards, no giftOnly cards in a public build.** Per pack: 5 commons, 2 uncommons and 1 rare. Packs are seeded per run.
- **Picks:** pick 1, pass left (packs 1 and 3) or right (pack 2), until all 24 cards are picked. AI drafters favour their first two picks' families and pick by value (printed points plus an ability weight).
- **Build:** a 20-card deck from her 24 picks, with the normal legality rules (§7.2: 2 copies max, ≤ 60 points). An **Auto-build** button picks the best legal 20.
- **Play:** three matches against three of the AI drafters' decks (seasoned dial), win or lose.
- **Prizes:**

| Wins | Prize |
|---|---|
| 0 | 10 Checks |
| 1 | 25 Checks |
| 2 | 50 Checks + keep **one** non-rare card from your picks |
| 3 | 100 Checks + keep **any one** card from your picks + (in June, from Jun 20) **Titania's match**: beat her (legend dial, using your drafted deck) for *Titania* |

- Drafted cards are **not** kept, except the souvenir pick. Her collection is untouched.
- The draft is a property of the event (`draft` on the pack), so it's June-only for now. ★ Brent: make it permanent later if she loves it.

## 6. Dressing and lines

- **Taproom variant** `background-the-taproom-midsummer-revel`: long golden midsummer evening light; birch boughs and yellow St John's wort over the door; paper lanterns strung across the ceiling; pale moths round the gaslamps; a ring of small mushrooms growing out of the floorboards by the fire, with a grey cat asleep in the middle of it; a donkey's-head mask hanging on a coat hook; a quill, an inkpot and a stack of folios at one table; through the window, a fair in the yard with a striped awning.
- **lockedHint:** *"Fair folk on the cellar stairs, and a playwright. Win a few hands first, and I'll introduce you."*
- **Sir Charles lines:**
  - *"Mr Shakespeare's asked to borrow the plot of the pub. I said it isn't mine to lend."*
  - *"There's a ring of mushrooms by the fire. Pixie says not to step in it. Charlotte's asleep in it."*
  - *"The longest day. The cellar door's been open since four this morning."*
- **Banner:** *"Midsummer at the Bridge. There's a drafting table at the fair in the yard, and a ring of mushrooms by the fire."*
- **Line overrides:**
  - `dickens`, when `shakespeare` has arrived: *"Mr Shakespeare. I've quoted you in every novel I've written. You've quoted me in none. I forgive you."*
  - `christie`, when `shakespeare` has arrived: *"I've been taking my titles from him for years. He's being very gracious about it."*
  - `holmes`, when `robin-goodfellow` has arrived: *"Someone has swapped every card in my deck for one very slightly different. I approve."*

---

## 7. Prompts

### Jn-A · The Midsummer Fair Draft and Friend-granting Locations (Build agent · Sonnet · L = 5)

```
Read CLAUDE.md, the last three docs/logs entries, docs/design.md §7, §10-§11 and §17, and docs/plans/monthly/08-june.md §5. April's House Rules (with grantsFriend) has landed.

1. Friend-granting Locations: let a Location card set a continuous `grantsFriend: true` (reuse the grantsFriend concept from the everyones-a-friend modifier): every face-up Character on both sides counts as having Friend +0 while it's the active Location. Validator, reminder text ("Every face-up Character counts as having Friend."), and tests that it enables Friend bonuses on both sides and stops when replaced.
2. Draft mode (generic, event-gated): an optional `draft: { entry: number; titanOpponentId?: string; titanFrom?: MonthDay }` on SeasonalEvent (name the queen field generically, e.g. `championOpponentId`).
   - Pool (src/draft/pool.ts): every family card, every event card whose pack window start has passed at least once since ledger.firstLaunch (Hallowe'en included), and every Almanack Headline; exclude legendaries, tutorialLocked cards, and giftOnly cards when edition is "public".
   - Packs: 3 × 8 per run (5 C, 2 U, 1 R; if a rarity runs short, fill from the next rarity down), seeded from the run seed.
   - Drafting: 8 seats (the player plus 7 AI), pick and pass (left, right, left), 24 picks each. AI pick = value (printed points + ability weight from the existing evaluator's card heuristics) with a bias toward the families of its first two picks. Show the player each pack as a fanned row, tap to pick, with a pick counter "Pack 1 · Pick 3".
   - Build: the existing deck-builder in "draft" mode limited to the 24 picks, with the normal legality rules and an Auto-build button (greedy best legal 20).
   - Play: three matches against three distinct AI drafters' decks on the seasoned dial; record W/L. Prizes per the §5 table; the souvenir pick is chosen from a list of eligible picks after the run. With 3 wins, if the event names a champion and today >= championFrom, offer the champion match (legend dial, with her drafted deck); a first win pays the champion's signature card once.
   - Save: an in-progress run (packs, picks, deck, results) persists and resumes; migration plus test. Only one run at a time.
   - UI entry: a "Drafting Table" sign on the fair in the hub, shown only while an event with draft is live.
3. design.md §17.8 "Draft".

Tests: pool composition (legendaries, tutorial and giftOnly excluded; events gated by date since first launch); pack rarity counts; deterministic AI picks for a seed; pass direction; 24 picks each; auto-build legality; prize table; souvenir rules (non-rare at 2 wins, any at 3); the champion offer gated by date and 3-0; resume after reload. One Playwright test that drafts all 24 picks with auto-pick and auto-builds.

Exit: npm run typecheck && npm test pass. Write /log. Push your branch and open a PR (wrapper W3). Don't merge.
```

### Jn-B · June content (Content agent · Haiku · M = 3)

```
Read CLAUDE.md, the last three docs/logs entries, and docs/plans/monthly/08-june.md in full. Jn-A has landed.

Use ss-card-author to author June exactly as specified:
- §2: opponents shakespeare (Jun 1) and robin-goodfellow (Jun 10), tier "visitor"; titania, tier "legend", draft-only (never in Tonight's Patrons or any bracket). Signature cards exactly as written (Titania's On Play flips each opposing face-up card with maxPoints 1; check that "each" targeting exists in the DSL as REMEMBER, REMEMBER uses it). Decks (Shakespeare's runs the-globe) and bet pools.
- §3: four event cards in src/cards/data/midsummerRevel.ts (the-globe uses grantsFriend; love-in-idleness steals a Friend card with maxPoints 2).
- §4: besom (coven) and almanack-cancer.
- The pack src/events/packs/midsummerRevel.ts: window Jun 1-30, visitors, minWins 3, cardPool, arrivalGifts (besom Jun 1, almanack-cancer Jun 21), almanackIds, tarotIds ["tarot-the-sun","tarot-the-world"], covenCardIds, sleeveId "sleeve-midsummer", banner, dressing and lineOverrides from §6 (taproomArtId "background-the-taproom-midsummer-revel"), and draft { entry: 20, championOpponentId: "titania", championFrom: Jun 20 }.

Art manifest: art/prompts/sheet-16-manifest.json with every image in 08-june.md §8. Ingest anything in art/inbox.

Balance: curve for both visitors (40-50% starter wins), deck-local edits only. Run 20 seeded draft runs headless (add a small script or test helper if needed) and report the average drafted-deck win rate vs AI drafters; flag anything outside 35-65%.

Tests: May 31 nothing; Jun 1 Shakespeare, the Besom gift and the Drafting Table; Jun 9 no Robin Goodfellow, Jun 10 yes; a 3-0 run on Jun 19 offers no Titania, on Jun 20 it does; Jun 21 Cancer once; Jul 1 everything gone (a run in progress on Jun 30 can still be finished on Jul 1, the same rule as brackets).

Exit: npm run typecheck && npm test pass. Write /log. Report back to the orchestrator; it merges, deploys and uploads the TestFlight build (runbook §5).
If you fail the exit check twice, stop and report; the orchestrator reruns this on Sonnet.
```

---

## 8. Gemini one-shot: June art (16 images)

> **Run by the art agent** (runbook `12-orchestration-runbook.md` §7) through Claude in Chrome on gemini.google.com, using Brent's own signed-in Gemini account. The numbered steps below are what the art agent does in the browser; "you" means the art agent. Reference files are read from the Mac repo (`~/projects/steampunk-shuffle/`), and every finished image lands in `~/projects/steampunk-shuffle/art/inbox/<asset id>.png`. Brent does nothing here.

1. Fresh Gemini chat, image generation on.
2. Attach, in order: `art/reference/The_Wheatstone_Bridge_taproom.jpeg`, `public/art/portrait-charles-dickens.webp`, `public/art/portrait-irene-adler.webp`, `public/art/portrait-spring-heeled-jack.webp`, `public/art/charlotte.webp`.
3. Paste the block, save each image as `art/inbox/<asset id>.png`, type **next** (or **redo: <fix>**, or **start at image N** in a new chat).

```
You are the illustrator for a steampunk card game set in The Wheatstone Bridge, a public house in 1871 London whose cellar door opens onto any century. This month is Midsummer: William Shakespeare, Robin Goodfellow (Puck) and Titania, Queen of the Fairies, visit, and a fair sets up in the yard. I need 16 images. Make them ONE AT A TIME, in the order below.

HOW WE WORK
- Each turn, generate exactly one image: the next one on the list. Start with image 1 now.
- After the image, write one line: "Image N of 16 — save as <asset id>.png". Put nothing else in the reply and don't ask questions. If something is ambiguous, pick the option that best fits the style rules and keep going.
- When I type "next", make the next image. When I type "redo: <note>", make the same image again with that fix. When I type "start at image N", jump to that image.
- Never put the asset id, a caption or any text inside the image itself.

ATTACHED REFERENCES
- Attachment 1 is the taproom of The Wheatstone Bridge, the style anchor for every image: match its painting style, brushwork, lighting and palette.
- Attachments 2-4 are existing portraits from the game. Use them ONLY as style references for rendering, finish, framing and light. Never copy their faces, clothing or identity.
- Attachment 5 is Charlotte, one of the pub's real cats (a grey-on-grey shorthair). Use her ONLY where an image says so.
- Card art for a character must show the SAME character you drew in the portrait just before it, in this chat.

SOURCE
Draw Shakespeare from his historical portraits (the Droeshout engraving and the Chandos portrait), and the fairies from English folklore and Victorian fairy painting (Richard Dadd, John Anster Fitzgerald, Joseph Noel Paton), not from any film, ballet costume or cartoon, and with no likeness of any actor.

HOUSE STYLE (every image unless it says otherwise)
Painterly digital illustration in a Victorian-engineering steampunk style: brass, steam, gaslight and iron, never goggles-and-corsets cosplay. Visible, controlled brushwork, like a colourised Victorian book plate. Confident inked contours softened by the paint underneath. Directional light: a warm key light from one side, cool ambient fill, real cast shadows. A faint paper-grain texture. ONE dominant colour plus parchment cream and warm ink black, with other colours only as small accents. Palette: brass/copper, oxblood leather, verdigris, gaslight amber, gunmetal blue, heather (dusky muted violet), parchment cream, warm ink black, sparing sovereign gold, plus midsummer gold and leaf green as small accents only. Paint to every edge: the game adds its own card border.

FRAMING BY TYPE
- Portrait (1:1): bust portrait, three-quarter turn, slightly tighter than bust-to-waist, soft blurred background.
- Card art (3:4): bust-to-waist (or as described), a moment of action, soft blurred background.
- Object or place card (3:4): the object or place is the subject.
- Almanack (3:4): looks PRINTED: a centred, symmetrical woodcut-engraving of a zodiac figure inside a brass orrery ring of concentric bands and small planets, on foxed parchment, warm ink black with one sovereign-gold accent. No glyphs, numbers or lettering.
- Tarot (2:3): the classic 1909 Rider-Waite-Smith composition for that card, repainted in the house style with Victorian-engineering details, thin painted border inside the image. No numerals, title or lettering.
- Sleeve (3:4): a card back: symmetrical, pattern-led, full-bleed, readable at thumbnail size. No lettering.
- Background (9:16): the full room, calm, uncluttered space in the lower third for game interface.

NEGATIVE RULES (every image, plus extras per image)
no text, no lettering, no numbers, no watermark, no signature, no logo, no photorealistic photography look, no 3D render look, no anime style, no cartoon style, no Tinker Bell style fairies, no goggles-and-corsets cosplay clichés, no modern clothing or objects, no gore, no graphic violence, no nudity, no distorted or extra hands/limbs, no border or frame (except tarot), no white or cream margin, no vignette

THE 16 IMAGES

1 · background-the-taproom-midsummer-revel · Background, 9:16
The SAME taproom as attachment 1, same layout, fireplace, brass piping and oxblood booths, on Midsummer Eve: long golden evening light slanting in; birch boughs and sprays of yellow St John's wort hung over the door; paper lanterns strung across the ceiling; pale moths circling the gaslamps; a ring of small pale mushrooms growing up between the floorboards by the fire, with the grey cat from attachment 5 asleep right in the middle of it; a donkey's-head mask hanging on a coat hook; a quill, inkpot and a stack of folios on a table; through the window, a fair in the yard with a striped awning and bunting. The empty chair by the fire is still slightly apart. No people.

2 · portrait-shakespeare · Portrait, 1:1, style reference attachment 2
William Shakespeare in his forties, as in the Chandos portrait: a high domed forehead, receding dark hair worn long at the sides, a neat short beard and moustache, a gold hoop earring, a plain dark doublet with a loose white linen collar untied at the neck, ink on his fingers, a quill tucked behind his ear and a wry, watchful, amused look. Behind him, softly blurred, the timber galleries of a playhouse. Verdigris dominant, sovereign-gold earring, parchment and ink, warm candle key light.

3 · shakespeare · Card art, 3:4, style reference attachment 2
The same Shakespeare as image 2, bust-to-waist, at a pub card table, scribbling on a sheet of foolscap (no legible writing) with his quill while glancing sideways at the other players as if he's stealing their conversation for a play; behind him, a tiny toy-theatre model of the Globe sits on the table, its little flag flying. Verdigris dominant, parchment and ink, warm candlelight.

4 · portrait-robin-goodfellow · Portrait, 1:1, style reference attachment 4
Robin Goodfellow, the Puck of English folklore: a wiry, small, sharp-featured hobgoblin youth with tousled chestnut hair full of leaves, pointed ears, a wicked grin, quick bright eyes, a jerkin made of bark and oak leaves, a little crown of hawthorn; he's half-hidden in a hedge at twilight, about to spring. Leaf green and gaslight amber, parchment and ink, glow-worm light.
Extra negatives: no wings, no Tinker Bell look.

5 · robin-goodfellow · Card art, 3:4, style reference attachment 4
The same Puck as image 4, crouched on top of a pub card table mid-trick, swapping a card from one player's side with a card from the other's in a blur of motion and a sparkle of fairy dust, one finger to his lips, grinning at the viewer. Leaf green and gaslight amber, parchment and ink.
Extra negatives: no wings.

6 · portrait-titania · Portrait, 1:1, style reference attachment 3
Titania, Queen of the Fairies, in the manner of a Victorian fairy painting: a tall, regal, otherworldly woman with long pale-gold hair crowned with wild roses, moonflowers and a few fine brass filigree leaves, luminous grey-green eyes, a flowing gown of layered gossamer in heather and moonlight tones, iridescent dragonfly wings folded behind her. Behind her, softly blurred, a moonlit glade with glow-worms. Heather dominant, moon-silver and sovereign gold, parchment and ink, cool moonlight with a warm glow.
Extra negatives: no nudity, no Tinker Bell look.

7 · titania · Card art, 3:4, style reference attachment 3
The same Titania as image 6, bust-to-waist, enthroned in a bower of roses and honeysuckle, raising one hand; at her gesture, a spray of glittering motes drifts across a card table and every small, low card on the opponent's side wilts and closes like a flower at night. Heather dominant, moon-silver, sovereign gold, parchment and ink.
Extra negatives: no nudity.

8 · the-globe · Place card, 3:4, no style reference
The Globe playhouse on Bankside, seen from the yard inside: a round, open-roofed wooden "O" of three tiers of galleries, thatched roof, the stage with its painted canopy (the "heavens") on two great painted pillars, a flag flying above, the groundlings' yard empty in afternoon light, a single small brass cannon peeking out of a gallery. Brass and timber, verdigris accents, parchment and ink, warm sunlight. No people.

9 · bottom-translated · Card art, 3:4, style reference attachment 2
Bottom the weaver, "translated": a cheerful, stocky Elizabethan workman in a leather apron and a rough linen shirt, whose head has been transformed into a donkey's head (long ears, soft grey muzzle, big kind eyes), looking enormously pleased with himself, a garland of flowers round his ears placed by unseen fairy hands, a tankard in one hand. Verdigris dominant, parchment and ink, warm glade light.

10 · st-johns-wort · Object card, 3:4, no style reference
A bunch of yellow St John's wort flowers and green birch twigs tied with red thread and hung from an iron nail over the arched wooden door of a pub on Midsummer Eve, golden evening light raking across the door; a few pale moths flutter near it but don't come close. Gaslight amber and gold, leaf green, parchment and ink. No people.

11 · love-in-idleness · Card art (vignette), 3:4, no style reference
Close-up: a small purple-and-yellow wild pansy (heartsease) held between a fairy's fingertips above the closed eyelid of a sleeping person (just the side of the face, eyelashes, a curl of hair, in shadow), a single shining drop of juice about to fall from the petal; moonlight and glow-worms. Heather dominant, moon-silver, parchment and ink.

12 · besom · Object card, 3:4, no style reference
A traditional besom broom of birch twigs bound with willow onto a hazel handle, leaning against a whitewashed cottage doorway, a red ribbon tied round the binding, a neat swept path in front of the doorstep curving out into a dark garden; the moon is up. Heather dominant, parchment and ink, warm light from the doorway. No people.
Extra negatives: no flying broom, no witch hat.

13 · almanack-cancer · Almanack, 3:4
Cancer: a large crab seen from above, claws raised, its shell engraved with fine patterning, centred in woodcut style inside a brass orrery ring of concentric bands and tiny planets, a crescent moon above it. Warm ink on foxed parchment, the crescent moon picked out in sovereign gold.

14 · tarot-the-sun · Tarot, 2:3
The Sun: a radiant sun with a calm face and long straight and wavy rays above a garden wall of tall sunflowers, a naked-shouldered child in a wreath (modestly draped in a red banner) riding a white horse bareback with arms outspread, holding a long red banner. In this version the sun is a polished brass sunburst and the wall is red brick. Midsummer gold and parchment, thin painted border.
Extra negatives: no nudity.

15 · tarot-the-world · Tarot, 2:3
The World: a dancing figure wrapped in a flowing violet sash, holding a slender wand in each hand, framed within a great oval laurel wreath tied with red ribbons, with an angel, an eagle, a lion and a bull in the four corners among clouds. In this version the wreath is laced with tiny brass leaves and the four corner figures are engraved like brass medallions. Leaf green, heather and sovereign gold, thin painted border.
Extra negatives: no nudity.

16 · sleeve-midsummer · Sleeve, 3:4
A card back: a perfect fairy ring of small pale mushrooms on a deep twilight-blue ground, pale moths and tiny stars scattered symmetrically, a crescent moon medallion in brass at the exact centre, and a thin repeating border of honeysuckle. Perfectly symmetrical top to bottom and left to right.

Begin with image 1 now.
```
