# September: Michaelmas Term

**Window:** Sep 1 – Sep 30 · **Arrivals:** the Headmaster Sep 1 · the Sixth Form Sep 8 · **Tournament:** Sep 15 – 30 · **A Year at the Bridge and the Grand Reading:** from Sep 22 (the equinox)
**Event id:** `michaelmas-term` · **Art sheet:** `sheet-19` · **minWins:** 3

## 1. The idea

Michaelmas term begins (the old English school and university term that starts in autumn), with the equinox and the witches' Mabon. An eccentric retired adventurer who now runs an academy opens a **night school** in the back parlour. He has never once used the door to his own study, and he brings his sixth form: six misfit pupils with a bad reputation and no respect for authority. Tom Brown's old bully Flashman, from Rugby (1857, public domain), turns up for the end-of-term examinations.

**Dimension 20 allusion (giftOnly): *Fantasy High*.** The headmaster who teleports instead of using doors, the smallest detective whose father's case is still open, the anxious scholar who has seen the future, and the cleric who keeps changing her religion. All are original Victorian characters.

This is the last month before Hallowe'en comes round again, so the year closes:
- **Night School**: twelve puzzle lessons, one for every mechanic she's met this year. Permanent.
- **A Year at the Bridge**: a school-report-style recap of her year, read from the Ledger that has been counting since November.
- **The Grand Reading**: with all 22 arcana unlocked, Pixie lays out a three-card spread of her year.
- The cellar door starts creaking again. October is coming.

## 2. Visitors and boss

| Arrives | Who | Tier · family · deck | Signature card (legendary) | Line |
|---|---|---|---|---|
| Sep 1 | **The Headmaster** (`the-headmaster`) · **giftOnly** | visitor · Coven · Coven + Foundry ("Natural Philosophy") | *The Headmaster*: 4 pts. Return. On Play: each player draws 1. *"A retired adventurer who has never once used the door to his own study. Sets homework that occasionally explodes."* | "Ah! A new pupil. Detention's at six, the syllabus is on fire, and you're late. Sit." |
| Sep 8 | **The Sixth Form** (`the-sixth-form`) · **giftOnly**, a group opponent | visitor · Salon · Salon + Irregulars | *The Sixth Form*: 3 pts. Elusive. Friend +2. On Play: turn one of your face-down cards face-up. *"Six misfits, one bad reputation, and they have never once left a friend face-down."* | "We're not in trouble. We're *near* trouble. It's different." |
| Sep 15–30, tournament only | **Flashman, of Rugby** (`flashman`), Thomas Hughes, *Tom Brown's School Days* (1857) | legend (tournament-only) · Rookery · Rookery + Yard | *Flashman*: 4 pts. Persist. On Play: Flip an opposing card worth 2 or less, then Flip another opposing card worth 2 or less. *"The worst boy at Rugby, and proud of it."* | "New, are you? Lovely. I'll go easy on you. I won't." |

## 3. Event cards

| Card id | Name | Family · type · rarity | Pts | Text | Flavour |
|---|---|---|---|---|---|
| `the-smallest-detective` · giftOnly | The Smallest Detective | Irregulars · character · U | 2 | Elusive. On Play: Reveal your opponent's hand. | *His father's case is still open. So is every drawer in the room.* |
| `the-anxious-scholar` · giftOnly | The Anxious Scholar | Coven · character · U | 2 | On Play: Scry 3. | *Has foreseen the exam, the results and the weather. Revises anyway.* |
| `the-lapsed-cleric` · giftOnly | The Lapsed Cleric | Salon · character · C | 2 | Friend +2. | *Has changed her religion three times this term. Every one of them still likes her.* |
| `michaelmas-blackberries` | Michaelmas Blackberries | neutral · gadget · C | 1 | On Play: Draw 1. | *Pick them before the twenty-ninth. After Michaelmas, the Devil's spat on them.* |

## 4. Threads

