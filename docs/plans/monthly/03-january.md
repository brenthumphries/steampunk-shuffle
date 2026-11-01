# January: The Aether Voyage

**Window:** Jan 1 – Jan 31 · **Arrivals:** Caroline Herschel Jan 1 · the Time Traveller Jan 10 · **Tournament:** Jan 20 – 31
**Event id:** `aether-voyage` · **Art sheet:** `sheet-11` · **minWins:** 3

## 1. The idea

The clearest skies of the year, the Quadrantid meteors, and a new year. A comet-hunting astronomer sets up a telescope in the yard, and a gentleman from Richmond comes back from the far future the same Thursday he left. Then something crashes through the cellar wall: a battered aether-ship called the *Unlikely Venture*, with a crew of misfits who are not from round here, or round anywhere. **Dimension 20 allusion (giftOnly): *A Starstruck Odyssey*.** A scrappy found-family starship crew and their very small robot.

**Enhancement:** the real moon. From January the hub window shows tonight's actual moon phase, and the Coven gets **Full Moon +N**, a card that's stronger on the nights around a real full moon. Witchy, astronomical, and it reads the same sky Sara can see from her window. Card sleeves also start this month.

## 2. Visitors and boss

| Arrives | Who | Tier · family · deck | Signature card (legendary) | Line |
|---|---|---|---|---|
| Jan 1 | **Caroline Herschel** (`caroline-herschel`), 1750–1848, comet hunter of Slough, the first woman paid to do science in England | visitor · Irregulars · Irregulars + Foundry | *Caroline Herschel*: 2 pts. Elusive. On Play: Draw 2. *"Swept the sky every clear night for years. Found eight comets and most of her brother's spectacles."* | "Is that sky through your cellar door? It's clearer than Slough's." |
| Jan 10 | **The Time Traveller** (`time-traveller`), H. G. Wells, *The Time Machine* (1895) | visitor · Foundry · Foundry + Salon | **Two-faced** (design.md §5.10). Front *The Time Traveller*: 2 pts. Persist. On Play: Draw 1. *"Left Richmond on a Thursday."* · Back *The Traveller, Returned*: 5 pts. Elusive. *"Back the same Thursday, a great deal older and missing a slipper."* | "What year is it here? …Never mind. It doesn't stay." |
| Jan 20–31, tournament only | **Captain Starling of the *Unlikely Venture*** (`captain-starling`) · **giftOnly** | legend (tournament-only) · Irregulars · Irregulars + Foundry | *Captain Starling*: 4 pts. Elusive. On Play: return one of your other face-up cards to hand, then Draw 1. *"One ship, six misfits, no money, a great deal of trouble. She wouldn't swap a single one of them."* | "We're not from round here. Is the ale real?" |

## 3. Event cards

| Card id | Name | Family · type · rarity | Pts | Text | Flavour |
|---|---|---|---|---|---|
| `a-very-small-robot` · giftOnly | A Very Small Robot | Foundry · character · C | 1 | Friend +2. | *Insists it is a member of the crew. Nobody at the Bridge has argued.* |
| `the-quadrantids` | SHOOTING STARS OVER LONDON | neutral · headline · U | 0 | On Play: each player draws 1. Each player's lowest face-up card gets +1. | *Astronomers delighted. Cabmen distracted.* |
| `greenwich-time-ball` | The Greenwich Time Ball | neutral · gadget · U | 1 | Persist. On Play: Draw 1. | *Drops at one o'clock exactly, every day since 1833. Sir Charles sets the bar clock by it, then corrects it.* |
| `the-grand-orrery` | The Grand Orrery | neutral · location · R | 0 | Each face-up Character worth 2 or less gets +1. | *Every planet in its place, and one extra that Sir Charles won't explain.* |

## 4. Threads

- **Coven:** Moon Water (`moon-water`): Full Moon +2. *"Left on the sill under a full moon. Tastes of sill."* Arrival gift from Jan 1.
- **Almanack:** ♒ Aquarius (`almanack-aquarius`): *"Pours water out of a jar for everyone, forever. Has never once been asked to."* Arrival gift from Jan 20.
- **Tarot:** IV The Emperor, XVII The Star.
- **Sleeve:** `sleeve-starfield`, a night sky with constellations engraved in brass lines. Earned with 3 wins inside the window (the rule from J-B).
- **Gift lines:** Jan 1: *"Pixie says to leave this on the windowsill next full moon. I've asked what it does. She says 'wait'."* Jan 20: *"The almanack-seller's been. Water-bearer. He spilled some."*

