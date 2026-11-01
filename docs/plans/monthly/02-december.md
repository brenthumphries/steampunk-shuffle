# December: A Ghost Story for Christmas

**Window:** Dec 1 – Dec 31 · **Arrivals:** Mr Pockett Dec 1 · Ghost of Christmas Present Dec 12 · **Tournament:** Dec 18 – 31
**Event id:** `ghost-story` · **Art sheet:** `sheet-10` · **minWins:** 3

## 1. The idea

The Victorians told ghost stories on Christmas Eve, and the Bridge's own Charles Dickens wrote the most famous one. This December the spirits from his *Carol* (1843, public domain) come up the cellar stairs to hear him read it. A cross little clockmaker from Bethnal Green fills the bar with clockwork toys and won't discuss the scratches on the door. A brass advent cabinet appears behind the bar, with a little door for every day until Christmas.

Witchy notes: Yule and the solstice, a Yule log kept from last year's, salt at the threshold. **Bell's Hells allusion (giftOnly):** Mr Pockett, a tiny, grumpy master toymaker who is very obviously a werewolf, for Chetney fans.

## 2. Visitors and boss

| Arrives | Who | Tier · family · deck | Signature card (legendary) | Line |
|---|---|---|---|---|
| Dec 1 | **Mr Pockett, Toymaker** (`mr-pockett`) · **giftOnly** | visitor · Foundry · Foundry + Irregulars | *Mr Pockett*: 2 pts. Persist. Moonrise +3. On Play: Draw 1. *"The finest clockmaker in Bethnal Green. Doesn't want to talk about the full moon."* | "Don't touch the toys. Don't ask about the wolf thing. Deal." |
| Dec 12 | **The Ghost of Christmas Present** (`ghost-of-christmas-present`), Dickens, *A Christmas Carol* | visitor · Salon · Salon + Yard | *The Ghost of Christmas Present*: 4 pts. Friend +2. On Play: each of your other face-up Friend cards gets +1. *"Has more than eighteen hundred brothers, and brought every one of them a mince pie."* | "Come in! And know me better, man!" |
| Dec 18–31, tournament only | **The Ghost of Christmas Yet to Come** (`ghost-of-christmas-yet-to-come`) | legend (tournament-only) · Rookery · Rookery + Coven | *The Ghost of Christmas Yet to Come*: 4 pts. Elusive. On Play: Scry 3. Each opposing face-up card gets -1. *"Says nothing. Points."* | *(It says nothing. It points at your deck.)* |

## 3. Event cards

| Card id | Name | Family · type · rarity | Pts | Text | Flavour |
|---|---|---|---|---|---|
| `wassail-bowl` | Wassail Bowl | neutral · gadget · C | 1 | Friend +1. | *"Wassail! Drink hail!" The cats decline.* |
| `yule-log` | Yule Log | neutral · gadget · U | 1 | Persist. Undying. | *Lit from a piece of last year's. It has never once gone out.* |
| `a-whistle-on-the-shingle` | A Whistle on the Shingle | Irregulars · scheme · U | 0 | On Play: turn one of your face-down cards face-up, then Draw 1. | *Found in a ruin on the Suffolk shore. Don't blow it. He blew it.* |
| `the-fireside-tale` | The Fireside Tale | neutral · location · R | 0 | Each face-up Undying card gets +1. Each face-up Return card gets +1. | *Christmas Eve, the lamps turned down, and someone always begins: "This happened to a friend of mine."* |

