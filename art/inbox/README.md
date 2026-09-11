# art/inbox/

Drop final Gemini downloads here, renamed to `<assetId>.<ext>` — the same
`assetId` used in the `art/prompts/sheet-<N>-manifest.json` that generated
the prompt in the first place (png, jpg/jpeg, or webp all work).

Then run:

```
npm run ingest-art -- art/prompts/sheet-1-manifest.json
```

This crops each one to its category's card-window aspect ratio, resizes to
2x retina, converts to WebP, and writes `public/art/<assetId>.webp` plus an
updated `public/art/manifest.json`. Open `art/ingest-preview.html` afterward
to eyeball everything ingested so far.

First run needs Pillow: `pip3 install -r tools/requirements.txt`.

Files ingested here are consumed, not archived — once `public/art/` has the
processed WebP, the original in this folder can be deleted or left; it's
gitignored either way isn't required, but there's no need to commit raw
Gemini downloads once they're processed.
