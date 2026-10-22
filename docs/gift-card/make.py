#!/usr/bin/env python3
"""Rebuild the Steampunk Shuffle gift-card backs (ATT-29) in one command.

    python3 docs/gift-card/make.py                                   # re-render with what is already in the HTML
    python3 docs/gift-card/make.py https://testflight.apple.com/join/XXXXXXXX   # put the real TestFlight link in

What it does:
  1. Makes the QR codes (vendored segno, pure Python, no install) and writes them into the QR blocks of
     back-web.html and back-testflight.html. TestFlight stays a red, marked PLACEHOLDER until you pass a URL.
     Once a real URL is in the HTML, later runs keep it; pass --placeholder to go back.
  2. Writes the letter-size home-print sheets (crop marks) around each card.
  3. Renders every page to PDF and to a PNG proof (cards 300 dpi, letter sheets 150 dpi) with headless Chromium/Chrome.
  4. Decodes every QR from the rendered PNGs (zbarimg, else OpenCV) and compares with what each should say.
     Results go to decode-results.md and decode-results.json. Exit code 3 if any QR fails to decode or differs.
  The decoder can be forced with QR_DECODER=zbar|zxing|opencv.

Needs: Python 3.9+, and Chrome, Chromium or Edge (found automatically, or set CHROME=/path or use --chrome).
For the decode check: `brew install zbar` (zbarimg), or `pip3 install zxing-cpp pillow`, or `pip3 install opencv-python-headless`; without any,
the check is skipped and says so.

It never runs git and never touches anything outside docs/gift-card/.
"""
import argparse
import glob
import json
import os
import platform
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.dont_write_bytecode = True   # keep vendor/segno free of __pycache__
sys.path.insert(0, str(HERE / "vendor"))
import segno  # noqa: E402  (vendored, BSD-3-Clause, see vendor/segno/LICENSE)

WEB_URL = "https://brenthumphries.github.io/steampunk-shuffle/"
TF_PREFIX = "https://testflight.apple.com/join/"
PLACEHOLDER_TEXT = "PLACEHOLDER - TestFlight public link not created yet. Do not print."
QUIET_MODULES = 4          # QR spec quiet zone
ECC = "m"
DARK = "#14100c"
DARK_PLACEHOLDER = "#b00020"
DPI = 300
WINDOW_OVERHEAD_PX = 160
SHEET_PNG_DPI = 150      # letter-sheet proofs; card proofs are 300 dpi
CSS_PX_PER_IN = 96

# page name -> (html file, expected QR names in reading order)
CARDS = {
    "back-web": ("back-web.html", ["web"]),
    "back-testflight": ("back-testflight.html", ["testflight", "web"]),
    "front-proposal": ("front-proposal.html", []),
}
CARD_W_IN, CARD_H_IN = 5.25, 7.25          # 5 x 7 trim + 0.125 bleed each side
SHEET_W_IN, SHEET_H_IN = 8.5, 11.0
TRIM_W_IN, TRIM_H_IN, BLEED_IN = 5.0, 7.0, 0.125

MARKER_RE = re.compile(r"(<!--QR:(\w+) symbol=([\d.]+)-->)(.*?)(<!--/QR:\2-->)", re.S)
ENCODES_RE = re.compile(r'data-encodes="([^"]*)"')


def fail(msg, code=2):
    print("error: " + msg, file=sys.stderr)
    sys.exit(code)


# ---------------------------------------------------------------- QR ----
def qr_html(name, data, symbol_in, placeholder):
    q = segno.make(data, error=ECC, boost_error=False, micro=False)
    n = q.symbol_size(border=0)[0]
    total = n + 2 * QUIET_MODULES
    width_in = round(symbol_in * total / n, 4)
    parts = []
    for y, row in enumerate(q.matrix):
        x = 0
        row = list(row)
        while x < n:
            if row[x]:
                start = x
                while x < n and row[x]:
                    x += 1
                parts.append("M%d %dh%dv1h-%dz" % (start + QUIET_MODULES, y + QUIET_MODULES, x - start, x - start))
            else:
                x += 1
    colour = DARK_PLACEHOLDER if placeholder else DARK
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%sin" height="%sin" '
        'shape-rendering="crispEdges" role="img" aria-label="QR code: %s">'
        '<rect width="%d" height="%d" fill="#fff"/><path d="%s" fill="%s"/></svg>'
        % (total, total, width_in, width_in, name, total, total, "".join(parts), colour)
    )
    cls = "qr ph" if placeholder else "qr"
    tag = '\n          <span class="ph-tag">PLACEHOLDER - NOT A REAL LINK</span>' if placeholder else ""
    block = (
        '\n          <div class="%s" data-qr="%s" data-encodes="%s" data-modules="%d" data-symbol-in="%s" '
        'data-quiet-modules="%d" data-ecc="%s" data-version="%d">%s</div>%s\n'
        % (cls, name, data.replace('"', "&quot;"), n, symbol_in, QUIET_MODULES, ECC.upper(), q.version, svg, tag)
    )
    return block, {"modules": n, "version": q.version, "symbol_in": symbol_in, "quiet_in": round(symbol_in * QUIET_MODULES / n, 3)}


