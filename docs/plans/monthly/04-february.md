# February: Wuthering Weather

**Window:** Feb 1 – Feb 28 (29 in leap years: end the window on `{month: 2, day: 29}` and let the clock clamp it) · **Arrivals:** Charlotte and Emily Feb 1 · Anne Feb 7 · **Tournament:** Feb 10 – 28
**Event id:** `wuthering-weather` · **Art sheet:** `sheet-12` · **minWins:** 3

## 1. The idea

The biggest in-joke in the game finally pays off. The Bridge's cats are named after the Brontës (Charlotte, Emily and Bramwell), and the snug is named after their parsonage in Haworth, "which none of them have visited". This February a gale blows in from Yorkshire and the Brontë sisters come up the cellar stairs and meet the cats named after them. Charlotte is not amused that her brother Branwell's name is misspelt.

The sisters first published as **Currer, Ellis and Acton Bell**, so the month's tournament is **The Bells' Hells**. That's a Critical Role Campaign 3 pun that is also literally true. Valentine's Day brings a gothic romance: Heathcliff, Cathy, and (**Bell's Hells allusion, giftOnly**) a pale, cheerful witch with a rat, and the mind-reader who loves her.

**Enhancements:** a pair-bond keyword, **Devoted (partner) +N**, and **Letters from B.**: date-triggered letters from Brent that only he writes.

## 2. Visitors and boss

| Arrives | Who | Tier · family · deck | Signature card (legendary) | Line |
|---|---|---|---|---|
| Feb 1 | **Charlotte Brontë** (`charlotte-bronte`), 1816–1855, *Jane Eyre* | visitor · Salon · Salon + Yard | *Charlotte Brontë*: 3 pts. Friend +2. On Play: turn one of your face-down cards face-up. *"Published as Currer Bell. Reader, she won."* | "You named a cat after me? …Is she very determined? Good." |
| Feb 1 | **Emily Brontë** (`emily-bronte`), 1818–1848, *Wuthering Heights* | visitor · Rookery · Rookery + Coven | *Emily Brontë*: 3 pts. Elusive. Moonrise +2. On Play: Flip an opposing card worth 2 or less. *"No coward soul is mine."* | "The moors were better company. The cats will do." |
| Feb 7 | **Anne Brontë** (`anne-bronte`), 1820–1849, *The Tenant of Wildfell Hall* | visitor · Salon · Salon + Irregulars | *Anne Brontë*: 2 pts. Friend +1. On Play: Draw 2. *"The quiet one. Wrote the most scandalous book of the three."* | "Charlotte talks, Emily walks off, and I win. Shall we?" |
| Feb 10–28, tournament only | **Heathcliff** (`heathcliff`), *Wuthering Heights* (1847) | legend (tournament-only) · Rookery · Rookery + Yard | *Heathcliff*: 5 pts. Persist. Devoted (Catherine Earnshaw) +2. On Play: Flip an opposing Friend card worth 3 or less. *"Whatever their souls are made of, his and hers are the same."* | *(He doesn't sit. He stands at the window, watching a moor that isn't there.)* |

## 3. Event cards

| Card id | Name | Family · type · rarity | Pts | Text | Flavour |
|---|---|---|---|---|---|
| `catherine-earnshaw` | Catherine Earnshaw | Rookery · character · U | 2 | Elusive. Devoted (Heathcliff) +3. | *Ran wild on the moors and married the wrong man. Haunts the right one.* |
| `the-pale-lady` · giftOnly | The Pale Lady | Coven · character · U | 2 | Undying. Devoted (The Mind-Reader) +2. | *Quite well, thank you. Her rat, Potted Meat, is quite well too. Neither has a pulse.* |
| `the-mind-reader` · giftOnly | The Mind-Reader | Salon · character · U | 2 | Devoted (The Pale Lady) +2. On Play: Reveal your opponent's hand. | *Hears every thought in the room and wishes she didn't. Except for one.* |
| `a-valentine-unsigned` | A Valentine, Unsigned | neutral · scheme · C | 0 | On Play: Draw 1, then turn one of your face-down cards face-up. | *Lace, a pressed violet, and no name. Mudd has had three. He suspects Nell.* |
| `the-heights-in-a-gale` | The Heights in a Gale | neutral · location · R | 0 | Each face-up Devoted card gets +1. | *A farmhouse at the top of the moor, where the wind has never once stopped. Emily calls it home.* |

## 4. Threads

- **Coven:** Tea-Leaf Reading (`tea-leaf-reading`): *"Swirl, tip, look. Pixie sees a journey. Sir Charles sees a cup that wants washing."* Arrival gift from Feb 1.
- **Almanack:** ♓ Pisces (`almanack-pisces`): *"Two fish tied together, swimming opposite ways. Neither will let go."* Arrival gift from Feb 19.
- **Tarot:** VI The Lovers, XV The Devil.
- **Sleeve:** `sleeve-moorland-heather`, sprigs of heather and storm-bent grass in a symmetrical lattice.
- **Extra arrival gift (Feb 1):** a **foil The Parsonage Snug**, with the line: *"Miss Anne says the Snug looks nothing like the Parsonage. She's hung a sampler on the wall anyway."* (She owns one from the starter deck, so this is the foil.)
- **Gift lines:** Feb 1 (Tea-Leaf Reading): *"Pixie's left you a cup, a saucer and some instructions. The instructions say 'drink it first'."* Feb 19: *"The almanack-seller came in out of the rain. Two fish, he says. I said we've plenty."*

## 5. Enhancements

**Devoted (partner) +N** (F-A, design.md §5.18): *(Worth N more while <partner> is face-up on your side.)* Rules text: while a face-up card named by this card's `devoted.partner` (a card id) is on the same side, this card gets +N. It's continuous, recomputed with Friend, and doesn't need the partner to return the bond. The UI draws a faint gold thread between bonded cards on the board.

**Letters from B.** (F-A, giftOnly): a sealed letter waits on the bar on a set date (claimable for 7 days after). It opens to a handwritten-style letter on parchment with a wax seal marked "B.", and is kept in a **Letters** album. The data holds Brent's own words. **The prompt writes no message text:** it ships with placeholders, and a letter whose body still contains `TODO(Brent)` is never shown (there's a test for that). **Settled (overview §10.3):** Brent writes every message and picks every date himself, in `src/letters/letters.ts`. Claude adds nothing personal: no message text, no extra dates, no names or details from anywhere else. The only shipped entry is the Feb 14 placeholder, which stays hidden until he replaces it.

