---
name: ss-art-prompts
description: >-
  Reads docs/style-bible.md and a card/asset list, writes a paste-ready CSV
  prompt sheet (asset id, prompt, negative prompt, aspect ratio, reference
  image to attach) sized to the Gemini app's daily generation cap, and can
  write a single re-roll prompt with a specific fix folded in. Use when
  asked to build an art prompt sheet, generate prompts for a batch of card
  art or UI assets, or work on plan step 1.6.
model: haiku
---

# ss-art-prompts

Turns a list of art assets (cards, opponent portraits, backgrounds, icons —
anything in [`docs/style-bible.md`](../../../docs/style-bible.md) §4's
framing table) into a CSV Brent can paste straight into the Gemini app, one
row at a time, and get back something that matches the style bible without
edits.

Runs on **Haiku** (plan §2 rule 3): the mechanical parts — palette lookups,
aspect ratios, negative-prompt assembly, reference-image attachment,
daily-cap chunking, CSV formatting — are fully deterministic and live in
[`tools/artPrompts.ts`](../../../tools/artPrompts.ts), not re-derived in
prose each run. The one creative part — what each asset's illustration
should actually show — is short, template-shaped prose grounded directly in
`docs/style-bible.md` and `docs/design.md`, the same kind of authoring
`ss-card-author` does for flavour text. Escalate to Sonnet only if a
generated image comes back off-style twice in a row on the same asset after
a re-roll.

## Before writing any prompts

Read, in this order:
1. `docs/style-bible.md` in full — palette (§2), line/texture (§3), camera
   framing by asset type (§4), the negative-prompt base (§5), the pub
   regulars' fixed physical descriptions (§6), and the consistency
   technique (§7).
2. `docs/design.md` for whatever's being illustrated — family playstyles
   (§4) for Characters, the opponent roster (§9) for portraits, the pub
   (§1) for backgrounds. Character personality and one good identifying
   detail from the card's flavour/`Line` text usually make a better prompt
   than a generic description.
3. `art/reference/` — what's already been generated (batch 0: Sir Charles,
   the taproom, Hiawatha) and any later sheets' output, so new prompts
   attach the right reference image instead of starting the family's look
   from scratch.
4. `tools/artPrompts.ts`'s header comment for what's deterministic vs. what
   the manifest needs to supply.

## The engine vocabulary — `tools/artPrompts.ts` owns these, don't restate them

- **`FAMILY_PALETTE`** and **`ASPECT_BY_CATEGORY`** are style-bible.md §2
  and §4, encoded. Don't invent a palette description or aspect ratio in a
  prompt row — pull the family/category right and the tool supplies both.
- **`NEGATIVE_PROMPT_BASE`** is style-bible.md §5's block, verbatim, added
  to every row automatically. A row only needs `extraNegatives` for
  scene-specific additions (a family-colour exclusion, "no deerstalker
  cap" for a specific figure, "no legible text on a prop").
- **Reference-image resolution** (style-bible.md §7) is automatic and
  order-sensitive: every row gets the seed's `alwaysAttach` list (the
  taproom reference, for lighting/palette continuity); a `character` or
  `portrait` row additionally gets its family's closest existing
  reference, and — once it's been processed — *becomes* that family's
  reference for every later row in the same manifest (recorded as
  `(this sheet) <assetId>`, since the file doesn't exist yet — Brent
  attaches it by hand once it's been generated earlier in the same Gemini
  chat). This means **row order matters**: put each family's first
  portrait/Character earliest in the manifest so later same-family rows
  inherit it. See `tools/artPrompts.ts`'s `resolveReferences` /
  `buildSheetRows`.
- **Daily-cap chunking**: `GEMINI_DAILY_CAP` (100, plan §1) splits a sheet
  bigger than one day's generations into `-part1`, `-part2`, ... files
  automatically. Don't manually split a manifest to work around this.

If an asset type or negative-prompt need doesn't fit this vocabulary (a new
camera framing, a new palette), that's a style-bible change, not something
to route around in a single prompt — flag it for Brent instead of quietly
improvising a one-off.

## Procedure

### A new prompt sheet

