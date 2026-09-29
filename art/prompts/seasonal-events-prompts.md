# Seasonal Events: Paste-Ready Prompts

Run these in order. Each Claude Code prompt names its model: pick that model in the picker **before** you paste (plan §2). Every prompt assumes `seasonal-events-plan.md` is in the repo root. Nothing here pushes: you run `ss-ship` when a step says to ship.

Gemini prompts (G1, G2) can start today, alongside step A. Art is the slowest part of this plan.

---

## A. Event layer (Claude Code · Sonnet)

```
Read CLAUDE.md, the last three docs/logs entries, and seasonal-events-plan.md (§1, §2, §4-§5) before touching code.

Build the generic seasonal-event layer from seasonal-events-plan.md §2. Register only the "halloween" event, with its window, visitor arrival dates, tournament id, card pool ids and minWins taken from §3. Visitors, cards and the tournament won't exist yet: reference them by id, and make every consumer skip ids it can't resolve, so later steps just add data.

Scope:
1. src/events/seasonalEvents.ts (registry and types) and src/events/eventClock.ts (activeEvents, isEventLive, visitorArrived, and the ?now=YYYY-MM-DD dev override, honored only when import.meta.env.DEV is set or the URL also has ?preview=1). Route every existing `new Date()` call that feeds a gameplay decision (main.ts, pubHubScreen.ts, acquisitionScreen.ts) through one `today()` helper.
2. Add OpponentTier "visitor": seasoned dial, pays Seasoned Checks, not part of the legendsInTown rotation. Change isOpponentInTown/tonightsPatrons to include visitors whose event is live, who have arrived, and whose minWins has been reached. If the event is live and minWins isn't reached yet, show Sir Charles's hint line instead.
3. Change Tournament.isUnlocked to take a date. Add an optional `houseLocationId` field and a createMatch option `initialLocationId` that places that Location in the shared slot. Brackets already in progress stay resumable after their window closes.
4. Lost & Found and Pawnbroker rolls include an event's cardPool only while that event is live. Ownership is permanent, with no year-round legality check on event cards.
5. Event dressing: while an event is live, the pub hub uses dressing.taproomArtId (falling back to the normal taproom art if that asset is missing from the manifest) and adds dressing.sirCharlesLines to his line pool.
6. ★ Dedication screen: do NOT change it yet. Add a clearly named, unused helper `dedicationShouldShow(date, firstLaunchDone)` implementing option (b) from plan §1, and flag in the log that it needs Brent's call.
7. Add docs/design.md §17 "Seasonal events", condensed from plan §2 rules 1-6. Add seasonal-events-plan.md to the brent-ops `plan.also` list in CLAUDE.md.

Tests: Vitest for the window edges (Sep 30 / Oct 1 / Oct 31 / Nov 1, local time) and for visitor gating by arrival date and minWins. Include pool inclusion/exclusion and ownership surviving past the window. Add one Playwright smoke test using ?now= to check the hub shows the Hallowe'en dressing fallback.

Exit: npm run typecheck && npm test pass. Write docs/logs/<today>.md with /log. Do not push; tell me to run ss-ship.
```

## B. Wave 1 content (Claude Code · Haiku)