## 5. Enhancements

**The moon over Galvanic Court (J-A).** A pure module computes the real moon phase for a date (Meeus, *Astronomical Algorithms*, ch. 49 phase times), so it needs no network. Then:
- **The hub window** shows the current phase as a small painted moon (eight phase states, drawn in SVG by code, so no art is needed).
- **Full Moon +N** (design.md §5.17): *(Worth N more on the nights around a full moon.)* Rules text: while the local calendar day of the match's start is within one day of a full-moon instant (the day before, the day of, or the day after, in local time), a face-up card with Full Moon gets +N effective points. Continuous, like Moonrise. The date is fixed at match start, so a match that runs past midnight doesn't change.
- **A full-moon Sir Charles line, year-round:** *"Full moon tonight. The Hampstead gentleman sends his apologies."*
- Exposed as `moonPhase(date)` and `isFullMoonNight(date)` for later months (the July ghost and Mr Pockett's Moonrise jokes).

**Card sleeves (J-B).** The player picks a card back for each deck slot. Sleeves are cosmetic, owned in the collection, and earned per event (`sleeveId`), by 3 wins inside the window. The current back becomes "The Bridge" (default, always owned).

## 6. Tournament: The Meridian Cup

| Field | Value |
|---|---|
| id | `meridian-cup` |
| When | Jan 20 – 31 |
| Unlock | event live and 3+ wins |
| Field | Caroline Herschel, the Time Traveller, Ada Lovelace, Captain Starling + 3 random Seasoned |
| Entry rule | any legal deck |
| House Location | The Grand Orrery |
| Entry / prize / consolation | 13 / *Captain Starling* + 150 / 13 |

In a public build Starling is filtered out, so the field gets a fourth random Seasoned and the prize falls back to *Caroline Herschel* if she's not owned yet, otherwise 300 Checks. (This fallback rule is general; J-B adds it.)

## 7. Dressing and lines

- **Taproom variant** `background-the-taproom-aether-voyage`: a crisp, clear frosty night through the windows, full of stars; a brass telescope on a tripod at the window; star charts pinned to the panelling; a small brass orrery on the bar; a few paper New Year streamers; a dented brass porthole and a coil of rope propped against the blue cellar door, as if something large came through it; the cats in their usual places.
- **lockedHint:** *"Travellers on the cellar stairs, from further off than usual. Win a few hands first, and I'll introduce you."*
- **Sir Charles lines:**
  - *"Happy New Year. The cellar door had several. I picked one."*
  - *"Miss Herschel found a comet from the yard. I've asked her to stop finding things on my roof."*
  - *"There's an aether-ship in the cellar. Its crew have promised to pay for the wall."* (giftOnly)
- **Banner:** *"Clear skies over the Bridge. Miss Herschel's telescope is in the yard, and something has come through the cellar wall."*
- **Line overrides:**
  - `lovelace`, when `time-traveller` has arrived: *"He says the Analytical Engine gets built, in his time. He won't say whether it works."*
  - `shelley`, when `time-traveller` has arrived: *"A man who went to the future and came back worse for it. I could have told him."*
  - `moriarty`, from Jan 20: *"Six of them in that ship and not one with a plan. I'm almost envious."* (giftOnly)

---

## 8. Prompts

### J-A · Real moon phases and Full Moon +N (Build agent · Sonnet · M = 3)

```
Read CLAUDE.md, the last three docs/logs entries, docs/design.md §5.4, §5.15 and §17, and docs/plans/monthly/03-january.md §5.

1. src/sky/moon.ts: compute new and full moon instants with Jean Meeus, Astronomical Algorithms (2nd ed.), chapter 49, including the main periodic corrections, so it's accurate to a few minutes. Export moonPhase(date) (8 named states plus illumination 0-1) and isFullMoonNight(date): true when date's local calendar day is the day before, the day of, or the day after a full-moon instant converted to local time. Pure, offline, no Date.now inside (take the date as a parameter; callers use today()).
   Tests: Meeus's worked example in ch. 49, plus full-moon dates for 2026-2027 that you verify against a published source (cite it in a comment, e.g. the US Naval Observatory or HM Nautical Almanac Office tables). Don't hard-code any date you haven't verified; if you can't verify from here, test against the Meeus example and the synodic-month spacing only, and say so in the log.
2. Keyword Full Moon +N: Keywords gains fullMoon?: number. In effectivePoints(), a face-up card with fullMoon gets +N while the match is a full-moon match. createMatch records `fullMoon: isFullMoonNight(startDate)` on MatchState at creation, so it never changes mid-match and replays deterministically. Add the AI nudge (cards with fullMoon are worth more when the flag is set; none otherwise). Reminder text and House Rules entry exactly as in 03-january.md §5. Add design.md §5.17.
3. Hub: a small moon in the taproom window area showing moonPhase(today()), drawn as an SVG by code (8 states, a soft glow on full). Tapping it shows a beer mat naming the phase ("Waxing gibbous. Pixie says that's a good one."), with one line per phase that you write in Sir Charles's voice, plus "Full moon tonight. The Hampstead gentleman sends his apologies." on full-moon nights.
4. Dev clock: ?now= drives the moon too.

Tests: the keyword (face-down cards get nothing; it stacks with Friend and Moonrise; the flag is fixed at match start, including a match that spans midnight); the hub moon state for a few dates; a property test still runs to completion.

Exit: npm run typecheck && npm test pass; npm run sim shows no regression. Write /log. Push your branch and open a PR (wrapper W3). Don't merge.
```

### J-B · Card sleeves and the public-build prize fallback (Build agent · Sonnet · M = 3)

```
Read CLAUDE.md, the last three docs/logs entries, and docs/plans/monthly/03-january.md §5-§6. The November framework has landed.

1. Sleeves: a registry src/cosmetics/sleeves.ts ({ id, name, artId, source }). "sleeve-the-bridge" is the default, always owned, and uses the current card-back art. The save gains ownedSleeves and a per-deck-slot sleeveId (migration plus test). In the deck builder each slot gets a "Sleeve" picker showing owned sleeves; in a match, the player's face-down cards, deck and hand backs use that slot's sleeve. The opponent always uses the default. A missing sleeve image falls back to the default.
2. Earning: a SeasonalEvent with sleeveId awards that sleeve once the player has 3 wins (pickup or tournament) with dates inside that event's window in the same year. Show it with the unwrap animation and a beer mat: "Sir Charles found these in the cellar. They fit your cards. They fit nobody else's."
3. Public-build fallback (general rule): when a tournament's boss or prize card is giftOnly and edition is "public", fill the seat with a random eligible Seasoned and pay the prize as the event's first visitor's signature card if not owned, otherwise 300 Checks. Test it with the Meridian Cup once J-C exists, and with a test-only tournament now.
4. design.md §17.4 "Sleeves".

Tests: ownership and migration; the 3-win award (wins outside the window don't count; awarded once per year); sleeve persistence per slot; the fallback rule.

Exit: npm run typecheck && npm test pass. Write /log. Push your branch and open a PR (wrapper W3). Don't merge.
```

### J-C · January content (Content agent · Haiku · M = 3)

```
Read CLAUDE.md, the last three docs/logs entries, and docs/plans/monthly/03-january.md in full. J-A and J-B have landed.

Use ss-card-author to author January exactly as specified:
- §2: opponents caroline-herschel and time-traveller (tier "visitor", arrivals Jan 1 and Jan 10) and captain-starling (tier "legend", tournament-only, giftOnly). The Time Traveller's signature is a two-faced card (front and back exactly as written); follow the existing Jekyll/Hyde card for the faces[] shape (card id "time-traveller"; front artId "time-traveller", back artId "time-traveller-returned"). Decks and bet pools as listed.
- §3: four event cards in src/cards/data/aetherVoyage.ts (a-very-small-robot is giftOnly).
- §4: moon-water (coven, keywords { fullMoon: 2 }) in families/coven.ts; almanack-aquarius in almanack.ts.
- The pack src/events/packs/aetherVoyage.ts: window Jan 1-31, visitors, minWins 3, cardPool, arrivalGifts (moon-water from Jan 1, almanack-aquarius from Jan 20), almanackIds, tarotIds ["tarot-the-emperor","tarot-the-star"], covenCardIds, sleeveId "sleeve-starfield" (register it in sleeves.ts), banner, and the dressing and lineOverrides from §7 (taproomArtId "background-the-taproom-aether-voyage").
- §6: tournament meridian-cup with an explicit field constant and house Location the-grand-orrery.

Art manifest: art/prompts/sheet-11-manifest.json with every image in 03-january.md §9. Ingest anything in art/inbox.

Balance: curve for both visitors, target 40-50% starter wins, deck-local edits only. Check that the Time Traveller's back face doesn't break the sim's lift report (§7.4): flag it if its average lift exceeds printed + 3.

Tests: Dec 31 nothing; Jan 1 Herschel and the Moon Water gift; Jan 9 no Time Traveller, Jan 10 yes; Jan 20 Cup open, Starling seated but not in Tonight's Patrons, Aquarius gift once; 3 wins in January award the starfield sleeve; Feb 1 everything gone except owned cards and the sleeve; a public build seats a Seasoned in Starling's place and pays the fallback prize.

Exit: npm run typecheck && npm test pass. Write /log. Report back to the orchestrator; it merges, deploys and uploads the TestFlight build (runbook §5).
If you fail the exit check twice, stop and report; the orchestrator reruns this on Sonnet.
```

---

## 9. Gemini one-shot: January art (17 images)

> **Run by the art agent** (runbook `12-orchestration-runbook.md` §7) through Claude in Chrome on gemini.google.com, using Brent's own signed-in Gemini account. The numbered steps below are what the art agent does in the browser; "you" means the art agent. Reference files are read from the Mac repo (`~/projects/steampunk-shuffle/`), and every finished image lands in `~/projects/steampunk-shuffle/art/inbox/<asset id>.png`. Brent does nothing here.

1. Fresh Gemini chat, image generation on.
2. Attach, in order: `art/reference/The_Wheatstone_Bridge_taproom.jpeg`, `public/art/portrait-ada-lovelace.webp`, `public/art/portrait-irene-adler.webp`, `public/art/portrait-dr-jekyll-mr-hyde.webp`.
3. Paste the block, save each image as `art/inbox/<asset id>.png`, type **next** (or **redo: <fix>**, or **start at image N** in a new chat).

```
You are the illustrator for a steampunk card game set in The Wheatstone Bridge, a public house in 1871 London whose cellar door opens onto any century. This month is about the stars: a comet-hunting astronomer, H. G. Wells's Time Traveller from his 1895 novel, and a battered aether-ship crew from the far future who crashed through the cellar wall. I need 17 images. Make them ONE AT A TIME, in the order below.

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
Draw the Time Traveller from Wells's novel only, not from any film, and with no likeness of any actor. The aether-ship crew are ORIGINAL characters: don't base them on any existing TV, film, game or web-series characters or actors.

HOUSE STYLE (every image unless it says otherwise)
Painterly digital illustration in a Victorian-engineering steampunk style: brass, steam, gaslight and iron, never goggles-and-corsets cosplay. Even the far-future aether-ship is drawn as if Victorian engineers built it: riveted brass, portholes, valves, gauges, canvas and rope. Visible, controlled brushwork, like a colourised Victorian book plate. Confident inked contours softened by the paint underneath. Directional gaslight: a warm key light from one side, cool ambient fill, real cast shadows. A faint paper-grain texture. Mechanical details look buildable. ONE dominant colour plus parchment cream and warm ink black, with other colours only as small accents. Palette: brass/copper, oxblood leather, verdigris, gaslight amber, gunmetal blue, heather (dusky muted violet), parchment cream, warm ink black, sparing sovereign gold. Paint to every edge: the game adds its own card border.

FRAMING BY TYPE
- Portrait (1:1): bust portrait, three-quarter turn, slightly tighter than bust-to-waist, soft blurred background.
- Card art (3:4): bust-to-waist (or as described), a moment of action, soft blurred background.
- Object or place card (3:4): the object or place is the subject; no people unless described.
- Headline (3:4): looks PRINTED, not painted: a Victorian newspaper woodcut, symmetrical, bold central motif, two inks on newsprint, an ornamental masthead band with no legible letters.
- Almanack (3:4): looks PRINTED: a centred, symmetrical woodcut-engraving of a zodiac figure inside a brass orrery ring of concentric bands and small planets, on foxed parchment, warm ink black with one sovereign-gold accent. No glyphs, numbers or lettering.
- Tarot (2:3): the classic 1909 Rider-Waite-Smith composition for that card, repainted in the house style with Victorian-engineering details, thin painted border inside the image. No numerals, title or lettering.
- Sleeve (3:4): a card back: symmetrical, pattern-led, full-bleed, readable at thumbnail size. No lettering.
- Background (9:16): the full room, calm, uncluttered space in the lower third for game interface.

NEGATIVE RULES (every image, plus extras per image)
no text, no lettering, no numbers, no watermark, no signature, no logo, no photorealistic photography look, no 3D render look, no anime style, no cartoon style, no goggles-and-corsets cosplay clichés, no sleek modern sci-fi, no lasers, no spacesuits with glass bubble helmets, no modern clothing or objects, no gore, no graphic violence, no distorted or extra hands/limbs, no border or frame (except tarot), no white or cream margin, no vignette

THE 17 IMAGES

1 · background-the-taproom-aether-voyage · Background, 9:16
The SAME taproom as attachment 1, same layout, fireplace, brass piping and oxblood booths, on a crisp, clear January night in 1871: frost at the corners of the windows and a deep sky full of stars beyond, a meteor streaking across; a brass telescope on a wooden tripod aimed out of the window; hand-drawn star charts pinned to the panelling; a small brass orrery on the bar; a few paper New Year streamers; against the blue cellar door, a dented brass ship's porthole and a coil of tarred rope, as if something large came through. A black cat asleep on a stool. The empty chair by the fire is still slightly apart. No people.

2 · portrait-caroline-herschel · Portrait, 1:1, style reference attachment 2
Caroline Herschel, the Georgian astronomer, as a small, brisk woman in her fifties: a plain dark gown with a white lace fichu and a frilled white cap, a sharp, observant, slightly impatient face, ink on her fingers. She holds a brass eyepiece and a notebook. Behind her, softly blurred, the huge wooden tube of a Georgian reflecting telescope against a starry sky. Gunmetal blue night dominant, gaslight amber key light, parchment and ink.

3 · caroline-herschel · Card art, 3:4, style reference attachment 2
The same small, brisk astronomer as image 2, bust-to-waist, on a frosty pub yard at night with her eye to a long brass telescope, one hand raised and pointing triumphantly at a faint fuzzy comet in the sky; on a stool beside her, a lantern, a notebook of sketched comets and two pairs of a man's spectacles she has evidently found. Gunmetal blue dominant, warm lantern light, parchment and ink.

4 · portrait-time-traveller · Portrait, 1:1, style reference attachment 4
The Time Traveller from H. G. Wells's novel, before his journey: a lean, clever Victorian gentleman scientist of about forty in a smart grey frock coat and waistcoat, neat moustache, pale grey eyes bright with excitement, holding a small brass model of his time machine (a saddle on a frame of brass rails, ivory bars and a twisted crystal rod) on his palm. Behind him, softly blurred, his Richmond laboratory with a dinner party visible through a doorway. Brass and copper dominant, parchment and ink, warm lamplight.

5 · time-traveller · Card art, 3:4, style reference attachment 4
The same gentleman scientist as image 4, bust-to-waist, seated in the saddle of his full-size time machine (brass rails, ivory and twisted crystal bars, a lever under his hand) in his laboratory; the candle flame beside him is smeared into a streak and the clock on the wall shows a blur of hands as time races. He is pulling the lever, eager. Brass dominant, parchment and ink, warm lamplight with a cool blue shimmer around the machine.

6 · time-traveller-returned · Card art, 3:4, style reference attachment 4
The SAME man as images 4 and 5, but just returned from the year 802,701: dishevelled, his grey coat torn and dusty, hair grey and wild, a long healed scratch across his cheek, one foot in a sock without its slipper, a crushed white flower tucked in his buttonhole. He stands beside the time machine, gripping its rail, looking at the viewer with tired, haunted, amused eyes. Brass dominant but dulled, cool blue-grey shimmer, parchment and ink.

7 · portrait-captain-starling · Portrait, 1:1, style reference attachment 3
Captain Starling, an ORIGINAL character: a sharp-eyed, scrappy woman captain in her thirties, cropped dark hair under a battered peaked officer's cap with brass insignia (no letters), a patched oxblood greatcoat with mismatched brass buttons, a brass spyglass on her belt, a crooked grin of someone who is in over her head and enjoying it. Behind her, softly blurred, the riveted brass interior of a small airship cabin with a round porthole full of stars. Oxblood dominant, brass and starlight accents, parchment and ink, warm instrument-panel glow.

8 · captain-starling · Card art, 3:4, style reference attachment 3
The same captain as image 7, bust-to-waist, standing at the brass ship's wheel of her battered aether-ship, one hand on the wheel and the other reaching back to haul a crew-mate's hand (seen only as a gloved hand and sleeve) up through a hatch beside her; through the big porthole ahead, a scatter of stars and a ringed planet. Oxblood dominant, brass instruments, cool starlight, parchment and ink.

9 · a-very-small-robot · Card art, 3:4, no style reference
A very small Victorian-built robot, about the size of a cat, made of riveted brass with a round porthole-glass face showing two small glowing dials for eyes, little pipe-cleaner-jointed arms and tank-tread feet, standing proudly on a pub card table next to a pint glass that is taller than it, holding up a single playing card in both hands as if it's been dealt in. Brass dominant, parchment and ink, warm gaslight. Charming, not cute-cartoony.

10 · the-quadrantids · Headline, 3:4
A Victorian newspaper woodcut front page: a symmetrical shower of shooting stars streaking down over the London skyline (St Paul's dome at centre, chimney pots either side), with tiny silhouettes of astronomers with telescopes on the rooftops and a hansom cab in the street below whose horse is looking up. Two inks, black and a single cool blue, on newsprint, with an ornamental masthead band with no legible letters.
Extra negatives: no legible words.

11 · greenwich-time-ball · Object card, 3:4, no style reference
The red time ball on its mast atop the Royal Observatory at Greenwich, caught at the instant it drops at one o'clock, with a little puff of steam from the mechanism, the observatory's brick and dome below, the Thames and the masts of ships far off in winter sunlight. Brass and oxblood accents, gunmetal-blue sky, parchment and ink. No people.

12 · the-grand-orrery · Place card, 3:4, no style reference
A great room-sized brass orrery in a Victorian lecture hall at night: a glowing brass sun at the centre, planets on long curved brass arms, Saturn's rings in thin brass hoops, gears and a crank handle at the base, a domed skylight full of real stars above. Brass dominant, warm glow, gunmetal-blue night, parchment and ink. No people.

13 · moon-water · Object card, 3:4, no style reference
A clear glass jar of water with a cork stopper standing on a cottage windowsill at night, a full moon hanging in the window and its light caught inside the jar as a pale silver glow; a sprig of rosemary and a small quartz pebble beside it. Heather and moon-silver dominant, parchment and ink. No people.

14 · almanack-aquarius · Almanack, 3:4
Aquarius: a kneeling water-bearer in a simple tunic pouring an endless wavy stream from a tilted jar, engraved in woodcut style at the centre of a brass orrery ring of concentric bands and tiny planets. Warm ink on foxed parchment, the water stream picked out in sovereign gold.

15 · tarot-the-emperor · Tarot, 2:3
The Emperor: a stern, white-bearded ruler in red robes and armour seated on a square stone throne carved with rams' heads, holding an ankh sceptre and an orb, barren orange mountains behind. In this version the throne is cast iron with brass rams' heads and the orb is a small brass globe with meridian lines. Oxblood dominant, brass accents, thin painted border.

16 · tarot-the-star · Tarot, 2:3
The Star: a kneeling woman by a pool at night, pouring water from one jug into the pool and from another onto the land, one great eight-pointed star and seven smaller stars above, a small bird on a tree behind. In this version the jugs are brass Victorian ewers and the star glows like a brass lamp. Gunmetal-blue night dominant, silver and gold starlight, thin painted border.
Extra negatives: no nudity; she wears a simple pale shift.

17 · sleeve-starfield · Sleeve, 3:4
A card back: a deep gunmetal-blue night sky dense with tiny stars, the constellations joined by fine engraved brass lines, a circular brass orrery ring at the exact centre, and a thin repeating brass border of tiny stars and cogs. Perfectly symmetrical top to bottom and left to right.

Begin with image 1 now.
```
