# ss-ship

Deploy Steampunk Shuffle in one command. Built as plan step 0.5 so every
future deploy — most of them on Haiku — is `/ss-ship` instead of a chain of
manual `npm run …` / `git commit` / `git push` steps.

## Files

- `SKILL.md` — the harness: model (Haiku), procedure, guardrails.
- `../../tools/ship.sh` — the deterministic part: typecheck, test, build,
  Lighthouse (informational), commit, push, wait for the Pages deploy,
  print the live URL. The skill only handles what a script can't: deciding
  the commit message and reporting the result.

## Run

"Ship it" / "run ss-ship" / "/ss-ship" — invokes this skill.

## Exit check (plan step 0.5)

`/ss-ship` runs typecheck, tests, build, commit, push, and confirms the
Pages deploy — verified by watching the `deploy.yml` Actions run and
printing the resulting `https://brenthumphries.github.io/steampunk-shuffle/`
URL.
