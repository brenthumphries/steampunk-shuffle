# Steampunk Shuffle — Art Style Bible

**Status:** v1 (plan step 0.3). **Authority:** governs every image generated for the game. Cites `design.md` sections; if art direction and design.md ever conflict, design.md wins and this file gets amended.
**Audience:** Brent, pasting prompts into the Gemini app; the `ss-art-prompts` skill (built 1.6), which reads this file to generate prompt sheets.

---

## 1. The world in one sentence

Victorian-engineering steampunk, not goggles-and-corsets cosplay (`design.md` §2): brass, steam, telegraph wire, difference engines, a dirigible over Holborn. Warm gaslight interiors, cool fog-and-iron exteriors, real 1871 London with one fault in time in the cellar.

## 2. Palette

Five family colours (`design.md` §4) plus three neutrals. Every asset draws from this set — no colour outside it without a reason.

| Name | Family / use | Feel |
|---|---|---|
| **Brass & copper** | The Foundry | Warm, polished, high-value metal. Machinery, rivets, cog-work. |
| **Oxblood leather** | The Rookery | Deep aged red-brown. Worn leather, pawnshop counters, lock-picks. |
| **Verdigris** | The Salon | Oxidised copper-green. Drawing-room brocade, greenhouse glass, old bronze. |
| **Gaslight amber** | The Irregulars | Warm yellow-orange glow. Street lamps, pub light, informants in doorways. |
| **Gunmetal blue** | The Yard | Cool dark blue-grey. Police wool, iron railings, evening fog. |
| **Parchment cream** | Neutral / UI ground | Aged paper, card stock, beer mats. |
| **Ink black** | Neutral / linework | Deep warm black, never pure `#000`. |
| **Sovereign gold** | Neutral / legendary accent | Used sparingly — legendary frames, the Checks currency, the dedication screen. |