```
Read CLAUDE.md, the last three docs/logs entries, and seasonal-events-plan.md §3 and §3.2. Step A (the event layer) has landed.

Use the ss-card-author skill to author Wave 1 exactly as specified in seasonal-events-plan.md §3:
- The legendary signature cards "mr-griffin" (Irregulars) and "clockwork-pharaoh" (Salon). Both use only the existing Effect DSL (return with side "opponent"; the endOfRound flip with highestPoints, as the Reichenbach Falls Location in src/cards/data/locations.ts does).
- The Nightfall cards "turnip-lantern", "resurrection-man", "spirit-photograph" (use the hasKeyword: "friend" filter) and "the-witching-hour" in a new src/cards/data/nightfall.ts. Do not author the Undying or Moonrise cards yet.
- 20-card decks for both visitors (src/cards/data/decks/griffin.ts, pharaoh.ts), built from their family plus Nightfall cards. Bar Bet pools come from the Nightfall set.
- Opponent entries (tier "visitor", portraitArtId "portrait-mr-griffin" / "portrait-clockwork-pharaoh", lines from §3), wired into the halloween event's visitors list.
- An art manifest, art/prompts/sheet-7-manifest.json, with rows for portrait-mr-griffin, portrait-clockwork-pharaoh, mr-griffin, clockwork-pharaoh and background-the-taproom-halloween (category "background"), so tools/ingest-art.py can process my Gemini files from art/inbox/.

If a card doesn't fit its family's points curve, flag it in the log with a suggested fix. Don't silently change a signature card's text.

Balance: run `npm run curve -- seasoned seasoned 200` for both visitors. Target: the starter deck wins 40-50%. Adjust deck-local cards only, never shared canonical cards (see the CLAUDE.md gotcha about Mudd/Hollis).

Then, if any files are in art/inbox, run python3 tools/ingest-art.py art/prompts/sheet-7-manifest.json.

Exit: typecheck and tests pass; with ?now=2026-10-01 and 3+ wins, both visitors appear in Tonight's Patrons. Write /log. Tell me to run ss-ship (this is Build 1).
If you fail the exit check twice, stop and tell me to rerun this on Sonnet.
```

## C. Undying and Moonrise (Claude Code · Sonnet)

```
Read CLAUDE.md, the last three docs/logs entries, and seasonal-events-plan.md §3.1.

Add the two keywords from seasonal-events-plan.md §3.1 to the engine:
1. Schema: in src/cards/cardTypes.ts, Keywords gains `undying?: boolean` and `moonrise?: number`. Update validateCard.
2. Engine: Undying is resolved in end-of-round cleanup. A face-down Undying card goes to its owner's hand. Return still wins while the card is face-up. Moonrise is resolved in effectivePoints() and applies only in the match's final round. Read design.md §6.2-§6.3 to decide what "final round" means when a match can end in 2 rounds, and document that choice in a comment and in design.md §5.14-§5.15, which you should also add (keep the reminder text exactly as in the plan).
3. AI: add evaluator nudges, not overrides (follow the CLAUDE.md "nudge, don't override" gotcha). Moonrise cards are worth holding for the final round; Undying cards are cheap to expose to Flips.
4. UI: card reminder text and keyword chips for both keywords, and a House Rules page entry.

Tests: engine unit tests for each keyword, including the Undying+Return and Undying+Persist cases; keep the property test passing; update the AI test only if its calibrated bands still hold. Run npm run sim and report any win-rate movement in the log.

Exit: typecheck and tests pass. Write /log. Don't ship yet (Build 2 bundles C, D and E).
```

## D. Wave 2 content (Claude Code · Haiku)

```
Read CLAUDE.md, the last three docs/logs entries, and seasonal-events-plan.md §3 and §3.2. Steps A-C have landed (the Undying and Moonrise keywords exist).

Use ss-card-author to author Wave 2 exactly as in seasonal-events-plan.md §3:
- Signature cards "the-count" (Rookery), "gentleman-of-the-heath" (Yard) and "the-creature" (Foundry), plus "spring-heeled-jack" (legendary Rookery, from §3.3; he is a tournament opponent, not a visitor).
- The remaining Nightfall cards: grave-robber, night-constable, lamplighter-at-dusk, galvanic-battery.
- Decks, opponents (tier "visitor"; Spring-Heeled Jack is tier "legend" but tournament-only, so exclude him from Tonight's Patrons), bet pools, and arrival dates (Oct 15).
- Mary Shelley's alternate event line ("Oh. You've met him.") while the Creature's event is live.
- Append manifest rows to art/prompts/sheet-7-manifest.json for the 4 new portraits (portrait-carpathian-count, portrait-hampstead-wolf, portrait-galvanic-creature, portrait-spring-heeled-jack) and the 4 signature cards. Ingest anything waiting in art/inbox.

Balance: npm run curve -- seasoned seasoned 200 for the three visitors (target 40-50% starter wins), deck-local edits only.

Exit: typecheck and tests pass; with ?now=2026-10-15, all five visitors appear. Write /log. If you fail the exit check twice, stop and tell me to rerun this on Sonnet.
```

