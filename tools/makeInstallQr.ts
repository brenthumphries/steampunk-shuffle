// Writes install/qr.svg, the QR code on the install page (monthly plan 14 §3.1).
// The page's URL is fixed, so the code is generated once and committed; rerun
// this only if the Pages address changes.
//   npm run install-qr

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";

const GAME_URL = "https://brenthumphries.github.io/steampunk-shuffle/";
const OUT = fileURLToPath(new URL("../install/qr.svg", import.meta.url));

const svg = await QRCode.toString(GAME_URL, {
  type: "svg",
  errorCorrectionLevel: "M",
  margin: 1,
  color: { dark: "#1a120b", light: "#f2e6d0" },
});
writeFileSync(OUT, svg.endsWith("\n") ? svg : `${svg}\n`);
console.log(`wrote ${OUT}`);
