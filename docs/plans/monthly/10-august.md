# August: The Lammas Fair

**Window:** Aug 1 – Aug 31 · **Arrivals:** the Automaton Oracle Aug 1 · the Faun of the Fair Aug 8 · **The Gauntlet's August champion:** Charles Green, from Aug 12 (the Perseids) · no bracket this month
**Event id:** `lammas-fair` · **Art sheet:** `sheet-18` · **minWins:** 3

## 1. The idea

Lammas, on August 1, is "loaf-mass": the first loaf from the new wheat, and the witches' first harvest festival. A Victorian travelling fair sets up on Galvanic Court, with a carousel, striped tents, a hall of mirrors, the Perseid meteors overhead, and a strongman's bell in the yard that anyone can try to ring. Charles Green, the real Victorian balloonist who flew from Vauxhall Gardens to Nassau in 1836, tethers his balloon to the Bridge's chimney.

**Bell's Hells allusions (giftOnly):** a cheerful brass fortune-telling automaton who is also a healer and asks how you're feeling, and smells faintly of cut grass (Fresh Cut Grass). And a faun girl who collects shiny things, with a winged monkey-cat who keeps them (Fearne and Mister).

**Enhancement:** **The Gauntlet**, a permanent "Test Your Strength" run mode. One deck, a ladder of seven rising opponents, three lives, and a bell to ring at the top. It stays after the fair leaves (settled, overview §10.5).

## 2. Visitors and the champion

| Arrives | Who | Tier · family · deck | Signature card (legendary) | Line |
|---|---|---|---|---|
| Aug 1 | **The Automaton Oracle** (`automaton-oracle`) · **giftOnly** | visitor · Foundry · Foundry + Coven | *The Automaton Oracle*: 3 pts. Persist. On Play: turn one of your face-down cards face-up, then Scry 1. *"Put a penny in. It tells your fortune, mends your cut thumb, and asks how you're feeling. Smells faintly of cut grass."* | "Hello, friend! Hello! Would you like your fortune? It's very good. I checked." |
| Aug 8 | **The Faun of the Fair** (`faun-of-the-fair`) · **giftOnly** | visitor · Irregulars · Irregulars + Rookery | *The Faun of the Fair*: 2 pts. Elusive. Friend +1. On Play: take control of an opposing Gadget worth 1 or less. *"Collects shiny things and gives most of them back. Her monkey-cat gives back none."* | "Ooh, is that yours? Can I hold it? I'll give it back. Probably." |
| from Aug 12, top of the Gauntlet | **Charles Green, Aeronaut** (`charles-green`), 1785–1870 | legend (Gauntlet champion) · Foundry · Foundry + Irregulars | *Charles Green, Aeronaut*: 4 pts. Elusive. Return. On Play: Draw 1, then Flip an opposing card worth 3 or less. *"Flew from Vauxhall to Nassau in eighteen hours, 1836. Landed in a field. Asked the way."* | "Up, up, and very slightly to the left. Shall we?" |

## 3. Event cards

| Card id | Name | Family · type · rarity | Pts | Text | Flavour |
|---|---|---|---|---|---|
| `the-strongman` | The Strongman | Foundry · character · C | 5 | — | *Lifts the piano. Puts it back. Asks where you'd like it.* |
| `lammas-loaf` | Lammas Loaf | neutral · gadget · C | 1 | Persist. | *The first loaf of the new wheat, broken in the four corners of the barn. Sir Charles kept a corner.* |
| `the-perseids` | STARS FALL ON GALVANIC COURT | neutral · headline · U | 0 | On Play: each player draws 1, then discards a card at random. | *Wishes made. Some granted.* |
| `the-hall-of-mirrors` | The Hall of Mirrors | neutral · location · R | 0 | Each face-up card worth exactly 3 gets +1. | *Everyone's three times as handsome and a third as tall.* |

## 4. Threads