## E. The All Hallows' Wake (Claude Code · Haiku)

```
Read CLAUDE.md, the last three docs/logs entries, and seasonal-events-plan.md §3.3. Steps A-D have landed.

Add the tournament "all-hallows-wake" to src/tournaments/tournaments.ts exactly as in the table in §3.3. Its sub-window is Oct 22-31, inside the halloween event. Its field is the 5 visitors, spring-heeled-jack and 1 random Seasoned. Its houseLocationId is "the-witching-hour" (use the createMatch initialLocationId option from step A). Its prize is the fixed card spring-heeled-jack plus 150 Checks. Register it in the halloween event.

Tests: unlocked only on Oct 22-31 with 3+ wins; the field composition is right; every match starts with The Witching Hour in the shared slot; the prize pays out; a bracket started on Oct 31 can still be finished on Nov 1.
Add one Playwright smoke test with ?now=2026-10-22 that enters the tournament.

Exit: typecheck and tests pass. Write /log. Tell me to run ss-ship (this is Build 2) and, if she's on TestFlight, to upload a new build.
```

## F. Art sheet for the Nightfall set (Claude Code · Haiku)

```
Run the ss-art-prompts skill for the 8 Nightfall cards in src/cards/data/nightfall.ts (appending to art/prompts/sheet-7-manifest.json). Turnip Lantern must show a carved turnip lantern, not a pumpkin. The Witching Hour is a Location (no figures). Output art/prompts/prompt-sheet-7.txt/.csv. Write /log.
```

---

## G1. Gemini: Wave 1 art (Brent, paste today)

Use a fresh Gemini chat. For each image, attach the listed files, paste the prompt, and save the result as `art/inbox/<asset id>.png`.

The negative block below is the same for every image. It is included in full each time so every prompt can be pasted on its own.

### 1 · `background-the-taproom-halloween` (attach `art/reference/The_Wheatstone_Bridge_taproom.jpeg`)
```
Painterly digital illustration in a Victorian-engineering steampunk style — brass and warm gaslight, not goggles-and-corsets cosplay. The SAME narrow gaslit Victorian taproom as the attached image, same layout, fireplace, brass piping and oxblood booths, redressed for All Hallows' Eve in 1871: carved turnip lanterns (not pumpkins) glowing along the bar top, thin candle smoke curling under the brass ceiling pipes, a pale crescent moon through the fogged gunmetal-blue windows, dried autumn leaves on the floorboards, a black cat asleep on a stool. The empty chair by the fire is still slightly apart from the others. Warm gaslight amber key light, cool blue-grey fill, real cast shadows, confident inked contours softened under paint, faint paper-grain texture. Leave calm space in the lower third for interface.

no text, no lettering, no watermark, no signature, no logo, no photorealistic photography look, no 3D render look, no anime style, no goggles-and-corsets cosplay clichés, no modern clothing or objects, no gore, no graphic violence, no people in frame, no pumpkins, no plastic Halloween decorations, no border or frame, no vignette

Aspect ratio 9:16.
```

### 2 · `portrait-mr-griffin` (attach the taproom reference + `public/art/portrait-sherlock-holmes.webp`)
```
Painterly digital illustration in a Victorian-engineering steampunk style. Bust portrait of an invisible man in a gaslit London side-street: head entirely wrapped in pale bandages, round dark-blue tinted spectacles, a false pink nose, wide-brimmed hat, high-collared greatcoat, grey kid gloves, and where the collar gapes there is simply nothing — the far wall shows through. One gloved hand lifts a pint glass that tilts toward a mouth that isn't there. Gaslight-amber key light from a street lamp, cool blue-grey fog behind. Wry, secretive posture. Confident inked contours softened under paint, faint paper-grain texture, directional gaslight with real cast shadows. Three-quarter view, slightly tighter than bust-to-waist.

no text, no lettering, no watermark, no signature, no logo, no photorealistic photography look, no 3D render look, no anime style, no goggles-and-corsets cosplay clichés, no welding goggles, no modern clothing or objects, no gore, no graphic violence, no distorted or extra hands/limbs, no border or frame, no vignette

Aspect ratio 1:1.
```

