# QR decode results

Written by make.py. Each QR is decoded from the rendered PNG (cards 300 dpi, letter sheets 150 dpi) and from a raster of the PDF, never from the source URL.

TestFlight QR: **PLACEHOLDER** (encodes a marked text, not a link)

| Page | PNG | Tool | Expected | Decoded | Result |
|---|---|---|---|---|---|
| back-web | back-web.png | zxing-cpp | `https://brenthumphries.github.io/steampunk-shuffle/` | `https://brenthumphries.github.io/steampunk-shuffle/` | PASS |
| sheet-back-web | sheet-back-web.png | zxing-cpp | `https://brenthumphries.github.io/steampunk-shuffle/` | `https://brenthumphries.github.io/steampunk-shuffle/` | PASS |
| back-testflight | back-testflight.png | zxing-cpp | `PLACEHOLDER - TestFlight public link not created yet. Do not print.`<br>`https://brenthumphries.github.io/steampunk-shuffle/` | `PLACEHOLDER - TestFlight public link not created yet. Do not print.`<br>`https://brenthumphries.github.io/steampunk-shuffle/` | PASS |
| sheet-back-testflight | sheet-back-testflight.png | zxing-cpp | `PLACEHOLDER - TestFlight public link not created yet. Do not print.`<br>`https://brenthumphries.github.io/steampunk-shuffle/` | `PLACEHOLDER - TestFlight public link not created yet. Do not print.`<br>`https://brenthumphries.github.io/steampunk-shuffle/` | PASS |
| front-proposal | front-proposal.png | zxing-cpp | (no QR) | - | PASS |
| sheet-front-proposal | sheet-front-proposal.png | zxing-cpp | (no QR) | - | PASS |
| back-web (PDF raster) | back-web.pdf | zxing-cpp | `https://brenthumphries.github.io/steampunk-shuffle/` | `https://brenthumphries.github.io/steampunk-shuffle/` | PASS |
| sheet-back-web (PDF raster) | sheet-back-web.pdf | zxing-cpp | `https://brenthumphries.github.io/steampunk-shuffle/` | `https://brenthumphries.github.io/steampunk-shuffle/` | PASS |
| back-testflight (PDF raster) | back-testflight.pdf | zxing-cpp | `PLACEHOLDER - TestFlight public link not created yet. Do not print.`<br>`https://brenthumphries.github.io/steampunk-shuffle/` | `PLACEHOLDER - TestFlight public link not created yet. Do not print.`<br>`https://brenthumphries.github.io/steampunk-shuffle/` | PASS |
| sheet-back-testflight (PDF raster) | sheet-back-testflight.pdf | zxing-cpp | `PLACEHOLDER - TestFlight public link not created yet. Do not print.`<br>`https://brenthumphries.github.io/steampunk-shuffle/` | `PLACEHOLDER - TestFlight public link not created yet. Do not print.`<br>`https://brenthumphries.github.io/steampunk-shuffle/` | PASS |

## QR sizes

| Page | QR | Version | Modules | Symbol | Module | Quiet zone | Px per module at 300 dpi |
|---|---|---|---|---|---|---|---|
| back-web | web | 4 | 33x33 | 1.70 in (43.2 mm) | 0.0515 in (1.31 mm) | 4 modules = 0.206 in | 15.5 |
| back-testflight | testflight | 5 | 37x37 | 1.50 in (38.1 mm) | 0.0405 in (1.03 mm) | 4 modules = 0.162 in | 12.2 |
| back-testflight | web | 4 | 33x33 | 1.05 in (26.7 mm) | 0.0318 in (0.81 mm) | 4 modules = 0.127 in | 9.5 |
