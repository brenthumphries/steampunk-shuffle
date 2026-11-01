# May: Maying

**Window:** May 1 – May 31 · **Arrivals:** Robin Hood May 1 · Nicholas Culpeper May 8 · **Tournament:** May 15 – 31
**Event id:** `maying` · **Art sheet:** `sheet-15` · **minWins:** 3

## 1. The idea

May Day: hawthorn over the door, a maypole in the yard, morris bells, and London's chimney sweeps parading as a walking hedge (Jack-in-the-Green, a real Victorian May Day custom). The old English May Games always starred **Robin Hood**, and he finally comes up the cellar stairs. He's the stretch legend from design.md §9.3, bringing the game's only steal. **Nicholas Culpeper** (1616–1654), the Spitalfields herbalist who cast a horoscope for every plant in his *English Physitian* (1652), brings the year's most witchy feature: a **kitchen-witch window box** on the pub's sill. **Herne the Hunter**, the antlered spectre of Windsor Forest, rides in for the May Games.

Witchy notes: Beltane fires, herbs, hawthorn. This is pedestrian witchcraft at its best: planting, waiting, harvesting.

**Enhancements:** the **steal** effect (reserved since v1) and **the Window Box** (a permanent herb garden that grows on real days).

## 2. Visitors and boss

| Arrives | Who | Tier · family · deck | Signature card (legendary) | Line |
|---|---|---|---|---|
| May 1 | **Robin Hood** (`robin-hood`), English folklore | visitor · Rookery · Rookery + Irregulars ("The Long Con") | *Robin of Locksley* (design.md §9.3): 3 pts. Elusive. On Play: take control of an opposing non-Elusive card worth 2 or less. *"Robs the rich, gives to the poor, and takes a card off you on the way past."* | "I only take from those who can spare it. You look as if you can spare it." |
| May 8 | **Nicholas Culpeper** (`nicholas-culpeper`), 1616–1654 | visitor · Coven · Coven + Salon | *Nicholas Culpeper*: 3 pts. On Play: Scry 2, then one of your face-up cards gets +2. *"Wrote his herbal in English so the poor could read it, and cast a horoscope for every plant in it."* | "Mugwort for dreams, rosemary for remembering, and you for the next hand. Sit." |
| May 15–31, tournament only | **Herne the Hunter** (`herne-the-hunter`), Windsor folklore and *The Merry Wives of Windsor* | legend (tournament-only) · Rookery · Rookery + Yard | *Herne the Hunter*: 5 pts. Elusive. At the start of each round: each opposing face-up card gets -1. *"Rides Windsor Forest at midnight with great ragged horns and a chain. The keepers stay in on certain nights."* | *(Somewhere in the forest behind him, a horn sounds.)* |

## 3. Event cards

| Card id | Name | Family · type · rarity | Pts | Text | Flavour |
|---|---|---|---|---|---|
| `maid-marian` | Maid Marian | Rookery · character · U | 2 | Elusive. Devoted (Robin of Locksley) +2. | *Out-shot him at the butts once. He's never mentioned it. She mentions it often.* |
| `jack-in-the-green` | Jack-in-the-Green | Irregulars · character · C | 2 | Elusive. | *A London chimney sweep inside a walking hedge, every May Day. The constables have given up.* |
| `the-maypole` | The Maypole | neutral · location · R | 0 | Whenever a card with Friend is played, it gets +1. | *Ribbons over, ribbons under, and somehow it comes out as a pattern.* |
| `beltane-fire` | Beltane Fire | neutral · scheme · U | 0 | On Play: turn up to two of your face-down cards face-up. | *Jump the fire for luck. Sir Charles held the bucket.* |

## 4. Threads

