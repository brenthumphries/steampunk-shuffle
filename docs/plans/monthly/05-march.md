# March: Of Mice and Mischief

**Window:** Mar 1 – Mar 31 · **Arrivals:** Beatrix Potter and Sergeant Nibbs Mar 1 · **The case opens:** Mar 5 – 31 (no bracket tournament this month)
**Event id:** `mice-and-mischief` · **Art sheet:** `sheet-13` · **minWins:** 3

## 1. The idea

Spring cleaning turns up a whole mouse town under the stairs, and a murder in it. Lord Ambrose Wainscot, a mouse of great age and greater debts, has been found stiff and cold beneath the pianola in the back parlour, with a silver thimble beside him. Detective Sergeant Nibbs of the Wainscot Yard (three inches tall, never once stepped on) takes the case. The cats are the obvious suspects. By House Rule 3, cats have right of way; by the newly signed **Truce of the Skirting Board**, mice have right of the walls, and Charlotte has signed it with a paw. Beatrix Potter, born in Kensington in 1866, comes up the cellar stairs to sketch the mice and turns out to be the best witness in the building.

**Dimension 20 allusion: *Of Mice and Murder*** (by premise only: a mouse-scale murder mystery). Nothing is named after the show, so nothing here needs `giftOnly`. Witchy notes: the spring equinox, and the Coven's familiar, the Hare, arrives (an English folk belief holds that witches turn into hares).

**Enhancements:** **Mystery mode**, a short detective case you solve by playing matches against suspects, collecting clues and making an accusation. Plus **Mischief +N**, for mice that are stronger in numbers (a group of mice is a "mischief").

## 2. Visitors

| Arrives | Who | Tier · family · deck | Signature card (legendary) | Line |
|---|---|---|---|---|
| Mar 1 | **Beatrix Potter** (`beatrix-potter`), 1866–1943 | visitor · Salon · Salon + Coven | *Beatrix Potter*: 2 pts. Friend +1. On Play: each of your other face-up Mischief cards gets +1. *"Drew mice, studied fungi, and had her paper read to the Linnean Society, since ladies weren't allowed to read their own."* | "Hold still. No, not you. The mouse." |
| Mar 1 | **Detective Sergeant Nibbs** (`sergeant-nibbs`), of the Wainscot Yard | visitor · Yard · Yard + Irregulars (a mouse deck) | *Sergeant Nibbs*: 2 pts. Elusive. Persist. Mischief +1. On Play: Flip an opposing card worth 2 or less. *"The Wainscot Yard's finest, at a height of three inches. Has never once been stepped on."* | "There's been a murder behind your skirting board, miss. I'll need the cats where I can see them." |

## 3. The case: The Wainscot Affair

**How it plays** (Mystery mode, §6): from Mar 5, Sergeant Nibbs opens a **Case File** in the back parlour. Four suspects can be interviewed; an **interview** is a match against that suspect (regular dial). Winning reveals that suspect's clue and, the first time, gives their card. Beating Beatrix Potter in a normal pickup game during March adds her sketch as a bonus clue. After **three interviews**, she can **accuse** one suspect. A right accusation unlocks a final match against the culprit, unmasked (legend dial), for the case prize. A wrong one: *"The case has gone cold, miss. Sleep on it."* The Accuse button returns the next local day, and clues are kept.

**Starting clue (Nibbs):** *"The thimble by the body comes from Lady Clementine's sewing box."*

