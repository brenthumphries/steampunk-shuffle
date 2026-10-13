// Serves the native bundle (`vite build --mode native --outDir dist-native`,
// base "/") for the Playwright "Native" project. `vite preview` can't do this
// job: the app is served from the root of the origin exactly as
// capacitor://localhost serves it inside the iOS binary, and every e2e spec
// opens the Pages path `/steampunk-shuffle/`, so that path is redirected to
// `/` (query string kept) and the specs run unmodified.

import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".woff2": "font/woff2",
};

const PAGES_PREFIX = "/steampunk-shuffle";
const root = resolve(process.argv[3] ?? "dist-native");
const port = Number(process.argv[2] ?? 4174);

createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (url.pathname === PAGES_PREFIX || url.pathname.startsWith(`${PAGES_PREFIX}/`)) {
    res.writeHead(302, { Location: (url.pathname.slice(PAGES_PREFIX.length) || "/") + url.search });
    res.end();
    return;
  }
  const relative = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, "");
  let file = join(root, relative);
  if (!file.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) {
    res.writeHead(404).end("Not found");
    return;
  }
  res.writeHead(200, {
    "Content-Type": MIME[extname(file)] ?? "application/octet-stream",
    "Cache-Control": "no-store",
  });
  createReadStream(file).pipe(res);
}).listen(port, () => console.log(`native bundle: http://localhost:${port}/ (${root})`));