def existing_tf(html_text):
    """The TestFlight URL already in back-testflight.html, or None if it is still the placeholder."""
    for m in MARKER_RE.finditer(html_text):
        if m.group(2) == "testflight":
            e = ENCODES_RE.search(m.group(4))
            if e and e.group(1).startswith(TF_PREFIX):
                return e.group(1)
    return None


def fill_qr_blocks(html_path, urls):
    """urls: {'web': (data, placeholder), 'testflight': (data, placeholder)}. Returns {name: info}."""
    text = html_path.read_text(encoding="utf-8")
    info = {}

    def sub(m):
        name, symbol = m.group(2), float(m.group(3))
        if name not in urls:
            fail("%s has a QR slot %r with no URL" % (html_path.name, name))
        data, ph = urls[name]
        block, meta = qr_html(name, data, symbol, ph)
        info[name] = dict(meta, data=data, placeholder=ph)
        return m.group(1) + block + m.group(5)

    new = MARKER_RE.sub(sub, text)
    if new != text:
        html_path.write_text(new, encoding="utf-8")
    return info


# --------------------------------------------------------------- sheets --
SHEET_TMPL = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<style>@page {{ size: 8.5in 11in; margin: 0 }}</style>
<link rel="stylesheet" href="card.css">
{extra_css}
<style>
.sheet {{ position: relative; width: 8.5in; height: 11in; background: #fff; overflow: hidden; }}
.sheet .card {{ position: absolute; left: {card_left}in; top: {card_top}in; }}
.sheet .m {{ position: absolute; background: #000; }}
.sheet .h {{ height: 0.5pt; width: 0.3in; margin-top: -0.25pt; }}
.sheet .v {{ width: 0.5pt; height: 0.3in; margin-left: -0.25pt; }}
.sheet .info {{ position: absolute; left: 0.6in; right: 0.6in; font: 400 10pt/1.35 "Lora", serif; color: #444; text-align: center; }}
.sheet .info.top {{ top: 0.5in; }}
.sheet .info.bottom {{ bottom: 0.5in; }}
.sheet .info b {{ color: #000; }}
.sheet .info .warn {{ color: #b00020; font-weight: 700; }}
</style>
</head>
<body>
<!-- Generated by make.py from {src}. Home-print sheet: Letter, card centred, crop marks at the trim corners. -->
<div class="sheet">
{card}
{marks}
<div class="info top"><b>{label}</b><br>Letter 8.5 x 11 in. Print at 100% (Actual size), not Fit to page. Cut on the crop marks; the 1/8 in outside them is bleed.</div>
<div class="info bottom">{status}</div>
</div>
</body>
</html>
"""


def crop_marks():
    tx0 = (SHEET_W_IN - TRIM_W_IN) / 2
    ty0 = (SHEET_H_IN - TRIM_H_IN) / 2
    off, ln = BLEED_IN + 0.0625, 0.3
    out = []
    for tx, sx in ((tx0, -1), (tx0 + TRIM_W_IN, 1)):
        for ty, sy in ((ty0, -1), (ty0 + TRIM_H_IN, 1)):
            hx = tx + sx * off if sx > 0 else tx - off - ln
            vy = ty + sy * off if sy > 0 else ty - off - ln
            out.append('<div class="m h" style="left:%.4fin;top:%.4fin"></div>' % (hx, ty))
            out.append('<div class="m v" style="left:%.4fin;top:%.4fin"></div>' % (tx, vy))
    return "\n".join(out)


def write_sheet(name, status_html):
    src, _ = CARDS[name]
    text = (HERE / src).read_text(encoding="utf-8")
    m = re.search(r'(<main class="card.*?</main>)<!--/card-->', text, re.S)
    if not m:
        fail("%s has no <main class=\"card\"> ... </main><!--/card--> block" % src)
    extra = "".join("<style>%s</style>\n" % re.sub(r"@page\s*\{[^}]*\}", "", css)
                    for css in re.findall(r"<style>(.*?)</style>", text, re.S))
    title = re.search(r"<title>(.*?)</title>", text, re.S).group(1)
    html = SHEET_TMPL.format(
        title="Letter sheet - " + title, extra_css=extra, src=src,
        card_left=(SHEET_W_IN - TRIM_W_IN) / 2 - BLEED_IN, card_top=(SHEET_H_IN - TRIM_H_IN) / 2 - BLEED_IN,
        card=m.group(1), marks=crop_marks(), label=title, status=status_html,
    )
    out = HERE / ("sheet-%s.html" % name)
    out.write_text(html, encoding="utf-8")
    return out


# ------------------------------------------------------------ rendering --
def find_chrome(cli):
    cands = [cli, os.environ.get("CHROME")]
    sysname = platform.system()
    if sysname == "Darwin":
        cands += [
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Chromium.app/Contents/MacOS/Chromium",
            "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
            "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
        ]
        cands += sorted(glob.glob(os.path.expanduser(
            "~/Library/Caches/ms-playwright/chromium-*/chrome-mac*/Chromium.app/Contents/MacOS/Chromium")), reverse=True)
    else:
        cands += sorted(glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome"), reverse=True)
        cands += sorted(glob.glob(os.path.expanduser("~/.cache/ms-playwright/chromium-*/chrome-linux/chrome")), reverse=True)
    for c in cands:
        if c and os.path.isfile(c) and os.access(c, os.X_OK):
            return c
    for n in ("google-chrome", "chromium", "chromium-browser", "chrome", "microsoft-edge"):
        p = shutil.which(n)
        if p:
            return p
    fail("no Chrome/Chromium found. Install Google Chrome, or set CHROME=/path/to/chrome, or pass --chrome.")


def run_chrome(chrome, extra, url):
    with tempfile.TemporaryDirectory(prefix="gc-chrome-") as prof:
        base = [chrome, "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--disable-extensions",
                "--allow-file-access-from-files", "--font-render-hinting=none", "--user-data-dir=" + prof,
                "--virtual-time-budget=4000"]
        if hasattr(os, "geteuid") and os.geteuid() == 0:
            base.append("--no-sandbox")
        last = None
        for headless in ("--headless=new", "--headless"):
            r = subprocess.run(base + [headless] + extra + [url], capture_output=True, text=True, timeout=120)
            last = r
            if r.returncode == 0:
                return
        fail("Chrome failed:\n" + (last.stderr or "")[-800:])


def crop_png(path, w, h, dpi):
    try:
        from PIL import Image
    except ImportError:
        fail("Pillow is needed to trim the PNG proofs: pip3 install pillow (tools/requirements.txt already lists it)")
    with Image.open(path) as im:
        if im.size[0] < w or im.size[1] < h:
            fail("%s came out %dx%d, expected at least %dx%d" % (Path(path).name, im.size[0], im.size[1], w, h))
        out = im.convert("RGB").crop((0, 0, w, h))
    out.save(path, optimize=True, dpi=(dpi, dpi))


def render(chrome, html_path, pdf_path, png_path, w_in, h_in, dpi=DPI):
    url = html_path.resolve().as_uri()
    run_chrome(chrome, ["--no-pdf-header-footer", "--print-to-pdf=" + str(pdf_path)], url)
    w_px, h_px = round(w_in * CSS_PX_PER_IN), round(h_in * CSS_PX_PER_IN)
    # New-style headless Chrome makes the page viewport shorter than --window-size by its (invisible) browser UI,
    # about 88 CSS px, so ask for a taller window and crop the top w x h back out.
    run_chrome(chrome, ["--window-size=%d,%d" % (w_px, h_px + WINDOW_OVERHEAD_PX),
                        "--force-device-scale-factor=%s" % (dpi / CSS_PX_PER_IN), "--screenshot=" + str(png_path)], url)
    crop_png(png_path, round(w_in * dpi), round(h_in * dpi), dpi)
    for p in (pdf_path, png_path):
        if not p.exists() or p.stat().st_size == 0:
            fail("Chrome produced no " + p.name)


# --------------------------------------------------------------- decode --
def decode_png(path, prefer=None):
    """Return (tool, [strings]) or (None, reason). Tries zbarimg, then zxing-cpp, then OpenCV (or only `prefer`)."""
    prefer = prefer or os.environ.get("QR_DECODER")
    problems = []
    if prefer in (None, "zbar") and shutil.which("zbarimg"):
        r = subprocess.run([shutil.which("zbarimg"), "--quiet", "--raw", "-Sdisable", "-Sqrcode.enable", str(path)],
                           capture_output=True, text=True)
        return "zbarimg", [l for l in r.stdout.splitlines() if l]
    if prefer in (None, "zxing"):
        try:
            import zxingcpp
            from PIL import Image
            with Image.open(path) as im:
                found = zxingcpp.read_barcodes(im.convert("RGB"))
            return "zxing-cpp", [f.text for f in found if "QR" in str(f.format)]
        except Exception as e:
            problems.append("zxing-cpp: " + type(e).__name__)
    if prefer in (None, "opencv"):
        try:
            import cv2
            img = cv2.imread(str(path))
            ok, texts, _, _ = cv2.QRCodeDetector().detectAndDecodeMulti(img)
            return "opencv", [t for t in (texts if ok else []) if t]
        except Exception as e:
            problems.append("opencv: " + type(e).__name__)
    return None, "no QR decoder found (brew install zbar, or pip3 install zxing-cpp, or opencv-python-headless) - " + "; ".join(problems)


def verify(results_in, out_dir):
    rows, bad = [], False
    for r in results_in:
        tool, got = decode_png(r["png"])
        if tool is None:
            r.update(tool=None, decoded=None, status="SKIPPED", detail=got)
        else:
            exp = sorted(r["expected"])
            ok = sorted(got) == exp
            bad = bad or not ok
            r.update(tool=tool, decoded=got, status="PASS" if ok else "FAIL")
        rows.append(r)
    pdftoppm = shutil.which("pdftoppm")
    if pdftoppm:   # the PDF is what gets printed, so decode a raster of it too
        for r in list(results_in):
            pdf = Path(r["png"]).parent.parent / "pdf" / (r["page"] + ".pdf")
            if not r["expected"] or not pdf.exists():
                continue
            with tempfile.TemporaryDirectory(prefix="gc-pdf-") as td:
                subprocess.run([pdftoppm, "-r", str(DPI), "-png", "-singlefile", str(pdf), td + "/p"], check=True)
                tool, got = decode_png(td + "/p.png")
            row = {"page": r["page"] + " (PDF raster)", "png": str(pdf), "expected": r["expected"]}
            if tool is None:
                row.update(tool=None, decoded=None, status="SKIPPED", detail=got)
            else:
                ok = sorted(got) == sorted(r["expected"])
                bad = bad or not ok
                row.update(tool=tool, decoded=got, status="PASS" if ok else "FAIL")
            rows.append(row)
    skipped = any(r["status"] == "SKIPPED" for r in rows)
    return rows, bad, skipped


def write_results(rows, qr_info, tf_url):
    (HERE / "decode-results.json").write_text(json.dumps(
        {"tf_url": tf_url or "PLACEHOLDER", "rows": [{k: v for k, v in r.items() if k != "png"} | {"png": Path(r["png"]).name} for r in rows]},
        indent=2), encoding="utf-8")
    lines = ["# QR decode results", "",
             "Written by make.py. Each QR is decoded from the rendered PNG (cards 300 dpi, letter sheets 150 dpi) and from a raster of the PDF, never from the source URL.", "",
             "TestFlight QR: " + (tf_url if tf_url else "**PLACEHOLDER** (encodes a marked text, not a link)"), "",
             "| Page | PNG | Tool | Expected | Decoded | Result |", "|---|---|---|---|---|---|"]
    for r in rows:
        lines.append("| %s | %s | %s | %s | %s | %s |" % (
            r["page"], Path(r["png"]).name, r.get("tool") or "-",
            "<br>".join("`%s`" % e for e in r["expected"]) or "(no QR)",
            "<br>".join("`%s`" % d for d in (r.get("decoded") or [])) or "-", r["status"]))
    lines += ["", "## QR sizes", "", "| Page | QR | Version | Modules | Symbol | Module | Quiet zone | Px per module at %d dpi |" % DPI, "|---|---|---|---|---|---|---|---|"]
    for page, qrs in qr_info.items():
        for name, i in qrs.items():
            mod_in = i["symbol_in"] / i["modules"]
            lines.append("| %s | %s | %d | %dx%d | %.2f in (%.1f mm) | %.4f in (%.2f mm) | %d modules = %.3f in | %.1f |" % (
                page, name, i["version"], i["modules"], i["modules"], i["symbol_in"], i["symbol_in"] * 25.4,
                mod_in, mod_in * 25.4, QUIET_MODULES, i["quiet_in"], mod_in * DPI))
    (HERE / "decode-results.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


# ----------------------------------------------------------------- main --
def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("testflight_url", nargs="?", help="public TestFlight link, e.g. %sAbCdEf12" % TF_PREFIX)
    ap.add_argument("--placeholder", action="store_true", help="put the red TestFlight placeholder back")
    ap.add_argument("--web-url", default=WEB_URL, help="web URL (default %s)" % WEB_URL)
    ap.add_argument("--chrome", help="path to Chrome/Chromium")
    ap.add_argument("--no-render", action="store_true", help="only rewrite the HTML, skip PDF/PNG")
    ap.add_argument("--no-verify", action="store_true", help="skip the QR decode check")
    ap.add_argument("--out-dir", help="write pdf/ and png/ here instead of next to the sources (used for dry runs)")
    ap.add_argument("--allow-any-url", action="store_true", help="accept a TestFlight URL that does not start with " + TF_PREFIX)
    a = ap.parse_args()

    tf_html = (HERE / CARDS["back-testflight"][0]).read_text(encoding="utf-8")
    tf_url = None
    if a.testflight_url:
        u = a.testflight_url.strip()
        if not (re.fullmatch(re.escape(TF_PREFIX) + r"[A-Za-z0-9]+", u) or a.allow_any_url):
            fail("TestFlight URL should look like %sXXXXXXXX (got %r). Use --allow-any-url to override." % (TF_PREFIX, u))
        tf_url = u
    elif not a.placeholder:
        tf_url = existing_tf(tf_html)
    placeholder = tf_url is None

    urls = {"web": (a.web_url, False), "testflight": (PLACEHOLDER_TEXT if placeholder else tf_url, placeholder)}
    qr_info = {}
    for page, (fname, _) in CARDS.items():
        qr_info[page] = fill_qr_blocks(HERE / fname, urls)
    qr_info = {k: v for k, v in qr_info.items() if v}

    if placeholder:
        status = '<span class="warn">TestFlight QR is a PLACEHOLDER: do not print this page. Run make.py with the public link first.</span>'
    else:
        status = "TestFlight QR: " + (tf_url if tf_url else "") + ". Web QR: " + a.web_url
    sheets = {}
    for page in CARDS:
        st = status if page == "back-testflight" else ("Web QR: " + a.web_url if page == "back-web" else
                                                       '<span class="warn">PROPOSAL front: no front of record exists in the repo.</span>')
        sheets["sheet-" + page] = write_sheet(page, st)
    print("HTML written (%s TestFlight QR)" % ("PLACEHOLDER" if placeholder else "live"))
    if a.no_render:
        return 0

    chrome = find_chrome(a.chrome)
    print("chrome:", chrome)
    base = Path(a.out_dir).resolve() if a.out_dir else HERE
    (base / "pdf").mkdir(parents=True, exist_ok=True)
    (base / "png").mkdir(parents=True, exist_ok=True)
    to_check = []
    for page, (fname, expected) in CARDS.items():
        render(chrome, HERE / fname, base / "pdf" / (page + ".pdf"), base / "png" / (page + ".png"), CARD_W_IN, CARD_H_IN)
        sp = "sheet-" + page
        render(chrome, sheets[sp], base / "pdf" / (sp + ".pdf"), base / "png" / (sp + ".png"), SHEET_W_IN, SHEET_H_IN, SHEET_PNG_DPI)
        exp = [urls[n][0] for n in expected]
        to_check.append({"page": page, "png": str(base / "png" / (page + ".png")), "expected": exp})
        to_check.append({"page": sp, "png": str(base / "png" / (sp + ".png")), "expected": exp})
        print("rendered", page)

    if a.no_verify:
        return 0
    rows, bad, skipped = verify(to_check, base)
    if not a.out_dir:
        write_results(rows, qr_info, tf_url)
    for r in rows:
        print("%-24s %-8s %s" % (r["page"], r["status"], r.get("detail") or ""))
    if skipped:
        print("note: decode check skipped (no zbarimg or OpenCV). Install one and re-run.")
    return 3 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