| Suspect (opponent id) | Family · deck | Their card (reward on first interview win) | Clue revealed by winning |
|---|---|---|---|
| **Lady Clementine Whisker**, the widow (`lady-clementine-whisker`) | Salon · Salon + Coven | *Lady Clementine Whisker*: Salon character, U, 2 pts. Friend +1. Mischief +1. *"Mourning becomes her. She has said so."* | *"She lent the thimble to the Reverend on Tuesday, for the church bazaar."* |
| **Mr Bartholomew Crumb**, baker, owed a fortune (`mr-bartholomew-crumb`) | Foundry · Foundry + Yard | *Mr Bartholomew Crumb*: Foundry character, U, 3 pts. Persist. Mischief +1. *"Lord Wainscot owed him for eleven years of buns."* | *"His lordship ate nothing of Crumb's that night. The crumbs by the body are sugared almond, not bread."* |
| **Nettle**, a cellar mouse and known thief (`nettle-the-cellar-mouse`) | Rookery · Rookery + Irregulars | *Nettle*: Rookery character, U, 1 pt. Elusive. Return. Mischief +1. *"Took the thimble from the scene. Put it back when she saw who was lying there."* | *"Nettle's a thief, not a killer. She saw a tail with a white ribbon round it go behind the piano."* |
| **The Reverend Mr Mousely**, vicar of St Wainscot's (`the-reverend-mr-mousely`) | Salon · Salon + Rookery | *The Reverend Mr Mousely*: Salon character, U, 2 pts. Friend +1. Mischief +1. On Play: Draw 1. *"Has given everything he owns to the poor. He mentions it often."* | *"His tin of sugared almonds is empty. He says he gave them all to the poor."* |
| *(bonus)* Beatrix Potter's sketch | — | — | *"In her drawing of the parlour that evening, a tail with a clerical bow disappears behind the pianola."* |

**The solution:** **the Reverend Mr Mousely.** Lord Wainscot was about to tell the parish that the Reverend had gambled the church roof fund at the Bridge's own card tables, and lost. A sugared almond from the Reverend's tin did the rest. The thimble was a red herring that Nettle moved. **Settled:** this solution is fixed and replays every March. Brent plans a 2028 expansion with a new March solution; that's out of scope here, but the Mystery data already supports swapping the culprit and clues per year.

**The culprit, unmasked** (`reverend-unmasked`, opponent, legend dial, case-only): *The Reverend, Unmasked*: legendary Salon character, 3 pts. Elusive. Mischief +1. On Play: Flip an opposing card worth 3 or less. *"Gambled the church roof at the Shuffle, and lost. Then lost his head."* Line: *"I should have played the Truce."* **Case prize:** that card + 150 Checks.

**Lines:** Accuse (right): *"The Reverend. Of course. It's never the obvious one, unless it's the one wearing a collar."* Accuse (wrong): *"The case has gone cold, miss. Sleep on it."* Case closed: *"Case closed. Wainscot Yard thanks you. The cats have been released without a stain on their characters, which they insist they never had."*

## 4. Event cards

| Card id | Name | Family · type · rarity | Pts | Text | Flavour |
|---|---|---|---|---|---|
| `the-truce-of-the-skirting-board` | The Truce of the Skirting Board | neutral · scheme · U | 0 | On Play: each of your face-up Friend cards gets +1, and each of your face-up Mischief cards gets +1. | *Cats have right of way. Mice have right of the skirting board. Charlotte has signed it with a paw.* |
| `the-mousehole` | The Mousehole | neutral · location · R | 0 | Each face-up Mischief card gets +1. | *A town of nine hundred souls, under the third stair. Sir Charles put it back exactly as he found it.* |

The four suspect cards (§3) also join the March Lost & Found and Pawnbroker pool once she has interviewed that suspect.

## 5. Threads

- **Coven:** The Hare (`the-hare`): *"Witches turn into hares, the old wives say. Hares do not discuss it."* Arrival gift from Mar 1.
- **Almanack:** ♈ Aries (`almanack-aries`): *"A ram with a golden fleece, charging headlong into spring."* Arrival gift from Mar 20 (equinox).
- **Tarot:** VIII Strength, XI Justice.
- **Sleeve:** `sleeve-mouse-damask`, tiny mice and wheat-ears in a damask repeat.
- **Gift lines:** Mar 1: *"There was a hare in the yard this morning. It looked at me as if it knew my name. It left this."* Mar 20: *"Equinox. Day and night the same length. The almanack-seller's very pleased with himself about it."*

## 6. Enhancements

