#!/usr/bin/env python3
"""Make the small copies of existing art that the gift card uses (ATT-29). Only art/ files are used; nothing is generated.

    python3 docs/gift-card/prep-art.py        # needs Pillow (pip3 install pillow)

Reads  ../../art/inbox/{card-back,app-icon,background-the-taproom}.jpeg
Writes art/{card-back,app-icon,background-the-taproom}.jpg  (same pictures, re-encoded and, for the icon, shrunk),
which keeps each PDF at about 1.5 MB instead of 6 MB. Already run; re-run only if the source art changes.
"""
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
SRC = HERE.parent.parent / "art" / "inbox"
OUT = HERE / "art"
OUT.mkdir(exist_ok=True)
JOBS = [("card-back", None, 86), ("app-icon", (512, 512), 90), ("background-the-taproom", None, 85)]
for name, size, q in JOBS:
    im = Image.open(SRC / (name + ".jpeg")).convert("RGB")
    if size:
        im = im.resize(size, Image.LANCZOS)
    im.save(OUT / (name + ".jpg"), quality=q, optimize=True, progressive=True)
    print(name, im.size, (OUT / (name + ".jpg")).stat().st_size // 1024, "KB")