## 6. Tournament: The Bells' Hells

| Field | Value |
|---|---|
| id | `bells-hells` · name giftOnly; `publicName: "The Moorland Cup"` |
| When | Feb 10 – 28 |
| Unlock | event live and 3+ wins |
| Field | Charlotte, Emily and Anne Brontë, Heathcliff, Prudence Hollis, Dickens + 1 random Seasoned |
| Entry rule | any legal deck |
| House Location | The Heights in a Gale |
| Entry / prize / consolation | 13 / *Heathcliff* + 150 / 13 |

## 7. Dressing and lines

- **Taproom variant** `background-the-taproom-wuthering-weather`: rain lashing sideways across the windows and the gaslamps outside bent in the wind; the fire roaring; a jar of heather on the bar; three small writing slopes with inkwells and stacks of manuscript at one table; lace valentines tucked into the frame of the bar mirror; a wet umbrella dripping by the door; the cats in their usual places.
- **lockedHint:** *"Three sisters on the cellar stairs, and a great deal of weather. Win a few hands first, and I'll introduce you."*
- **Sir Charles lines:**
  - *"Miss Brontë says the cat's name is spelt wrong. It's Branwell, with an N. Bramwell disagrees, loudly."*
  - *"Miss Charlotte met Charlotte. They regarded each other for some time. Neither blinked."*
  - *"Three Mr Bells have entered the tournament. They are not Mr Bells."*
- **Banner:** *"The weather's come down from Yorkshire. So have the Brontës."*
- **Line overrides:**
  - `prudence-hollis`, when `charlotte-bronte` has arrived: *"Three sisters who wrote under men's names. I've found my people."*
  - `dickens`, when `charlotte-bronte` has arrived: *"Miss Brontë has told me what she thinks of my endings. At length."*
  - `mudd`, from Feb 14: *"Someone's sent me a valentine. No name. Lace. I'm treating it as evidence."*

---

## 8. Prompts

### F-A · Devoted and Letters from B. (Build agent · Sonnet · M = 3)