- **Coven:** Rowan and Red Thread (`rowan-and-red-thread`): *"'Rowan tree and red thread put the witches to their speed.' The witches find this hilarious."* Arrival gift from Sep 1. That makes 13 Coven cards: the family is complete.
- **Almanack:** ♎ Libra (`almanack-libra`): *"A pair of scales that won't tip, whatever you put on them."* Arrival gift from Sep 22 (the equinox: day and night balanced). The Almanack is complete at 12.
- **Tarot:** XIII Death, XX Judgement. All 22 are now unlocked.
- **Sleeve:** `sleeve-school-crest`, an ivy-and-quill school crest with no lettering.
- **Gift lines:** Sep 1: *"Pixie's tied a sprig of rowan to your chair with red thread. She says it's for the term. I didn't know you were enrolled."* Sep 22: *"Equinox. The almanack-seller brought the last page of the year, and said to tell you he'll start again in October."*

## 5. Enhancements

**Night School** (S-A, permanent from Sep 1): twelve **puzzle lessons** in the back parlour. Each is a fixed board, one turn long: *"Take the round this turn."* (or *"Take the table this turn."*). There's a short hint from the Headmaster, unlimited retries, and an Undo. Lessons are data (`src/lessons/lessons.ts`), so Brent can add more later.

| # | Lesson | Teaches | Headmaster's hint |
|---|---|---|---|
| 1 | Nicked | Flip and "worth N or less" | "Not the biggest. The one you can reach." |
| 2 | Company | Friend | "Nobody shines alone. Well, Bramwell does. Not the point." |
| 3 | Staying Power | Persist across rounds | "Look at what's already on the table." |
| 4 | Home Again | Return | "What you play now, you play again later." |
| 5 | Can't Keep a Good Card Down | Undying vs Flip | "Let them flip it. See what happens." |
| 6 | By the Light of the Moon | Moonrise in the final round | "Count the rounds, not the points." |
| 7 | Second Sight | Scry | "Arrange tomorrow before you play today." |
| 8 | Two Hearts | Devoted | "Some cards are better in pairs. Find the pair." |
| 9 | A Mischief | Mischief | "Mice in numbers. Count them." |
| 10 | Light Fingers | Steal | "Why beat it, when you can borrow it?" |
| 11 | Walk-On Part | Cameo | "It doesn't need to stay. It needs to do its job." |
| 12 | Final Examination | Everything: Location + Friend + Flip | "You know all of this. Show me." |

Rewards: 10 Checks for each first solve. All twelve solved: a **foil of her most-played card** (from the Ledger), with the beer mat *"Top of the class. The Headmaster has set fire to your report card in celebration."*