### 3 · `mr-griffin` card art (attach the taproom reference + the Griffin portrait you just made)
```
Painterly digital illustration in a Victorian-engineering steampunk style. The same bandaged invisible gentleman as the attached portrait, bust-to-waist, mid-trick in a gaslit pub: his empty sleeve reaches across a card table and a playing card lifts itself off an opponent's pile, hovering in mid-air. His spectacles catch the light; everything below the bandages is empty coat. Gaslight-amber dominant, parchment and ink, small cool blue accents. Confident inked contours softened under paint, faint paper-grain texture, real cast shadows. Background a soft blur of pub lamplight.

no text, no lettering, no watermark, no signature, no logo, no photorealistic photography look, no 3D render look, no anime style, no goggles-and-corsets cosplay clichés, no modern clothing or objects, no gore, no graphic violence, no distorted or extra hands/limbs, no border or frame, no vignette

Aspect ratio 3:4.
```

### 4 · `portrait-clockwork-pharaoh` (attach the taproom reference + `public/art/portrait-agatha-christie.webp`)
```
Painterly digital illustration in a Victorian-engineering steampunk style. Bust portrait of an ancient Egyptian mummy-king rebuilt with clockwork, as if escaped from a Victorian museum's Egyptian gallery: aged linen wrappings loosened at the jaw and chest to reveal tarnished verdigris-green bronze gears and a slowly turning escapement where a heart would be, a battered gold-and-lapis nemes headdress, two faint amber lights in the eye-hollows. Regal, patient, faintly amused stillness. Verdigris dominant with parchment linen and small sovereign-gold accents, warm gaslight from one side, cool museum-gloom fill. Confident inked contours softened under paint, faint paper-grain texture, real cast shadows. Background a soft blur of glass display cases.

no text, no hieroglyph lettering, no watermark, no signature, no logo, no photorealistic photography look, no 3D render look, no anime style, no goggles-and-corsets cosplay clichés, no modern clothing or objects, no gore, no graphic violence, no exposed flesh or rot, no distorted or extra hands/limbs, no border or frame, no vignette

Aspect ratio 1:1.
```

### 5 · `clockwork-pharaoh` card art (attach the taproom reference + the Pharaoh portrait)
```
Painterly digital illustration in a Victorian-engineering steampunk style. The same clockwork mummy-king as the attached portrait, bust-to-waist, raising one wrapped bronze hand as a pale green curse-light unspools from it like linen caught in a draught, drifting across a card table toward the viewer. Verdigris dominant, parchment and ink, sovereign-gold headdress accent, gaslight from one side. Confident inked contours softened under paint, faint paper-grain texture, real cast shadows. Background a soft blur of a candlelit pub corner.

no text, no hieroglyph lettering, no watermark, no signature, no logo, no photorealistic photography look, no 3D render look, no anime style, no goggles-and-corsets cosplay clichés, no modern clothing or objects, no gore, no graphic violence, no exposed flesh or rot, no distorted or extra hands/limbs, no border or frame, no vignette

Aspect ratio 3:4.
```

## G2. Gemini: Wave 2 art (Brent, before Oct 8)

Same routine as G1. Generate each portrait before its card art, and attach the portrait when you make the card.