- **Coven:** The Village Wise Woman (`the-village-wise-woman`): *"Everyone in the village goes to her in the end. She's usually expecting them."* Arrival gift from Aug 1.
- **Almanack:** ♍ Virgo (`almanack-virgo`): *"Holds a sheaf of wheat, and has already sorted it."* Arrival gift from Aug 23.
- **Tarot:** VII The Chariot, X Wheel of Fortune. With these, all 20 arcana through August are unlocked. September adds the last two.
- **Sleeve:** `sleeve-carousel`, carousel horses and fairground lights.
- **Gift lines:** Aug 1: *"Lammas. The wise woman from the village came in with the first loaf and this. She says you'll know what it's for."* Aug 23: *"The almanack-seller's back from the fair. Virgo. He's sorted his pockets."*

## 5. Enhancement: The Gauntlet

A strongman's high-striker in the yard: a hammer, a brass bell at the top and seven painted rungs.

- **Run:** choose one legal deck; it's locked for the whole run. Climb seven rungs, one match each, in order: **regular, regular, seasoned, seasoned, legend, legend, champion**. Opponents are drawn (seeded per run) from everyone she's met, so visitors only appear inside their windows.
- **Three lives:** a loss costs a life and you retry the same rung against a fresh draw of that tier. Three losses end the run. Draws count as neither.
- **Rewards** (paid when a rung is first cleared in that run):

| Rung | 1 | 2 | 3 | 4 | 5 | 6 | 7 (bell) |
|---|---|---|---|---|---|---|---|
| Pays | 10 | 10 | 20 | 20 | 30 + a random rare | 40 | 100 + a random legendary she doesn't own (or 300 Checks if she owns them all), and **the bell rings** |

- **Champion (rung 7):** whoever the live event names (`gauntletChampion` on the pack, plus a `from` date). In August that's **Charles Green**, from Aug 12; his first win pays his card. Outside an event that names one, the champion is a random legend.
- **Free, unlimited, one run at a time**, resumable after reload. The Ledger records her best height and number of bells rung. The hub shows the high-striker with her best rung marked by a little brass flag.
- **Permanent** once unlocked (first launch on or after Aug 1).

## 6. Dressing and lines