```
Read CLAUDE.md, the last three docs/logs entries, docs/design.md §5.4 and §17, and docs/plans/monthly/04-february.md §5.

1. Devoted: Keywords gains devoted?: { partner: string; amount: number } (partner is a card id). In effectivePoints(), a face-up Devoted card gets +amount while a face-up card with that id is on the same side. It's one-directional and doesn't stack per copy. TargetFilter.hasKeyword already accepts any Keywords key, so "devoted" filters work; add a test. The validator checks that the partner id resolves to a real card (skipping giftOnly partners in a public build: a Devoted card whose partner is filtered just never gets its bonus). AI nudge: value playing a Devoted card when its partner is already face-up, and the partner when the Devoted card is. Reminder text renders the partner's name: "(Worth N more while Heathcliff is face-up on your side.)". UI: a faint animated gold thread between bonded face-up cards (static under Reduce Motion). House Rules entry and design.md §5.18.
2. Letters from B.: src/letters/letters.ts holds { id, date: MonthDay, title, body, giftOnly: true }[]. Ship ONE entry, "valentine", dated Feb 14, with title "TODO(Brent)" and body "TODO(Brent)". Write no message text and invent no dates or personal details: Brent writes every letter himself. Rules: a letter appears on the first launch on or after its date, claimable for 7 days, once per year per letter. The hub shows a sealed envelope on the bar; tapping it breaks a wax seal marked "B." (CSS/SVG, no art needed) and shows the body on parchment in a handwriting-style web font already bundled (or the game's serif if none is; don't add a network font). Opened letters go to a Letters album off the collection screen. A letter whose title or body contains "TODO(Brent)" is never shown: add a unit test that fails the build if the repo ships a letter with TODO text, but skip that test unless the env var LETTERS_STRICT=1 is set, so it only bites when the release agent runs `LETTERS_STRICT=1 npm test` after Brent has written a letter (runbook §9). Also add a line to tools/ship.sh that prints how many letters are still placeholders. Public edition: no letters at all.
3. design.md §17.5 "Letters".

Tests: Devoted on and off, with the partner face-down, both directions, a filter on devoted; letters showing on the date and within the 7-day grace, once per year, never with TODO text, never in a public build.

Exit: npm run typecheck && npm test pass; npm run sim shows no regression. Write /log. Push your branch and open a PR (wrapper W3). Don't merge.
```

### F-B · February content (Content agent · Haiku · M = 3)

```
Read CLAUDE.md, the last three docs/logs entries, and docs/plans/monthly/04-february.md in full. F-A has landed.

Use ss-card-author to author February exactly as specified:
- §2: opponents charlotte-bronte, emily-bronte (arrive Feb 1) and anne-bronte (Feb 7), tier "visitor"; heathcliff, tier "legend", tournament-only. Signature cards exactly as written (Heathcliff's Devoted partner is "catherine-earnshaw"). Decks and bet pools as listed.
- §3: five event cards in src/cards/data/wutheringWeather.ts. the-pale-lady and the-mind-reader are giftOnly and Devoted to each other.
- §4: tea-leaf-reading (coven) in families/coven.ts; almanack-pisces in almanack.ts.
- The pack src/events/packs/wutheringWeather.ts: window Feb 1 to Feb 29 (confirm the event clock handles Feb 29 in a non-leap year as "end of February"; add a test for 2027 and 2028); visitors; minWins 3; cardPool; arrivalGifts (tea-leaf-reading and a foil of the-parsonage-snug from Feb 1, almanack-pisces from Feb 19, lines from §4); almanackIds, tarotIds ["tarot-the-lovers","tarot-the-devil"], covenCardIds; sleeveId "sleeve-moorland-heather"; banner; dressing and lineOverrides from §7 (taproomArtId "background-the-taproom-wuthering-weather").
- §6: tournament bells-hells, with name "The Bells' Hells" marked giftOnly and publicName "The Moorland Cup" (add an optional publicName to Tournament that the public edition uses), an explicit field constant, and house Location the-heights-in-a-gale.

Art manifest: art/prompts/sheet-12-manifest.json with every image in 04-february.md §9. Ingest anything in art/inbox.

Balance: curve for all three sisters, target 40-50% starter wins; deck-local edits only.

Tests: Jan 31 nothing; Feb 1 Charlotte, Emily, both gifts; Feb 6 no Anne, Feb 7 yes; Feb 10 tournament with Heathcliff seated and not in Tonight's Patrons; Feb 14 Mudd's line; Feb 19 Pisces once; Mar 1 everything gone; a public build shows "The Moorland Cup" and no Pale Lady or Mind-Reader.

Exit: npm run typecheck && npm test pass. Write /log. Report back to the orchestrator. The letter stays a hidden placeholder until Brent writes it (runbook §9); shipping doesn't wait for it.
If you fail the exit check twice, stop and report; the orchestrator reruns this on Sonnet.
```