### 6 · `portrait-carpathian-count` (attach the taproom reference + `public/art/portrait-professor-moriarty.webp`)
```
Painterly digital illustration in a Victorian-engineering steampunk style. Bust portrait of an elderly Carpathian nobleman as the novel describes him — tall and gaunt, a long white moustache, bushy brows that nearly meet, sharp pale face, unnaturally red lips, pointed ears, long white hands with hair on the palms — in an immaculate black travelling coat with an oxblood silk lining and a small brass railway-timetable watch chain. Courteous, predatory stillness; he has not been invited in yet. Oxblood leather dominant, parchment and ink, a thin wash of cold moonlight from a window, warm gaslight from the other side. Confident inked contours softened under paint, faint paper-grain texture, real cast shadows. Background a soft blur of the pub doorway at night.

no text, no lettering, no watermark, no signature, no logo, no photorealistic photography look, no 3D render look, no anime style, no goggles-and-corsets cosplay clichés, no widow's-peak slicked-back hair, no stand-up opera-cape collar, no medallion, no fangs dripping blood, no modern clothing or objects, no gore, no graphic violence, no distorted or extra hands/limbs, no border or frame, no vignette

Aspect ratio 1:1.
```

### 7 · `the-count` card art (attach the taproom reference + the Count portrait)
```
Painterly digital illustration in a Victorian-engineering steampunk style. The same white-moustached Carpathian nobleman as the attached portrait, bust-to-waist, one long hand laid flat on a card table as the opponent's nearest card turns itself face-down under a drifting ribbon of mist. A few bats wheel in the fog beyond a gunmetal-blue window. Oxblood dominant, parchment and ink, cold moonlight rim, warm gaslight key. Confident inked contours softened under paint, faint paper-grain texture, real cast shadows.

no text, no lettering, no watermark, no signature, no logo, no photorealistic photography look, no 3D render look, no anime style, no goggles-and-corsets cosplay clichés, no widow's-peak slicked-back hair, no stand-up opera-cape collar, no medallion, no blood, no modern clothing or objects, no gore, no graphic violence, no distorted or extra hands/limbs, no border or frame, no vignette

Aspect ratio 3:4.
```

### 8 · `portrait-hampstead-wolf` (attach the taproom reference + `public/art/portrait-inspector-bucket.webp`)
```
Painterly digital illustration in a Victorian-engineering steampunk style. Bust portrait of a genial middle-aged Victorian gentleman caught mid-transformation into a wolf: well-cut gunmetal-blue frock coat and loosened cravat, one side of his face still a mild bewhiskered man, the other lengthening into a grey wolf's muzzle with amber eyes, coarse fur pushing up past his starched collar, a battered brass pocket-watch open in one hand showing a moon-phase dial at the full. Embarrassed rather than menacing. Gunmetal blue dominant, parchment and ink, silver full-moon light through fog from one side, warm gaslight fill. Confident inked contours softened under paint, faint paper-grain texture, real cast shadows. Background a soft blur of Hampstead Heath at night.

no text, no lettering, no watermark, no signature, no logo, no photorealistic photography look, no 3D render look, no anime style, no goggles-and-corsets cosplay clichés, no torn plaid shirt, no modern clothing or objects, no gore, no blood, no graphic violence, no distorted or extra hands/limbs, no border or frame, no vignette

Aspect ratio 1:1.
```

### 9 · `gentleman-of-the-heath` card art (attach the taproom reference + the Wolf portrait)
```
Painterly digital illustration in a Victorian-engineering steampunk style. The same gentleman as the attached portrait, now fully a great grey wolf in the remains of his gunmetal-blue frock coat, bust-to-waist, head lifted toward a huge full moon breaking through London fog above iron railings, pocket-watch chain swinging from his collar. Gunmetal blue and moon-silver dominant, parchment and ink, a warm gaslamp glow at the frame edge. Confident inked contours softened under paint, faint paper-grain texture, real cast shadows.

no text, no lettering, no watermark, no signature, no logo, no photorealistic photography look, no 3D render look, no anime style, no goggles-and-corsets cosplay clichés, no modern clothing or objects, no gore, no blood, no graphic violence, no distorted or extra limbs, no border or frame, no vignette

Aspect ratio 3:4.
```

