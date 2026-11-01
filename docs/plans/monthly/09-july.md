# July: The House on the Cliff

**Window:** Jul 1 – Jul 31 · **Arrivals:** the Gentleman from Leytonstone Jul 1 · the Woman in White Jul 8 · **Tournament:** Jul 17 – 31
**Event id:** `cliff-house` · **Art sheet:** `sheet-17` · **minWins:** 3

## 1. The idea

Sara's classic-film month. For the summer, the Bridge's cellar door opens onto a cliff-top in Cornwall, and there's a house up there. Rebecca's Manderley is in Cornwall. The haunted house in *The Uninvited* is on a Cornish cliff. *The Birds* began as a Cornish story. And Hitchcock was born in Leytonstone, which is practically round the corner from the Strand.

So: a portly gentleman from Leytonstone who is only ever in the picture for a moment (he gets a new keyword, **Cameo**). A housekeeper who keeps the west wing exactly as *she* left it. A second wife nobody calls by her first name. Stairs that smell of mimosa when the kind ghost is near, and a cold presence in the nursery when she isn't. Gulls gathering on the chimney pots. And a Victorian suspense heroine who is public domain: Wilkie Collins's **Woman in White** (1859), met at midnight on the Hampstead road, asking the way to London.

**Allusions (giftOnly):** Hitchcock, *Rebecca*, *The Uninvited*. Nothing is named after them, and nobody is drawn face-on as a real person. The Gentleman is only ever seen from behind or leaving the frame.

**Enhancements:** **Cameo** (a card that does its job and slips out of shot), and **the Stereoscope**: Sir Charles really did invent the stereoscope (1838), so this adds a 3D gallery that tilts card art with the phone. Hitchcock made a 3D film too (*Dial M for Murder*, 1954).

## 2. Visitors and boss

| Arrives | Who | Tier · family · deck | Signature card (legendary) | Line |
|---|---|---|---|---|
| Jul 1 | **The Gentleman from Leytonstone** (`gentleman-from-leytonstone`) · **giftOnly** | visitor · Irregulars · Irregulars + Rookery | *The Gentleman from Leytonstone*: 2 pts. **Cameo**. On Play: Flip an opposing card worth 4 or less, then Draw 1. *"Only ever in the picture for a moment. Always worth looking for."* | "Good evening." *(He has already left.)* |
| Jul 8 | **The Woman in White** (`woman-in-white`), Wilkie Collins (1859) | visitor · Salon · Salon + Coven | *The Woman in White*: 3 pts. Elusive. Undying. On Play: Reveal your opponent's hand. *"Met on the Hampstead road at midnight, all in white, asking the way to London."* | "Is there a road to London from here? I must get to London." |
| Jul 17–31, tournament only | **The Cold Presence** (`the-cold-presence`) | legend (tournament-only) · Rookery · Rookery + Coven | *The Cold Presence*: 4 pts. Elusive. Undying. On Play: each opposing face-up card gets -1. *"The nursery is always cold. The flowers on the landing die overnight. Nobody sleeps in the west room."* | *(The candle on the table gutters, though there is no draught.)* |

## 3. Event cards

| Card id | Name | Family · type · rarity | Pts | Text | Flavour |
|---|---|---|---|---|---|
| `the-housekeeper` · giftOnly | The Housekeeper | Rookery · character · U | 3 | Persist. On Play: Flip an opposing Friend card worth 3 or less. | *Keeps the west wing exactly as it was. She would prefer you left it that way.* |
| `the-second-wife` · giftOnly | The Second Wife | Salon · character · C | 2 | Friend +2. | *Nobody has asked her first name. She's stopped expecting them to.* |
| `the-scent-of-mimosa` · giftOnly | The Scent of Mimosa | Coven · scheme · U | 0 | On Play: turn one of your face-down cards face-up. It gets +2. | *When the stairs smell of mimosa, you're safe. It's when they smell of nothing that you should worry.* |
| `the-macguffin` | The MacGuffin | neutral · gadget · R | 2 | Elusive. Persist. | *Everyone wants it. Nobody can say what it is.* |
| `gulls-over-polperro` | GULLS GATHER OVER POLPERRO | neutral · headline · R | 0 | On Play: each player discards a card at random from their hand. | *First the chimney pots. Then the railings. Fishermen advise staying indoors.* |
| `the-cliff-house` | The Cliff House | neutral · location · R | 0 | Each face-up Elusive card gets +1. | *Bought cheap, on account of the stories. The stories turned out to be true.* |

