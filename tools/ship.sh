#!/usr/bin/env bash
# tools/ship.sh — deterministic core of the ss-ship skill.
#
# Runs typecheck, tests, and a production build; takes a non-blocking
# Lighthouse read (perf/best-practices/accessibility/seo — Lighthouse 13
# dropped the standalone "pwa" category, so real installability auditing
# is deferred to plan step 3.6); commits and pushes if there are staged
# changes; then waits for the GitHub Pages deploy workflow and prints the
# live URL.
#
# Usage:
#   tools/ship.sh                 # nothing to commit, just verify + deploy current main
#   tools/ship.sh path/to/msg.txt # commit staged changes with this message file, then deploy
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

MSG_FILE="${1:-}"
PREVIEW_PORT=4173
BASE_PATH="/steampunk-shuffle/"
LH_JSON="$(mktemp -t ss-lighthouse).json"

cleanup() {
  [ -n "${PREVIEW_PID:-}" ] && kill "$PREVIEW_PID" 2>/dev/null || true
  rm -f "$LH_JSON"
}
trap cleanup EXIT

echo "==> typecheck"
npm run typecheck

echo "==> test"
npm test

echo "==> build"
npm run build

echo "==> lighthouse (report only, does not block ship)"
npx --yes vite preview --port "$PREVIEW_PORT" --strictPort >/tmp/ss-preview.log 2>&1 &
PREVIEW_PID=$!
sleep 2
if npx --yes lighthouse "http://localhost:${PREVIEW_PORT}${BASE_PATH}" \
  --only-categories=performance,best-practices,accessibility,seo \
  --chrome-flags="--headless" \
  --output=json --output-path="$LH_JSON" \
  --quiet >/tmp/ss-lighthouse.log 2>&1; then
  node -e "
    const r = require('$LH_JSON');
    const pct = c => r.categories[c] ? Math.round(r.categories[c].score * 100) : 'n/a';
    console.log('Lighthouse — performance: ' + pct('performance')
      + ', best-practices: ' + pct('best-practices')
      + ', accessibility: ' + pct('accessibility')
      + ', seo: ' + pct('seo'));
  "
else
  echo "Lighthouse run failed — continuing (non-blocking). See /tmp/ss-lighthouse.log"
fi
kill "$PREVIEW_PID" 2>/dev/null || true
PREVIEW_PID=""

echo "==> git status"
git status --short

if [ -z "$(git status --porcelain)" ]; then
  echo "Nothing to commit — deploying current main as-is."
else
  if [ -z "$MSG_FILE" ] || [ ! -f "$MSG_FILE" ]; then
    echo "Uncommitted changes exist but no commit message file was given. Aborting." >&2
    exit 1
  fi
  git add -A
  if git diff --cached --name-only | grep -Ei '(^|/)\.env(\..+)?$|\.pem$|credentials|secrets\.' >/dev/null; then
    echo "Refusing to commit — a staged file name looks sensitive. Review with 'git status' and unstage it." >&2
    exit 1
  fi
  git commit -F "$MSG_FILE"
fi

echo "==> push"
git push

echo "==> waiting for GitHub Pages deploy"
sleep 5
RUN_ID=$(gh run list --workflow=deploy.yml --branch=main --limit=1 --json databaseId --jq '.[0].databaseId')
gh run watch "$RUN_ID" --exit-status

PAGES_URL=$(gh api repos/:owner/:repo/pages --jq '.html_url' 2>/dev/null || true)
echo "==> Live at: ${PAGES_URL:-https://brenthumphries.github.io/steampunk-shuffle/}"