- **Taproom variant** `background-the-taproom-lammas-fair`: a warm late-summer evening; a woven corn dolly hanging over the bar; sheaves of wheat in the corners and a round loaf on a board; through the windows, a fair on Galvanic Court (carousel lights, striped tents, a strongman's high-striker) and a hot-air balloon tethered above the rooftops; a meteor streaking across the dusk; a glass-cased brass fortune-telling automaton in one corner of the taproom; the cats in their usual places.
- **lockedHint:** *"The fair's in town. Win a few hands first, and I'll get you a ticket."*
- **Sir Charles lines:**
  - *"There's a fair on Galvanic Court. The strongman lifted the pub sign to read it."*
  - *"The fortune-telling machine in the corner asked me how I was. I told it more than I've told anyone in years."* (giftOnly)
  - *"Mr Green's balloon is tethered to my chimney. I've asked him to stop calling it 'parking'."*
- **Banner:** *"The Lammas Fair is on Galvanic Court. There's a strongman's bell in the yard, and it's yours to ring."*
- **Line overrides:**
  - `lovelace`, when `automaton-oracle` has arrived: *"It runs on a punched-card loop and kindness. I've never seen the second in a machine."* (giftOnly)
  - `nell-ashby`, when `faun-of-the-fair` has arrived: *"That faun's had my purse twice and given it back twice. Her monkey kept the sixpence."* (giftOnly)
  - `mudd`, from Aug 12: *"I rang the strongman's bell! …Sir Charles says that was the dinner bell."*

---

## 7. Prompts

### Au-A · The Gauntlet (Build agent · Sonnet · L = 5)

```
Read CLAUDE.md, the last three docs/logs entries, docs/design.md §9-§12 and §17, and docs/plans/monthly/10-august.md §5.

Build the Gauntlet as a permanent run mode.

1. Rules (src/gauntlet/gauntlet.ts, pure): a run has { deckSlot, deckSnapshot, seed, rung (1-7), lives (3), cleared: number[], current opponent id }. Rung tiers: regular, regular, seasoned, seasoned, legend, legend, champion. Opponent draw for a rung: seeded per run and attempt from every opponent of that tier she has unlocked or met and who is available today (visitors only inside their windows and after arrival; legends from the whole roster regardless of legends-in-town; never tournament-only bosses except as the champion; never suspects). The champion is the live event's `gauntletChampion` (with an optional `from` MonthDay), otherwise a random legend. A loss costs a life and redraws that rung's opponent; at 0 lives the run ends. Draws: replay. Rewards per the §5 table, paid once per rung per run; the rung-7 legendary is chosen from legendaries she doesn't own (excluding the Landlady and giftOnly in a public build), else 300 Checks. A first win against an event champion also pays their signature card (once ever).
2. Save: an in-progress run persists and resumes; the Ledger gains gauntletBest (highest rung cleared) and bellsRung. Migration plus test.
3. Unlock: the first launch on or after Aug 1 (any year), then permanent.
4. UI: a high-striker in the hub yard (art id "gauntlet-high-striker"; fallback SVG) with seven rungs and a brass flag at her best height. Tapping opens the Gauntlet screen: start a run (deck picker; locked once started), the current rung, lives as three small brass hearts or bells, the next opponent's portrait, and Play. Clearing rung 7 plays a hammer-strike and bell-ring animation (sound if not muted; static under Reduce Motion) and a beer mat: "DING. The whole fair heard that."
5. SeasonalEvent gains optional gauntletChampion: { opponentId, from?: MonthDay }.
6. design.md §17.9 "The Gauntlet".

Tests: tier sequencing; seeded draws (visitors excluded outside windows, bosses excluded except as champion); lives and run end; rewards paid once per rung per run; the champion by event and date, else a random legend; the champion's card paid once ever; resume after reload; unlock date. A Playwright test that starts a run and plays rung 1 with a dev fixture.

Exit: npm run typecheck && npm test pass. Write /log. Push your branch and open a PR (wrapper W3). Don't merge.
```

### Au-B · August content (Content agent · Haiku · M = 3)

```
Read CLAUDE.md, the last three docs/logs entries, and docs/plans/monthly/10-august.md in full. Au-A has landed.

Use ss-card-author to author August exactly as specified:
- §2: opponents automaton-oracle (Aug 1) and faun-of-the-fair (Aug 8), tier "visitor", both giftOnly; charles-green, tier "legend", Gauntlet-champion-only (never in Tonight's Patrons or brackets). Signature cards exactly as written (the Faun's steal targets { side: "opponent", filter: { cardType: "gadget", maxPoints: 1, excludeElusive: true } }). Decks and bet pools as listed.
- §3: four event cards in src/cards/data/lammasFair.ts (the Hall of Mirrors uses minPoints 3 and maxPoints 3).
- §4: the-village-wise-woman (coven, rare) and almanack-virgo.
- The pack src/events/packs/lammasFair.ts: window Aug 1-31, visitors, minWins 3, cardPool, arrivalGifts (the-village-wise-woman Aug 1, almanack-virgo Aug 23), almanackIds, tarotIds ["tarot-the-chariot","tarot-wheel-of-fortune"], covenCardIds, sleeveId "sleeve-carousel", gauntletChampion { opponentId: "charles-green", from: Aug 12 }, banner, dressing and lineOverrides from §6 (taproomArtId "background-the-taproom-lammas-fair").

Art manifest: art/prompts/sheet-18-manifest.json with every image in 10-august.md §8 (including "gauntlet-high-striker"). Ingest anything in art/inbox.

Balance: curve for both visitors (40-50% starter wins), deck-local edits only. Run 50 seeded Gauntlet runs headless with the starter deck and with a 55-point single-family deck; report the average rung reached and the bell rate for each. The bell should be rare with the starter (under 10%) and reachable with a tuned deck (20-40%). Report the numbers; don't retune the Gauntlet rules without the orchestrator's OK.

Tests: Jul 31 nothing; Aug 1 the Oracle, the Wise Woman gift and the high-striker; Aug 7 no Faun, Aug 8 yes; Aug 11 the champion is a random legend, Aug 12 it's Charles Green; Aug 23 Virgo once; Sep 1 the visitors are gone but the Gauntlet stays (champion a random legend); a public build has no Oracle or Faun.

Exit: npm run typecheck && npm test pass. Write /log. Report back to the orchestrator; it merges, deploys and uploads the TestFlight build (runbook §5).
If you fail the exit check twice, stop and report; the orchestrator reruns this on Sonnet.
```

---

## 8. Gemini one-shot: August art (17 images)

> **Run by the art agent** (runbook `12-orchestration-runbook.md` §7) through Claude in Chrome on gemini.google.com, using Brent's own signed-in Gemini account. The numbered steps below are what the art agent does in the browser; "you" means the art agent. Reference files are read from the Mac repo (`~/projects/steampunk-shuffle/`), and every finished image lands in `~/projects/steampunk-shuffle/art/inbox/<asset id>.png`. Brent does nothing here.

1. Fresh Gemini chat, image generation on.
2. Attach, in order: `art/reference/The_Wheatstone_Bridge_taproom.jpeg`, `public/art/portrait-ada-lovelace.webp`, `public/art/portrait-old-nell-ashby.webp`, `public/art/portrait-inspector-bucket.webp`.
3. Paste the block, save each image as `art/inbox/<asset id>.png`, type **next** (or **redo: <fix>**, or **start at image N** in a new chat).

```
You are the illustrator for a steampunk card game set in The Wheatstone Bridge, a public house in 1871 London whose cellar door opens onto any century. This month is Lammas, the first harvest, and a Victorian travelling fair sets up outside the pub: a carousel, a hall of mirrors, a strongman's bell, a fortune-telling automaton, a faun from the fairground, and the balloonist Charles Green (1785-1870). I need 17 images. Make them ONE AT A TIME, in the order below.

HOW WE WORK
- Each turn, generate exactly one image: the next one on the list. Start with image 1 now.
- After the image, write one line: "Image N of 17 — save as <asset id>.png". Put nothing else in the reply and don't ask questions. If something is ambiguous, pick the option that best fits the style rules and keep going.
- When I type "next", make the next image. When I type "redo: <note>", make the same image again with that fix. When I type "start at image N", jump to that image.
- Never put the asset id, a caption or any text inside the image itself.

ATTACHED REFERENCES
- Attachment 1 is the taproom of The Wheatstone Bridge, the style anchor for every image: match its painting style, brushwork, lighting and palette.
- Attachments 2-4 are existing portraits from the game. Use them ONLY as style references for rendering, finish, framing and light. Never copy their faces, clothing or identity.
- Card art for a character must show the SAME character you drew in the portrait just before it, in this chat.

IMPORTANT
The Automaton Oracle and the Faun of the Fair are ORIGINAL characters: don't base them on any existing TV, game or web-series characters or actors.

HOUSE STYLE (every image unless it says otherwise)
Painterly digital illustration in a Victorian-engineering steampunk style: brass, steam, gaslight and iron, never goggles-and-corsets cosplay. Visible, controlled brushwork, like a colourised Victorian book plate. Confident inked contours softened by the paint underneath. Directional light: a warm key light from one side, cool ambient fill, real cast shadows. A faint paper-grain texture. Mechanical details look buildable. ONE dominant colour plus parchment cream and warm ink black, with other colours only as small accents. Palette: brass/copper, oxblood leather, verdigris, gaslight amber, gunmetal blue, heather (dusky muted violet), parchment cream, warm ink black, sparing sovereign gold, plus wheat gold as a small harvest accent only. Paint to every edge: the game adds its own card border.

FRAMING BY TYPE
- Portrait (1:1): bust portrait, three-quarter turn, slightly tighter than bust-to-waist, soft blurred background.
- Card art (3:4): bust-to-waist (or as described), a moment of action, soft blurred background.
- Object or place card (3:4): the object or place is the subject.
- Headline (3:4): looks PRINTED, not painted: a Victorian newspaper woodcut, symmetrical, bold central motif, two inks on newsprint, an ornamental masthead band with no legible letters.
- Almanack (3:4): looks PRINTED: a centred, symmetrical woodcut-engraving of a zodiac figure inside a brass orrery ring of concentric bands and small planets, on foxed parchment, warm ink black with one sovereign-gold accent. No glyphs, numbers or lettering.
- Tarot (2:3): the classic 1909 Rider-Waite-Smith composition for that card, repainted in the house style with Victorian-engineering details, thin painted border inside the image. No numerals, title or lettering.
- Sleeve (3:4): a card back: symmetrical, pattern-led, full-bleed, readable at thumbnail size. No lettering.
- Background (9:16): the full scene, calm, uncluttered space in the lower third for game interface.

NEGATIVE RULES (every image, plus extras per image)
no text, no lettering, no numbers, no watermark, no signature, no logo, no photorealistic photography look, no 3D render look, no anime style, no cartoon style, no goggles-and-corsets cosplay clichés, no modern clothing or objects, no clowns, no gore, no graphic violence, no distorted or extra hands/limbs, no border or frame (except tarot), no white or cream margin, no vignette

THE 17 IMAGES

1 · background-the-taproom-lammas-fair · Background, 9:16
The SAME taproom as attachment 1, same layout, fireplace, brass piping and oxblood booths, on a warm late-August evening: a woven straw corn dolly hanging over the bar; sheaves of wheat stood in the corners; a round harvest loaf on a wooden board; through the windows, a fairground on the court outside (carousel lights, striped tents, a tall strongman's high-striker with a brass bell) and a striped hot-air balloon tethered above the rooftops; a meteor streaking across the dusk sky; in one corner of the taproom, a tall glass-cased brass fortune-telling automaton. A black cat asleep on a stool. The empty chair by the fire is still slightly apart. No people.

2 · portrait-automaton-oracle · Portrait, 1:1, style reference attachment 2
The Automaton Oracle, an ORIGINAL character: a slim, friendly brass automaton with a smooth, gently smiling porcelain-and-brass face, round glass eyes with a soft green glow, a turban-like brass dome with a small glass crystal ball set in it, a waistcoat of riveted copper plates with a little red-cross enamel badge and a coin slot, delicate articulated brass hands, one raised in a cheerful wave. Behind it, softly blurred, the velvet curtains of a fairground booth. Brass and copper dominant, soft green accent, parchment and ink, warm gaslight.
Extra negatives: no menacing robot, no red eyes.

3 · automaton-oracle · Card art, 3:4, style reference attachment 2
The same brass automaton as image 2, bust-to-waist, seated in its glass-fronted fairground booth with the glass door swung open, gently bandaging a customer's cut thumb (just a hand and cuff in frame) with one brass hand while turning over a fortune card with the other; a tiny sprig of fresh-cut grass is tucked in its waistcoat. Brass dominant, soft green glow, parchment and ink, warm light.

4 · portrait-faun-of-the-fair · Portrait, 1:1, style reference attachment 3
The Faun of the Fair, an ORIGINAL character: a cheerful, wide-eyed young faun woman with curling ram-like horns poking through a mop of pink-auburn curls, freckles, small pointed ears, a patched Victorian fairground waistcoat jangling with collected trinkets (buttons, keys, a spoon, a medal), and on her shoulder a small winged monkey-cat (a long-tailed monkey with a cat's face and little feathered wings) clutching a shiny sixpence. Behind them, softly blurred, carousel lights. Gaslight amber dominant, parchment and ink, warm fairground glow.
Extra negatives: no nudity, no goat legs shown in a revealing way.

5 · faun-of-the-fair · Card art, 3:4, style reference attachment 3
The same faun and winged monkey-cat as image 4, bust-to-waist, at a pub card table: she's reaching across delightedly to pick up a small brass gadget from the opponent's side, while her monkey-cat has already got a pocket-watch and is flying off with it. Gaslight amber dominant, parchment and ink, warm light.

6 · portrait-charles-green · Portrait, 1:1, style reference attachment 4
Charles Green, the Victorian balloonist, in his fifties: a stout, ruddy, cheerful man with grey side-whiskers, a tall hat tied on with a scarf under his chin against the wind, a heavy caped greatcoat and a brass telescope, standing in the wicker basket of a balloon with ropes rising out of frame. Behind him, softly blurred, the patchwork fields of England far below. Gunmetal-blue sky, gaslight amber, oxblood and parchment, sunlight.

7 · charles-green · Card art, 3:4, style reference attachment 4
The same Charles Green as image 6, leaning out of the wicker basket of a great striped balloon high over London at sunset, cheerfully dropping a single playing card overboard toward the rooftops, a sandbag swinging beside him and a brass barometer lashed to the rigging. Gunmetal blue and sunset gold, oxblood stripes, parchment and ink.

8 · the-strongman · Card art, 3:4, style reference attachment 4
A Victorian fairground strongman with a huge waxed handlebar moustache, a leopard-print leotard over a striped bathing suit (fully covered), and a broad, kindly grin, lifting an upright piano over his head with ease in front of a fair tent. Brass dominant, parchment and ink, warm late sunlight.

9 · lammas-loaf · Object card, 3:4, no style reference
A round, golden harvest loaf on a scrubbed wooden board in a barn doorway, its top scored with a wheatsheaf pattern, a corner already broken off, sheaves of wheat stacked behind and a sickle hung on the wall, warm low August sunlight streaming in with dust motes. Wheat gold and parchment, ink. No people.

10 · the-perseids · Headline, 3:4
A Victorian newspaper woodcut front page: meteors streaking symmetrically across a night sky above a fairground (a carousel, tents, a balloon), with tiny silhouetted figures pointing up and making wishes. Two inks, black and a single warm gold, on newsprint, an ornamental masthead band with no legible letters.
Extra negatives: no legible words.

11 · the-hall-of-mirrors · Place card, 3:4, no style reference
Inside a Victorian fairground hall of mirrors: a corridor of tall gilt-framed curved mirrors reflecting each other into infinity under gaslight, the reflections stretching and squashing a single empty chair and a pub stool into absurd shapes. Brass and gilt dominant, parchment and ink, warm gaslight. No people.

12 · the-village-wise-woman · Card art, 3:4, style reference attachment 3
A Victorian village wise woman in her seventies: small, upright and sharp-eyed, in a plain dark dress and a knitted heather-violet shawl, sitting in a cottage armchair by a hearth with a cat-shaped space on the cushion beside her, a basket of herbs at her feet; she has just opened her cottage door to a visitor (off frame) with an "I've been expecting you" look, a pot of tea already brewed and two cups set out. Heather dominant, parchment and ink, warm hearth light.

13 · almanack-virgo · Almanack, 3:4
Virgo: a calm young maiden in simple robes holding a sheaf of wheat in one arm and a single ear of wheat in the other hand, centred in woodcut style inside a brass orrery ring of concentric bands and tiny planets. Warm ink on foxed parchment, the wheat picked out in sovereign gold.

14 · tarot-the-chariot · Tarot, 2:3
The Chariot: an armoured charioteer with a starry canopy over his chariot, holding a wand, the chariot drawn by two sphinxes (one black, one white) pulling in different directions, a walled city behind. In this version the chariot is a brass steam-carriage with a canopy of stars and the sphinxes are cast in iron and pale stone. Gunmetal blue and brass, thin painted border.

15 · tarot-wheel-of-fortune · Tarot, 2:3
Wheel of Fortune: a great wheel in the sky inscribed with alchemical symbols (rendered as unlettered glyph-shapes), a sphinx with a sword on top, a snake descending on one side and a jackal-headed figure rising on the other, four winged creatures reading books in the clouds at the corners. In this version the wheel is a brass fairground wheel with gaslights round its rim. Sovereign gold and sky blue, thin painted border.
Extra negatives: no legible letters.

16 · sleeve-carousel · Sleeve, 3:4
A card back: a symmetrical carousel canopy pattern, scalloped stripes in oxblood and parchment radiating from a central brass medallion of a carousel horse, ringed with little round gaslight bulbs, and a thin repeating border of twisted brass poles. Perfectly symmetrical left to right.

17 · gauntlet-high-striker · Background, 9:16
A tall Victorian fairground high-striker ("Test Your Strength") standing on its own in the pub's cobbled yard at dusk: a tall painted wooden tower with a vertical track, a brass puck at the bottom on a striking pad, seven evenly spaced painted bands climbing the tower (blank, no numbers), and a large polished brass bell at the very top; a heavy wooden mallet leans against its base; carousel lights blur in the background. Brass and oxblood, parchment and ink, warm fairground glow. Front-on and centred, so the game can draw markers on the bands.
Extra negatives: no numbers, no letters on the tower.

Begin with image 1 now.
```