**Mischief +N** (M-A, design.md §5.19): *(Worth N more for each other face-up Mischief card on your side.)* Rules text: a face-up card with Mischief gets +N × (the number of other face-up cards with Mischief on its side). Continuous, recomputed with Friend. It stacks with Friend. The sim's lift check (§7.4) watches it.

**Mystery mode** (M-A): a generic, data-driven case. A `Mystery` record (one per event, optional) holds the opening and closing dates, the detective, intro beer mats, the starting clue, suspects with clues, bonus clues (with their source), the minimum interviews, the culprit, the boss opponent, the lines and the prize. The **Case File** screen (off the back parlour once open) shows suspect portraits (falling back to their card art cropped square, so suspects don't need separate portraits), a notebook of clues found, and an **Accuse** button once enough interviews are done. Progress persists per mystery per year. A boss match she loses can be retried at any time. Closes with the event window, and a solved case stays solved.

## 7. Dressing and lines

- **Taproom variant** `background-the-taproom-mice-and-mischief`: spring morning light; a mop, bucket and feather duster mid-spring-clean; jugs of daffodils; tiny mouse-sized doors and windows along the skirting board with lamplight in them; a miniature crime-scene rope of red thread round the foot of the pianola; a magnifying glass on the bar; the cats in their usual places, looking innocent.
- **lockedHint:** *"Something's afoot behind the skirting board. Win a few hands first, and Sergeant Nibbs will see you."*
- **Sir Charles lines:**
  - *"Spring cleaning. I found a town under the third stair. I've put it back."*
  - *"The cats have signed a truce. I didn't know cats could sign. I didn't ask."*
  - *"Miss Potter has drawn every mouse in the building. They've asked for copies."*
- **Banner:** *"There's been a murder in the walls. Tasteful, Sergeant Nibbs assures me. He's set up an incident room under the pianola."*
- **Line overrides:**
  - `holmes`, when `sergeant-nibbs` has arrived: *"A three-inch detective, and he's a step ahead of me. I've never been happier."*
  - `poirot`, when `sergeant-nibbs` has arrived: *"The little grey cells, and now the little grey mice. Order and method, mon ami."*
  - `christie`, when `sergeant-nibbs` has arrived: *"It's never the obvious one, dear. Unless it is."*

---

## 8. Prompts

### M-A · Mystery mode and Mischief (Build agent · Sonnet · L = 5)

```
Read CLAUDE.md, the last three docs/logs entries, docs/design.md §5.4, §11-§12 and §17, and docs/plans/monthly/05-march.md §3 and §6.

1. Mischief: Keywords gains mischief?: number. In effectivePoints(), a face-up Mischief card gets +N × (count of OTHER face-up Mischief cards on its side). AI nudge to cluster Mischief cards. Reminder text from §6. House Rules entry. design.md §5.19. Make sure the sim's lift report includes it, and check no existing card regresses.
2. Mystery mode (generic): src/mystery/mystery.ts defines Mystery { id, eventId, opens: MonthDay, closes: MonthDay, detectiveId, intro: string[], startingClue, suspects: { opponentId, cardId, clue }[], bonusClues: { sourceOpponentId, clue }[] (earned by a pickup win against that opponent inside the window), minInterviews, culpritId, bossOpponentId, lines: { accuseRight, accuseWrong, caseClosed, coldCase }, prize: { cardId, checks } }. An optional `mystery` field on SeasonalEvent points to it.
   Rules: an interview is a match against the suspect on the "regular" dial (no Checks for an interview win, but the first win grants the suspect's card and reveals their clue; a loss reveals nothing and can be retried). Accuse is enabled after minInterviews distinct suspects are beaten. A wrong accusation disables Accuse until the next local day, and clues are kept. A right accusation unlocks the boss match (legend dial); winning pays the prize once and marks the case solved for that year. Progress persists in the save per mystery per year (migration plus test). Suspects are never in Tonight's Patrons.
   UI: a Case File screen reached from the hub while the mystery is open (a small "Case File" folder on the back-parlour door). It shows the detective's intro beer mats on the first visit, the suspect row (portraitArtId, falling back to the suspect's card art cropped square), Interview buttons, a notebook listing clues in the order found (starting clue first), and Accuse (choose a suspect, then confirm). Use the existing match flow for interviews and the boss.
3. design.md §17.6 "Mystery mode".

Tests: Mischief counts (0, 1, 3 others; face-down ones don't count); the mystery state machine (interviews, the bonus clue only from a win inside the window, the accuse gate, a wrong accusation's next-day lockout across local midnight, the boss unlock, the prize paid once, a new year resetting progress); suspects excluded from Tonight's Patrons; one Playwright test with a test-only mystery that interviews and accuses.

Exit: npm run typecheck && npm test pass; npm run sim shows no regression. Write /log. Push your branch and open a PR (wrapper W3). Don't merge.
```

### M-B · March content (Content agent · Haiku · M = 3)

```
Read CLAUDE.md, the last three docs/logs entries, and docs/plans/monthly/05-march.md in full. M-A has landed.

Use ss-card-author to author March exactly as specified:
- §2: opponents beatrix-potter and sergeant-nibbs (tier "visitor", both arrive Mar 1), signature cards exactly as written, decks (Nibbs' deck is mice: use the four suspect cards' style of Mischief commons you author as deck-local cards, two or three at most, named as mice of the Wainscot Yard), bet pools.
- §3: the four suspect opponents (their own tier "suspect", or tier "regular" with a `suspectOnly: true` flag; choose whichever fits the existing Opponent type with the smaller change) with 20-card decks per the table, the four suspect cards, the boss opponent reverend-unmasked (legend dial, case-only) and the legendary card reverend-unmasked. Put them all in src/cards/data/miceAndMischief.ts and decks/.
- The Mystery record "wainscot-affair": opens Mar 5, closes Mar 31, detective sergeant-nibbs, intro beer mats (write three short ones in Nibbs' voice from §1), startingClue, suspects and clues, bonusClues [{ sourceOpponentId: "beatrix-potter", clue: <sketch clue> }], minInterviews 3, culpritId "the-reverend-mr-mousely", bossOpponentId "reverend-unmasked", every line from §3, prize { cardId: "reverend-unmasked", checks: 150 }.
- §4: the-truce-of-the-skirting-board and the-mousehole. §5: the-hare (coven, rare) and almanack-aries.
- The pack src/events/packs/miceAndMischief.ts: window Mar 1-31, visitors, minWins 3, cardPool (the §4 cards, the-hare, almanack-aries; suspect cards join only once interviewed, so add an optional `requiresInterview` per pool id or handle it in the pool code: your call, with a test), arrivalGifts (the-hare Mar 1, almanack-aries Mar 20), almanackIds, tarotIds ["tarot-strength","tarot-justice"], covenCardIds, sleeveId "sleeve-mouse-damask", banner, dressing and lineOverrides from §7, mystery "wainscot-affair".

Art manifest: art/prompts/sheet-13-manifest.json with every image in 05-march.md §9. Ingest anything in art/inbox.

Balance: curve for both visitors (target 40-50% starter wins). Suspects on the regular dial should lose to the starter roughly 55-65% of the time (npm run curve -- regular <suspect> 200). The boss is legend intent. Deck-local edits only.

Tests: Feb 28 nothing; Mar 1 visitors and the Hare gift; Mar 4 no Case File, Mar 5 open; the full case run (three interviews, a wrong accusation, next day the right one, the boss, the prize); the bonus clue appears only after a March pickup win against Beatrix; Apr 1 the Case File is gone and a solved case stays recorded.

Exit: npm run typecheck && npm test pass. Write /log. Report back to the orchestrator; it merges, deploys and uploads the TestFlight build (runbook §5).
If you fail the exit check twice, stop and report; the orchestrator reruns this on Sonnet.
```

---

## 9. Gemini one-shot: March art (17 images)

> **Run by the art agent** (runbook `12-orchestration-runbook.md` §7) through Claude in Chrome on gemini.google.com, using Brent's own signed-in Gemini account. The numbered steps below are what the art agent does in the browser; "you" means the art agent. Reference files are read from the Mac repo (`~/projects/steampunk-shuffle/`), and every finished image lands in `~/projects/steampunk-shuffle/art/inbox/<asset id>.png`. Brent does nothing here.

1. Fresh Gemini chat, image generation on.
2. Attach, in order: `art/reference/The_Wheatstone_Bridge_taproom.jpeg`, `public/art/portrait-miss-prudence-hollis.webp`, `public/art/portrait-inspector-bucket.webp`, `public/art/emily.webp`.
3. Paste the block, save each image as `art/inbox/<asset id>.png`, type **next** (or **redo: <fix>**, or **start at image N** in a new chat).

```
You are the illustrator for a steampunk card game set in The Wheatstone Bridge, a public house in 1871 London whose cellar door opens onto any century. This month is a cozy murder mystery among a town of mice who live in the pub's walls, investigated by a mouse detective, with Beatrix Potter visiting to sketch them. I need 17 images. Make them ONE AT A TIME, in the order below.

HOW WE WORK
- Each turn, generate exactly one image: the next one on the list. Start with image 1 now.
- After the image, write one line: "Image N of 17 — save as <asset id>.png". Put nothing else in the reply and don't ask questions. If something is ambiguous, pick the option that best fits the style rules and keep going.
- When I type "next", make the next image. When I type "redo: <note>", make the same image again with that fix. When I type "start at image N", jump to that image.
- Never put the asset id, a caption or any text inside the image itself.

ATTACHED REFERENCES
- Attachment 1 is the taproom of The Wheatstone Bridge, the style anchor for every image: match its painting style, brushwork, lighting and palette.
- Attachments 2-3 are existing portraits from the game. Use them ONLY as style references for rendering, finish, framing and light. Never copy their faces, clothing or identity.
- Attachment 4 is Emily, one of the pub's real cats (a tiny long-haired brown tabby). Use her ONLY where an image says so.
- Card art for a character must show the SAME character you drew in the portrait just before it, in this chat.

THE MICE
All the mice are realistic field and house mice in proportion (not cartoon mice, not big-headed, no human faces), standing on their hind legs and wearing beautifully made tiny Victorian clothes, in the tradition of Victorian natural-history book illustration. Their world is made of borrowed human things: thimbles, cotton reels, matchboxes, buttons, sealing-wax. They must NOT resemble any Disney, Beatrix Potter book, film or game character.

HOUSE STYLE (every image unless it says otherwise)
Painterly digital illustration in a Victorian-engineering steampunk style: brass, steam, gaslight and iron, never goggles-and-corsets cosplay. Visible, controlled brushwork, like a colourised Victorian book plate. Confident inked contours softened by the paint underneath. Directional gaslight: a warm key light from one side, cool ambient fill, real cast shadows. A faint paper-grain texture. ONE dominant colour plus parchment cream and warm ink black, with other colours only as small accents. Palette: brass/copper, oxblood leather, verdigris, gaslight amber, gunmetal blue, heather (dusky muted violet), parchment cream, warm ink black, sparing sovereign gold, plus daffodil yellow as a small spring accent only. Paint to every edge: the game adds its own card border.

FRAMING BY TYPE
- Portrait (1:1): bust portrait, three-quarter turn, slightly tighter than bust-to-waist, soft blurred background.
- Card art (3:4): bust-to-waist (or as described), a moment of action, soft blurred background.
- Object or place card (3:4): the object or place is the subject.
- Almanack (3:4): looks PRINTED: a centred, symmetrical woodcut-engraving of a zodiac figure inside a brass orrery ring of concentric bands and small planets, on foxed parchment, warm ink black with one sovereign-gold accent. No glyphs, numbers or lettering.
- Tarot (2:3): the classic 1909 Rider-Waite-Smith composition for that card, repainted in the house style with Victorian-engineering details, thin painted border inside the image. No numerals, title or lettering.
- Sleeve (3:4): a card back: symmetrical, pattern-led, full-bleed, readable at thumbnail size. No lettering.
- Background (9:16): the full room, calm, uncluttered space in the lower third for game interface.

NEGATIVE RULES (every image, plus extras per image)
no text, no lettering, no numbers, no watermark, no signature, no logo, no photorealistic photography look, no 3D render look, no anime style, no cartoon style, no goggles-and-corsets cosplay clichés, no modern clothing or objects, no gore, no blood, no dead bodies shown, no graphic violence, no distorted or extra hands/limbs/paws, no border or frame (except tarot), no white or cream margin, no vignette

THE 17 IMAGES

1 · background-the-taproom-mice-and-mischief · Background, 9:16
The SAME taproom as attachment 1, same layout, fireplace, brass piping and oxblood booths, on a bright spring morning mid-spring-clean: pale sunlight through freshly washed windows; a mop and bucket and a feather duster leaning on the bar; stoneware jugs of daffodils; along the skirting board, a row of tiny mouse-sized doors and windows with warm lamplight in them; a miniature crime-scene cordon of red thread on pins round the foot of an upright pianola in the corner; a brass magnifying glass on the bar. A black cat sitting very upright and innocent on a stool. The empty chair by the fire is still slightly apart. No people.

2 · portrait-beatrix-potter · Portrait, 1:1, style reference attachment 2
Beatrix Potter as a young woman of about thirty, in the 1890s: a round, rosy, determined face, brown hair pinned up simply, a high-collared plain tweed jacket over a white blouse, a sketchbook held to her chest and a pencil behind her ear, looking down with amused concentration at something small on the table. Behind her, softly blurred, a cottage garden and a jar of mushrooms. Verdigris dominant, parchment and ink, warm window light.

3 · beatrix-potter · Card art, 3:4, style reference attachment 2
The same Beatrix Potter as image 2, bust-to-waist, sitting cross-legged on the pub floor by the skirting board, sketching three tiny well-dressed mice who are posing very self-importantly for her in front of their mouse-hole door; her sketchbook page shows a delicate (letterless) pencil-and-watercolour study of them. Verdigris dominant, parchment and ink, warm sunlight.

4 · portrait-sergeant-nibbs · Portrait, 1:1, style reference attachment 3
Detective Sergeant Nibbs, a grey house mouse detective in a tiny gunmetal-blue Victorian police sergeant's frock coat with brass buttons, a stiff collar, and a little bowler hat; whiskers bristling, small bright black eyes, one paw raised holding a magnifying glass made from a watch crystal in a brass ring. Behind him, softly blurred, a giant table leg and a toppled cotton reel. Gunmetal blue dominant, parchment and ink, warm gaslight key. Grave and earnest, not cute.

5 · sergeant-nibbs · Card art, 3:4, style reference attachment 3
The same mouse sergeant as image 4, bust-to-waist, standing on a pub card table beside a playing card twice his size, pointing at the opponent's card with a pencil stub as though making an arrest; behind him at the edge of the table, the huge out-of-focus face of a tiny long-haired brown tabby cat (attachment 4), peering at him with great interest, and he isn't bothered in the least. Gunmetal blue dominant, parchment and ink, warm gaslight.

6 · lady-clementine-whisker · Card art, 3:4, style reference attachment 2
Lady Clementine Whisker, an elegant elderly white mouse in deep Victorian mourning: a black silk gown with a tiny bustle, a jet brooch, a black lace veil thrown back from her face, holding a black-edged handkerchief and an open sewing box made from a walnut shell, one thimble missing from it. She looks dignified and faintly theatrical. Verdigris dominant, ink-black mourning, parchment, warm candlelight.

7 · mr-bartholomew-crumb · Card art, 3:4, style reference attachment 3
Mr Bartholomew Crumb, a plump brown baker mouse in a floury white apron and a little white cap, sleeves rolled up, holding a ledger made of folded paper scraps in one paw and a rolling pin made from a pencil in the other, glaring indignantly at an unpaid account; behind him, a tiny brass oven made from a tobacco tin, glowing. Brass dominant, parchment and ink, warm oven light.

8 · nettle-the-cellar-mouse · Card art, 3:4, style reference attachment 3
Nettle, a thin, scruffy, quick little dark-brown cellar mouse in a patched oxblood jacket too big for her and a knitted cap, a stolen silver thimble clutched to her chest, caught mid-dash along a dusty cellar beam, glancing back with wide alarmed eyes. Oxblood dominant, dusty gaslight from above, parchment and ink.

9 · the-reverend-mr-mousely · Card art, 3:4, style reference attachment 2
The Reverend Mr Mousely, a sleek, well-fed grey mouse vicar in a black cassock with a white clerical collar and a tiny white ribbon tied in a bow round the base of his tail, smiling benignly and holding a small round tin of sugared almonds tilted to show it empty; behind him, softly blurred, a church made from an upturned tea caddy with a leaking roof. Verdigris dominant, parchment and ink, warm light. He looks perfectly kind, which is the point.

10 · reverend-unmasked · Card art, 3:4, style reference attachment 3
The SAME grey mouse vicar as image 9, unmasked: his collar askew, the white tail-ribbon undone, caught red-pawed behind the pianola leg with a sugared almond in one paw and a fan of playing cards (losing ones) spilling from his cassock pocket, lit harshly by a lantern held by a mouse sergeant in a blue coat at the edge of frame. Oxblood and ink dominant, harsh lantern light, parchment. Comic guilt, not menace.
Extra negatives: no body, no blood.

11 · the-truce-of-the-skirting-board · Card art (vignette), 3:4, no style reference
On the floorboards by a skirting board, a tiny treaty document on a scrap of paper (no legible writing) weighted with a brass button, signed with a little ink paw-print of a mouse at the bottom and, beside it, a much larger cat's paw-print in ink; a mouse in a tiny top hat shakes the toe of an enormous grey cat's paw (just the paw and a sliver of grey fur in frame). Parchment dominant, verdigris and brass accents, warm light.
Extra negatives: no legible writing.

12 · the-mousehole · Place card, 3:4, no style reference
A whole mouse town seen through an arched hole under a wooden stair, as if it were a street at dusk: little houses made of matchboxes and tea tins stacked in rows, lit windows, a high street of cotton-reel lamp-posts, a tiny brass clock-tower made from a pocket-watch, bunting made of postage-stamp fragments. Warm gaslight amber dominant, parchment and ink. No humans.

13 · the-hare · Card art, 3:4, style reference attachment 2
A large, wild brown hare sitting bolt upright on its haunches in a moonlit spring meadow, ears tall, one paw lifted, with an uncannily knowing, almost human gaze straight at the viewer; around its neck, half hidden in its fur, a thin heather-violet ribbon with a tiny brass charm. A crescent moon and a hawthorn in blossom behind. Heather dominant, moon-silver, parchment and ink. A real animal, not anthropomorphic.

14 · almanack-aries · Almanack, 3:4
Aries: a leaping ram with great curling horns and a fleece of rippling engraved curls, centred in woodcut style inside a brass orrery ring of concentric bands and tiny planets. Warm ink on foxed parchment, the fleece picked out in sovereign gold.

15 · tarot-strength · Tarot, 2:3
Strength: a calm woman in a white gown crowned with flowers gently closing the jaws of a great lion, a figure-of-eight loop above her head, mountains behind. In this version she wears a garland of daffodils and a brass girdle, and the lion has a magnificent tawny mane and looks politely persuaded. Gaslight amber and parchment, thin painted border.

16 · tarot-justice · Tarot, 2:3
Justice: a crowned figure in red robes seated between two pillars, holding upright a double-edged sword in one hand and balanced scales in the other, a purple veil behind. In this version the scales are a fine brass laboratory balance and the pillars are cast iron. Oxblood dominant, brass accents, thin painted border.

17 · sleeve-mouse-damask · Sleeve, 3:4
A card back: a symmetrical damask repeat of tiny mice and ears of wheat in verdigris and parchment on a deep ink ground, a small round brass medallion of a mouse holding a magnifying glass at the exact centre, and a thin repeating border of tiny thimbles. Perfectly symmetrical top to bottom and left to right.

Begin with image 1 now.
```