(The Whistle tips its hat to M. R. James's *"Oh, Whistle, and I'll Come to You, My Lad"* (1904), which is public domain.)

## 4. Threads

- **Coven:** Salt at the Threshold (`salt-at-the-threshold`): *"A line of salt across the doorstep. Whatever's outside can wait outside."* Arrival gift from Dec 1.
- **Almanack:** ♑ Capricorn (`almanack-capricorn`): *"A goat with a fish's tail. Climbs anything, and gets there in the end."* Arrival gift from Dec 22 (the solstice and Capricorn season).
- **Tarot:** II The High Priestess, IX The Hermit.
- **Arrival gift lines:** Dec 1: *"There's salt on the step and a packet of it on the bar, addressed to you. Pixie says it's sensible."* Dec 22: *"Longest night of the year. The almanack-seller came in for the fire and left next month's page."*

## 5. The Advent Cabinet (enhancement)

A brass cabinet with 24 numbered doors appears behind the bar from Dec 1 to Jan 6. Each day from Dec 1 to Dec 24 opens one door, and **any past door can still be opened until Twelfth Night (Jan 6)**, because nothing has to be done on the day (overview §2.6). Future doors stay shut. Door contents are data in the pack (`advent: AdventDoor[]`), so any later event could reuse the cabinet.

| Doors | Contents |
|---|---|
| 1, 3, 4, 6, 8, 9, 11, 13, 15, 16, 18, 20, 21, 23 | Checks: 10, 10, 15, 10, 15, 20, 10, 15, 20, 10, 15, 20, 15, 25 (total 210) |
| 2 | `wassail-bowl` |
| 5 | `yule-log` |
| 7 | `a-whistle-on-the-shingle` |
| 10 | `salt-at-the-threshold` |
| 12 | `the-fireside-tale` |
| 14 | a Lost & Found token (her next Lost & Found pull is a guaranteed uncommon or better) |
| 17 | `stir-up-pudding` |
| 19 | a Tinker's Bench token (one free fuse) |
| 22 | `almanack-capricorn` (a second copy; the arrival gift is the first) |
| 24 | 50 Checks and a beer mat: *"Christmas Eve. Lamps down. Mr Dickens is about to begin."* |
| **Christmas Day** (Dec 25, a 25th door that only opens on or after Dec 25) | a **foil Bramwell** (the starter deck's cat), with the beer mat *"Happy Christmas, Landlady. The cats got you something. It's a foil. They didn't wrap it."* (Brent ★: swap in a different cat if you like.) |

**Snowfall:** a new optional `dressing.weather: "snow"` draws gentle CSS snow over the hub windows only, and a static frost for Reduce Motion.

## 6. Tournament: The Fireside Circle

| Field | Value |
|---|---|
| id | `fireside-circle` |
| When | Dec 18 – 31 |
| Unlock | event live and 3+ wins |
| Field | Ghost of Christmas Present, Mr Pockett, Dickens, Ghost of Christmas Yet to Come + 3 random Seasoned |
| Entry rule | any legal deck |
| House Location | The Fireside Tale |
| Entry / prize / consolation | 13 / *The Ghost of Christmas Yet to Come* + 150 / 13 |

## 7. Dressing and lines

- **Taproom variant** `background-the-taproom-ghost-story`: snow at the windows, holly and ivy twined along the brass pipes, a steaming wassail bowl on the bar, a fat Yule log blazing in the fireplace, a small Victorian Christmas tree with paper ornaments and tiny brass cogs, a clockwork toy train paused on the bar, and the cats in their usual places. `weather: "snow"`.
- **lockedHint:** *"Spirits on the cellar stairs. Seasonal ones. Win a few hands first, and I'll introduce you."*
- **Sir Charles lines:**
  - *"Prince Albert brought the tree over. I've added cogs. He'd have wanted cogs."*
  - *"Ghost stories on Christmas Eve. It's tradition. The ghosts insist."*
  - *"Mr Pockett says the scratches on the door are 'a toy'. I've chosen to believe him."* (giftOnly)
- **Banner:** *"It's December at the Bridge. There's a brass cabinet behind the bar with twenty-four little doors in it."*
- **Line overrides:**
  - `dickens`, when `ghost-of-christmas-present` has arrived: *"I've read that story aloud a hundred times. He's never come to listen before."*
  - `lovelace`, when `mr-pockett` has arrived: *"His escapements are better than Babbage's. Please don't tell Babbage."* (giftOnly, since it's attached to an allusion character)
  - `holmes`, from Dec 18: *"The tall one in black hasn't said a word all evening. I find I like him."*

---

## 8. Prompts

### D-A · The Advent Cabinet and snowfall (Build agent · Sonnet · M = 3)

```
Read CLAUDE.md, the last three docs/logs entries, and docs/plans/monthly/02-december.md §5 and §7. The November framework (content packs, arrival gifts, the Ledger) has landed.

Build the Advent Cabinet and the snowfall dressing as generic event features.

1. Data: an optional `advent` field on SeasonalEvent: { opensFrom: MonthDay; lastClaim: MonthDay; doors: AdventDoor[] }. AdventDoor = { day: number; reward: { checks?: number; cardId?: string; token?: "lostAndFoundUncommon" | "tinkerFree"; foilOf?: string }; line?: string }. lastClaim may fall in the next calendar year (Jan 6 after a December window): handle the wrap explicitly and test it.
2. Rules: door N opens on or after day N of the opening month and stays claimable until lastClaim. Future doors are shut. A claimed door stays open (shows what it held). Claims are persisted per event per year. Tokens persist until used: lostAndFoundUncommon makes the next Lost & Found pull at least uncommon; tinkerFree makes the next fuse free (stack with the Booth's tinkerFree omen without double-spending). foilOf grants a foil of an owned card id (or the card plus foil if not owned).
3. UI: while an event with advent is between opensFrom and lastClaim, the hub shows a brass cabinet behind the bar (art id "advent-cabinet", falling back to an SVG brass grid if the image is missing). Tapping it opens a 5x5 grid of numbered brass doors (24 plus a 25th, larger door). An openable door glints; tapping it swings it open (respect Reduce Motion), shows the reward, and plays the existing unwrap animation for cards.
4. Snowfall: an optional dressing.weather: "snow". The hub draws light CSS/canvas snow over the window area only, never over interactive UI, capped to keep the iPhone at 60fps. With Reduce Motion, show a static frost overlay instead.
5. design.md §17.3 "Advent cabinet and weather".

Tests: door-open rules across Nov 30 / Dec 1 / Dec 24 / Dec 25 / Jan 6 / Jan 7 with the year wrap; claims persist and are never granted twice; tokens consumed exactly once, including alongside the tinkerFree omen; foil grant for an owned and an unowned card. Playwright: ?now=2026-12-03&preview=1 opens doors 1-3 and door 4 stays shut.

Exit: npm run typecheck && npm test pass. Write /log. Push your branch and open a PR (wrapper W3). Don't merge.
```

### D-B · December content (Content agent · Haiku · M = 3)

```
Read CLAUDE.md, the last three docs/logs entries, and docs/plans/monthly/02-december.md in full. D-A has landed.

Use ss-card-author to author December exactly as specified:
- §2: opponents mr-pockett and ghost-of-christmas-present (tier "visitor", arrivals Dec 1 and Dec 12) and ghost-of-christmas-yet-to-come (tier "legend", tournament-only, excluded from Tonight's Patrons). Mark mr-pockett, his signature card and every line that mentions him giftOnly: true. Signature cards with the exact text and flavour shown; 20-card decks per the deck column; bet pools from §3 plus salt-at-the-threshold.
- §3: four event cards in src/cards/data/ghostStory.ts. The Fireside Tale has two continuous buff abilities (hasKeyword undying, hasKeyword return), so a card with both gets +2; note that in the card file.
- §4: salt-at-the-threshold (family coven) in families/coven.ts; almanack-capricorn (frame almanack, glyph ♑, text from overview §5.2) in almanack.ts.
- The pack src/events/packs/ghostStory.ts: window Dec 1-31; visitors; minWins 3; cardPool (§3 cards, salt-at-the-threshold, almanack-capricorn); arrivalGifts (salt from Dec 1, Capricorn from Dec 22, lines from §4); almanackIds, tarotIds ["tarot-the-high-priestess","tarot-the-hermit"], covenCardIds; banner; dressing from §7 including weather "snow" and taproomArtId "background-the-taproom-ghost-story"; lineOverrides (the holmes one applies from Dec 18: add a `from?: MonthDay` to LineOverride if it isn't supported yet, with a test).
- §5: the advent field: opensFrom Dec 1, lastClaim Jan 6, and the 25 doors exactly as the table lists them (door 25 = Christmas Day, foilOf "bramwell").
- §6: tournament fireside-circle (explicit field constant, house Location the-fireside-tale), registered in the pack.

Art manifest: art/prompts/sheet-10-manifest.json with a row for every image in 02-december.md §9 (prompt field: "See docs/plans/monthly/02-december.md §9"). Ingest anything in art/inbox.

Balance: npm run curve -- seasoned seasoned 200 for both visitors, target 40-50% starter wins; deck-local edits only.

Tests: Nov 30 nothing; Dec 1 Pockett, cabinet, snow, salt gift; Dec 11 no Ghost of Present, Dec 12 yes; Dec 17 no tournament, Dec 18 yes, with Yet to Come in it but not in Tonight's Patrons; Dec 22 Capricorn gift once; Dec 25 door 25; Jan 1 visitors and tournament gone but the cabinet still claimable until Jan 6; a public-edition build has no Mr Pockett anywhere (and the Fireside Circle field still fills to 7 with a random Seasoned).

Exit: npm run typecheck && npm test pass. Write /log. Report back to the orchestrator; it merges, deploys and uploads the TestFlight build (runbook §5).
If you fail the exit check twice, stop and report; the orchestrator reruns this on Sonnet.
```

---

## 9. Gemini one-shot: December art (16 images)

> **Run by the art agent** (runbook `12-orchestration-runbook.md` §7) through Claude in Chrome on gemini.google.com, using Brent's own signed-in Gemini account. The numbered steps below are what the art agent does in the browser; "you" means the art agent. Reference files are read from the Mac repo (`~/projects/steampunk-shuffle/`), and every finished image lands in `~/projects/steampunk-shuffle/art/inbox/<asset id>.png`. Brent does nothing here.

1. Fresh Gemini chat, image generation on.
2. Attach, in order: `art/reference/The_Wheatstone_Bridge_taproom.jpeg`, `public/art/portrait-charles-dickens.webp`, `public/art/portrait-ada-lovelace.webp`, `public/art/portrait-professor-moriarty.webp`.
3. Paste the block, save each image as `art/inbox/<asset id>.png`, type **next** (or **redo: <fix>**, or **start at image N** in a new chat).

```
You are the illustrator for a steampunk card game set in The Wheatstone Bridge, a public house in 1871 London whose cellar door opens onto any century. This month is a Victorian Christmas: the spirits from Charles Dickens's 1843 "A Christmas Carol" visit, a little clockmaker fills the bar with toys, and there is a brass advent cabinet behind the bar. I need 16 images. Make them ONE AT A TIME, in the order below.

HOW WE WORK
- Each turn, generate exactly one image: the next one on the list. Start with image 1 now.
- After the image, write one line: "Image N of 16 — save as <asset id>.png". Put nothing else in the reply and don't ask questions. If something is ambiguous, pick the option that best fits the style rules and keep going.
- When I type "next", make the next image. When I type "redo: <note>", make the same image again with that fix. When I type "start at image N", jump to that image.
- Never put the asset id, a caption or any text inside the image itself.

ATTACHED REFERENCES
- Attachment 1 is the taproom of The Wheatstone Bridge, the style anchor for every image: match its painting style, brushwork, lighting and palette.
- Attachments 2-4 are existing portraits from the game. Use them ONLY as style references for rendering, finish, framing and light. Never copy their faces, clothing or identity.
- Card art for a character must show the SAME character you drew in the portrait just before it, in this chat.

SOURCE
Draw the Carol spirits from Dickens's own descriptions only, not from any film, cartoon or Muppet version, and with no likeness of any actor.

HOUSE STYLE (every image unless it says otherwise)
Painterly digital illustration in a Victorian-engineering steampunk style: brass, steam, gaslight and iron, never goggles-and-corsets cosplay. Visible, controlled brushwork, like a colourised Victorian book plate. Confident inked contours softened by the paint underneath. Directional gaslight: a warm key light from one side, cool ambient fill, real cast shadows. A faint paper-grain texture. Mechanical details look buildable. ONE dominant colour plus parchment cream and warm ink black, with other colours only as small accents. Palette: brass/copper, oxblood leather, verdigris, gaslight amber, gunmetal blue, heather (dusky muted violet), parchment cream, warm ink black, sparing sovereign gold, plus holly green and berry red as small seasonal accents only. Paint to every edge: the game adds its own card border.

FRAMING BY TYPE
- Portrait (1:1): bust portrait, three-quarter turn, slightly tighter than bust-to-waist, soft blurred background.
- Card art (3:4): bust-to-waist (or as described), a moment of action, soft blurred background.
- Object or place card (3:4): the object or place is the subject; no people unless described.
- Almanack (3:4): looks PRINTED, not painted: a centred, symmetrical woodcut-engraving of a zodiac figure inside a brass orrery ring of concentric bands and small planets, on foxed parchment, warm ink black with one sovereign-gold accent. No glyphs, numbers or lettering.
- Tarot (2:3): the classic 1909 Rider-Waite-Smith composition for that card, repainted in the house style with Victorian-engineering details, thin painted border inside the image. No numerals, title or lettering.
- Background (9:16): the full room, calm, uncluttered space in the lower third for game interface.

NEGATIVE RULES (every image, plus extras per image)
no text, no lettering, no numbers, no watermark, no signature, no logo, no photorealistic photography look, no 3D render look, no anime style, no cartoon style, no goggles-and-corsets cosplay clichés, no Santa Claus, no reindeer, no modern Christmas decorations or tinsel, no modern clothing or objects, no gore, no graphic violence, no skulls, no distorted or extra hands/limbs, no border or frame (except tarot), no white or cream margin, no vignette

THE 16 IMAGES

1 · background-the-taproom-ghost-story · Background, 9:16
The SAME taproom as attachment 1, same layout, fireplace, brass piping and oxblood booths, dressed for Christmas Eve 1871: snow settled on the window ledges and drifting past the gunmetal-blue panes; holly and ivy twined along the brass pipes; a steaming silver wassail bowl with floating roasted apples on the bar; a fat Yule log blazing in the fireplace; a small Victorian Christmas tree with paper chains, candles and tiny brass cogs as ornaments; a small clockwork toy train paused on the bar top; a black cat asleep on a stool. The empty chair by the fire is still slightly apart. No people.

2 · portrait-mr-pockett · Portrait, 1:1, style reference attachment 3
Mr Pockett, a Victorian master clockmaker and toymaker from Bethnal Green: a very short, stocky, elderly man with enormous bristling grey mutton-chop whiskers, bushy eyebrows, a jeweller's loupe screwed into one eye, a scowl that is mostly bluster, a leather apron full of tiny screwdrivers over a waistcoat. The only hint of anything odd: his eyes catch the light a little yellow, there are coarse grey tufts of hair at his cuffs, and three neat claw-scratches mark the workbench behind him. Behind him, softly blurred, shelves of clockwork toys: tin soldiers, a dancing bear, a little brass wolf. Brass and copper dominant, parchment and ink, warm lamplight.
Extra negatives: no gnome, no pointed ears, no fantasy creature, no full werewolf, no fangs.

3 · mr-pockett · Card art, 3:4, style reference attachment 3
The same tiny whiskered clockmaker as image 2, bust-to-waist, hunched over a pub table winding a clockwork toy wolf with a brass key while three other wind-up toys (a soldier, a bear, a train) march across the table; he glares at the viewer as if daring them to touch one. Through the window behind him a huge full moon rises over snowy rooftops, and his shadow on the wall is, very faintly, the wrong shape. Brass dominant, parchment and ink, moon-silver accent.
Extra negatives: no full werewolf, no fangs, no gnome.

4 · portrait-ghost-of-christmas-present · Portrait, 1:1, style reference attachment 2
The Ghost of Christmas Present as Dickens describes him: a jolly giant with a genial face, sparkling eyes, dark brown curls, a holly wreath set with shining icicles on his head, a simple deep-green robe bordered with white fur, open at the broad chest, holding high a glowing torch shaped like Plenty's horn. Behind him, softly blurred, a heaped Victorian feast. Verdigris and holly green dominant, warm torch-gold light, parchment and ink.
Extra negatives: no Santa Claus look, no red suit.

5 · ghost-of-christmas-present · Card art, 3:4, style reference attachment 2
The same jolly giant spirit as image 4, bust-to-waist, leaning over a crowded pub card table and sprinkling golden incense-sparks from his torch over everyone's cards; where the sparks fall, the cards glow warmly, and the pub folk around the table (a constable, a flower seller, a vicar's daughter, seen from behind and blurred) brighten and laugh. Verdigris dominant, warm torch-gold, parchment and ink.

6 · portrait-ghost-of-christmas-yet-to-come · Portrait, 1:1, style reference attachment 4
The Ghost of Christmas Yet to Come as Dickens describes it: a tall, stately phantom shrouded entirely in a deep black garment that hides its head, face and form, leaving nothing visible but one outstretched hand, pale and still. It stands in thick London fog by a gaslamp, and it is silent. Ink black dominant, cold gunmetal-blue fog, a single small warm gaslamp glow, parchment highlights. Solemn, not horrific.
Extra negatives: no skull, no skeleton, no visible face, no scythe, no glowing red eyes.

7 · ghost-of-christmas-yet-to-come · Card art, 3:4, style reference attachment 4
The same shrouded phantom as image 6, bust-to-waist, one pale hand extended over a card table and pointing down at the top card of a deck, which has slid an inch forward on its own; across the table, the opponent's cards are dimmed and greyed as if seen through fog. Ink black and gunmetal blue dominant, one warm candle at the table edge.
Extra negatives: no skull, no skeleton, no visible face, no scythe.

8 · wassail-bowl · Object card, 3:4, no style reference
A great silver-and-brass wassail bowl on a pub bar, steaming spiced ale with roasted apples bobbing in it, a ladle hooked on the rim, ribbons and a sprig of holly tied to its handles, several mismatched cups around it. A black cat sits beside it looking pointedly away. Warm gaslight amber dominant, holly accents, parchment and ink.

9 · yule-log · Object card, 3:4, no style reference
A thick oak Yule log burning in a Victorian iron fireplace, banked with glowing embers, and on the hearth beside it a small charred stub of last year's log, tied with a red ribbon, waiting to light the next one. Brass fire-irons, holly on the mantel. Warm ember-gold dominant, parchment and ink. No people.

10 · a-whistle-on-the-shingle · Card art (vignette), 3:4, no style reference
A small, ancient bronze whistle half-buried in the shingle of a bleak Suffolk beach at dusk, a crumbling grey ruin behind, the sea flat and leaden; in the distance, far down the beach, a pale blur of something like a sheet catching the wind, too far to make out. Cold gunmetal blue dominant, the whistle's bronze the only warm note. No people close up.
Extra negatives: no face on the shape, no horror gore.

11 · the-fireside-tale · Place card, 3:4, no style reference
The Bridge's snug on Christmas Eve, lamps turned down low, a semicircle of empty armchairs and a stool pulled close round a blazing fire, a half-finished glass on each arm, a book left open face-down on one cushion, and on the wall behind, the firelight throws tall flickering shadows that look almost like listeners. Warm ember-gold dominant, deep shadow, parchment and ink. No people.

12 · salt-at-the-threshold · Card art (vignette), 3:4, no style reference
Close on the worn stone doorstep of the pub at night: a neat, unbroken line of white salt poured across it, a small earthenware salt pig beside it, snow drifting in the dark street beyond; just outside the line, the snow is faintly disturbed as if something stood there and thought better of it. Heather and ink dominant, warm gaslight spilling from inside, cold blue outside. No people.

13 · almanack-capricorn · Almanack, 3:4
Capricorn: a sea-goat, the front half a sure-footed mountain goat with curling horns and the back half a coiled fish's tail, engraved in woodcut style at the centre of a brass orrery ring of concentric bands and tiny planets. Warm ink on foxed parchment, the horns picked out in sovereign gold.

14 · tarot-the-high-priestess · Tarot, 2:3
The High Priestess: a calm woman in flowing blue-and-white robes seated between two pillars, one dark and one pale, a crescent moon at her feet, a horned crown with a full moon, a scroll half-hidden in her lap, a veil of pomegranates hanging behind her. In this version the pillars are cast-iron with brass banding and the veil hangs from a brass rail. Gunmetal blue and parchment, sovereign-gold accents, thin painted border.

15 · tarot-the-hermit · Tarot, 2:3
The Hermit: an old bearded man in a long grey hooded cloak standing alone on a snowy peak at night, holding up a lantern with a six-pointed star of light inside it and leaning on a tall staff. In this version the lantern is a brass Victorian railway lamp. Cold gunmetal blue dominant, the lantern's warm gold the only bright light, thin painted border.

16 · advent-cabinet · Object, 3:4, no style reference
A tall, handsome Victorian brass-and-mahogany wall cabinet behind a pub bar, its front divided into a grid of small hinged brass doors of slightly different sizes (5 rows of 5, the bottom-centre door larger than the rest), each with a tiny round brass knob and an empty engraved plate (no numbers), sprigs of holly tucked along the top cornice, a candle on either side. Brass dominant, oxblood wood, holly accents, warm candlelight. Front-on and symmetrical, so the game can place numbers and glints over the doors.
Extra negatives: no numbers, no letters, no open doors.

Begin with image 1 now.
```