1. **Pick the asset list.** Either take it from the user's request, or (for
   the v1 card set) work through `src/cards/data/`'s `artId`s in a sensible
   batch — a family at a time, or whatever priority the request implies.
   Note in each row's `notes` field *why* it's ordered where it is if the
   reference chain depends on it (see above).
2. **Write each row's `prompt`** — the scene only, no palette/negative/
   aspect boilerplate (the tool adds those). Follow the structure of the
   three approved reference prompts in `docs/style-bible.md` (a services
   description, key light, texture, framing, background), and ground
   physical details in `docs/design.md`/`docs/style-bible.md` §6 for any
   named pub regular. For a card, the ability text and flavour often
   suggest the scene directly (a Gadget's ability implies what it does on
   the workbench; a Scheme's is a vignette of the instant it happens).
3. **Set `family`** on any row style-bible.md's palette rule applies to
   (Characters, portraits) so the tool can look up its palette and resolve
   references. Leave it unset for genuinely neutral assets (Locations,
   Headlines, the card back, the app icon) — see `docs/design.md` §3's
   type table for which types are neutral by default.
4. **Order the rows** so each family's first Character/portrait comes
   before any other member of that family's cast (see reference-image
   resolution above).
5. **Write the manifest** as JSON matching `tools/artPrompts.ts`'s
   `ManifestFile` shape (`{ seed, rows }`) under `art/prompts/` — e.g.
   `art/prompts/sheet-<N>-manifest.json`. Set `seed.alwaysAttach` to the
   taproom reference path and `seed.byFamily` to any family that already
   has an approved reference image on disk (check `art/reference/` and
   prior sheets' generated output).
6. **Run the tool**: `npm run art-prompts -- art/prompts/sheet-<N>-manifest.json <N>`
   (or `npx tsx tools/artPrompts.ts ...` directly). It writes
   `art/prompts/prompt-sheet-<N>.csv` (or `-part1`, `-part2`, ... if the
   sheet exceeds the daily cap).
7. **Report**: how many assets, how many files (and why, if split), and
   remind Brent the `pasteReady` column is the one cell to copy into
   Gemini per row — `referenceImages` tells him what to attach alongside
   it.

### A single re-roll

When one generation comes back close but not right (wrong pose, wrong
palette lean, a prop in the wrong place), don't regenerate the whole sheet
or hand-write a new prompt from scratch. Find that asset's original row
(in its manifest JSON) and call `buildRerollPrompt(row, fix)` — pass a
short, specific instruction (e.g. `"Make the gaslamp brighter and move it
stage-left."`), not a full re-description. It returns one paste-ready block
with the fix folded into the original prompt, same negative prompt, same
aspect ratio.

## Guardrails

- Never invent a colour outside `docs/style-bible.md` §2's eight named
  colours, or a framing outside §4's table — that's a style-bible edit, a
  design decision for Brent, not something this skill improvises around.
- Don't give a historical/literary opponent (Lovelace, Dickens, Holmes,
  Moriarty, Christie, Poirot, Shelley, Jekyll/Hyde) a photoreal-likeness
  prompt — style-bible.md §6 wants them "recognisable but lightly
  stylised... not photoreal likenesses, not caricature." Add an
  `extraNegatives` entry for it (see `art/prompts/sheet-1-manifest.json`
  for the pattern).
- The Landlady is **never** a portrait (design.md §14.3, style-bible.md
  §6) — don't add a row for her face. If a background needs her presence,
  it's silhouette/from-behind only, and she's still not the row's subject.
- Card art ids in `src/cards/data/` (e.g. `sherlock-holmes`,
  `professor-moriarty`) are already claimed by that card's own
  illustration. A same-character asset in a different context (e.g. a
  roster portrait) needs a distinct id — this sheet uses a `portrait-`
  prefix; keep using it (or an equally clear prefix) for future
  non-card-art assets so `tools/ingest-art.py` (1.7) never collides two
  different images on one id.
- This skill only writes prompt sheets — it never calls an image model
  (plan §1: no free API tier, so generation stays manual in the Gemini
  app) and never touches `art/inbox/` or `art/reference/` (that's
  `tools/ingest-art.py`'s job, plan step 1.7, not built yet).