Rule of thumb: an illustration should read as *one* dominant family colour plus parchment and ink, with the other four families only as small accents (a Yard officer's coat against an amber-lit street; a Foundry machine in an oxblood-lit cellar). Neutral cards (Locations, Headlines, the Landlady) draw from parchment, ink and sovereign gold.

## 3. Line and texture

- **Base render:** painterly digital illustration, not a photograph and not a flat vector. Visible, controlled brushwork — think a well-produced Victorian book plate colourised, not a photo filter.
- **Linework:** confident ink contour on major forms (the engraving heritage), softened by paint underneath rather than left as a crisp vector outline.
- **Shading:** directional gaslight — warm key light from one side, cool ambient fill, real cast shadows. Avoid flat toon shading and avoid photographic global illumination.
- **Texture:** a faint paper/canvas grain across the whole image, plus material-specific texture where it matters — brushed brass, worn leather, foxed paper, fogged glass. Keep it subtle; it should survive being shrunk to card size.
- **Detail bias:** render mechanical detail (rivets, gears, valve wheels, telegraph wire, concertina bellows) with real engineering logic — Sir Charles built this world, so it should look buildable, not decorative.

## 4. Camera framing by card type

(`design.md` §3, §8)

| Type | Framing | Aspect | Notes |
|---|---|---|---|
| **Character** | Bust-to-waist portrait, three-quarter or profile turn, gaslight side lighting | 3:4 | Background is a soft, blurred suggestion of the family's world (a street lamp, a workbench, a drawing room), never a busy scene competing with the subject. |
| **Gadget** | Object study, the item on a surface (workbench, bar top, evidence table), shallow depth of field | 3:4 | No hands holding it unless the ability text requires a gesture. |
| **Scheme** | Small vignette — a moment of action or reveal, one or two elements, symbolic rather than literal | 3:4 | These are one-shot effects; the image should feel like the instant something happens. |
| **Location** | Wide establishing shot compressed to the card window — enough depth to read as a place at a glance | 3:4 | Full-bleed environment, no figure doing anything (the place is the subject). |
| **Headline** | Newspaper front page: symmetrical masthead-style composition, bold central motif | 3:4 | The only type styled as a graphic object rather than an illustrated scene — it should look like it was printed, not painted. |
| **Portrait (opponent reference)** | Same as Character but framed for the pub-hub roster, slightly tighter | 1:1 | Used for the "tonight's patrons" UI, not for cards. |
| **Background (pub scenes)** | Full environment, room to compose UI over the lower third | 9:16 | Taproom, snug, back parlour, cellar. |

The illustration window only — the SVG frame (step 3.1) supplies the border, so compose the subject to fill the window edge-to-edge with no vignette or card-shaped crop baked in.

## 5. Negative prompts (include on every generation)

```
no text, no lettering, no watermark, no signature, no logo,
no photorealistic photography look, no 3D render look, no anime style,
no goggles-and-corsets cosplay clichés, no modern clothing or objects
(unless an explicit easter egg), no gore, no graphic violence,
no distorted or extra hands/limbs, no border or frame, no vignette,
no colors outside the palette in section 2
```

Add scene-specific negatives as needed (e.g. a Yard card: `no red or oxblood dominant`).

## 6. Pub regulars — reference character sheet

Keep these consistent across every appearance (portrait, card, background cameo). Full personality and rules context in `design.md` §1.3, §1.4, §8.2, §14.3.

**Sir Charles Wheatstone** (proprietor, barkeep) — late 60s in 1871, slight build, slightly stooped from decades over instruments, clean-shaven or modest side-whiskers, wire-rimmed spectacles, shirtsleeves and a leather waistcoat under a bar apron, ink-stained fingertips. Reserved posture — hands often occupied (polishing a glass, winding something) rather than gesturing. A concertina hangs behind the bar within reach. Lit warm and close, gaslight amber with brass highlights, since he's rendered as part of the Foundry he built. Never smiling broadly; at most a small, private one.

**The Landlady (Sara)** — never a portrait (`design.md` §14.3). When she appears at all, she's seen from the bar, face turned toward the fire or the cats, in silhouette or three-quarter-from-behind. Her chair is by the fire, always empty until earned. Sovereign gold accent only, otherwise unlit and indistinct — she is a presence, not a character design.

**The five pub cats** (`design.md` §8.2) — small, close, bust-only crops, shot like a candid rather than a formal portrait:
- *Hiawatha* (Irregulars) — black American shorthair, half in shadow, eyes catching the light.
- *Banshee* (Salon) — long-haired tortoiseshell, mid-yowl, in motion.
- *Bramwell* (Salon) — tuxedo cat, chest out, mouth open mid-announcement.
- *Charlotte* (Yard) — grey-on-grey American shorthair, asleep, heavy and settled.
- *Emily* (Rookery) — tiny long-haired brown tabby, alert, caught mid-theft.

**Opponents** (regulars, seasoned, legends — `design.md` §9): dress and light each to their family colour first, personality second. A Yard officer reads gunmetal blue before he reads "earnest." Historical and literary figures (Lovelace, Dickens, Holmes, Christie, Poirot, Shelley, Jekyll/Hyde) should be recognisable but lightly stylised into the house illustration style — not photoreal likenesses, not caricature.

---

## Reference prompts (batch 0)

Generate these three first, from a fresh Gemini chat, one after another so they can reference each other for consistency. Exit check: all three read as one world (`plan.md` step 0.3).

### Reference 1 — Sir Charles Wheatstone, behind the bar

```
Painterly digital illustration in a Victorian-engineering steampunk style —
brass and warm gaslight, not goggles-and-corsets cosplay. A slender,
slightly stooped man in his late sixties, wire-rimmed spectacles, modest
side-whiskers, shirtsleeves and a leather bar apron over a waistcoat,
ink-stained fingertips, polishing a glass behind a brass-fitted bar. Quiet,
reserved expression, eyes slightly down at his work rather than at the
viewer. A concertina hangs on the wall within reach. Warm gaslight amber
key light from one side, cool blue-grey ambient fill, real cast shadows,
brushed-brass highlights. Confident inked contours softened under paint,
faint paper-grain texture throughout, directional Victorian book-plate
lighting. Three-quarter portrait, bust-to-waist, background a soft blur of
bar shelving and brass fixtures.

no text, no lettering, no watermark, no signature, no logo,
no photorealistic photography look, no 3D render look, no anime style,
no goggles-and-corsets cosplay clichés, no modern clothing or objects,
no gore, no graphic violence, no distorted or extra hands/limbs,
no border or frame, no vignette

Aspect ratio 1:1.
```

### Reference 2 — The Wheatstone Bridge, taproom

```
Painterly digital illustration in a Victorian-engineering steampunk style —
brass and warm gaslight, not goggles-and-corsets cosplay. Wide establishing
view of a narrow, gaslit Victorian public house taproom: brass fittings and
piping along the ceiling, oxblood leather booths, verdigris copper
accents on an old fireplace, gunmetal-blue window frames looking out on a
foggy London street, warm amber gaslamps throughout. An empty chair by the
fire, slightly apart from the others. A cat asleep on a stool. Deep,
lived-in detail — worn floorboards, foxed paper notices, a concertina on a
shelf behind the bar. Confident inked contours softened under paint, faint
paper-grain texture, directional gaslight with real cast shadows, no flat
toon shading.

no text, no lettering, no watermark, no signature, no logo,
no photorealistic photography look, no 3D render look, no anime style,
no goggles-and-corsets cosplay clichés, no modern clothing or objects,
no gore, no graphic violence, no people in frame, no border or frame,
no vignette

Aspect ratio 9:16.
```

### Reference 3 — Hiawatha (pub cat, Irregulars)

```
Painterly digital illustration in a Victorian-engineering steampunk style,
matching the palette and lighting of a Victorian gaslit London pub. Close
bust portrait of a black American shorthair cat with yellow eyes, half in shadow, only the
eyes and a rim of gaslight amber catching the light, the rest of the coat
dissolving into ink-black shadow. Candid, alert framing, as if caught
mid-glance rather than posed. Confident inked contours softened under
paint, faint paper-grain texture, warm amber key light with a cool ambient
fill, real cast shadow.

no text, no lettering, no watermark, no signature, no logo,
no photorealistic photography look, no 3D render look, no anime style,
no cute/cartoon cat style, no modern objects, no border or frame,
no vignette, no colors outside brass/amber/ink-black

Aspect ratio 3:4.
```

---

## 7. Consistency technique for later batches

(`plan.md` §6) Once the three references above are approved, attach the taproom reference (Reference 2) to every subsequent prompt for lighting/palette consistency, and attach the closest existing character reference when generating a new member of the same cast (e.g. attach Sir Charles when generating another Foundry figure; attach Hiawatha when generating another cat). The `ss-art-prompts` skill (built in step 1.6) automates this attachment per family.
