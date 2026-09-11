#!/usr/bin/env python3
"""Art ingestion (plan step 1.7): crop, retina-resize, WebP, manifest.

You drop raw Gemini downloads into art/inbox/<assetId>.<ext> (png/jpg/jpeg/
webp), named to match an assetId from one of ss-art-prompts's manifests
(art/prompts/sheet-<N>-manifest.json — the same file that generated the
prompt sheet in the first place, so category/aspect can't drift between
prompting and ingesting). This script center-crops each one to its
category's card-window aspect (docs/style-bible.md §4), resizes to a 2x
retina target, and writes:

  public/art/<assetId>.webp      the processed asset (served by the PWA)
  public/art/manifest.json       assetId -> {category, family, size, ...}
                                  merged across every batch ever ingested
  art/ingest-preview.html        a standalone test page (not deployed —
                                  lives beside art/, not public/) to eyeball
                                  every ingested asset by category

Run: `python3 tools/ingest-art.py art/prompts/sheet-1-manifest.json`
     (or `npm run ingest-art -- art/prompts/sheet-1-manifest.json`)

Needs Pillow: `pip3 install -r tools/requirements.txt`.
"""

from __future__ import annotations

import glob
import json
import os
import sys
from datetime import datetime, timezone

from PIL import Image

# ---------------------------------------------------------------------------
# Style bible, mirrored (docs/style-bible.md §4)
#
# Kept in sync BY HAND with ASPECT_BY_CATEGORY in tools/artPrompts.ts — a
# Python script can't import that TS module. If a category or ratio changes
# there, change it here too.
# ---------------------------------------------------------------------------

ASPECT_BY_CATEGORY = {
    "character": "3:4",
    "gadget": "3:4",
    "scheme": "3:4",
    "location": "3:4",
    "headline": "3:4",
    "card-back": "3:4",
    "portrait": "1:1",
    "icon": "1:1",
    "background": "9:16",
}

# Base (1x) pixel size per aspect ratio, then doubled for retina (plan step
# 1.7: "2x retina resize"). No card-window pixel size is fixed anywhere else
# in the codebase yet (Phase 3.1's SVG frame, which will actually mount
# these, hasn't been built) — these are a judgment call, not a locked spec.
# 3:4 follows a comfortable card-illustration size; 1:1 matches the pub-hub
# portrait roster; 9:16 uses the Playwright iPhone-17 viewport width
# (402px, tests/e2e's fixed viewport) as its 1x base so a background fills
# the phone screen edge to edge. Trivial to change later since this is just
# a resize step re-run on the same source files.
RETINA_SCALE = 2
BASE_SIZE_BY_RATIO = {
    "3:4": (300, 400),
    "1:1": (320, 320),
    "9:16": (402, 715),
}

WEBP_QUALITY = 90
SOURCE_EXTENSIONS = (".png", ".jpg", ".jpeg", ".webp")

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def target_pixel_size(category: str) -> tuple[int, int]:
    ratio = ASPECT_BY_CATEGORY[category]
    base_w, base_h = BASE_SIZE_BY_RATIO[ratio]
    return base_w * RETINA_SCALE, base_h * RETINA_SCALE


def find_source_file(inbox_dir: str, asset_id: str) -> str | None:
    matches = sorted(
        p
        for ext in SOURCE_EXTENSIONS
        for p in glob.glob(os.path.join(inbox_dir, f"{asset_id}{ext}"))
    )
    # Case-insensitive extension fallback (Gemini downloads are often .jpeg).
    if not matches:
        matches = sorted(
            p
            for p in glob.glob(os.path.join(inbox_dir, f"{asset_id}.*"))
            if os.path.splitext(p)[1].lower() in SOURCE_EXTENSIONS
        )
    if len(matches) > 1:
        print(f"  ! {asset_id}: {len(matches)} source files match, using {os.path.basename(matches[0])}")
    return matches[0] if matches else None


def center_crop_to_aspect(img: Image.Image, target_w: int, target_h: int) -> Image.Image:
    target_ratio = target_w / target_h
    src_w, src_h = img.size
    src_ratio = src_w / src_h

    if src_ratio > target_ratio:
        new_w = round(src_h * target_ratio)
        left = (src_w - new_w) // 2
        box = (left, 0, left + new_w, src_h)
    else:
        new_h = round(src_w / target_ratio)
        top = (src_h - new_h) // 2
        box = (0, top, src_w, top + new_h)

    cropped = img.crop(box)
    src_area = src_w * src_h
    kept_area = (box[2] - box[0]) * (box[3] - box[1])
    if kept_area < src_area * 0.5:
        print(f"    warning: heavy crop, kept {kept_area / src_area:.0%} of the source — check framing")
    return cropped


def process_asset(source_path: str, category: str, out_dir: str, asset_id: str) -> tuple[int, int]:
    target_w, target_h = target_pixel_size(category)

    with Image.open(source_path) as img:
        if img.mode in ("RGBA", "LA", "P"):
            img = img.convert("RGBA")
            flattened = Image.new("RGB", img.size, (255, 255, 255))
            flattened.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
            img = flattened
        else:
            img = img.convert("RGB")

        cropped = center_crop_to_aspect(img, target_w, target_h)
        resized = cropped.resize((target_w, target_h), Image.LANCZOS)

        out_path = os.path.join(out_dir, f"{asset_id}.webp")
        resized.save(out_path, "WEBP", quality=WEBP_QUALITY, method=6)

    return target_w, target_h