**A Year at the Bridge** (S-B): on the first launch on or after Sep 22 (once per year; re-openable afterwards from the collection), a recap styled as a **Victorian school report** on parchment with a brass-seal header, read from the Ledger:
- First evening at the Bridge (date) · matches played · tables taken · tournaments won · the Gauntlet's best height and bells rung · the Wainscot Affair (solved?)
- **Favourite card** (most played) · **Most-beaten opponent** · **Nemesis** (most losses to) · times the cats were played · Checks earned · first legendary (and its date)
- Collections: Coven x/13 · Almanack x/12 · Tarot x/22 · sleeves x/N
- **Headmaster's remarks** (one line chosen from her stats, e.g. *"Plays the Coven like she wrote it. Ahead of the syllabus."* / *"Has never once been beaten by Mudd. Mudd is aware."*) · **Sir Charles's remarks:** *"Same time next year, Landlady? The cellar door's started creaking again."*
- giftOnly: a slot for a **Letter from B.** dated Sep 22 (uses February's Letters mechanism; `TODO(Brent)` until he writes it).

**The Grand Reading** (S-B): from Sep 22, when all 22 arcana are unlocked, the Booth offers Pixie's one-time Grand Reading (overview §5.3). Three cards face-down on the shawl, turned one at a time:
- **Past:** her first legendary (*"Where you started."*)
- **Present:** her most-played card (*"What you lean on."*)
- **Future:** *The Landlady* (*"What was always going to be."*), shown as owned or as the reserved silhouette.

Then Pixie gives her a **foil Pamela Colman Smith**, with the line: *"Seventy-eight cards I painted, and that's the best reading I've ever given. Same time next year?"*

## 6. Tournament: The Michaelmas Examinations

| Field | Value |
|---|---|
| id | `michaelmas-exams` |
| When | Sep 15 – 30 |
| Unlock | event live and 3+ wins |
| Field | The Headmaster, the Sixth Form, Flashman, Miss Prudence Hollis, Inspector Bucket, Ada Lovelace + 1 random Seasoned |
| Entry rule | **"A broad education":** the deck must contain cards from at least three families (neutral doesn't count). Error: *"The Examinations require a broad education: at least three families in the deck."* |
| Entry / prize / consolation | 13 / *Flashman* + 150 / 13 |

## 7. Dressing and lines

- **Taproom variant** `background-the-taproom-michaelmas-term`: an early-autumn evening with the first falling leaves outside; a bowl of blackberries and a basket of apples on the bar; a roast Michaelmas goose on a platter; a jar of purple Michaelmas daisies; a chalkboard covered in geometry (no letters); school satchels, slates and inkwells on a table; a mortarboard on the hat stand; and the blue cellar door with the faintest orange glow round its edges (October is coming); the cats in their usual places.
- **lockedHint:** *"Term's started in the back parlour. Win a few hands first, and the Headmaster will enrol you."*
- **Sir Charles lines:**
  - *"Michaelmas. Goose for dinner, and no blackberries after the twenty-ninth. I don't make the rules. The Devil does."*
  - *"The Headmaster arrived in my cellar in a puff of smoke. He's asked if he can rent it for detention."* (giftOnly)
  - *"The cellar door has started creaking again. It does that, this time of year."*
- **Banner:** *"Michaelmas term at the Bridge. There's a night school in the back parlour, and the Headmaster says attendance is compulsory."*
- **Line overrides:**
  - `dickens`, when `the-headmaster` has arrived: *"I wrote a dreadful headmaster once. This one's worse, and his pupils adore him."* (giftOnly)
  - `prudence-hollis`, when `the-sixth-form` has arrived: *"Six pupils with no respect for authority. I'm putting them in my next book."* (giftOnly)
  - `bucket`, from Sep 15: *"Flashman? I've a file on him as thick as my arm. All of it from Rugby."*

---

## 8. Prompts

### S-A · Night School (Build agent · Sonnet · L = 5)

```
Read CLAUDE.md, the last three docs/logs entries, docs/design.md §5-§6 and §13, and docs/plans/monthly/11-september.md §5 (Night School). Every keyword from the monthly plan (Scry, Full Moon, Devoted, Mischief, steal, Cameo) has landed.

1. Data: src/lessons/lessons.ts. A Lesson = { id, number, title, teaches, hint, goal: "takeRound" | "takeTable", setup } where setup fully specifies a mid-match MatchState: the round and round wins so far, the player's board (face-up or face-down), hand and top of deck, the opponent's board, hand size and top of deck, the active Location, any modifier, and whose turn it is (always the player's, with exactly one play left in the round, or the decisive play). Add a createMatchFromSetup(setup) to the engine (test-only helpers may already exist; promote one if so).
2. Author all twelve lessons in the §5 table. Each must have exactly ONE winning line (or a small set of equivalent ones) and at least one tempting wrong line. Write a verifier test that brute-forces every legal play (including every target choice and every Scry order) for each lesson and asserts that the goal is reachable and that not every play reaches it. The opponent makes no further plays after hers unless the setup says the round continues; if it does, the opponent's replies are forced, and the verifier covers them.
3. Play: lessons run in the normal match screen with a slate banner showing the goal, a "Hint" button (the Headmaster's line), Undo (reset to the setup) and unlimited retries. Solving shows "Correct." with a chalk tick, pays 10 Checks on the first solve, and records it. All twelve solved: a foil of her most-played card (from the Ledger; ties broken by first played), once.
4. UI: a "Night School" door in the back parlour, permanent from the first launch on or after Sep 1 (any year), listing lessons as a slate grid with ticks.
5. design.md §13.5 "Night School".

Tests: the brute-force verifier for all 12; first-solve rewards paid once; the all-twelve reward once; unlock date; Undo resets exactly to the setup. A Playwright test that solves lesson 1.

Exit: npm run typecheck && npm test pass. Write /log. Push your branch and open a PR (wrapper W3). Don't merge.
```

### S-B · A Year at the Bridge and the Grand Reading (Build agent · Sonnet · M = 3)

```
Read CLAUDE.md, the last three docs/logs entries, docs/plans/monthly/00-monthly-content-plan.md §4.3 and §5.3, and docs/plans/monthly/11-september.md §5. The Ledger (November), the Booth (November) and Letters (February) have landed.

1. A Year at the Bridge: src/recap/yearRecap.ts computes a pure summary from the Ledger and save (every stat listed in 11-september.md §5, with sensible empty states: "Nemesis: nobody yet"). Headmaster's remarks: a small table of 10-12 conditional lines (write them in his voice; warm, funny, never critical), choosing the first that matches her stats (e.g. most Coven plays, never lost to Mudd, a Gauntlet bell, the case solved, all 22 tarot drawn), with a default. UI: a parchment "school report" screen with a brass-seal header, scrolling, with ruled sections; it shows on the first launch on or after Sep 22 once per year and is re-openable from the collection ("Reports" shelf, one per year kept). A giftOnly Letter slot: add a letter "year-report" dated Sep 22 with TODO(Brent) text (write no message text; Brent writes it), shown at the foot of the report when it has real text (the existing TODO guard applies).
2. The Grand Reading: in the Booth, from Sep 22, when all 22 arcana are unlocked and the Grand Reading hasn't been given, offer "Pixie has something special for you" instead of the daily draw (the daily draw is still available after). Three face-down cards on the shawl, turned one at a time with her lines from §5: Past = the Ledger's firstLegendary (fallback: her first reward card), Present = her most-played card, Future = the-landlady (rendered as owned, or as the reserved silhouette). After the third, grant a foil of pamela-colman-smith (once ever). Record it in the Ledger.
3. design.md §17.10 "The Year at the Bridge" and §17.2 (Booth) amended for the Grand Reading.

Tests: recap stats from a fixture Ledger (including empty states); remark selection; shown once per year from Sep 22; re-openable; the Grand Reading gated by date and all-22 unlocked, given once, with fallbacks for missing data; the foil granted once.

Exit: npm run typecheck && npm test pass. Write /log. Push your branch and open a PR (wrapper W3). Don't merge.
```

### S-C · September content (Content agent · Haiku · M = 3)

```
Read CLAUDE.md, the last three docs/logs entries, and docs/plans/monthly/11-september.md in full. S-A and S-B have landed.

Use ss-card-author to author September exactly as specified:
- §2: opponents the-headmaster (Sep 1) and the-sixth-form (Sep 8), tier "visitor", both giftOnly; flashman, tier "legend", tournament-only. Signature cards exactly as written (Flashman's On Play is two separate flip effects, each with maxPoints 2; the second can't pick the card the first flipped because it's already face-down). The Sixth Form's deck should include the three pupil cards from §3. Decks and bet pools as listed.
- §3: four event cards in src/cards/data/michaelmasTerm.ts (the three pupils are giftOnly).
- §4: rowan-and-red-thread (coven) and almanack-libra (two buffs: highestPoints -1 and lowestPoints +1, side each; check what happens when a side has one face-up card, which is both highest and lowest: it should net 0; test it).
- The pack src/events/packs/michaelmasTerm.ts: window Sep 1-30, visitors, minWins 3, cardPool, arrivalGifts (rowan-and-red-thread Sep 1, almanack-libra Sep 22), almanackIds, tarotIds ["tarot-death","tarot-judgement"], covenCardIds, sleeveId "sleeve-school-crest", banner, dressing and lineOverrides from §7 (taproomArtId "background-the-taproom-michaelmas-term").
- §6: tournament michaelmas-exams with the "broad education" entry rule (count distinct non-neutral families; error text exactly as written) and an explicit field constant.

Art manifest: art/prompts/sheet-19-manifest.json with every image in 11-september.md §9. Ingest anything in art/inbox.

Balance: curve for both visitors (40-50% starter wins), deck-local edits only. The starter deck (Yard + Salon + two cats from Irregulars and Rookery) counts as four families, so it can enter the Exams: confirm that.

Then a year-end check: write a short report in the log listing, for every pack Nov-Sep, the cards, opponents, tarot, almanack and sleeve it registers, and confirm all 13 Coven cards, 12 Almanacks, 22 tarot arcana and 11 sleeves exist and have art (or flag what art is missing).

Tests: Aug 31 nothing; Sep 1 the Headmaster, the Rowan gift and Night School; Sep 7 no Sixth Form, Sep 8 yes; Sep 15 the Exams with Flashman seated (not in Tonight's Patrons) and the entry rule enforced; Sep 22 Libra once, the Year report once, the Grand Reading offered; Oct 1 the visitors and Exams gone, Hallowe'en live, Night School still there.

Exit: npm run typecheck && npm test pass. Write /log. Report back to the orchestrator. The letter stays a hidden placeholder until Brent writes it (runbook §9); shipping doesn't wait for it.
If you fail the exit check twice, stop and report; the orchestrator reruns this on Sonnet.
```

---

## 9. Gemini one-shot: September art (16 images)

> **Run by the art agent** (runbook `12-orchestration-runbook.md` §7) through Claude in Chrome on gemini.google.com, using Brent's own signed-in Gemini account. The numbered steps below are what the art agent does in the browser; "you" means the art agent. Reference files are read from the Mac repo (`~/projects/steampunk-shuffle/`), and every finished image lands in `~/projects/steampunk-shuffle/art/inbox/<asset id>.png`. Brent does nothing here.

1. Fresh Gemini chat, image generation on.
2. Attach, in order: `art/reference/The_Wheatstone_Bridge_taproom.jpeg`, `public/art/portrait-inspector-bucket.webp`, `public/art/portrait-miss-prudence-hollis.webp`, `public/art/portrait-dodgy-reg-farrow.webp`.
3. Paste the block, save each image as `art/inbox/<asset id>.png`, type **next** (or **redo: <fix>**, or **start at image N** in a new chat).

```
You are the illustrator for a steampunk card game set in The Wheatstone Bridge, a public house in 1871 London whose cellar door opens onto any century. This month is Michaelmas, the start of the autumn school term: an eccentric headmaster opens a night school in the back parlour with his sixth form of misfit pupils, and the bully Flashman from "Tom Brown's School Days" (1857) arrives for the examinations. I need 16 images. Make them ONE AT A TIME, in the order below.

HOW WE WORK
- Each turn, generate exactly one image: the next one on the list. Start with image 1 now.
- After the image, write one line: "Image N of 16 — save as <asset id>.png". Put nothing else in the reply and don't ask questions. If something is ambiguous, pick the option that best fits the style rules and keep going.
- When I type "next", make the next image. When I type "redo: <note>", make the same image again with that fix. When I type "start at image N", jump to that image.
- Never put the asset id, a caption or any text inside the image itself.

ATTACHED REFERENCES
- Attachment 1 is the taproom of The Wheatstone Bridge, the style anchor for every image: match its painting style, brushwork, lighting and palette.
- Attachments 2-4 are existing portraits from the game. Use them ONLY as style references for rendering, finish, framing and light. Never copy their faces, clothing or identity.
- Card art for a character must show the SAME character you drew in the portrait just before it, in this chat.

IMPORTANT
The Headmaster, the Sixth Form and the three pupils are ORIGINAL Victorian characters: don't base them on any existing TV, web-series, game or book characters or actors, and nothing from any wizard-school film or book series (no house scarves, no wands, no lightning scars, no castle school).

HOUSE STYLE (every image unless it says otherwise)
Painterly digital illustration in a Victorian-engineering steampunk style: brass, steam, gaslight and iron, never goggles-and-corsets cosplay. Visible, controlled brushwork, like a colourised Victorian book plate. Confident inked contours softened by the paint underneath. Directional light: a warm key light from one side, cool ambient fill, real cast shadows. A faint paper-grain texture. ONE dominant colour plus parchment cream and warm ink black, with other colours only as small accents. Palette: brass/copper, oxblood leather, verdigris, gaslight amber, gunmetal blue, heather (dusky muted violet), parchment cream, warm ink black, sparing sovereign gold, plus autumn russet and blackberry purple as small accents only. Paint to every edge: the game adds its own card border.

FRAMING BY TYPE
- Portrait (1:1): bust portrait, three-quarter turn, slightly tighter than bust-to-waist, soft blurred background (a group portrait where the image says so).
- Card art (3:4): bust-to-waist (or as described), a moment of action, soft blurred background.
- Object or place card (3:4): the object or place is the subject.
- Almanack (3:4): looks PRINTED: a centred, symmetrical woodcut-engraving of a zodiac figure inside a brass orrery ring of concentric bands and small planets, on foxed parchment, warm ink black with one sovereign-gold accent. No glyphs, numbers or lettering.
- Tarot (2:3): the classic 1909 Rider-Waite-Smith composition for that card, repainted in the house style with Victorian-engineering details, thin painted border inside the image. No numerals, title or lettering.
- Sleeve (3:4): a card back: symmetrical, pattern-led, full-bleed, readable at thumbnail size. No lettering.
- Background (9:16): the full room, calm, uncluttered space in the lower third for game interface.

NEGATIVE RULES (every image, plus extras per image)
no text, no lettering, no numbers, no letters on chalkboards or books, no watermark, no signature, no logo, no photorealistic photography look, no 3D render look, no anime style, no cartoon style, no goggles-and-corsets cosplay clichés, no modern clothing or objects, no wands, no house scarves, no gore, no graphic violence, no skeletons, no distorted or extra hands/limbs, no border or frame (except tarot), no white or cream margin, no vignette

THE 16 IMAGES

1 · background-the-taproom-michaelmas-term · Background, 9:16
The SAME taproom as attachment 1, same layout, fireplace, brass piping and oxblood booths, on an early-autumn evening: the first russet leaves blowing past the windows; a bowl of blackberries and a basket of red apples on the bar; a roast goose on a pewter platter; a jar of purple Michaelmas daisies; a chalkboard on an easel covered in geometric diagrams (no letters or numbers); leather school satchels, slates and inkwells on a table; a mortarboard hanging on the hat stand; and the blue cellar door with the faintest warm orange glow leaking round its edges. A black cat asleep on a stool. The empty chair by the fire is still slightly apart. No people.

2 · portrait-the-headmaster · Portrait, 1:1, style reference attachment 2
The Headmaster, an ORIGINAL character: a tall, lean, wildly eccentric elderly gentleman with a magnificent forked white beard, bright mischievous eyes under bushy brows, a battered academic gown over an explorer's khaki waistcoat hung with brass compasses and a small brass astrolabe, a mortarboard tilted at a rakish angle, and wisps of coloured smoke curling round his shoulders as if he has just appeared. Behind him, softly blurred, a cluttered study of maps, trophies and a stuffed crocodile. Heather dominant, brass accents, parchment and ink, warm lamplight.

3 · the-headmaster · Card art, 3:4, style reference attachment 2
The same Headmaster as image 2, bust-to-waist, materialising in a puff of violet smoke in the middle of a pub card table rather than using the door, cheerfully dealing a card to each player at once with both hands, while a stack of marked homework behind him bursts gently into flame. Heather dominant, brass, parchment and ink, warm light.

4 · portrait-the-sixth-form · Portrait (group), 1:1, style reference attachment 3
The Sixth Form, six ORIGINAL Victorian teenage pupils crowded into one frame like a school photograph that's gone wrong: a tall, handsome, overconfident boy in a fine naval-cut coat with a cavalry sword; a very small, sharp-eyed boy in a too-big detective's ulster with a notebook; a gentle giant of a boy in shirtsleeves with a drum and a spanner; a girl in a punkish, patched black dress with a cropped jacket and a bass viol; an anxious, studious girl with long pale hair, ink-stained fingers and a stack of books; and a sunny girl in a plain blue dress wearing several different religious pendants at once. They're grinning, scowling and elbowing each other. Verdigris dominant, parchment and ink, warm gaslight.
Extra negatives: no school uniform ties, no house scarves, no wands.

5 · the-sixth-form · Card art, 3:4, style reference attachment 3
The same six pupils as image 4, piled round a pub card table at night in the back parlour, pulling one of their friends' face-down cards back up face-up together with a cheer, while the Headmaster's silhouette watches approvingly from the doorway. Verdigris dominant, parchment and ink, warm lamplight.

6 · portrait-flashman · Portrait, 1:1, style reference attachment 4
Flashman, the bully of Rugby School in the 1830s, from "Tom Brown's School Days": a big, handsome, sneering seventeen-year-old in a fine tail-coat and a high collar, a top hat tilted back, a tankard in one hand, his other hand on the shoulder of an unseen smaller boy, with a confident, cruel, charming smile. Behind him, softly blurred, the fireplace of a school hall. Oxblood dominant, parchment and ink, warm firelight.

7 · flashman · Card art, 3:4, style reference attachment 4
The same Flashman as image 6, bust-to-waist, lounging across a pub card table and flicking two of the opponent's small cards face-down with his fingertips, one after the other, smirking. Oxblood dominant, parchment and ink, warm gaslight.
Extra negatives: no violence, no blood.

8 · the-smallest-detective · Card art, 3:4, style reference attachment 2
The very small, sharp-eyed boy detective from image 4, bust-to-waist, in his too-big ulster coat, crouched on a chair with a magnifying glass to the opponent's fanned hand of cards (which shows its colourful faces to the viewer, with no letters or numbers), every drawer of a desk behind him pulled open and a faded photograph of a man in a detective's coat pinned above it. Gaslight amber dominant, parchment and ink.

9 · the-anxious-scholar · Card art, 3:4, style reference attachment 3
The anxious, studious girl from image 4, bust-to-waist, in a candlelit library, revising frantically from a towering stack of books while faint silvery visions (a clock, a storm cloud, an examination desk) drift in the air around her head; she is holding the top three cards of a deck fanned in one hand, rearranging them. Heather dominant, silver vision-light, parchment and ink.

10 · the-lapsed-cleric · Card art, 3:4, style reference attachment 3
The sunny girl in the plain blue dress from image 4, bust-to-waist, laughing with her arms round two friends' shoulders (seen partly, blurred), several different religious pendants and charms on ribbons round her neck catching the light, a small sun-shaped brass medal among them. Verdigris dominant, sky blue, parchment and ink, warm daylight.

11 · michaelmas-blackberries · Object card, 3:4, no style reference
A tangle of bramble in a hedgerow in late September, heavy with ripe glossy blackberries, a small enamel tin half full of picked berries hooked on a thorn, russet leaves and a few late white flowers, a pale autumn sun low behind; one stem of berries in the corner is withered and dark. Blackberry purple and russet, parchment and ink. No people.

12 · rowan-and-red-thread · Object card, 3:4, no style reference
A sprig of rowan with bright orange-red berries and feathery leaves, bound into an equal-armed cross with red thread, hanging from a brass hook on the back of a wooden chair by a hearth. Heather dominant, rowan red, parchment and ink, warm hearth light. No people.

13 · almanack-libra · Almanack, 3:4
Libra: a pair of balanced brass scales hanging perfectly level from a central post, a small sun on one pan and a crescent moon on the other, centred in woodcut style inside a brass orrery ring of concentric bands and tiny planets. Warm ink on foxed parchment, the scales picked out in sovereign gold.

14 · tarot-death · Tarot, 2:3
Death: an armoured skeletal rider on a white horse carrying a black banner with a white rose, a fallen king, a praying bishop and a kneeling child and maiden before him, a sun rising between two towers on the horizon behind. In this version keep it gentle and symbolic: the rider is a dark, hooded, faceless armoured figure (no skull), the banner's rose is a white brass-filigree rose, and the rising sun is bright and hopeful. Ink black and parchment, white rose, dawn gold, thin painted border.
Extra negatives: no skull, no skeleton, no gore.

15 · tarot-judgement · Tarot, 2:3
Judgement: a great winged angel in the clouds blowing a long trumpet hung with a banner bearing a cross, and below, figures rising from open stone boxes with arms raised in wonder, mountains behind. In this version the trumpet is a long brass post-horn and the rising figures are fully clothed in pale Victorian nightclothes. Sky blue and sovereign gold, parchment, thin painted border.
Extra negatives: no nudity, no coffins with bodies, no gore.

16 · sleeve-school-crest · Sleeve, 3:4
A card back: a symmetrical heraldic school crest at the centre (a shield quartered with a brass key, a quill, an open book with blank pages and a crescent moon, with no lettering or motto scroll), surrounded by a lattice of ivy leaves on a deep verdigris ground, with a thin repeating border of tiny quills. Perfectly symmetrical left to right.

Begin with image 1 now.
```
