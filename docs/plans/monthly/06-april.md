# April: The Cellar Cabaret

**Window:** Apr 1 – Apr 30 · **Arrivals:** the Hatter Apr 1 · the Cheshire Cat Apr 8 · **Tournament:** Apr 15 – 30
**Event id:** `cellar-cabaret` · **Art sheet:** `sheet-14` · **minWins:** 3

## 1. The idea

April Fools' Day, and the back parlour turns into a Victorian music hall. Lewis Carroll's Wonderland folk come up the cellar stairs (*Alice*, 1865, public domain; Tenniel's look, never Disney's): the Hatter, who brings a tea party that never ends, and the Cheshire Cat, whose grin turns up on Hiawatha's stool before the rest of him does. Then an Impresario arrives with a game in which **nobody knows the rules until they've played a round**.

**This is the Dropout month (giftOnly allusions):** *Game Changer* (a tournament where the rule is secret until you've played it), *Um, Actually* (Sir Charles has been saying "it was Christie's bridge" since day one), *Make Some Noise* and *Dirty Laundry* as cards.

**Enhancement:** **House Rules of the Night**, a reusable match-modifier system. It drives the tournament, April Fools' Day (a random rule in every game that day), and any future event that wants one.

## 2. Visitors and boss

| Arrives | Who | Tier · family · deck | Signature card (legendary) | Line |
|---|---|---|---|---|
| Apr 1 | **The Hatter** (`the-hatter`), Carroll | visitor · Salon · Salon + Irregulars ("The Parlour Game") | *The Hatter*: 3 pts. Friend +1. On Play: each player draws 1. *"It's always six o'clock, always tea-time, and always room for one more. "No room! No room!" he says, and pours you a cup."* | "Why is a raven like a writing desk? Deal, and I'll tell you. I won't." |
| Apr 8 | **The Cheshire Cat** (`cheshire-cat`), Carroll | visitor · Irregulars · Irregulars + Rookery | *The Cheshire Cat*: 2 pts. Elusive. Return. On Play: Reveal your opponent's hand. *"We're all mad here."* | *(The grin arrives a moment before the rest of him, and leaves a moment after.)* |
| Apr 15–30, tournament only | **The Impresario** (`the-impresario`) · **giftOnly** | legend (tournament-only) · Irregulars · Irregulars + Salon | *The Impresario*: 4 pts. Persist. On Play: the House Rule changes. *"Nobody knows the game until they've played it. That's the game."* | "Welcome, welcome! Tonight's game is… oh, you'll find out." |

The Cheshire Cat isn't one of the pub's cats and never joins the clowder (overview §2.5). He's a visitor, and the cats are unimpressed.

## 3. Event cards

| Card id | Name | Family · type · rarity | Pts | Text | Flavour |
|---|---|---|---|---|---|
| `um-actually` · giftOnly | Um, Actually | Irregulars · scheme · U | 0 | On Play: Flip an opposing card worth 3 or less. | *"It was Christie's bridge." Sir Charles, to everyone, always.* |
| `make-some-noise` · giftOnly | Make Some Noise | Salon · scheme · C | 0 | On Play: each of your face-up Friend cards gets +1. | *Tonight's prompt: a constable who has just remembered he left the kettle on.* |
| `dirty-laundry` · giftOnly | Dirty Laundry | Rookery · gadget · C | 1 | On Play: each player reveals their hand. Then Draw 1. | *Whose is it? Everyone at the table pretends not to know.* |
| `drink-me` | Drink Me | neutral · gadget · U | 1 | On Play: one of your face-up cards gets +2. | *It wasn't marked "poison", so she drank it. Sir Charles has since labelled everything.* |
| `the-mad-tea-party` | The Mad Tea Party | neutral · location · R | 0 | At end of round, each player returns their highest face-up card to hand. | *"Clean cups! Move down!"* |

## 4. Threads

- **Coven:** Hag Stone (`hag-stone`): *"Look through the hole and you see true. Sir Charles looked, and saw that the till was short."* Arrival gift from Apr 1.
- **Almanack:** ♉ Taurus (`almanack-taurus`): *"A bull at rest in a meadow. He'll move when he's ready, and not before."* Arrival gift from Apr 20.
- **Tarot:** V The Hierophant, XVI The Tower.
- **Sleeve:** `sleeve-playbill`, an ornate music-hall playbill border with footlights and masks (no lettering).
- **Gift lines:** Apr 1: *"Pixie gave me a stone with a hole in it. I looked through it at you. You're exactly as you seem. Here."* Apr 20: *"The almanack-seller says it's Taurus. He was very slow about it."*

## 5. Enhancement: House Rules of the Night

A **MatchModifier** is a named, reversible tweak to one match's rules, read by the engine through one `modifiers` field on `MatchState`. It's set at `createMatch` (or by an effect) and always shown on a small chalkboard chip during the match. Eight to start:

| id | Name | Effect |
|---|---|---|
| `topsy-turvy` | Topsy-Turvy | The **lower** score takes the round. |
| `double-company` | Double Company | Friend bonuses are doubled. |
| `no-fixed-abode` | No Fixed Abode | Persist does nothing tonight. |
| `second-helpings` | Second Helpings | Draw 2 at the start of each turn. |
| `long-arm` | The Long Arm of the Law | Every Flip reaches 1 point further ("worth 3 or less" becomes "worth 4 or less"). |
| `short-measures` | Short Measures | Each round is two turns each, not three. |
| `everyones-a-friend` | Everyone's a Friend | Every face-up Character counts as having Friend +0 (so it enables other Friends). June's Globe reuses this. |
| `open-books` | Open Books | Both hands are face-up to both players all match. |

**Where modifiers come from:**
- **The Changing Game** (tournament): each match secretly draws one modifier. Round 1 is played with normal rules; at the end of round 1 it's revealed (*"Tonight's game was Topsy-Turvy. It is now."*) and it applies from round 2 onward. That's the *Game Changer* joke made fair: the AI doesn't know it in round 1 either.
- **April Fools' Day** (Apr 1, every year): every pickup game draws a random modifier, active from the start and shown on the pre-match screen, with a toggle *"Feeling foolish? (on)"* to play it straight instead.
- **The Impresario's On Play** (a new effect, `changeHouseRule`): replaces the current modifier with a different random one (or sets one if there was none), with a chalkboard wipe animation.

## 6. Tournament: The Changing Game

| Field | Value |
|---|---|
| id | `changing-game` |
| When | Apr 15 – 30 |
| Unlock | event live and 3+ wins |
| Field | The Hatter, the Cheshire Cat, the Impresario, Sherlock Holmes, Ada Lovelace + 2 random Seasoned |
| Entry rule | any legal deck |
| Match rule | a secret House Rule per match, revealed after round 1 (§5) |
| Entry / prize / consolation | 13 / *The Impresario* + 150 / 13 (public build: the J-B fallback) |

## 7. Dressing and lines

- **Taproom variant** `background-the-taproom-cellar-cabaret`: the far end of the room turned into a little music-hall stage with brass footlights and a red velvet curtain; paper bunting and confetti; mismatched teacups and teapots on every table; a top hat on the bar with a paper price ticket in its band (no legible writing); a faint, floating grin above an empty stool; a chalkboard of rules that's been rubbed out and rewritten (no letters); the cats in their usual places, unimpressed.
- **lockedHint:** *"There's a cabaret in the back parlour. Win a few hands first, and I'll find you a seat."*
- **Sir Charles lines:**
  - *"Um, actually, it was Christie's bridge. …What? It was."* (giftOnly)
  - *"The Hatter has moved down eleven places. There are nine chairs."*
  - *"There's a grin on Hiawatha's stool. Hiawatha is not amused."*
- **Banner:** *"April at the Bridge. The back parlour's a music hall, and nobody will tell me the rules."*
- **Line overrides:**
  - `mudd`, **Apr 1 only**: *"Sir Charles says I've been promoted to Inspector. …It's the first of April, isn't it."*
  - `dickens`, when `the-hatter` has arrived: *"Mr Carroll's hatter. I've been to tea parties like that. I've hosted some."*
  - `holmes`, from Apr 15: *"A game whose rules change after it's begun. At last, something worth deducing."*

---

## 8. Prompts

### A-A · House Rules of the Night (Build agent · Sonnet · L = 5)

```
Read CLAUDE.md, the last three docs/logs entries, docs/design.md §5-§6 and §10, and docs/plans/monthly/06-april.md §5-§6.

Build the match-modifier system.

1. src/engine/modifiers.ts: a MatchModifier registry with the eight entries in §5 (id, name, one-line rules text for the chalkboard chip, and the hook it uses). MatchState gains `modifiers: { active: ModifierId | null; revealAtRound?: number }`. createMatch takes an optional { modifier, revealAtRound } option. A modifier is inactive (rules unchanged) until revealAtRound, if that's set.
2. Engine hooks, each covered by tests: round winner comparison (topsy-turvy); the Friend bonus multiplier (double-company); Persist at end of round (no-fixed-abode); draws per turn (second-helpings); Flip filters maxPoints + 1 when resolving (long-arm); turns per round (short-measures; check the tutorial and any "three turns" assumptions in the AI, sim and UI); a continuous "counts as Friend +0" check for every face-up Character (everyones-a-friend: build it as a general `grantsFriend` concept that a Location can also use later, since June needs it); hands visible to both (open-books: the UI shows the opponent's hand, and the AI's hidden-hand sampler uses the truth).
3. Effect { effect: "changeHouseRule" }: sets the active modifier to a uniformly random different one from the registry using the match RNG (deterministic), revealed immediately.
4. AI: each hook must be readable by the evaluator (topsy-turvy inverts round-score preference; short-measures shortens lookahead; and so on). Don't let the AI see a modifier before its revealAtRound.
5. Tournaments: an optional Tournament field `secretModifier: true` draws a modifier per match from the bracket seed, with revealAtRound 2. At the end of round 1, show a chalkboard reveal beer mat: "Tonight's game was <Name>. It is now." Pickup games on April 1 (local, any year): draw a random modifier active from round 1, shown on the pre-match screen with a "Feeling foolish?" toggle (default on; persisted for the day).
6. UI: a chalkboard chip in the match HUD showing the active modifier's name and rules (tap for detail); a chalk-wipe animation on change (static under Reduce Motion).
7. design.md §6.6 "House Rules of the Night" and a House Rules page section.

Tests: each modifier's hook; revealAtRound gating (rules unchanged in round 1, active from round 2); changeHouseRule determinism and "different from current"; secretModifier tournaments; the April 1 behaviour and toggle (Mar 31, Apr 1, Apr 2); the property test still runs to completion with a random modifier per seeded game; the sim with each modifier doesn't crash.

Exit: npm run typecheck && npm test pass; npm run sim (no modifier) shows no regression. Write /log. Push your branch and open a PR (wrapper W3). Don't merge.
```

### A-B · April content (Content agent · Haiku · M = 3)

```
Read CLAUDE.md, the last three docs/logs entries, and docs/plans/monthly/06-april.md in full. A-A has landed.

Use ss-card-author to author April exactly as specified:
- §2: opponents the-hatter (Apr 1) and cheshire-cat (Apr 8), tier "visitor"; the-impresario, tier "legend", tournament-only, giftOnly. Signature cards exactly as written (the Impresario's On Play is { effect: "changeHouseRule" }). Decks and bet pools as listed.
- §3: five event cards in src/cards/data/cellarCabaret.ts; um-actually, make-some-noise and dirty-laundry are giftOnly. Check The Mad Tea Party's endOfRound return-highest against how the-witching-hour does return-lowest.
- §4: hag-stone (coven) and almanack-taurus.
- The pack src/events/packs/cellarCabaret.ts: window Apr 1-30, visitors, minWins 3, cardPool, arrivalGifts (hag-stone Apr 1, almanack-taurus Apr 20, lines from §4), almanackIds, tarotIds ["tarot-the-hierophant","tarot-the-tower"], covenCardIds, sleeveId "sleeve-playbill", banner, dressing and lineOverrides from §7 (taproomArtId "background-the-taproom-cellar-cabaret"). The Mudd override is Apr 1 only: add `until?: MonthDay` to LineOverride if it isn't there yet, with a test. The "Um, actually" Sir Charles line is giftOnly.
- §6: tournament changing-game with secretModifier: true, an explicit field constant, no house Location.

Art manifest: art/prompts/sheet-14-manifest.json with every image in 06-april.md §9. Ingest anything in art/inbox.

Balance: curve for both visitors (40-50% starter wins), deck-local edits only.

Tests: Mar 31 nothing; Apr 1 the Hatter, the Hag Stone gift, the April Fools' modifier in pickups and Mudd's line; Apr 2 Mudd's normal line; Apr 7 no Cheshire Cat, Apr 8 yes; Apr 15 the Changing Game with the Impresario seated (not in Tonight's Patrons) and a secret modifier revealed after round 1; Apr 20 Taurus once; May 1 everything gone; a public build has none of the giftOnly cards or lines and still runs the tournament with the fallback.

Exit: npm run typecheck && npm test pass. Write /log. Report back to the orchestrator; it merges, deploys and uploads the TestFlight build (runbook §5).
If you fail the exit check twice, stop and report; the orchestrator reruns this on Sonnet.
```

---

## 9. Gemini one-shot: April art (17 images)

> **Run by the art agent** (runbook `12-orchestration-runbook.md` §7) through Claude in Chrome on gemini.google.com, using Brent's own signed-in Gemini account. The numbered steps below are what the art agent does in the browser; "you" means the art agent. Reference files are read from the Mac repo (`~/projects/steampunk-shuffle/`), and every finished image lands in `~/projects/steampunk-shuffle/art/inbox/<asset id>.png`. Brent does nothing here.

1. Fresh Gemini chat, image generation on.
2. Attach, in order: `art/reference/The_Wheatstone_Bridge_taproom.jpeg`, `public/art/portrait-charles-dickens.webp`, `public/art/portrait-irene-adler.webp`, `public/art/hiawatha.webp`.
3. Paste the block, save each image as `art/inbox/<asset id>.png`, type **next** (or **redo: <fix>**, or **start at image N** in a new chat).

```
You are the illustrator for a steampunk card game set in The Wheatstone Bridge, a public house in 1871 London whose cellar door opens onto any century. This month is April Fools': the back parlour becomes a Victorian music hall, and Lewis Carroll's 1865 Wonderland characters visit. I need 17 images. Make them ONE AT A TIME, in the order below.

HOW WE WORK
- Each turn, generate exactly one image: the next one on the list. Start with image 1 now.
- After the image, write one line: "Image N of 17 — save as <asset id>.png". Put nothing else in the reply and don't ask questions. If something is ambiguous, pick the option that best fits the style rules and keep going.
- When I type "next", make the next image. When I type "redo: <note>", make the same image again with that fix. When I type "start at image N", jump to that image.
- Never put the asset id, a caption or any text inside the image itself.

ATTACHED REFERENCES
- Attachment 1 is the taproom of The Wheatstone Bridge, the style anchor for every image: match its painting style, brushwork, lighting and palette.
- Attachments 2-3 are existing portraits from the game. Use them ONLY as style references for rendering, finish, framing and light. Never copy their faces, clothing or identity.
- Attachment 4 is Hiawatha, the pub's real black cat, as he appears in the game. Use him ONLY where an image says so.
- Card art for a character must show the SAME character you drew in the portrait just before it, in this chat.

SOURCE
Draw the Wonderland characters from Carroll's text and John Tenniel's original 1865 engravings only. Absolutely no Disney look, no Tim Burton film look, and no likeness of any actor. The Impresario is an ORIGINAL character: don't base him on any real person, TV host or actor.

HOUSE STYLE (every image unless it says otherwise)
Painterly digital illustration in a Victorian-engineering steampunk style: brass, steam, gaslight and iron, never goggles-and-corsets cosplay. Visible, controlled brushwork, like a colourised Victorian book plate. Confident inked contours softened by the paint underneath. Directional gaslight: a warm key light from one side, cool ambient fill, real cast shadows. A faint paper-grain texture. ONE dominant colour plus parchment cream and warm ink black, with other colours only as small accents. Palette: brass/copper, oxblood leather, verdigris, gaslight amber, gunmetal blue, heather (dusky muted violet), parchment cream, warm ink black, sparing sovereign gold. Paint to every edge: the game adds its own card border.

FRAMING BY TYPE
- Portrait (1:1): bust portrait, three-quarter turn, slightly tighter than bust-to-waist, soft blurred background.
- Card art (3:4): bust-to-waist (or as described), a moment of action, soft blurred background.
- Object or place card (3:4): the object or place is the subject.
- Almanack (3:4): looks PRINTED: a centred, symmetrical woodcut-engraving of a zodiac figure inside a brass orrery ring of concentric bands and small planets, on foxed parchment, warm ink black with one sovereign-gold accent. No glyphs, numbers or lettering.
- Tarot (2:3): the classic 1909 Rider-Waite-Smith composition for that card, repainted in the house style with Victorian-engineering details, thin painted border inside the image. No numerals, title or lettering.
- Sleeve (3:4): a card back: symmetrical, pattern-led, full-bleed, readable at thumbnail size. No lettering.
- Background (9:16): the full room, calm, uncluttered space in the lower third for game interface.

NEGATIVE RULES (every image, plus extras per image)
no text, no lettering, no numbers, no price on tickets, no watermark, no signature, no logo, no photorealistic photography look, no 3D render look, no anime style, no cartoon style, no Disney style, no goggles-and-corsets cosplay clichés, no modern clothing or objects, no microphones, no TV studio, no gore, no graphic violence, no distorted or extra hands/limbs, no border or frame (except tarot), no white or cream margin, no vignette

THE 17 IMAGES

1 · background-the-taproom-cellar-cabaret · Background, 9:16
The SAME taproom as attachment 1, same layout, fireplace, brass piping and oxblood booths, turned into a music hall for April: at the far end, a small raised stage with a row of brass footlights and a red velvet curtain; paper bunting and confetti; mismatched teacups and teapots on every table; on the bar, a tall top hat with a blank paper ticket tucked in its band; above one empty stool, a faint, floating, wide cat's grin with no cat; a chalkboard by the bar with chalk scribbles rubbed out and rewritten (no letters). A black cat on a nearby stool, glaring at the grin. The empty chair by the fire is still slightly apart. No people.

2 · portrait-the-hatter · Portrait, 1:1, style reference attachment 2
The Hatter as Tenniel engraved him: a small, wiry man with an oversized head, a long sharp nose, wide staring eyes and a big toothy grin, an enormous tall top hat with a paper ticket in the band, a loud chequered waistcoat and a huge floppy bow tie, a teacup held in one hand and a half-eaten slice of bread and butter in the other. Behind him, softly blurred, a long table crowded with teapots. Verdigris dominant, parchment and ink, warm gaslight.

3 · the-hatter · Card art, 3:4, style reference attachment 2
The same Hatter as image 2, bust-to-waist, at the head of a long, chaotic pub tea table, flinging cards out across it to everyone like a dealer gone mad while pouring tea from a pot held at arm's length; teacups, a sleepy dormouse in a teapot, and a pocket-watch dunked in a cup of tea crowd the table. Verdigris dominant, parchment and ink, warm gaslight.

4 · portrait-cheshire-cat · Portrait, 1:1, no style reference
The Cheshire Cat as Tenniel engraved him: a large, plump, striped tabby cat with an enormous wide crescent grin full of teeth and round knowing eyes, lounging on a gnarled branch; the tip of his tail and his hindquarters are already fading into nothing. Gaslight amber dominant, parchment and ink, soft green-gold forest light. A real-looking striped cat with an impossible grin, not a cartoon.
Extra negatives: no pink-and-purple stripes, no Disney look.

5 · cheshire-cat · Card art, 3:4, no style reference
The same striped grinning cat as image 4, materialising on a pub card table, half-visible (only his head, grin and front paws solid, the rest a faint outline), peering with amusement at the opponent's fanned hand of cards, which shows its faces to the viewer (colourful card faces with no letters or numbers). Gaslight amber dominant, parchment and ink.

6 · portrait-the-impresario · Portrait, 1:1, style reference attachment 3
The Impresario, an ORIGINAL character: a dapper, lean Victorian music-hall showman of about forty with neat dark hair, a sly, delighted grin, a crimson tailcoat with gold frogging, a gold brocade waistcoat, a silver-topped cane, and a small sealed envelope held up between two fingers as if it contains a secret. Behind him, softly blurred, a stage curtain and footlights. Oxblood dominant, sovereign-gold accents, parchment and ink, warm footlight glow from below.

7 · the-impresario · Card art, 3:4, style reference attachment 3
The same showman as image 6, bust-to-waist, on a small stage with a chalkboard on an easel beside him: with a flourish of his cane he is wiping the board clean in a swirl of chalk dust while a cloud of chalk motes hangs in the footlights; the audience below (backs of heads, blurred) leans forward. Oxblood dominant, sovereign gold, footlight glow.

8 · um-actually · Card art (vignette), 3:4, no style reference
A gentleman's hand (only the hand and a shirt cuff with a brass cufflink) raised with one finger lifted, pedantically, over a pub card table, above an open encyclopaedia volume and a small brass Wheatstone bridge galvanometer instrument; an opponent's card on the table is just tipping face-down. Gaslight amber dominant, parchment and ink.
Extra negatives: no legible words in the book.

9 · make-some-noise · Card art (vignette), 3:4, no style reference
A crowded Victorian music-hall moment: on a little stage, a perplexed young constable in a gunmetal-blue uniform clutches his helmet in sudden horror (he has just remembered the kettle) while a smoking kettle is painted on a backdrop behind him; the audience in the foreground (backs of heads, a raised tankard, a lady's feathered hat) roars with laughter. Gaslight amber and gunmetal blue, parchment and ink, footlight glow.

10 · dirty-laundry · Object card, 3:4, no style reference
A Victorian wicker laundry basket on a pub table, its lid flipped open, spilling out a jumble of personal oddities: a single lace glove, a love letter with a broken seal (no writing), a false moustache, a pawn ticket, a sock with a hole, a tiny portrait miniature; several hands (only hands and cuffs, different sleeves) reach in from the edges as if each claims none of it. Oxblood dominant, parchment and ink, warm gaslight.

11 · drink-me · Object card, 3:4, no style reference
A small Victorian glass bottle with a paper label tied round its neck by a ribbon (the label blank), standing on a three-legged glass table in a long hall of doors, a tiny golden key beside it. The liquid inside shimmers through several colours. Verdigris dominant, sovereign-gold key, parchment and ink, soft light.
Extra negatives: no lettering on the label.

12 · the-mad-tea-party · Place card, 3:4, no style reference
A long trestle table under a great tree in front of a house with chimneys shaped like ears and a roof thatched with fur, laid for a tea party of dozens: teapots, cups, a jam pot, bread and butter, cake; every place has been used and abandoned, chairs pushed back at odd angles, a pocket-watch in the butter dish, a dormouse asleep in a teapot. Verdigris and parchment, warm afternoon light, ink. No people.

13 · hag-stone · Object card, 3:4, no style reference
A smooth grey beach flint with a natural hole worn right through it, hung on a red thread, held up close to the viewer by a woman's fingers (fingertips only), and through the hole you see the pub's taproom (gaslight, the bar) clearly and in sharp focus while everything around the stone is soft and blurred. Heather dominant, parchment and ink, warm light through the hole.

14 · almanack-taurus · Almanack, 3:4
Taurus: a powerful bull lying at rest with its legs folded under it, head raised, curving horns crowned with a small garland of flowers, centred in woodcut style inside a brass orrery ring of concentric bands and tiny planets. Warm ink on foxed parchment, the horns picked out in sovereign gold.

15 · tarot-the-hierophant · Tarot, 2:3
The Hierophant: a robed, triple-crowned religious teacher seated between two grey pillars, one hand raised in blessing and the other holding a triple cross staff, two crossed keys at his feet and two tonsured acolytes kneeling before him. In this version the keys are ornate brass Victorian keys and the pillars are cast iron. Oxblood and sovereign gold, parchment, thin painted border.

16 · tarot-the-tower · Tarot, 2:3
The Tower: a tall grey stone tower on a rocky peak struck by a jagged bolt of lightning, its crown blown off in flames, two small figures tumbling from it among falling sparks, against a black sky. In this version the lightning comes from a crackling galvanic coil in the clouds and the crown is a brass dome. Ink black and fire-gold, thin painted border. Dramatic, not gory.
Extra negatives: no gore, no blood.

17 · sleeve-playbill · Sleeve, 3:4
A card back: an ornate Victorian music-hall playbill border with no words, a symmetrical frame of curling scrollwork, comedy and tragedy masks at top and bottom, brass footlights along the lower edge, stars in the corners, and at the exact centre a small brass medallion of a top hat with a playing card in its band. Oxblood and sovereign gold on parchment. Perfectly symmetrical top to bottom and left to right.

Begin with image 1 now.
```