## 4. Threads

- **Coven:** Candle Magic (`candle-magic`): *"Green for money, pink for love, white for anything you can't say out loud."* Arrival gift from Jul 1.
- **Almanack:** ♌ Leo (`almanack-leo`): *"A lion basking in the sun, quite certain it rose for him."* Arrival gift from Jul 23.
- **Tarot:** XII The Hanged Man, XVIII The Moon.
- **Sleeve:** `sleeve-nautilus`, a nautilus-shell spiral and waves.
- **Gift lines:** Jul 1: *"Pixie's left you a box of candles in every colour, and a note: 'Not the white one. Not yet.'"* Jul 23: *"The almanack-seller came up the cliff path. Leo, he says. He's very sunburnt."*

## 5. Enhancements

**Cameo** (Jl-A, design.md §5.21): *(After its On Play, it slips out of shot: it goes to the bottom of your deck.)* Rules text: after a Cameo card's On Play resolves, it leaves the table and is put on the bottom of its owner's deck. It never counts for points at round end (it isn't on the table by then). If its On Play is countered, or it has none, it still leaves. A Cameo card can't be Flipped or taken in the moment it's on the table, because it's gone before anyone can act. In the UI, the card walks across the table and out of the side of the frame.

**The Stereoscope** (Jl-A): a gallery viewer off the collection screen, styled as Sir Charles's brass-and-walnut stereoscope. Tap any owned card to view its art full-screen with a gentle **parallax tilt** (DeviceOrientation, behind iOS's motion-permission prompt; drag-to-tilt fallback; static under Reduce Motion). The card's flavour text, family and the date she first got it (from the Ledger) are shown beneath. Each card also gets a "stereo pair" effect: the art split into two softly offset layers, with a vignette mask so it reads as depth. This is all CSS transforms on the existing art; no new art is needed.

## 6. Tournament: The Cliff House Weekend

| Field | Value |
|---|---|
| id | `cliff-house-weekend` |
| When | Jul 17 – 31 |
| Unlock | event live and 3+ wins |
| Field | The Gentleman from Leytonstone, the Woman in White, the Cold Presence, Agatha Christie, Hercule Poirot, Sherlock Holmes + 1 random Seasoned |
| Entry rule | any legal deck |
| House Location | The Cliff House |
| Entry / prize / consolation | 13 / *The Cold Presence* + 150 / 13 |

## 7. Dressing and lines

- **Taproom variant** `background-the-taproom-cliff-house`: high summer; the windows open on sea fog and a Cornish cliff with a lighthouse far off; gulls on the outside sill; a vase of fluffy yellow mimosa on the bar; a pale rectangle on the panelling where a portrait used to hang; a fishing net, a child's bucket and spade and a bowl of seashells; the blurred silhouette of a portly man in a dark suit passing the window glass (only his outline, from behind); the cats in their usual places.
- **lockedHint:** *"An odd sort of weekend crowd, up from the cliff. Win a few hands first, and I'll introduce you."*
- **Sir Charles lines:**
  - *"The cellar door has opened onto Cornwall for the summer. Mind the cliff."*
  - *"A gentleman walks past the window every evening at the same minute. Never comes in."* (giftOnly)
  - *"Someone counted the cellar stairs: thirty-nine. Someone else got thirty-eight. I've stopped counting."*
- **Banner:** *"The cellar door has opened onto Cornwall for the summer. There's a house on the cliff, and the stairs smell of mimosa."*
- **Line overrides:**
  - `christie`, when `woman-in-white` has arrived: *"Mr Collins wrote the first proper detective novel. I've thanked him. He seemed surprised."*
  - `holmes`, when `gentleman-from-leytonstone` has arrived: *"That portly fellow at the back of every scene. I've deduced everything about him except why."* (giftOnly)
  - `poirot`, from Jul 17: *"A house where the flowers die overnight. I have seen this before. It was the gardener."*

---

## 8. Prompts

### Jl-A · Cameo and the Stereoscope (Build agent · Sonnet · L = 5)