---

## 9. Gemini one-shot: February art (19 images)

> **Run by the art agent** (runbook `12-orchestration-runbook.md` §7) through Claude in Chrome on gemini.google.com, using Brent's own signed-in Gemini account. The numbered steps below are what the art agent does in the browser; "you" means the art agent. Reference files are read from the Mac repo (`~/projects/steampunk-shuffle/`), and every finished image lands in `~/projects/steampunk-shuffle/art/inbox/<asset id>.png`. Brent does nothing here.

1. Fresh Gemini chat, image generation on.
2. Attach, in order: `art/reference/The_Wheatstone_Bridge_taproom.jpeg`, `public/art/portrait-miss-prudence-hollis.webp`, `public/art/portrait-irene-adler.webp`, `public/art/portrait-professor-moriarty.webp`, `public/art/charlotte.webp`, `public/art/emily.webp`, `public/art/bramwell.webp`.
3. Paste the block, save each image as `art/inbox/<asset id>.png`, type **next** (or **redo: <fix>**, or **start at image N** in a new chat).

```
You are the illustrator for a steampunk card game set in The Wheatstone Bridge, a public house in 1871 London whose cellar door opens onto any century. This month a gale blows in from Yorkshire, bringing the Brontë sisters (Charlotte, Emily and Anne), Heathcliff and Catherine from "Wuthering Heights" (1847), and a Valentine's gothic romance. I need 19 images. Make them ONE AT A TIME, in the order below.

HOW WE WORK
- Each turn, generate exactly one image: the next one on the list. Start with image 1 now.
- After the image, write one line: "Image N of 19 — save as <asset id>.png". Put nothing else in the reply and don't ask questions. If something is ambiguous, pick the option that best fits the style rules and keep going.
- When I type "next", make the next image. When I type "redo: <note>", make the same image again with that fix. When I type "start at image N", jump to that image.
- Never put the asset id, a caption or any text inside the image itself.

ATTACHED REFERENCES
- Attachment 1 is the taproom of The Wheatstone Bridge, the style anchor for every image: match its painting style, brushwork, lighting and palette.
- Attachments 2-4 are existing portraits from the game. Use them ONLY as style references for rendering, finish, framing and light. Never copy their faces, clothing or identity.
- Attachments 5-7 are three of the pub's real cats as they appear in the game: Charlotte (grey-on-grey shorthair), Emily (tiny long-haired brown tabby) and Bramwell (tuxedo cat). Use them ONLY where an image says so, and keep each cat exactly as shown.
- Card art for a character must show the SAME character you drew in the portrait just before it, in this chat.

SOURCE
Draw the Brontës from their real 1840s likenesses and dress, and Heathcliff and Catherine from the novel, not from any film or TV version and with no likeness of any actor. The Pale Lady and the Mind-Reader are ORIGINAL characters: don't base them on any existing show, game or web-series characters or actors.

HOUSE STYLE (every image unless it says otherwise)
Painterly digital illustration in a Victorian-engineering steampunk style: brass, steam, gaslight and iron, never goggles-and-corsets cosplay. Visible, controlled brushwork, like a colourised Victorian book plate. Confident inked contours softened by the paint underneath. Directional gaslight: a warm key light from one side, cool ambient fill, real cast shadows. A faint paper-grain texture. ONE dominant colour plus parchment cream and warm ink black, with other colours only as small accents. Palette: brass/copper, oxblood leather, verdigris, gaslight amber, gunmetal blue, heather (dusky muted violet), parchment cream, warm ink black, sparing sovereign gold. Paint to every edge: the game adds its own card border.

FRAMING BY TYPE
- Portrait (1:1): bust portrait, three-quarter turn, slightly tighter than bust-to-waist, soft blurred background.
- Card art (3:4): bust-to-waist (or as described), a moment of action, soft blurred background.
- Object or place card (3:4): the object or place is the subject; no people unless described.
- Almanack (3:4): looks PRINTED: a centred, symmetrical woodcut-engraving of a zodiac figure inside a brass orrery ring of concentric bands and small planets, on foxed parchment, warm ink black with one sovereign-gold accent. No glyphs, numbers or lettering.
- Tarot (2:3): the classic 1909 Rider-Waite-Smith composition for that card, repainted in the house style with Victorian-engineering details, thin painted border inside the image. No numerals, title or lettering.
- Sleeve (3:4): a card back: symmetrical, pattern-led, full-bleed, readable at thumbnail size. No lettering.
- Background (9:16): the full room, calm, uncluttered space in the lower third for game interface.

NEGATIVE RULES (every image, plus extras per image)
no text, no lettering, no numbers, no watermark, no signature, no logo, no photorealistic photography look, no 3D render look, no anime style, no cartoon style, no goggles-and-corsets cosplay clichés, no modern clothing or objects, no gore, no graphic violence, no nudity, no hearts-and-cupids clip art, no distorted or extra hands/limbs, no border or frame (except tarot), no white or cream margin, no vignette

THE 19 IMAGES

1 · background-the-taproom-wuthering-weather · Background, 9:16
The SAME taproom as attachment 1, same layout, fireplace, brass piping and oxblood booths, on a wild February night: rain driving sideways across the gunmetal-blue windows and the gaslamps outside bending in the wind; the fire roaring high; a stoneware jar of purple heather on the bar; at one table, three small wooden writing slopes with inkwells, quills and untidy stacks of handwritten manuscript; lace valentines tucked into the frame of the bar mirror; a wet umbrella dripping by the door. A black cat asleep on a stool. The empty chair by the fire is still slightly apart. No people.

2 · portrait-charlotte-bronte · Portrait, 1:1, style reference attachment 2
Charlotte Brontë in the 1840s: a small, slight woman of about thirty, hair parted in the centre and smoothed over her ears, a plain dark silk dress with a white lace collar and a mourning brooch, a strong, steady, intelligent gaze and a firm mouth. Behind her, softly blurred, the pub's fireside with a grey cat asleep on the hearth. Verdigris dominant, parchment and ink, warm firelight key.

3 · charlotte-bronte · Card art, 3:4, style reference attachment 2
The same Charlotte Brontë as image 2, bust-to-waist, seated at a pub card table and coolly turning a face-down card face-up with one finger, while beside her on the table the grey-on-grey cat from attachment 5 sits exactly as determined and unblinking as she is, the two of them regarding the viewer with the same expression. Verdigris dominant, parchment and ink, warm gaslight.

4 · portrait-emily-bronte · Portrait, 1:1, style reference attachment 3
Emily Brontë in the 1840s: tall and slim, in her late twenties, dark hair loosely pinned and blown about by wind, a plain dark wool dress and a heavy shawl, a reserved, fierce, faraway look, a sprig of heather in her hand. Behind her, softly blurred, open moorland under a stormy sky. Oxblood and heather dominant, parchment and ink, cold silvery storm light with a warm side light.

5 · emily-bronte · Card art, 3:4, style reference attachment 3
The same Emily Brontë as image 4, bust-to-waist, striding out across a wind-torn moor at dusk under a rising moon, shawl streaming, a large dog loping at her side; in her free hand a single playing card held against the wind. Oxblood and heather dominant, cold moonlight, parchment and ink.

6 · portrait-anne-bronte · Portrait, 1:1, style reference attachment 2
Anne Brontë in the 1840s: the youngest sister, in her mid-twenties, gentle-faced with light brown curls at her temples, violet-blue eyes, a pale lilac-grey dress with a white collar, a quiet, amused, watchful expression that suggests she's the cleverest person in the room. Behind her, softly blurred, a seaside town at sunset. Verdigris dominant, heather accents, parchment and ink, warm low sunlight.

7 · anne-bronte · Card art, 3:4, style reference attachment 2
The same Anne Brontë as image 6, bust-to-waist, at a pub card table calmly drawing two cards from her deck while her two sisters (seen from behind, blurred) argue across the table; the tiny brown long-haired tabby from attachment 6 sits on her lap with a paw on the deck. Verdigris dominant, parchment and ink, warm gaslight.

8 · portrait-heathcliff · Portrait, 1:1, style reference attachment 4
Heathcliff as Emily Brontë describes him: a tall, dark-skinned, black-haired man of about thirty with deep-set dark eyes under heavy brows, a brooding, wounded, dangerous face, in a dark country gentleman's coat and loosened neckcloth, rain on his shoulders. Behind him, softly blurred, a stormy moor and a farmhouse window with a faint pale hand against the glass. Oxblood and ink dominant, cold storm light, parchment highlights.
Extra negatives: no likeness of any actor.

9 · heathcliff · Card art, 3:4, style reference attachment 4
The same Heathcliff as image 8, bust-to-waist, standing at a rain-streaked pub window with one hand flat against the glass, staring out at a moor that shouldn't be there beyond it; on the card table behind him, an opponent's card is turning face-down by itself. Oxblood dominant, cold blue storm light from the window, warm gaslight behind, parchment and ink.

10 · catherine-earnshaw · Card art, 3:4, style reference attachment 3
Catherine Earnshaw as a wild young woman of about eighteen: dark tangled hair full of heather, a fine but torn and muddied gown with her skirts hitched up, laughing as she runs barefoot across the open moor in a gale, looking back over her shoulder at someone off frame. Oxblood and heather dominant, wild storm light, parchment and ink.

11 · the-pale-lady · Card art, 3:4, style reference attachment 3
The Pale Lady, an ORIGINAL character: a very pale, cheerful, slightly unsettling young Victorian woman with long dark hair with a streak of white, dark-ringed eyes and a sweet, lopsided smile, in a worn black dress with a high lace collar that sits just a little too high on her neck. On her shoulder sits a small, scruffy, pleased-looking brown rat wearing a tiny knitted scarf. She is waving at someone off frame. Heather dominant, parchment and ink, soft cold light with a warm candle glow.
Extra negatives: no rope, no noose, no corpse, no gore, no visible injury.

12 · the-mind-reader · Card art, 3:4, style reference attachment 2
The Mind-Reader, an ORIGINAL character: a young Victorian woman with long lavender-grey hair loosely braided, tired kind eyes, a deep red-violet dress and a dark travelling cloak, one hand pressed to her temple as faint silvery threads of other people's thoughts drift around her head like smoke; she's looking off frame toward someone she loves, smiling despite the headache. A blood-red crescent moon hangs low in the window behind. Heather and oxblood dominant, parchment and ink, silver thought-light.

13 · a-valentine-unsigned · Object card, 3:4, no style reference
A Victorian lace-paper valentine lying on a pub bar beside a pint: layered paper lace, a pressed violet at the centre, a tiny painted pair of birds, an envelope beside it with a red wax seal and no address. Warm gaslight, parchment cream dominant, violet and oxblood accents. No legible writing.

14 · the-heights-in-a-gale · Place card, 3:4, no style reference
A lonely, weather-beaten stone farmhouse on the top of a bleak moor in a howling gale, a few stunted firs and thorns all bent the same way by the wind, a single lit window, dark heather rolling away under a torn sky with moonlight breaking through. Heather and gunmetal blue dominant, parchment and ink. No people.

15 · tea-leaf-reading · Card art (vignette), 3:4, no style reference
A delicate Victorian china teacup tipped over on its saucer on a lace cloth, the wet tea leaves inside clearly forming the shape of a little ship and a bird; a woman's ringed hand (wrist only, a fringed shawl cuff) holds the cup's handle, and a teapot and candle sit beyond. Heather dominant, parchment and ink, warm candlelight.

16 · almanack-pisces · Almanack, 3:4
Pisces: two fish swimming in opposite directions, their tails joined by a long curving cord, engraved in woodcut style at the centre of a brass orrery ring of concentric bands and tiny planets. Warm ink on foxed parchment, the cord picked out in sovereign gold.

17 · tarot-the-lovers · Tarot, 2:3
The Lovers: a man and a woman standing beneath a great winged angel who blesses them from a radiant sun in the clouds, a fruit tree with a serpent behind the woman and a tree of flames behind the man, a mountain between them. In this version the angel's wings have a fine brass-feather sheen and the sun is a brass sunburst. Both figures modestly draped in simple pale robes. Sovereign gold and parchment, thin painted border.

18 · tarot-the-devil · Tarot, 2:3
The Devil: a horned, bat-winged figure crouched on a black pedestal holding a torch downward, a loose chain from the pedestal to the necks of two small robed figures who could easily lift it off. In this version the figure is a hulking brass-and-iron furnace-demon with bellows wings and a glowing grate, and the chains are visibly loose. Ink black and furnace-oxblood, thin painted border. Unsettling, not gory.
Extra negatives: no nudity, no gore, no blood.

19 · sleeve-moorland-heather · Sleeve, 3:4
A card back: a symmetrical lattice of heather sprigs and wind-bent moor grass in heather violet and verdigris on a deep ink ground, a small round brass medallion of a curled sleeping cat at the exact centre, and a thin repeating border of tiny heather flowers. Perfectly symmetrical top to bottom and left to right.

Begin with image 1 now.
```