def load_manifest_rows(manifest_path: str) -> list[dict]:
    with open(manifest_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    rows = data.get("rows", [])
    for row in rows:
        if row.get("category") not in ASPECT_BY_CATEGORY:
            raise ValueError(
                f"asset '{row.get('assetId')}' has unknown category '{row.get('category')}' "
                f"— add it to ASPECT_BY_CATEGORY in this script (and tools/artPrompts.ts)"
            )
    return rows


def load_existing_output_manifest(path: str) -> dict:
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def build_preview_html(output_manifest: dict) -> str:
    by_category: dict[str, list[tuple[str, dict]]] = {}
    for asset_id, entry in sorted(output_manifest.items()):
        by_category.setdefault(entry["category"], []).append((asset_id, entry))

    sections = []
    for category in sorted(by_category):
        cards = []
        for asset_id, entry in by_category[category]:
            cards.append(
                f'<figure>'
                f'<img src="../public/art/{asset_id}.webp" alt="{asset_id}" loading="lazy">'
                f'<figcaption>{asset_id}<br><small>{entry["width"]}×{entry["height"]}'
                f'{" &middot; " + entry["family"] if entry.get("family") else ""}</small></figcaption>'
                f'</figure>'
            )
        sections.append(
            f'<section><h2>{category} ({len(cards)})</h2><div class="grid">{"".join(cards)}</div></section>'
        )

    return f"""<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Steampunk Shuffle — art ingest preview</title>
<style>
  body {{ font-family: system-ui, sans-serif; background: #1a120b; color: #e8dcc8; margin: 0; padding: 24px; }}
  h1 {{ font-weight: 600; }}
  h2 {{ text-transform: capitalize; border-bottom: 1px solid #4a3a28; padding-bottom: 4px; }}
  .grid {{ display: flex; flex-wrap: wrap; gap: 16px; margin: 16px 0 32px; }}
  figure {{ margin: 0; width: 160px; }}
  figure img {{ width: 100%; height: auto; display: block; background: #000; border: 1px solid #4a3a28; }}
  figcaption {{ font-size: 12px; margin-top: 4px; word-break: break-word; }}
  figcaption small {{ color: #a89878; }}
</style>
</head>
<body>
<h1>Art ingest preview ({len(output_manifest)} assets)</h1>
<p>Generated by tools/ingest-art.py. Not deployed — this file lives in art/, not public/.</p>
{"".join(sections)}
</body>
</html>
"""


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python3 tools/ingest-art.py <manifest.json> [--inbox DIR] [--out DIR]")
        sys.exit(1)

    manifest_path = sys.argv[1]
    args = sys.argv[2:]

    def flag(name: str, default: str) -> str:
        if name in args:
            return args[args.index(name) + 1]
        return default

    inbox_dir = os.path.join(REPO_ROOT, flag("--inbox", "art/inbox"))
    out_dir = os.path.join(REPO_ROOT, flag("--out", "public/art"))
    preview_path = os.path.join(REPO_ROOT, "art", "ingest-preview.html")
    manifest_out_path = os.path.join(out_dir, "manifest.json")

    os.makedirs(inbox_dir, exist_ok=True)
    os.makedirs(out_dir, exist_ok=True)

    rows = load_manifest_rows(os.path.join(REPO_ROOT, manifest_path) if not os.path.isabs(manifest_path) else manifest_path)
    output_manifest = load_existing_output_manifest(manifest_out_path)

    ingested, skipped = 0, 0
    print(f"Ingesting against {manifest_path} ({len(rows)} asset(s) listed)")
    for row in rows:
        asset_id = row["assetId"]
        category = row["category"]
        source_path = find_source_file(inbox_dir, asset_id)

        if source_path is None:
            skipped += 1
            continue

        width, height = process_asset(source_path, category, out_dir, asset_id)
        output_manifest[asset_id] = {
            "category": category,
            "family": row.get("family"),
            "width": width,
            "height": height,
            "sourceFile": os.path.relpath(source_path, REPO_ROOT),
            "ingestedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        }
        print(f"  ✓ {asset_id} -> public/art/{asset_id}.webp ({width}×{height})")
        ingested += 1

    with open(manifest_out_path, "w", encoding="utf-8") as f:
        json.dump(output_manifest, f, indent=2, sort_keys=True)
        f.write("\n")

    with open(preview_path, "w", encoding="utf-8") as f:
        f.write(build_preview_html(output_manifest))

    print()
    print(f"{ingested} ingested, {skipped} skipped (no source file in {os.path.relpath(inbox_dir, REPO_ROOT)}/)")
    print(f"manifest: {os.path.relpath(manifest_out_path, REPO_ROOT)} ({len(output_manifest)} total assets)")
    print(f"preview:  open {os.path.relpath(preview_path, REPO_ROOT)} directly in a browser")


if __name__ == "__main__":
    main()