### 10 · `portrait-galvanic-creature` (attach the taproom reference + `public/art/portrait-mary-shelley.webp`)
```
Painterly digital illustration in a Victorian-engineering steampunk style. Bust portrait of the creature as Mary Shelley's novel describes him, not any film version: very tall, long flowing lustrous black hair, sallow yellowish skin that barely covers the muscle beneath, watery pale eyes, straight black lips, a grave and intelligent expression. His assembly is shown through the Foundry: fine copper-wire seams stitched across his brow and throat, a small brass galvanic coil set into his collarbone faintly crackling blue-white, a heavy workman's coat too short in the sleeves. Brass and copper dominant, parchment and ink, warm furnace key light, cool fill. Confident inked contours softened under paint, faint paper-grain texture, real cast shadows. Background a soft blur of a workshop with a Leyden-jar rack.

no text, no lettering, no watermark, no signature, no logo, no photorealistic photography look, no 3D render look, no anime style, no goggles-and-corsets cosplay clichés, no flat-topped square head, no neck bolts, no green skin, no heavy brow ridge makeup, no modern clothing or objects, no gore, no graphic violence, no distorted or extra hands/limbs, no border or frame, no vignette

Aspect ratio 1:1.
```

### 11 · `the-creature` card art (attach the taproom reference + the Creature portrait)
```
Painterly digital illustration in a Victorian-engineering steampunk style. The same long-haired, copper-seamed creature as the attached portrait, bust-to-waist, rising again from a workbench in a brass-and-copper laboratory as blue-white galvanic arcs leap between coils around him; a discarded playing card lies face-down on the bench beside his hand, about to be picked back up. Brass and copper dominant, parchment and ink, electric blue-white only as accent. Confident inked contours softened under paint, faint paper-grain texture, real cast shadows.

no text, no lettering, no watermark, no signature, no logo, no photorealistic photography look, no 3D render look, no anime style, no goggles-and-corsets cosplay clichés, no flat-topped square head, no neck bolts, no green skin, no modern clothing or objects, no gore, no graphic violence, no distorted or extra hands/limbs, no border or frame, no vignette

Aspect ratio 3:4.
```

### 12 · `portrait-spring-heeled-jack` (attach the taproom reference + `public/art/portrait-professor-moriarty.webp`)
```
Painterly digital illustration in a Victorian-engineering steampunk style. Bust portrait of Spring-Heeled Jack from London folklore: a tall lean figure in a black oilskin cloak and a close-fitting helmet, glowing red-amber eyes, a devilish grin, pointed ears, clawed gloves, crouched on a gunmetal-blue iron railing as if about to spring. Oxblood and ink dominant, a faint blue flame on his breath, cold fog and a single gaslamp below him. Mischievous, theatrical menace. Confident inked contours softened under paint, faint paper-grain texture, real cast shadows. Background a soft blur of London rooftops and chimney pots.

no text, no lettering, no watermark, no signature, no logo, no photorealistic photography look, no 3D render look, no anime style, no goggles-and-corsets cosplay clichés, no superhero costume, no modern clothing or objects, no gore, no graphic violence, no distorted or extra hands/limbs, no border or frame, no vignette

Aspect ratio 1:1.
```

### 13 · `spring-heeled-jack` card art (attach the taproom reference + the Jack portrait)
```
Painterly digital illustration in a Victorian-engineering steampunk style. The same cloaked figure as the attached portrait, mid-leap high over a foggy London street, cloak spread, brass spring-coil mechanisms visible on the heels of his boots, a trail of blue flame and steam behind him, a gaslamp and a startled constable's lantern far below. Oxblood and ink dominant, parchment highlights, gaslight amber and gunmetal-blue accents. Confident inked contours softened under paint, faint paper-grain texture, real cast shadows.

no text, no lettering, no watermark, no signature, no logo, no photorealistic photography look, no 3D render look, no anime style, no goggles-and-corsets cosplay clichés, no superhero costume, no modern clothing or objects, no gore, no graphic violence, no distorted or extra hands/limbs, no border or frame, no vignette

Aspect ratio 3:4.
```