```
Read CLAUDE.md, the last three docs/logs entries, docs/design.md §5.2, §5.13 and §14, and docs/plans/monthly/09-july.md §5. The Ledger (November) records the first-acquired date per card; if it doesn't, add that field with a migration that leaves older cards dated "before the Ledger".

1. Cameo: Keywords gains cameo?: boolean. After a Cameo card's On Play resolves (or immediately, if it has no On Play), it is removed from the board and put on the bottom of its owner's deck. It never scores at round end, can't be targeted by anything (it isn't on the board when the other player acts), doesn't count for Friend, Devoted or Mischief after it leaves, and On Play still resolves normally first. Reminder text exactly as in §5; House Rules entry; design.md §5.21. AI: value a Cameo card as its On Play effect only (its points never count). UI: the card plays, its effect animates, then it walks out of the side of the table (fade under Reduce Motion).
2. The Stereoscope: a screen reached from the collection ("Stereoscope" button, icon a brass stereoscope drawn in SVG). It lists owned cards; tapping one opens the viewer: the art full-screen inside a walnut-and-brass eyepiece frame (SVG), with parallax tilt from DeviceOrientationEvent (request permission on iOS via DeviceOrientationEvent.requestPermission on the first tap; if denied or unavailable, drag to tilt), using two layers of the same art at slightly different translate and scale values, masked so it reads as depth. Under Reduce Motion: no tilt, static. Below the art: the name, family, rarity, flavour, and "First found: <date>" from the Ledger. Swipe left and right between cards. 60fps on the 402x874 viewport; no new images.
3. design.md §14.7 "The Stereoscope" (and a note in §1.3 that Sir Charles invented it in 1838).

Tests: Cameo (leaves after On Play; never scores; can't be targeted; to the bottom of the deck; interacts correctly with Return, Persist and Undying, which are all irrelevant because it's gone; the property test still passes); Stereoscope (renders for an owned card, hides unowned, the permission flow is mocked, the Reduce Motion path). A Playwright test that opens the Stereoscope and swipes.

Exit: npm run typecheck && npm test pass; npm run sim shows no regression. Write /log. Push your branch and open a PR (wrapper W3). Don't merge.
```

### Jl-B · July content (Content agent · Haiku · M = 3)

```
Read CLAUDE.md, the last three docs/logs entries, and docs/plans/monthly/09-july.md in full. Jl-A has landed.

Use ss-card-author to author July exactly as specified:
- §2: opponents gentleman-from-leytonstone (Jul 1, giftOnly) and woman-in-white (Jul 8), tier "visitor"; the-cold-presence, tier "legend", tournament-only. The Gentleman's opponent portrait art is of him from behind (see §9); keep it that way. Signature cards exactly as written. Decks and bet pools as listed.
- §3: six event cards in src/cards/data/cliffHouse.ts; the-housekeeper, the-second-wife and the-scent-of-mimosa are giftOnly. The Scent of Mimosa's "it gets +2" applies to the card it turns face-up (a one-shot buff on the same target; follow Mary Shelley's signature card).
- §4: candle-magic (coven) and almanack-leo.
- The pack src/events/packs/cliffHouse.ts: window Jul 1-31, visitors, minWins 3, cardPool, arrivalGifts (candle-magic Jul 1, almanack-leo Jul 23), almanackIds, tarotIds ["tarot-the-hanged-man","tarot-the-moon"], covenCardIds, sleeveId "sleeve-nautilus", banner, dressing and lineOverrides from §7 (taproomArtId "background-the-taproom-cliff-house").
- §6: tournament cliff-house-weekend with an explicit field constant and house Location the-cliff-house.

Art manifest: art/prompts/sheet-17-manifest.json with every image in 09-july.md §9. Ingest anything in art/inbox.

Balance: curve for both visitors (40-50% starter wins), deck-local edits only. The Gentleman's deck is built round his Cameo; check the AI actually plays him.

Tests: Jun 30 nothing; Jul 1 the Gentleman and the Candle Magic gift; Jul 7 no Woman in White, Jul 8 yes; Jul 17 the Weekend with the Cold Presence seated (not in Tonight's Patrons) and The Cliff House in the slot; Jul 23 Leo once; Aug 1 everything gone; in a public build: no Gentleman, Housekeeper, Second Wife or Mimosa, and the Weekend still fills its field.

Exit: npm run typecheck && npm test pass. Write /log. Report back to the orchestrator; it merges, deploys and uploads the TestFlight build (runbook §5).
If you fail the exit check twice, stop and report; the orchestrator reruns this on Sonnet.
```

