# Gemini one-shot: Seasonal Events art (G1 + G2, 13 images)

## How to use

1. Open a **fresh Gemini chat** (image generation on).
2. Attach these 6 files, in this order:
   1. `art/reference/The_Wheatstone_Bridge_taproom.jpeg`
   2. `public/art/portrait-sherlock-holmes.webp`
   3. `public/art/portrait-agatha-christie.webp`
   4. `public/art/portrait-professor-moriarty.webp`
   5. `public/art/portrait-inspector-bucket.webp`
   6. `public/art/portrait-mary-shelley.webp`
3. Paste everything inside the code block below and send.
4. Gemini makes image 1 and names it. Save it as `art/inbox/<asset id>.png`, then type **next**. To retry an image, type **redo: <what to fix>**.
5. Images 1–5 are Wave 1 (needed now). Images 6–13 are Wave 2 (needed before Oct 8). If you hit the daily cap, start a new chat tomorrow, attach the same 6 files plus the portraits you've already made for that wave, paste the prompt again, and type **start at image N**.

---

```
You are the illustrator for a steampunk card game set in The Wheatstone Bridge, a public house in 1871 London. I need 13 images for a Hallowe'en event. Make them ONE AT A TIME, in the order below.

HOW WE WORK
- Each turn, generate exactly one image: the next one on the list. Start with image 1 now.
- After the image, write one line: "Image N of 13 — save as <asset id>.png". Put nothing else in the reply and don't ask questions. If something is ambiguous, pick the option that best fits the style rules and keep going.
- When I type "next", make the next image. When I type "redo: <note>", make the same image again with that fix. When I type "start at image N", jump to that image.
- Never put the asset id, a caption or any text inside the image itself.

ATTACHED REFERENCES
- Attachment 1 is the taproom of The Wheatstone Bridge. It is the style anchor for every image: match its painting style, brushwork, lighting and palette.
- Attachments 2–6 are existing character portraits from the game (Holmes, Christie, Moriarty, Inspector Bucket, Mary Shelley). Use them ONLY as style references for rendering, finish, framing and light. Never copy their faces, clothing or identity into a new character.
- Card art for a character (images 3, 5, 7, 9, 11, 13) must show the SAME character you drew in the portrait just before it, in this chat: same face, costume and colours.

HOUSE STYLE (applies to every image)
Painterly digital illustration in a Victorian-engineering steampunk style: brass, steam, gaslight and iron, never goggles-and-corsets cosplay. Visible, controlled brushwork, like a colourised Victorian book plate. Confident inked contours on the major forms, softened by the paint underneath. Directional gaslight: a warm key light from one side, cool ambient fill, real cast shadows. A faint paper-grain texture over the whole image. Mechanical details (gears, coils, rivets) should look like they could really be built. Each image reads as ONE dominant colour plus parchment cream and warm ink black, with other colours only as small accents. The palette is brass/copper, oxblood leather, verdigris, gaslight amber, gunmetal blue, parchment cream, warm ink black, and sparing sovereign gold. Compose the subject to fill the frame edge to edge, because the game adds its own card border.

FRAMING BY TYPE
- Portrait (1:1): bust portrait, three-quarter turn, slightly tighter than bust-to-waist, soft blurred background.
- Card art (3:4): bust-to-waist (or as described), a moment of action, soft blurred background that never competes with the subject.
- Background (9:16): the full room, with calm, uncluttered space in the lower third for game interface.

NEGATIVE RULES (every image, plus any extras listed per image)
no text, no lettering, no watermark, no signature, no logo, no photorealistic photography look, no 3D render look, no anime style, no goggles-and-corsets cosplay clichés, no welding goggles, no modern clothing or objects, no gore, no graphic violence, no distorted or extra hands/limbs, no border or frame, no vignette

THE 13 IMAGES

1 · background-the-taproom-halloween · Background, aspect ratio 9:16
The SAME narrow gaslit Victorian taproom as attachment 1, with the same layout, fireplace, brass piping and oxblood booths, redressed for All Hallows' Eve in 1871: carved turnip lanterns (not pumpkins) glowing along the bar top, thin candle smoke curling under the brass ceiling pipes, a pale crescent moon through the fogged gunmetal-blue windows, dried autumn leaves on the floorboards, a black cat asleep on a stool. The empty chair by the fire still stands slightly apart from the others. Warm gaslight amber key light, cool blue-grey fill.
Extra negatives: no people in frame, no pumpkins, no plastic Halloween decorations.

2 · portrait-mr-griffin · Portrait, aspect ratio 1:1
An invisible man in a gaslit London side-street: head entirely wrapped in pale bandages, round dark-blue tinted spectacles, a false pink nose, wide-brimmed hat, high-collared greatcoat, grey kid gloves. Where the collar gapes there is simply nothing, and the far wall shows through. One gloved hand lifts a pint glass that tilts toward a mouth that isn't there. Gaslight-amber key light from a street lamp, cool blue-grey fog behind. Wry, secretive posture.

3 · mr-griffin · Card art, aspect ratio 3:4
The same bandaged invisible gentleman as image 2, bust-to-waist, mid-trick in a gaslit pub: his empty sleeve reaches across a card table and a playing card lifts itself off an opponent's pile, hovering in mid-air. His spectacles catch the light; everything below the bandages is empty coat. Gaslight amber dominant, parchment and ink, small cool blue accents. Background a soft blur of pub lamplight.

4 · portrait-clockwork-pharaoh · Portrait, aspect ratio 1:1
An ancient Egyptian mummy-king rebuilt with clockwork, as if escaped from a Victorian museum's Egyptian gallery: aged linen wrappings loosened at the jaw and chest to reveal tarnished verdigris-green bronze gears, with a slowly turning escapement where a heart would be; a battered gold-and-lapis nemes headdress; two faint amber lights in the eye-hollows. Regal, patient, faintly amused stillness. Verdigris dominant with parchment linen and small sovereign-gold accents, warm gaslight from one side, cool museum-gloom fill. Background a soft blur of glass display cases.
Extra negatives: no hieroglyph lettering, no exposed flesh or rot.

5 · clockwork-pharaoh · Card art, aspect ratio 3:4
The same clockwork mummy-king as image 4, bust-to-waist, raising one wrapped bronze hand as a pale green curse-light unspools from it like linen caught in a draught, drifting across a card table toward the viewer. Verdigris dominant, parchment and ink, sovereign-gold headdress accent, gaslight from one side. Background a soft blur of a candlelit pub corner.
Extra negatives: no hieroglyph lettering, no exposed flesh or rot.

6 · portrait-carpathian-count · Portrait, aspect ratio 1:1
An elderly Carpathian nobleman as the 1897 novel describes him: tall and gaunt, a long white moustache, bushy brows that nearly meet, a sharp pale face, unnaturally red lips, pointed ears, long white hands with hair on the palms. He wears an immaculate black travelling coat with an oxblood silk lining and a small brass railway-timetable watch chain. Courteous, predatory stillness: he has not been invited in yet. Oxblood leather dominant, parchment and ink, a thin wash of cold moonlight from a window, warm gaslight from the other side. Background a soft blur of the pub doorway at night.
Extra negatives: no widow's-peak slicked-back hair, no stand-up opera-cape collar, no medallion, no fangs dripping blood.

7 · the-count · Card art, aspect ratio 3:4
The same white-moustached nobleman as image 6, bust-to-waist, one long hand laid flat on a card table as the opponent's nearest card turns itself face-down under a drifting ribbon of mist. A few bats wheel in the fog beyond a gunmetal-blue window. Oxblood dominant, parchment and ink, cold moonlight rim, warm gaslight key.
Extra negatives: no widow's-peak slicked-back hair, no stand-up opera-cape collar, no medallion, no blood.

8 · portrait-hampstead-wolf · Portrait, aspect ratio 1:1
A genial middle-aged Victorian gentleman caught mid-transformation into a wolf. He wears a well-cut gunmetal-blue frock coat and a loosened cravat. One side of his face is still a mild bewhiskered man; the other is lengthening into a grey wolf's muzzle with an amber eye, and coarse fur pushes up past his starched collar. In one hand, a battered brass pocket-watch lies open, its moon-phase dial at the full. He looks embarrassed rather than menacing. Gunmetal blue dominant, parchment and ink, silver full-moon light through fog from one side, warm gaslight fill. Background a soft blur of Hampstead Heath at night.
Extra negatives: no torn plaid shirt, no blood.

9 · gentleman-of-the-heath · Card art, aspect ratio 3:4
The same gentleman as image 8, now fully a great grey wolf in the remains of his gunmetal-blue frock coat, bust-to-waist, head lifted toward a huge full moon breaking through London fog above iron railings, his pocket-watch chain swinging from his collar. Gunmetal blue and moon-silver dominant, parchment and ink, a warm gaslamp glow at the frame edge.
Extra negatives: no blood.

10 · portrait-galvanic-creature · Portrait, aspect ratio 1:1
The creature as Mary Shelley's 1818 novel describes him, not any film version: very tall, long flowing lustrous black hair, sallow yellowish skin that barely covers the muscle beneath, watery pale eyes, straight black lips, a grave and intelligent expression. His assembly shows through Foundry craft: fine copper-wire seams stitched across his brow and throat, a small brass galvanic coil set into his collarbone that crackles faintly blue-white, and a heavy workman's coat too short in the sleeves. Brass and copper dominant, parchment and ink, warm furnace key light, cool fill. Background a soft blur of a workshop with a rack of Leyden jars.
Extra negatives: no flat-topped square head, no neck bolts, no green skin, no heavy brow-ridge makeup.

11 · the-creature · Card art, aspect ratio 3:4
The same long-haired, copper-seamed creature as image 10, bust-to-waist, rising again from a workbench in a brass-and-copper laboratory as blue-white galvanic arcs leap between coils around him. A discarded playing card lies face-down on the bench beside his hand, about to be picked back up. Brass and copper dominant, parchment and ink, electric blue-white only as an accent.
Extra negatives: no flat-topped square head, no neck bolts, no green skin.

12 · portrait-spring-heeled-jack · Portrait, aspect ratio 1:1
Spring-Heeled Jack from Victorian London folklore: a tall, lean figure in a black oilskin cloak and a close-fitting helmet, with glowing red-amber eyes, a devilish grin, pointed ears and clawed gloves, crouched on a gunmetal-blue iron railing as if about to spring. Oxblood and ink dominant, a faint blue flame on his breath, cold fog and a single gaslamp below him. Mischievous, theatrical menace. Background a soft blur of London rooftops and chimney pots.
Extra negatives: no superhero costume.

13 · spring-heeled-jack · Card art, aspect ratio 3:4
The same cloaked figure as image 12, mid-leap high over a foggy London street, cloak spread, brass spring-coil mechanisms visible on the heels of his boots, a trail of blue flame and steam behind him, a gaslamp and a startled constable's lantern far below. Oxblood and ink dominant, parchment highlights, gaslight amber and gunmetal-blue accents.
Extra negatives: no superhero costume.

Begin with image 1 now.
```
