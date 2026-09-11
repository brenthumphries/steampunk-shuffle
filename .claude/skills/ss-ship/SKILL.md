---
name: ss-ship
description: >-
  Ship the current state of Steampunk Shuffle in one command: typecheck,
  test, build, a non-blocking Lighthouse read, commit, push, wait for the
  GitHub Pages deploy, and print the live URL. Use when asked to "ship",
  "deploy", "push this live", "run ss-ship", or when a chunk of work is
  ready to go out. Refuses to ship if typecheck or tests fail, or if there
  are uncommitted changes and no commit message was decided.
model: haiku
---

# ss-ship

One-command deploy for Steampunk Shuffle. The mechanical work lives in
`tools/ship.sh` (deterministic — don't re-derive it in prose each run);
this skill's job is the two things a script can't do: write the commit
message and confirm the result.

Runs on **Haiku** — this is exactly the kind of mechanical, low-judgment
step plan §2 rule 3 wants scripted rather than reasoned through.

## Procedure

1. **Check repo state.** Run `git status --short` and `git diff --stat`.
   - If the tree is clean, no commit is needed — skip to step 3.
2. **Write the commit message** (only if there are changes to commit).
   - Read the diff, not just file names, to know what actually changed.
   - Conventional Commits format (`feat:`, `fix:`, `docs:`, `chore:`,
     `test:`), matching `git log --oneline -10` for this repo's style.
   - Append the attribution footer given in this session's system
     instructions (currently `Co-Authored-By: Claude Sonnet 5
     <noreply@anthropic.com>` — use whatever this session's own
     instructions say, since it changes with the model running the skill).
   - Write the full message to a temp file (e.g. in the scratchpad
     directory) — multi-line commit messages don't survive a shell `-m`
     arg cleanly.
3. **Run the script**: `tools/ship.sh` with no argument if there was
   nothing to commit, or `tools/ship.sh <path-to-message-file>` otherwise.
   - It typechecks, tests, builds, takes a Lighthouse read (informational
     only — see the note below), commits, pushes, waits for the
     `deploy.yml` Actions run, and prints the live Pages URL.
   - If it exits non-zero, **stop and report the failing step's output
     verbatim** — do not retry with `--no-verify`-style workarounds, and
     do not silently fix-and-recommit without saying what broke.
4. **Confirm and report**: state what shipped (the commit subject, or
   "no changes, redeployed current main"), the Lighthouse scores printed,
   and the live URL from the script's last line.

## Guardrails

- Never pass `--force` to `git push`, and never bypass the script's
  sensitive-filename check by hand-committing around it.
- If `git status` shows changes you don't recognize from this
  conversation, stop and ask before staging them — they may be the
  product owner's in-progress work from editing on the Mac directly.
- This skill ships whatever is on `main` locally. It does not create
  branches or PRs — per `CLAUDE.md`, `main` is expected to always build
  and deploy is automatic on push.

## Why Lighthouse is informational only, here

Lighthouse 13 removed the standalone `pwa` category (real installability
auditing now needs a separate plugin). `tools/ship.sh` reports
performance/best-practices/accessibility/seo as a fast signal, but no
threshold gates the ship — the app is still an empty shell as of Phase 0.
Real PWA/perf budgets land in plan step 3.6. Don't add a hard gate here
without checking with Brent first — that's a design call, not a script fix.