---

## 9. Gemini one-shot: July art (18 images)

> **Run by the art agent** (runbook `12-orchestration-runbook.md` §7) through Claude in Chrome on gemini.google.com, using Brent's own signed-in Gemini account. The numbered steps below are what the art agent does in the browser; "you" means the art agent. Reference files are read from the Mac repo (`~/projects/steampunk-shuffle/`), and every finished image lands in `~/projects/steampunk-shuffle/art/inbox/<asset id>.png`. Brent does nothing here.

1. Fresh Gemini chat, image generation on.
2. Attach, in order: `art/reference/The_Wheatstone_Bridge_taproom.jpeg`, `public/art/portrait-agatha-christie.webp`, `public/art/portrait-irene-adler.webp`, `public/art/portrait-professor-moriarty.webp`.
3. Paste the block, save each image as `art/inbox/<asset id>.png`, type **next** (or **redo: <fix>**, or **start at image N** in a new chat).

```
You are the illustrator for a steampunk card game set in The Wheatstone Bridge, a public house in 1871 London whose cellar door opens onto any century. This month the cellar door opens onto a cliff-top house in Cornwall for the summer: a classic gothic-suspense month, with sea fog, a haunted house, a severe housekeeper and Wilkie Collins's "The Woman in White" (1859). I need 18 images. Make them ONE AT A TIME, in the order below.

HOW WE WORK
- Each turn, generate exactly one image: the next one on the list. Start with image 1 now.
- After the image, write one line: "Image N of 18 — save as <asset id>.png". Put nothing else in the reply and don't ask questions. If something is ambiguous, pick the option that best fits the style rules and keep going.
- When I type "next", make the next image. When I type "redo: <note>", make the same image again with that fix. When I type "start at image N", jump to that image.
- Never put the asset id, a caption or any text inside the image itself.

ATTACHED REFERENCES
- Attachment 1 is the taproom of The Wheatstone Bridge, the style anchor for every image: match its painting style, brushwork, lighting and palette.
- Attachments 2-4 are existing portraits from the game. Use them ONLY as style references for rendering, finish, framing and light. Never copy their faces, clothing or identity.
- Card art for a character must show the SAME character you drew in the portrait just before it, in this chat.

IMPORTANT
Every character here is ORIGINAL or from a public-domain Victorian novel. Don't depict any real film director, any actor, or any character as they appeared in any film or TV adaptation. "The Gentleman" is a portly Victorian gentleman who must NEVER be shown face-on: only from behind, in silhouette, or just leaving the frame.

HOUSE STYLE (every image unless it says otherwise)
Painterly digital illustration in a Victorian-engineering steampunk style: brass, steam, gaslight and iron, never goggles-and-corsets cosplay. Visible, controlled brushwork, like a colourised Victorian book plate. Confident inked contours softened by the paint underneath. Directional light: a warm key light from one side, cool ambient fill, real cast shadows. A faint paper-grain texture. ONE dominant colour plus parchment cream and warm ink black, with other colours only as small accents. Palette: brass/copper, oxblood leather, verdigris, gaslight amber, gunmetal blue, heather (dusky muted violet), parchment cream, warm ink black, sparing sovereign gold, plus mimosa yellow and sea-green as small accents only. Paint to every edge: the game adds its own card border.

FRAMING BY TYPE
- Portrait (1:1): bust portrait, three-quarter turn, slightly tighter than bust-to-waist, soft blurred background (except where the image says otherwise).
- Card art (3:4): bust-to-waist (or as described), a moment of action, soft blurred background.
- Object or place card (3:4): the object or place is the subject.
- Headline (3:4): looks PRINTED, not painted: a Victorian newspaper woodcut, symmetrical, bold central motif, two inks on newsprint, an ornamental masthead band with no legible letters.
- Almanack (3:4): looks PRINTED: a centred, symmetrical woodcut-engraving of a zodiac figure inside a brass orrery ring of concentric bands and small planets, on foxed parchment, warm ink black with one sovereign-gold accent. No glyphs, numbers or lettering.
- Tarot (2:3): the classic 1909 Rider-Waite-Smith composition for that card, repainted in the house style with Victorian-engineering details, thin painted border inside the image. No numerals, title or lettering.
- Sleeve (3:4): a card back: symmetrical, pattern-led, full-bleed, readable at thumbnail size. No lettering.
- Background (9:16): the full room, calm, uncluttered space in the lower third for game interface.

NEGATIVE RULES (every image, plus extras per image)
no text, no lettering, no numbers, no watermark, no signature, no logo, no photorealistic photography look, no 3D render look, no anime style, no cartoon style, no goggles-and-corsets cosplay clichés, no modern clothing or objects, no gore, no blood, no graphic violence, no skulls, no distorted or extra hands/limbs, no border or frame (except tarot), no white or cream margin, no vignette

THE 18 IMAGES

1 · background-the-taproom-cliff-house · Background, 9:16
The SAME taproom as attachment 1, same layout, fireplace, brass piping and oxblood booths, on a summer evening, but the windows now look out on Cornish sea fog and a cliff edge with a lighthouse far off; two gulls stand on the outside sill; a vase of fluffy yellow mimosa on the bar; on the panelling, a pale rectangle where a large portrait used to hang; a fishing net draped on a peg, a child's tin bucket and spade and a bowl of seashells; behind the fogged window glass, the blurred dark silhouette of a portly man in a suit and hat passing by, seen from behind. A black cat asleep on a stool. The empty chair by the fire is still slightly apart. No people inside.

2 · portrait-gentleman-from-leytonstone · Portrait, 1:1, style reference attachment 4
A portly, round-shouldered Victorian gentleman in a dark three-piece suit and a bowler hat, seen ENTIRELY FROM BEHIND, standing at the rail of a cliff-top terrace looking out at a foggy sea and a lighthouse; his rounded silhouette is unmistakable, his hands clasped behind his back holding a furled umbrella. Gunmetal blue and ink dominant, a cool sea-fog light, a warm lit window to one side, parchment highlights. Calm, droll, mysterious.
Extra negatives: no face visible, no profile, no likeness of any real person.

3 · gentleman-from-leytonstone · Card art, 3:4, style reference attachment 4
The same portly gentleman as image 2, caught just leaving the frame: at the back of a busy pub card-table scene (players in the foreground, blurred), he is halfway out of a side door, only his back, his bowler hat and one hand on the door frame visible, while on the table an opponent's card has just been turned face-down, and a fresh card slides toward the player. Gunmetal blue and ink, warm gaslight.
Extra negatives: no face visible, no profile, no likeness of any real person.

4 · portrait-woman-in-white · Portrait, 1:1, style reference attachment 2
The Woman in White from Wilkie Collins's novel: a young, pale, fragile-looking woman in her twenties, dressed entirely in white from head to foot (a white bonnet, a white Victorian dress and shawl), wide frightened eyes, one hand raised as if asking a question, standing at night on a lonely moonlit road with a single gas lamp behind her. Parchment-white dominant against gunmetal-blue night, cold moonlight, ink. Haunting, not horror.

5 · woman-in-white · Card art, 3:4, style reference attachment 2
The same woman in white as image 4, bust-to-waist, appearing suddenly at the end of a pub card table as if she's always been there, laying one pale hand on the table; the opponent's hand of cards, across from her, turns translucent so its faces show (colourful card faces with no letters or numbers). Parchment-white dominant, gunmetal blue, ink, a single candle.

6 · portrait-the-cold-presence · Portrait, 1:1, style reference attachment 4
The Cold Presence: no figure at all, only a dim, cold upstairs nursery landing in an old cliff-top house at night: a rocking chair still moving slightly, a vase of dead flowers on a hall table, frost creeping across the inside of a window, a faint, pale, human-shaped thickening in the darkness at the top of the stairs. Gunmetal blue and ink dominant, a cold silver light, parchment highlights. Eerie, restrained, no face.
Extra negatives: no visible face, no skull, no gore, no glowing eyes.

7 · the-cold-presence · Card art, 3:4, style reference attachment 4
The same cold, dim nursery landing as image 6, but now the candle on a card table set up on the landing gutters sideways in a draught that isn't there, frost spreads across the playing cards on one side of the table, and the faint pale shape at the top of the stairs is a little closer. Gunmetal blue and ink, silver light, one warm candle.
Extra negatives: no visible face, no skull, no gore.

8 · the-housekeeper · Card art, 3:4, style reference attachment 3
A severe, gaunt Victorian housekeeper in her fifties in a high-necked black dress with a chatelaine of keys at her waist, hair scraped back, a pale, unsmiling, watchful face with dark eyes, standing very straight in the doorway of an immaculate, dust-sheeted bedroom kept exactly as someone left it (a brush and comb laid out on the dressing table, a nightgown folded on the bed). Ink black dominant, oxblood accents, cold window light.

9 · the-second-wife · Card art, 3:4, style reference attachment 2
A shy, gentle young woman in her early twenties in a plain, slightly unfashionable cardigan-like Victorian jacket and simple skirt, hair loosely tied back, hands clasped nervously, standing small at the foot of a huge sweeping staircase in a grand hall, looking up; a great empty picture frame hangs on the wall above her. Verdigris dominant, parchment and ink, soft grey daylight.

10 · the-scent-of-mimosa · Card art (vignette), 3:4, no style reference
A dark staircase in an old house at night, and drifting down it a soft, warm golden haze carrying a scattering of fluffy yellow mimosa blossoms that have appeared from nowhere; at the foot of the stairs, a card lying face-down is turning face-up in the warm light. Mimosa yellow and warm gold against gunmetal-blue shadow, parchment and ink. Comforting, protective.

11 · the-macguffin · Object card, 3:4, no style reference
A small, plain, mysterious locked brass-bound box (or perhaps an envelope sealed with wax, or a key: it's deliberately hard to say) sitting alone at the centre of a pub card table in a pool of lamplight, while many hands reach toward it from every edge of the frame (only hands and different cuffs: a constable's, a lady's glove, a thief's fingerless mitten, a gentleman's ring). Brass dominant, parchment and ink, dramatic lamplight.

12 · gulls-over-polperro · Headline, 3:4
A Victorian newspaper woodcut front page: a little Cornish fishing harbour with whitewashed cottages climbing the hill, and in the sky above a vast, symmetrical, swirling flock of gulls, with more gulls lining every chimney pot and railing. Two inks, black and a single cold blue-grey, on newsprint, an ornamental masthead band with no legible letters.
Extra negatives: no legible words, no attack, no injury.

13 · the-cliff-house · Place card, 3:4, no style reference
A tall, lonely, grey stone house on the very edge of a Cornish cliff in sea fog at dusk, one upstairs window faintly lit, a garden of wind-bent shrubs and a mimosa tree in yellow flower by the gate, a narrow path running down to the rocks and the grey sea below, gulls wheeling. Gunmetal blue and sea-green dominant, mimosa yellow accent, parchment and ink. No people.

14 · candle-magic · Card art (vignette), 3:4, no style reference
A small round table draped with a heather-violet cloth, and on it a ring of short coloured candles (green, pink, white, gold) burning in brass holders around a written slip of folded paper (no legible writing), with a sprig of rosemary and a few rose petals; one hand (wrist and ringed fingers only) lights the last candle with a long match. Heather dominant, warm candle glow, parchment and ink.

15 · almanack-leo · Almanack, 3:4
Leo: a magnificent lion striding with a great curling mane, centred in woodcut style inside a brass orrery ring of concentric bands and tiny planets, a blazing sun disc above it. Warm ink on foxed parchment, the sun picked out in sovereign gold.

16 · tarot-the-hanged-man · Tarot, 2:3
The Hanged Man: a calm young man hanging upside down by one ankle from a living T-shaped tree, his other leg bent behind the straight one to form a figure four, his hands behind his back, a golden halo round his serene head. In this version the beam is a brass-bound timber and his halo is a fine brass ring. Verdigris and sovereign gold, parchment, thin painted border. Peaceful, not distressing.

17 · tarot-the-moon · Tarot, 2:3
The Moon: a large full moon with a calm crescent face between two stone towers, a winding path leading from a pool between them into distant hills, a dog and a wolf howling up at it, and a crayfish crawling out of the pool, drops of light falling from the moon. In this version the towers are lighthouses on a cliff and the pool is a rock pool on the shore. Moon-silver and gunmetal blue, parchment, thin painted border.

18 · sleeve-nautilus · Sleeve, 3:4
A card back: a large, finely engraved nautilus-shell spiral in brass lines at the exact centre, surrounded by a symmetrical pattern of stylised waves, gulls and tiny stars on a deep sea-green ground, with a thin repeating border of rope. Perfectly symmetrical left to right (the spiral itself may turn one way).

Begin with image 1 now.
```