- **Coven:** Herbwife (`herbwife`): *"Knows the cure for everything except gossip. That she starts."* Arrival gift from May 1.
- **Almanack:** ♊ Gemini (`almanack-gemini`): *"Twins who finish each other's sentences, then argue about who started."* Arrival gift from May 21.
- **Tarot:** III The Empress, XIV Temperance.
- **Sleeve:** `sleeve-hawthorn`, May blossom and ribbons.
- **Window Box gift (May 8, Culpeper's arrival):** a rosemary seed packet and a lavender seed packet: *"Mr Culpeper says every landlady needs a window box. He's planted the first pot himself, and given you seeds for the next."*
- **Gift lines:** May 1: *"The herbwife came by with a basket. She left this and took my last lemon."* May 21: *"Gemini, the almanack-seller says. He said it twice."*

## 5. Enhancements

**Steal** (Y-A, design.md §5.20): *(Take control of a card until the end of the round.)* Rules text: `take control of <target>` moves an opposing face-up card to your side; it counts as yours for scores, Friend, Devoted and Mischief, and for later effects, until end of round. At end of round, it **goes back to its owner's side first** and then follows the normal end-of-round rules there (so a stolen Persist card stays on its owner's table, and a stolen Return card goes to its owner's hand). Elusive cards can't be taken. Collection ownership never changes. AI: values a steal at the card's swing (its points leave their side and join yours).

**The Window Box** (Y-B): a permanent kitchen-witch herb box on the taproom windowsill, from May onward.
- **Pots:** 2 to start; a 3rd after 10 harvests; a 4th after 25.
- **Seeds:** sold in the Pawnbroker's window from May onward (not as one of the three rotating cards: as a fixed "Seeds" shelf).

| Herb | Seed price | Ripe after | Harvest gives |
|---|---|---|---|
| Rosemary *(for remembering)* | 5 | 2 days | 10 Checks |
| Thyme *(for courage)* | 5 | 2 days | 8 Checks + a Bar Bet insurance token |
| Lavender *(for calm)* | 10 | 3 days | a Lost & Found extra token |
| Sage *(for wisdom)* | 10 | 3 days | a Pawnbroker 25% token |
| Mugwort *(for dreams)* | 15 | 4 days | a Tinker free token |
| Bay *(for wishes)* | 25 | 5 days | a random Coven card, weighted away from cards she has two of |

- Growth counts **real local days** since planting, in four visual stages drawn as SVG by code (seedling, sprig, bushy, flowering). There's no art beyond the box itself. A ripe plant waits forever: **nothing ever wilts.**
- Harvest: tap a ripe pot, the herb is snipped (animation, static under Reduce Motion), the reward shows on a beer mat with a line from the herb's table (*"Rosemary, for remembering. Sir Charles remembers he owes you ten Checks."*), and the pot is empty again.
- Tokens are the ones from the Advent Cabinet and the Booth (D-A, N-C), so they share one token store.

## 6. Tournament: The May Games

| Field | Value |
|---|---|
| id | `may-games` |
| When | May 15 – 31 |
| Unlock | event live and 3+ wins |
| Field | Robin Hood, Nicholas Culpeper, Herne the Hunter, Irene Adler, "Dodgy" Reg Farrow + 2 random Seasoned |
| Entry rule | any legal deck |
| House Location | The Maypole |
| Entry / prize / consolation | 13 / *Herne the Hunter* + 150 / 13 |

## 7. Dressing and lines

- **Taproom variant** `background-the-taproom-maying`: bright May sunshine; boughs of white hawthorn blossom over the door and windows; a garland of flowers and ribbons along the bar; a little ribboned maypole as a table centrepiece; a pair of morris bell-pads and a hankie on a chair; a longbow and a quiver of arrows propped by the fireplace; a wooden window box of young herbs on the sill; the cats in their usual places, one in a patch of sun.
- **lockedHint:** *"There's a maypole in the yard and an outlaw in the snug. Win a few hands first, and I'll introduce you."*
- **Sir Charles lines:**
  - *"Robin of Locksley has taken my best tankard. He says it's gone to the poor. The poor is him."*
  - *"The sweeps came down the Strand as a hedge again. I've stopped asking."*
  - *"Mr Culpeper's planted something in the window box. He says it's for luck. It smells of Thursdays."*
- **Banner:** *"It's May Day. There's a maypole in the yard, a hedge walking down the Strand, and a window box on the sill with your name on it."*
- **Line overrides:**
  - `reg-farrow`, when `robin-hood` has arrived: *"Robin Hood? Professional courtesy, guv. He doesn't rob me, I don't fence his arrows."*
  - `nell-ashby`, when `nicholas-culpeper` has arrived: *"Mr Culpeper's selling my violets back to me as a remedy. The cheek."*
  - `moriarty`, from May 15: *"The forest gentleman and I have an understanding. He takes the forest. I take everything else."*

---

## 8. Prompts

### Y-A · Steal (Build agent · Sonnet · M = 3)

```
Read CLAUDE.md, the last three docs/logs entries, docs/design.md §5.5, §5.13 and §9.3 (Robin Hood), and docs/plans/monthly/07-may.md §5 (Steal).

The Effect union already has { effect: "steal"; target: Target }, and matchEngine.ts no-ops it. Implement it:
1. Engine: steal moves one opposing face-up, non-Elusive card matching the target filter to the controller's side, recording its original owner on the board card (e.g. `stolenFrom: PlayerId`). While stolen it counts for the controller in score, Friend, Devoted, Mischief, House Rules and every filter. At end of round, before the normal cleanup, every stolen card returns to its owner's side, then cleanup runs normally (Persist stays on the owner's table, Return goes to the owner's hand, Undying applies to its owner, face-down goes to the owner's discard). It can be flipped while stolen; a stolen card that's face-down returns face-down. On Play doesn't retrigger. Nothing about collection ownership changes.
2. AI: evaluate a steal as the swing (the target's effective points subtracted from them and added to you, including the Friend effects on both sides). Nudge, don't override.
3. UI: an animation of the card sliding across the table with a small rope-and-arrow glint (static under Reduce Motion); stolen cards show a small "taken" ribbon so it's clear they go home at round end. Reminder text from §5; House Rules entry; design.md §5.20.
4. Update §5.5's Elusive note: Elusive cards can't be taken.

Tests: steal targeting (Elusive excluded, the filter respected, no legal target does nothing); return to owner at end of round followed by each cleanup path (plain, Persist, Return, Undying, face-down); scoring and Friend counted for the controller while stolen; Devoted partner checks after a steal; the property test invariant "every card ends each round on its owner's side or in its owner's zones"; the AI doesn't crash.

Exit: npm run typecheck && npm test pass; npm run sim shows no regression. Write /log. Push your branch and open a PR (wrapper W3). Don't merge.
```

### Y-B · The Window Box (Build agent · Sonnet · M = 3)

```
Read CLAUDE.md, the last three docs/logs entries, docs/design.md §11, and docs/plans/monthly/07-may.md §5 (The Window Box).

Build the kitchen-witch window box as a permanent feature.

1. Data: src/garden/herbs.ts with the six herbs in §5 (id, name, the parenthetical meaning, seed price, daysToRipe, reward, harvest line written by you in Sir Charles's voice, one per herb, warm and dry). src/garden/windowBox.ts holds the pure rules: plant(potIndex, herbId, date), stage(pot, date) (0-3 by fraction of days elapsed), isRipe, harvest. Days are local calendar days via today(). Plants never wilt.
2. Save: garden { pots: ({ herbId, plantedOn } | null)[], harvests: number, seeds: Record<herbId, number> } with a migration. 2 pots at the start, 3 after 10 harvests, 4 after 25.
3. Unlock: the box appears on the first launch on or after May 8 (any year) and stays forever after. Before that, nothing shows.
4. Rewards reuse the shared token store from the Advent Cabinet and the Booth (lostAndFoundExtra, pawnbrokerDiscount 25, tinkerFree, barBetInsurance); refactor to one `tokens` store if they aren't already shared, with a test that each token is consumed exactly once. Bay gives a random Coven card weighted away from cards she owns two of.
5. Seeds: a fixed "Seeds" shelf in the Pawnbroker screen from the box's unlock onward, with the six packets at the §5 prices.
6. UI: the window box sits on the taproom windowsill in the hub (art id "window-box"; fallback: an SVG wooden box). Each pot shows its plant as an SVG drawn by code in four stages per herb (distinct leaf shapes and flower colours: rosemary needles with pale blue flowers, thyme tiny leaves with pink flowers, lavender spikes, sage soft grey-green, mugwort silvery feathery, bay glossy leaves). Tap an empty pot to choose a seed; tap a growing pot to see "ripe in N days"; tap a ripe pot to harvest (snip animation, static under Reduce Motion).
7. design.md §17.7 "The Window Box".

Tests: growth stages across days, including a month boundary and planting late in the evening; ripe and harvest; pot unlocks at 10 and 25 harvests; seed purchase; token consumption; the unlock date; the save migration.

Exit: npm run typecheck && npm test pass. Write /log. Push your branch and open a PR (wrapper W3). Don't merge.
```

### Y-C · May content (Content agent · Haiku · M = 3)

```
Read CLAUDE.md, the last three docs/logs entries, and docs/plans/monthly/07-may.md in full. Y-A and Y-B have landed.

Use ss-card-author to author May exactly as specified:
- §2: opponents robin-hood (May 1) and nicholas-culpeper (May 8), tier "visitor"; herne-the-hunter, tier "legend", tournament-only. Signature cards exactly as written: Robin of Locksley's On Play is { effect: "steal", target: { side: "opponent", filter: { maxPoints: 2, excludeElusive: true } } }; Herne's ability is a startOfRound buff of -1 to each opposing face-up card. Decks and bet pools as listed.
- §3: four event cards in src/cards/data/maying.ts (Robin's signature card has id "robin-hood" and name "Robin of Locksley"; maid-marian is Devoted to "robin-hood").
- §4: herbwife (coven) and almanack-gemini.
- The pack src/events/packs/maying.ts: window May 1-31, visitors, minWins 3, cardPool, arrivalGifts (herbwife May 1, almanack-gemini May 21, and from May 8 seed packets: add a `seeds` field to arrival gifts if Y-B didn't, 1 rosemary + 1 lavender), almanackIds, tarotIds ["tarot-the-empress","tarot-temperance"], covenCardIds, sleeveId "sleeve-hawthorn", banner, dressing and lineOverrides from §7 (taproomArtId "background-the-taproom-maying").
- §6: tournament may-games with an explicit field constant and house Location the-maypole.

Art manifest: art/prompts/sheet-15-manifest.json with every image in 07-may.md §9 (including "window-box"). Ingest anything in art/inbox.

Balance: curve for both visitors (40-50% starter wins), deck-local edits only. Robin's steal is new: watch his win rate and the sim's lift report closely, and flag it if it's out of band.

Tests: Apr 30 nothing; May 1 Robin and the Herbwife gift; May 7 no Culpeper, no box; May 8 Culpeper, the box and the seed gift; May 15 the May Games with Herne seated (not in Tonight's Patrons) and The Maypole in the slot; May 21 Gemini once; Jun 1 visitors and tournament gone, the box still there.

Exit: npm run typecheck && npm test pass. Write /log. Report back to the orchestrator; it merges, deploys and uploads the TestFlight build (runbook §5).
If you fail the exit check twice, stop and report; the orchestrator reruns this on Sonnet.
```

---

## 9. Gemini one-shot: May art (17 images)

> **Run by the art agent** (runbook `12-orchestration-runbook.md` §7) through Claude in Chrome on gemini.google.com, using Brent's own signed-in Gemini account. The numbered steps below are what the art agent does in the browser; "you" means the art agent. Reference files are read from the Mac repo (`~/projects/steampunk-shuffle/`), and every finished image lands in `~/projects/steampunk-shuffle/art/inbox/<asset id>.png`. Brent does nothing here.

1. Fresh Gemini chat, image generation on.
2. Attach, in order: `art/reference/The_Wheatstone_Bridge_taproom.jpeg`, `public/art/portrait-irene-adler.webp`, `public/art/portrait-charles-dickens.webp`, `public/art/portrait-spring-heeled-jack.webp`.
3. Paste the block, save each image as `art/inbox/<asset id>.png`, type **next** (or **redo: <fix>**, or **start at image N** in a new chat).

```
You are the illustrator for a steampunk card game set in The Wheatstone Bridge, a public house in 1871 London whose cellar door opens onto any century. This month is May Day: Robin Hood, the herbalist-astrologer Nicholas Culpeper (1616-1654) and Herne the Hunter of Windsor Forest visit, with maypoles, hawthorn and a kitchen-witch window box. I need 17 images. Make them ONE AT A TIME, in the order below.

HOW WE WORK
- Each turn, generate exactly one image: the next one on the list. Start with image 1 now.
- After the image, write one line: "Image N of 17 — save as <asset id>.png". Put nothing else in the reply and don't ask questions. If something is ambiguous, pick the option that best fits the style rules and keep going.
- When I type "next", make the next image. When I type "redo: <note>", make the same image again with that fix. When I type "start at image N", jump to that image.
- Never put the asset id, a caption or any text inside the image itself.

ATTACHED REFERENCES
- Attachment 1 is the taproom of The Wheatstone Bridge, the style anchor for every image: match its painting style, brushwork, lighting and palette.
- Attachments 2-4 are existing portraits from the game. Use them ONLY as style references for rendering, finish, framing and light. Never copy their faces, clothing or identity.
- Card art for a character must show the SAME character you drew in the portrait just before it, in this chat.

SOURCE
Draw Robin Hood and Maid Marian from English ballads and folklore, not from any film, cartoon or TV version (no Disney fox, no likeness of any actor). Draw Herne from folklore and Shakespeare's description.

HOUSE STYLE (every image unless it says otherwise)
Painterly digital illustration in a Victorian-engineering steampunk style: brass, steam, gaslight and iron, never goggles-and-corsets cosplay. Visible, controlled brushwork, like a colourised Victorian book plate. Confident inked contours softened by the paint underneath. Directional light: a warm key light from one side, cool ambient fill, real cast shadows. A faint paper-grain texture. ONE dominant colour plus parchment cream and warm ink black, with other colours only as small accents. Palette: brass/copper, oxblood leather, verdigris, gaslight amber, gunmetal blue, heather (dusky muted violet), parchment cream, warm ink black, sparing sovereign gold, plus hawthorn white and leaf green as small spring accents only. Paint to every edge: the game adds its own card border.

FRAMING BY TYPE
- Portrait (1:1): bust portrait, three-quarter turn, slightly tighter than bust-to-waist, soft blurred background.
- Card art (3:4): bust-to-waist (or as described), a moment of action, soft blurred background.
- Object or place card (3:4): the object or place is the subject.
- Almanack (3:4): looks PRINTED: a centred, symmetrical woodcut-engraving of a zodiac figure inside a brass orrery ring of concentric bands and small planets, on foxed parchment, warm ink black with one sovereign-gold accent. No glyphs, numbers or lettering.
- Tarot (2:3): the classic 1909 Rider-Waite-Smith composition for that card, repainted in the house style with Victorian-engineering details, thin painted border inside the image. No numerals, title or lettering.
- Sleeve (3:4): a card back: symmetrical, pattern-led, full-bleed, readable at thumbnail size. No lettering.
- Background (9:16): the full room, calm, uncluttered space in the lower third for game interface.

NEGATIVE RULES (every image, plus extras per image)
no text, no lettering, no numbers, no watermark, no signature, no logo, no photorealistic photography look, no 3D render look, no anime style, no cartoon style, no goggles-and-corsets cosplay clichés, no modern clothing or objects, no gore, no graphic violence, no blood, no distorted or extra hands/limbs, no border or frame (except tarot), no white or cream margin, no vignette

THE 17 IMAGES

1 · background-the-taproom-maying · Background, 9:16
The SAME taproom as attachment 1, same layout, fireplace, brass piping and oxblood booths, on a bright May Day morning: sunlight streaming in; boughs of white hawthorn blossom over the door and the windows; a garland of spring flowers and coloured ribbons along the bar; a little ribboned maypole as a centrepiece on one table; a pair of morris dancers' bell-pads and a white handkerchief on a chair; a longbow and a quiver of arrows propped by the fireplace; on the windowsill, a wooden window box of young herbs in small terracotta pots. A black cat asleep in a patch of sun on a stool. The empty chair by the fire is still slightly apart. No people.

2 · portrait-robin-hood · Portrait, 1:1, style reference attachment 2
Robin Hood as the old ballads tell him: a lean, weathered, laughing outlaw of about thirty with a short auburn beard and bright, mischievous eyes, a hood of Lincoln green thrown back, a worn leather jerkin with a brass buckle, a longbow over one shoulder, a stolen gold purse dangling from one finger. Behind him, softly blurred, the dappled green of Sherwood. Verdigris and leaf-green dominant, oxblood leather, parchment and ink, warm dappled sunlight.
Extra negatives: no feathered cap like a film costume, no tights, no fox.

3 · robin-hood · Card art, 3:4, style reference attachment 2
The same Robin Hood as image 2, bust-to-waist, leaning in across a pub card table with a grin and deftly lifting a card from the opponent's side of the table with two fingers, while with his other hand he tips his hood to them. A brass tankard (clearly not his) at his elbow. Verdigris dominant, oxblood leather, parchment and ink, warm gaslight.

4 · portrait-nicholas-culpeper · Portrait, 1:1, style reference attachment 3
Nicholas Culpeper, the 1650s London herbalist and astrologer: a slim man in his thirties with long dark hair to his shoulders, a thin moustache and small beard, a plain dark Puritan-era doublet with a wide white linen collar, holding a bunch of fresh herbs (rosemary, mugwort, sage) in one hand and a small brass astrolabe in the other, a thoughtful, kind expression. Behind him, softly blurred, an apothecary's shelves of jars and a star chart. Heather dominant, leaf-green accents, parchment and ink, warm window light.

5 · nicholas-culpeper · Card art, 3:4, style reference attachment 3
The same Culpeper as image 4, bust-to-waist, at a pub table with a pestle and mortar, crushing herbs while consulting a hand-drawn horoscope wheel beside them (no legible writing); a sprig of rosemary laid on top of the player's card glows faintly gold as it strengthens. Heather dominant, leaf-green, parchment and ink, warm light.

6 · portrait-herne-the-hunter · Portrait, 1:1, style reference attachment 4
Herne the Hunter, the spectral huntsman of Windsor Forest: a tall, gaunt, hollow-cheeked figure in a ragged, mossy dark hunting cloak, great ragged stag's antlers rising from his head, a rusted chain over one shoulder, pale eyes that catch the moonlight, standing beneath a huge ancient oak at midnight. Gunmetal blue and ink dominant, cold moonlight, a faint will-o'-the-wisp glow, parchment highlights. Eerie, not gory.
Extra negatives: no skull face, no gore.

7 · herne-the-hunter · Card art, 3:4, style reference attachment 4
The same antlered huntsman as image 6, astride a pale spectral horse galloping through a moonlit forest, a hunting horn raised to his lips, a pack of shadowy hounds streaming ahead; as he passes, the leaves on every branch shiver and dim. Gunmetal blue and ink, cold moonlight, parchment highlights.
Extra negatives: no gore, no skull.

8 · maid-marian · Card art, 3:4, style reference attachment 2
Maid Marian from the ballads: a spirited young woman in a practical green hunting gown kilted up for running, a longbow drawn and an arrow nocked, sighting along it with a confident half-smile at an archery butt off frame; her hair braided with a ribbon, a quiver at her hip. Verdigris dominant, oxblood leather, parchment and ink, dappled forest light.

9 · jack-in-the-green · Card art, 3:4, no style reference
Jack-in-the-Green, the London May Day custom: a tall walking cone of green leaves and flowers with only a sweep's sooty face peering out of a gap near the top, topped with a crown of blossom, dancing down a cobbled London street, surrounded by chimney sweeps in sooty top hats with brushes and ribbons; a constable in the background has thrown up his hands. Leaf green and verdigris dominant, soot black, parchment, warm morning light.

10 · the-maypole · Place card, 3:4, no style reference
A tall village maypole on a green, wound halfway down with an intricate plait of coloured ribbons, the loose ribbon ends fluttering in the breeze, a crown of hawthorn and flowers at its top, a pub sign blurred behind and bunting strung to the trees. Verdigris and parchment, ribbon accents, warm sunshine. No people.

11 · beltane-fire · Card art (vignette), 3:4, no style reference
A Beltane bonfire on a dark hilltop at dusk, sparks streaming up into a violet sky, a ring of hawthorn boughs around it, and two figures silhouetted mid-leap over the low flames hand in hand; at the edge of frame, a Victorian gentleman's arm holding out a brass fire-bucket, just in case. Fire-gold and heather dominant, parchment and ink.

12 · herbwife · Card art, 3:4, style reference attachment 3
A Victorian country herbwife in her fifties, round and rosy, sleeves rolled, a striped apron, a basket heaped with herbs and a little bottle of tincture held up to the light to check it; bunches of herbs hang drying from the beams of her cottage kitchen behind her. Heather dominant, leaf-green, parchment and ink, warm window light. Kind, brisk, nosy.

13 · almanack-gemini · Almanack, 3:4
Gemini: two identical young twins standing side by side with arms around each other's shoulders, one holding a lyre and the other a sickle, centred in woodcut style inside a brass orrery ring of concentric bands and tiny planets. Warm ink on foxed parchment, a single star above each head picked out in sovereign gold.

14 · tarot-the-empress · Tarot, 2:3
The Empress: a serene, crowned woman in a flowing gown patterned with pomegranates, seated on cushions in a lush golden wheatfield beside a stream and a forest, a heart-shaped shield with the Venus sign at her side, a crown of twelve stars. In this version her sceptre is a brass Victorian garden dibber topped with a star. Leaf green and sovereign gold, parchment, thin painted border.
Extra negatives: no legible symbols or letters.

15 · tarot-temperance · Tarot, 2:3
Temperance: a winged angel in white robes standing with one foot on land and one in a pool, pouring water between two cups, a path leading to distant mountains and a sunrise crown, irises growing at the water's edge. In this version the cups are brass laboratory beakers and the stream between them glows faintly. Parchment and sky blue, sovereign gold, thin painted border.

16 · sleeve-hawthorn · Sleeve, 3:4
A card back: a symmetrical lattice of white hawthorn blossom and leaf-green sprays tied with fluttering verdigris ribbons on a deep ink ground, a small brass medallion of a sprouting seedling at the exact centre, and a thin repeating border of tiny May flowers. Perfectly symmetrical top to bottom and left to right.

17 · window-box · Object, 4:3, no style reference
Front-on, a long wooden window box painted verdigris-green with brass corner fittings, sitting on the stone sill of a Victorian pub window, containing four empty round terracotta pots of fresh dark soil in a row with even spacing, a little brass watering can and a pair of snips beside it, the gaslit taproom softly blurred through the glass behind and a blue London morning outside. Verdigris and terracotta, parchment and ink, warm morning light. Composed front-on and symmetrical, so the game can draw plants growing in the pots.
Extra negatives: no plants in the pots, no lettering.

Begin with image 1 now.
```
